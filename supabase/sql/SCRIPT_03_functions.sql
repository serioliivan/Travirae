-- SCRIPT 03 — FUNZIONI DI SUPPORTO (copia/incolla e RUN)

-- Admin check (RLS): SOLO questa email vede tutto
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select lower(coalesce(auth.jwt() ->> 'email', '')) = 'serioliivan@gmail.com';
$$;

-- Ritorna lo slug affiliato dell'utente loggato
create or replace function public.get_my_affiliate_slug()
returns text
language sql
stable
as $$
  select a.slug
  from public.affiliates a
  where a.user_id = auth.uid()
  limit 1;
$$;

-- Revenue share tiers: funzione su BIGINT (count(*) restituisce bigint)
create or replace function public.travirae_share_percent(sales_count bigint)
returns numeric
language sql
immutable
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
as $$
  select public.travirae_share_percent(sales_count::bigint);
$$;
