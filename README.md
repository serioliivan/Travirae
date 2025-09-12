# Travirae — Front‑end con Autocomplete IATA

Questa versione **risolve** l'errore “destination/origin length must be between 2 and 3”:
- Gli utenti possono scrivere **nomi città** (es. *Milano*, *Valencia*).
- Il front‑end usa l'endpoint pubblico di **Travelpayouts Autocomplete** per ricavare il **codice IATA** automaticamente.
- Se l'utente inserisce già un IATA (3 lettere), lo accettiamo al volo.

## Cosa fare
1. Sostituisci tutti i file del sito con questi (repo `serioliivan/Travirae`).
2. Niente modifiche al proxy: puntiamo a `https://travirae-proxy.vercel.app` in `js/config.js`.
3. Prova: digita “Milano” → “Valencia”, imposta le date e clicca **Cerca**.

> Nota: l'autocomplete usa `https://autocomplete.travelpayouts.com/places2` (pubblico, senza token).