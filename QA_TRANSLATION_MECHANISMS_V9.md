# QA traduzioni e meccanismi - Travirae v9

Data controllo: 2026-04-18

## Cosa è stato controllato

### Traduzioni e routing lingua
- Controllate tutte le 108 pagine HTML.
- Ogni pagina ha un solo `<!DOCTYPE html>`.
- Ogni pagina include una sola istanza del language router `travirae-lang-router`.
- Ogni pagina include `assets/js/travirae-i18n-fixes.js`.
- Le pagine localizzate rispettano il suffisso lingua (`-en`, `-es`, `-fr`, `-de`, `-nl`, `-ru`, `-ar`, `-zh`) invece di essere reindirizzate in base al browser.
- Le pagine arabe hanno `dir="rtl"`.
- I link interni nelle pagine tradotte puntano alla versione tradotta della pagina, quando esiste.
- Controllato che non restassero marker visibili italiani principali nelle pagine non italiane.
- Controllato che non ci fossero URL interni con caratteri non ASCII introdotti dalle traduzioni.

### Script JavaScript
Sono stati controllati con `node --check` i file JavaScript principali e localizzati, inclusi:
- `assets/js/main.js`
- `assets/js/influencers-vlogs.js`
- `assets/js/affiliate-area*.js`
- `assets/js/admin-affiliati*.js`
- `assets/js/admin-influencer.js`
- `assets/js/affiliate-profile.js`
- `assets/js/travirae-i18n-fixes.js`

Risultato: nessun errore di sintassi rilevato nei file controllati.

### Meccanismi affiliate/creator verificati da codice
- Il tracking `booking click` resta disattivato come no-op legacy.
- I click outbound usano eventi `widget_click`.
- I widget creator mantengono attribuzione specifica al creator/proprietario del post.
- L'apertura di un link diretto a un post creator imposta il creator come affiliato della sessione, quando non è presente un `?ref=` esplicito.
- Un `?ref=` esplicito resta prioritario per la sessione.
- Se l'utente clicca un widget dentro il post di un altro creator, vince il tracking del post/widget specifico.
- Il saldo disponibile resta basato su: guadagni maturati - payout pagati - richieste payout pending/approved.
- Le vendite confermate vengono aggregate dalle righe `bookings` confermate e dalle view mensili.

## Modifiche incluse in v9

### 1. Fix routing lingua
Prima, una pagina tradotta poteva essere reindirizzata alla lingua del browser. Ora, se l'utente apre una pagina con suffisso lingua, quella lingua viene rispettata.

Esempio:
- `index-en.html` resta in inglese anche se il browser è in italiano.
- `programma-affiliato-fr.html` resta in francese.

### 2. Link interni localizzati
Nelle pagine tradotte, i link interni ora puntano alla versione della stessa lingua.

Esempio in inglese:
- `hotel.html` -> `hotel-en.html`
- `voli.html` -> `voli-en.html`
- `privacy.html` -> `privacy-en.html`

### 3. Fix testi runtime
Aggiunto `assets/js/travirae-i18n-fixes.js`, che traduce anche testi generati via JavaScript dopo il caricamento della pagina, per esempio messaggi dashboard, placeholder, bottoni e stati vuoti.

### 4. Fresh SQL alignment
Aggiornato `supabase/sql/SCRIPT_11_influencers_vlogs.sql` con una sezione di consolidamento finale che ricrea la view `admin_affiliate_overview` usando i click outbound `widget_click`, non i vecchi booking click.

## Limiti del controllo

Questo controllo non può connettersi al tuo Supabase live e non può vedere le vendite reali importate dai partner. Quindi:

- la correttezza del codice e delle view è stata controllata staticamente;
- i dati live reali vanno verificati nel tuo Supabase con gli script audit già inclusi nel progetto;
- per la parte economica usa soprattutto:
  - `SCRIPT_18_affiliate_money_integrity_audit.sql`
  - `SCRIPT_19_creator_post_sales_attribution_audit.sql`

## Deploy consigliato

Per la parte traduzioni e frontend:
1. sostituisci i file del repository con quelli dello zip v9;
2. fai commit e push su GitHub;
3. attendi il deploy del sito.

Per installazioni nuove da zero:
- gli script SQL aggiornati includono già il consolidamento finale nella sequenza.

Per installazioni già esistenti:
- non serve SQL obbligatorio per le traduzioni;
- usa gli script audit solo per controllare i dati live;
- se non avevi ancora applicato i fix SQL dei click outbound, mantieni anche gli script v14-v16/v18-v19 inclusi nel progetto.
