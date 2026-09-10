# Travirae — ricerca basata sull’hotel selezionato (v8)

Data: 10 settembre 2026. Base: Travirae_widget_layout_unificato_nuova_scheda_v7.zip.

## Comportamento richiesto

Il nome inviato a Booking è quello del risultato scelto nell’autocomplete,
non il testo incompleto digitato prima della selezione.

Esempio verificato con risposte di prova:

- Testo digitato: `Hotel Lidomar`.
- Risultato selezionato: `Hotel Lidomare`.
- Località del risultato: `Amalfi`.
- Ricerca nel collegamento Booking: `Hotel Lidomare Amalfi`.

Il collegamento resta `Stay22 Allez → Booking`. Non viene aperto un link
Booking non affiliato come ripiego.

## Modifiche

1. La selezione conserva una copia del nome completo, della località e del
   place ID del suggerimento cliccato, prima della richiesta dei dettagli.
2. Rimossa l’abbreviazione automatica che tagliava il nome dopo un trattino.
   Accenti, suffissi, punteggiatura e parole del nome selezionato restano intatti.
3. La località del suggerimento non viene più scartata. In assenza di dati
   strutturati si ricava una località dal suggerimento/indirizzo, scartando
   numeri civici, CAP, sigle di provincia e prefissi stradali riconoscibili.
   Per indirizzi mondiali non strutturati questa estrazione resta euristica;
   non viene mai utilizzata per cambiare il nome selezionato.
4. Tutti gli hotel seguono lo stesso percorso: una ricerca Booking con `ss`
   e `ss_raw` uguali al nome completo selezionato più località. Sono state
   rimosse le vecchie eccezioni per singoli hotel, inclusa quella per Nizza.
   Non vengono inventati ID Booking o percorsi di pagine hotel.
5. Il collegamento Booking completo è codificato dentro `link` di
   `/allez/booking`, con `aid=travirae`, `roam=false`, date, ospiti, lingua,
   valuta e campagna affiliato/creator invariati.
6. Restano le protezioni contro risposte lente, dettagli con place ID diverso,
   ricerche senza selezione e riutilizzo di una selezione dopo la modifica del testo.
7. Aggiornati i riferimenti di versione delle risorse nelle nove homepage.

## Cosa non cambia

- Layout identico fra «Per destinazione» e «Hotel specifico».
- Apertura nella nuova scheda soltanto dopo l’invio valido.
- Calendari, date separate, icone, overlay e stile del widget.
- Ricerca generale per destinazione.
- `config.js`, `main.js`, CSS, CNAME, SQL e tutte le Edge Functions.
- Account Stay22, ID affiliato e sistema esistente di tracking Supabase.

Non sono necessari SQL, modifiche alle chiavi né un nuovo deployment Supabase.

## Verifiche eseguite

- 39 test offline di query, codifica, caratteri speciali, località, date e parametri.
- 7 test offline della nuova scheda e del layout comune.
- 590 asserzioni browser: nove lingue a 1440 e 390 px, più verifiche di errori,
  risposte fuori ordine, selezione da tastiera, popup bloccati e traffico diretto.
- Sintassi dei 29 file JavaScript.
- Confronto dei file con la v7: core, stile e backend non modificati.
- Integrità dello ZIP e controllo della presenza dei nuovi riferimenti JS.

I test browser caricano i file del sito in memoria. Servizi esterni e navigazione
verso Stay22/Booking sono simulati: verificano la stringa effettivamente passata
al collegamento e al tracking, non i risultati live di Booking. Non sono state
eseguite prenotazioni né verifiche di accrediti.

Questa modifica assicura che il codice Travirae componga la ricerca dal nome
selezionato senza abbreviazioni. Non può imporre a Booking l’ordine dei risultati,
la disponibilità di una struttura o il testo eventualmente riscritto dal provider.
Una ricerca `ss` non equivale alla selezione di un hotel con il suo ID Booking.

Riepilogo macchina: `QA_WIDGET_V8.json`.

Comandi facoltativi per sviluppatori:

```text
node scripts/test-widget-routing-v8.cjs
node scripts/test-widget-newtab-v7.cjs
python scripts/test-widget-browser-v8.py --locale it
python scripts/test-widget-browser-v8.py --advanced-only
```

Il test Python richiede Playwright, BeautifulSoup e un Chromium installato;
`CHROMIUM_PATH` permette di indicarne il percorso. I report vengono salvati in
una cartella temporanea, oppure in `TRAVIRAE_QA_OUTPUT` se configurata.

## Pubblicazione

Copiare il contenuto di `Travirae DEFINITIVO` nella cartella del repository,
sostituendo i file senza eliminare `.git`, `.github` o `CNAME`. Eseguire Commit
poi Push, attendere il completamento della pubblicazione GitHub Pages e
ricaricare con Ctrl+F5.

Riferimento Stay22 per `link`, `aid` e `campaign`:
https://dev.stay22.com/docs/allez/parameters
