# Google Places hotel autocomplete

## Implementato

- Un solo campo nella modalità `Hotel specifico`.
- Autocomplete mondiale con nome struttura e località su due righe.
- Google Places API (New) chiamata esclusivamente tramite Supabase Edge Function.
- Chiave Google letta dal Secret `GOOGLE_PLACES_API_KEY` e mai esposta nel frontend.
- Selezione obbligatoria di una struttura dall’elenco.
- Recupero di indirizzo, latitudine e longitudine con Place Details (New).
- Passaggio a Stay22 di `hotelname`, `address`, `lat`, `lng`, date, ospiti, lingua, valuta e tracking esistente.
- Attribuzione `Google Maps` nella tendina dei risultati.
- Debounce, annullamento delle richieste precedenti, token di sessione, tastiera e stati caricamento/errore.
- Traduzioni sulle 9 homepage.
- Nessuna modifica a tabelle, RLS, autenticazione o dati Supabase.

## Deploy richiesto

Seguire `DEPLOY_GOOGLE_PLACES_HOTEL_AUTOCOMPLETE.md` per:

1. salvare il Secret Google;
2. pubblicare `google-hotel-autocomplete`;
3. caricare il sito aggiornato.
