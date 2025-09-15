
# Travirae — Sito completo (Front-end)

Sito statico professionale con:
- Ricerca **Voli** (Aviasales via Travelpayouts) e **Hotel** (Stay22)
- **Autocompletamento** città/aeroporti (Travelpayouts places2)
- **Tracciamento affiliati**: salva `?ref=` e lo passa come `sub_id` (TP) / `campaign` (Stay22)
- **Hub di affiliazione** esterno (Vercel) per loggare click e fare redirect: configurabile in `js/config.js`
- **Mappa Stay22** embeddabile che si aggiorna con la ricerca

## File principali
- `index.html` — UI principale (tabs, form, embed mappa)
- `assets/styles.css` — stile moderno/dark
- `js/ref-capture.js` — salva `?ref=` per 60 giorni (cookie + localStorage)
- `js/config.js` — imposta `AFF_HUB_BASE` (URL del tuo progetto Vercel) e `STAY22_AID`
- `js/affhub.js` — funzioni `openAviasales` / `openStay22` (passano dal tuo hub)
- `js/autocomplete.js` — suggerimenti IATA (airport/city)
- `js/app.js` — logica form, tabs, embed mappa

## Configurazione
1. Apri `js/config.js` e sostituisci:
   ```js
   window.AFF_HUB_BASE = 'https://<TUO-PROGETTO-HUB>.vercel.app';
   window.STAY22_AID = 'travirae';
   ```
2. Pubblica il sito (GitHub Pages o altro hosting statico).

## Come testare le affiliazioni (click-by-click)

**Prerequisiti**: il tuo hub (repo `aff-hub-fixed`) deve essere già deployato su Vercel con le variabili ambiente impostate.

1) Apri il sito con un ref finto (simula un influencer):  
   `https://tuodominio.com/?ref=marco01`  
   → il codice viene salvato (storage/cookie).

2) Compila il form (es. `MIL` → `LON`, date vicine) e clicca **Vedi Voli**:  
   - Si apre una scheda con l’URL del tuo hub: `/api/go-tp?...&subid=marco01`  
   - L’hub logga il click e **reindirizza** su Aviasales con il tracciamento `sub_id`.

3) Clicca **Vedi Hotel**:  
   - Sotto compare la **mappa Stay22** con `aid=travirae` e `campaign=marco01`  
   - Premi **Apri Stay22**: si apre la scheda `/api/go-stay22?...&campaign=marco01` (click loggato).

4) Verifica su **Supabase**:
   - Tabella `clicks`: vedi 1–2 righe nuove (`network=TP/STAY22`, `ref=marco01`).  
   - Dopo che hai vendite **paid**, esegui l’import (cron o manuale) e controlla `conversions_tp` / `conversions_stay22`.

5) Calcolo payout: vista `aff_monthly` → colonne `revenue_paid`, `payout_rate` (per influencer), `payout_due`.

## Note
- Per Aviasales servono **IATA** (3 lettere). Se digiti testo, seleziona dalla lista per impostare il codice.
- La mappa Stay22 è un **embed**: l’attribuzione usa `aid` + `campaign`. Il bottone “Apri Stay22” passa anche dal tuo hub per il logging.
- Nessuna chiave sensibile è nel front-end (solo AID, che è pubblico).

Buon viaggio! ✈️🏨
