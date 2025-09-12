# Travirae (Front-end)

Sito statico per GitHub Pages che cerca **voli + hotel** usando un **proxy su Vercel**.

## Configurazione rapida

1. **Decomprimi** questa cartella.
2. Apri `js/config.js` e sostituisci:
   ```js
   PROXY_BASE_URL: 'https://YOUR-VERCEL-PROJECT.vercel.app'
   ```
   con l'URL del tuo progetto Vercel (senza lo slash finale).
3. Fai il push di tutti i file nel repo **serioliivan/Travirae** (branch `main` o `gh-pages`).
4. Il sito sarà disponibile su **https://serioliivan.github.io/Travirae/**.

### Note
- Gli input *Da* e *A* richiedono codici **IATA** (es. MIL, MXP, BCN).
- I risultati e i prezzi provengono da cache Travelpayouts e **possono differire** al momento della prenotazione.