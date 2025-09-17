
# Travirae – Landing aggiornata con slideshow e legale

- Navbar come da mock (HOME, VOLI, HOTEL, PARTNER, LOGIN, SIGN UP)
- **Hero slideshow**: 6 sfondi (Unsplash) – cambio automatico ogni **45s**
- Hero con widget **Travelpayouts/Aviasales**
- Sotto l'hero: form mini di ricerca **Stay22** (address + date) che aggiorna la mappa
- Footer con **informativa affiliati** + link a **Privacy**, **Cookie**, **Termini**

## Modifica immagini sfondo
Lista in `assets/js/config.js` (`BG_IMAGES`). Attualmente sono URL **Unsplash Source** (dimensione 1920x1080).
Nota: Unsplash consiglia l'API ufficiale; `source.unsplash.com` continua a funzionare ma è deprecato.

## Partner ID
- Stay22 AID: `travirae` (LMA attivo in `<head>`)
- Stay22 embed: `68bed7d007d38cf140108e0d`
- Travelpayouts marker: `669407` – TRS: `454819`

## Pubblicazione
Carica l'intera cartella su GitHub Pages. Il file `.nojekyll` non è necessario ma puoi aggiungerlo se usi cartelle con underscore.

## Crediti immagini
Vedi i link nel footer (Unsplash).
