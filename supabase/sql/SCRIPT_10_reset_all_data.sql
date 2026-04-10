-- Travirae - Reset dati (solo dati raccolti / operativi)
-- Data: 2026-01-02
--
-- Questo script AZZERA i dati raccolti dal sito (click, booking, pageview, payout request,
-- newsletter subscribers, ecc.) SENZA toccare:
-- - auth.users (Supabase Auth)
-- - public.affiliates (profili affiliati)
--
-- NOTE:
-- 1) Se vuoi anche azzerare gli affiliati (public.affiliates) dovrai farlo separatamente e,
--    se necessario, eliminare anche gli utenti da Authentication.
-- 2) Esegui questo file dal pannello Supabase: SQL Editor.

BEGIN;

TRUNCATE TABLE
  public.affiliate_clicks,
  public.bookings,
  public.monthly_affiliate_payouts,
  public.site_pageviews,
  public.payout_requests,
  public.payout_profiles,
  public.newsletter_subscribers
RESTART IDENTITY;

COMMIT;
