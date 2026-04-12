# Travirae — Setup click‑by‑click (Supabase + Affiliate + Payouts)

Questa guida è pensata per farti arrivare a:
- tracking **click affiliato** (link)
- tracking **booking click** (click dentro i widget Stay22/Aviasales)
- import **vendite/commissioni reali** (Travelpayouts)
- dashboard **Affiliate** + dashboard **Admin**
- **richiesta pagamento** (payout) dalla dashboard + email all’admin via Resend

> Nota: per “booking click” intendiamo **un click dentro i widget che manda l’utente fuori dal sito**. Non è una vendita.

---

## 0) Cosa c’è già nel sito (in questo ZIP)

### Frontend
- `assets/js/main.js`
  - salva in cookie l’ID affiliato (30 giorni) quando qualcuno visita `?ref=<slug>`
  - traccia i **click affiliato** su Supabase (tabella `affiliate_clicks`)
  - traccia i **booking click** su Supabase (tabella `bookings` con `status='click'`)
  - traccia i **pageview/visite totali** su Supabase (tabella `site_pageviews`) ✅
- `flights.html`
  - carica widget Aviasales e passa automaticamente `sub_id=<affiliate_slug>`
  - traccia 1 booking-click “utile” quando l’utente lancia una ricerca
- `assets/js/replace_maps.js`
  - integra Stay22 (mappe) e aggiunge `aid=travirae` + `campaign=<affiliate_slug>` (il parametro che poi vedi nel report Stay22 come **Campaign ID**)

### Area Affiliati
- `area-affiliati.html` + `assets/js/affiliate-area.js`
  - login/registrazione
  - mostra click, booking click, guadagni (USD)
  - mostra **revenue share attuale** + barra avanzamento
  - se saldo ≥ 50 USD: permette “Richiedi pagamento” (Edge Function)
  - mostra storico richieste pagamento

### Admin
- `admin-affiliati.html` + `assets/js/admin-affiliati.js`
  - login admin
  - tabella mese‑per‑mese + grafico (payout mensili)
  - tabella “Operativo” (click / booking click / saldo)
  - tabella “Richieste pagamento” con azioni (approva / rifiuta / segna pagato)
  - import vendite Travelpayouts (Aviasales) tramite Edge Function
  - import manuale Stay22 via CSV (facoltativo)

### Supabase
- `supabase/sql/` contiene gli script DB
- `supabase/functions/` contiene Edge Functions
  - `import-travelpayouts`
  - `request-payout` (NEW)

---

## 1) Crea / usa il progetto Supabase

### 1.1 Apri progetto
1. Vai su Supabase Dashboard
2. Seleziona il progetto (es. `travirae-affiliate`)

### 1.2 Impostazioni Auth (URL)
1. Menu sinistro → **Authentication**
2. Tab **URL Configuration**
3. Imposta:
   - **Site URL**: `https://travirae.com`
   - **Additional Redirect URLs** (aggiungi queste):
     - `https://travirae.com/area-affiliati.html`
     - `https://travirae.com/admin-affiliati.html`

> Perché: Supabase Auth blocca i redirect verso URL non “whitelistate”.

---

## 2) Esegui gli script SQL (Database)

1. Menu sinistro → **SQL Editor**
2. Clicca **New query**
3. Esegui gli script in questo ordine (copia/incolla il contenuto di ogni file e premi **Run**):

✅ Obbligatori
- `supabase/sql/SCRIPT_01_extensions.sql`
- `supabase/sql/SCRIPT_02_tables.sql`
- `supabase/sql/SCRIPT_03_functions.sql`
- `supabase/sql/SCRIPT_04_rls_policies.sql`
- `supabase/sql/SCRIPT_05_views_refresh.sql`
- `supabase/sql/SCRIPT_07_payouts_balances.sql`  ✅ (prelievi + viste balance)
- `supabase/sql/SCRIPT_08_site_traffic.sql`  ✅ (visite totali sito)
- `supabase/sql/SCRIPT_09_newsletter.sql`  ✅ (newsletter iscritti multi-lingua)

✅ Opzionale (solo se vuoi CRON con pg_cron)
- `supabase/sql/SCRIPT_06_cron_import_travelpayouts.sql`

> Se stai usando un progetto nuovo/pulito, eseguire tutti gli script sopra è sufficiente.

---

## 3) Edge Functions — Secrets (chiavi/token)

⚠️ Queste chiavi **NON vanno mai** nel codice del sito.

### 3.1 Apri pagina Secrets
1. Supabase Dashboard → progetto
2. Menu sinistro → **Edge Functions**
3. Tab **Secrets**
4. Clicca **Add secret**

### 3.2 Inserisci questi secrets
Aggiungi (uno per uno):

