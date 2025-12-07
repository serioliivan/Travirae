# Travirae – Programma affiliati (note Supabase)

Queste note documentano quali tabelle e colonne il frontend si aspetta di trovare nel progetto Supabase
per far funzionare l'area affiliati e il tracking dei referral.

> ⚠️ Importante: il frontend **non** modifica lo schema.  
> Tutte le query assumono che le tabelle e le colonne esistano già.

---

## Tabelle utilizzate

### 1. `affiliates`

Utilizzata per collegare un utente autenticato ad uno `slug` univoco che funge da **Affiliate ID**.

Colonne minime attese:

- `user_id` (`uuid`) – `auth.users.id` dell'utente
- `slug` (`text`) – identificativo pubblico dell'affiliato (es. `mario-rossi-1234`)
- eventuali altre colonne opzionali (es. `created_at`, `display_name`, ecc.)

Query effettuate:

- `select('user_id,slug').eq('user_id', user.id).limit(1)`
- `insert({ user_id: user.id, slug })` + `.select('user_id,slug')`

---

### 2. `affiliate_clicks`

Log di ogni click registrato su un link contenente il parametro `?ref=`.

Colonne minime attese:

- `affiliate_slug` (`text`) – deve corrispondere a `affiliates.slug`
- `page` (`text`) – path della pagina visitata (es. `/flights.html`)
- `created_at` (`timestamptz`) – timestamp della registrazione (gestito di solito da default `now()`)

Query effettuate:

- `insert({ affiliate_slug, page })` quando è presente `?ref=...` nella URL
- `select('id', {{ count: 'exact' }}).eq('affiliate_slug', slug)` per calcolare il numero totale di click

---

### 3. `bookings`

Tabella operativa con le singole prenotazioni ricevute dai partner (hotel / voli).

Colonne attese (minime):

- `partner` (`text`) – es. `stay22`, `aviasales`, ecc.
- `affiliate_slug` (`text`) – slug affiliato associato alla prenotazione
- `booked_at` (`timestamptz`)
- `status` (`text`) – es. `pending`, `approved`, `rejected`
- `currency` (`text`) – es. `USD`, `EUR`
- `sale_amount` (`numeric`) – valore lordo della prenotazione
- `commission_partner` (`numeric`) – commissione riconosciuta dal partner a Travirae
- eventuali altre colonne (`id`, `created_at`, `meta`, ...)

> Al momento la dashboard non interroga direttamente `bookings`,  
> ma la tabella è alla base dei calcoli che alimentano `monthly_affiliate_payouts`.

---

### 4. `monthly_affiliate_payouts`

Sintesi mensile dei risultati per ogni affiliato.

Colonne attese:

- `affiliate_slug` (`text`)
- `month` (`date`) – tipicamente il primo giorno del mese (es. `2025-01-01`)
- `sales_count` (`int`) – numero di vendite valide nel mese
- `net_commissions` (`numeric`) – commissioni nette totali generate nel mese
- `share_percent` (`numeric`) – percentuale di revenue share applicata (es. `40`, `50`, `60`)
- `affiliate_earnings` (`numeric`) – importo da riconoscere all'affiliato per il mese

Query effettuate:

- `select('month,sales_count,net_commissions,share_percent,affiliate_earnings').eq('affiliate_slug', slug).order('month', {{ ascending: true }})`

I dati ottenuti vengono usati per:

- calcolare il **guadagno totale** (somma di `affiliate_earnings`)
- calcolare il **guadagno del mese corrente**
- popolare la tabella "Storico payout mensili"
- costruire il grafico dei **guadagni mensili** con Chart.js

---

## Client Supabase lato frontend

Tutte le pagine principali che devono interagire con Supabase includono:

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
<script>
const SUPABASE_URL = 'https://qihaslaxdfwounujpeuf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFpaGFzbGF4ZGZ3b3VudWpwZXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5MTMsImV4cCI6MjA4MDYwNzkxM30.scqVi4SjN76Oqr3FVtHt5OZWcn8Zh7LyTgU-H4bNEdo';
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
</script>
<script src="assets/js/main.js"></script>
```

L'`area-affiliati.html` aggiunge inoltre:

- `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`
- `<script src="assets/js/affiliate-portal.js"></script>`
