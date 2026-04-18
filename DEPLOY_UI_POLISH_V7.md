# Deploy UI polish v7

Questa versione include:
- fix bordo doppio popup post
- fix scrollbar del popup (non più sotto la X)
- bottone Stay22 centrato
- box Saldo disponibile rifinito
- pannelli creator profile allineati alla stessa larghezza
- script opzionale `supabase/sql/SCRIPT_18_affiliate_money_integrity_audit.sql` per controllare l'integrità dei soldi affiliati live

## Cosa fare
1. Carica i file aggiornati su GitHub / hosting.
2. Se vuoi controllare i conti live, esegui in Supabase `SCRIPT_18_affiliate_money_integrity_audit.sql`.

Lo script 18 non modifica dati: mostra solo eventuali differenze da correggere.
