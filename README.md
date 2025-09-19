# Travirae – Sito di viaggi (v2 con popup)

Sito statico, **mobile-first e moderno**, con **mappa Stay22 aggiornata** nella hero, **destinazioni popolari con popup ("Scopri di più")**, categorie ad **accordion**, sezione **Ispirazione** e **Per viaggiatori**, + pagina **Voli**.

## Novità rispetto alla v1
- Immagine di **New York** aggiornata con la foto della **Statua della Libertà**.
- Pulsanti delle destinazioni: **“Scopri di più”** (aprono un **popup** con:
  - **Titolo**
  - **Mappa Stay22**
  - **Descrizione breve**
  - **Punti forti / posti consigliati**
  - **Periodo consigliato**
  - **Bonus**
- **Mappa Stay22** aggiornata all’embed fornito: `68cd1c4dc39296915ec0c753`.

## Struttura
- `index.html` – homepage + **modal destinazioni**.
- `flights.html` – pagina di ricerca voli (apre **Google Flights**).
- `assets/css/style.css` – stile moderno, responsive.
- `assets/js/main.js` – interazioni (menu mobile, accordion, modal, form voli, *optional Supabase*).
- `assets/img/nyc.jpg` – immagine New York (quella che mi hai inviato).
- `assets/img/logo.svg` – logo SVG.
- `README.md` – questa guida.

## Personalizzare i contenuti del popup
I testi delle destinazioni si trovano in `assets/js/main.js`, nell’oggetto `destinationsContent`.  
Puoi aggiungere/aggiornare città modificando:
```js
'New York': {
  title: 'New York 🗽',
  mapSrc: 'https://www.stay22.com/embed/68cd1c4dc39296915ec0c753',
  desc: '...',
  highlights: ['...', '...'],
  best: '...',
  bonus: '...'
}
```
Se vuoi usare **mappe Stay22 diverse per ogni città**, sostituisci `mapSrc` con il relativo link embed.

---

## Opzione: caricare i contenuti del popup su **Supabase**
**Sì, è possibile** e spesso **semplifica gli aggiornamenti** perché modifichi i testi da un pannello (database) senza toccare il codice.  
Pro/Contro rapidi:
- ✅ Aggiornamenti istantanei, nessun nuovo deploy.
- ✅ Gestisci tante destinazioni facilmente (anche da foglio CSV → import in Supabase).
- ⚠️ Richiede una **chiamata di rete** in più (leggera), una **chiave pubblica (anon)** e settaggio **RLS** sicuro.
- ⚠️ Se il DB è offline, il sito usa i contenuti statici (fallback).

### Come fare (passi veloci)
1. Crea un progetto su Supabase e una tabella `destinations`:
   - `id uuid` (PK, default)
   - `slug text` (unique, es. "New York")
   - `title text`
   - `map_src text`
   - `desc text`
   - `highlights jsonb` (array di stringhe)
   - `best text`
   - `bonus text`
   - `active boolean` (default `true`)
2. Attiva **RLS** e aggiungi una policy di **SELECT** pubblica in sola lettura.
3. Nel tuo `index.html` (prima di `main.js`) aggiungi **solo se vuoi usare Supabase**:
   ```html
   <script>
     window.SUPABASE_URL = 'https://<YOUR-PROJECT>.supabase.co';
     window.SUPABASE_ANON_KEY = '<YOUR-ANON-KEY>';
   </script>
   <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
   ```
4. `main.js` rileva automaticamente Supabase e **sovrascrive** i contenuti statici con quelli del DB.

### Schema JSON d’esempio (per una riga)
```json
{
  "slug": "New York",
  "title": "New York 🗽",
  "map_src": "https://www.stay22.com/embed/68cd1c4dc39296915ec0c753",
  "desc": "La Big Apple è energia pura...",
  "highlights": ["Times Square", "Central Park", "High Line"],
  "best": "Apr–Giu e Set–Ott",
  "bonus": "Rooftop al tramonto"
}
```

---

## Deploy su GitHub Pages
1. Crea un repo (es. `travirae-travel-site`).
2. Carica **tutto** il contenuto di questa cartella.
3. Vai su **Settings → Pages** → `Branch: main` (root).

**Buon lavoro! ✈️**