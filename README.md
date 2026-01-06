# Stay22 Map Embed (GitHub Pages)

This is a tiny static site that embeds a Stay22 map.

## Tracking rules kept

- The embed ID after `/embed/` is kept **unchanged**:
  - `68e0453924ecc1f8e80860e1`

## Goal

Make sure the destination field in the top-left bar does **not** show a pre-filled location text by default.

This implementation forces the map search-bar title/label to be visually empty by setting the `venue` parameter to a zero-width space.

## Optional sub-tracking (campaign)

You can pass a sub-tracking label via the page URL:

`?campaign=YOUR_AFFILIATE_SLUG`

Example:

`https://YOUR_GITHUB_PAGES_URL/?campaign=mario`

The page will append the same `campaign` value to the Stay22 iframe URL.

## Deploy on GitHub Pages

1. Upload `index.html` to a GitHub repository (root).
2. GitHub repo → **Settings** → **Pages**
3. Source: **Deploy from a branch**
4. Branch: `main`, folder: `/ (root)`
