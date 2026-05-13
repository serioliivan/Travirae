-- SCRIPT 21 — Supabase Advisor Hardening
-- ============================================================================
-- Scopo:
-- - corregge gli avvisi/errore mostrati in Supabase Security Advisor e Performance Advisor
-- - mantiene il sito funzionante: non cancella dati, non disattiva RLS, non cambia chiavi/API
-- - rende le view "security_invoker" così rispettano le policy RLS del chiamante
-- - fissa il search_path delle funzioni Travirae
-- - limita i permessi EXECUTE delle funzioni/RPC
-- - sostituisce policy troppo permissive "WITH CHECK (true)" con controlli reali
-- - consolida policy duplicate/legacy che il Performance Advisor segnala come multiple permissive policies
-- - aggiunge indici mancanti su alcune foreign key
--
-- Quando eseguirlo:
-- - su progetto esistente: dopo SCRIPT_20_supabase_explicit_grants_2026.sql
-- - su progetto nuovo: dopo tutti gli script Travirae 01 -> 20
--
-- È idempotente: puoi rieseguirlo.
-- ============================================================================

-- 0) Schema usage per Data API / PostgREST.
grant usage on schema public to anon, authenticated, service_role;

-- 1) View security: evita l'errore "Security Definer View".
--    Le view diventano security_invoker e quindi rispettano le RLS dei ruoli anon/authenticated.
do $$
declare
  v_name text;
begin
  foreach v_name in array array[
    'monthly_affiliate_stats',
    'affiliate_balances',
    'admin_affiliate_overview',
    'admin_site_traffic_summary',
    'influencer_post_kpis',
    'influencer_creator_private_stats'
  ] loop
    if to_regclass('public.' || v_name) is not null then
      begin
        execute format('alter view public.%I set (security_invoker = true)', v_name);
      exception when others then
        raise notice 'Impossibile impostare security_invoker su public.%: %', v_name, sqlerrm;
      end;
    end if;
  end loop;
end $$;

-- 2) Search path fisso per le funzioni Travirae.
--    Questo risolve "Function Search Path Mutable" senza cambiare la logica delle funzioni.
do $$
declare
  f record;
begin
  for f in
    select
      p.oid,
      n.nspname,
      p.proname,
      pg_get_function_identity_arguments(p.oid) as args
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname in (
        'is_admin',
        'get_my_affiliate_slug',
        'current_affiliate_slug',
        'travirae_share_percent',
        'refresh_monthly_affiliate_payouts',
        'set_updated_at',
        'validate_payout_request',
        'resolve_influencer_tracking_code',
        'review_influencer_profile',
        'review_influencer_post',
        'get_influencer_public_profile',
        'get_influencer_public_posts',
        'get_influencer_public_post',
        'get_affiliate_widget_outbound_totals'
      )
  loop
    begin
      execute format('alter function %I.%I(%s) set search_path = public, auth', f.nspname, f.proname, f.args);
    exception when others then
      raise notice 'Skip search_path per %.%(%): %', f.nspname, f.proname, f.args, sqlerrm;
    end;
  end loop;
end $$;

-- 3) Alcune RPC non hanno bisogno di SECURITY DEFINER: con le policy sotto funzionano come SECURITY INVOKER.
--    Questo evita gli avvisi "Public/Signed-in users can execute SECURITY DEFINER function" senza rompere il frontend.
do $$
declare
  sig text;
begin
  foreach sig in array array[
    'refresh_monthly_affiliate_payouts()',
    'resolve_influencer_tracking_code(text)',
    'review_influencer_profile(uuid,text,text)',
    'review_influencer_post(uuid,text,text)',
    'get_influencer_public_profile(text)',
    'get_influencer_public_posts(integer,integer,text)',
    'get_influencer_public_post(text)',
    'get_affiliate_widget_outbound_totals(text)'
  ] loop
    if to_regprocedure('public.' || sig) is not null then
      begin
        execute format('alter function public.%s security invoker', sig);
      exception when others then
        raise notice 'Skip security invoker per public.%: %', sig, sqlerrm;
      end;
    end if;
  end loop;
end $$;


