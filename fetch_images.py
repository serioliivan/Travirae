#!/usr/bin/env python3

"""
Scarica immagini REALI e nitide (da Unsplash Featured) e le salva in locale
nelle cartelle del sito: assets/img/bars/ e assets/img/destinations/.
Non servono API key.

Uso:
  1) python3 fetch_images.py --site-root ../travirae-travel-site-v5
  2) (opzionale) --max-size 1600 per ridimensionare (mantiene qualità)
"""

import os, json, argparse, time, io
from urllib.parse import quote
from urllib.request import urlopen, Request
from PIL import Image

def dl(url, timeout=30):
    req = Request(url, headers={"User-Agent":"Mozilla/5.0"})
    with urlopen(req, timeout=timeout) as r:
        return r.read()

def save_jpg(bytes_data, path, max_size=None, quality=88):
    img = Image.open(io.BytesIO(bytes_data)).convert("RGB")
    if max_size:
        w,h = img.size
        if max(w,h) > max_size:
            scale = max_size/max(w,h)
            img = img.resize((int(w*scale), int(h*scale)), Image.LANCZOS)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    img.save(path, "JPEG", quality=quality, optimize=True, progressive=True)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--site-root", required=True, help="Cartella del sito (dove c'è index.html)")
    ap.add_argument("--max-size", type=int, default=1600)
    ap.add_argument("--sleep", type=float, default=0.6, help="Pausa tra download (per non martellare il server)")
    args = ap.parse_args()

    base = args.site_root
    bars_json = os.path.join(os.path.dirname(__file__), "manifests", "bars.json")
    dest_json = os.path.join(os.path.dirname(__file__), "manifests", "destinations.json")

    with open(bars_json, "r", encoding="utf-8") as f: bars = json.load(f)
    with open(dest_json, "r", encoding="utf-8") as f: dests = json.load(f)

    # 1) Bars
    print("==> Scarico immagini per le BARRE...")
    for key, item in bars.items():
        section, sub = key.split("/", 1)
        slug = section.lower().replace(" ","-")+"-"+sub.lower().replace(" ","-").replace("'", "").replace("’","")
        url = f"https://source.unsplash.com/1600x500/?{quote(item['query'])}"
        out = os.path.join(base, "assets", "img", "bars", f"{slug}.jpg")
        try:
            if not os.path.exists(out):
                img_bytes = dl(url)
                save_jpg(img_bytes, out, max_size=1600, quality=85)
                print("✔", sub, "->", out)
            else:
                print("• Già presente:", out)
        except Exception as e:
            print("✖ Errore su", sub, ":", e)
        time.sleep(args.sleep)

    # 2) Destinations
    print("\n==> Scarico immagini per le DESTINAZIONI...")
    for slug, item in dests.items():
        name = item["name"]
        url = f"https://source.unsplash.com/1200x900/?{quote(item['query'])}"
        out = os.path.join(base, "assets", "img", "destinations", f"{slug}.jpg")
        try:
            if not os.path.exists(out):
                img_bytes = dl(url)
                save_jpg(img_bytes, out, max_size=1400, quality=85)
                print("✔", name, "->", out)
            else:
                print("• Già presente:", out)
        except Exception as e:
            print("✖ Errore su", name, ":", e)
        time.sleep(args.sleep)

    print("\nFATTO. Ora fai il commit/push su GitHub e il sito mostrerà tutte le immagini in LOCALE.")

if __name__ == "__main__":
    main()
