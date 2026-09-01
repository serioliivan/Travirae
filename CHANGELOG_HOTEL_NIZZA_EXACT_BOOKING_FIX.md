# Hotel specifico: correzione Hotel Nizza Riccione

- Aggiunto collegamento Booking.com diretto per **Hotel B&B Nizza Riccione** (`/hotel/it/nizza-riccione.html`).
- Il collegamento continua a transitare da Stay22 Allez con `aid=travirae` e con l'eventuale `campaign` del creator/affiliato.
- Per gli altri hotel, la ricerca Booking usa ora il nome della struttura e un riferimento sintetico alla città, non più l'indirizzo completo, che poteva peggiorare il riconoscimento.
- Conservati Google Places, date, ospiti, lingua, valuta e tracking Supabase.
- Nessuna modifica SQL o alla Edge Function è richiesta.
