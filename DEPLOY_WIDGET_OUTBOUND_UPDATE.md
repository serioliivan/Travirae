# Deploy note — outbound widget click update

Questo aggiornamento non richiede nuove tabelle o nuove edge function.

## Cosa fa
- aggiunge un pulsante visibile **Apri su Stay22** sulle mappe Stay22 del sito
- traccia i click outbound sito-wide nella tabella `influencer_post_events` con `metadata.source = "site_widget"`
- mantiene separate le metriche creator già esistenti
- semplifica il box creator nell'area affiliati

## Cosa devi fare
1. carica i file su GitHub / hosting
2. attendi il deploy

## Serve qualcosa fuori da GitHub?
No, se il tuo progetto ha già attiva la parte creator/influencer su Supabase.

Le nuove metriche sito-wide vengono salvate usando la tabella già esistente `influencer_post_events`.