-- 3B) RPC pubbliche creator/vlog: ricreate come SECURITY INVOKER con colonne esplicite.
--     Questo evita il warning SECURITY DEFINER pubblico e non richiede SELECT su colonne interne.
create or replace function public.get_influencer_public_profile(p_creator_slug text)
returns table (
  profile_id uuid,
  affiliate_slug text,
  public_slug text,
  display_name text,
  bio text,
  avatar_path text,
  social_links jsonb,
  published_at timestamptz
)
language sql
security invoker
set search_path = public, auth
as $$
  select
    p.id as profile_id,
    p.affiliate_slug,
    p.public_slug,
    p.display_name,
    p.bio,
    p.avatar_path,
    coalesce(p.social_links, '{}'::jsonb) as social_links,
    p.published_at
  from public.influencer_profiles p
  where p.status = 'published'
    and (
      p.public_slug = trim(coalesce(p_creator_slug, ''))
      or p.affiliate_slug = trim(coalesce(p_creator_slug, ''))
    )
  limit 1;
$$;

create or replace function public.get_influencer_public_posts(
  p_limit integer default 5,
  p_offset integer default 0,
  p_creator_slug text default null
)
returns table (
  post_id uuid,
  post_slug text,
  title text,
  excerpt text,
  cover_path text,
  first_published_at timestamptz,
  updated_at timestamptz,
  creator_slug text,
  creator_name text,
  creator_avatar_path text,
  total_count bigint
)
language sql
security invoker
set search_path = public, auth
as $$
  with params as (
    select
      greatest(1, least(coalesce(p_limit, 5), 50)) as lim,
      greatest(0, coalesce(p_offset, 0)) as off,
      nullif(trim(coalesce(p_creator_slug, '')), '') as filter_creator_slug
  ),
  base as (
    select
      p.id as post_id,
      p.post_slug,
      p.title,
      p.excerpt,
      p.cover_path,
      p.first_published_at,
      p.updated_at,
      pr.public_slug as creator_slug,
      pr.display_name as creator_name,
      pr.avatar_path as creator_avatar_path,
      count(*) over() as total_count,
      row_number() over(order by coalesce(p.first_published_at, p.updated_at, p.created_at) desc, p.created_at desc) as rn
    from public.influencer_posts p
    join public.influencer_profiles pr on pr.id = p.profile_id
    cross join params
    where p.status = 'published'
      and p.deleted_at is null
      and pr.status = 'published'
      and (
        params.filter_creator_slug is null
        or pr.public_slug = params.filter_creator_slug
        or pr.affiliate_slug = params.filter_creator_slug
      )
  )
  select
    base.post_id,
    base.post_slug,
    base.title,
    base.excerpt,
    base.cover_path,
    base.first_published_at,
    base.updated_at,
    base.creator_slug,
    base.creator_name,
    base.creator_avatar_path,
    base.total_count
  from base
  cross join params
  where base.rn > params.off
    and base.rn <= params.off + params.lim
  order by base.rn;
$$;

create or replace function public.get_influencer_public_post(p_post_slug text)
returns table (
  post_id uuid,
  post_slug text,
  title text,
  excerpt text,
  cover_path text,
  content_html text,
  content_json jsonb,
  widgets_json jsonb,
  first_published_at timestamptz,
  updated_at timestamptz,
  creator_slug text,
  creator_affiliate_slug text,
  creator_name text,
  creator_bio text,
  creator_avatar_path text,
  creator_social_links jsonb
)
language sql
security invoker
set search_path = public, auth
as $$
  select
    p.id as post_id,
    p.post_slug,
    p.title,
    p.excerpt,
    p.cover_path,
    coalesce(r.content_html, '') as content_html,
    coalesce(r.content_json, '[]'::jsonb) as content_json,
    coalesce(r.widgets_json, '[]'::jsonb) as widgets_json,
    p.first_published_at,
    p.updated_at,
    pr.public_slug as creator_slug,
    pr.affiliate_slug as creator_affiliate_slug,
    pr.display_name as creator_name,
    pr.bio as creator_bio,
    pr.avatar_path as creator_avatar_path,
    coalesce(pr.social_links, '{}'::jsonb) as creator_social_links
  from public.influencer_posts p
  join public.influencer_profiles pr on pr.id = p.profile_id
  left join lateral (
    select
      rr.id,
      rr.post_id,
      rr.content_html,
      rr.content_json,
      rr.widgets_json,
      rr.status,
      rr.reviewed_at,
      rr.created_at
    from public.influencer_post_revisions rr
    where rr.id = p.current_live_revision_id
       or (p.current_live_revision_id is null and rr.post_id = p.id and rr.status = 'published')
    order by rr.reviewed_at desc nulls last, rr.created_at desc
    limit 1
  ) r on true
  where p.status = 'published'
    and p.deleted_at is null
    and pr.status = 'published'
    and p.post_slug = trim(coalesce(p_post_slug, ''))
  limit 1;
