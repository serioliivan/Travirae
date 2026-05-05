# Deploy v4/v5 — widget outbound site-wide fix

## 1) GitHub
Upload the updated project files and deploy normally.

## 2) Supabase SQL Editor
If you are doing a fresh setup, run:

`supabase/sql/SCRIPT_15_widget_outbound_sitewide_fix.sql`

If you already saw this error:

`cannot change name of view column "booking_clicks_total" to "widget_clicks_total"`

run this hotfix instead:

`supabase/sql/SCRIPT_16_admin_affiliate_overview_hotfix.sql`

## What this version changes
- keeps `Click widget outbound (totale sito + post)` aligned with site widgets + creator posts
- centers the Stay22 CTA button inside creator post widgets
- renames the post KPI label from `Aperture popup post` to `Aperture post` inside the creator profile area
- improves site widget click tracking by sending the event through Supabase REST with `keepalive`, which is more reliable for outbound clicks
- avoids the PostgreSQL view-column rename error by rebuilding `admin_affiliate_overview` safely
