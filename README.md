# Stay22 - Embed (GitHub Pages)

Questo mini-sito incorpora un widget Stay22 mantenendo **invariato** l'embed ID e (opzionalmente) inoltrando il parametro `campaign`.

## Tracking (IMPORTANTISSIMO)
- **NON cambiare** l'embed ID (la parte dopo `/embed/`).
- Se usi `campaign` per sub-tracking sul tuo sito, non cambiarne significato e non rimuoverlo: qui viene letto dalla URL della pagina e passato all'iframe.

## Campo destinazione: vuoto (senza testo)
Per evitare che compaia una destinazione precompilata (es. “Dubai ...”), `script.js` imposta:
- `venue` a uno **zero-width space** (carattere invisibile). La barra resta senza testo.

## Sub-tracking
Apri la pagina con:
`?campaign=TUO_SLUG`

Esempio:
`https://tuonome.github.io/tuorepo/?campaign=mario`

## Pubblicazione su GitHub Pages
1. Carica questi file nella root del repo
2. Settings → Pages → Deploy from a branch → `main` / `(root)`
