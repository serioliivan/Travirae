# Stay22 Map – GitHub-ready static site

Questa è una piccola pagina statica (perfetta per GitHub Pages) che incorpora la tua mappa Stay22:

- **Embed ID invariato**: `68e0453924ecc1f8e80860e1` (non viene mai modificato)
- **Sub-tracking**: se visiti la pagina con `?campaign=TUO_SLUG`, la pagina passa `campaign` all'iframe (non cambia significato, lo inoltra soltanto).
- **Campo destinazione NON pre-compilato** (niente "Dubai ..."): il widget riceve `venue` impostato a un carattere invisibile, così non rimpiazza il valore con una destinazione salvata.

## Uso

Apri `index.html` localmente oppure pubblica la cartella su GitHub Pages.

### Sub-tracking (opzionale)

Esempio:

`https://tuodominio.tld/?campaign=affiliato_123`

## File

- `index.html`
- `styles.css`
- `script.js`
