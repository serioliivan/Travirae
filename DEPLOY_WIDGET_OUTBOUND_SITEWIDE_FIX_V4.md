# Deploy v4 — widget outbound site-wide fix

## 1) GitHub
Upload the updated project files and deploy normally.

## 2) Supabase SQL Editor
Run this script after the deploy:

`supabase/sql/SCRIPT_15_widget_outbound_sitewide_fix.sql`

Re-run it even if you already ran SCRIPT_14. It is safe to reapply and keeps the affiliate/admin dashboards aligned.

## What this version changes
- keeps `Click widget outbound (totale sito + post)` aligned with site widgets + creator posts
- centers the Stay22 CTA button inside creator post widgets
- renames the post KPI label from `Aperture popup post` to `Aperture post` inside the creator profile area
- improves site widget click tracking by sending the event through Supabase REST with `keepalive`, which is more reliable for outbound clicks
