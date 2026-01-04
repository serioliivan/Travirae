# Newsletter – deploy corretto (Supabase Edge Functions)

Se vedi in **Supabase → Edge Functions → Functions** che la colonna **URL** NON finisce con:

- `/functions/v1/newsletter-subscribe`
- `/functions/v1/newsletter-unsubscribe`
- `/functions/v1/newsletter-send`

allora hai creato le funzioni partendo da template (es. `smart-worker`, `bright-endpoint`, `swift-endpoint`) e poi le hai solo rinominate: **il nome cambia, ma lo slug/endpoint resta quello vecchio**.

Il sito Travirae, invece, chiama gli endpoint con i nomi `newsletter-*`, quindi se lo slug non combacia ottieni errori tipo **404 su OPTIONS** e quindi CORS.

## Soluzione consigliata (pulita)

1) Elimina le 3 funzioni “sbagliate” dal dashboard (quelle che hanno URL diverso).
2) Deploya le funzioni dal progetto (cartella `supabase/functions/`) con gli slug corretti.

## CORS/JWT

Per queste funzioni newsletter imposta **Verify JWT with legacy secret = OFF**.

- `newsletter-subscribe` e `newsletter-unsubscribe` devono essere pubbliche (chiunque può iscriversi/disiscriversi).
- `newsletter-send` è protetta **nel codice** (solo admin email), quindi lasciamo JWT toggle OFF per non rompere il preflight CORS.

## Template HTML (grafici)

Da questa versione il campo **Testo** della newsletter può contenere **HTML vero** (bottoni, immagini, layout).

- Se il testo contiene tag HTML (es. `<a>`, `<img>`, `<table>`), verrà inviato come **HTML**.
- Se invece inserisci testo normale, verrà inviato in modo sicuro e con **a capo preservati**.


## Placeholder utili

- `{{UNSUBSCRIBE_URL}}` → verrà sostituito con il link di disiscrizione per quell’utente.
  - Se NON lo inserisci nel tuo HTML, il sistema aggiunge automaticamente un piccolo footer con il link.
