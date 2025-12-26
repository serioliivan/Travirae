// Supabase Edge Function: request-payout
// Crea una richiesta di pagamento per un affiliato e invia una email all'admin.
//
// Secrets richiesti (Supabase → Edge Functions → Secrets):
// - SUPABASE_SERVICE_ROLE_KEY
// - RESEND_API_KEY
// - (opzionale) RESEND_FROM (default: info@travirae.com)
// - (opzionale) ADMIN_EMAIL (default: serioliivan@gmail.com)

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

type PayoutMethod = "paypal" | "bank";

type PayoutDetails = Record<string, unknown>;

type FiscalDetails = {
  legal_name?: string;
  subject_type?: "individual" | "company";
  tax_residence_country?: string;
  tax_id?: string;
  address_country?: string;
  address_city?: string;
  [k: string]: unknown;
};

type RequestBody = {
  amount_usd?: number;
  method?: PayoutMethod;
  payout?: PayoutDetails;
  fiscal?: FiscalDetails;
  remember?: boolean;
};

function jsonResponse(data: unknown, status = 200, extraHeaders: HeadersInit = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
    },
  });
}

function corsHeaders(origin?: string): HeadersInit {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function asString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v == null) return "";
  try {
    return String(v);
  } catch {
    return "";
  }
}

function normalizeSlug(raw: string): string {
  // la logica di slug nel frontend consente: [a-z0-9-]
  const base = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "partner";
}

function randomSlug(base: string): string {
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `${base}-${rand}`.substring(0, 64);
}

async function sendAdminEmail(args: {
  resendKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}) {
  const { resendKey, from, to, subject, html, text, replyTo } = args;
  if (!resendKey) {
    console.warn("RESEND_API_KEY mancante: salto invio email");
    return { ok: false, skipped: true };
  }

  const payload: Record<string, unknown> = {
    from,
    to: [to],
    subject,
    html,
  };
  if (text) payload.text = text;
  if (replyTo) payload.reply_to = replyTo;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error("Resend error", res.status, text);
    return { ok: false, status: res.status, details: text };
  }

  return { ok: true };
}