$$;

-- 4) EXECUTE esplicito e non più aperto tramite PUBLIC.
do $$
declare
  sig text;
begin
  -- Revoca il default PUBLIC/anon/authenticated/service_role per le funzioni Travirae note.
  foreach sig in array array[
    'is_admin()',
    'get_my_affiliate_slug()',
    'current_affiliate_slug()',
    'travirae_share_percent(bigint)',
    'travirae_share_percent(integer)',
    'refresh_monthly_affiliate_payouts()',
    'set_updated_at()',
    'validate_payout_request()',
    'resolve_influencer_tracking_code(text)',
    'review_influencer_profile(uuid,text,text)',
    'review_influencer_post(uuid,text,text)',
    'get_influencer_public_profile(text)',
    'get_influencer_public_posts(integer,integer,text)',
    'get_influencer_public_post(text)',
    'get_affiliate_widget_outbound_totals(text)'
  ] loop
    if to_regprocedure('public.' || sig) is not null then
      begin
        execute format('revoke execute on function public.%s from public, anon, authenticated, service_role', sig);
      exception when others then
        raise notice 'Skip revoke execute per public.%: %', sig, sqlerrm;
      end;
    end if;
  end loop;

  -- Funzioni usate da RLS/RPC per utenti loggati.
  foreach sig in array array[
    'is_admin()',
    'get_my_affiliate_slug()',
    'current_affiliate_slug()',
    'travirae_share_percent(bigint)',
    'travirae_share_percent(integer)',
    'refresh_monthly_affiliate_payouts()',
    'resolve_influencer_tracking_code(text)',
    'review_influencer_profile(uuid,text,text)',
    'review_influencer_post(uuid,text,text)',
    'get_affiliate_widget_outbound_totals(text)'
  ] loop
    if to_regprocedure('public.' || sig) is not null then
      begin
        execute format('grant execute on function public.%s to authenticated, service_role', sig);
      exception when others then
        raise notice 'Skip grant authenticated/service_role per public.%: %', sig, sqlerrm;
      end;
    end if;
  end loop;

  -- RPC pubbliche dei creator/vlog: restano chiamabili dal sito pubblico, ma non sono più SECURITY DEFINER.
  foreach sig in array array[
    'get_influencer_public_profile(text)',
    'get_influencer_public_posts(integer,integer,text)',
    'get_influencer_public_post(text)'
  ] loop
    if to_regprocedure('public.' || sig) is not null then
      begin
        execute format('grant execute on function public.%s to anon, authenticated, service_role', sig);
      exception when others then
        raise notice 'Skip grant anon/auth/service_role per public.%: %', sig, sqlerrm;
      end;
    end if;
  end loop;

  -- Funzioni trigger/helper: niente chiamate dal browser.
  foreach sig in array array[
    'set_updated_at()',
    'validate_payout_request()'
  ] loop
    if to_regprocedure('public.' || sig) is not null then
      begin
        execute format('grant execute on function public.%s to service_role', sig);
      exception when others then
        raise notice 'Skip grant service_role per public.%: %', sig, sqlerrm;
      end;
    end if;
  end loop;
end $$;

