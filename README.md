# Stay22 • Mappa (GitHub Pages)

Questo repository contiene una singola pagina (`index.html`) che incorpora la tua mappa Stay22 mantenendo invariato l'embed ID:

- `https://www.stay22.com/embed/68e0453924ecc1f8e80860e1`

## Tracking (IMPORTANTE)

- **NON cambiare** l'ID dopo `/embed/` (altrimenti perdi tracking/associazione).
- `campaign` è opzionale: se apri la pagina con `?campaign=TUO_SLUG`, lo stesso valore viene passato all'iframe.

Esempio:
- Pagina: `https://tuonome.github.io/tuorepo/?campaign=mario`
- Iframe: `.../embed/68e0453924ecc1f8e80860e1?venue=&campaign=mario`

## Destinazione vuota (placeholder)

Nel codice l'iframe viene caricato con `venue=` (vuoto) per far partire la search bar senza testo.

## Pubblicazione su GitHub Pages

1. Carica questi file in un repo GitHub
2. Settings → Pages
3. Deploy from a branch → `main` / `(root)`
