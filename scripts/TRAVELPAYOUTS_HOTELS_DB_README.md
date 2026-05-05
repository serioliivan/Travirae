# Travelpayouts / Hotellook hotel DB snapshot support

This project can optionally read a local file at:

- `assets/data/travelpayouts-hotels-db.json`

The intended source is an **archived** Travelpayouts / Hotellook hotel DB export that you already possess from the historical endpoints documented by Travelpayouts:

- `lookup.json`
- `static/locations.json`
- `static/hotels.json`

Because Hotellook was shut down, the live API is no longer suitable as a runtime source. The safer approach in this static site is:

1. keep an archived export outside the frontend,
2. convert it into a compact local snapshot,
3. ship only the snapshot file with the website.

## Helper script

You can normalize archived exports with:

```bash
python scripts/build_travelpayouts_hotels_db.py \
  --locations /path/to/locations.json \
  --hotels-dir /path/to/hotels_exports \
  --output assets/data/travelpayouts-hotels-db.json
```

After the output file is present, the Influencer creator panel will automatically use it for the Hotel Map autocomplete, while preserving the existing fallback dataset.


## Optional live lookup helper

If you still have a working legacy Travelpayouts / Hotellook access path, you can also deploy the Edge Function:

- `supabase/functions/travelpayouts-hotel-autocomplete`

The frontend will try that function first and then fall back to the local snapshot and Aviasales/Travelpayouts places autocomplete for locations.
