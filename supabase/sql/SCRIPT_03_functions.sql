-- SCRIPT 03 — FUNZIONI DI SUPPORTO (copia/incolla e RUN)

-- Admin check (RLS): SOLO questa email vede tutto
create or replace function public.is_admin()
returns boolean
language sql
stable
set search_path = public, auth
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'serioliivan@gmail.com';
$$;

-- Ritorna lo slug affiliato dell'utente loggato
create or replace function public.get_my_affiliate_slug()
returns text
language sql
stable
set search_path = public, auth
as $$
  select a.slug
  from public.affiliates a
  where a.user_id = auth.uid()
  limit 1;
$$;

-- GRANT espliciti per funzioni usate da RLS/RPC.
grant execute on function public.is_admin() to authenticated, service_role;
grant execute on function public.get_my_affiliate_slug() to authenticated, service_role;

-- Revenue share tiers: funzione su BIGINT (count(*) restituisce bigint)
create or replace function public.travirae_share_percent(sales_count bigint)
returns numeric
language sql
immutable
set search_path = public, auth
as $$
  select case
    when sales_count is null then 0.40
    when sales_count < 20 then 0.40
    when sales_count < 50 then 0.45
    when sales_count < 100 then 0.50
    when sales_count < 200 then 0.55
    else 0.60
  end;
$$;

-- Overload comodo: se per caso chiami con integer
create or replace function public.travirae_share_percent(sales_count integer)
returns numeric
language sql
immutable
set search_path = public, auth
as $$
  select public.travirae_share_percent(sales_count::bigint);
$$;

-- GRANT espliciti per la funzione di revenue share.
grant execute on function public.travirae_share_percent(bigint) to authenticated, service_role;
grant execute on function public.travirae_share_percent(integer) to authenticated, service_role;
