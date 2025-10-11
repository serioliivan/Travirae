# Stay22 — Mappa senza destinazione (barra vuota)

Questo pacchetto forza una mappa **senza destinazione preimpostata**:
- **Nessun `address`** passato
- **Nessun embed ID 'hash'** (che può incorporare una destinazione)
- **Barra di ricerca vuota**
- **Nessuna ricerca automatica** (`autoSearch=false`)
- Centro neutro: **Europa** (`lat=54`, `lng=15`) solo come inquadratura

## File
- `index.html` → versione **script** (`generic.js`). **Consigliata**: garantisce tracciamento affiliato con `data-affiliateid`.
- `alt-iframe.html` → versione **iframe** generica senza `address`.

## Istruzioni
1. Apri `index.html` e sostituisci `__AFFILIATE_ID__` con il tuo ID Stay22.
2. Carica tutto in una repo GitHub (root).
3. Abilita GitHub Pages (Settings → Pages → Deploy from a branch → `main` / root).
4. Apri l'URL e verifica che la barra di ricerca sia **vuota** e la mappa non indichi nessun luogo.

## Note
- Se vedi un luogo precompilato, significa che stai usando un **embed hash** (es. `/embed/68e8...`) che contiene una destinazione salvata. Usa i file di questo pacchetto o rimuovi l'hash.
- Estensioni di blocco (adblock/privacy) potrebbero interferire: prova in finestra anonima.
