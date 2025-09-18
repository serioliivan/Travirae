# Travirae – Sito di viaggi (statico)

Sito statico, **mobile-first e moderno**, con **mappa Stay22 integrata** nella hero, categorie ad **accordion**, **destinazioni popolari** e pagina **Voli**.

## Struttura
- `index.html` – homepage con mappa, categorie, popolari, ispirazione, per viaggiatori.
- `flights.html` – pagina di ricerca voli (apre una query smart su Google Flights).
- `assets/css/style.css` – stile moderno, responsive.
- `assets/js/main.js` – interazioni (accordion, scroll alla mappa, form voli).
- `assets/img/logo.svg` – logo semplice SVG.

## Deploy su GitHub Pages
1. Crea un nuovo repo su GitHub (es. `travirae-travel-site`).
2. Carica **tutti** i file di questa cartella.
3. Vai su **Settings → Pages** e scegli:
   - **Branch**: `main` (root).
4. L’URL sarà qualcosa tipo `https://tuo-utente.github.io/travirae-travel-site/`.

## Personalizzazioni consigliate
### 1) Stay22 map per città
Nella homepage la mappa mostra l’embed che mi hai fornito. Se vuoi **cambiare mappa al click** su una città/suggerimento, inserisci le tue embed URL nel file `assets/js/main.js` dentro l’oggetto:
```js
const stay22Embeds = {
  'Roma': 'https://www.stay22.com/embed/ROMA_MAP_ID',
  'Parigi': 'https://www.stay22.com/embed/PARIGI_MAP_ID',
  // ...
};
```
Se non c’è una voce, il sito **scrollerà semplicemente** alla mappa corrente mostrando l’etichetta aggiornata.

### 2) Immagini
Le foto sono caricate da Unsplash tramite URL pubblici. Puoi sostituirle con le tue immagini locali o di brand.

### 3) Newsletter
Il form ha l’attributo `data-netlify="true"` per funzionare **gratis** con Netlify Forms (se pubblichi su Netlify). 
In alternativa integra il tuo provider (Mailchimp, Brevo, ecc.).

### 4) SEO
Aggiorna i meta `title` e `description` in `index.html` e `flights.html` con il tuo brand e keyword.

---

**Buon lavoro!** ✈️
