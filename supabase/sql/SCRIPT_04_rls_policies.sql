-- SCRIPT 04 — RLS + POLICY + GRANTS (copia/incolla e RUN)

-- Abilita RLS
alter table public.affiliates enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.bookings enable row level security;
alter table public.monthly_affiliate_payouts enable row level security;

-- GRANTS (permessi base per PostgREST)
grant usage on schema public to anon, authenticated;

grant select, insert, update on public.affiliates to authenticated;
grant select on public.affiliate_clicks to authenticated;
grant insert on public.affiliate_clicks to anon, authenticated;

grant select on public.bookings to authenticated;
grant insert on public.bookings to anon, authenticated;

grant select on public.monthly_affiliate_payouts to authenticated;

-- ===== POLICIES =====

-- affiliates: l'utente vede/gestisce solo la sua riga. Admin vede tutto.
drop policy if exists "affiliates_select_own_or_admin" on public.affiliates;
create policy "affiliates_select_own_or_admin"
on public.affiliates
for select
to authenticated
using ( public.is_admin() or user_id = auth.uid() );

drop policy if exists "affiliates_insert_own" on public.affiliates;
create policy "affiliates_insert_own"
on public.affiliates
for insert
to authenticated
with check ( public.is_admin() or user_id = auth.uid() );

drop policy if exists "affiliates_update_own_or_admin" on public.affiliates;
create policy "affiliates_update_own_or_admin"
on public.affiliates
for update
to authenticated
using ( public.is_admin() or user_id = auth.uid() )
with check ( public.is_admin() or user_id = auth.uid() );

-- affiliate_clicks: insert pubblico (tracking). select solo admin o affiliato proprietario dello slug.
drop policy if exists "affiliate_clicks_insert_public" on public.affiliate_clicks;
create policy "affiliate_clicks_insert_public"
on public.affiliate_clicks
for insert
to anon, authenticated
with check ( true );

drop policy if exists "affiliate_clicks_select_own_or_admin" on public.affiliate_clicks;
create policy "affiliate_clicks_select_own_or_admin"
on public.affiliate_clicks
for select
to authenticated
using (
  public.is_admin()
  or affiliate_slug = public.get_my_affiliate_slug()
);

-- bookings: insert pubblico (click intent dal frontend). select solo admin o affiliato proprietario dello slug.
drop policy if exists "bookings_insert_public" on public.bookings;
create policy "bookings_insert_public"
on public.bookings
for insert
to anon, authenticated
with check ( true );

drop policy if exists "bookings_select_own_or_admin" on public.bookings;
create policy "bookings_select_own_or_admin"
on public.bookings
for select
to authenticated
using (
  public.is_admin()
  or affiliate_slug = public.get_my_affiliate_slug()
);

-- (opzionale) update solo admin
drop policy if exists "bookings_update_admin_only" on public.bookings;
create policy "bookings_update_admin_only"
on public.bookings
for update
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );

-- monthly_affiliate_payouts: select per affiliato, admin vede tutto
drop policy if exists "payouts_select_own_or_admin" on public.monthly_affiliate_payouts;
create policy "payouts_select_own_or_admin"
on public.monthly_affiliate_payouts
for select
to authenticated
using (
  public.is_admin()
  or affiliate_slug = public.get_my_affiliate_slug()
);

-- update/insert solo admin (normalmente scrive la function refresh)
drop policy if exists "payouts_write_admin_only" on public.monthly_affiliate_payouts;
create policy "payouts_write_admin_only"
on public.monthly_affiliate_payouts
for all
to authenticated
using ( public.is_admin() )
with check ( public.is_admin() );
