-- SCRIPT 02 — TABELLE (copia/incolla e RUN)
-- Crea le tabelle richieste dal frontend + colonne utili per import conversioni reali.

-- Affiliati (1 riga per utente autenticato)
create table if not exists public.affiliates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  slug text not null unique,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Click totali (1 per sessione/pagina quando si entra con ?ref=...)
create table if not exists public.affiliate_clicks (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  page text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

-- Bookings (click intent dal frontend + vendite confermate dal backend)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  partner text not null,              -- 'stay22' | 'aviasales'
  status text not null default 'click', -- 'click' | 'pending' | 'confirmed' | 'canceled'
  booked_at timestamptz not null default now(),
  confirmed_at timestamptz,
  currency text not null default 'USD',

  -- campi per vendite reali (import backend)
  partner_reference text,             -- id univoco conversione lato partner
  amount numeric,
  commission_partner numeric,

  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- Tabella "materializzata" per dashboard (affiliati + admin)
create table if not exists public.monthly_affiliate_payouts (
  id uuid primary key default gen_random_uuid(),
  affiliate_slug text not null,
  month date not null,                -- primo giorno del mese
  sales_count bigint not null default 0,
  net_commissions numeric not null default 0,
  share_percent numeric not null default 0,
  affiliate_earnings numeric not null default 0,
  updated_at timestamptz not null default now(),
  unique (affiliate_slug, month)
);

-- Indici utili
create index if not exists idx_affiliate_clicks_slug_created on public.affiliate_clicks (affiliate_slug, created_at desc);
create index if not exists idx_bookings_slug_booked on public.bookings (affiliate_slug, booked_at desc);
create index if not exists idx_bookings_partner_status on public.bookings (partner, status);

-- Unicità conversioni reali (partner + partner_reference)
-- NB: partner_reference può essere NULL per i click intent (e va bene).
do $$
begin
  if not exists (
    select 1
    from pg_indexes
    where schemaname='public'
      and indexname='ux_bookings_partner_partner_reference'
  ) then
    execute 'create unique index ux_bookings_partner_partner_reference on public.bookings (partner, partner_reference)';
  end if;
end $$;
