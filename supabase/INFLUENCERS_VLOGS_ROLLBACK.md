# Influencers Vlogs — Rollback

## Rollback codice statico
1. Rimetti online il backup precedente del sito.
2. Se usi CDN, svuota la cache.
3. Verifica che `index`, `flights`, `area-affiliati` e `admin-affiliati` tornino alla versione precedente.

## Rollback database (soft)
Se vuoi disattivare il modulo senza cancellare dati storici:
1. Disabilita i link di navigazione verso `influencers-vlogs.html`, `area-affiliati-profilo.html`, `admin-influencer.html`.
2. Non usare più il pannello creator/admin influencer.
3. Lascia tabelle e bucket esistenti come archivio.

## Rollback database (hard)
Esegui solo se sei sicuro di voler eliminare il modulo:
1. Elimina manualmente policy storage dei bucket influencer.
2. Elimina i bucket `influencer-avatars` e `influencer-post-media`.
3. Da SQL Editor elimina nell’ordine:
   - viste `influencer_creator_private_stats`, `influencer_post_kpis`
   - funzioni `review_influencer_post`, `review_influencer_profile`, `get_influencer_public_post`, `get_influencer_public_posts`, `get_influencer_public_profile`, `resolve_influencer_tracking_code`
   - tabelle `influencer_post_events`, `influencer_post_widgets`, `influencer_post_revisions`, `influencer_posts`, `influencer_profile_revisions`, `influencer_profiles`
4. Re-deploya la Edge Function precedente `import-travelpayouts` se vuoi rimuovere la compatibilità influencer.

## Nota
Il rollback hard rimuove anche tracking, revisioni e media caricati dai creator.
