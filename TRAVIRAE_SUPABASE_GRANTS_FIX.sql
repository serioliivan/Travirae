-- TRAVIRAE_SUPABASE_GRANTS_FIX — Supabase Data API explicit GRANTS 2026
-- ============================================================================
-- Scopo:
-- - rende espliciti i permessi richiesti dalla Data API Supabase/PostgREST/GraphQL
-- - evita errori 42501 dovuti a GRANT mancanti dopo il cambio Supabase 2026
-- - NON disattiva RLS e NON modifica le policy: le policy continuano a filtrare le righe
-- - corregge anche il caso admin CSV/Stay22: upsert su public.bookings richiede UPDATE
--
-- Quando eseguirlo:
-- - su un progetto esistente: una volta, dopo gli script 01→19 già installati
-- - su un progetto nuovo: dopo tutti gli script SQL del progetto
-- - dopo aver creato nuove tabelle/funzioni in futuro: aggiungi GRANT espliciti simili
--
-- È idempotente: puoi rieseguirlo senza creare duplicati.
-- ============================================================================

-- 0) Accesso allo schema public per i ruoli usati dalla Data API.
grant usage on schema public to anon, authenticated, service_role;

-- 1) Tabelle e viste: permessi minimi per anon/authenticated.
--    Nota: RLS resta attiva e decide quali righe sono visibili/modificabili.
do $$
declare
  r record;
begin
  for r in
    select * from (values
      -- Affiliate base
      ('affiliates',                         'authenticated', 'select, insert, update'),
      ('affiliate_clicks',                   'anon',          'insert'),
      ('affiliate_clicks',                   'authenticated', 'select, insert'),
      ('bookings',                           'anon',          'insert'),
      ('bookings',                           'authenticated', 'select, insert, update'),
      ('monthly_affiliate_payouts',          'authenticated', 'select'),
      ('monthly_affiliate_stats',            'authenticated', 'select'),

      -- Payout
      ('payout_profiles',                    'authenticated', 'select, insert, update'),
      ('payout_requests',                    'authenticated', 'select, insert, update'),
      ('affiliate_balances',                 'authenticated', 'select'),
      ('admin_affiliate_overview',           'authenticated', 'select'),

      -- Site traffic
      ('site_pageviews',                     'anon',          'insert'),
      ('site_pageviews',                     'authenticated', 'select, insert'),
      ('admin_site_traffic_summary',         'authenticated', 'select'),

      -- Newsletter: lettura solo admin via RLS; scrittura tramite Edge Functions service_role
      ('newsletter_subscribers',             'authenticated', 'select'),

      -- Influencer / creator
      ('influencer_profiles',                'authenticated', 'select, insert, update'),
      ('influencer_profile_revisions',       'authenticated', 'select, insert, update'),
      ('influencer_posts',                   'authenticated', 'select, insert, update'),
      ('influencer_post_revisions',          'authenticated', 'select, insert, update'),
      ('influencer_post_widgets',            'authenticated', 'select, insert, update, delete'),
      ('influencer_post_events',             'anon',          'insert'),
      ('influencer_post_events',             'authenticated', 'select, insert'),
      ('influencer_post_kpis',               'authenticated', 'select'),
      ('influencer_creator_private_stats',   'authenticated', 'select')
    ) as t(object_name, role_name, privileges)
  loop
    if to_regclass('public.' || r.object_name) is not null then
      execute format('grant %s on table public.%I to %I', r.privileges, r.object_name, r.role_name);
    else
      raise notice 'Skip grant: public.% non esiste in questo progetto', r.object_name;
    end if;
  end loop;
end $$;

-- 2) service_role: permessi espliciti sugli oggetti usati dalle Edge Functions.
--    La service role key deve restare solo nei Secrets Supabase, mai nel frontend.
do $$
declare
  obj text;
