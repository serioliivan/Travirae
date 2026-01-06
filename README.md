# Stay22 • Mini-site (GitHub Pages)

Questo repository contiene una singola pagina (`index.html`) che incorpora il tuo widget Stay22 **senza modificare l'embed ID**.

## ✅ Tracking: cosa NON toccare

Nel file `index.html`:

- L'embed ID (parte dopo `/embed/`) è **immutato**: `68e0453924ecc1f8e80860e1`
- (Opzionale) se usi il sub-tracking per affiliati con `campaign`, questo template lo supporta:
  - apri la pagina aggiungendo `?campaign=<affiliate_slug>`
  - lo script aggiunge `campaign` all'URL dell'iframe **senza cambiare** l'embed ID

Esempio:

- Pagina: `https://tuo-sito.github.io/tuo-repo/?campaign=mario`
- Iframe: `https://www.stay22.com/embed/68e0453924ecc1f8e80860e1?campaign=mario`

## Campo destinazione

Il widget Stay22 può ricordare l’ultima destinazione inserita dall’utente (cookie/localStorage) e quindi mostrare un valore già compilato.

Per ottenere il comportamento che vuoi (campo **vuoto** come placeholder), l’`iframe` è sandboxato **senza** `allow-same-origin`, così il widget non può riutilizzare lo storage precedente e il campo viene resettato ad ogni caricamento.

Se vuoi rimuovere questa forzatura, elimina l’attributo `sandbox="..."` dall’`iframe`.

## Pubblicazione su GitHub Pages (rapida)

1. Crea un nuovo repo su GitHub e carica questi file.
2. Vai su **Settings → Pages**
3. In **Build and deployment** seleziona:
   - Source: `Deploy from a branch`
   - Branch: `main` (o `master`) e folder: `/ (root)`
4. Salva: dopo pochi secondi avrai un URL tipo `https://<username>.github.io/<repo>/`