-- 5) GRANT tabella/view coerenti con le policy consolidate.
--    Le policy RLS sotto continuano a filtrare righe e azioni.
do $$
begin
  if to_regclass('public.affiliates') is not null then
    grant select, insert, update on table public.affiliates to authenticated;
    grant select, insert, update, delete on table public.affiliates to service_role;
  end if;

  if to_regclass('public.affiliate_clicks') is not null then
    grant insert on table public.affiliate_clicks to anon, authenticated;
    grant select on table public.affiliate_clicks to authenticated;
    grant select, insert, update, delete on table public.affiliate_clicks to service_role;
  end if;

  if to_regclass('public.bookings') is not null then
    grant insert on table public.bookings to anon;
    grant select, insert, update on table public.bookings to authenticated;
    grant select, insert, update, delete on table public.bookings to service_role;
  end if;

  if to_regclass('public.monthly_affiliate_payouts') is not null then
    grant select, insert, update on table public.monthly_affiliate_payouts to authenticated;
    grant select, insert, update, delete on table public.monthly_affiliate_payouts to service_role;
  end if;

  if to_regclass('public.payout_profiles') is not null then
    grant select, insert, update on table public.payout_profiles to authenticated;
    grant select, insert, update, delete on table public.payout_profiles to service_role;
  end if;

  if to_regclass('public.payout_requests') is not null then
    grant select, insert, update on table public.payout_requests to authenticated;
    grant select, insert, update, delete on table public.payout_requests to service_role;
  end if;

  if to_regclass('public.site_pageviews') is not null then
    grant insert on table public.site_pageviews to anon, authenticated;
    grant select on table public.site_pageviews to authenticated;
    grant select, insert, update, delete on table public.site_pageviews to service_role;
  end if;

  if to_regclass('public.newsletter_subscribers') is not null then
    grant select on table public.newsletter_subscribers to authenticated;
    grant select, insert, update, delete on table public.newsletter_subscribers to service_role;
  end if;

  if to_regclass('public.influencer_profiles') is not null then
    revoke select on table public.influencer_profiles from anon;
    grant select (id, affiliate_slug, public_slug, display_name, bio, avatar_path, social_links, status, published_at)
      on table public.influencer_profiles to anon;
    grant select, insert, update on table public.influencer_profiles to authenticated;
    grant select, insert, update, delete on table public.influencer_profiles to service_role;
  end if;

  if to_regclass('public.influencer_profile_revisions') is not null then
    grant select, insert, update on table public.influencer_profile_revisions to authenticated;
    grant select, insert, update, delete on table public.influencer_profile_revisions to service_role;
  end if;

  if to_regclass('public.influencer_posts') is not null then
    revoke select on table public.influencer_posts from anon;
    grant select (id, profile_id, affiliate_slug, post_slug, title, excerpt, cover_path, status, current_live_revision_id, first_published_at, updated_at, created_at, deleted_at)
      on table public.influencer_posts to anon;
    grant select, insert, update on table public.influencer_posts to authenticated;
    grant select, insert, update, delete on table public.influencer_posts to service_role;
  end if;

  if to_regclass('public.influencer_post_revisions') is not null then
    revoke select on table public.influencer_post_revisions from anon;
    grant select (id, post_id, title, excerpt, cover_path, content_html, content_json, widgets_json, status, reviewed_at, created_at)
      on table public.influencer_post_revisions to anon;
    grant select, insert, update on table public.influencer_post_revisions to authenticated;
    grant select, insert, update, delete on table public.influencer_post_revisions to service_role;
  end if;

  if to_regclass('public.influencer_post_widgets') is not null then
    grant select, insert, update, delete on table public.influencer_post_widgets to authenticated;
    grant select, insert, update, delete on table public.influencer_post_widgets to service_role;
  end if;

  if to_regclass('public.influencer_post_events') is not null then
    grant insert on table public.influencer_post_events to anon, authenticated;
    grant select on table public.influencer_post_events to authenticated;
    grant select, insert, update, delete on table public.influencer_post_events to service_role;
  end if;
end $$;