serve(async (req) => {
  const origin = req.headers.get("Origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(origin) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, corsHeaders(origin));
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
  const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
  const RESEND_FROM = Deno.env.get("RESEND_FROM") ?? "info@travirae.com";
  const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") ?? "serioliivan@gmail.com";

  if (!SUPABASE_URL || !SERVICE_ROLE) {
    return jsonResponse({ error: "Server misconfigured" }, 500, corsHeaders(origin));
  }

  // Admin client (service role)
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false },
  });

  // 1) Auth: verifica JWT utente
  const authHeader = req.headers.get("Authorization") || "";
  const jwt = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!jwt) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders(origin));
  }

  const userResp = await admin.auth.getUser(jwt);
  const user = userResp.data?.user;
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401, corsHeaders(origin));
  }

  // 2) Body
  let body: RequestBody = {};
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, corsHeaders(origin));
  }

  const amount = Number(body.amount_usd);
  const method = body.method as PayoutMethod;
  const payout = (body.payout || {}) as PayoutDetails;
  const fiscal = (body.fiscal || {}) as FiscalDetails;
  const remember = Boolean(body.remember);

  if (!isFinite(amount) || amount <= 0) {
    return jsonResponse({ error: "Importo non valido" }, 400, corsHeaders(origin));
  }
  if (amount < 50) {
    return jsonResponse({ error: "Errore, il limite minimo di prelievo è di 50 USD" }, 400, corsHeaders(origin));
  }
  if (method !== "paypal" && method !== "bank") {
    return jsonResponse({ error: "Metodo payout non valido" }, 400, corsHeaders(origin));
  }

  // 3) Validazione minima dati payout
  if (method === "paypal") {
    const paypalEmail = asString((payout as any).paypal_email).trim();
    if (!paypalEmail || paypalEmail.indexOf("@")==-1) {
      return jsonResponse({ error: "Inserisci una email PayPal valida" }, 400, corsHeaders(origin));
    }
  } else {
    const beneficiary = asString((payout as any).beneficiary_name).trim();
    const bankCountry = asString((payout as any).bank_country).trim();
    const iban = asString((payout as any).iban).trim();
    const swift = asString((payout as any).swift_bic).trim();
    if (!beneficiary) return jsonResponse({ error: "Inserisci l'intestatario del conto" }, 400, corsHeaders(origin));
    if (!bankCountry) return jsonResponse({ error: "Inserisci il paese della banca" }, 400, corsHeaders(origin));
    if (!iban && !swift) {
      return jsonResponse({ error: "Inserisci almeno IBAN (SEPA) oppure SWIFT/BIC" }, 400, corsHeaders(origin));
    }
  }

  // 4) Validazione minima fiscale
  const legalName = asString(fiscal.legal_name).trim();
  const subjectType = asString(fiscal.subject_type).trim();
  const taxCountry = asString(fiscal.tax_residence_country).trim();
  const addrCountry = asString(fiscal.address_country).trim();
  const addrCity = asString(fiscal.address_city).trim();

  if (!legalName) return jsonResponse({ error: "Inserisci Nome legale / Ragione sociale" }, 400, corsHeaders(origin));
  if (subjectType !== "individual" && subjectType !== "company") {
    return jsonResponse({ error: "Tipo soggetto non valido" }, 400, corsHeaders(origin));
  }
  if (!taxCountry) return jsonResponse({ error: "Inserisci il paese di residenza fiscale" }, 400, corsHeaders(origin));
  if (!addrCountry) return jsonResponse({ error: "Inserisci il paese (indirizzo)" }, 400, corsHeaders(origin));
  if (!addrCity) return jsonResponse({ error: "Inserisci la città" }, 400, corsHeaders(origin));

  // 5) Recupera/crea affiliate slug
  const userId = user.id;
  const userEmail = user.email || null;

  const affResp = await admin
    .from("affiliates")
    .select("slug,email")
    .eq("user_id", userId)
    .limit(1);

  let affiliateSlug: string | null = null;

  if (affResp.error) {
    console.error("Errore query affiliates", affResp.error);
  }

  if (affResp.data && affResp.data.length) {
    affiliateSlug = affResp.data[0].slug;
    // sync email best effort
    if (userEmail && !affResp.data[0].email) {
      try {
        await admin.from("affiliates").update({ email: userEmail }).eq("user_id", userId);
      } catch {
        // ignore
      }
    }
  } else {
    // crea riga affiliato (fallback)
    const base = normalizeSlug(userEmail ? userEmail.split("@")[0] : "partner");
    affiliateSlug = randomSlug(base);

    const ins = await admin
      .from("affiliates")
      .insert({ user_id: userId, slug: affiliateSlug, email: userEmail })
      .select("slug")
      .single();

    if (ins.error) {
      console.error("Errore creazione affiliate", ins.error);
      return jsonResponse({ error: "Impossibile creare profilo affiliato" }, 500, corsHeaders(origin));
    }
    affiliateSlug = ins.data?.slug ?? affiliateSlug;
  }

  if (!affiliateSlug) {
    return jsonResponse({ error: "Profilo affiliato non trovato" }, 400, corsHeaders(origin));
  }

  // 6) Saldo disponibile
  const balResp = await admin
    .from("affiliate_balances")
    .select("available_balance_usd,total_earnings_usd,reserved_total_usd,paid_total_usd")
    .eq("affiliate_slug", affiliateSlug)
    .limit(1);

  if (balResp.error) {
    console.error("Errore query affiliate_balances", balResp.error);
    return jsonResponse({ error: "Sistema payout non configurato (esegui SCRIPT_07 su Supabase)" }, 500, corsHeaders(origin));
  }

  const balRow = balResp.data && balResp.data.length ? balResp.data[0] : null;
  const available = Number(balRow?.available_balance_usd || 0);

  if (!isFinite(available) || available < 0) {
    return jsonResponse({ error: "Saldo non disponibile" }, 400, corsHeaders(origin));
  }

  if (amount > available) {
    return jsonResponse({ error: `Saldo insufficiente. Disponibile: ${available.toFixed(2)} USD` }, 400, corsHeaders(origin));
  }

  // 7) (opzionale) salva profilo
  if (remember) {
    const up = await admin
      .from("payout_profiles")
      .upsert(
        {
          affiliate_slug: affiliateSlug,
          method,
          payout_details: payout,
          fiscal_details: fiscal,
        },
        { onConflict: "affiliate_slug" },
      );

    if (up.error) {
      console.error("Errore upsert payout_profiles", up.error);
      // non blocchiamo la richiesta
    }
  }

  // 8) Insert richiesta
  const snapshot = {
    method,
    payout,
    fiscal,
    user_agent: req.headers.get("User-Agent") || null,
    ip: req.headers.get("x-forwarded-for") || null,
  };

  const insReq = await admin
    .from("payout_requests")
    .insert({
      affiliate_slug: affiliateSlug,
      requester_user_id: userId,
      requester_email: userEmail,
      amount_usd: amount,
      method,
      status: "pending",
      payout_snapshot: snapshot,
    })
    .select("id,requested_at")
    .single();

  if (insReq.error) {
    console.error("Errore insert payout_requests", insReq.error);
    return jsonResponse({ error: "Impossibile creare la richiesta di pagamento" }, 500, corsHeaders(origin));
  }

  const requestId = insReq.data?.id;
  const requestedAt = insReq.data?.requested_at;

  // 9) Email admin (best effort)
  const safeSlug = escapeHtml(affiliateSlug);
  const safeUserEmail = escapeHtml(userEmail || "(email non disponibile)");
  const safeMethod = escapeHtml(method);

  // 9) Email admin (best effort)
const safeSlug = escapeHtml(affiliateSlug);
const safeUserEmail = escapeHtml(userEmail || "(email non disponibile)");
const safeMethod = escapeHtml(method);

