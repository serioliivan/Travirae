// Supabase Edge Function: import-travelpayouts
// Scopo: importare vendite/commissioni REALI (Aviasales / Travelpayouts) e salvarle in public.bookings
// - NON mette token nel frontend: legge TRAVELPAYOUTS_API_TOKEN dai "Secrets" di Supabase
// - Può essere chiamata:
//   A) da CRON (header x-cron-secret)
//   B) manualmente dall'admin (Authorization Bearer del login Supabase)

import { createClient } from "npm:@supabase/supabase-js@2";

const ADMIN_EMAIL = "serioliivan@gmail.com";

// --- Utility ---
function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-cron-secret",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  };
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() },
  });
}

function isValidYMD(s: unknown): s is string {
  if (typeof s !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(s);
}

function formatYMD(d: Date) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, days: number) {
  const x = new Date(d.getTime());
  x.setUTCDate(x.getUTCDate() + days);
  return x;
}

function sanitizeSlug(raw: unknown): string {
  if (!raw) return "";
  return String(raw).trim().replace(/[^a-zA-Z0-9_-]/g, "");
}

function mapStateToStatus(state: unknown): string {
  const s = String(state || "").toLowerCase().trim();
  if (["paid", "approved", "confirmed"].includes(s)) return "confirmed";
  if (["canceled", "cancelled", "declined", "rejected"].includes(s)) return "canceled";
  if (!s) return "pending";
  return s; // es. pending
}

async function fetchTravelpayoutsActions(opts: {
  token: string;
  from: string; // YYYY-MM-DD
  toExclusive: string; // YYYY-MM-DD (esclusivo)
  campaignId: number;
}) {
  const url = "https://api.travelpayouts.com/statistics/v1/execute_query";

  const fields = [
    "action_id",
    "sub_id",
    "state",
    "date",
    "price_usd",
    "paid_profit_usd",
    "created_at",
    "updated_at",
    "external_click_id",
  ];

  const limit = 1000;
  let offset = 0;
  const all: any[] = [];

  while (true) {
    const body = {
      fields,
      filters: [
        { field: "date", op: "ge", value: opts.from },
        { field: "date", op: "lt", value: opts.toExclusive },
        { field: "type", op: "eq", value: "action" },
        { field: "campaign_id", op: "eq", value: opts.campaignId },
      ],
      sort: [{ field: "date", order: "asc" }],
      limit,
      offset,
    };

    const resp = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": opts.token,
      },
      body: JSON.stringify(body),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`Travelpayouts API error ${resp.status}: ${txt}`);
    }

    const json = await resp.json();
    const rows = Array.isArray(json?.results) ? json.results : [];

    if (!rows.length) break;

    all.push(...rows);

    if (rows.length < limit) break;
    offset += limit;

    // Safety stop (evita loop infinito in caso di bug)
    if (offset > 200000) break;
  }

  return all;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders() });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
  const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

  const TRAVELPAYOUTS_API_TOKEN = Deno.env.get("TRAVELPAYOUTS_API_TOKEN") || "";
  const CRON_SECRET = Deno.env.get("TRAVIRAE_CRON_SECRET") || "";

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return jsonResponse(
      { error: "Missing default Supabase env vars (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY)" },
      500,
    );
  }

  if (!TRAVELPAYOUTS_API_TOKEN) {
    return jsonResponse(
      { error: "Missing TRAVELPAYOUTS_API_TOKEN. Set it in Dashboard → Edge Functions → Secrets." },
      500,
    );
  }

  // 1) Authorize
  const cronHeader = req.headers.get("x-cron-secret") || "";
  let authorized = false;
  let authMode: "cron-secret" | "admin-jwt" | "none" = "none";

  if (CRON_SECRET && cronHeader && cronHeader === CRON_SECRET) {
    authorized = true;
    authMode = "cron-secret";
  }

  if (!authorized) {
    const authHeader = req.headers.get("Authorization") || "";
    if (authHeader) {
      // Validate the JWT via Supabase Auth and check email
      const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      });

      const userResp = await userClient.auth.getUser();
      const email = (userResp.data.user?.email || "").toLowerCase().trim();

      if (email === ADMIN_EMAIL) {
        authorized = true;
        authMode = "admin-jwt";
      }
    }
  }

  if (!authorized) {
    return jsonResponse({ error: "Unauthorized. Use x-cron-secret or login as admin." }, 401);
  }

  // 2) Read params
  let payload: any = {};
  if (req.method !== "GET") {
    try {
      payload = await req.json();
    } catch (_) {
      payload = {};
    }
  }

  const days = Number(payload?.days ?? 45);
  const fromParam = payload?.from;
  const toParam = payload?.to;

  const today = new Date();
  const defaultFrom = formatYMD(addDays(today, -days));
  const from = isValidYMD(fromParam) ? fromParam : defaultFrom;

  // to = today (incluso) -> trasformiamo in toExclusive = domani
  const to = isValidYMD(toParam) ? toParam : formatYMD(today);
  const toExclusive = formatYMD(addDays(new Date(to + "T00:00:00Z"), 1));

  const campaignId = Number(payload?.campaign_id ?? 100); // Aviasales (Travelpayouts) è spesso 100

  // 3) Fetch conversions
  let rows: any[] = [];
  try {
    rows = await fetchTravelpayoutsActions({
      token: TRAVELPAYOUTS_API_TOKEN,
      from,
      toExclusive,
      campaignId,
    });
  } catch (e) {
    return jsonResponse({ error: String(e?.message || e) }, 502);
  }

  // 4) Upsert into DB
  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const upserts = rows
    .map((r) => {
      const partnerRef = r?.action_id != null ? String(r.action_id) : "";
      let slug = sanitizeSlug(r?.sub_id);
      if (!slug) slug = 'direct';

      if (!partnerRef) return null;

      const status = mapStateToStatus(r?.state);

      // date è YYYY-MM-DD -> settiamo booked_at a mezzanotte UTC
      const bookedAt = isValidYMD(r?.date) ? `${r.date}T00:00:00Z` : new Date().toISOString();

      const commission = r?.paid_profit_usd != null ? Number(r.paid_profit_usd) : null;
      const amount = r?.price_usd != null ? Number(r.price_usd) : null;

      const confirmedAt =
        status === "confirmed" ? (r?.updated_at ? String(r.updated_at) : new Date().toISOString()) : null;

      return {
        affiliate_slug: slug,
        partner: "aviasales",
        status,
        booked_at: bookedAt,
        confirmed_at: confirmedAt,
        currency: "USD",
        amount,
        commission_partner: commission,
        partner_reference: partnerRef,
        metadata: r,
      };
    })
    .filter(Boolean) as any[];

  let upserted = 0;
  const chunkSize = 200;

  for (let i = 0; i < upserts.length; i += chunkSize) {
    const chunk = upserts.slice(i, i + chunkSize);
    const { error } = await admin.from("bookings").upsert(chunk, {
      onConflict: "partner,partner_reference",
    });
    if (error) {
      console.error("Upsert error", error);
      return jsonResponse({ error: "DB upsert error", details: error }, 500);
    }
    upserted += chunk.length;
  }

  // 5) Refresh payouts table (best effort)
  try {
    await admin.rpc("refresh_monthly_affiliate_payouts");
  } catch (e) {
    console.warn("refresh_monthly_affiliate_payouts failed (non-blocking):", e);
  }

  return jsonResponse({
    ok: true,
    authMode,
    range: { from, toExclusive, campaignId },
    fetched: rows.length,
    upsertReady: upserts.length,
    upserted,
  });
});
