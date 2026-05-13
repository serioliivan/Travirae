# Travirae — Fix Supabase Data API / GRANTS 2026

Questo ZIP include il fix preventivo per il cambio Supabase 2026: `supabase/sql/SCRIPT_20_supabase_explicit_grants_2026.sql`.

## Cosa cambia

- Aggiunge i `GRANT` espliciti per le tabelle, viste e funzioni già usate dal sito.
- Corregge il caso `bookings.upsert(...)` del pannello admin, aggiungendo il permesso `UPDATE` a `authenticated` ma lasciando RLS admin-only.
- Aggiunge i permessi espliciti per `service_role`, usata dalle Edge Functions.
- Non disattiva RLS.
- Non cambia HTML/CSS/JS del sito.
- Aggiunge anche 3 asset immagine mancanti per evitare 404 locali: `hero.jpg`, `hero-plane.jpg`, `flights-bg.jpg`.
- Non espone la tabella newsletter al pubblico: gli utenti si iscrivono tramite Edge Function, l’admin legge via policy RLS.

## Implementazione click-per-click su Supabase

1. Apri https://supabase.com/dashboard
2. Seleziona il progetto Travirae.
3. Nel menu a sinistra clicca **SQL Editor**.
4. Clicca **New query**.
5. Apri nel tuo computer il file:
   `supabase/sql/SCRIPT_20_supabase_explicit_grants_2026.sql`
6. Copia tutto il contenuto del file.
7. Incollalo nella query Supabase.
8. Clicca **Run**.
9. Aspetta il messaggio di completamento. Se vedi righe `NOTICE: Skip ... non esiste`, va bene: significa solo che quella tabella/funzione opzionale non è presente nel tuo database.
10. Nel menu a sinistra vai su **Security Advisor**.
11. Clicca **Run checks** o aggiorna il report.
12. Controlla che non compaiano avvisi legati a permessi mancanti sulle tabelle usate dalla Data API.

## Deploy del sito aggiornato

Questo fix è soprattutto SQL/Supabase. Il sito statico non cambia a livello visivo, ma puoi caricare lo ZIP aggiornato per avere anche la nuova documentazione e lo script dentro il progetto.

### Se usi Netlify

1. Apri Netlify.
2. Entra nel sito Travirae.
3. Vai su **Deploys**.
4. Clicca **Add new deploy** oppure **Deploy manually**.
5. Trascina lo ZIP aggiornato oppure la cartella scompattata.
6. Attendi il deploy.
7. Apri il sito pubblicato e fai i test indicati sotto.

### Se usi hosting con File Manager / IONOS / cPanel

1. Entra nel pannello hosting.
2. Apri il **File Manager**.
3. Vai nella cartella pubblica del sito, di solito `public_html`, `htdocs` o simile.
4. Fai un backup della cartella attuale.
5. Carica lo ZIP aggiornato.
6. Estrai lo ZIP.
7. Se lo ZIP crea una cartella `Travirae DEFINITIVO`, entra in quella cartella e sposta il contenuto nella cartella pubblica del sito, mantenendo la stessa struttura di file.
8. Controlla che `index.html` sia nella radice pubblica.

## Test dopo l’implementazione

1. Apri la home del sito.
2. Inserisci una email nel form newsletter e verifica che non dia errore.
3. Apri `newsletter-unsubscribe.html?token=TEST` e verifica che la pagina carichi.
4. Apri `area-affiliati.html`, fai login e controlla che dashboard e saldo si carichino.
5. Apri `admin-affiliati.html`, fai login con l’email admin e controlla:
   - statistiche mese;
   - traffico sito;
   - newsletter iscritti;
   - richieste payout;
   - import manuale/CSV se lo usi.
6. Se compare un errore `42501`, apri Supabase → **Logs** → cerca `42501`: il log indica quasi sempre il `GRANT` mancante.

## Quando crei una nuova tabella in futuro

Per ogni nuova tabella che vuoi usare dal frontend o dalle Edge Functions, non basta crearla: devi anche aggiungere `GRANT`, abilitare RLS e creare le policy. Nel file `SCRIPT_20` trovi un template alla fine.
