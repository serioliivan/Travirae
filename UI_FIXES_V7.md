# UI fixes v7

Modifiche incluse:

- popup post pubblici: rimosso l'effetto di doppio bordo
- popup post pubblici: barra di scorrimento spostata a sinistra del pulsante X
- widget Stay22 nei post: pulsante "Apri Hotel Map" centrato
- dashboard affiliato: box "Saldo disponibile" reso un riquadro ordinato con badge pill
- area profilo creator: pannelli `Profilo creator`, `Profilo pubblico`, `Statistiche private creator` e `I miei post` allineati alla stessa larghezza

## SQL

Per questa versione **non serve eseguire nuovo SQL**.

## Verifica logica soldi affiliati

Controllo statico nel codice:

- `monthly_affiliate_stats` conta solo `bookings.status = 'confirmed'`
- `affiliate_earnings = net_commissions * share_percent`
- `affiliate_balances.available_balance_usd = total_earnings_usd - paid_total_usd - reserved_total_usd`
- `reserved_total_usd` include payout `pending` e `approved`

File controllati:

- `supabase/sql/SCRIPT_05_views_refresh.sql`
- `supabase/sql/SCRIPT_07_payouts_balances.sql`
- `supabase/sql/SCRIPT_17_affiliate_sales_attribution_audit.sql`

Per una verifica live dei dati reali resta valido `SCRIPT_17_affiliate_sales_attribution_audit.sql` già eseguito su Supabase.
