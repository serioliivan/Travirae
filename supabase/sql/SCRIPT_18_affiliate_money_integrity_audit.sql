-- SCRIPT 18 — Audit integrità soldi affiliati / payout / attribuzione
--
-- Non modifica nulla. Serve per verificare che:
-- 1) monthly_affiliate_stats corrisponda ai booking confermati reali
-- 2) monthly_affiliate_payouts (snapshot) sia allineata alla view live
-- 3) affiliate_balances corrisponda a maturato - pagato - riservato
--
-- Esegui tutto nel SQL Editor di Supabase.

-- 1) Confronto booking confermati vs monthly_affiliate_stats
with bookings_month as (
  select
    affiliate_slug,
    date_trunc('month', booked_at)::date as month,
    count(*) filter (where status = 'confirmed')::bigint as confirmed_sales_from_bookings,
    coalesce(sum(commission_partner) filter (where status = 'confirmed'), 0)::numeric as net_commissions_from_bookings
  from public.bookings
  where coalesce(affiliate_slug, '') <> ''
  group by affiliate_slug, date_trunc('month', booked_at)::date
),
stats_month as (
  select
    affiliate_slug,
    month,
    sales_count::bigint as confirmed_sales_from_stats,
    net_commissions::numeric as net_commissions_from_stats,
    affiliate_earnings::numeric as affiliate_earnings_from_stats
  from public.monthly_affiliate_stats
),
joined as (
  select
    coalesce(b.affiliate_slug, s.affiliate_slug) as affiliate_slug,
    coalesce(b.month, s.month) as month,
    coalesce(b.confirmed_sales_from_bookings, 0) as confirmed_sales_from_bookings,
    coalesce(s.confirmed_sales_from_stats, 0) as confirmed_sales_from_stats,
    coalesce(b.net_commissions_from_bookings, 0) as net_commissions_from_bookings,
    coalesce(s.net_commissions_from_stats, 0) as net_commissions_from_stats,
    coalesce(s.affiliate_earnings_from_stats, 0) as affiliate_earnings_from_stats
  from bookings_month b
  full join stats_month s
    on s.affiliate_slug = b.affiliate_slug
   and s.month = b.month
)
select
  affiliate_slug,
  month,
  confirmed_sales_from_bookings,
  confirmed_sales_from_stats,
  (confirmed_sales_from_stats - confirmed_sales_from_bookings) as sales_diff,
  net_commissions_from_bookings,
  net_commissions_from_stats,
  (net_commissions_from_stats - net_commissions_from_bookings) as net_commissions_diff,
  affiliate_earnings_from_stats
from joined
where
  coalesce(confirmed_sales_from_stats, 0) <> coalesce(confirmed_sales_from_bookings, 0)
  or coalesce(net_commissions_from_stats, 0) <> coalesce(net_commissions_from_bookings, 0)
order by month desc, affiliate_slug;

-- 2) Confronto monthly_affiliate_stats (live) vs monthly_affiliate_payouts (snapshot)
select
  coalesce(s.affiliate_slug, p.affiliate_slug) as affiliate_slug,
  coalesce(s.month, p.month) as month,
  coalesce(s.sales_count, 0) as sales_live,
  coalesce(p.sales_count, 0) as sales_snapshot,
  coalesce(s.net_commissions, 0) as commissions_live,
  coalesce(p.net_commissions, 0) as commissions_snapshot,
  coalesce(s.share_percent, 0) as share_live,
  coalesce(p.share_percent, 0) as share_snapshot,
  coalesce(s.affiliate_earnings, 0) as earnings_live,
  coalesce(p.affiliate_earnings, 0) as earnings_snapshot,
  (coalesce(s.sales_count, 0) - coalesce(p.sales_count, 0)) as sales_diff,
  (coalesce(s.net_commissions, 0) - coalesce(p.net_commissions, 0)) as commissions_diff,
  (coalesce(s.affiliate_earnings, 0) - coalesce(p.affiliate_earnings, 0)) as earnings_diff
from public.monthly_affiliate_stats s
full join public.monthly_affiliate_payouts p
  on p.affiliate_slug = s.affiliate_slug
 and p.month = s.month
where
  coalesce(s.sales_count, 0) <> coalesce(p.sales_count, 0)
  or coalesce(s.net_commissions, 0) <> coalesce(p.net_commissions, 0)
  or coalesce(s.share_percent, 0) <> coalesce(p.share_percent, 0)
  or coalesce(s.affiliate_earnings, 0) <> coalesce(p.affiliate_earnings, 0)
order by month desc, affiliate_slug;

-- 3) Verifica saldo disponibile: maturato - pagato - riservato
with earned as (
  select affiliate_slug, coalesce(sum(affiliate_earnings), 0)::numeric as earned_total_usd
  from public.monthly_affiliate_stats
  group by affiliate_slug
),
paid as (
  select affiliate_slug, coalesce(sum(amount_usd) filter (where status = 'paid'), 0)::numeric as paid_total_usd
  from public.payout_requests
  group by affiliate_slug
),
reserved as (
  select affiliate_slug, coalesce(sum(amount_usd) filter (where status in ('pending','approved')), 0)::numeric as reserved_total_usd
  from public.payout_requests
  group by affiliate_slug
),
expected as (
  select
    a.slug as affiliate_slug,
    coalesce(e.earned_total_usd, 0) as earned_total_usd,
    coalesce(p.paid_total_usd, 0) as paid_total_usd,
    coalesce(r.reserved_total_usd, 0) as reserved_total_usd,
    (coalesce(e.earned_total_usd, 0) - coalesce(p.paid_total_usd, 0) - coalesce(r.reserved_total_usd, 0))::numeric as expected_available_balance_usd
  from public.affiliates a
  left join earned e on e.affiliate_slug = a.slug
  left join paid p on p.affiliate_slug = a.slug
  left join reserved r on r.affiliate_slug = a.slug
)
select
  coalesce(ab.affiliate_slug, ex.affiliate_slug) as affiliate_slug,
  coalesce(ex.earned_total_usd, 0) as earned_total_usd,
  coalesce(ex.paid_total_usd, 0) as paid_total_usd,
  coalesce(ex.reserved_total_usd, 0) as reserved_total_usd,
  coalesce(ex.expected_available_balance_usd, 0) as expected_available_balance_usd,
  coalesce(ab.available_balance_usd, 0) as balance_view_available_balance_usd,
  (coalesce(ab.available_balance_usd, 0) - coalesce(ex.expected_available_balance_usd, 0)) as balance_diff
from expected ex
full join public.affiliate_balances ab
  on ab.affiliate_slug = ex.affiliate_slug
where coalesce(ab.available_balance_usd, 0) <> coalesce(ex.expected_available_balance_usd, 0)
order by abs(coalesce(ab.available_balance_usd, 0) - coalesce(ex.expected_available_balance_usd, 0)) desc, affiliate_slug;
