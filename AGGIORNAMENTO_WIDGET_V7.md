# Travirae — layout unificato e ricerca in nuova scheda (v7)

Aggiornamento: 6 settembre 2026.
Base: `Travirae_widget_verificato_v6.zip` fornito nella conversazione.

## Modifiche richieste

- La modalità «Per destinazione» e la modalità «Hotel specifico» condividono
  la stessa griglia: campo di ricerca più ampio, check-in, check-out e ospiti.
  Il pulsante di ricerca occupa una riga propria a tutta larghezza in entrambe.
- Il layout rimane identico tra le due modalità anche nei breakpoint responsive.
  Su tablet e smartphone i campi si dispongono in più righe senza tagli laterali;
  il pulsante resta sempre sotto tutti i campi, a tutta larghezza.
- Dopo la validazione, la ricerca apre una nuova scheda lasciando Travirae aperto
  con destinazione/hotel, date e ospiti selezionati.
- L'apertura avviene direttamente nel gesto di invio del modulo, prima delle
  chiamate di tracking: nessuna apertura è demandata a timer o risposte API.
  La nuova scheda perde il riferimento `opener` prima di caricare il partner.
- Se il browser blocca la nuova scheda, compare un messaggio nella lingua del sito.
  Non viene effettuato alcun reindirizzamento nella scheda originale e il pulsante
  resta utilizzabile. Non vengono aperte schede automatiche di riserva.
- Il pulsante si riattiva al ritorno su Travirae o dopo un breve intervallo,
  evitando che rimanga nello stato «Ricerca…». I moduli hanno anche `target="_blank"`
  e `rel="noopener"`; un tooltip e un'etichetta accessibile indicano la nuova scheda.
- CSS e JavaScript del widget hanno un nuovo parametro di versione nelle 9 homepage.

## Componenti conservati

Restano invariati il costruttore degli URL, il riconoscimento Hotel Nizza Riccione,
le ricerche Booking per gli altri hotel, i calendari con date indipendenti,
l'autocomplete Google, `aid=travirae`, le campagne creator/affiliato e la chiamata
`traviraeAffiliate.trackWidgetOutbound` con tutti i parametri precedenti.

Il confronto con la versione v6 conferma che `main.js`, `config.js`,
`google-hotel-autocomplete.js`, tutte le Edge Functions e tutti i file SQL
sono rimasti identici. Non occorre modificare Supabase o la chiave Google.

## Verifiche eseguite

- 1.839 controlli browser passati in Chromium 144, senza eccezioni JavaScript
  non gestite. Sono stati verificati i documenti reali nelle nove lingue.
- Confronto della geometria delle due modalità a 320, 360, 390, 560, 561, 768,
  820, 821, 1024, 1120, 1280 e 1440 pixel: stessa disposizione dei campi,
  nessun salto di altezza tra modalità, nessuna fuoriuscita orizzontale,
  pulsante sotto tutti i campi e largo quanto la griglia.
- Apertura di una sola scheda per ricerca valida, anche con invio da tastiera;
  pagina originale conservata, `opener` nullo, possibilità di ripetere la ricerca.
- Nessuna nuova scheda per form incompleto, hotel non selezionato o dati non validi.
- Blocco della nuova scheda e successivo tentativo; eccezione di navigazione gestita;
  traffico diretto senza campagna inventata; parametri creator, lingua, valuta,
  date e ospiti conservati nei collegamenti e nella chiamata al tracking.
- Link Nizza esatto, controllo dei parametri annidati nel link Booking,
  check-out non compilato automaticamente, popup calendario e ospiti cliccabili
  sopra le sezioni successive, anche su mobile e nella versione araba.
- Verifica sintattica dei 29 file JavaScript in `assets/js`, parsing del CSS,
  verifica degli asset e dei moduli nelle nove homepage.
- 13 test di routing/date già inclusi nella v6 e 7 nuovi test della gestione
  della nuova scheda, ripetibili senza rete:

```text
node scripts/test-widget-routing-v6.cjs
node scripts/test-widget-newtab-v7.cjs
```

### Limiti dei test

L'ambiente di test non consente la navigazione HTTP del browser. Per verificare
l'interfaccia sono stati caricati in memoria l'HTML, il CSS e il JavaScript
estratti dallo ZIP. Le risposte Google/Supabase sono simulate; il browser apre
schede reali, ma la navigazione al partner è intercettata dal test e il suo URL
viene verificato senza inviarlo al partner. Le impostazioni del browser possono
comunque decidere se il nuovo contesto sia una scheda o una finestra.

Non sono state eseguite prenotazioni, verifiche di accrediti o test su dispositivi
Safari/iPhone fisici. Questo aggiornamento conserva il tracciamento nel codice,
non costituisce una garanzia di disponibilità o di commissioni reali.

## Pubblicazione

Copiare il CONTENUTO di `Travirae DEFINITIVO` nella cartella del repository,
sostituendo i file richiesti senza eliminare `.git`, `.github` o `CNAME`.
Eseguire Commit e Push, attendere la pubblicazione di GitHub Pages e premere
Ctrl+F5. Non è richiesto alcun SQL né un nuovo deployment delle Edge Functions.

Riferimento tecnico: https://developer.mozilla.org/en-US/docs/Web/API/Window/open
