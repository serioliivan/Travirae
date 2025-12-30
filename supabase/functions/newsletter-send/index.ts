// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

/**
 * Newsletter send (multi-lingua)
 *
 * - L'admin compila soggetto+testo per ciascuna lingua (9 lingue).
 * - Ogni iscritto riceve la newsletter nella lingua salvata in `newsletter_subscribers.language`.
 * - Se una lingua non è compilata, si usa ITA come fallback.
 * - Richiede: RESEND_API_KEY, RESEND_FROM, SUPABASE_SERVICE_ROLE_KEY (come secret),
 *   e ADMIN_EMAIL (opzionale, fallback: serioliivan@gmail.com), SITE_URL.
 *
 * Importante:
 * - Per chiamare questa Edge Function dal browser (admin panel su travirae.com),
 *   in Supabase Dashboard devi impostare "Verify JWT with legacy secret" = OFF.
 *   Altrimenti la preflight OPTIONS fallisce e il browser blocca la richiesta (CORS).
 */

type Lang3 =
  | "ITA"
  | "ENG"
  | "FRA"
  | "SPA"
  | "DEU"
  | "NLD"
  | "RUS"
  | "ARA"
  | "ZHO";

type LangContent = {
  subject?: string;
  body?: string;
};

type SendPayload = {
  languages: Record<string, LangContent>;
  // opzionale: override fallback
  fallback?: Lang3;
};

// CORS: manteniamo volutamente permissivo ("*") perché le chiamate arrivano dal browser.
// La sicurezza viene gestita a livello applicativo (controllo admin + JWT dell'utente).
// Questo evita problemi di preflight "OPTIONS" bloccati o header Origin non presente.
const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function getCorsHeaders(_req: Request) {
  return CORS_HEADERS;
}

function json(req: Request, body: unknown, status = 200) {
  const cors = getCorsHeaders(req);
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...cors,
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

function safeTrim(v: unknown): string {
  if (typeof v !== "string") return "";
  return v.trim();
}

function normalizeLang3(v: unknown): Lang3 {
  const s = safeTrim(v).toUpperCase();
  const allowed: Lang3[] = [
    "ITA",
    "ENG",
    "FRA",
    "SPA",
    "DEU",
    "NLD",
    "RUS",
    "ARA",
    "ZHO",
  ];
  return (allowed.includes(s as Lang3) ? (s as Lang3) : "ITA");
}

async function sendResendEmail(args: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${args.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      subject: args.subject,
      html: args.html,
    }),
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    // ignore
  }

  if (!res.ok) {
    const message = data?.error?.message || data?.message || `Resend error (${res.status})`;
    throw new Error(message);
  }

  return data;
}

Deno.serve(async (req: Request) => {
  const cors = getCorsHeaders(req);

  // Preflight CORS
  if (req.method === "OPTIONS") {
    // Preflight CORS
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...cors, "Content-Type": "application/json; charset=utf-8" },
    });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
    let RESEND_FROM = Deno.env.get("RESEND_FROM") || "";
    // Consistent "From" name in inbox (e.g., "Travirae <info@travirae.com>").
    if (RESEND_FROM && !RESEND_FROM.includes("<")) {
      RESEND_FROM = `Travirae <${RESEND_FROM}>`;
    }
    const SITE_URL = (Deno.env.get("SITE_URL") || "").replace(/\/$/, "");
    const ADMIN_EMAIL = (Deno.env.get("ADMIN_EMAIL") || "serioliivan@gmail.com").trim().toLowerCase();

    const missing: string[] = [];
    if (!SUPABASE_URL) missing.push("SUPABASE_URL");
    if (!SUPABASE_ANON_KEY) missing.push("SUPABASE_ANON_KEY");
    if (!SUPABASE_SERVICE_ROLE_KEY) missing.push("SUPABASE_SERVICE_ROLE_KEY");
    if (!RESEND_API_KEY) missing.push("RESEND_API_KEY");
    if (!RESEND_FROM) missing.push("RESEND_FROM");
    if (!SITE_URL) missing.push("SITE_URL");
    if (!ADMIN_EMAIL) missing.push("ADMIN_EMAIL");

    if (missing.length) {
      return json(req, { error: `Missing secrets: ${missing.join(", ")}` }, 500);
    }

    // Autenticazione: l'admin panel invia Authorization: Bearer <JWT>
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) {
      return json(req, { error: "Missing Authorization header" }, 401);
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userErr } = await supabaseAuth.auth.getUser();
    if (userErr || !userData?.user) {
      return json(req, { error: "Invalid session" }, 401);
    }

    const userEmail = (userData.user.email || "").trim().toLowerCase();
    if (userEmail !== ADMIN_EMAIL) {
      return json(req, { error: "Forbidden" }, 403);
    }

    // Body
    let payload: SendPayload;
    try {
      payload = (await req.json()) as SendPayload;
    } catch {
      return json(req, { error: "Invalid JSON" }, 400);
    }

    const languages = payload?.languages || {};
    const fallbackLang: Lang3 = normalizeLang3(payload?.fallback);

    const hasAnyContent = Object.values(languages).some((v: any) =>
      safeTrim(v?.subject) && safeTrim(v?.body)
    );

    if (!hasAnyContent) {
      return json(req, { error: "Nessun contenuto newsletter. Compila almeno una lingua (oggetto + testo)." }, 400);
    }

    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Prendi tutti gli iscritti attivi
    const { data: subscribers, error: subsErr } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("email, language, token")
      .eq("subscribed", true);

    if (subsErr) {
      return json(req, { error: `DB error: ${subsErr.message}` }, 500);
    }

    const list = Array.isArray(subscribers) ? subscribers : [];
    if (!list.length) {
      return json(req, { ok: true, sent: 0, errors: 0, message: "Nessun iscritto attivo." }, 200);
    }

    let sent = 0;
    let errors = 0;

    // Invia 1 email per iscritto, con contenuto lingua (fallback se mancante)
    for (const sub of list) {
      const email = safeTrim(sub.email);
      if (!email) continue;

      const lang = normalizeLang3(sub.language);
      const content = (languages[lang] || {}) as LangContent;
      const fallbackContent = (languages[fallbackLang] || {}) as LangContent;

      const subject = safeTrim(content.subject) || safeTrim(fallbackContent.subject);
      const body = safeTrim(content.body) || safeTrim(fallbackContent.body);

      if (!subject || !body) {
        // niente per questa lingua e nemmeno fallback → skip
        continue;
      }

      const token = safeTrim(sub.token);
      const unsubscribeUrl = token
        ? `${SITE_URL}/newsletter-unsubscribe.html?token=${encodeURIComponent(token)}`
        : `${SITE_URL}/newsletter-unsubscribe.html`;

      const html = `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <div style="white-space:pre-wrap">${body.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
          <hr style="margin:24px 0" />
          <div style="font-size:12px;color:#555">
            <a href="${unsubscribeUrl}" target="_blank" rel="noopener">Unsubscribe</a>
          </div>
        </div>
      `;

      try {
        await sendResendEmail({
          apiKey: RESEND_API_KEY,
          from: RESEND_FROM,
          to: email,
          subject,
          html,
        });
        sent++;
      } catch (e) {
        errors++;
        console.error("newsletter-send error", { email, error: (e as any)?.message || String(e) });
      }
    }

    return json(req, { ok: true, sent, errors }, 200);
  } catch (err) {
    console.error("newsletter-send fatal", err);
    return json(req, { error: (err as any)?.message || String(err) }, 500);
  }
});
