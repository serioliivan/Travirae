-- SCRIPT 19 — Audit attribuzione vendite post creator / affiliate
-- Questo script NON modifica nulla.
-- Serve solo a controllare che le vendite importate siano attribuite allo slug affiliato corretto.

-- 1) Ultime vendite confermate/pending importate dai partner
select
  b.booked_at,
  b.confirmed_at,
  b.partner,
  b.partner_reference,
  b.status,
  b.affiliate_slug,
  b.commission_partner,
  b.currency,
  b.metadata->>'source' as source,
  b.metadata->>'creator_slug' as creator_slug,
  b.metadata->>'post_slug' as post_slug,
  b.metadata->>'widget_tracking_code' as widget_tracking_code,
  coalesce(b.metadata->>'tracking_match_type', b.metadata->>'match_type') as tracking_match_type,
  b.metadata->>'raw_partner_campaign' as raw_partner_campaign,
  b.metadata->>'raw_partner_sub_id' as raw_partner_sub_id
from public.bookings b
where b.status in ('confirmed','pending')
order by coalesce(b.booked_at, b.created_at) desc
limit 100;

-- 2) Riepilogo mensile per affiliato basato direttamente sulle vendite confirmed
select
  date_trunc('month', b.booked_at)::date as month,
  b.affiliate_slug,
  count(*) filter (where b.status = 'confirmed')::bigint as confirmed_sales,
  coalesce(sum(b.commission_partner) filter (where b.status = 'confirmed'), 0)::numeric as net_commissions
from public.bookings b
group by 1, 2
order by 1 desc, 2;

-- 3) Solo vendite attribuite a post creator
select
  b.booked_at,
  b.partner,
  b.partner_reference,
  b.status,
  b.affiliate_slug,
  b.commission_partner,
  b.metadata->>'creator_slug' as creator_slug,
  b.metadata->>'post_slug' as post_slug,
  b.metadata->>'widget_tracking_code' as widget_tracking_code,
  coalesce(b.metadata->>'tracking_match_type', b.metadata->>'match_type') as tracking_match_type
from public.bookings b
where coalesce(b.metadata->>'source','') = 'influencer_post'
order by coalesce(b.booked_at, b.created_at) desc
limit 100;
