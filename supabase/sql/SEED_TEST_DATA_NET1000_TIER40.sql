-- SEED TEST DATA (TEST)
-- Scenario: affiliate net_commissions = 1000 USD nel mese corrente.
-- Con 10 vendite valide (tier 40%) -> payout affiliato = 400 USD, margine Travirae = 600 USD.
--
-- Nota: usa partner='test' e partner_reference univoci.

DO $$
DECLARE
  v_slug text := 'ivanserioli-2880';
  v_month_start timestamptz := date_trunc('month', now());
  v_month_end timestamptz := date_trunc('month', now()) + interval '1 month';
BEGIN
  -- Pulisci eventuali seed precedenti nello stesso mese
  DELETE FROM public.bookings
  WHERE affiliate_slug = v_slug
    AND partner = 'test'
    AND status = 'confirmed'
    AND booked_at >= v_month_start
    AND booked_at < v_month_end;

  -- 10 vendite valide da 100 USD ciascuna = 1000 USD net_commissions
  INSERT INTO public.bookings(
    affiliate_slug,
    partner,
    status,
    booked_at,
    confirmed_at,
    currency,
    amount,
    commission_partner,
    partner_reference,
    metadata
  )
  SELECT
    v_slug,
    'test',
    'confirmed',
    v_month_start + (gs * interval '1 day'),
    now(),
    'USD',
    0,
    100::numeric,
    'TEST_NET1000_' || gs,
    jsonb_build_object(
      'test', true,
      'seed', 'manual',
      'note', 'TEST net=1000 tier=40% (payout 400, margin 600)'
    )
  FROM generate_series(1, 10) AS gs;
END $$;

-- Aggiorna la tabella/vista mensile che alimenta le dashboard
SELECT public.refresh_monthly_affiliate_payouts();