// Helper per righe tabella (salta valori vuoti)
const row = (label: string, value: unknown) => {
  const v = escapeHtml(asString(value).trim());
  if (!v) return "";
  return `<tr>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;background:#f9fafb;font-weight:600;vertical-align:top;white-space:nowrap;">${escapeHtml(label)}</td>
    <td style="padding:8px 10px;border:1px solid #e5e7eb;vertical-align:top;">${v}</td>
  </tr>`;
};

const payoutTable = `
  <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:100%;font-size:14px;">
    ${row("Metodo", method)}
    ${method === "paypal" ? row("PayPal email", (payout as Record<string, unknown>)["paypal_email"]) : ""}
    ${method === "bank" ? row("Beneficiario", (payout as Record<string, unknown>)["beneficiary_name"]) : ""}
    ${method === "bank" ? row("Paese banca", (payout as Record<string, unknown>)["bank_country"]) : ""}
    ${method === "bank" ? row("IBAN", (payout as Record<string, unknown>)["iban"]) : ""}
    ${method === "bank" ? row("SWIFT/BIC", (payout as Record<string, unknown>)["swift_bic"]) : ""}
    ${method === "bank" ? row("Bank name", (payout as Record<string, unknown>)["bank_name"]) : ""}
    ${method === "bank" ? row("Bank address", (payout as Record<string, unknown>)["bank_address"]) : ""}
    ${method === "bank" ? row("Account number", (payout as Record<string, unknown>)["account_number"]) : ""}
    ${method === "bank" ? row("Routing number", (payout as Record<string, unknown>)["routing_number"]) : ""}
  </table>
`;

const fiscalTable = `
  <table cellpadding="0" cellspacing="0" role="presentation" style="border-collapse:collapse;width:100%;font-size:14px;">
    ${row("Nome legale", (fiscal as Record<string, unknown>)["legal_name"])}
    ${row("Tipo soggetto", (fiscal as Record<string, unknown>)["subject_type"])}
    ${row("Residenza fiscale", (fiscal as Record<string, unknown>)["tax_residence_country"])}
    ${row("Tax ID", (fiscal as Record<string, unknown>)["tax_id"])}
    ${row("Città", (fiscal as Record<string, unknown>)["address_city"])}
    ${row("Paese", (fiscal as Record<string, unknown>)["address_country"])}
  </table>
`;

const html = `
<div style="background:#f6f7fb;padding:24px 12px;font-family:Inter,Arial,sans-serif;line-height:1.5;">
  <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
    <div style="padding:18px 20px;border-bottom:1px solid #e5e7eb;">
      <div style="font-size:18px;font-weight:800;">Travirae</div>
      <div style="color:#6b7280;font-size:13px;">Notifica automatica</div>
    </div>

    <div style="padding:18px 20px;">
      <h2 style="margin:0 0 12px 0;font-size:18px;">Richiesta pagamento affiliato</h2>

      <p style="margin:0 0 14px 0;color:#111827;font-size:14px;">
        <strong>Affiliate ID:</strong> ${safeSlug}<br/>
        <strong>Email account:</strong> ${safeUserEmail}<br/>
        <strong>Importo:</strong> ${amount.toFixed(2)} USD<br/>
        <strong>Metodo:</strong> ${safeMethod}<br/>
        <strong>Request ID:</strong> ${escapeHtml(String(requestId || ""))}<br/>
        <strong>Data:</strong> ${escapeHtml(String(requestedAt || ""))}
      </p>

      <h3 style="margin:18px 0 8px 0;font-size:15px;">Dati pagamento</h3>
      ${payoutTable}

      <h3 style="margin:18px 0 8px 0;font-size:15px;">Dati fiscali</h3>
      ${fiscalTable}

      <p style="margin:16px 0 0 0;color:#6b7280;font-size:12px;">
        Questo messaggio è stato generato automaticamente da Travirae.
      </p>
    </div>
  </div>
</div>
`;

const subject = `Travirae | Richiesta payout ${affiliateSlug} — ${amount.toFixed(2)} USD`;

const text = [
  "Travirae - Richiesta pagamento affiliato",
  `Affiliate ID: ${affiliateSlug}`,
  `Email account: ${userEmail || ""}`,
  `Importo: ${amount.toFixed(2)} USD`,
  `Metodo: ${method}`,
  `Request ID: ${requestId || ""}`,
  `Data: ${requestedAt || ""}`,
  "",
  "Dati pagamento:",
  JSON.stringify(payout, null, 2),
  "",
  "Dati fiscali:",
  JSON.stringify(fiscal, null, 2),
].join("\n");


  await sendAdminEmail({
    resendKey: RESEND_API_KEY,
    from: RESEND_FROM,
    to: ADMIN_EMAIL,
    subject,
    html,
  text,
    replyTo: userEmail || undefined,
  });

  return jsonResponse(
    {
      ok: true,
      request_id: requestId,
      affiliate_slug: affiliateSlug,
      available_balance_usd: available,
    },
    200,
    corsHeaders(origin),
  );
});