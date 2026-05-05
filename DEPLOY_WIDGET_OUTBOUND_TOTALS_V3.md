# Deploy — widget outbound totals v3

Questa versione aggiunge:
- card **Click widget outbound (totale sito + post)** nell'area affiliati
- box centrale **Saldo disponibile**
- KPI admin per **click widget outbound attribuiti** e **saldo affiliati disponibile**
- colonna admin **Click widget outbound** nella tabella operativo affiliati

## Cosa devi fare

### 1) GitHub / hosting
Carica i file aggiornati del progetto e fai il deploy come al solito.

### 2) Supabase SQL Editor — necessario per i nuovi totali outbound
Esegui questo script nel SQL Editor di Supabase:

- `supabase/sql/SCRIPT_14_widget_outbound_totals.sql`

Senza questo script:
- la nuova card affiliato dei **click widget outbound totali** può mostrare solo il fallback dei click creator
- i nuovi KPI/admin widget outbound possono restare a `0`

## Cosa fa lo script SQL
- crea la RPC `get_affiliate_widget_outbound_totals`
- aggiorna la view `admin_affiliate_overview`
- somma i click widget outbound attribuiti all'affiliato:
  - dai **post creator**
  - dal **resto del sito** quando esiste `ref_affiliate_slug`

## Serve altro fuori da GitHub?
Sì, per questa versione serve anche Supabase:
- **GitHub da solo non basta** per i nuovi totali outbound site-wide
- devi fare **GitHub + script SQL 14**
