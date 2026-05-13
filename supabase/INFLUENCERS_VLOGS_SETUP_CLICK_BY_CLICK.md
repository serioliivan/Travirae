# Influencers Vlogs — Setup click by click

> Hotfix SQL: `SCRIPT_11_influencers_vlogs.sql` è stato corretto due volte: prima per un riferimento ambiguo a `creator_slug` nella function pubblica `get_influencer_public_posts`, poi per il nome colonna del saldo in `affiliate_balances` (`available_balance_usd`, non `available_balance`). Lo script è pensato per poter essere rieseguito in sicurezza. Se avevi già lanciato una versione precedente e si è fermata su uno di questi errori, riapri una nuova query ed esegui di nuovo lo script corretto.

## 1. Apri Supabase SQL Editor
1. Entra nel progetto Supabase di Travirae.
2. Nel menu a sinistra clicca **SQL Editor**.
3. Clicca **New query**.
4. Incolla ed esegui **nell’ordine**:
   - `supabase/sql/SCRIPT_11_influencers_vlogs.sql`
   - `supabase/sql/SCRIPT_12_influencer_storage_policies.sql`
5. Verifica che entrambe le query finiscano senza errori.

## 2. Verifica tabelle e viste create
1. Vai su **Table Editor**.
2. Controlla che siano presenti:
   - `influencer_profiles`
   - `influencer_profile_revisions`
   - `influencer_posts`
   - `influencer_post_revisions`
   - `influencer_post_widgets`
   - `influencer_post_events`
3. Vai su **Database > Functions** e verifica che esistano:
   - `resolve_influencer_tracking_code`
   - `get_influencer_public_profile`
   - `get_influencer_public_posts`
   - `get_influencer_public_post`
   - `review_influencer_profile`
   - `review_influencer_post`
4. Vai su **Table Editor** e verifica che esistano anche le viste:
   - `influencer_post_kpis`
   - `influencer_creator_private_stats`

## 3. Verifica bucket Storage
1. Vai su **Storage**.
2. Controlla che siano presenti i bucket:
   - `influencer-avatars`
   - `influencer-post-media`
3. Apri ciascun bucket e controlla che sia **Public**.
4. In **Storage > Policies** verifica le policy appena create.
5. Non caricare file manualmente nel bucket root: il frontend usa path `auth.uid()/...`.

## 4. Edge Function Travelpayouts
1. Vai su **Edge Functions**.
2. Apri o crea la function `import-travelpayouts`.
3. Sostituisci il file `index.ts` con quello aggiornato presente nello zip.
4. Deploya la function.
5. Vai in **Edge Functions > Secrets** e verifica che siano presenti:
   - `TRAVELPAYOUTS_API_TOKEN`
   - `TRAVIRAE_CRON_SECRET`
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

## 5. Auth / redirect
1. Vai su **Authentication > URL Configuration**.
2. Non cambiare nulla se login affiliato e admin già funzionano oggi.
3. Controlla solo che i redirect attuali per `area-affiliati*.html` e `admin-affiliati*.html` siano ancora quelli già usati nel progetto.
4. Non servono nuovi template email obbligatori per questo modulo.

## 6. Hosting del sito statico
1. Estrai lo zip aggiornato localmente.
2. Carica i file sul tuo hosting mantenendo la stessa struttura cartelle.
3. Sovrascrivi i file esistenti quando richiesto.
4. Assicurati che vengano caricati anche:
   - le nuove pagine `influencers-vlogs*.html`
   - le nuove pagine `area-affiliati-profilo*.html`
   - le nuove pagine `admin-influencer*.html`
   - i nuovi JS in `assets/js/`
   - i nuovi SQL e markdown in `supabase/`
5. Svuota la cache del CDN / hosting se presente.
6. Fai un hard refresh del browser.

## 7. Stay22 / Travelpayouts
1. Non creare account partner separati per i creator.
2. Mantieni **Travirae** come partner principale.
3. Verifica solo che:
   - per Stay22 i link continuino a usare `aid=travirae`
   - per Aviasales/Travelpayouts i link continuino a usare il marker Travirae già presente nel progetto
4. I creator vengono tracciati internamente con `campaign` / `sub_id` = tracking code widget.
5. Non è richiesta una configurazione partner diversa per ogni creator.

## 8. Test rapido post deploy
1. Loggati in `area-affiliati.html`.
2. Apri la tab **Profilo**.
3. Crea il profilo creator e salva una bozza.
4. Carica avatar, cover e almeno un’immagine inline.
5. Crea un post con un widget Stay22 e uno Aviasales.
6. Invia in revisione.
7. Loggati in `admin-influencer.html`.
8. Approva profilo e post.
9. Apri `influencers-vlogs.html` e verifica che il post sia pubblico.
10. Apri il popup con `?post=slug-post` e controlla la condivisione URL.
