# Travirae – Sito di viaggi (v3 con categorie immagini + carrelli + descrizioni lunghe)

**Mobile-first**, design moderno. Include:
- **Hero** con mappa Stay22 (embed `68cd1c4dc39296915ec0c753`).
- **Categorie con immagine** (Mare, Montagna, Giovani e movida, Cultura). Al click si apre una **tendina** con un **carosello orizzontale** di destinazioni (scorribile).
- **Destinazioni popolari** con bottone **“Scopri di più”** → **popup** con mappa, descrizione **3–4 righe**, punti forti, periodo, bonus.
- **Sezioni** Ispirazione e Per viaggiatori.
- **Pagina Voli** con apertura su Google Flights.

## File
- `index.html` – homepage (categorie immagine + modal).
- `flights.html` – ricerca voli.
- `assets/css/style.css` – stile responsive.
- `assets/js/main.js` – interazioni (accordion, carrelli, modal, voli, Supabase opzionale).
- `assets/img/nyc.jpg` – immagine NYC (statua della Libertà).
- `assets/img/logo.svg` – logo.
- `README.md` – questa guida.

## Modificare le immagini delle categorie
Ogni bottone categoria ha `style="--bg:url('...')"`: cambia l’URL con una tua immagine.

## Aggiungere contenuti del popup
In `assets/js/main.js` modifica `destinationsContent`. Per le città non presenti c’è un **fallback generico** con testo già formattato a 3–4 righe.

## Opzionale: contenuti su Supabase
Come nelle versioni precedenti, puoi caricare i testi su Supabase (tabella `destinations`) e impostare in `index.html`:
```html
<script>
  window.SUPABASE_URL = 'https://<PROJECT>.supabase.co';
  window.SUPABASE_ANON_KEY = '<ANON>';
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
`main.js` caricherà e sovrascriverà i contenuti statici.

## Deploy
Carica la cartella su GitHub Pages o Netlify. Su Netlify il form Newsletter funziona out‑of‑the‑box (Netlify Forms).

Buon lavoro! ✈️
