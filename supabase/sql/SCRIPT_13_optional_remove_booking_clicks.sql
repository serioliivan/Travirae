-- SCRIPT 13 — OPTIONAL cleanup after booking-click deprecation
--
-- This script is OPTIONAL. The updated frontend already works without it.
-- Run it in Supabase SQL Editor only if you also want to clean the admin view logic
-- so that it no longer depends on booking_click rows for the operational overview.
--
-- IMPORTANT: this script does NOT delete any historical data by default.
-- If you want to remove historical booking-click rows, review the commented DELETE
-- at the bottom and decide manually.

create or replace view public.admin_affiliate_overview as
with clicks as (
  select affiliate_slug,
         count(*) as total_clicks,
         max(created_at) as last_click_at
  from public.affiliate_clicks
  group by affiliate_slug
),
confirmed_sales as (
  select affiliate_slug,
         max(booked_at) filter (where status='confirmed') as last_confirmed_sale_at
  from public.bookings
  group by affiliate_slug
),
current_month as (
  select affiliate_slug,
         sales_count as sales_count_month,
         net_commissions as net_commissions_month,
         share_percent as share_percent_month,
         affiliate_earnings as affiliate_earnings_month
  from public.monthly_affiliate_stats
  where month = date_trunc('month', now())::date
),
pending_payouts as (
  select affiliate_slug,
         count(*) filter (where status in ('pending','approved')) as pending_payout_count,
         coalesce(sum(amount_usd) filter (where status in ('pending','approved')),0) as pending_payout_amount_usd,
         max(requested_at) filter (where status in ('pending','approved')) as last_pending_at
  from public.payout_requests
  group by affiliate_slug
),
activity as (
  select a.slug as affiliate_slug,
         greatest(
           coalesce(c.last_click_at, 'epoch'::timestamptz),
           coalesce(s.last_confirmed_sale_at, 'epoch'::timestamptz),
           coalesce(p.last_pending_at, 'epoch'::timestamptz)
         ) as last_activity_at
  from public.affiliates a
  left join clicks c on c.affiliate_slug = a.slug
  left join confirmed_sales s on s.affiliate_slug = a.slug
  left join pending_payouts p on p.affiliate_slug = a.slug
)
select
  a.slug as affiliate_slug,
  a.email,
  coalesce(c.total_clicks,0) as total_clicks,
  coalesce(cm.sales_count_month,0) as sales_count_month,
  coalesce(cm.net_commissions_month,0) as net_commissions_month,
  coalesce(cm.share_percent_month,0.40) as share_percent_month,
  coalesce(cm.affiliate_earnings_month,0) as affiliate_earnings_month,
  coalesce(ab.available_balance_usd,0) as available_balance_usd,
  coalesce(p.pending_payout_count,0) as pending_payout_count,
  coalesce(p.pending_payout_amount_usd,0) as pending_payout_amount_usd,
  act.last_activity_at
from public.affiliates a
left join clicks c on c.affiliate_slug = a.slug
left join current_month cm on cm.affiliate_slug = a.slug
left join public.affiliate_balances ab on ab.affiliate_slug = a.slug
left join pending_payouts p on p.affiliate_slug = a.slug
left join activity act on act.affiliate_slug = a.slug
order by act.last_activity_at desc nulls last, a.slug;

-- OPTIONAL manual cleanup, only if you want to delete historical booking-click rows:
-- delete from public.bookings where status = 'click';
