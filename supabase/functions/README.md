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
