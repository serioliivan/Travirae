# Deploy v6 — Affiliate overview grouped layout

Questa versione fa 3 cose:

1. mette il **Saldo disponibile** in alto
2. sposta sotto le 4 card principali
3. mette **Vlog degli influencer** sotto le card, tutto dentro un unico box

## Cosa caricare

Carica tutti i file aggiornati su GitHub / hosting come fai di solito.

## SQL opzionale per audit attribuzione vendite

Se vuoi controllare live che le vendite siano attribuite agli affiliati corretti, esegui anche:

- `supabase/sql/SCRIPT_17_affiliate_sales_attribution_audit.sql`

Lo script non modifica dati: mostra solo le ultime vendite confermate e il relativo `affiliate_slug`.
