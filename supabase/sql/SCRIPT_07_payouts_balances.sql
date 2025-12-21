-- SCRIPT 07 — PRELIEVI (payout requests) + BALANCE VIEW (USD)
-- Esegui questo script DOPO gli script 01 → 05.

-- 0) Fix: currency di default in USD (nel caso tu abbia creato bookings con EUR in passato)
alter table if exists public.bookings alter column currency set default 'USD';

-- (Opzionale) se stai facendo test e hai già inserito click con EUR, puoi forzare a USD.
-- ⚠️ NON converte i valori: cambia solo la stringa currency.
-- update public.bookings set currency='USD' where currency='EUR';

-- 1) Aggiungi email sugli affiliati (utile per admin)
alter table if exists public.affiliates add column if not exists email text;

-- 2) Utility: updated_at automatico
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 3) Profili payout (dati salvati dall'affiliato)
create table if not exists public.payout_profiles (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null unique,
  method text,
  payout_details jsonb not null default '{}'::jsonb,
  fiscal_details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_payout_profiles_slug on public.payout_profiles (affiliate_slug);

drop trigger if exists trg_payout_profiles_updated_at on public.payout_profiles;
create trigger trg_payout_profiles_updated_at
before update on public.payout_profiles
for each row execute function public.set_updated_at();

-- 4) Richieste payout
create table if not exists public.payout_requests (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  requester_user_id uuid,
  requester_email text,
  amount_usd numeric not null,
  method text not null,
  status text not null default 'pending',
  payout_snapshot jsonb not null default '{}'::jsonb,
  admin_notes text,
  requested_at timestamptz not null default now(),
  processed_at timestamptz,
  processed_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Vincolo di stato (idempotente)
do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'payout_requests_status_check'
  ) then
    alter table public.payout_requests
      add constraint payout_requests_status_check
      check (status in ('pending','approved','rejected','paid'));
  end if;
end $$;

create index if not exists idx_payout_requests_slug_requested on public.payout_requests (affiliate_slug, requested_at desc);
create index if not exists idx_payout_requests_status_requested on public.payout_requests (status, requested_at desc);

-- updated_at trigger

drop trigger if exists trg_payout_requests_updated_at on public.payout_requests;
create trigger trg_payout_requests_updated_at
before update on public.payout_requests
for each row execute function public.set_updated_at();

-- 5) Calcolo saldo disponibile (USD)
-- Usa monthly_affiliate_stats (view LIVE basata su bookings confermate)
create or replace view public.affiliate_balances as
with earnings as (
  select affiliate_slug, coalesce(sum(affiliate_earnings),0) as total_earnings_usd
  from public.monthly_affiliate_stats
  group by affiliate_slug
),
paid as (
  select affiliate_slug, coalesce(sum(amount_usd),0) as paid_total_usd
  from public.payout_requests
  where status = 'paid'
  group by affiliate_slug
),
reserved as (
  select affiliate_slug, coalesce(sum(amount_usd),0) as reserved_total_usd
  from public.payout_requests
  where status in ('pending','approved')
  group by affiliate_slug
)
select
  a.slug as affiliate_slug,
  a.email,
  coalesce(e.total_earnings_usd,0) as total_earnings_usd,
  coalesce(p.paid_total_usd,0) as paid_total_usd,
  coalesce(r.reserved_total_usd,0) as reserved_total_usd,
  greatest(0, coalesce(e.total_earnings_usd,0) - coalesce(p.paid_total_usd,0) - coalesce(r.reserved_total_usd,0)) as available_balance_usd
from public.affiliates a
left join earnings e on e.affiliate_slug = a.slug
left join paid p on p.affiliate_slug = a.slug
left join reserved r on r.affiliate_slug = a.slug;

-- 6) Validazione server-side su payout_requests
create or replace function public.validate_payout_request()
returns trigger
language plpgsql
as $$
declare
  avail numeric;
begin
  -- normalizza
  if new.status is null then
    new.status := 'pending';
  end if;
  if new.requested_at is null then
    new.requested_at := now();
  end if;

  if new.amount_usd is null or new.amount_usd <= 0 then
    raise exception 'Importo non valido';
  end if;
  if new.amount_usd < 50 then
    raise exception 'Errore: il limite minimo di prelievo è 50 USD';
  end if;
  if new.method not in ('paypal','bank') then
    raise exception 'Metodo payout non valido';
  end if;

  -- saldo disponibile (esclude questa riga se update)
  select coalesce(ab.available_balance_usd,0)
    into avail
  from public.affiliate_balances ab
  where ab.affiliate_slug = new.affiliate_slug;

  if tg_op = 'UPDATE' then
    -- se stai aggiornando una riga esistente, riaggiungi l'importo precedente nel saldo
    -- (utile se admin modifica importo)
    if old.status in ('pending','approved') then
      avail := avail + coalesce(old.amount_usd,0);
    end if;
  end if;

  if new.status in ('pending','approved') and new.amount_usd > avail then
    raise exception 'Saldo insufficiente: disponibile % USD', avail;
  end if;

  return new;
end;
$$;

-- trigger validazione

drop trigger if exists trg_validate_payout_request_ins on public.payout_requests;
create trigger trg_validate_payout_request_ins
before insert on public.payout_requests
for each row execute function public.validate_payout_request();

drop trigger if exists trg_validate_payout_request_upd on public.payout_requests;
create trigger trg_validate_payout_request_upd
before update on public.payout_requests
for each row execute function public.validate_payout_request();

