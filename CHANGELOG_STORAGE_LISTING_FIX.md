# Changelog — Storage Listing Fix

Aggiunto/aggiornato `SCRIPT_22_storage_public_listing_fix.sql`.

Modifiche:

- Rimossa la lettura/lista pubblica ampia sui bucket `influencer-avatars` e `influencer-post-media`.
- Mantenuti i bucket pubblici per non rompere le immagini del sito.
- Aggiunta una policy `SELECT` solo per utenti autenticati nella propria cartella `auth.uid()/...`.
- Aggiornato `SCRIPT_12_influencer_storage_policies.sql` per nuove installazioni future.

Risultato atteso: dopo il run e il refresh del Security Advisor, i warning `Public Bucket Allows Listing` dovrebbero sparire.