**A) Supabase**
- `SUPABASE_SERVICE_ROLE_KEY` = (incolla la tua Service Role Key)

**B) Travelpayouts**
- `TRAVELPAYOUTS_API_TOKEN` = (token Travelpayouts)

**C) Resend (email)**
- `RESEND_API_KEY` = (API key Resend)
- (consigliato) `RESEND_FROM` = `Travirae <info@travirae.com>`
- `SITE_URL` = `https://travirae.com`  (serve per i link nelle email newsletter)
- `ADMIN_EMAIL` = `serioliivan@gmail.com`  (email admin autorizzata)

**D) Sicurezza CRON (se lo usi)**
- `TRAVIRAE_CRON_SECRET` = una stringa lunga casuale

---

---

## 3.1) Importante: `RESEND_FROM` NON cambia le email di reset password

Ci sono **2 tipi** di email nel progetto:

1) **Email “Auth” di Supabase** (conferma registrazione, reset password, magic link)
   - vengono inviate da **Supabase Auth**
   - si configurano in Supabase → **Authentication → Emails → SMTP Settings** (o Project Settings → Authentication → SMTP)

2) **Email “operative” del sito** (es. richiesta pagamento affiliato)
   - vengono inviate dalla Edge Function `request-payout` via **Resend API**
   - si configurano con i Secrets:
     - `RESEND_API_KEY`
     - `RESEND_FROM` (es. `Travirae <info@travirae.com>`)
     - `ADMIN_EMAIL` (es. `serioliivan@gmail.com`)
     - `SITE_URL` (es. `https://travirae.com`)

Quindi: se cambi `RESEND_FROM`, **cambia solo** le email inviate dalle Edge Functions (payout).  
Per cambiare anche le email di reset password devi aggiornare l’SMTP di Supabase.

### Impostare *tutte* le email con mittente `info@travirae.com`

1) Supabase Dashboard → progetto
2) Vai su **Authentication**
3) Vai su **Emails**
4) Sezione **SMTP Settings**
5) Attiva **Enable Custom SMTP**
6) Inserisci i parametri SMTP di Resend:

- Host: `smtp.resend.com`
- Username: `resend`
- Password: la tua `RESEND_API_KEY`
- Porta: 465 (SSL) oppure 587 (TLS)
- Sender email: `info@travirae.com`
- Sender name: `Travirae`

7) Salva.

> Se le email finiscono in spam, vedi sezione “Deliverability / Spam” più sotto.

### Template email (più belli)
Per rendere le email Supabase più belle:
- Supabase → Authentication → Emails → **Templates**
- apri “Reset password”, “Confirm signup”, ecc.
- incolla un template HTML personalizzato

Nel file `supabase/EMAIL_TEMPLATES_SUPABASE_AUTH.md` trovi dei template pronti (copiaincolla).
Mantieni i placeholder che vedi nel template originale (es. `{{ .ConfirmationURL }}` / `{{ .Token }}`).

---

## 4) Deploy delle Edge Functions (import + payout)

### Metodo consigliato: Supabase CLI (più affidabile)

#### 4.1 Installa Supabase CLI
1. Installa Node.js (se non ce l’hai)
2. Apri Terminale / PowerShell
3. Esegui:
   ```bash
   npm i -g supabase
   supabase login
   ```

#### 4.2 Collega il progetto
Dentro la cartella dove hai lo ZIP scompattato (quella che contiene `supabase/`):
```bash
supabase link --project-ref ccihuwvtlvmyzharkblj
```

#### 4.3 Deploy
```bash
supabase functions deploy import-travelpayouts
supabase functions deploy request-payout
```

> Se il deploy va a buon fine, le funzioni saranno disponibili su:
- `https://<PROJECT_REF>.supabase.co/functions/v1/import-travelpayouts`
- `https://<PROJECT_REF>.supabase.co/functions/v1/request-payout`

### Metodo alternativo: Dashboard
Se il tuo Supabase Dashboard ti permette **Create function** + **Deploy**:
1. Edge Functions → Create new function
2. Nome = `request-payout` (poi copia/incolla il file `supabase/functions/request-payout/index.ts`)
3. Deploy

---

## 5) Resend — verifica dominio (con IONOS)

> Tu hai già avviato la verifica. Qui ti spiego il “click‑by‑click” generico: **i record li devi copiare dalla schermata Resend**.

### 5.1 In Resend
1. Vai su Resend Dashboard
2. Menu → **Domains**
3. Seleziona `travirae.com` (o `mail.travirae.com`)
4. Copia i record DNS che Resend ti mostra (di solito):
   - TXT (SPF)
   - CNAME/TXT (DKIM)
   - a volte MX / Return-Path (dipende dalla schermata)

