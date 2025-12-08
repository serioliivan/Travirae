
# Travirae – Programma affiliati (note Supabase)

Queste note descrivono le tabelle / viste che il frontend usa.  
Lo schema rimane gestito su Supabase, qui non vengono create migrazioni.

## Tabelle

### `affiliates`

- `user_id` (`uuid`) – collegato a `auth.users.id`
- `slug` (`text`) – Affiliate ID pubblico (es. `nome-1234`)

Il frontend:

- recupera l'affiliato corrente con  
  `select('user_id, slug').eq('user_id', user.id).limit(1)`
- se non esiste nessuna riga, ne crea una con  
  `insert({ user_id: user.id, slug }).select('user_id, slug')`

### `affiliate_clicks`

- `affiliate_slug` (`text`) – deve corrispondere a `affiliates.slug`
- `page` (`text`) – `window.location.pathname`
- `created_at` (`timestamptz`) – gestito da default sul DB

Il frontend inserisce una riga ogni volta che l'URL contiene `?ref=`:

```js
supabaseClient
  .from('affiliate_clicks')
  .insert({ affiliate_slug: ref, page: window.location.pathname })
```

### `bookings`

Colonne usate dal frontend:

- `affiliate_slug` (`text`)
- `partner` (`text`) – ad esempio `stay22` o `aviasales`
- `status` (`text`) – per i click tracciati dal frontend viene valorizzato a `'click'`
- `booked_at` (`timestamptz`)

Ogni volta che l'utente apre un widget partner con un Affiliate ID valido, il frontend chiama:

```js
window.traviraeAffiliate.trackBookingClick('stay22'); // o 'aviasales'
```

che inserisce:

```js
{ affiliate_slug: 'ID', partner: 'stay22', status: 'click', booked_at: now() }
```

Questi record sono contati come **"Booking totali"** nella dashboard affiliato.  
Le prenotazioni effettivamente confermate (dati reali dei partner) vanno inserite lato server / ETL
nella stessa tabella `bookings` con `status = 'confirmed'` e `commission_partner` > 0.

### View `monthly_affiliate_payouts`

La vista (che hai già su Supabase) calcola per ogni `affiliate_slug` e mese:

- `month` (`date`)
- `sales_count` – numero di prenotazioni con `status = 'confirmed'`
- `net_commissions` – somma delle commissioni nette per l'affiliato
- `share_percent` – revenue share applicato (0.40, 0.45, 0.50, 0.55, 0.60)
- `affiliate_earnings` – quota spettante all'affiliato: `net_commissions * share_percent`

La dashboard affiliato usa questa view per:

- **Guadagno totale** = somma di `affiliate_earnings`
- **Guadagno mese corrente** = somma di `affiliate_earnings` del mese corrente
- tabella + grafico mensili.

Il pannello admin (`admin-affiliati.html`) aggrega la stessa view per:

- Totale vendite confermate, commissioni nette e payout affiliati
- Guadagno totale Travirae = `net_commissions - affiliate_earnings`
- Riepilogo per mese e per affiliate.
