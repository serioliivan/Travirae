-- ============================================================================
-- 08) Site traffic (visite totali) + dashboard admin
-- ============================================================================
-- Crea una tabella per registrare i pageview del sito, utile per:
-- - Visite totali (sessioni uniche)
-- - Pageview totali
-- - Traffico da affiliati vs diretto (senza ?ref=)
--
-- NOTE:
-- - Dati minimi (session_id/visitor_id sono pseudonimi generati dal browser)
-- - Se vuoi essere “GDPR-compliant” al 100%, aggiungi un banner/cookie-consent
--   prima di attivare il tracking.

create table if not exists public.site_pageviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- session_id: id “tab session” (sessionStorage)
  session_id text not null,

  -- visitor_id: id persistente (localStorage)
  visitor_id text not null,

  -- pagina visitata
  page text not null,

  -- se l'utente è entrato da un link affiliato (?ref=...), lo “fissiamo” per la sessione
  ref_affiliate_slug text,

  -- opzionali (best-effort: se non ci sono le colonne, lo script lato client ritenta con payload minimo)
  referrer text,
  user_agent text
);

create index if not exists site_pageviews_created_at_idx on public.site_pageviews (created_at);
create index if not exists site_pageviews_session_idx on public.site_pageviews (session_id);
create index if not exists site_pageviews_ref_slug_idx on public.site_pageviews (ref_affiliate_slug);

alter table public.site_pageviews enable row level security;

-- Permessi base
grant insert on public.site_pageviews to anon, authenticated;
grant select on public.site_pageviews to authenticated;

-- Policies
drop policy if exists "Site pageviews insert" on public.site_pageviews;
create policy "Site pageviews insert"
on public.site_pageviews
for insert
to anon, authenticated
with check (true);

drop policy if exists "Site pageviews select admin" on public.site_pageviews;
create policy "Site pageviews select admin"
on public.site_pageviews
for select
to authenticated
using (public.is_admin());

-- Summary view (mese corrente) usata dal pannello admin
create or replace view public.admin_site_traffic_summary as
select
  date_trunc('month', now())::date as month,
  count(*)::bigint as pageviews_month,
  count(distinct session_id)::bigint as visits_month,
  count(distinct visitor_id)::bigint as unique_visitors_month,

  count(*) filter (where ref_affiliate_slug is not null and ref_affiliate_slug <> '')::bigint as pageviews_affiliate_month,
  count(distinct session_id) filter (where ref_affiliate_slug is not null and ref_affiliate_slug <> '')::bigint as visits_affiliate_month,

  count(*) filter (where ref_affiliate_slug is null or ref_affiliate_slug = '')::bigint as pageviews_direct_month,
  count(distinct session_id) filter (where ref_affiliate_slug is null or ref_affiliate_slug = '')::bigint as visits_direct_month

from public.site_pageviews
where created_at >= date_trunc('month', now())
  and created_at < (date_trunc('month', now()) + interval '1 month');

grant select on public.admin_site_traffic_summary to authenticated;
