
# Travirae — Sito con sezione "Affiliazioni" e Dashboard Creator

## Cosa include
- **Affiliazioni** (`affiliazioni.html`): registrazione e login (Supabase Auth). Alla prima registrazione crea in automatico la riga su `influencers` con `ref` unico e la collega all'utente.
- **Dashboard** (`dashboard.html`): mostra ref personale, link di referral, click, prenotazioni pagate e payout mensile.
- **Ricerca** voli/hotel (come prima) con tracciamento affiliati via aff‑hub.

## Configurazione (una volta)
1. Apri `js/config.js` e imposta:
   ```js
   window.AFF_HUB_BASE = 'https://<TUO-PROGETTO-HUB>.vercel.app';
   window.STAY22_AID = 'travirae';
   window.SUPABASE_URL = 'https://uflxbtupncooisrunygj.supabase.co';
   window.SUPABASE_ANON_KEY = '<ANON_KEY>';
   ```
2. In **Supabase → Authentication → Providers** abilita **Email** (password). Se vuoi evitare la conferma email, disattivala in **Authentication → Email** (Confirm email).
3. In **Supabase → SQL** aggiungi la policy per permettere agli utenti di **inserire** la propria riga su `influencers`:
   ```sql
   create policy "creator can insert self"
   on public.influencers for insert
   with check (auth.uid() = user_id and user_id is not null);
   ```
   (Le policy di **select** su `influencers`, `clicks`, `conversions_*` devono già essere attive come da guida precedente.)

## Come funziona la registrazione
- L'utente si registra con **nome, email, password** → `supabase.auth.signUp(...)`.
- Se la conferma email è **OFF**, l'utente è loggato subito; se **ON**, dovrà confermare prima di accedere.
- Alla prima sessione, lo script crea la riga su `influencers` con un `ref` unico (`nome-rand`), collega `user_id` all'utente e imposta `payout_rate` di default `0.25` (modificabile da admin lato DB).

## Test rapido
1. Apri `affiliazioni.html`, registrati con un'email di test → vai in **Supabase → Table Editor → influencers**: vedi una nuova riga con `ref` e `user_id`.
2. Vai su `dashboard.html`: vedi **ref**, **link personale** (`https://tuo-sito/?ref=...`), KPI e tabella mensile.
3. Vai in **Supabase → clicks** dopo aver cliccato “Vedi Voli/Hotel” dal sito con il tuo `?ref=`: vedrai i click loggati (TP/STAY22).
4. Esegui gli import (aff‑hub) e verifica `conversions_tp` / `conversions_stay22`; la vista `aff_monthly` calcolerà il payout.

Buon lavoro!
