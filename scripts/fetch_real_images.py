#!/usr/bin/env python3
"""
Scarica foto REALI (royalty-free) per ogni categoria e le salva in assets/img/subcats/.
- Supporto Pexels e Pixabay (consigliati) + Unsplash (solo in fallback).
- Tutte le immagini vengono scaricate LOCALI (niente link esterni nel sito).
- Richiede una chiave API PEXELS o PIXABAY (gratuite) impostata come variabile d'ambiente:
    export PEXELS_API_KEY="la_tua_chiave"
  oppure
    export PIXABAY_API_KEY="la_tua_chiave"

Uso:
    python3 scripts/fetch_real_images.py

Note licenza:
- Pexels: licenza libera per uso commerciale, non serve attribuzione (consigliata).
- Pixabay: licenza 'Pixabay License' simile a CC0.
- Unsplash: lecita per uso commerciale; questa utility usa la Simple Source endpoint solo come fallback.
"""
import os, sys, json, time, textwrap, re, unicodedata, pathlib
from pathlib import Path
import requests

ROOT = Path(__file__).resolve().parents[1]
OUTDIR = ROOT / "assets" / "img" / "subcats"
OUTDIR.mkdir(parents=True, exist_ok=True)

def slugify(s):
    s = s.lower()
    s = unicodedata.normalize('NFD', s).encode('ascii', 'ignore').decode('ascii')
    s = re.sub(r'[^a-z0-9]+','-', s).strip('-')
    return s

# Leggi le categorie dall'HTML
html = (ROOT / "index.html").read_text(encoding="utf-8", errors="ignore")
labels = re.findall(r'<button[^>]*class="[^"]*accordion-toggle[^"]*"[^>]*>\s*<span[^>]*class="label"[^>]*>(.*?)</span>', html, flags=re.S|re.I)
labels = [re.sub(r'<.*?>','', l).strip() for l in labels]
seen=set(); ordered=[]
for l in labels:
    if l not in seen:
        seen.add(l); ordered.append(l)

def pick_query(slug):
    mapping = {
        'mare':'beach sea coast', 'isole':'tropical island lagoon', 'montagna':'mountain alps peak',
        'lago':'lake alpine', 'cultura':'museum old town', 'relax':'spa resort',
        'citta':'city skyline europe', 'safari':'safari africa wildlife', 'esotici':'tropical paradise',
        'natura':'forest nature park', 'fuga-romantica':'romantic couple travel', 'anniversario':'anniversary romantic travel',
        'luna-di-miele':'honeymoon overwater', 'addio-celibato':'party nightlife travel',
        'capodanno-caldo':'new year beach fireworks', 'premium':'luxury resort', 'luxury':'luxury resort',
        'estate':'summer beach', 'primavera':'spring flowers trip', 'autunno':'autumn foliage travel', 'inverno':'winter snow travel',
        'snowboard':'snowboard freeride', 'sci':'ski skiing', 'trekking':'hiking trail', 'arrampicata':'rock climbing',
        'ciclismo':'cycling road bike', 'surf':'surf wave', 'immersioni':'scuba diving reef', 'snorkeling':'snorkeling reef',
        'golf':'golf course green'
    }
    return mapping.get(slug, slug.replace('-', ' '))

def download_pexels(query, out_path, api_key):
    url = "https://api.pexels.com/v1/search"
    headers = {"Authorization": api_key}
    params = {"query": query, "per_page": 1, "size": "large", "orientation":"landscape"}
    r = requests.get(url, headers=headers, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    if data.get("photos"):
        src = data["photos"][0]["src"]["large"]
        img = requests.get(src, timeout=30)
        img.raise_for_status()
        out_path.write_bytes(img.content)
        return True
    return False

def download_pixabay(query, out_path, api_key):
    url = "https://pixabay.com/api/"
    params = {"key": api_key, "q": query, "image_type":"photo", "safesearch":"true", "orientation":"horizontal", "per_page": 3}
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    data = r.json()
    hits = data.get("hits") or []
    for h in hits:
        src = h.get("largeImageURL") or h.get("webformatURL")
        if src:
            img = requests.get(src, timeout=30)
            img.raise_for_status()
            out_path.write_bytes(img.content)
            return True
    return False

def download_unsplash_simple(query, out_path):
    # Fallback senza API (licenza Unsplash). È un redirect a una foto casuale per la query.
    url = "https://source.unsplash.com/1600x400/?" + requests.utils.quote(query)
    r = requests.get(url, timeout=30, allow_redirects=True)
    r.raise_for_status()
    out_path.write_bytes(r.content)
    return True

def main():
    pexels_key = os.environ.get("PEXELS_API_KEY")
    pixabay_key = os.environ.get("PIXABAY_API_KEY")
    if not (pexels_key or pixabay_key):
        print("✋ Imposta almeno una chiave API: PEXELS_API_KEY o PIXABAY_API_KEY (gratuite).")
        print("    Esempio: export PEXELS_API_KEY=...")
    ok=0
    for label in ordered:
        sl = slugify(label)
        out_path = OUTDIR / f"{sl}.jpg"
        if out_path.exists():
            print(f"• {label} → già presente ({out_path.name})")
            ok+=1
            continue
        q = pick_query(sl)
        print(f"→ Scarico '{label}' ({q})...", end=" ")
        done=False
        if pexels_key:
            try:
                done = download_pexels(q, out_path, pexels_key)
            except Exception as e:
                print("[Pexels fallita]", e)
        if (not done) and pixabay_key:
            try:
                done = download_pixabay(q, out_path, pixabay_key)
            except Exception as e:
                print("[Pixabay fallita]", e)
        if not done:
            try:
                done = download_unsplash_simple(q, out_path)
            except Exception as e:
                print("[Unsplash fallback fallito]", e)
        print("OK" if done else "FALLITO")
        if done:
            ok+=1
            time.sleep(0.4)
    print(f"Fatto. {ok} immagini locali pronte in {OUTDIR}.")
    print("Ora puoi aprire index.html: i riquadri useranno SOLO file locali.")

if __name__ == "__main__":
    main()
