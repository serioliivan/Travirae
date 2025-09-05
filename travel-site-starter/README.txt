Fly&Stay — static travel site (EN & ES)
======================================

1) What this is
- A free, static website ready for GitHub Pages.
- Multi-language (English and Spanish), with sample route pages.
- Legal pages and SEO basics (robots.txt, sitemap.xml, hreflang links).

2) What you must add
- Travelpayouts widgets (copy/paste into the placeholders).
- Cookie banner (CMP) script (e.g., CookieYes) in <head>.
- GA4 and Microsoft Clarity, connected via the CMP (optional but recommended).
- Replace YOUR-USERNAME and YOUR-REPO in sitemap.xml and robots.txt.
- (Optional) Replace the "Fly&Stay" brand with your brand name.

3) How to publish on GitHub Pages (short)
- Create a public repo on GitHub.
- Upload all files from this folder (keep the /en and /es folders).
- On GitHub: Settings → Pages → Source: "Deploy from a branch", Branch: "main", Folder: "/ (root)". Save.
- GitHub will show your site URL (usually https://YOUR-USERNAME.github.io/YOUR-REPO/).

4) Where to paste widgets
- en/index.html (homepage): Flights + Hotels sections
- en/flights-london-bangkok.html: Flight widget (prefill to LON → BKK)
- en/hotels-tokyo.html: Hotel widget (destination Tokyo)
- es/index.html: Vuelos + Hoteles sections
- es/vuelos-londres-bangkok.html: Vuelos LON → BKK
- es/hoteles-tokio.html: Hoteles en Tokio

5) Duplicate a route page
- Copy en/flights-london-bangkok.html → rename (e.g., flights-rome-paris.html).
- Edit the title, text, and prefill codes in the widget (origin/destination).
- Do the same in ES, and link both pages with "alternate" and nav links.
