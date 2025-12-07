// Edge Function: sync_travelpayouts
// Sincronizza le prenotazioni Aviasales/Travelpayouts nella tabella `bookings`.
//
// Per usarla:
// 1. Imposta i segreti nel progetto Supabase:
//    - SUPABASE_URL            (uguale all'URL del progetto)
//    - SUPABASE_SERVICE_ROLE_KEY (service role key del progetto)
//    - TRAVELPAYOUTS_TOKEN     (API token Travelpayouts)
// 2. Deploy con la CLI: supabase functions deploy sync_travelpayouts
// 3. Crea un cron job in Supabase che invochi la funzione ogni X minuti/ore.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const TRAVELPAYOUTS_TOKEN = Deno.env.get("TRAVELPAYOUTS_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function mapState(state: string | null): string {
  if (state === "paid") return "confirmed";
  if (state === "canceled") return "canceled";
  return "pending";
}

serve(async (_req) => {
  if (!TRAVELPAYOUTS_TOKEN) {
    return new Response("Missing TRAVELPAYOUTS_TOKEN", { status: 500 });
  }

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const from = yesterday.toISOString().slice(0, 10);
  const to = now.toISOString().slice(0, 10);

  const body = {
    fields: [
      "action_id",
      "sub_id",
      "price_eur",
      "paid_profit_eur",
      "state",
      "date",
      "updated_at",
      "created_at",
      "campaign_id",
    ],
    filters: [
      { field: "type", op: "eq", value: "action" },
      { field: "campaign_id", op: "eq", value: 100 },
      { field: "date", op: "ge", value: from },
      { field: "date", op: "le", value: to },
    ],
    sort: [{ field: "date", order: "asc" }],
    offset: 0,
    limit: 1000,
  };

  const tpResp = await fetch(
    "https://api.travelpayouts.com/statistics/v1/execute_query",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Access-Token": TRAVELPAYOUTS_TOKEN,
      },
      body: JSON.stringify(body),
    },
  );

  if (!tpResp.ok) {
    const txt = await tpResp.text();
    return new Response(`Travelpayouts error: ${tpResp.status} ${txt}`, {
      status: 500,
    });
  }

  const json = await tpResp.json();
  const results = json.results ?? [];

  const rows = results
    .filter((r: any) => r.sub_id)
    .map((r: any) => ({
      partner: "travelpayouts",
      affiliate_slug: String(r.sub_id),
      booked_at: (r.created_at || r.date) + "T00:00:00Z",
      status: mapState(r.state ?? null),
      currency: "EUR",
      sale_amount: parseFloat(r.price_eur ?? "0"),
      commission_partner: parseFloat(r.paid_profit_eur ?? "0"),
      raw: r,
    }));

  if (!rows.length) {
    return new Response(JSON.stringify({ inserted: 0 }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  const { error } = await supabase.from("bookings").insert(rows);
  if (error) {
    return new Response("Supabase insert error: " + error.message, {
      status: 500,
    });
  }

  return new Response(JSON.stringify({ inserted: rows.length }), {
    headers: { "Content-Type": "application/json" },
  });
});
