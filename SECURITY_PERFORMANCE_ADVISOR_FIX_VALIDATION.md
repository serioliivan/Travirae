# Travirae — Report controllo patch Advisor Supabase

## Esito controlli locali

- JavaScript: OK (27 file controllati con node --check)
- JSON dati sito: OK (12 file controllati)
- File SQL aggiunto/aggiornato: supabase/sql/SCRIPT_21_supabase_advisor_hardening.sql
- Copia rapida SQL: TRAVIRAE_SUPABASE_ADVISOR_FIX.sql
- Copia rapida uguale allo script SQL: SI
- Integrità ZIP: verificata dopo compressione

## Avvisi delle immagini trattati dalla patch

- Security Definer View
- Function Search Path Mutable
- Public/Signed-in Users Can Execute SECURITY DEFINER functions, dove applicabile alle RPC Travirae
- RLS Policy Always True
- Auth RLS Initialization Plan
- Multiple Permissive Policies principali
- Unindexed Foreign Keys principali

## Avvisi non corretti automaticamente

- Leaked Password Protection Disabled: va attivato dalle impostazioni Auth di Supabase.
- Extension in Public: public.pg_net: non spostata per evitare di rompere cron/job HTTP esistenti.
- Unused Index: non rimossi perché su progetti con poco traffico possono risultare inutilizzati pur essendo necessari in futuro.

## Come applicare

Esegui in Supabase SQL Editor il file:

supabase/sql/SCRIPT_21_supabase_advisor_hardening.sql

oppure la copia nella radice:

TRAVIRAE_SUPABASE_ADVISOR_FIX.sql

Non eseguire SCRIPT_10_reset_all_data.sql.
