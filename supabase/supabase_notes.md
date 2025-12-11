# Travirae – Programma affiliati (note Supabase)

Queste note descrivono quali tabelle e colonne il frontend si aspetta di trovare.

## Tabella `affiliates`

- `user_id` (uuid) – collegato a `auth.users.id`
- `slug` (text) – Affiliate ID pubblico usato nei link `?ref=slug`

La pagina Area Affiliati:

- seleziona `affiliates` filtrando per `user_id = user.id`
- se non trova nulla, inserisce una riga `{ user_id, slug }` generando uno slug tipo `nomeemail-1234`

## Tabella `affiliate_clicks`

- `affiliate_slug` (text)
- `page` (text)
- `created_at` (timestamptz, default now())

Il frontend inserisce una riga quando un utente entra nel sito con `?ref=slug`;
per ogni browser/affiliate registra un solo "landing click" usando cookie/localStorage.

## Tabella `bookings`

- `affiliate_slug` (text)
- `partner` (text) – es. `stay22`, `aviasales`
- `status` (text) – per i click tracciati dal frontend viene impostato a `'click'`
- `booked_at` (timestamptz)
- eventuali altre colonne: `sale_amount`, `commission_partner`, `currency`, ecc.

Il frontend usa `window.traviraeAffiliate.trackBookingClick(partner)` per inserire righe "click"
(in uscita verso Stay22 / Aviasales) con:

- `affiliate_slug`: letto dal cookie/link `?ref=`
- `partner`: stringa (`stay22` o `aviasales`)
- `status`: `'click'`
- `booked_at`: `now()`

Questi dati vengono contati come "Booking totali" nella dashboard affiliato.

## View `monthly_affiliate_payouts`

La view calcola le metriche mensili per ogni affiliate:

- `affiliate_slug`
- `month` (date)
- `sales_count` (int) – numero di prenotazioni confermate
- `net_commissions` (numeric) – commissioni nette riconosciute a Travirae
- `share_percent` (numeric) – revenue share applicato all'affiliato (0.40, 0.45, 0.50, 0.55, 0.60)
- `affiliate_earnings` (numeric) – quota spettante all'affiliato

La dashboard affiliato somma `affiliate_earnings` per:

- "Guadagno totale"
- "Guadagno mese corrente"

La dashboard admin somma:

- `sales_count`, `net_commissions`, `affiliate_earnings`
- il margine Travirae come `net_commissions - affiliate_earnings`
per tutti gli affiliati e per i singoli affiliati.
