# Changelog — Supabase Advisor Hardening

## Aggiunto

- `supabase/sql/SCRIPT_21_supabase_advisor_hardening.sql`
- `TRAVIRAE_SUPABASE_ADVISOR_FIX.sql`
- `SUPABASE_ADVISOR_FIX_CLICK_BY_CLICK.md`

## Correzioni incluse

- View Travirae convertite a `security_invoker` per rimuovere gli errori `Security Definer View`.
- Search path impostato sulle funzioni Travirae per rimuovere `Function Search Path Mutable`.
- Permessi `EXECUTE` resi espliciti e non più aperti via `PUBLIC`.
- RPC Travirae convertite a `SECURITY INVOKER` dove possibile.
- RLS consolidate per ridurre `RLS Policy Always True`, `Auth RLS Initialization Plan` e `Multiple Permissive Policies`.
- Aggiunti indici per foreign key segnalate dal Performance Advisor.

## Scelte conservative

- Non sono stati rimossi indici `Unused Index`.
- Non è stata spostata l’estensione `pg_net`.
- Non sono state modificate chiavi o configurazioni frontend.
