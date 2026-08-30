# Edge Functions (Travirae)

Questa cartella contiene **codice da usare su Supabase** (Edge Functions).  
Non è necessario pubblicarla sul sito (non contiene segreti).

## Funzione inclusa

### `import-travelpayouts`
Importa vendite/commissioni REALI da Travelpayouts (Aviasales) e fa upsert su `public.bookings`.

- Legge il token da **Supabase Secrets**: `TRAVELPAYOUTS_API_TOKEN`
- Può essere invocata:
  - da CRON (header `x-cron-secret`)
  - manualmente dall’admin (login + pulsante nel pannello admin)

⚠️ I token partner NON devono mai finire in `assets/js/*` o in HTML.


## request-payout (NEW)
Crea una richiesta di pagamento (payout) dall'area affiliati e invia una email all'admin tramite Resend.


## travelpayouts-hotel-autocomplete (NEW)

Proxy pubblico per l'autocomplete hotel/location usato dal creator panel.

- legge il token da **Supabase Secrets**: `TRAVELPAYOUTS_API_TOKEN` (opzionale ma consigliato)
- prova il lookup storico Hotellook / Travelpayouts lato server, così il token non finisce mai nel frontend
- se il provider hotel non risponde o risulta disattivato, il frontend ricade automaticamente su Aviasales Places + snapshot locale (`assets/data/travelpayouts-hotels-db.json`)

⚠️ Da deployare solo se vuoi provare anche il lookup hotel Travelpayouts lato server. Il sito continua comunque a funzionare con i fallback.



## google-hotel-autocomplete

Proxy protetto per Google Places API (New), utilizzato dalla modalità **Hotel specifico** del widget Stay22.

- Secret richiesto: `GOOGLE_PLACES_API_KEY`
- nessuna tabella e nessun SQL
- restituisce suggerimenti hotel e dettagli con indirizzo/coordinate
- la chiave Google rimane esclusivamente nei Secrets Supabase
- lascia attiva la verifica JWT: il frontend usa la chiave pubblica/anon Supabase già configurata

Guida completa: `DEPLOY_GOOGLE_PLACES_HOTEL_AUTOCOMPLETE.md`.