-- View grants separati, perché to_regclass vale anche per le view.
do $$
begin
  if to_regclass('public.monthly_affiliate_stats') is not null then
    grant select on table public.monthly_affiliate_stats to authenticated, service_role;
  end if;
  if to_regclass('public.affiliate_balances') is not null then
    grant select on table public.affiliate_balances to authenticated, service_role;
  end if;
  if to_regclass('public.admin_affiliate_overview') is not null then
    grant select on table public.admin_affiliate_overview to authenticated, service_role;
  end if;
  if to_regclass('public.admin_site_traffic_summary') is not null then
    grant select on table public.admin_site_traffic_summary to authenticated, service_role;
  end if;
  if to_regclass('public.influencer_post_kpis') is not null then
    grant select on table public.influencer_post_kpis to authenticated, service_role;
  end if;
  if to_regclass('public.influencer_creator_private_stats') is not null then
    grant select on table public.influencer_creator_private_stats to authenticated, service_role;
  end if;
end $$;

-- 6) Helper: ricrea policy pulite per le tabelle Travirae.
--    Usiamo nomi nuovi e drop di tutte le policy della tabella per togliere duplicati legacy.
do $$
declare
  pol record;
begin
  -- affiliates
  if to_regclass('public.affiliates') is not null then
    alter table public.affiliates enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='affiliates' loop
      execute format('drop policy if exists %I on public.affiliates', pol.policyname);
    end loop;
    execute $p$create policy affiliates_select_own_or_admin on public.affiliates
      for select to authenticated
      using ((select public.is_admin()) or user_id = (select auth.uid()))$p$;
    execute $p$create policy affiliates_insert_own_or_admin on public.affiliates
      for insert to authenticated
      with check ((select public.is_admin()) or user_id = (select auth.uid()))$p$;
    execute $p$create policy affiliates_update_own_or_admin on public.affiliates
      for update to authenticated
      using ((select public.is_admin()) or user_id = (select auth.uid()))
      with check ((select public.is_admin()) or user_id = (select auth.uid()))$p$;
  end if;

  -- affiliate_clicks
  if to_regclass('public.affiliate_clicks') is not null then
    alter table public.affiliate_clicks enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='affiliate_clicks' loop
      execute format('drop policy if exists %I on public.affiliate_clicks', pol.policyname);
    end loop;
    execute $p$create policy affiliate_clicks_insert_tracking on public.affiliate_clicks
      for insert to anon, authenticated
      with check (
        affiliate_slug is not null
        and btrim(affiliate_slug) <> ''
        and char_length(affiliate_slug) <= 160
        and page is not null
        and btrim(page) <> ''
        and char_length(page) <= 2048
      )$p$;
    execute $p$create policy affiliate_clicks_select_own_or_admin on public.affiliate_clicks
      for select to authenticated
      using (
        (select public.is_admin())
        or affiliate_slug = (select public.get_my_affiliate_slug())
      )$p$;
  end if;

  -- bookings
  if to_regclass('public.bookings') is not null then
    alter table public.bookings enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='bookings' loop
      execute format('drop policy if exists %I on public.bookings', pol.policyname);
    end loop;
    execute $p$create policy bookings_insert_tracking_anon on public.bookings
      for insert to anon
      with check (
        affiliate_slug is not null
        and btrim(affiliate_slug) <> ''
        and char_length(affiliate_slug) <= 160
        and partner in ('stay22','aviasales')
        and status in ('click','pending')
      )$p$;
    execute $p$create policy bookings_insert_authenticated on public.bookings
      for insert to authenticated
      with check (
        (select public.is_admin())
        or (
          affiliate_slug is not null
          and btrim(affiliate_slug) <> ''
          and char_length(affiliate_slug) <= 160
          and partner in ('stay22','aviasales')
          and status in ('click','pending')
        )
      )$p$;
    execute $p$create policy bookings_select_own_or_admin on public.bookings
      for select to authenticated
      using (
        (select public.is_admin())
        or affiliate_slug = (select public.get_my_affiliate_slug())
      )$p$;
    execute $p$create policy bookings_update_admin_only on public.bookings
      for update to authenticated
      using ((select public.is_admin()))
      with check ((select public.is_admin()))$p$;
  end if;

  -- monthly_affiliate_payouts
  if to_regclass('public.monthly_affiliate_payouts') is not null then
    alter table public.monthly_affiliate_payouts enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='monthly_affiliate_payouts' loop
      execute format('drop policy if exists %I on public.monthly_affiliate_payouts', pol.policyname);
    end loop;
    execute $p$create policy monthly_payouts_select_own_or_admin on public.monthly_affiliate_payouts
      for select to authenticated
      using (
        (select public.is_admin())
        or affiliate_slug = (select public.get_my_affiliate_slug())
      )$p$;
    execute $p$create policy monthly_payouts_insert_admin_only on public.monthly_affiliate_payouts
      for insert to authenticated
      with check ((select public.is_admin()))$p$;
    execute $p$create policy monthly_payouts_update_admin_only on public.monthly_affiliate_payouts
      for update to authenticated
      using ((select public.is_admin()))
      with check ((select public.is_admin()))$p$;
    execute $p$create policy monthly_payouts_delete_admin_only on public.monthly_affiliate_payouts
      for delete to authenticated
      using ((select public.is_admin()))$p$;
  end if;

  -- payout_profiles
  if to_regclass('public.payout_profiles') is not null then
    alter table public.payout_profiles enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='payout_profiles' loop
      execute format('drop policy if exists %I on public.payout_profiles', pol.policyname);
    end loop;
    execute $p$create policy payout_profiles_select_own_or_admin on public.payout_profiles
      for select to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy payout_profiles_insert_own_or_admin on public.payout_profiles
      for insert to authenticated
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy payout_profiles_update_own_or_admin on public.payout_profiles
      for update to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
  end if;

  -- payout_requests
  if to_regclass('public.payout_requests') is not null then
    alter table public.payout_requests enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='payout_requests' loop
      execute format('drop policy if exists %I on public.payout_requests', pol.policyname);
    end loop;
    execute $p$create policy payout_requests_select_own_or_admin on public.payout_requests
      for select to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy payout_requests_insert_own on public.payout_requests
      for insert to authenticated
      with check (affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy payout_requests_update_admin_only on public.payout_requests
      for update to authenticated
      using ((select public.is_admin()))
      with check ((select public.is_admin()))$p$;
  end if;

  -- site_pageviews
  if to_regclass('public.site_pageviews') is not null then
    alter table public.site_pageviews enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='site_pageviews' loop
      execute format('drop policy if exists %I on public.site_pageviews', pol.policyname);
    end loop;
    execute $p$create policy site_pageviews_insert_tracking on public.site_pageviews
      for insert to anon, authenticated
      with check (
        session_id is not null
        and btrim(session_id) <> ''
        and char_length(session_id) <= 160
        and visitor_id is not null
        and btrim(visitor_id) <> ''
        and char_length(visitor_id) <= 160
        and page is not null
        and btrim(page) <> ''
        and char_length(page) <= 2048
      )$p$;
    execute $p$create policy site_pageviews_select_admin_only on public.site_pageviews
      for select to authenticated
      using ((select public.is_admin()))$p$;
  end if;

  -- newsletter_subscribers
  if to_regclass('public.newsletter_subscribers') is not null then
    alter table public.newsletter_subscribers enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='newsletter_subscribers' loop
      execute format('drop policy if exists %I on public.newsletter_subscribers', pol.policyname);
    end loop;
    execute $p$create policy newsletter_subscribers_select_admin_only on public.newsletter_subscribers
      for select to authenticated
      using ((select public.is_admin()))$p$;
  end if;

  -- influencer_profiles
  if to_regclass('public.influencer_profiles') is not null then
    alter table public.influencer_profiles enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_profiles' loop
      execute format('drop policy if exists %I on public.influencer_profiles', pol.policyname);
    end loop;
    execute $p$create policy influencer_profiles_select_public on public.influencer_profiles
      for select to anon
      using (status = 'published')$p$;
    execute $p$create policy influencer_profiles_select_authenticated on public.influencer_profiles
      for select to authenticated
      using (
        status = 'published'
        or (select public.is_admin())
        or affiliate_slug = (select public.get_my_affiliate_slug())
      )$p$;
    execute $p$create policy influencer_profiles_insert_owner_admin on public.influencer_profiles
      for insert to authenticated
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy influencer_profiles_update_owner_admin on public.influencer_profiles
      for update to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
  end if;

  -- influencer_profile_revisions
  if to_regclass('public.influencer_profile_revisions') is not null then
    alter table public.influencer_profile_revisions enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_profile_revisions' loop
      execute format('drop policy if exists %I on public.influencer_profile_revisions', pol.policyname);
    end loop;
    execute $p$create policy influencer_profile_revisions_select_owner_admin on public.influencer_profile_revisions
      for select to authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_profiles p
          where p.id = public.influencer_profile_revisions.profile_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_profile_revisions_insert_owner_admin on public.influencer_profile_revisions
      for insert to authenticated
      with check (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_profiles p
          where p.id = public.influencer_profile_revisions.profile_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_profile_revisions_update_owner_admin on public.influencer_profile_revisions
      for update to authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_profiles p
          where p.id = public.influencer_profile_revisions.profile_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )
      with check (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_profiles p
          where p.id = public.influencer_profile_revisions.profile_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_profile_revisions_delete_owner_admin on public.influencer_profile_revisions
      for delete to authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_profiles p
          where p.id = public.influencer_profile_revisions.profile_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
  end if;

  -- influencer_posts
  if to_regclass('public.influencer_posts') is not null then
    alter table public.influencer_posts enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_posts' loop
      execute format('drop policy if exists %I on public.influencer_posts', pol.policyname);
    end loop;
    execute $p$create policy influencer_posts_select_public on public.influencer_posts
      for select to anon
      using (status = 'published' and deleted_at is null)$p$;
    execute $p$create policy influencer_posts_select_authenticated on public.influencer_posts
      for select to authenticated
      using (
        (status = 'published' and deleted_at is null)
        or (select public.is_admin())
        or affiliate_slug = (select public.get_my_affiliate_slug())
      )$p$;
    execute $p$create policy influencer_posts_insert_owner_admin on public.influencer_posts
      for insert to authenticated
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy influencer_posts_update_owner_admin on public.influencer_posts
      for update to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
  end if;

  -- influencer_post_revisions
  if to_regclass('public.influencer_post_revisions') is not null then
    alter table public.influencer_post_revisions enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_post_revisions' loop
      execute format('drop policy if exists %I on public.influencer_post_revisions', pol.policyname);
    end loop;
    execute $p$create policy influencer_post_revisions_select_public on public.influencer_post_revisions
      for select to anon
      using (
        status = 'published'
        and exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.status = 'published'
            and p.deleted_at is null
            and (p.current_live_revision_id = public.influencer_post_revisions.id or p.current_live_revision_id is null)
        )
      )$p$;
    execute $p$create policy influencer_post_revisions_select_authenticated on public.influencer_post_revisions
      for select to authenticated
      using (
        (
          status = 'published'
          and exists (
            select 1
            from public.influencer_posts p
            where p.id = public.influencer_post_revisions.post_id
              and p.status = 'published'
              and p.deleted_at is null
              and (p.current_live_revision_id = public.influencer_post_revisions.id or p.current_live_revision_id is null)
          )
        )
        or (select public.is_admin())
        or exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_post_revisions_insert_owner_admin on public.influencer_post_revisions
      for insert to authenticated
      with check (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_post_revisions_update_owner_admin on public.influencer_post_revisions
      for update to authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )
      with check (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
    execute $p$create policy influencer_post_revisions_delete_owner_admin on public.influencer_post_revisions
      for delete to authenticated
      using (
        (select public.is_admin())
        or exists (
          select 1
          from public.influencer_posts p
          where p.id = public.influencer_post_revisions.post_id
            and p.affiliate_slug = (select public.get_my_affiliate_slug())
        )
      )$p$;
  end if;

  -- influencer_post_widgets
  if to_regclass('public.influencer_post_widgets') is not null then
    alter table public.influencer_post_widgets enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_post_widgets' loop
      execute format('drop policy if exists %I on public.influencer_post_widgets', pol.policyname);
    end loop;
    execute $p$create policy influencer_post_widgets_select_owner_admin on public.influencer_post_widgets
      for select to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy influencer_post_widgets_insert_owner_admin on public.influencer_post_widgets
      for insert to authenticated
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy influencer_post_widgets_update_owner_admin on public.influencer_post_widgets
      for update to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))
      with check ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
    execute $p$create policy influencer_post_widgets_delete_owner_admin on public.influencer_post_widgets
      for delete to authenticated
      using ((select public.is_admin()) or affiliate_slug = (select public.get_my_affiliate_slug()))$p$;
  end if;

  -- influencer_post_events
  if to_regclass('public.influencer_post_events') is not null then
    alter table public.influencer_post_events enable row level security;
    for pol in select policyname from pg_policies where schemaname='public' and tablename='influencer_post_events' loop
      execute format('drop policy if exists %I on public.influencer_post_events', pol.policyname);
    end loop;
    execute $p$create policy influencer_post_events_insert_tracking on public.influencer_post_events
      for insert to anon, authenticated
      with check (
        event_type in (
          'card_impression',
          'post_open',
          'widget_click',
          'booking_pending',
          'booking_confirmed',
          'booking_canceled',
          'profile_view'
        )
        and (session_id is null or char_length(session_id) <= 160)
        and (visitor_id is null or char_length(visitor_id) <= 160)
      )$p$;
    execute $p$create policy influencer_post_events_select_own_or_admin on public.influencer_post_events
      for select to authenticated
      using (
        (select public.is_admin())
        or coalesce(nullif(affiliate_slug, ''), nullif(metadata->>'ref_affiliate_slug', '')) = (select public.get_my_affiliate_slug())
      )$p$;
  end if;
end $$;

-- 7) Indici per foreign key segnalate dal Performance Advisor.
--    Non rimuoviamo gli "unused index": possono servire appena arrivano dati/traffico reali.
do $$
begin
  if to_regclass('public.influencer_profile_revisions') is not null then
    create index if not exists idx_influencer_profile_revisions_profile_id on public.influencer_profile_revisions(profile_id);
    create index if not exists idx_influencer_profile_revisions_reviewed_by on public.influencer_profile_revisions(reviewed_by);
  end if;

  if to_regclass('public.influencer_profiles') is not null then
    create index if not exists idx_influencer_profiles_current_published_revision_id on public.influencer_profiles(current_published_revision_id);
    create index if not exists idx_influencer_profiles_current_pending_revision_id on public.influencer_profiles(current_pending_revision_id);
  end if;

  if to_regclass('public.influencer_post_revisions') is not null then
    create index if not exists idx_influencer_post_revisions_post_id on public.influencer_post_revisions(post_id);
    create index if not exists idx_influencer_post_revisions_reviewed_by on public.influencer_post_revisions(reviewed_by);
  end if;

  if to_regclass('public.influencer_posts') is not null then
    create index if not exists idx_influencer_posts_profile_id on public.influencer_posts(profile_id);
    create index if not exists idx_influencer_posts_affiliate_slug on public.influencer_posts(affiliate_slug);
    create index if not exists idx_influencer_posts_current_live_revision_id on public.influencer_posts(current_live_revision_id);
    create index if not exists idx_influencer_posts_current_pending_revision_id on public.influencer_posts(current_pending_revision_id);
  end if;

  if to_regclass('public.influencer_post_widgets') is not null then
    create index if not exists idx_influencer_post_widgets_post_id on public.influencer_post_widgets(post_id);
    create index if not exists idx_influencer_post_widgets_revision_id on public.influencer_post_widgets(revision_id);
    create index if not exists idx_influencer_post_widgets_affiliate_slug on public.influencer_post_widgets(affiliate_slug);
  end if;

  if to_regclass('public.influencer_post_events') is not null then
    create index if not exists idx_influencer_post_events_profile_id on public.influencer_post_events(profile_id);
  end if;

  if to_regclass('public.payout_requests') is not null then
    create index if not exists idx_payout_requests_processed_by on public.payout_requests(processed_by);
  end if;
end $$;

-- 8) Ricarica schema cache PostgREST.
select pg_notify('pgrst', 'reload schema');

-- Note:
-- - "Leaked Password Protection Disabled" è un'impostazione Auth, non un file del sito.
-- - "Extension in Public: pg_net" può restare così se il cron net.http_post funziona; spostarla a mano può rompere job già programmati.
-- - "Unused Index" è informativo: non conviene cancellare indici prima di avere traffico/dati reali.
