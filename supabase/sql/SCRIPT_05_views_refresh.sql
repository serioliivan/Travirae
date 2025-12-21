-- SCRIPT 05 — VIEW STATS + FUNZIONE REFRESH (copia/incolla e RUN)
-- Questo è lo script che, se eseguito correttamente, risolve gli errori che vedevi:
-- - travirae_share_percent(bigint) mancante
-- - refresh_monthly_affiliate_payouts() mancante

-- View: aggrega per mese e per affiliate_slug SOLO vendite confermate (status='confirmed')
create or replace view public.monthly_affiliate_stats as
with base as (
  select
    b.affiliate_slug,
    date_trunc('month', b.booked_at)::date as month,
    count(*) filter (where b.status = 'confirmed')::bigint as sales_count,
    coalesce(sum(b.commission_partner) filter (where b.status = 'confirmed'), 0)::numeric as net_commissions
  from public.bookings b
  where b.affiliate_slug is not null and b.affiliate_slug <> ''
  group by b.affiliate_slug, date_trunc('month', b.booked_at)::date
)
select
  affiliate_slug,
  month,
  sales_count,
  net_commissions,
  public.travirae_share_percent(sales_count) as share_percent,
  (net_commissions * public.travirae_share_percent(sales_count))::numeric as affiliate_earnings
from base;

-- Funzione: scrive/aggiorna la tabella monthly_affiliate_payouts partendo dalla view
create or replace function public.refresh_monthly_affiliate_payouts()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Se è chiamata dal browser (utente loggato), permetti SOLO all'admin.
  -- Se è chiamata dal SQL editor o da service role (Edge Function), auth.uid() è NULL -> ok.
  if auth.uid() is not null and not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  insert into public.monthly_affiliate_payouts (
    affiliate_slug, month, sales_count, net_commissions, share_percent, affiliate_earnings, updated_at
  )
  select
    affiliate_slug, month, sales_count, net_commissions, share_percent, affiliate_earnings, now()
  from public.monthly_affiliate_stats
  on conflict (affiliate_slug, month) do update set
    sales_count = excluded.sales_count,
    net_commissions = excluded.net_commissions,
    share_percent = excluded.share_percent,
    affiliate_earnings = excluded.affiliate_earnings,
    updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.refresh_monthly_affiliate_payouts() to authenticated;
