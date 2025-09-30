
# Travirae — Slim build for GitHub upload

This build keeps the file count under 100 so you can upload via the GitHub web UI in one go.

## What’s inside
- Multilingual folders: /it, /en, /zh, /es, /hi, /ar, /fr, /ru, /de
- SEO: per‑language `sitemap.xml` (relative URLs), `hreflang` and `canonical` in every page
- CMP (cookie banner) implemented
- Stay22 maps forced `loading="eager"`
- Single i18n bundle: `assets/i18n/i18n.min.json` (contains all languages)

Just upload the whole archive contents to a new repository and enable GitHub Pages (root).

