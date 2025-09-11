# Travirae — Custom Widget (GitHub Pages + API opzionale)

Questo pacchetto ti dà **due modalità**:
1. **Widget (partner)** — sempre funzionante su GitHub Pages (nessun server).
2. **On‑site (Travirae)** — il motore personalizzato con risultati sotto il form (serve una piccola **API proxy** su Netlify/Vercel).

## 1) Pubblicazione su GitHub Pages
- Crea un repo (es. `travirae-site`) e carica **tutti** i file nella **root**.
- Settings → Pages → *Deploy from a branch* → Branch **main** (root).
- Aggiungi in Travelpayouts (Tools → My websites) i domini: `https://travirae.com/` e/o `https://USERNAME.github.io/`.

## 2) Abilitare il motore **On‑site**
Su GitHub Pages le API voli dirette sono bloccate per **CORS**. Per mostrare i risultati **nel tuo sito** serve un piccolo proxy.

### Opzione A — Netlify (consigliato, 2 minuti)
1. Vai su **netlify.com** → *Add new site* → *Import an existing project* → scegli **questo** repo o carica la cartella.  
2. In **Site configuration**:
   - **Build command**: *(vuoto)*
   - **Publish directory**: `.`
3. Vai in **Site settings → Environment variables** e aggiungi:
   - `TP_API_KEY=cbd6c03b0dba76504e72be774de3657b`
   - `TP_PARTNER_MARKER=669407`
   - `TP_REFERER=https://travirae.com/`
4. Deploy. L’endpoint API sarà:
   `https://TUO-SITO.netlify.app/.netlify/functions/proxy`
5. Apri `config/app.json` del tuo sito GitHub e imposta:
   ```json
   { "API_BASE": "https://TUO-SITO.netlify.app/.netlify/functions/proxy" }
   ```
6. Ricarica la pagina → scheda **On‑site (Travirae)** funzionerà e mostrerà i prezzi **sotto il form**.

### Opzione B — Vercel
- Importa la cartella, le funzioni sono in `/api/proxy.js`.  
- Aggiungi le stesse variabili ambiente.  
- L’API sarà `https://TUO-SITO.vercel.app/api` → mettila in `config/app.json`.

## 3) Dove modificare i partner
- `config/partners.json` → marker, trs, lingua/valuta, Stay22, 12Go.
- Travelpayouts → *Tools → My websites* → aggiungi i domini per tracciare correttamente.

## 4) Come **cancellare tutti i file** attuali del repo su GitHub (via web, senza programmi)
1. Apri il tuo repo su GitHub (tab **Code**).  
2. Premi il tasto **.** (punto) sulla tastiera: si apre l’editor web `github.dev`.  
3. Nel pannello a sinistra (Explorer) seleziona **tutto** (Ctrl/Cmd+A) → **Delete** → *Commit changes*.  
4. Trascina dentro **tutti i file** di questo ZIP (estratti) → *Commit changes*.  
   > In alternativa puoi creare **un nuovo repo** e caricare direttamente questi file.

## 5) Come usare
- **Home/Flights**: scegli tra tab **Widget** (sempre attivo) o **On‑site** (dopo che hai messo `API_BASE`).  
- **Hotels**: mappa Stay22 con mini form.  
- **Transport**: deep‑link 12Go (imposta `TP_PROMO_ID_12GO` quando hai l’approvazione).

Buon lavoro! ✈️
