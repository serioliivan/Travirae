const DEFAULT_ALLOWED_ORIGINS = [
  "https://travirae.com",
  "https://www.travirae.com",
  "https://serioliivan.github.io",
  "http://localhost",
  "http://127.0.0.1",
];

const PRIMARY_HOTEL_TYPES = [
  "hotel",
  "resort_hotel",
  "hostel",
  "bed_and_breakfast",
  "guest_house",
];

const FALLBACK_HOTEL_TYPES = [
  "motel",
  "inn",
  "extended_stay_hotel",
  "private_guest_room",
  "lodging",
];

const AUTOCOMPLETE_FIELD_MASK = [
  "suggestions.placePrediction.placeId",
  "suggestions.placePrediction.text.text",
  "suggestions.placePrediction.structuredFormat.mainText.text",
  "suggestions.placePrediction.structuredFormat.secondaryText.text",
  "suggestions.placePrediction.types",
].join(",");

const DETAILS_FIELD_MASK = [
  "id",
  "formattedAddress",
  "location",
  "types",
  "primaryType",
].join(",");

type RateBucket = { startedAt: number; count: number };
const rateBuckets = new Map<string, RateBucket>();

function normalizeText(value: unknown): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function allowedOrigins(): string[] {
  const custom = normalizeText(Deno.env.get("GOOGLE_PLACES_ALLOWED_ORIGINS"));
  if (!custom) return DEFAULT_ALLOWED_ORIGINS;
  return custom
    .split(",")
    .map((value) => value.trim().replace(/\/$/, ""))
    .filter(Boolean);
}

function isOriginAllowed(origin: string): boolean {
  if (!origin) return true; // Supabase dashboard tests and server-to-server checks.
  const normalized = origin.replace(/\/$/, "");
  return allowedOrigins().some((allowed) => {
    if (normalized === allowed) return true;
    if (allowed === "http://localhost" && normalized.startsWith("http://localhost:")) return true;
    if (allowed === "http://127.0.0.1" && normalized.startsWith("http://127.0.0.1:")) return true;
    if (allowed === "https://serioliivan.github.io" && normalized === allowed) return true;
    return false;
  });
}

function corsHeaders(req: Request): HeadersInit {
  const origin = normalizeText(req.headers.get("origin"));
  const allowOrigin = origin && isOriginAllowed(origin) ? origin : "https://travirae.com";
  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Max-Age": "86400",
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "Vary": "Origin",
  };
}

function jsonResponse(req: Request, payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: corsHeaders(req),
  });
}

function clientIp(req: Request): string {
  return normalizeText(
    req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      "unknown",
  );
}

function isRateLimited(req: Request): boolean {
  const now = Date.now();
  const key = clientIp(req);
  const current = rateBuckets.get(key);
  if (!current || now - current.startedAt >= 60_000) {
    rateBuckets.set(key, { startedAt: now, count: 1 });
    return false;
  }
  current.count += 1;
  if (rateBuckets.size > 2_000) {
    for (const [bucketKey, bucket] of rateBuckets) {
      if (now - bucket.startedAt >= 120_000) rateBuckets.delete(bucketKey);
    }
  }
  return current.count > 120;
}

function validLanguage(value: string): string {
  const clean = value.toLowerCase();
  return /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(clean) ? clean : "en";
}

function validSessionToken(value: string): string {
  const clean = normalizeText(value);
  return /^[a-zA-Z0-9_-]{8,36}$/.test(clean) ? clean : "";
}

function parseGoogleError(payload: unknown, status: number): string {
  const data = payload as { error?: { message?: string; status?: string } } | null;
  return normalizeText(data?.error?.message || data?.error?.status || `Google Places HTTP ${status}`);
}

async function googleJson(
  url: string,
  apiKey: string,
  options: RequestInit,
  fieldMask: string,
): Promise<{ ok: boolean; status: number; data: any }> {
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");
  headers.set("Content-Type", "application/json");
  headers.set("X-Goog-Api-Key", apiKey);
  headers.set("X-Goog-FieldMask", fieldMask);
  const response = await fetch(url, { ...options, headers });
  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  return { ok: response.ok, status: response.status, data };
}

function normalizePredictions(payload: any): Array<Record<string, unknown>> {
  const suggestions = Array.isArray(payload?.suggestions) ? payload.suggestions : [];
  const seen = new Set<string>();
  const items: Array<Record<string, unknown>> = [];

  for (const suggestion of suggestions) {
    const prediction = suggestion?.placePrediction;
    if (!prediction) continue;
    const placeId = normalizeText(prediction.placeId);
    const name = normalizeText(
      prediction?.structuredFormat?.mainText?.text || prediction?.text?.text,
    );
    const location = normalizeText(
      prediction?.structuredFormat?.secondaryText?.text ||
        prediction?.text?.text?.replace(name, "").replace(/^,\s*/, ""),
    );
    if (!placeId || !name || seen.has(placeId)) continue;
    seen.add(placeId);
    items.push({
      placeId,
      name,
      location,
      text: normalizeText(prediction?.text?.text || [name, location].filter(Boolean).join(", ")),
      types: Array.isArray(prediction?.types) ? prediction.types.map(normalizeText).filter(Boolean) : [],
    });
    if (items.length >= 5) break;
  }
  return items;
}

