# Image Fetcher (v6) – Travirae

Questo pacchetto scarica **immagini reali e nitide** (da Unsplash Featured) e le salva **in LOCALE** nelle cartelle del sito, così **non servono URL esterni** a runtime.

## Come si usa
1. Scarica e scompatta **travirae-travel-site-v5.zip** (o v6) in una cartella, ad es. `~/travirae`.
2. Scarica e scompatta **travirae-image-fetcher-v6.zip** accanto al sito, ad es. `~/travirae-image-fetcher`.
3. Da terminale:
   ```bash
   cd ~/travirae-image-fetcher
   python3 -m venv .venv && source .venv/bin/activate  # su Windows: .venv\Scripts\activate
   pip install pillow
   python fetch_images.py --site-root ../travirae-travel-site-v5  # o il path del tuo sito
   ```
4. Il tool scarica e ottimizza:
   - `assets/img/bars/*.jpg` – immagini per le **barre** (una per sottocategoria)
   - `assets/img/destinations/*.jpg` – immagini per **tutte** le destinazioni
5. Fai **commit & push** su GitHub. Il sito userà **solo immagini locali**.

> Se vuoi evitare richieste multiple, esegui il tool una sola volta e committa i file generati nel repository.

## Note
- Le ricerche sono curate per puntare a **landmark** o scene rappresentative (es: *Roma Colosseum*, *Tokyo Shibuya*, *Zermatt Matterhorn*, ...).
- Puoi sostituire qualsiasi immagine con una tua foto: mantieni lo **stesso nome file**.
