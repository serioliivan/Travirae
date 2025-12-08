
# Travirae – Programma affiliati (note Supabase)

Queste note documentano le tabelle e viste che il frontend utilizza.
Lo schema viene gestito da Supabase / SQL, qui ci sono solo riferimenti.

## Tabelle principali

### `affiliates`

- `user_id` (`uuid`) – collegato a `auth.users.id`.
- `slug` (`text`) – Affiliate ID pubblico (es. `nome-1234`).

Il frontend:

- cerca per l'utente loggato: `select('user_id,slug').eq('user_id', user.id).limit(1)`
- se non trova nulla, inserisce: `insert({ user_id: user.id, slug }).select('user_id,slug')`

### `affiliate_clicks`

- `affiliate_slug` (`text`) – deve corrispondere a `affiliates.slug`.
- `page` (`text`) – path visitato (es. `/index.html`).
- `created_at` (`timestamptz`) – gestito da default.

Il frontend:

- quando trova `?ref=XYZ` all'ingresso del sito salva `XYZ` e inserisce una riga con `affiliate_slug` + `page`.
- viene registrata **una sola volta per browser per ogni `affiliate_slug`** grazie al cookie/localStorage `tva_aff_tracked`.

### `bookings`

- `affiliate_slug` (`text`)
- `partner` (`text`) – es. `stay22`, `aviasales`, ecc.
- `booked_at` (`timestamptz`)
- `status` (`text`) – usato nella view mensile per distinguere `confirmed` dai semplici click.
- `commission_partner` (`numeric`) – commissione netta riconosciuta a Travirae per quella prenotazione.
- altre colonne opzionali (sale_amount, currency, id, created_at, ...).

Il frontend:

- per ogni visita con ref che apre un widget partner chiama
  `traviraeAffiliate.trackBookingClick(partner)` che inserisce in `bookings`:
  `affiliate_slug`, `partner`, `status = 'click'`, `booked_at = now()`.
- questo rappresenta un **click in uscita verso il partner** (apertura mappe Stay22 o widget Aviasales),
  non la prenotazione confermata.

Queste righe **NON** entrano nei payout (perché la view considera solo `status = 'confirmed'`),
ma vengono contate nella dashboard come **"Booking totali"**.

### View `monthly_affiliate_payouts`

Definita nel tuo Supabase:

```sql
-- Statistiche mensili per Affiliate ID (tier + commissioni nette Travirae)
create or replace view public.monthly_affiliate_stats as
select
  affiliate_slug,
  date_trunc('month', booked_at)date as month,
  count() filter (where status = 'confirmed') as sales_count,
  coalesce(sum(commission_partner) filter (where status = 'confirmed'), 0) as net_commissions,
  case
    when count() filter (where status = 'confirmed') = 200 then 0.60
    when count() filter (where status = 'confirmed') = 100 then 0.55
    when count() filter (where status = 'confirmed') = 50  then 0.50
    when count() filter (where status = 'confirmed') = 20  then 0.45
    else 0.40
  end as share_percent
from public.bookings
group by affiliate_slug, date_trunc('month', booked_at);

-- Payout mensile per affiliato (solo calcolo, non pagamento)
create or replace view public.monthly_affiliate_payouts as
select
  affiliate_slug,
  month,
  sales_count,
  net_commissions,
  share_percent,
  net_commissions  share_percent as affiliate_earnings
from public.monthly_affiliate_stats;
```

Per ogni `affiliate_slug` e mese (`date_trunc('month', booked_at)`), la view espone:

- `sales_count` – numero di prenotazioni con `status = 'confirmed'`
- `net_commissions` – somma delle commissioni nette dei partner per l'affiliato
- `share_percent` – revenue share applicato (0.40, 0.45, 0.50, 0.55, 0.60)
- `affiliate_earnings` – `net_commissions * share_percent` (cioè quanto spetta all'affiliato)

La dashboard affiliato usa questa view per:

- **Guadagno totale** = somma di `affiliate_earnings`
- **Guadagno mese corrente** = somma di `affiliate_earnings` per il mese attuale
- tabella e grafico dei guadagni mensili.

La dashboard admin usa la stessa view per aggregare:

- totale vendite, commissioni nette, payout affiliati
- margine Travirae = `net_commissions - affiliate_earnings`
- riepilogo per mese e per affiliato.

