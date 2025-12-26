-- SEED_TEST_DATA.sql
-- Inserisce dati finti per testare tier revenue share + payout request
-- Funziona anche se la colonna "metadata" NON esiste nella tabella bookings.
--
-- COME USARLO:
-- 1) Apri Supabase Dashboard -> SQL Editor -> New query
-- 2) Incolla tutto questo script, cambia lo slug affiliato, poi RUN
--
-- Questo seed crea:
-- - 25 vendite CONFERMATE nel mese corrente (tier 45%)
-- - commission_partner = 8 USD ciascuna -> 25 * 8 = 200 USD net_commissions Travirae
-- - guadagno affiliato atteso (45%) = 90 USD
--
-- CAMBIA QUI:
-- slug affiliato (come lo vedi nei tuoi report / nel link ref=)
DO $$
DECLARE
  v_slug text := 'ivanserioli-2880';          -- <--- cambia qui
  v_prefix text := 'TEST-SEED-';
  has_metadata boolean;
  has_partner_reference boolean;
BEGIN
  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bookings' AND column_name='metadata'
  ) INTO has_metadata;

  SELECT EXISTS(
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='bookings' AND column_name='partner_reference'
  ) INTO has_partner_reference;

  -- Pulisci eventuali seed precedenti del mese corrente
  IF has_partner_reference THEN
    EXECUTE format($sql$
      DELETE FROM public.bookings
      WHERE affiliate_slug=%L
        AND status='confirmed'
        AND partner_reference LIKE %L
        AND booked_at >= date_trunc('month', now())
        AND booked_at <  (date_trunc('month', now()) + interval '1 month');
    $sql$, v_slug, v_prefix || v_slug || '-%');
  ELSE
    EXECUTE format($sql$
      DELETE FROM public.bookings
      WHERE affiliate_slug=%L
        AND status='confirmed'
        AND partner='aviasales'
        AND currency='USD'
        AND commission_partner=8
        AND booked_at >= date_trunc('month', now())
        AND booked_at <  (date_trunc('month', now()) + interval '1 month');
    $sql$, v_slug);
  END IF;

  -- Inserisci 25 vendite confermate (net_commissions=200)
  IF has_metadata AND has_partner_reference THEN
    EXECUTE format($sql$
      INSERT INTO public.bookings(
        affiliate_slug, partner, status, booked_at, confirmed_at, currency,
        partner_reference, commission_partner, metadata
      )
      SELECT
        %L,
        'aviasales',
        'confirmed',
        now() - (gs * interval '1 hour'),
        now() - (gs * interval '1 hour'),
        'USD',
        %L || %L || '-' || gs::text,
        8::numeric,
        jsonb_build_object('test', true, 'seed', 'manual', 'note', 'TEST net=200 tier=45')
      FROM generate_series(1,25) AS gs;
    $sql$, v_slug, v_prefix, v_slug);
  ELSIF has_partner_reference THEN
    EXECUTE format($sql$
      INSERT INTO public.bookings(
        affiliate_slug, partner, status, booked_at, confirmed_at, currency,
        partner_reference, commission_partner
      )
      SELECT
        %L,
        'aviasales',
        'confirmed',
        now() - (gs * interval '1 hour'),
        now() - (gs * interval '1 hour'),
        'USD',
        %L || %L || '-' || gs::text,
        8::numeric
      FROM generate_series(1,25) AS gs;
    $sql$, v_slug, v_prefix, v_slug);
  ELSE
    EXECUTE format($sql$
      INSERT INTO public.bookings(
        affiliate_slug, partner, status, booked_at, confirmed_at, currency,
        commission_partner
      )
      SELECT
        %L,
        'aviasales',
        'confirmed',
        now() - (gs * interval '1 hour'),
        now() - (gs * interval '1 hour'),
        'USD',
        8::numeric
      FROM generate_series(1,25) AS gs;
    $sql$, v_slug);
  END IF;

  -- Aggiorna la tabella mensile (dashboard)
  PERFORM public.refresh_monthly_affiliate_payouts();
END $$;

-- Verifica veloce (opzionale):
-- SELECT * FROM public.monthly_affiliate_payouts WHERE affiliate_slug='ivanserioli-2880' ORDER BY month DESC LIMIT 1;
