# Travirae — On‑site flights engine (GitHub Pages + Netlify proxy)

Questa build elimina qualsiasi widget/iframe e mostra i **risultati direttamente nella pagina**.
Lato server usiamo una **Function Netlify** (già online) per proteggere la chiave e risolvere il **CORS**.

## Architettura (scelte tecniche)
- Front‑end **statico** (GitHub Pages) → `HTML/CSS/JS` puro, nessuna chiave esposta.
- Autocomplete → `GET {API_BASE}/api/airports/suggest` (bridge su Travelpayouts *places2*).
- Prezzi voli → `GET {API_BASE}/api/flights/search` (bridge su Travelpayouts v3 *prices_for_dates*; fallback a *prices_for_month*).
- Deeplink affiliato generato dal proxy: **Aviasales** con `marker=669407` e parametri ricerca.
- Header verso Travelpayouts: `X-Access-Token`, `X-Partner-Marker`, `Referer`, `User-Agent: travirae/1.0`.
- CORS → `Access-Control-Allow-Origin: *` (sola lettura, sicuro per GET).
- UX → stile ispirato ad Aviasales: input arrotondati, dropdown puliti, cards risultato, banner errori, spinner, empty state, focus ring accessibile.

## File principali
- `index.html` – form (Origin/Destination/Depart/Return/Passengers) + risultati on‑site.
- `assets/css/styles.css` – tema scuro/blu, focus ring, dropdown, cards.
- `assets/js/main.js` – carica `config/app.json`, esegue ping, autocomplete (debounce 220ms), submit, rendering, gestione errori.
- `config/app.json` – **già configurato**:
  ```json
  {
    "API_BASE": "https://earnest-rolypoly-09b3bc.netlify.app/.netlify/functions/proxy",
    "CURRENCY_DEFAULT": "EUR",
    "LOCALE_DEFAULT": "it"
  }
  ```
- `netlify/functions/proxy.js` – implementa **ESATTAMENTE**:
  - `GET /api/ping` → `{ ok:true, ts }`
  - `GET /api/airports/suggest?q=<term>&locale=<it|en>` → bridge a *places2* → `{ ok:true, items:[{name,iata,type,country}] }`
  - `GET /api/flights/search?origin=XXX&destination=YYY&depart=YYYY-MM-DD&return=YYYY-MM-DD&currency=EUR&limit=10`
     → bridge a *v3/prices_for_dates* (fallback *prices_for_month*) →
     ```json
     { "ok": true, "currency": "EUR",
       "results":[
         {"price":123,"origin":"MXP","destination":"LHR","depart_date":"2025-10-10","return_date":null,"changes":0,"deeplink":"https://www.aviasales.com/search?marker=669407&..."}
       ]
     }
     ```
- `api-test.html` – pagina diagnostica con 3 pulsanti (Ping, Autocomplete “mil”, Ricerca MXP→LHR) che mostra HTTP status + JSON prettificato.
- `netlify.toml`
  ```toml
  [build]
    publish = "."
    functions = "netlify/functions"
  ```

## Come testare (checklist rapida)
1) **Ping**  
   Apri `api-test.html` → premi *Ping* → deve mostrare `{ "ok": true }` (Status **200**).
2) **Autocomplete**  
   *Autocomplete “mil”* → deve elencare **MXP / LIN / BGY** (Status **200**).
3) **Ricerca**  
   *Ricerca MXP→LHR* → results[].length > 0 (Status **200**). In caso di 0 risultati, prova altre date più avanti.
4) **Form principale**  
   In `index.html`, digita *MIL* e *LHR*, scegli le date, *Search* → vedi cards prezzo con bottone **Book** (apre Aviasales in nuova scheda con `marker=669407`).

## Risoluzione errori comuni
- **unknown_api** → il front‑end ora usa **sempre** i path `${API_BASE}/api/...`. Se lo vedi in `api-test.html`, il tuo proxy non ha la funzione o la route corretta; ma qui è già ok.
- **401/403** al search → verifica su Netlify che le variabili `TP_API_KEY`, `TP_PARTNER_MARKER`, `TP_REFERER` siano impostate e rilancia il deploy. In Travelpayouts aggiungi il dominio del proxy tra i **Websites/Allowed domains** e attendi propagazione.
- **429** → limite superato (troppi test ravvicinati); riprova più tardi.
- **CORS** → il client non chiama mai domini Travelpayouts diretti, solo il tuo proxy.
- **Deeplink** → se vuoi usare il dominio click Travelpayouts (`c1.travelpayouts.com`), posso adattare il proxy; attualmente usiamo Aviasales con `marker=669407` conforme.

## Come aggiornare API_BASE
- Modifica `config/app.json` nel repo; niente rebuild necessario. L’app legge questo file ad ogni refresh.

## Piano di regressione (edge cases previsti)
- Autocomplete senza risultati → dropdown nascosto dopo 2 char; input conserva focus ring.
- Date malformate → validazione lato client + server ignora ritorno se vuoto.
- Prezzi vuoti dal provider → fallback a `prices_for_month` con prima data utile del mese selezionato.
- JSON malformato dal proxy → banner rosso “Bad JSON” (con status se disponibile).

## Come sostituire i file su GitHub in blocco
1. Apri il tuo repo, premi **.** (punto) → si apre l’editor web `github.dev`.
2. **Seleziona tutti i file** esistenti (Ctrl/Cmd+A) → **Delete** → *Commit changes*.
3. Trascina i file di questo ZIP nella root dell’editor → *Commit changes*.
4. Attendi GitHub Pages (1–2 minuti) e ricarica.

Buon viaggio con Travirae ✈️