begin
  foreach obj in array array[
    'affiliates',
    'affiliate_clicks',
    'bookings',
    'monthly_affiliate_payouts',
    'payout_profiles',
    'payout_requests',
    'site_pageviews',
    'newsletter_subscribers',
    'influencer_profiles',
    'influencer_profile_revisions',
    'influencer_posts',
    'influencer_post_revisions',
    'influencer_post_widgets',
    'influencer_post_events'
  ] loop
    if to_regclass('public.' || obj) is not null then
      execute format('grant select, insert, update, delete on table public.%I to service_role', obj);
    else
      raise notice 'Skip service_role table grant: public.% non esiste', obj;
    end if;
  end loop;

  foreach obj in array array[
    'monthly_affiliate_stats',
    'affiliate_balances',
    'admin_affiliate_overview',
    'admin_site_traffic_summary',
    'influencer_post_kpis',
    'influencer_creator_private_stats'
  ] loop
    if to_regclass('public.' || obj) is not null then
      execute format('grant select on table public.%I to service_role', obj);
    else
      raise notice 'Skip service_role view grant: public.% non esiste', obj;
    end if;
  end loop;
end $$;

-- 3) Sequenze eventualmente presenti.
--    Le tabelle Travirae usano UUID, ma questo evita problemi se in futuro aggiungi serial/bigserial.
grant usage, select on all sequences in schema public to service_role;

-- 4) Funzioni/RPC: EXECUTE esplicito per i ruoli che devono poterle usare.
do $$
declare
  r record;
begin
  for r in
    select * from (values
      ('is_admin()',                                            'authenticated, service_role'),
      ('get_my_affiliate_slug()',                              'authenticated, service_role'),
      ('travirae_share_percent(bigint)',                       'authenticated, service_role'),
      ('travirae_share_percent(integer)',                      'authenticated, service_role'),
      ('refresh_monthly_affiliate_payouts()',                  'authenticated, service_role'),
      ('resolve_influencer_tracking_code(text)',               'anon, authenticated, service_role'),
      ('review_influencer_profile(uuid,text,text)',            'authenticated, service_role'),
      ('review_influencer_post(uuid,text,text)',               'authenticated, service_role'),
      ('get_influencer_public_profile(text)',                  'anon, authenticated, service_role'),
      ('get_influencer_public_posts(integer,integer,text)',    'anon, authenticated, service_role'),
      ('get_influencer_public_post(text)',                     'anon, authenticated, service_role'),
      ('get_affiliate_widget_outbound_totals(text)',           'authenticated, service_role')
    ) as t(signature, roles_sql)
  loop
    if to_regprocedure('public.' || r.signature) is not null then
      execute format('grant execute on function public.%s to %s', r.signature, r.roles_sql);
    else
      raise notice 'Skip function grant: public.% non esiste', r.signature;
    end if;
  end loop;
end $$;

-- 5) Default privileges solo per service_role.
--    Questo mantiene robuste le Edge Functions se in futuro crei tabelle/funzioni con SQL Editor.
--    NON riabilitiamo l'esposizione automatica ad anon/authenticated per evitare accessi accidentali:
--    per nuove tabelle visibili dal browser aggiungi sempre GRANT + RLS + policy esplicite.
do $$
begin
  begin
    execute 'alter default privileges for role postgres in schema public grant select, insert, update, delete on tables to service_role';
    execute 'alter default privileges for role postgres in schema public grant usage, select on sequences to service_role';
    execute 'alter default privileges for role postgres in schema public grant execute on functions to service_role';
  exception when others then
    raise notice 'Default privileges service_role non applicati: %', sqlerrm;
  end;
end $$;

-- 6) Ricarica cache PostgREST/Supabase Data API.
select pg_notify('pgrst', 'reload schema');

-- 7) Template da copiare quando aggiungi NUOVE tabelle in futuro.
--    Esempio:
--
--    create table public.nuova_tabella (...);
--    alter table public.nuova_tabella enable row level security;
--
--    grant select on table public.nuova_tabella to anon; -- solo se deve essere pubblica
--    grant select, insert, update on table public.nuova_tabella to authenticated;
--    grant select, insert, update, delete on table public.nuova_tabella to service_role;
--
--    create policy "nome policy" on public.nuova_tabella
--      for select to authenticated
--      using (...);
