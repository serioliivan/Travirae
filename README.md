# Travirae – Sito di viaggi (v4, categorie estese)

**Novità richieste:**
- Rimosse le sezioni *Ispirazione*, *Destinazioni popolari (vecchia)*, *Per tipologia di viaggiatore*.
- **Categorie** ora include: Mare, Montagna, Lago, Isole, Cultura, Relax, Città, Safari, Esotici, Natura, **Destinazioni popolari** (lista fornita dall’utente).
- Aggiunte sezioni con lo **stesso design** (card barra con immagine + tendina + carosello): **Occasioni speciali**, **Tipo di viaggiatore**, **Destinazioni per budget**, **Stagioni**, **Sport & avventura**.
- Ogni sotto‑categoria mostra **10 destinazioni** (tranne “Destinazioni popolari” con tutte le destinazioni indicate).
- Immagini delle barre **meno opache** (luminosità normale).
- Popup **Scopri di più** con mappa Stay22 e descrizione lunga.

## Dove modificare
- **Immagini di sfondo** delle barre: `index.html`, attributo `style="--bg:url('...')"` su ciascuna categoria.
- **Liste destinazioni** per ogni sotto‑categoria: `index.html` (le card sono generate come markup statico).
- **Testi del popup**: `assets/js/main.js` → oggetto `destinationsContent` (fallback generico se mancano testi).
- **Stile**: `assets/css/style.css` (mobile‑first).

## Immagini
Le card usano **Unsplash Featured** per parola chiave (`https://source.unsplash.com/featured/800x600/?<query>`). Questo garantisce un’immagine nitida e **senza bordi bianchi**, con `object-fit: cover`. Puoi sostituire gli URL con foto specifiche del tuo brand per maggiore controllo.

## Supabase (opzionale)
Puoi caricare le descrizioni nel DB come nella v2/v3: aggiungi in `index.html` prima di `main.js`:
```html
<script>
  window.SUPABASE_URL = 'https://<PROJECT>.supabase.co';
  window.SUPABASE_ANON_KEY = '<ANON>';
</script>
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```
E usa una tabella `destinations` con colonne: `slug, title, map_src, desc, highlights(jsonb), best, bonus, active`.

## Deploy
Carica tutto su GitHub Pages o Netlify. Il form newsletter funziona su Netlify (Netlify Forms).

Buon lavoro! ✈️