### 5.2 In IONOS (DNS)
1. Vai su IONOS
2. **Domains & SSL**
3. Seleziona il dominio `travirae.com`
4. Apri **DNS** (o “Impostazioni DNS”) → **DNS records**
5. Per ogni record:
   - clicca **Add record**
   - scegli tipo (TXT / CNAME / MX)
   - incolla **Host/Name** esattamente come Resend
   - incolla **Value** esattamente come Resend
   - TTL: lascia default
6. Salva

### 5.3 Verifica
1. Torna su Resend
2. Clicca **Verify**
3. Se non passa subito, aspetta la propagazione DNS (può richiedere un po’)

> Quando è OK, l’indirizzo `info@travirae.com` potrà inviare email.

---

## 6) Pubblica il sito su IONOS

1. Scarica lo ZIP aggiornato
2. Scompatta
3. Carica **tutti i file** nella root del tuo hosting (es. via FTP oppure File Manager)
4. Mantieni la stessa struttura cartelle:
   - `assets/`
   - `supabase/` (puoi anche NON caricarla sul sito; serve solo a te)

---

## 7) Test end‑to‑end (checklist rapida)

### 7.1 Tracking click affiliato
1. Vai su `https://travirae.com/?ref=TESTSLUG`
2. Poi apri Supabase → Table Editor → `affiliate_clicks`
3. Dovresti vedere un record con `affiliate_slug = TESTSLUG`

### 7.2 Booking click
- **Aviasales**: apri `https://travirae.com/flights.html?ref=TESTSLUG` e fai una ricerca
- **Stay22**: apri una destinazione con mappa e clicca su un hotel
Poi controlla Supabase → `bookings` (status = `click`)

### 7.3 Registrazione affiliate
1. Vai su `https://travirae.com/area-affiliati.html`
2. Registrati
3. Dopo login, copia il link affiliato

### 7.4 Import vendite reali (Travelpayouts)
1. Vai su `https://travirae.com/admin-affiliati.html`
2. Login con email admin
3. Clicca **Importa vendite Aviasales**
4. Poi **Aggiorna payouts**
5. Poi **Ricarica dati**



### 7.4b Import vendite reali (Stay22 via CSV) *(opzionale ma consigliato)*
Stay22 non sempre espone un endpoint pubblico “reporting API” per tutti. Per questo ZIP ho incluso un import **CSV**.

1. Vai in Stay22 Hub → sezione report/analytics (quella dove vedi le transazioni)
2. Esporta in **CSV** (range date a scelta)
3. Assicurati che nel CSV ci siano (anche con nomi simili):
   - **Campaign ID** (noi lo impostiamo uguale a `affiliate_slug`)
   - **Transaction ID** (id univoco transazione)
   - **Transaction Date**
   - **Transaction Status** (Pending / Approved / Canceled)
   - **Commission (USD)**
4. Nel tuo sito: entra in `https://travirae.com/admin-affiliati.html`
5. Clicca **Importa Stay22 CSV** e seleziona il file.

Cosa fa l’import:
- `Campaign ID` → `affiliate_slug`
- `Transaction ID` → `partner_reference`
- `Commission (USD)` → `commission_partner`
- `Transaction Status` → `status` (Approved→confirmed, Pending→pending, Canceled→cancelled)
- Inserisce/aggiorna righe in `bookings` con `partner='stay22'`.

### 7.5 Payout request
1. Entra come affiliato
2. Se saldo ≥ 50 USD → clicca **Richiedi pagamento**
3. Compila e invia
4. Controlla:
   - Supabase tabella `payout_requests`
   - Email ricevuta su `serioliivan@gmail.com`

---

## 8) Note pratiche

### 8.1 “Realtime” vero
I click (affiliate_clicks e bookings click) sono quasi real‑time.
Le vendite REALI invece dipendono dal partner: spesso arrivano come `pending` e diventano `confirmed/paid` dopo giorni.

### 8.2 Valuta unica
Il sistema è impostato per **USD**.
Se in passato hai importato dati in EUR, conviene:
- pulire tabelle (`bookings`, `monthly_affiliate_payouts`, `payout_requests`) e re‑importare
oppure
- mantenere storico “misto” ma è sconsigliato.

---

## 9) Troubleshooting (errori comuni)

- **Errore “URL not allowed” in login/confirm**
  - Auth → URL Configuration → aggiungi la pagina in Redirect URLs

- **La dashboard non mostra revenue share / saldo / richieste**
  - Hai eseguito `SCRIPT_07_payouts_balances.sql`?

- **La richiesta payout fallisce**
  - Hai deployato la funzione `request-payout`?
  - Hai settato secrets `SUPABASE_SERVICE_ROLE_KEY` + `RESEND_API_KEY
- SITE_URL (es: https://travirae.com)
- ADMIN_EMAIL (es: serioliivan@gmail.com)`?
  - Il dominio Resend è verificato?

