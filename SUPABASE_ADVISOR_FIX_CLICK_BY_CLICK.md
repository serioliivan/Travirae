# Travirae — Fix Supabase Security/Performance Advisor

Questo aggiornamento aggiunge lo script:

`supabase/sql/SCRIPT_21_supabase_advisor_hardening.sql`

Puoi usare anche la copia rapida nella radice dello ZIP:

`TRAVIRAE_SUPABASE_ADVISOR_FIX.sql`

## Cosa corregge

- `Security Definer View` su:
  - `public.admin_affiliate_overview`
  - `public.admin_site_traffic_summary`
  - `public.affiliate_balances`
  - `public.monthly_affiliate_stats`
- `Function Search Path Mutable` sulle funzioni Travirae.
- Funzioni `SECURITY DEFINER` eseguibili da utenti pubblici/loggati: le RPC Travirae vengono rese `SECURITY INVOKER` dove possibile e i permessi `EXECUTE` diventano espliciti.
- Policy RLS troppo permissive tipo `WITH CHECK (true)`.
- Policy duplicate/legacy che il Performance Advisor segnala come `Multiple Permissive Policies`.
- Indici mancanti su alcune foreign key.

## Cosa NON cambia

- Non cancella dati.
- Non disattiva RLS.
- Non cambia URL Supabase o chiavi.
- Non cambia il frontend del sito.
- Non rimuove indici segnalati come `Unused Index`, perché possono diventare utili appena arrivano traffico e dati reali.
- Non sposta `pg_net` fuori da `public`, perché può rompere cron/job che usano `net.http_post`.

## Click per click — Supabase

1. Apri Supabase.
2. Seleziona il progetto `travirae-affiliate`.
3. Nel menu sinistro apri **SQL Editor**.
4. Clicca **New query**.
5. Apri sul computer il file:
   `supabase/sql/SCRIPT_21_supabase_advisor_hardening.sql`
6. Copia tutto il contenuto.
7. Incollalo nella query Supabase.
8. Clicca **Run**.
9. Aspetta la fine dell’esecuzione.
10. Apri **Security Advisor**.
11. Clicca **Rerun linter** o **Refresh**.
12. Apri anche **Performance Advisor**.
13. Clicca **Rerun linter** o **Refresh**.

## Avvisi che possono restare e cosa fare

### Leaked Password Protection Disabled

Questo non si corregge via ZIP. È una impostazione Auth.

1. Supabase → **Authentication**.
2. Apri **Security** o **Providers / Email** in base alla UI disponibile.
3. Cerca **Leaked password protection**.
4. Attivala.
5. Salva.
6. Torna in **Security Advisor** e rilancia il linter.

### Extension in Public — `pg_net`

Nel tuo progetto `pg_net` è usata per il cron/HTTP (`net.http_post`). Non l’ho spostata automaticamente perché spostare estensioni già installate può rompere job esistenti. Se vuoi eliminarlo dal linter, fallo solo dopo backup e test del cron automatico.

### Unused Index

È un avviso informativo: Supabase ti dice che alcuni indici non sono stati usati ancora. Su un sito nuovo o con poco traffico è normale. Non conviene cancellarli ora.

## Test dopo il Run

1. Apri il sito pubblico.
2. Controlla home, voli e pagine influencer/vlog.
3. Prova iscrizione newsletter.
4. Entra in `area-affiliati.html`.
5. Controlla dashboard affiliato, profilo payout e statistiche.
6. Entra in `admin-affiliati.html` con la tua email admin.
7. Controlla statistiche, traffico, newsletter, payout e import CSV.
8. Entra in `admin-influencer.html` e prova lista creator/post.
9. In Supabase → **Logs**, controlla che non compaiano errori `42501` o errori RPC.
