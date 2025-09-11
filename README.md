# Travirae — Front-end on-site (Vercel proxy)

Questa build usa **solo** il tuo proxy Vercel:

```
API_BASE = https://travirae-proxy.vercel.app/api/proxy
```

Il front‑end negozia automaticamente il path corretto e chiama **sempre**:
- `GET {effective}/api/ping`
- `GET {effective}/api/airports/suggest?q=...&locale=...`
- `GET {effective}/api/flights/search?origin=...&destination=...&depart=...&return=...&currency=EUR&limit=10`

Dove `{effective}` è l’`API_BASE` elaborato per evitare errori di percorso (es. `/api/proxy/api/ping` vs `/api/ping`).

## Test immediato
1. Carica tutti i file su GitHub Pages (root del repo).
2. Apri `api-test.html` e clicca in ordine:
   - **Ping** → deve restituire `{ ok: true }` e mostrare l’`effective_base` che sta usando.
   - **Autocomplete** → “mil” deve includere `MXP, LIN, BGY`.
   - **Ricerca** → `MXP → LHR` su una data tra 2–4 settimane → `results.length > 0`.
3. Vai in home o `flights.html`, prova la ricerca completa: vedrai le **cards** con pulsante **Book** (deeplink affiliato).

## Note
- Nessun widget Aviasales/iframe; tutto on‑site.
- Le chiavi non sono mai esposte nel browser.
- UI ispirata ad Aviasales (input arrotondati, dropdown, focus ring, cards prezzo).
