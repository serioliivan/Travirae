# Changelog — Supabase 2026 GRANTS fix

Aggiornamento applicato allo ZIP Travirae:

- aggiunto `supabase/sql/SCRIPT_20_supabase_explicit_grants_2026.sql`;
- aggiunta copia comoda root `TRAVIRAE_SUPABASE_GRANTS_FIX.sql` con lo stesso contenuto operativo;
- aggiunte guide `SUPABASE_2026_GRANTS_CLICK_BY_CLICK.md` e `DEPLOY_SUPABASE_GRANTS_2026.md`;
- aggiornati gli script SQL esistenti con `GRANT` espliciti dove vengono create tabelle, viste e funzioni;
- aggiornato il setup per ricordare di eseguire lo script 20;
- aggiunti gli asset immagine mancanti `hero.jpg`, `hero-plane.jpg`, `flights-bg.jpg` per evitare 404 locali;
- nessuna modifica distruttiva a HTML/CSS/JS;
- nessuna modifica alle policy RLS esistenti;
- nessuna chiave segreta aggiunta al frontend.

Controlli eseguiti localmente:

- sintassi JavaScript dei file in `assets/js/*.js`;
- validità JSON dei file in `assets/data/**/*.json`;
- controllo riferimenti locali principali da HTML/CSS/JS;
- copertura degli oggetti Supabase usati da `.from(...)` e `.rpc(...)` nello script 20;
- integrità dello ZIP generato.

Nota: non è stato possibile eseguire query reali sul tuo progetto Supabase perché non ho accesso alle credenziali/live dashboard. Lo script SQL è idempotente e pensato per essere eseguito dal Supabase SQL Editor.
