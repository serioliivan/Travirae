-- SCRIPT 17 — Audit rapido attribuzione vendite affiliate
--
-- Esegui questo script nel SQL Editor di Supabase per controllare a colpo d'occhio
-- a quale affiliate_slug sono state attribuite le ultime vendite confermate.

select
  b.booked_at,
  b.confirmed_at,
  b.partner,
  b.partner_reference,
  b.status,
  b.affiliate_slug,
  b.amount,
  b.commission_partner,
  b.currency,
  coalesce(b.metadata->>'tracking_match_type', '') as tracking_match_type,
  coalesce(b.metadata->>'raw_partner_sub_id', b.metadata->>'raw_partner_campaign', '') as raw_partner_tracking,
  coalesce(b.metadata->>'creator_slug', '') as creator_slug,
  coalesce(b.metadata->>'post_slug', '') as post_slug,
  coalesce(b.metadata->>'post_id', '') as post_id
from public.bookings b
where b.status = 'confirmed'
order by coalesce(b.confirmed_at, b.booked_at) desc
limit 200;

-- Riassunto rapido per affiliate_slug
select
  affiliate_slug,
  count(*) as confirmed_sales,
  coalesce(sum(commission_partner), 0) as total_partner_commission
from public.bookings
where status = 'confirmed'
group by affiliate_slug
order by confirmed_sales desc, affiliate_slug;
