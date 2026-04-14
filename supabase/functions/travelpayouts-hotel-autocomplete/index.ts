function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Content-Type": "application/json",
  };
}

function jsonResponse(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload, null, 2), {
    status,
    headers: corsHeaders(),
  });
}

function normalizeText(value: unknown): string {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function readLocalizedName(value: unknown, lang: string): string {
  if (!value) return "";
  if (typeof value === "string") return normalizeText(value);
  if (Array.isArray(value)) {
    const preferred = value.find((entry: any) => String(entry?.isVariation || "0") === "0" && entry?.name) || value.find((entry: any) => entry?.name) || value[0];
    return preferred ? readLocalizedName((preferred as any).name || preferred, lang) : "";
  }
  if (typeof value === "object") {
    const normalizedLang = String(lang || "en").toUpperCase().replace(/-/g, "_");
    const baseLang = normalizedLang.split("_")[0] || normalizedLang;
    const candidates = [normalizedLang, normalizedLang.toLowerCase(), baseLang, baseLang.toLowerCase(), "EN", "en", "IT", "it", "FR", "fr", "DE", "de", "ES", "es", "RU", "ru"];
    for (const key of candidates) {
      if (Object.prototype.hasOwnProperty.call(value, key) && (value as Record<string, unknown>)[key]) {
        return readLocalizedName((value as Record<string, unknown>)[key], lang);
      }
    }
    const firstKey = Object.keys(value as Record<string, unknown>)[0];
    if (firstKey) return readLocalizedName((value as Record<string, unknown>)[firstKey], lang);
  }
  return "";
}

function uniqueItems(items: Array<Record<string, unknown>>, limit: number) {
  const seen = new Set<string>();
  const out: Array<Record<string, unknown>> = [];
  for (const item of items) {
    const label = normalizeText(item.label || item.value || "");
    const key = `${String(item.type || "")}|${label.toLowerCase()}`;
    if (!label || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
    if (out.length >= limit) break;
  }
  return out;
}

function normalizeLocationItem(item: any, lang: string) {
  const fullName = normalizeText(item?.fullName || item?.full_name || "");
  const cityName = normalizeText(item?.cityName || item?.city_name || readLocalizedName(item?.name, lang));
  const countryName = normalizeText(item?.countryName || item?.country_name || "");
  let label = fullName || cityName;
  if (!label && countryName) label = countryName;
  if (!label) return null;
  if (!fullName && cityName && countryName && !label.toLowerCase().includes(countryName.toLowerCase())) {
    label = `${cityName}, ${countryName}`;
  }
  return {
    type: "location",
    label,
    value: label,
    locationId: String(item?.id || item?.locationId || ""),
    countryCode: normalizeText(item?.countryCode || item?.country_code || item?.code || "").toUpperCase(),
  };
}

function normalizeHotelItem(item: any, lang: string, locationLabels: Record<string, string>) {
  const hotelName = normalizeText(item?.fullName || item?.label || readLocalizedName(item?.name, lang));
  const fallbackLocation = locationLabels[String(item?.locationId || item?.cityId || "")] || "";
  const locationName = normalizeText(item?.locationName || item?.location_name || fallbackLocation || readLocalizedName(item?.address, lang));
  let label = hotelName;
  if (hotelName && locationName && !hotelName.toLowerCase().includes(locationName.toLowerCase())) {
    label = `${hotelName}, ${locationName}`;
  }
  if (!label) label = locationName;
  if (!label) return null;
  return {
    type: "hotel",
    label,
    value: label,
    hotelId: String(item?.id || item?.hotelId || ""),
    locationId: String(item?.locationId || item?.cityId || ""),
  };
}

function parseLookupPayload(data: any, lang: string, limit: number) {
  const results = data?.results || data || {};
  const locations = Array.isArray(results?.locations) ? results.locations : [];
  const hotels = Array.isArray(results?.hotels) ? results.hotels : [];
  const locationLabels: Record<string, string> = Object.create(null);
  const items: Array<Record<string, unknown>> = [];

  for (const raw of locations) {
    const normalized = normalizeLocationItem(raw, lang);
    if (!normalized) continue;
    if (normalized.locationId) locationLabels[normalized.locationId] = normalized.label;
    items.push(normalized);
  }
  for (const raw of hotels) {
    const normalized = normalizeHotelItem(raw, lang, locationLabels);
    if (!normalized) continue;
    items.push(normalized);
  }
  return uniqueItems(items, limit);
}

async function fetchLookup(candidateUrl: string) {
  const response = await fetch(candidateUrl, { method: "GET" });
  const text = await response.text();
  let json: unknown = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch (_) {
    json = null;
  }
  return { ok: response.ok, status: response.status, text, json };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  if (req.method !== "GET") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const url = new URL(req.url);
  const query = normalizeText(url.searchParams.get("q") || url.searchParams.get("query") || "");
  const lang = normalizeText(url.searchParams.get("lang") || "en") || "en";
  const limit = Math.max(1, Math.min(10, Number(url.searchParams.get("limit") || 3) || 3));

  if (!query) {
    return jsonResponse({ items: [], provider: "travelpayouts_hotellook_lookup", provider_status: "empty_query" }, 200);
  }

  const token = normalizeText(Deno.env.get("TRAVELPAYOUTS_API_TOKEN") || Deno.env.get("TRAVELPAYOUTS_HOTEL_TOKEN") || "");
  const endpointOverride = normalizeText(Deno.env.get("TRAVELPAYOUTS_HOTEL_LOOKUP_URL") || "");

  const candidates: string[] = [];
  function pushLookup(baseUrl: string) {
    if (!baseUrl) return;
    const target = new URL(baseUrl);
    target.searchParams.set("query", query);
    target.searchParams.set("lang", lang);
    target.searchParams.set("lookFor", "both");
    target.searchParams.set("limit", String(limit));
    target.searchParams.set("convertCase", "1");
    if (token) target.searchParams.set("token", token);
    candidates.push(target.toString());
  }

  if (endpointOverride) pushLookup(endpointOverride);
  pushLookup("https://engine.hotellook.com/api/v2/lookup.json");
  pushLookup("http://engine.hotellook.com/api/v2/lookup.json");

  let lastError = "";
  for (const candidate of candidates) {
    try {
      const result = await fetchLookup(candidate);
      if (result.ok && result.json) {
        return jsonResponse({
          items: parseLookupPayload(result.json, lang, limit),
          provider: "travelpayouts_hotellook_lookup",
          provider_status: "ok",
          used_token: Boolean(token),
        });
      }
      const lowered = String(result.text || "").toLowerCase();
      if (lowered.includes("hotellook") && lowered.includes("closed")) {
        return jsonResponse({
          items: [],
          provider: "travelpayouts_hotellook_lookup",
          provider_status: "closed",
          used_token: Boolean(token),
          note: "Hotellook lookup is closed on the provider side.",
        });
      }
      lastError = `HTTP ${result.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error || "unknown_error");
    }
  }

  return jsonResponse({
    items: [],
    provider: "travelpayouts_hotellook_lookup",
    provider_status: "unavailable",
    used_token: Boolean(token),
    error: lastError || "lookup_unavailable",
  });
});
