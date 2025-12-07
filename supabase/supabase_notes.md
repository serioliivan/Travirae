
# Travirae – Programma affiliati (note Supabase)

Queste note documentano le tabelle e colonne che il frontend si aspetta nel progetto Supabase
per far funzionare l'area affiliati e il tracking dei referral.

> Importante: il frontend **non** crea né modifica lo schema.  
> Tutte le query assumono che le tabelle esistano già.

---

## Tabelle utilizzate

### 1. `affiliates`

- `user_id` (`uuid`) – `auth.users.id` dell'utente Supabase.
- `slug` (`text`) – Affiliate ID pubblico (es. `mario-rossi-1234`).

Query:

- `select('user_id,slug').eq('user_id', user.id).limit(1)`
- `insert({ user_id: user.id, slug }).select('user_id,slug')`

### 2. `affiliate_clicks`

- `affiliate_slug` (`text`) – deve corrispondere a `affiliates.slug`.
- `page` (`text`) – path della pagina visitata (es. `/index.html`).
- `created_at` (`timestamptz`) – gestito da default lato DB.

Query:

- `insert({ affiliate_slug, page })` quando è presente `?ref=...`.
- `select('id', { count: 'exact' }).eq('affiliate_slug', slug)` per calcolare i click.

### 3. `bookings`

- `partner` (`text`) – es. `stay22`, `aviasales`, ecc.
- `affiliate_slug` (`text`)
- `booked_at` (`timestamptz`)
- `status` (`text`)
- `currency` (`text`)
- `sale_amount` (`numeric`)
- `commission_partner` (`numeric`)
- altre colonne opzionali (`id`, `created_at`, ecc.).

> Il frontend non legge direttamente `bookings` in questa versione,  
> ma la tabella è la base per popolare `monthly_affiliate_payouts`.

### 4. `monthly_affiliate_payouts`

- `affiliate_slug` (`text`)
- `month` (`date`)
- `sales_count` (`int`)
- `net_commissions` (`numeric`)
- `share_percent` (`numeric`)
- `affiliate_earnings` (`numeric`)

Query:

- `select('month,sales_count,net_commissions,share_percent,affiliate_earnings').eq('affiliate_slug', slug).order('month', { ascending: true })`

I dati vengono usati per:

- calcolo **guadagno totale** (somma `affiliate_earnings`),
- calcolo **guadagno mese corrente**,
- tabella storico mensile,
- grafico dei guadagni mensili.

---

## Snippet Supabase lato frontend

Le pagine con integrazione Supabase includono:

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

```html
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="assets/js/affiliate-portal.js"></script>
```
