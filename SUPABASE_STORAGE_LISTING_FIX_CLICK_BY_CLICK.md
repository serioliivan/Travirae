# Travirae — Fix Public Bucket Allows Listing

Questa patch corregge i due warning Supabase:

- `Public Bucket Allows Listing — storage.influencer-avatars`
- `Public Bucket Allows Listing — storage.influencer-post-media`

I bucket restano pubblici, quindi avatar e immagini dei post continuano a essere visibili sul sito tramite URL pubblico. La modifica rimuove solo la possibilità di elencare pubblicamente tutti i file del bucket.

## File da eseguire

Per il progetto già online esegui solo:

`supabase/sql/SCRIPT_22_storage_public_listing_fix.sql`

Oppure la copia rapida nella radice dello ZIP:

`TRAVIRAE_SUPABASE_STORAGE_LISTING_FIX.sql`

## Click per click

1. Apri Supabase.
2. Entra nel progetto `travirae-affiliate`.
3. Clicca **SQL Editor**.
4. Clicca **New query**.
5. Apri sul computer il file `SCRIPT_22_storage_public_listing_fix.sql`.
6. Copia tutto il contenuto.
7. Incollalo nella query Supabase.
8. Clicca **Run**.
9. Vai su **Security Advisor**.
10. Clicca **Refresh** oppure **Rerun linter**.
11. Controlla che i due warning `Public Bucket Allows Listing` siano spariti.

## Test dopo il run

1. Apri il sito pubblico.
2. Apri una pagina influencer/vlog con immagini già caricate.
3. Controlla che avatar e immagini si vedano.
4. Accedi come affiliato.
5. Prova a caricare o sostituire l'avatar.
6. Prova a caricare una cover/immagine post.
7. Salva e controlla che l'immagine sia visibile anche dalla pagina pubblica.
