-- SCRIPT 11 — INFLUENCERS VLOGS
-- Eseguire DOPO gli script 01 -> 10 già presenti nel progetto.
-- Aggiunge tabelle, viste, policy e funzioni RPC per il modulo Influencers Vlogs.

-- ============================================================
-- 1) TABELLE
-- ============================================================

create table if not exists public.influencer_profiles (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null unique references public.affiliates(slug) on delete cascade,
  display_name text not null default '',
  public_slug text not null unique,
  bio text,
  avatar_path text,
  social_links jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','changes_requested','rejected','archived','suspended')),
  current_published_revision_id uuid,
  current_pending_revision_id uuid,
  published_at timestamptz,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.influencer_profile_revisions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.influencer_profiles(id) on delete cascade,
  revision_no integer not null,
  display_name text not null default '',
  public_slug text not null,
  bio text,
  avatar_path text,
  social_links jsonb not null default '{}'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','changes_requested','rejected','archived')),
  review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (profile_id, revision_no)
);

create table if not exists public.influencer_posts (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.influencer_profiles(id) on delete cascade,
  affiliate_slug text not null references public.affiliates(slug) on delete cascade,
  post_slug text not null unique,
  post_short_id text not null unique,
  title text not null,
  excerpt text,
  cover_path text,
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','changes_requested','rejected','archived','deleted')),
  current_live_revision_id uuid,
  current_pending_revision_id uuid,
  first_published_at timestamptz,
  review_notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.influencer_post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.influencer_posts(id) on delete cascade,
  revision_no integer not null,
  title text not null,
  excerpt text,
  cover_path text,
  content_json jsonb not null default '[]'::jsonb,
  content_html text,
  widgets_json jsonb not null default '[]'::jsonb,
  status text not null default 'draft'
    check (status in ('draft','pending_review','published','changes_requested','rejected','archived')),
  review_notes text,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (post_id, revision_no)
);

create table if not exists public.influencer_post_widgets (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.influencer_posts(id) on delete cascade,
  revision_id uuid not null references public.influencer_post_revisions(id) on delete cascade,
  affiliate_slug text not null references public.affiliates(slug) on delete cascade,
  post_slug text not null,
  widget_short_id text not null,
  tracking_code text not null,
  partner text not null check (partner in ('stay22','aviasales')),
  title text,
  config_json jsonb not null default '{}'::jsonb,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (revision_id, widget_short_id)
);

create table if not exists public.influencer_post_events (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references public.influencer_posts(id) on delete cascade,
  profile_id uuid references public.influencer_profiles(id) on delete cascade,
  affiliate_slug text references public.affiliates(slug) on delete set null,
  event_type text not null check (event_type in ('card_impression','post_open','widget_click','booking_pending','booking_confirmed','booking_canceled','profile_view')),
  partner text,
  widget_id text,
  session_id text,
  visitor_id text,
  revenue_usd numeric,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- FK opzionali ai current_*_revision_id (idempotenti)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'influencer_profiles_current_published_revision_fk'
  ) then
    alter table public.influencer_profiles
      add constraint influencer_profiles_current_published_revision_fk
      foreign key (current_published_revision_id)
      references public.influencer_profile_revisions(id)
      deferrable initially deferred;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'influencer_profiles_current_pending_revision_fk'
  ) then
    alter table public.influencer_profiles
      add constraint influencer_profiles_current_pending_revision_fk
      foreign key (current_pending_revision_id)
      references public.influencer_profile_revisions(id)
      deferrable initially deferred;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'influencer_posts_current_live_revision_fk'
  ) then
    alter table public.influencer_posts
      add constraint influencer_posts_current_live_revision_fk
      foreign key (current_live_revision_id)
      references public.influencer_post_revisions(id)
      deferrable initially deferred;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'influencer_posts_current_pending_revision_fk'
  ) then
    alter table public.influencer_posts
      add constraint influencer_posts_current_pending_revision_fk
      foreign key (current_pending_revision_id)
      references public.influencer_post_revisions(id)
      deferrable initially deferred;
  end if;
