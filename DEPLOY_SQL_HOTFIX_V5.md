# SQL hotfix v5 — errore 42P16 su admin_affiliate_overview

Se in Supabase SQL Editor hai visto questo errore:

`cannot change name of view column "booking_clicks_total" to "widget_clicks_total"`

usa questo file:

`supabase/sql/SCRIPT_16_admin_affiliate_overview_hotfix.sql`

## Cosa fare
1. Apri Supabase → SQL Editor.
2. Crea una nuova query.
3. Incolla tutto il contenuto di `SCRIPT_16_admin_affiliate_overview_hotfix.sql`.
4. Premi **Run**.

## Cosa sistema
- ricrea in modo sicuro `public.admin_affiliate_overview`
- lascia disponibile la funzione `public.get_affiliate_widget_outbound_totals(...)`
- sblocca il conteggio corretto di `Click widget outbound (totale sito + post)` in area affiliati e admin

## Devi ricaricare GitHub?
Se hai già pubblicato il frontend v4, per questo errore specifico non è obbligatorio.
Serve soprattutto il fix SQL.
