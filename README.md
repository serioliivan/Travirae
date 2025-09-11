# Travirae — Full site (V5, Vercel proxy)

Questo pacchetto include **tutto**: pagine statiche, CSS/JS, dati di esempio, configurazioni e diagnostica.
Il front‑end usa il **tuo proxy Vercel** (`config/app.json`) e negozia automaticamente il path corretto.

## File principali
- `index.html`, `flights.html` → ricerca voli on‑site (autocomplete + risultati)
- `stays.html` → mappa Stay22 con mini form (usa `config/partners.json`)
- `transport.html` → deep link 12Go via Travelpayouts click
- `deals.html` + `data/offers.json` → vetrina offerte
- `api-test.html` → diagnostica (Ping / Autocomplete / Ricerca) con log dei tentativi
- `assets/css/styles.css`, `assets/js/main.js`, `assets/img/logo.svg`
- `config/app.json` (API_BASE = https://travirae-proxy.vercel.app/api/proxy)
- `config/partners.json` (marker/campaign)
- `robots.txt`, `sitemap.xml`, `privacy.html`, `terms.html`, `404.html`

## Test rapido
1. Carica lo ZIP su GitHub Pages (sostituisci i file).
2. Apri `api-test.html` e clicca in ordine **Ping**, **Autocomplete**, **Ricerca**.
3. Se tutto OK, prova la ricerca da `index.html` o `flights.html`.

## Checklist “Proxy offline”
1. Apri `api-test.html` → **Ping**. Nel riquadro *attempts* vedi le URL testate. Almeno una deve dare `{ ok:true }`.
2. Se tutte falliscono, apri manualmente:
   - `https://travirae-proxy.vercel.app/api/proxy/api/ping`
   - `https://travirae-proxy.vercel.app/api/proxy/ping`
   - `https://travirae-proxy.vercel.app/api/ping`
3. Quella che risponde **OK** determina come impostare `API_BASE` in `config/app.json`:
   - se è `.../api/proxy/api/ping` → `API_BASE = https://travirae-proxy.vercel.app/api/proxy`
   - se è `.../api/proxy/ping` → `API_BASE = https://travirae-proxy.vercel.app/api/proxy`
   - se è `.../api/ping` → `API_BASE = https://travirae-proxy.vercel.app/api`
4. Salva `config/app.json`, aggiorna GitHub Pages e riprova `api-test.html`.
5. **401/403** sulla ricerca: controlla su Vercel/Netlify le variabili `TP_API_KEY`, `TP_PARTNER_MARKER`, `TP_REFERER` e la whitelist domini in Travelpayouts.
6. **429**: rate-limit; riprova più tardi. **Bad JSON**: il proxy sta restituendo HTML/redirect; apri la URL richiesta per leggere l’errore.

## Note
- Nessun widget Aviasales: tutto on‑site; deeplink affiliato con `marker=669407`.
- Stays/Transport sono opzionali e già pronti: cambiali da `config/partners.json`.