end $$;

-- tracking_code deve poter riapparire su revisioni diverse dello stesso post: il live viene risolto via current_live_revision_id.
do $$
begin
  if exists (
    select 1 from pg_constraint
    where conname = 'influencer_post_widgets_tracking_code_key'
  ) then
    alter table public.influencer_post_widgets
      drop constraint influencer_post_widgets_tracking_code_key;
  end if;
end $$;

-- ============================================================
-- 2) INDICI / TRIGGER updated_at
-- ============================================================

create index if not exists idx_influencer_profiles_status on public.influencer_profiles(status);
create index if not exists idx_influencer_profiles_public_slug on public.influencer_profiles(public_slug);
create index if not exists idx_influencer_posts_status on public.influencer_posts(status);
create index if not exists idx_influencer_posts_profile_updated on public.influencer_posts(profile_id, updated_at desc);
create index if not exists idx_influencer_posts_affiliate_updated on public.influencer_posts(affiliate_slug, updated_at desc);
create index if not exists idx_influencer_post_revisions_post on public.influencer_post_revisions(post_id, revision_no desc);
create index if not exists idx_influencer_post_widgets_tracking on public.influencer_post_widgets(tracking_code);
create index if not exists idx_influencer_post_events_post_created on public.influencer_post_events(post_id, created_at desc);
create index if not exists idx_influencer_post_events_affiliate_created on public.influencer_post_events(affiliate_slug, created_at desc);

-- Usa la funzione già presente negli script precedenti.
drop trigger if exists trg_influencer_profiles_updated_at on public.influencer_profiles;
create trigger trg_influencer_profiles_updated_at
before update on public.influencer_profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_influencer_profile_revisions_updated_at on public.influencer_profile_revisions;
create trigger trg_influencer_profile_revisions_updated_at
before update on public.influencer_profile_revisions
for each row execute function public.set_updated_at();

drop trigger if exists trg_influencer_posts_updated_at on public.influencer_posts;
create trigger trg_influencer_posts_updated_at
before update on public.influencer_posts
for each row execute function public.set_updated_at();

drop trigger if exists trg_influencer_post_revisions_updated_at on public.influencer_post_revisions;
create trigger trg_influencer_post_revisions_updated_at
before update on public.influencer_post_revisions
for each row execute function public.set_updated_at();

drop trigger if exists trg_influencer_post_widgets_updated_at on public.influencer_post_widgets;
create trigger trg_influencer_post_widgets_updated_at
before update on public.influencer_post_widgets
for each row execute function public.set_updated_at();

-- ============================================================
-- 3) GRANTS / RLS
-- ============================================================

alter table public.influencer_profiles enable row level security;
alter table public.influencer_profile_revisions enable row level security;
alter table public.influencer_posts enable row level security;
alter table public.influencer_post_revisions enable row level security;
alter table public.influencer_post_widgets enable row level security;
alter table public.influencer_post_events enable row level security;

grant select, insert, update on public.influencer_profiles to authenticated;
grant select, insert, update on public.influencer_profile_revisions to authenticated;
grant select, insert, update on public.influencer_posts to authenticated;
grant select, insert, update on public.influencer_post_revisions to authenticated;
grant select, insert, update, delete on public.influencer_post_widgets to authenticated;
grant insert on public.influencer_post_events to anon, authenticated;
grant select on public.influencer_post_events to authenticated;

-- Profili
drop policy if exists influencer_profiles_select_owner_admin on public.influencer_profiles;
create policy influencer_profiles_select_owner_admin
on public.influencer_profiles
for select to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

drop policy if exists influencer_profiles_insert_owner_admin on public.influencer_profiles;
create policy influencer_profiles_insert_owner_admin
on public.influencer_profiles
for insert to authenticated
with check (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

drop policy if exists influencer_profiles_update_owner_admin on public.influencer_profiles;
create policy influencer_profiles_update_owner_admin
on public.influencer_profiles
for update to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug())
with check (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

-- Revisioni profilo
drop policy if exists influencer_profile_revisions_select_owner_admin on public.influencer_profile_revisions;
create policy influencer_profile_revisions_select_owner_admin
on public.influencer_profile_revisions
for select to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.influencer_profiles p
    where p.id = profile_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
);

