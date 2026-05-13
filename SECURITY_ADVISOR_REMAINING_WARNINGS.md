# Supabase Security Advisor — Warning rimanenti

Dopo `SCRIPT_22_storage_public_listing_fix.sql`, i due warning `Public Bucket Allows Listing` dovrebbero sparire.

Potrebbero restare:

## Extension in Public — public.pg_net

Non è stato corretto automaticamente perché `pg_net` è usato da cron/webhook e dagli script Travirae per chiamare Edge Function da Postgres. Rimuoverlo o ricrearlo può rompere l'import automatico. Se non usi cron/webhook, valuta la rimozione solo manualmente e dopo backup.

## Leaked Password Protection Disabled

Non è un file del sito. È un'impostazione Auth in Supabase Dashboard. Se disponibile sul tuo piano, puoi attivarla da Authentication → Settings → Password security / Password protection.
