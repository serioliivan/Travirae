
# Travirae – sito statico (GitHub Pages)

Sito pronto con integrazione **Stay22** (LMA + mappa embed) e **Travelpayouts** (widget voli).

## Struttura
```
travirae-site/
├─ index.html
├─ flights.html
├─ hotels.html
├─ events.html
├─ affiliates.html
├─ privacy.html
├─ terms.html
├─ cookies.html
├─ assets/
│  ├─ css/styles.css
│  └─ js/{
│      config.js  ← modifica qui gli ID se cambiano
│      main.js
│    }
├─ .nojekyll
└─ README.md
```

## ID e Script (già inclusi)
- Stay22 AID: `travirae`
- Stay22 Embed ID: `68bed7d007d38cf140108e0d`
- Stay22 LMA: incluso in `<head>` di tutte le pagine
- Travelpayouts marker: `669407`
- Travelpayouts TRS: `454819`

> **Sicurezza:** NON è necessario pubblicare l'API token Travelpayouts o lo Stay22 report token in questo sito statico. Tienili privati.

## Pubblicazione su GitHub Pages (rapidissima)

**Opzione A – User/Org Pages**
1. Crea un repo chiamato `USERNAME.github.io`.
2. Carica tutti i file della cartella `travirae-site/` nella radice del repo.
3. Vai su **Settings → Pages** e verifica che la sorgente sia `main` / root (di solito è automatico).
4. Attendi 1–2 minuti e visita `https://USERNAME.github.io/`.

**Opzione B – Project Pages**
1. Crea un repo (es. `travirae-site`).
2. Carica tutti i file nella radice del repo.
3. **Settings → Pages** → Source: `Deploy from a branch` → `main` / root.
4. Apri l'URL indicato da GitHub Pages (es. `https://USERNAME.github.io/travirae-site/`).

> Se usi **dominio personalizzato**, aggiungi il CNAME da **Settings → Pages → Custom domain** e configura i DNS.

## Modifiche rapide
- **Colori/stile:** `assets/css/styles.css`
- **Widget voli:** codice in `index.html` e `flights.html` (puoi sostituirlo con altri widget Travelpayouts).
- **Mappa alloggi:** `hotels.html` (iframe embed) + immagine statica come fallback.
- **Nuove mappe/eventi:** duplica `hotels.html` o `events.html` e sostituisci l'embed ID o usa l'URL parametrico con `aid`, `lat/lng` e date.

## Note
- Il file `.nojekyll` disabilita il build Jekyll su GitHub Pages.
- Aggiungi un banner consenso cookie se richiesto.
