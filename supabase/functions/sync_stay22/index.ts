// Example skeleton for Stay22 sync edge function.
// You must adapt this to the exact Stay22 reporting API format.
import { serve } from "https://deno.land/std@0.192.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const STAY22_TOKEN = Deno.env.get("STAY22_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

serve(async (_req) => {
  if (!STAY22_TOKEN) {
    return new Response("Missing STAY22_TOKEN", { status: 500 });
  }

  // TODO: Call Stay22 reporting API with STAY22_TOKEN,
  // map each booking row to the `bookings` table with:
  // partner = "stay22"
  // affiliate_slug = campaign (or equivalent field)
  // booked_at, status, currency, sale_amount, commission_partner, raw

  return new Response(
    JSON.stringify({ message: "sync_stay22 not yet implemented" }),
    { headers: { "Content-Type": "application/json" } },
  );
});
