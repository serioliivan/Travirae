#!/usr/bin/env python3
"""Build a local autocomplete snapshot from archived Travelpayouts/Hotellook hotel DB exports.

Expected inputs are archived files exported earlier from endpoints documented by Travelpayouts:
- static/locations.json
- one or more static/hotels.json responses (optionally one file per location)

Example:
    python scripts/build_travelpayouts_hotels_db.py \
      --locations exports/locations.json \
      --hotels-dir exports/hotels \
      --output assets/data/travelpayouts-hotels-db.json
"""
from __future__ import annotations

import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Tuple

LANG_PRIORITY = ["EN", "en", "IT", "it", "FR", "fr", "DE", "de", "ES", "es", "RU", "ru"]


def read_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def normalize_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def read_localized_name(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, str):
        return normalize_text(value)
    if isinstance(value, list):
        primary = next((item for item in value if isinstance(item, dict) and str(item.get("isVariation", "0")) == "0" and item.get("name")), None)
        if primary:
            return read_localized_name(primary.get("name"))
        first = next((item for item in value if item), None)
        return read_localized_name(first)
    if isinstance(value, dict):
        for key in LANG_PRIORITY:
            if key in value and value[key]:
                return read_localized_name(value[key])
        if value:
            first_key = next(iter(value))
            return read_localized_name(value[first_key])
    return ""


def parse_locations(payload: Any) -> Tuple[List[Dict[str, Any]], Dict[str, str]]:
    if not isinstance(payload, list):
        return [], {}
    locations: List[Dict[str, Any]] = []
    labels: Dict[str, str] = {}
    for row in payload:
        if not isinstance(row, dict):
            continue
        label = normalize_text(
            row.get("fullName")
            or row.get("cityName")
            or read_localized_name(row.get("name"))
            or row.get("name")
        )
        if not label:
            continue
        location_id = normalize_text(row.get("id"))
        record = {
            "type": "location",
            "locationId": location_id,
            "label": label,
            "value": label,
            "countryCode": normalize_text(row.get("countryCode") or row.get("code")),
            "lat": normalize_text((row.get("location") or {}).get("lat") or row.get("latitude")),
            "lon": normalize_text((row.get("location") or {}).get("lon") or row.get("longitude")),
        }
        locations.append(record)
        if location_id:
            labels[location_id] = label
    return locations, labels


def parse_hotels(payload: Any, location_labels: Dict[str, str]) -> List[Dict[str, Any]]:
    if isinstance(payload, dict):
        raw_hotels = payload.get("hotels") or []
    elif isinstance(payload, list):
        raw_hotels = payload
    else:
        raw_hotels = []
    hotels: List[Dict[str, Any]] = []
    for row in raw_hotels:
        if not isinstance(row, dict):
            continue
        hotel_name = normalize_text(
            row.get("fullName")
            or row.get("label")
            or read_localized_name(row.get("name"))
            or row.get("name")
        )
        location_id = normalize_text(row.get("locationId") or row.get("cityId"))
        location_name = normalize_text(
            row.get("locationName")
            or row.get("cityName")
            or location_labels.get(location_id)
            or read_localized_name(row.get("address"))
        )
        label = hotel_name
        if hotel_name and location_name and location_name.lower() not in hotel_name.lower():
            label = f"{hotel_name}, {location_name}"
        elif not label:
            label = location_name
        if not label:
            continue
        hotels.append(
            {
                "type": "hotel",
                "hotelId": normalize_text(row.get("id")),
                "locationId": location_id,
                "label": label,
                "value": label,
                "stars": row.get("stars"),
            }
        )
    return hotels


def iter_hotel_files(hotels_dir: Path) -> Iterable[Path]:
    if not hotels_dir.exists():
        return []
    return sorted([p for p in hotels_dir.iterdir() if p.is_file() and p.suffix.lower() == ".json"])


def dedupe_rows(rows: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    seen = set()
    out: List[Dict[str, Any]] = []
    for row in rows:
        key = (row.get("type"), normalize_text(row.get("label")).lower())
        if not key[1] or key in seen:
            continue
        seen.add(key)
        out.append(row)
    return out


def build_snapshot(locations_path: Path, hotels_dir: Path) -> Dict[str, Any]:
    locations_payload = read_json(locations_path)
    locations, labels = parse_locations(locations_payload)
    hotels: List[Dict[str, Any]] = []
    for hotel_file in iter_hotel_files(hotels_dir):
        try:
            hotels.extend(parse_hotels(read_json(hotel_file), labels))
        except Exception as exc:  # pragma: no cover - best effort helper
            print(f"[warn] skipped {hotel_file.name}: {exc}")
    return {
        "version": 1,
        "source": "travelpayouts_hotels_static_export",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "locations": dedupe_rows(locations),
        "hotels": dedupe_rows(hotels),
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--locations", required=True, type=Path, help="Path to archived static/locations.json export")
    parser.add_argument("--hotels-dir", required=True, type=Path, help="Directory containing archived hotels.json exports")
    parser.add_argument("--output", required=True, type=Path, help="Output file path, e.g. assets/data/travelpayouts-hotels-db.json")
    args = parser.parse_args()

    snapshot = build_snapshot(args.locations, args.hotels_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", encoding="utf-8") as fh:
        json.dump(snapshot, fh, ensure_ascii=False, indent=2)
    print(f"Wrote {args.output} with {len(snapshot['locations'])} locations and {len(snapshot['hotels'])} hotels")


if __name__ == "__main__":
    main()
