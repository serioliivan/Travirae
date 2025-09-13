
# Travirae — Front‑end v6
Miglioramenti richiesti:
- Autocomplete: selezionando un **aeroporto** l'input mostra il **nome completo** (es. “Aeroporto di Milano Linate”) e la **pillola a destra** visualizza il **codice IATA** (LIN). Nella lista i codici per gli aeroporti sono quelli **dell'aeroporto** (MXP/LIN/BGY), non il codice città (MIL).
- Barra di navigazione con tab: **Voli + Hotel** (default), **Solo Voli**, **Solo Hotel**.
- Voli: pulsante **Info** che apre un popup con i dettagli; fallback al **mese** se il giorno è vuoto.
- Paginazione lato UI: bottone **Carica altri** per voli e hotel.
- Hotel: card con **immagine/slider**, prezzo, stelle, bottone **Info**.

Proxy invariato: `https://travirae-proxy.vercel.app`.
