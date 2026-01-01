-- SCRIPT_09_newsletter.sql
-- Newsletter subscribers (multi-lingua)
-- NOTE: le Edge Functions usano la SERVICE_ROLE_KEY, quindi bypassano RLS.
-- Qui abilitiamo RLS e permettiamo solo all'admin (email) di leggere la tabella dal pannello admin.

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  language text not null default 'ITA',
  subscribed boolean not null default true,
  token text not null unique,
  source text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);

create index if not exists idx_newsletter_subscribers_subscribed on public.newsletter_subscribers(subscribed);
create index if not exists idx_newsletter_subscribers_language on public.newsletter_subscribers(language);

-- Aggiorna automaticamente updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists trg_newsletter_updated_at on public.newsletter_subscribers;
create trigger trg_newsletter_updated_at
before update on public.newsletter_subscribers
for each row execute procedure public.set_updated_at();

alter table public.newsletter_subscribers enable row level security;

-- Admin read-only (per dashboard admin)
drop policy if exists "Newsletter admin read" on public.newsletter_subscribers;
create policy "Newsletter admin read"
on public.newsletter_subscribers
for select
to authenticated
using ( (auth.jwt() ->> 'email')::text = 'serioliivan@gmail.com' );

-- Niente insert/update/delete dal client (le Edge Functions usano service role)
