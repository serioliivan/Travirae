# Stay22 — Solo mappa (iframe)

Questa versione usa **solo l'iframe** con il tuo embed ID:
`https://www.stay22.com/embed/68e8fcb7f4d245d834fd42c2`

- Vista **a schermo intero**
- Centro **Europa** (lat=54, lng=15) (se ignorato dall'embed, la mappa userà il default)
- Nessuna destinazione preimpostata

## Pubblicazione su GitHub Pages
1. Crea una repo (es. `stay22-map-iframe-eu`) e carica `index.html` (e facoltativo `fallback-script.html`).
2. In **Settings → Pages**, imposta:
   - Source: `Deploy from a branch`
   - Branch: `main`, Folder: `/ (root)`
3. Apri l'URL che GitHub Pages ti mostra (es. `https://USERNAME.github.io/stay22-map-iframe-eu/`).

## Se non carica ancora
- Prova il file `fallback-script.html`, ma **inserisci il tuo `affiliateid`** (sostituisci `__AFFILIATE_ID__`).
- Verifica che l'URL di Pages sia **https** (necessario per embed).
- Disattiva temporaneamente Adblock/Privacy extensions: alcuni filtri possono bloccare domini di booking.
- Assicurati che il file si chiami **index.html** nella root della repo.
- Se usi un custom domain, controlla DNS e HTTPS (certificato attivo).

## File inclusi
- `index.html` — versione iframe (consigliata per semplicità)
- `fallback-script.html` — versione script (richiede affiliate id)
