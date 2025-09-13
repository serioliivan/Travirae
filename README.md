
# Travirae — Front‑end v7
- Autocomplete: nell'input si vede **il nome dell'aeroporto**; pillolina a destra con **codice IATA**. I suggerimenti mostrano il codice dell'**aeroporto** (MXP/LIN/BGY), non il codice città (MIL).
- Ricerca voli: quando selezioni un **aeroporto**, per massimizzare i risultati la chiamata all'API usa il **codice città** (es. MIL/LON) — come su Aviasales — mentre la UI mantiene il codice aeroporto nella pillola.
- Fallback intelligente: se il giorno è vuoto → prova ±2 giorni; se ancora vuoto → mese.
- Slider hotel: frecce **più piccole**; tenta più **foto reali** (`h{hotelId}_1..6`) con fallback.
- Paginazione: **Carica altri** sia in modalità singola che in **Voli + Hotel**.
