# Travirae — Full site (V7, proxy Vercel)

Questa cartella contiene **tutti i file** del sito, già pronti per GitHub Pages.  
Il front-end usa il tuo proxy Vercel configurato in `config/app.json` e negozia automaticamente il path corretto.

## File inclusi
- Pagine: `index.html`, `flights.html`, `stays.html`, `transport.html`, `deals.html`, `api-test.html`, `privacy.html`, `terms.html`, `404.html`
- Asset: `assets/css/styles.css`, `assets/js/main.js`, `assets/img/logo.svg`
- Config: `config/app.json`, `config/partners.json`
- Dati demo: `data/offers.json`
- SEO: `robots.txt`, `sitemap.xml`
- Extra: `netlify/` (placeholder), `netlify.toml`, `.nojekyll`

## Config rapida
`config/app.json` è già impostato a:
```json
{
  "API_BASE": "https://travirae-proxy.vercel.app/api/proxy",
  "CURRENCY_DEFAULT": "EUR",
  "LOCALE_DEFAULT": "it"
}
```

## Test immediato (diagnostica)
1. Apri `api-test.html` e clicca **Ping**: deve tornare `ok:true` e mostrarti `effective_base` e `style`.
2. Clic **Autocomplete “mil”** → elenco con **MXP / LIN / BGY**.
3. Clic **Ricerca MXP→LHR** → `results.length > 0`.
4. Vai su `index.html` o `flights.html` → prova la ricerca completa.

## Se vedi “Proxy offline”
- Usa `api-test.html` per vedere **tutte le URL tentate** nei log (*attempts*).
- Se necessario **Forza base** (campo manuale):
  - `Base` = la parte che precede `/api/ping` o `/ping` che hai verificato funzionare,
  - `Stile` = `api` se l'endpoint è `/api/ping`, altrimenti `direct` (endpoint `/ping`).
- Aggiorna poi **definitivamente** `config/app.json` e fai commit/push.

## Travelpayouts
- Nel proxy Vercel/Netlify devono esistere le variabili: `TP_API_KEY`, `TP_PARTNER_MARKER=669407`, `TP_REFERER=https://travirae.com/`.
- In Travelpayouts aggiungi i tuoi domini in **Tools → My websites** (sia GitHub Pages sia proxy) e attendi 5–10 minuti.

## Stay22 e 12Go
- `stays.html` usa Stay22: imposta `STAY22_AID` in `config/partners.json`.
- `transport.html` genera deep link 12Go via Travelpayouts: compila `TP_PROMO_ID_12GO`.

Versione pacchetto: V7 • Generato: 2025-09-11T19:17:11.616727Z
