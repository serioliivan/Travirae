# Travirae – Programma affiliati (note Supabase)

Questa cartella serve come **promemoria** per la parte Supabase del sito Travirae.

✅ **Importante**
- I token partner (Travelpayouts / Stay22) **NON devono mai finire nel frontend** (`assets/js/*` o HTML).
- I token vanno messi in **Supabase → Edge Functions → Secrets**.
- Il sito statico fa tracking pubblico di **landing affiliate, pageview e traffico**. Le **vendite reali** arrivano da import server-side.
- Da questa versione il tracking dei **booking click** è disattivato nel frontend e i widget non usano più overlay invisibili.

---

## 1) Cosa fa già il frontend (pubblico, versione aggiornata)

### Affiliate ID `?ref=SLUG`
- Letto dalla query string `?ref=...` in tutto il sito.
- Sanitizzazione: solo `[a-zA-Z0-9_-]`.
- Salvato in:
  - cookie `tva_aff` (30 giorni, `path=/`)
  - `localStorage` (`tva_aff`) se disponibile
- Helper globale:
  - `window.traviraeAffiliate.getId()`
  - `window.traviraeAffiliate.trackBookingClick(partner)` **esiste solo come no-op legacy** per compatibilità: non salva più righe `status='click'`.

### Click totali (tabella `public.affiliate_clicks`)
- Inserisce **1 riga per sessione/pagina** quando l’utente entra con `?ref=SLUG`.
- Deduplica via `sessionStorage` (`tva_landing_logged_<slug>_<path>`).
- Payload:
  - `affiliate_slug`
  - `page`
  - `user_agent` (se colonna presente)

### Booking click / booking totali (deprecati)
Il frontend aggiornato **non registra più** booking click in `public.bookings` con `status='click'`.

Questo significa che:
- Stay22 e Aviasales non hanno più overlay invisibili o intercettazioni del primo click
- i widget aprono direttamente il partner
- le dashboard si basano su **landing affiliate**, **visite/pageview** e **vendite confermate** importate dai partner

Le eventuali righe storiche `status='click'` restano nel database finché non decidi di rimuoverle manualmente.

---

## 2) Come ottenere vendite reali + commissioni reali

### Perché serve un backend
I partner (Travelpayouts/Aviasales, Stay22) **non inviano le commissioni reali al browser**.
Il browser può contare i click, ma non può sapere:
- se l’utente ha veramente acquistato,
- quanto è la commissione,
- quando è stata confermata.

Quindi la strada corretta è:
1) Sito → salva click/intent
2) **Edge Function** → importa conversioni reali dai partner
3) Postgres → salva conversioni come `status='confirmed'` + `commission_partner`
4) View/query live + import partner → aggiornano la dashboard. La funzione `refresh_monthly_affiliate_payouts()` rimane utile solo per compatibilità con gli snapshot legacy.

### Cosa trovi già pronto in questo ZIP
- `supabase/functions/import-travelpayouts/index.ts`  
  Edge Function che importa conversioni **Aviasales** da Travelpayouts e fa upsert su `public.bookings`.
- `supabase/sql/`  
  Script SQL già divisi per ordine (01 → 06).

---

## 3) Segreti (token) – dove metterli
In Supabase Dashboard:
- **Edge Functions → Secrets**
  - `TRAVELPAYOUTS_API_TOKEN` = (il tuo token Travelpayouts)
  - `TRAVIRAE_CRON_SECRET` = (una stringa lunga scelta da te, es. `tva_cron_...`)
  - (opzionale futuro) `STAY22_REPORT_TOKEN` = (report token Stay22)

⚠️ Non incollare mai questi valori in `assets/js/*` o in HTML.

---

## 4) Scheduling / “tempo reale”
Il “vero realtime” dipende dal partner: spesso le conversioni passano da **pending → paid** in ore/giorni.
Quello che facciamo noi è **import periodico** (es. ogni 6 ore), quindi “quasi realtime”.

Due modi:

### A) Metodo consigliato (automatico con pg_cron + pg_net)
Usa lo script:
- `supabase/sql/SCRIPT_06_cron_import_travelpayouts.sql`

### B) Metodo manuale (senza CRON)
- Vai nel pannello admin `admin-affiliati.html`
- Premi:
  - **Importa vendite Aviasales** oppure **Importa Stay22 CSV**
  - **Ricarica dati**

---

## 5) Fix errori SQL che hai visto
Se ti usciva:
- `function public.travirae_share_percent(bigint) does not exist`
- `function public.refresh_monthly_affiliate_payouts() does not exist`

Significa che:
- mancava la funzione su tipo `bigint` (count(*) in Postgres è bigint)
- quindi lo script della view/refresh non è riuscito a creare la funzione di refresh

Soluzione: esegui gli script nell’ordine indicato:
1) SCRIPT_01
2) SCRIPT_02
3) SCRIPT_03
4) SCRIPT_04
5) SCRIPT_05
