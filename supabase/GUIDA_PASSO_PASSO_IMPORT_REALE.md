# Guida passo‑passo (vendite e commissioni REALI)

Questa guida spiega come attivare l’import automatico delle conversioni (vendite/commissioni reali) su Supabase.

## Prerequisiti
- Hai già un progetto Supabase (nuovo/pulito consigliato).
- Hai eseguito gli script SQL in `supabase/sql/` (01 → 05).
- Hai accesso ai token partner (Travelpayouts) e NON vuoi metterli nel sito.

---

## Step 1 — Inserisci i “Secrets” (token) su Supabase (sicuro)

1. Apri Supabase Dashboard
2. Seleziona il tuo progetto
3. Menu a sinistra → **Edge Functions**
4. Tab → **Secrets**
5. Clicca **Add secret** (o equivalente)
6. Inserisci questi 2 segreti:

- **Key:** `TRAVELPAYOUTS_API_TOKEN`  
  **Value:** (incolla il tuo token Travelpayouts)

- **Key:** `TRAVIRAE_CRON_SECRET`  
  **Value:** scegli una stringa lunga casuale (es. `tva_cron_...`)

7. Clicca **Save**

✅ Fatto: i token sono salvati su Supabase e NON sono visibili nel sito.

---

## Step 2 — Crea e Deploy della Edge Function `import-travelpayouts`

Metodo “più semplice” (Dashboard, senza installare nulla):

1. Menu a sinistra → **Edge Functions**
2. Clicca **Create a new function**
3. Nome: `import-travelpayouts`
4. Apri l’editor della funzione
5. Copia e incolla il contenuto del file:
   `supabase/functions/import-travelpayouts/index.ts`
6. Clicca **Deploy** (o Publish)

---

## Step 3 — Test manuale (senza CRON)

1. Vai su `admin-affiliati.html` sul tuo sito
2. Fai login con l’email admin
3. Clicca **Importa vendite Aviasales**
4. Poi clicca **Aggiorna payouts**
5. Clicca **Ricarica dati**

Se tutto è ok, vedrai aggiornarsi:
- vendite (solo quando lo stato diventa confermato/paid)
- commissioni nette
- guadagni affiliati

---

## Step 4 — Attiva l’automazione (CRON) (consigliato)

Hai due modi. Se non vuoi “complicarti la vita”, usa il Metodo A.

### Metodo A (più semplice) — Supabase Dashboard → Integrations → Cron
1. Supabase Dashboard → seleziona il progetto
2. Menu a sinistra → **Integrations**
3. Clicca **Cron**
4. Clicca **Create Job**
5. Tipo job: **HTTP request**
6. Schedule: scegli ogni 6 ore (o quello che preferisci)
7. URL:
   `https://TUO_PROJECT_REF.supabase.co/functions/v1/import-travelpayouts`
8. Method: **POST**
9. Headers (aggiungili uno per uno):
   - `Content-Type` = `application/json`
   - `Authorization` = `Bearer <SUPABASE_ANON_KEY>`
   - `x-cron-secret` = `<TRAVIRAE_CRON_SECRET>`
10. Body:
   `{ "days": 45 }`
11. Clicca **Save**

✅ Da questo momento l’import parte in automatico.

### Metodo B (avanzato) — SQL Editor (usa Vault)
1. Supabase → **SQL Editor**
2. Apri e incolla:
   `supabase/sql/SCRIPT_06_cron_import_travelpayouts.sql`
3. IMPORTANTISSIMO:
   - sostituisci `PASTE_YOUR_CRON_SECRET_HERE` con la stessa stringa del secret `TRAVIRAE_CRON_SECRET`
   - sostituisci `PASTE_YOUR_SUPABASE_ANON_KEY_HERE` con la tua `SUPABASE_ANON_KEY`
4. Clicca **Run**

Da questo momento il sistema importerà automaticamente ogni 6 ore.

---

## Nota importante sul “realtime”
I partner NON confermano subito tutte le vendite. Quindi:
- subito dopo l’acquisto potresti vedere `pending`
- la commissione “finale” arriva quando diventa `paid/confirmed`
- importando ogni 6 ore ti avvicini molto al “realtime”, ma il limite è del partner
