# Travirae (On-site)

Motore voli **on-site** con Travelpayouts usando **Netlify Functions** come proxy.

## Come usare
1. Metti questa cartella in un repository GitHub (o carica lo ZIP su GitHub).
2. Attiva GitHub Pages (branch `main`, folder `/ (root)`).
3. Su Netlify crea il sito (o collega il repo) e imposta **Environment variables**:
   - `TP_API_KEY` = (la tua chiave) — es: `cbd6c03b0dba76504e72be774de3657b`
   - `TP_PARTNER_MARKER` = `669407`
   - `TP_REFERER` = `https://travirae.com/` (o il tuo dominio)
4. Fai **Trigger deploy** su Netlify.
5. In `config/app.json` controlla che `API_BASE` punti al tuo endpoint Netlify:
   ```json
   {"API_BASE":"https://earnest-rolypoly-09b3bc.netlify.app/.netlify/functions/proxy"}
   ```

## Test rapidi
Apri `api-test.html` e verifica:
- **Ping** → `{ "ok": true }`
- **Autocomplete** (mil) → lista con MXP, LIN, BGY
- **Ricerca** MXP→LHR → `results[]` con tariffe

## Note
- **Autocomplete**: passa da proxy (`/api/airports/suggest`) per coerenza.
- **Ricerca prezzi**: chiama `/api/flights/search` sul proxy, che inoltra a `api.travelpayouts.com` con token/marker presi da variabili Netlify.
- Nessuna chiave è esposta nel browser.
- Se vedi `unknown_api`, vuol dire che il front-end non chiama il path `/api/...` o Netlify non ha mappato `functions` correttamente. Controlla `netlify.toml`.

## Modifiche lato provider (cosa potresti dover fare)
- **Travelpayouts**: se le chiamate prezzi danno 401/403, aggiungi il tuo dominio nella lista **Allowed websites/domains** (Tools → Websites/My websites) e verifica che il **marker 669407** sia attivo.
- **Netlify**: dopo ogni modifica alle variabili d'ambiente, fai **Deploy**. Verifica che `functions = "netlify/functions"` sia in `netlify.toml`.

Buon viaggio ✈️
