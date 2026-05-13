# Travirae — patch Supabase GRANT 2026

Questa patch serve a rendere espliciti i permessi Data API/PostgREST richiesti da Supabase per il rollout 2026.

## File nuovi/aggiornati

- `supabase/sql/SCRIPT_20_supabase_explicit_grants_2026.sql`
- `TRAVIRAE_SUPABASE_GRANTS_FIX.sql`
- script SQL esistenti aggiornati con GRANT espliciti dove vengono create tabelle, view e RPC.

## Cosa corregge

- Aggiunge `service_role` alle tabelle usate dalle Edge Functions.
- Aggiunge `select` admin su `newsletter_subscribers`.
- Aggiunge `update` su `bookings` per l'upsert manuale dell'admin.
- Aggiunge `execute` alle RPC usate da `supabase-js`.
- Aggiunge `select` alle view usate da dashboard affiliati/admin.
- Aggiunge 3 asset immagine mancanti per evitare riferimenti locali 404 (`hero.jpg`, `hero-plane.jpg`, `flights-bg.jpg`).

## Cosa NON cambia

- Non cancella dati.
- Non disabilita RLS.
- Non cambia le policy RLS.
- Non cambia URL, chiavi pubbliche, HTML o logica frontend.

## Ordine consigliato

Se il tuo Supabase è già attivo, esegui solo:

1. `supabase/sql/SCRIPT_20_supabase_explicit_grants_2026.sql`
2. Controllo Security Advisor
3. Test rapido delle pagine admin/affiliate/newsletter

Se crei un progetto Supabase nuovo da zero, esegui gli script in ordine e poi esegui sempre `SCRIPT_20_supabase_explicit_grants_2026.sql` alla fine.