drop policy if exists influencer_profile_revisions_write_owner_admin on public.influencer_profile_revisions;
create policy influencer_profile_revisions_write_owner_admin
on public.influencer_profile_revisions
for all to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.influencer_profiles p
    where p.id = profile_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.influencer_profiles p
    where p.id = profile_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
);

-- Post
drop policy if exists influencer_posts_select_owner_admin on public.influencer_posts;
create policy influencer_posts_select_owner_admin
on public.influencer_posts
for select to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

drop policy if exists influencer_posts_insert_owner_admin on public.influencer_posts;
create policy influencer_posts_insert_owner_admin
on public.influencer_posts
for insert to authenticated
with check (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

drop policy if exists influencer_posts_update_owner_admin on public.influencer_posts;
create policy influencer_posts_update_owner_admin
on public.influencer_posts
for update to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug())
with check (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

-- Revisioni post
drop policy if exists influencer_post_revisions_select_owner_admin on public.influencer_post_revisions;
create policy influencer_post_revisions_select_owner_admin
on public.influencer_post_revisions
for select to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.influencer_posts p
    where p.id = post_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
);

drop policy if exists influencer_post_revisions_write_owner_admin on public.influencer_post_revisions;
create policy influencer_post_revisions_write_owner_admin
on public.influencer_post_revisions
for all to authenticated
using (
  public.is_admin() or exists (
    select 1
    from public.influencer_posts p
    where p.id = post_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
)
with check (
  public.is_admin() or exists (
    select 1
    from public.influencer_posts p
    where p.id = post_id
      and p.affiliate_slug = public.get_my_affiliate_slug()
  )
);

-- Widgets
drop policy if exists influencer_post_widgets_select_owner_admin on public.influencer_post_widgets;
create policy influencer_post_widgets_select_owner_admin
on public.influencer_post_widgets
for select to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

drop policy if exists influencer_post_widgets_write_owner_admin on public.influencer_post_widgets;
create policy influencer_post_widgets_write_owner_admin
on public.influencer_post_widgets
for all to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug())
with check (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

-- Eventi: insert pubblico, select owner/admin
drop policy if exists influencer_post_events_insert_public on public.influencer_post_events;
create policy influencer_post_events_insert_public
on public.influencer_post_events
for insert to anon, authenticated
with check (true);

drop policy if exists influencer_post_events_select_owner_admin on public.influencer_post_events;
create policy influencer_post_events_select_owner_admin
on public.influencer_post_events
for select to authenticated
using (public.is_admin() or affiliate_slug = public.get_my_affiliate_slug());

-- ============================================================
-- 4) FUNZIONI DI RISOLUZIONE TRACKING / MODERAZIONE
-- ============================================================

