# Stay22 Map — EN / GBP (Minimal Site)

This is a minimal static website that embeds your Stay22 map **in English** with **GBP** currency, keeping your affiliate code intact (`68e03b7024ecc1f8e80855ed`).

## Files
- `index.html` — full‑screen map iframe.
- (Optional) `CNAME` — if you want to use a custom domain on GitHub Pages, put your domain here.

## How to deploy on GitHub Pages

1. Create a new repo (e.g., `stay22-map-site`).
2. Upload the contents of this folder (at minimum `index.html`).
3. Commit & push.
4. Go to **Settings → Pages**:
   - **Source**: select `Deploy from a branch`.
   - **Branch**: select `main` (or `master`) and `/ (root)` folder.
   - Click **Save**. After a minute, your site will be live at `https://<your-username>.github.io/<repo>/`.

### Custom Domain (optional)
- In **Settings → Pages**, set your custom domain (e.g., `map.yourdomain.com`).
- Create a `CNAME` file in the repo root containing just the domain:
  ```
  map.yourdomain.com
  ```
- Update your DNS to point the domain to GitHub Pages as documented by GitHub.

## How to change language/currency later
You can change them via URL parameters in the iframe `src`:
```
?lang=<en|it|fr|...>&currency=<GBP|EUR|USD|...>
```
Example (English + GBP — already set):
```
https://www.stay22.com/embed/68e03b7024ecc1f8e80855ed?lang=en&currency=GBP
```

Enjoy!
