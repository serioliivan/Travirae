# Travirae — verifica widget v6

Data della verifica: 6 settembre 2026.
Base: archivio «Hotel Nizza Riccione exact fix» ricevuto in questa conversazione.

## Correzioni effettuate

- Le risposte autocomplete in ritardo vengono invalidate appena cambia il testo,
  quando si chiude la tendina e quando si cambia modalità. Una vecchia richiesta
  non può riaprire il popup o sostituire i risultati della nuova ricerca.
- La selezione è accettata soltanto dopo una risposta Details valida per lo stesso
  placeId, con indirizzo e coordinate validi. In caso di errore, la struttura non
  viene più accettata usando informazioni incomplete: si può riprovare o usare
  la ricerca per destinazione. Il campo si sblocca anche in caso di timeout.
- L'associazione esatta a Hotel Nizza Riccione usa soltanto il nome e l'indirizzo
  della struttura selezionata. Le parole digitate in una ricerca precedente non
  possono far aprire Nizza quando si seleziona un altro hotel.
- Controllo rigoroso delle date. Check-in e check-out restano indipendenti;
  spostando il check-in oltre il check-out, quest'ultimo viene cancellato, mai
  compilato automaticamente. Le date passate o inesistenti non sono inviate.
- Il pulsante ricerca viene riattivato quando si torna indietro dal partner.
- Corretto lo sconfinamento laterale del calendario check-out su tablet e in RTL;
  corretta la centratura del badge Stay22 su mobile arabo. Calendario monocromatico
  con evidenziazione blu soltanto della data selezionata.
- Versionati CSS e JavaScript nelle nove homepage per evitare risorse in cache.

## Hotel Nizza e affiliazione

La pagina Booking verificata è:
https://www.booking.com/hotel/it/nizza-riccione.html

Il collegamento viene codificato UNA volta come parametro `link` di
`https://www.stay22.com/allez/booking`, con `aid=travirae`, `roam=false` e l'eventuale
`campaign` esistente, senza rinominare gli slug degli affiliati. Date e ospiti
vengono passati sia nel link Booking sia nei parametri Stay22; lingua e valuta
restano quelle del sito.

Documentazione ufficiale di riferimento:
https://dev.stay22.com/docs/allez/parameters
https://dev.stay22.com/docs/allez/quick-start
https://dev.stay22.com/docs/allez/providers

Per gli altri hotel senza un'associazione diretta verificata resta una ricerca
Booking basata su nome e città. Non viene dichiarata una corrispondenza esatta
universale, né viene costruito un URL di hotel inventando lo slug dal nome.

## Verifiche eseguite

- 199 controlli browser Chromium sull'HTML/CSS/JavaScript reale del widget:
  nove lingue, ricerca Nizza, parametri affiliati, date e ospiti, assenza di
  checkout automatico, conferma/annullamento della selezione, errori del servizio,
  risposte ritardate, ritorno alla pagina, popover cliccabili e larghezze responsive.
- Verifiche layout da 320 a 1440 px, con italiano e arabo RTL, e ispezione visiva
  delle schermate desktop e mobile. Non sono test su iPhone/Safari fisici.
- Altri 8 controlli browser della centratura del badge (italiano/arabo).
- 13 test Node ripetibili per URL diretti, omonimie, vecchie query, codifica dei
  parametri e date: `node scripts/test-widget-routing-v6.cjs`.
- Verifica sintattica dei 30 file JavaScript del sito (14 contenuti unici),
  parsing CSS e presenza degli asset del widget in tutte le nove homepage.
- Confronto con lo ZIP di partenza: codice generale di tracking, configurazione
  pubblica Supabase, SQL e tutte le Edge Functions rimasti identici.
- Verifica di integrità dell'archivio ZIP finale.

### Limiti della verifica

I test browser sono stati svolti offline con risposte Google/Supabase simulate e
navigazioni intercettate, senza produrre clic o vendite nel database reale.
La pagina di Hotel Nizza e i parametri ufficiali Stay22 sono stati verificati sul
web; il redirect live completo Stay22 → Booking non è stato eseguibile da questo
ambiente. Non è stata effettuata una prenotazione reale né verificato un accredito.
Il mantenimento dei parametri non è una garanzia di commissione: attribuzione,
validazione, disponibilità e cancellazioni rimangono gestite dai partner.

## Pubblicazione

Non occorre eseguire SQL, modificare la chiave Google o ridistribuire la Edge
Function. Copiare il CONTENUTO di `Travirae DEFINITIVO` sopra quello del repository,
senza cancellare `.git` o eventuali `.github`. È incluso `CNAME` con `travirae.com`.
Eseguire Commit e Push, attendere la pubblicazione GitHub Pages e ricaricare con
Ctrl+F5. Le ricerche per destinazione e gli altri widget non sono stati ridisegnati.
