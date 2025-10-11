# Stay22 — Solo Mappa (Europa, nessuna destinazione)

Questo è un sito **minimale** (una sola pagina) che mostra **solo** una mappa Stay22:
- **Nessuna destinazione preimpostata**
- **Centro generico Europa** (`lat=54`, `lng=15`)
- **Nessuna ricerca automatica** all'avvio

## Come usare

1. Apri `index.html` e **sostituisci** `__AFFILIATE_ID__` con il tuo **ID affiliato Stay22**.
2. Carica i file su GitHub in una nuova repo (es. `stay22-map-site`).  
3. Attiva **GitHub Pages** dalla repo: Settings → Pages → Source: `GitHub Actions` o `main / root`.  
4. Apri l'URL di Pages per vedere la mappa a schermo intero.

> **Nota**: Se vuoi usare l'`<iframe>` al posto dello script ufficiale, c'è un esempio commentato nel file.
> Con l'iframe non sempre l'ID affiliato è garantito in modo esplicito su embed "hash"; per sicurezza la variante script è consigliata.

## Personalizzazioni rapide
- **Centratura**: cambia `data-lat` e `data-lng` nel `div#stay22-map`.
- **Avvio ricerca**: imposta `data-auto-search="true"` se vuoi che avvii la ricerca automaticamente.
- **Altezza**: la mappa è a schermo intero (`100vh`). Modifica gli stili in `<style>` se vuoi un'altezza fissa.

## Troubleshooting
- Se non vedi nulla, controlla la console del browser. Assicurati che JavaScript sia abilitato.
- Verifica di aver inserito correttamente il tuo `affiliateid`.
