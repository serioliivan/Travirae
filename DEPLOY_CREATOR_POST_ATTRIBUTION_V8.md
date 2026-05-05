# Travirae v8 — attribuzione sessione da link post creator

Questa versione aggiunge la regola richiesta:

- se un utente apre un link diretto a un post creator, il creator proprietario del post diventa l'affiliato della sessione;
- da quel momento i widget generali del sito usano quell'affiliate slug;
- i widget dentro un altro post continuano a usare il tracking code del post specifico;
- se l'URL contiene già `?ref=...`, quel ref esplicito ha priorità e non viene sovrascritto dal post.

## File modificati

- `assets/js/main.js`
- `assets/js/influencers-vlogs.js`

## Serve SQL?

No. Questa modifica è frontend/sessionStorage e non richiede nuove tabelle o nuove view.

## Test rapido dopo il deploy

1. Apri una finestra nuova o anonima.
2. Visita un link tipo:
   `https://travirae.com/influencers-vlogs.html?creator=CREATOR_A&post=POST_A`
3. Apri la console browser e lancia:
   `window.traviraeAffiliate.getAttributionDebug()`
4. Dovresti vedere:
   - `session_ref` = affiliate slug del creator A
   - `session_ref_source` = `creator_post`
5. Vai alla pagina Hotel o Voli nello stesso tab.
6. I widget generali useranno il valore salvato in sessione.

## Priorità finale

1. `?ref=AFFILIATE` esplicito nell'URL.
2. Widget interno a un post creator: vince il tracking code di quel post.
3. Link diretto a un post creator: imposta il creator del post come affiliato della sessione.
4. Nessun ref e nessun post creator: traffico direct.
