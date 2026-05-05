-- SCRIPT 15 — Fix widget outbound totals (site-wide + creator posts)
--
-- Run this script in Supabase SQL Editor.
-- Re-run it even if you already executed SCRIPT_14.
--
-- What it fixes:
-- 1) keeps the RPC used by the affiliate dashboard available and aligned
-- 2) rebuilds admin_affiliate_overview with robust site_widget / influencer_post attribution
-- 3) makes the "Click widget outbound (totale sito + post)" card rely on one consistent source
--
-- IMPORTANT HOTFIX:
-- Older database versions still have public.admin_affiliate_overview with legacy
-- columns like booking_clicks_total / booking_clicks_aviasales / booking_clicks_stay22.
-- PostgreSQL does not allow CREATE OR REPLACE VIEW to rename existing columns,
-- so we explicitly DROP + CREATE the view below.
-- This is safe for this project because the frontend reads the view directly and
-- there are no project SQL objects depending on it.

create or replace function public.get_affiliate_widget_outbound_totals(p_affiliate_slug text default null)
returns table (
  affiliate_slug text,
  widget_clicks_total bigint,
  widget_clicks_site_total bigint,
  widget_clicks_creator_total bigint,
  widget_clicks_current_month bigint
)
language sql
security definer
set search_path = public
as $$
  with widget_events as (
    select
      coalesce(nullif(e.affiliate_slug, ''), nullif(e.metadata->>'ref_affiliate_slug', '')) as resolved_affiliate_slug,
      case
        when coalesce(e.metadata->>'source', '') <> '' then coalesce(e.metadata->>'source', '')
        when e.post_id is not null then 'influencer_post'
        else 'site_widget'
      end as source,
      e.created_at
    from public.influencer_post_events e
    where e.event_type = 'widget_click'
  ),
  allowed_events as (
    select *
    from widget_events
    where resolved_affiliate_slug is not null
      and (
        public.is_admin()
        or resolved_affiliate_slug = public.get_my_affiliate_slug()
      )
      and (
        p_affiliate_slug is null
        or resolved_affiliate_slug = p_affiliate_slug
      )
  )
  select
    resolved_affiliate_slug as affiliate_slug,
    count(*)::bigint as widget_clicks_total,
    count(*) filter (where source = 'site_widget')::bigint as widget_clicks_site_total,
    count(*) filter (where source = 'influencer_post')::bigint as widget_clicks_creator_total,
    count(*) filter (where created_at >= date_trunc('month', now()))::bigint as widget_clicks_current_month
  from allowed_events
  group by resolved_affiliate_slug
  order by resolved_affiliate_slug;
$$;

grant execute on function public.get_affiliate_widget_outbound_totals(text) to authenticated;

-- Safe rebuild: do not use CREATE OR REPLACE VIEW here because older versions of
-- the view use different column names and PostgreSQL blocks column renames.
drop view if exists public.admin_affiliate_overview;

create view public.admin_affiliate_overview as
with clicks as (
  select affiliate_slug,
         count(*) as total_clicks,
         max(created_at) as last_click_at
  from public.affiliate_clicks
  group by affiliate_slug
),
widget_clicks as (
  select
    coalesce(nullif(e.affiliate_slug, ''), nullif(e.metadata->>'ref_affiliate_slug', '')) as affiliate_slug,
    count(*)::bigint as widget_clicks_total,
    count(*) filter (
      where (
        case
          when coalesce(e.metadata->>'source', '') <> '' then coalesce(e.metadata->>'source', '')
          when e.post_id is not null then 'influencer_post'
          else 'site_widget'
        end
      ) = 'site_widget'
    )::bigint as widget_clicks_site_total,
    count(*) filter (
      where (
        case
          when coalesce(e.metadata->>'source', '') <> '' then coalesce(e.metadata->>'source', '')
          when e.post_id is not null then 'influencer_post'
          else 'site_widget'
        end
      ) = 'influencer_post'
    )::bigint as widget_clicks_creator_total,
    max(e.created_at) as last_widget_click_at
  from public.influencer_post_events e
  where e.event_type = 'widget_click'
    and coalesce(nullif(e.affiliate_slug, ''), nullif(e.metadata->>'ref_affiliate_slug', '')) is not null
  group by 1
),
confirmed_sales as (
  select affiliate_slug,
         max(booked_at) filter (where status = 'confirmed') as last_confirmed_sale_at
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
         coalesce(sum(amount_usd) filter (where status in ('pending','approved')), 0) as pending_payout_amount_usd,
         max(requested_at) filter (where status in ('pending','approved')) as last_pending_at
  from public.payout_requests
  group by affiliate_slug
),
activity as (
  select
    a.slug as affiliate_slug,
    greatest(
      coalesce(c.last_click_at, 'epoch'::timestamptz),
      coalesce(w.last_widget_click_at, 'epoch'::timestamptz),
      coalesce(s.last_confirmed_sale_at, 'epoch'::timestamptz),
      coalesce(p.last_pending_at, 'epoch'::timestamptz)
    ) as last_activity_at
  from public.affiliates a
  left join clicks c on c.affiliate_slug = a.slug
  left join widget_clicks w on w.affiliate_slug = a.slug
  left join confirmed_sales s on s.affiliate_slug = a.slug
  left join pending_payouts p on p.affiliate_slug = a.slug
)
select
  a.slug as affiliate_slug,
  a.email,
  coalesce(c.total_clicks, 0) as total_clicks,
  coalesce(w.widget_clicks_total, 0) as widget_clicks_total,
  coalesce(w.widget_clicks_site_total, 0) as widget_clicks_site_total,
  coalesce(w.widget_clicks_creator_total, 0) as widget_clicks_creator_total,
  coalesce(cm.sales_count_month, 0) as sales_count_month,
  coalesce(cm.net_commissions_month, 0) as net_commissions_month,
  coalesce(cm.share_percent_month, 0.40) as share_percent_month,
  coalesce(cm.affiliate_earnings_month, 0) as affiliate_earnings_month,
  coalesce(ab.available_balance_usd, 0) as available_balance_usd,
  coalesce(p.pending_payout_count, 0) as pending_payout_count,
  coalesce(p.pending_payout_amount_usd, 0) as pending_payout_amount_usd,
  act.last_activity_at
from public.affiliates a
left join clicks c on c.affiliate_slug = a.slug
left join widget_clicks w on w.affiliate_slug = a.slug
left join current_month cm on cm.affiliate_slug = a.slug
left join public.affiliate_balances ab on ab.affiliate_slug = a.slug
left join pending_payouts p on p.affiliate_slug = a.slug
left join activity act on act.affiliate_slug = a.slug
order by act.last_activity_at desc nulls last, a.slug;

grant select on public.admin_affiliate_overview to authenticated;