create or replace function public.resolve_influencer_tracking_code(p_tracking_code text)
returns table (
  match_type text,
  affiliate_slug text,
  creator_slug text,
  post_id uuid,
  post_slug text,
  widget_id uuid,
  widget_short_id text,
  tracking_code text,
  partner text,
  metadata jsonb
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := trim(coalesce(p_tracking_code, ''));
begin
  if v_code = '' then
    return;
  end if;

  -- Legacy: sub_id/campaign uguale allo slug affiliato classico.
  return query
  select
    'legacy_affiliate'::text,
    a.slug,
    a.slug,
    null::uuid,
    null::text,
    null::uuid,
    null::text,
    v_code,
    null::text,
    '{}'::jsonb
  from public.affiliates a
  where a.slug = v_code
  limit 1;

  if found then
    return;
  end if;

  -- Nuovo formato influencer: tracking_code del widget pubblicato/live.
  return query
  select
    'influencer_widget'::text,
    w.affiliate_slug,
    w.affiliate_slug,
    p.id,
    p.post_slug,
    w.id,
    w.widget_short_id,
    w.tracking_code,
    w.partner,
    coalesce(w.config_json, '{}'::jsonb)
  from public.influencer_post_widgets w
  join public.influencer_posts p on p.id = w.post_id
  where w.tracking_code = v_code
    and w.deleted_at is null
    and p.current_live_revision_id = w.revision_id
    and p.status = 'published'
    and p.deleted_at is null
  limit 1;
end;
$$;

grant execute on function public.resolve_influencer_tracking_code(text) to anon, authenticated;

create or replace function public.review_influencer_profile(
  p_profile_id uuid,
  p_action text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text := lower(trim(coalesce(p_action, '')));
  v_profile public.influencer_profiles%rowtype;
  v_revision public.influencer_profile_revisions%rowtype;
  v_profile_status text;
begin
  if not public.is_admin() then
    raise exception 'Only admin can review influencer profiles';
  end if;

  select * into v_profile
  from public.influencer_profiles
  where id = p_profile_id;

  if not found then
    raise exception 'Influencer profile not found';
  end if;

  if v_action in ('archive', 'archived') then
    update public.influencer_profiles
    set status = 'archived', review_notes = p_notes, updated_at = now()
    where id = v_profile.id;

    return jsonb_build_object('ok', true, 'status', 'archived');
  end if;

  if v_action in ('suspend', 'suspended') then
    update public.influencer_profiles
    set status = 'suspended', review_notes = p_notes, updated_at = now()
    where id = v_profile.id;

    return jsonb_build_object('ok', true, 'status', 'suspended');
  end if;

  select * into v_revision
  from public.influencer_profile_revisions
  where id = v_profile.current_pending_revision_id;

  if not found then
    raise exception 'No pending profile revision found';
  end if;

  if v_action in ('approve', 'approved') then
    if v_profile.current_published_revision_id is not null and v_profile.current_published_revision_id <> v_revision.id then
      update public.influencer_profile_revisions
      set status = 'archived', updated_at = now()
      where id = v_profile.current_published_revision_id
        and status = 'published';
    end if;

    update public.influencer_profile_revisions
    set status = 'published', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    update public.influencer_profiles
    set display_name = v_revision.display_name,
        public_slug = v_revision.public_slug,
        bio = v_revision.bio,
        avatar_path = v_revision.avatar_path,
        social_links = coalesce(v_revision.social_links, '{}'::jsonb),
        status = 'published',
        current_published_revision_id = v_revision.id,
        current_pending_revision_id = null,
        published_at = coalesce(published_at, now()),
        review_notes = p_notes,
        updated_at = now()
    where id = v_profile.id;

    return jsonb_build_object('ok', true, 'status', 'published');
  elsif v_action in ('changes', 'changes_requested', 'request_changes') then
    update public.influencer_profile_revisions
    set status = 'changes_requested', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    v_profile_status := case when v_profile.current_published_revision_id is null then 'changes_requested' else 'published' end;

    update public.influencer_profiles
    set status = v_profile_status, review_notes = p_notes, updated_at = now()
    where id = v_profile.id;

    return jsonb_build_object('ok', true, 'status', 'changes_requested');
  elsif v_action in ('reject', 'rejected') then
    update public.influencer_profile_revisions
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    v_profile_status := case when v_profile.current_published_revision_id is null then 'rejected' else 'published' end;

    update public.influencer_profiles
    set status = v_profile_status, review_notes = p_notes, updated_at = now()
    where id = v_profile.id;

    return jsonb_build_object('ok', true, 'status', 'rejected');
  else
    raise exception 'Unsupported profile review action: %', v_action;
  end if;
end;
$$;

grant execute on function public.review_influencer_profile(uuid, text, text) to authenticated;

create or replace function public.review_influencer_post(
  p_post_id uuid,
  p_action text,
  p_notes text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action text := lower(trim(coalesce(p_action, '')));
  v_post public.influencer_posts%rowtype;
  v_revision public.influencer_post_revisions%rowtype;
  v_post_status text;
begin
  if not public.is_admin() then
    raise exception 'Only admin can review influencer posts';
  end if;

  select * into v_post
  from public.influencer_posts
  where id = p_post_id;

  if not found then
    raise exception 'Influencer post not found';
  end if;

  if v_action in ('archive', 'archived') then
    update public.influencer_posts
    set status = 'archived', review_notes = p_notes, updated_at = now()
    where id = v_post.id;

    return jsonb_build_object('ok', true, 'status', 'archived');
  end if;

  if v_action in ('delete', 'deleted', 'logical_delete') then
    update public.influencer_posts
    set status = 'deleted', deleted_at = coalesce(deleted_at, now()), review_notes = p_notes, updated_at = now()
    where id = v_post.id;

    return jsonb_build_object('ok', true, 'status', 'deleted');
  end if;

  select * into v_revision
  from public.influencer_post_revisions
  where id = v_post.current_pending_revision_id;

  if not found then
    raise exception 'No pending post revision found';
  end if;

  if v_action in ('approve', 'approved') then
    if v_post.current_live_revision_id is not null and v_post.current_live_revision_id <> v_revision.id then
      update public.influencer_post_revisions
      set status = 'archived', updated_at = now()
      where id = v_post.current_live_revision_id
        and status = 'published';
    end if;

    update public.influencer_post_revisions
    set status = 'published', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    update public.influencer_posts
    set title = v_revision.title,
        excerpt = v_revision.excerpt,
        cover_path = v_revision.cover_path,
        status = 'published',
        current_live_revision_id = v_revision.id,
        current_pending_revision_id = null,
        first_published_at = coalesce(first_published_at, now()),
        review_notes = p_notes,
        updated_at = now()
    where id = v_post.id;

    return jsonb_build_object('ok', true, 'status', 'published');
  elsif v_action in ('changes', 'changes_requested', 'request_changes') then
    update public.influencer_post_revisions
    set status = 'changes_requested', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    v_post_status := case when v_post.current_live_revision_id is null then 'changes_requested' else 'published' end;

    update public.influencer_posts
    set status = v_post_status, review_notes = p_notes, updated_at = now()
    where id = v_post.id;

    return jsonb_build_object('ok', true, 'status', 'changes_requested');
  elsif v_action in ('reject', 'rejected') then
    update public.influencer_post_revisions
    set status = 'rejected', reviewed_at = now(), reviewed_by = auth.uid(), review_notes = p_notes
    where id = v_revision.id;

    v_post_status := case when v_post.current_live_revision_id is null then 'rejected' else 'published' end;

    update public.influencer_posts
    set status = v_post_status, review_notes = p_notes, updated_at = now()
    where id = v_post.id;

    return jsonb_build_object('ok', true, 'status', 'rejected');
  else
    raise exception 'Unsupported post review action: %', v_action;
  end if;
end;
$$;

grant execute on function public.review_influencer_post(uuid, text, text) to authenticated;

-- ============================================================
-- 5) FUNZIONI PUBBLICHE (RPC) PER FRONTEND ANON
-- ============================================================

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
security definer
set search_path = public
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

grant execute on function public.get_influencer_public_profile(text) to anon, authenticated;

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
security definer
set search_path = public
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

grant execute on function public.get_influencer_public_posts(integer, integer, text) to anon, authenticated;

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
security definer
set search_path = public
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
    select rr.*
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

grant execute on function public.get_influencer_public_post(text) to anon, authenticated;

-- ============================================================
-- 6) KPI / VISTE PRIVATE CREATOR-ADMIN
-- ============================================================

create or replace view public.influencer_post_kpis with (security_invoker = true) as
with event_stats as (
  select
    e.post_id,
    max(e.affiliate_slug) as affiliate_slug,
    count(*) filter (where e.event_type = 'card_impression')::bigint as card_impressions,
    count(*) filter (where e.event_type = 'post_open')::bigint as post_opens,
    count(*) filter (where e.event_type = 'widget_click')::bigint as widget_clicks
  from public.influencer_post_events e
  group by e.post_id
),
booking_source as (
  select
    case
      when coalesce(b.metadata->>'post_id', '') ~* '^[0-9a-f-]{36}$' then (b.metadata->>'post_id')::uuid
      else null::uuid
    end as post_id,
    b.affiliate_slug,
    count(*) filter (where b.status = 'pending')::bigint as booking_pending,
    count(*) filter (where b.status = 'confirmed')::bigint as booking_confirmed,
    coalesce(sum(b.commission_partner) filter (where b.status in ('pending','confirmed')), 0)::numeric as estimated_revenue_usd,
    coalesce(sum(b.commission_partner) filter (where b.status = 'confirmed'), 0)::numeric as confirmed_revenue_usd
  from public.bookings b
  where coalesce(b.metadata->>'source', '') = 'influencer_post'
  group by 1, b.affiliate_slug
)
select
  p.id as post_id,
  p.affiliate_slug,
  coalesce(es.card_impressions, 0) as card_impressions,
  coalesce(es.post_opens, 0) as post_opens,
  coalesce(es.widget_clicks, 0) as widget_clicks,
  coalesce(bs.booking_pending, 0) as booking_pending,
  coalesce(bs.booking_confirmed, 0) as booking_confirmed,
  coalesce(bs.estimated_revenue_usd, 0) as estimated_revenue_usd,
  coalesce(bs.confirmed_revenue_usd, 0) as confirmed_revenue_usd
from public.influencer_posts p
left join event_stats es on es.post_id = p.id
left join booking_source bs on bs.post_id = p.id;

create or replace view public.influencer_creator_private_stats with (security_invoker = true) as
with creator_ids as (
  select affiliate_slug from public.influencer_profiles
  union
  select affiliate_slug from public.influencer_posts
  union
  select affiliate_slug from public.influencer_post_events where affiliate_slug is not null
  union
  select affiliate_slug from public.bookings where coalesce(metadata->>'source','') = 'influencer_post'
),
event_stats as (
  select
    affiliate_slug,
    count(*) filter (where event_type = 'profile_view')::bigint as profile_views,
    count(*) filter (where event_type = 'card_impression')::bigint as card_impressions,
    count(*) filter (where event_type = 'post_open')::bigint as post_opens,
    count(*) filter (where event_type = 'widget_click')::bigint as widget_clicks
  from public.influencer_post_events
  where affiliate_slug is not null
  group by affiliate_slug
),
booking_stats as (
  select
    affiliate_slug,
    count(*) filter (where status = 'pending')::bigint as booking_pending,
    count(*) filter (where status = 'confirmed')::bigint as booking_confirmed,
    coalesce(sum(commission_partner) filter (where status in ('pending','confirmed')), 0)::numeric as estimated_revenue_usd,
    coalesce(sum(commission_partner) filter (where status = 'confirmed'), 0)::numeric as confirmed_revenue_usd
  from public.bookings
  where coalesce(metadata->>'source', '') = 'influencer_post'
  group by affiliate_slug
)
select
  c.affiliate_slug,
  coalesce(es.profile_views, 0) as profile_views,
  coalesce(es.card_impressions, 0) as card_impressions,
  coalesce(es.post_opens, 0) as post_opens,
  coalesce(es.widget_clicks, 0) as widget_clicks,
  coalesce(bs.booking_pending, 0) as booking_pending,
  coalesce(bs.booking_confirmed, 0) as booking_confirmed,
  coalesce(bs.estimated_revenue_usd, 0) as estimated_revenue_usd,
  coalesce(bs.confirmed_revenue_usd, 0) as confirmed_revenue_usd,
  coalesce(ab.available_balance_usd, 0) as available_balance
from creator_ids c
left join event_stats es on es.affiliate_slug = c.affiliate_slug
left join booking_stats bs on bs.affiliate_slug = c.affiliate_slug
left join public.affiliate_balances ab on ab.affiliate_slug = c.affiliate_slug;

grant select on public.influencer_post_kpis to authenticated;
grant select on public.influencer_creator_private_stats to authenticated;