async function autocomplete(
  apiKey: string,
  query: string,
  languageCode: string,
  sessionToken: string,
): Promise<{ items: Array<Record<string, unknown>>; error?: string; status?: number }> {
  async function request(types: string[]) {
    const body: Record<string, unknown> = {
      input: query,
      languageCode,
      includedPrimaryTypes: types,
      includeQueryPredictions: false,
      includePureServiceAreaBusinesses: false,
    };
    if (sessionToken) body.sessionToken = sessionToken;
    return await googleJson(
      "https://places.googleapis.com/v1/places:autocomplete",
      apiKey,
      { method: "POST", body: JSON.stringify(body) },
      AUTOCOMPLETE_FIELD_MASK,
    );
  }

  const primary = await request(PRIMARY_HOTEL_TYPES);
  if (!primary.ok) {
    return { items: [], error: parseGoogleError(primary.data, primary.status), status: primary.status };
  }
  let items = normalizePredictions(primary.data);
  if (items.length === 0) {
    const fallback = await request(FALLBACK_HOTEL_TYPES);
    if (!fallback.ok) {
      return { items: [], error: parseGoogleError(fallback.data, fallback.status), status: fallback.status };
    }
    items = normalizePredictions(fallback.data);
  }
  return { items };
}

async function placeDetails(
  apiKey: string,
  placeId: string,
  languageCode: string,
  sessionToken: string,
): Promise<{ place?: Record<string, unknown>; error?: string; status?: number }> {
  const target = new URL(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`);
  target.searchParams.set("languageCode", languageCode);
  if (sessionToken) target.searchParams.set("sessionToken", sessionToken);

  const result = await googleJson(
    target.toString(),
    apiKey,
    { method: "GET" },
    DETAILS_FIELD_MASK,
  );
  if (!result.ok) {
    return { error: parseGoogleError(result.data, result.status), status: result.status };
  }
  const data = result.data || {};
  return {
    place: {
      placeId: normalizeText(data.id || placeId),
      address: normalizeText(data.formattedAddress),
      lat: Number(data?.location?.latitude),
      lng: Number(data?.location?.longitude),
      primaryType: normalizeText(data.primaryType),
      types: Array.isArray(data.types) ? data.types.map(normalizeText).filter(Boolean) : [],
    },
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    if (!isOriginAllowed(normalizeText(req.headers.get("origin")))) {
      return jsonResponse(req, { error: "origin_not_allowed" }, 403);
    }
    return new Response("ok", { headers: corsHeaders(req) });
  }

  const origin = normalizeText(req.headers.get("origin"));
  if (origin && !isOriginAllowed(origin)) {
    return jsonResponse(req, { error: "origin_not_allowed" }, 403);
  }
  if (req.method !== "GET") {
    return jsonResponse(req, { error: "method_not_allowed" }, 405);
  }
  if (isRateLimited(req)) {
    return jsonResponse(req, { error: "rate_limit_exceeded" }, 429);
  }

  const apiKey = normalizeText(Deno.env.get("GOOGLE_PLACES_API_KEY"));
  if (!apiKey) {
    return jsonResponse(req, { error: "google_places_key_not_configured" }, 503);
  }

  const url = new URL(req.url);
  const action = normalizeText(url.searchParams.get("action") || "autocomplete").toLowerCase();
  const languageCode = validLanguage(normalizeText(url.searchParams.get("lang") || "en"));
  const sessionToken = validSessionToken(normalizeText(url.searchParams.get("session_token")));

  if (action === "autocomplete") {
    const query = normalizeText(url.searchParams.get("q") || url.searchParams.get("query"));
    if (query.length < 3) {
      return jsonResponse(req, { items: [], provider: "google_places_new", status: "query_too_short" });
    }
    if (query.length > 120) {
      return jsonResponse(req, { error: "query_too_long" }, 400);
    }
    const result = await autocomplete(apiKey, query, languageCode, sessionToken);
    if (result.error) {
      console.error("Google Places autocomplete error", result.status, result.error);
      return jsonResponse(req, { error: "google_places_unavailable", message: result.error }, 502);
    }
    return jsonResponse(req, {
      items: result.items,
      provider: "google_places_new",
      status: "ok",
    });
  }

  if (action === "details") {
    const placeId = normalizeText(url.searchParams.get("place_id") || url.searchParams.get("placeId"));
    if (!/^[A-Za-z0-9_-]{5,220}$/.test(placeId)) {
      return jsonResponse(req, { error: "invalid_place_id" }, 400);
    }
    const result = await placeDetails(apiKey, placeId, languageCode, sessionToken);
    if (result.error) {
      console.error("Google Places details error", result.status, result.error);
      return jsonResponse(req, { error: "google_place_details_unavailable", message: result.error }, 502);
    }
    return jsonResponse(req, {
      place: result.place,
      provider: "google_places_new",
      status: "ok",
    });
  }

  return jsonResponse(req, { error: "unsupported_action" }, 400);
});