-- 7) Admin overview (tabella operativa)
create or replace view public.admin_affiliate_overview as
with clicks as (
  select affiliate_slug,
         count(*) as total_clicks,
         max(created_at) as last_click_at
  from public.affiliate_clicks
  group by affiliate_slug
),
booking_clicks as (
  select affiliate_slug,
         count(*) filter (where status='click') as booking_clicks_total,
         count(*) filter (where status='click' and partner='aviasales') as booking_clicks_aviasales,
         count(*) filter (where status='click' and partner='stay22') as booking_clicks_stay22,
         max(booked_at) filter (where status='click') as last_booking_click_at
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
         coalesce(sum(amount_usd) filter (where status in ('pending','approved')),0) as pending_payout_amount_usd,
         max(requested_at) filter (where status in ('pending','approved')) as last_pending_at
  from public.payout_requests
  group by affiliate_slug
),
activity as (
  select a.slug as affiliate_slug,
         greatest(
           coalesce(c.last_click_at, 'epoch'::timestamptz),
           coalesce(b.last_booking_click_at, 'epoch'::timestamptz)
         ) as last_activity_at
  from public.affiliates a
  left join clicks c on c.affiliate_slug = a.slug
  left join booking_clicks b on b.affiliate_slug = a.slug
)
select
  a.slug as affiliate_slug,
  a.email,
  coalesce(c.total_clicks,0) as total_clicks,
  coalesce(b.booking_clicks_total,0) as booking_clicks_total,
  coalesce(b.booking_clicks_aviasales,0) as booking_clicks_aviasales,
  coalesce(b.booking_clicks_stay22,0) as booking_clicks_stay22,
  coalesce(cm.sales_count_month,0) as sales_count_month,
  coalesce(cm.net_commissions_month,0) as net_commissions_month,
  coalesce(cm.share_percent_month,0.40) as share_percent_month,
  coalesce(cm.affiliate_earnings_month,0) as affiliate_earnings_month,
  coalesce(ab.available_balance_usd,0) as available_balance_usd,
  coalesce(p.pending_payout_count,0) as pending_payout_count,
  coalesce(p.pending_payout_amount_usd,0) as pending_payout_amount_usd,
  act.last_activity_at
from public.affiliates a
left join clicks c on c.affiliate_slug = a.slug
left join booking_clicks b on b.affiliate_slug = a.slug
left join current_month cm on cm.affiliate_slug = a.slug
left join public.affiliate_balances ab on ab.affiliate_slug = a.slug
left join pending_payouts p on p.affiliate_slug = a.slug
left join activity act on act.affiliate_slug = a.slug
order by act.last_activity_at desc nulls last, a.slug;

-- 8) RLS
alter table public.payout_profiles enable row level security;
alter table public.payout_requests enable row level security;

-- Grants
grant select, insert, update on public.payout_profiles to authenticated;
grant select on public.payout_requests to authenticated;
grant insert on public.payout_requests to authenticated;
grant update on public.payout_requests to authenticated;

-- Grants per le VIEW usate dal frontend
grant select on public.monthly_affiliate_stats to authenticated;
grant select on public.affiliate_balances to authenticated;
grant select on public.admin_affiliate_overview to authenticated;

-- Policies payout_profiles
DO $$
begin
  -- drop existing policies if they exist (idempotente)
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_profiles' and policyname='Profiles: read own or admin') then
    execute 'drop policy "Profiles: read own or admin" on public.payout_profiles';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_profiles' and policyname='Profiles: upsert own or admin') then
    execute 'drop policy "Profiles: upsert own or admin" on public.payout_profiles';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_profiles' and policyname='Profiles: update own or admin') then
    execute 'drop policy "Profiles: update own or admin" on public.payout_profiles';
  end if;
end $$;

create policy "Profiles: read own or admin"
on public.payout_profiles
for select
to authenticated
using (
  public.is_admin() OR affiliate_slug = public.get_my_affiliate_slug()
);

create policy "Profiles: upsert own or admin"
on public.payout_profiles
for insert
to authenticated
with check (
  public.is_admin() OR affiliate_slug = public.get_my_affiliate_slug()
);

create policy "Profiles: update own or admin"
on public.payout_profiles
for update
to authenticated
using (
  public.is_admin() OR affiliate_slug = public.get_my_affiliate_slug()
)
with check (
  public.is_admin() OR affiliate_slug = public.get_my_affiliate_slug()
);

-- Policies payout_requests
DO $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_requests' and policyname='Requests: read own or admin') then
    execute 'drop policy "Requests: read own or admin" on public.payout_requests';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_requests' and policyname='Requests: insert own') then
    execute 'drop policy "Requests: insert own" on public.payout_requests';
  end if;
  if exists (select 1 from pg_policies where schemaname='public' and tablename='payout_requests' and policyname='Requests: admin update') then
    execute 'drop policy "Requests: admin update" on public.payout_requests';
  end if;
end $$;

create policy "Requests: read own or admin"
on public.payout_requests
for select
to authenticated
using (
  public.is_admin() OR affiliate_slug = public.get_my_affiliate_slug()
);

create policy "Requests: insert own"
on public.payout_requests
for insert
to authenticated
with check (
  affiliate_slug = public.get_my_affiliate_slug()
);

create policy "Requests: admin update"
on public.payout_requests
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

