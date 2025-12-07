# Travirae – Note integrazione Supabase (frontend)

Queste note descrivono **solo** ciò che il frontend si aspetta di trovare in Supabase.
Non modificano lo schema remoto e non includono migrazioni.

## Tabelle utilizzate

### 1. `affiliates`

Utilizzata in `area-affiliati.html` per associare ogni utente autenticato
al proprio codice affiliato (slug).

Colonne usate dal frontend:

- `user_id` (`uuid`) – deve corrispondere a `auth.users.id`
- `slug` (`text`) – identificativo affiliato pubblico, usato in `?ref=SLUG`

Altre colonne possono esistere ma non sono usate qui.

Lato frontend:

- Se non esiste una riga con `user_id = user.id`, ne viene creata una con uno `slug`
  generato a partire dall'email (es: `nomeemail-1234`).

### 2. `affiliate_clicks`

Tracciamento dei click affiliati, gestito in `assets/js/main.js`.

Colonne usate dal frontend:

- `affiliate_slug` (`text`) – slug affiliato (stesso formato di `affiliates.slug`)
- `page` (`text`) – path e query string visitata (es. `/flights.html?ref=test123`)
- `created_at` (`timestamptz`, opzionale) – può essere gestito da default `now()`

Il frontend inserisce una riga per ogni pageview quando è presente un `?ref=SLUG`
o quando esiste un cookie `tva_aff`.

### 3. `bookings`

Usata solo indirettamente: non viene interrogata dal frontend in questa versione,
ma si assume una struttura simile alla seguente:

- `partner` (`text`) – es. `stay22`, `travelpayouts`, ecc.
- `affiliate_slug` (`text`)
- `booked_at` (`timestamptz`)
- `status` (`text`)
- `currency` (`text`)
- `sale_amount` (`numeric`)
- `commission_partner` (`numeric`)
- eventuali altre colonne di dettaglio

I dati di questa tabella possono essere aggregati a livello backend
per popolare `monthly_affiliate_payouts`.

### 4. `monthly_affiliate_payouts`

Tabella aggregata per mostrare le statistiche nella dashboard affiliati.

Colonne usate dal frontend:

- `affiliate_slug` (`text`)
- `month` (`date`) – tipicamente il primo giorno del mese (es. `2024-08-01`)
- `sales_count` (`int`) – numero di vendite attribuite all'affiliato nel mese
- `net_commissions` (`numeric`) – totale commissioni nette generate
- `share_percent` (`numeric`) – percentuale di revenue share riconosciuta all'affiliato
- `affiliate_earnings` (`numeric`) – quota spettante all'affiliato per il mese

La dashboard:

- somma `affiliate_earnings` per calcolare il **guadagno totale**
- somma `affiliate_earnings` del mese corrente (in base a `month`) per il **guadagno mese corrente**
- utilizza i valori mensili per compilare la tabella e il grafico lineare.

## Autenticazione

Lato client viene utilizzato:

- `supabase.auth.signUp` con `emailRedirectTo` impostato a  
  `https://travirae.com/area-affiliati.html?email_confirmed=1`
- `supabase.auth.signInWithPassword` per login
- `supabase.auth.resetPasswordForEmail` con `redirectTo`  
  `https://travirae.com/area-affiliati.html?mode=recovery`
- `supabase.auth.updateUser` per cambiare password in modalità recovery
- `supabase.auth.signOut` per il logout

Le chiavi utilizzate sono:

- `SUPABASE_URL = {SUPABASE_URL}`
- `SUPABASE_ANON_KEY = {SUPABASE_ANON_KEY}`

> Importante: queste note **non** richiedono modifiche allo schema esistente.
> Lo schema deve già essere compatibile con i campi indicati.
