# Deploy note — rimozione booking click

## Cosa è già stato fatto in questo ZIP
- tracking booking click disattivato nel frontend
- overlay invisibili rimossi da Stay22 e Aviasales
- dashboard admin ripulita e orientata a vendite confermate / traffico / guadagni maturati
- dashboard affiliato ripulita e rinominata
- script SQL opzionale aggiunto: `supabase/sql/SCRIPT_13_optional_remove_booking_clicks.sql`

## Deploy minimo
Se il tuo sito è pubblicato da GitHub / GitHub Pages / Netlify / Vercel come static site, per pubblicare queste modifiche ti basta:
1. sostituire i file del progetto con quelli di questo ZIP
2. fare commit/push sul repository
3. attendere il deploy del provider statico

## Serve fare qualcosa fuori da GitHub?
Non è obbligatorio.
Il frontend aggiornato funziona anche senza cambiare il database, perché il tracking booking click è già spento nel codice.

## Quando conviene fare anche il passaggio su Supabase
Esegui `supabase/sql/SCRIPT_13_optional_remove_booking_clicks.sql` in Supabase SQL Editor se vuoi anche:
- pulire la view `admin_affiliate_overview`
- fare in modo che `Ultima attività` non dipenda più dai vecchi booking click storici
- allineare meglio la logica database alla nuova dashboard

## Pulizia storica opzionale
Lo script non cancella automaticamente i vecchi `status='click'`.
Se vuoi eliminarli, nello stesso script trovi una `DELETE` commentata da valutare manualmente.

## In sintesi
- **Solo GitHub**: sufficiente per spegnere tracking booking click e rimuovere overlay invisibili.
- **GitHub + Supabase SQL opzionale**: consigliato se vuoi anche pulizia completa lato database / admin overview.
