
# Travirae — Front‑end (Autocomplete migliorato + fallback voli)

Novità:
- **Autocomplete personalizzato**: il menu si apre **esattamente sotto** al campo, con stile coerente e navigazione tastiera (↑ ↓ Invio Esc).
- **Risoluzione IATA** da nomi città/airport.
- **Fallback voli**: se per il giorno esatto non ci sono risultati (dati cache), cerchiamo nello **stesso mese** e mostriamo una nota.
- Ordinamento risultati voli per **prezzo crescente**.

## Istruzioni
1. Sostituisci i file del sito con questa versione.
2. Il proxy rimane `https://travirae-proxy.vercel.app` (config in `js/config.js`).
3. Prova una ricerca: es. `MIL` → `LON` e date vicine; se il giorno è vuoto, vedrai opzioni del mese.
