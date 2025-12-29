// deno-lint-ignore-file no-explicit-any
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Newsletter send (multi-lingua)
 * - L'admin compila soggetto+testo per ciascuna lingua (9 lingue).
 * - Ogni iscritto riceve la newsletter nella lingua salvata in newsletter_subscribers.language.
 * - Se una lingua non è compilata, si usa ITA come fallback.
 */

type LangCode = "ITA" | "ENG" | "FRA" | "DEU" | "SPA" | "RUS" | "NLD" | "ARA" | "ZHO";

const SUPPORTED_LANGS: LangCode[] = ["ITA", "ENG", "FRA", "DEU", "SPA", "RUS", "NLD", "ARA", "ZHO"];

const UNSUB_LABEL: Record<LangCode, string> = {
  ITA: "Annulla iscrizione",
  ENG: "Unsubscribe",
  FRA: "Se désabonner",
  DEU: "Abbestellen",
  SPA: "Darse de baja",
  RUS: "Отписаться",
  NLD: "Afmelden",
  ARA: "إلغاء الاشتراك",
  ZHO: "取消订阅",
};

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
}

function normalizeLang(input: any): LangCode {
  const raw = String(input || "").trim().toUpperCase();
  if (SUPPORTED_LANGS.includes(raw as LangCode)) return raw as LangCode;
  return "ITA";
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function nl2br(str: string): string {
  return escapeHtml(str).replace(/\r?\n/g, "<br>");
}

function wrapEmail({
  bodyText,
  unsubscribeUrl,
  lang,
}: {
  bodyText: string;
  unsubscribeUrl: string;
  lang: LangCode;
}): string {
  const isRtl = lang === "ARA";
  const label = UNSUB_LABEL[lang] || "Unsubscribe";
  const contentHtml = nl2br(bodyText);

  return `
  <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f7fb; padding: 28px;">
    <div style="max-width: 620px; margin: 0 auto; background:#ffffff; border-radius: 14px; overflow:hidden; box-shadow: 0 10px 30px rgba(15,23,42,.08);" lang="${lang}" ${
    isRtl ? 'dir="rtl"' : ""
  }>
      <div style="padding: 18px 22px; border-bottom:1px solid #eef0f6;">
        <div style="font-weight: 800; letter-spacing: .02em; color:#0f172a;">Travirae</div>
        <div style="font-size: 12px; color:#64748b; margin-top: 2px;">Newsletter</div>
      </div>

      <div style="padding: 22px; color:#0f172a; font-size: 15px; line-height: 1.55; ${
        isRtl ? "text-align:right;" : ""
      }">
        ${contentHtml}
      </div>

      <div style="padding: 16px 22px; border-top:1px solid #eef0f6; background:#fbfcfe; display:flex; justify-content:space-between; align-items:center; gap:12px; ${
        isRtl ? "flex-direction:row-reverse;" : ""
      }">
        <div style="font-size: 12px; color:#64748b;">
          © ${new Date().getFullYear()} Travirae
        </div>
        <a href="${unsubscribeUrl}" style="font-size: 12px; color:#2563eb; text-decoration:none;">${label}</a>
      </div>
    </div>
  </div>
  `;
}

function pickContent(
  contentByLang: Record<string, any>,
  lang: LangCode,
  fallback: LangCode,
): { subject: string; body: string } | null {
  const c = contentByLang?.[lang] || {};
  const f = contentByLang?.[fallback] || {};
  const subject = String(c.subject || f.subject || "").trim();
  const body = String(c.body || f.body || "").trim();
  if (!subject || !body) return null;
  return { subject, body };
}

async function sendResendEmail({
  resendApiKey,
  from,
  to,
  subject,
  html,
}: {
  resendApiKey: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    const msg = (data && (data.error?.message || data.message || JSON.stringify(data))) || `HTTP ${resp.status}`;
    throw new Error(msg);
  }
  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("", {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
    const resendFrom = Deno.env.get("RESEND_FROM") || "Travirae <info@travirae.com>";
    const siteUrl = Deno.env.get("SITE_URL") || "";

    const adminEmail = (Deno.env.get("ADMIN_EMAIL") || "serioliivan@gmail.com").toLowerCase();

    // 1) Auth check (admin only)
    const authHeader = req.headers.get("Authorization") || "";
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: authData, error: authErr } = await authClient.auth.getUser();
    if (authErr || !authData?.user) return json({ error: "Non autorizzato" }, 401);

    const email = String(authData.user.email || "").toLowerCase();
    if (email !== adminEmail) return json({ error: "Accesso negato" }, 403);

    // 2) Parse payload
    const body = await req.json().catch(() => ({}));
    const contentByLang = body?.contentByLang;
    if (!contentByLang || typeof contentByLang !== "object") {
      return json({ error: "Payload non valido (contentByLang mancante)." }, 400);
    }

    // Fallback: ITA se compilato, altrimenti prima lingua con contenuto.
    let fallback: LangCode = "ITA";
    const ita = pickContent(contentByLang, "ITA", "ITA");
    if (!ita) {
      const first = SUPPORTED_LANGS.find((l) => pickContent(contentByLang, l, l));
      if (!first) return json({ error: "Compila almeno 1 lingua (oggetto + testo)." }, 400);
      fallback = first;
    }

    // 3) Fetch subscribers (service role)
    const adminDb = createClient(supabaseUrl, supabaseServiceRoleKey);
    const { data: subs, error: subsErr } = await adminDb
      .from("newsletter_subscribers")
      .select("email, token, language")
      .eq("subscribed", true);

    if (subsErr) {
      return json({ error: "Errore DB: " + subsErr.message }, 500);
    }

    const subscribers = (subs || []).filter((s: any) => s?.email);
    const total = subscribers.length;

    let sent = 0;
    let failed = 0;

    const by_language: Record<string, { total: number; sent: number; failed: number }> = {};

    for (const s of subscribers) {
      const subLang = normalizeLang(s.language);
      const content = pickContent(contentByLang, subLang, fallback);
      const chosenLang = content ? subLang : fallback;

      // counts
      if (!by_language[chosenLang]) by_language[chosenLang] = { total: 0, sent: 0, failed: 0 };
      by_language[chosenLang].total++;

      if (!content) {
        failed++;
        by_language[chosenLang].failed++;
        continue;
      }

      const unsubscribeUrl = siteUrl
        ? `${siteUrl.replace(/\/$/, "")}/newsletter-unsubscribe.html?token=${encodeURIComponent(String(s.token || ""))}`
        : "";

      const html = wrapEmail({ bodyText: content.body, unsubscribeUrl, lang: chosenLang });

      try {
        await sendResendEmail({
          resendApiKey,
          from: resendFrom,
          to: String(s.email),
          subject: content.subject,
          html,
        });
        sent++;
        by_language[chosenLang].sent++;
      } catch (_err) {
        failed++;
        by_language[chosenLang].failed++;
      }
    }

    return json({ ok: true, total, sent, failed, by_language });
  } catch (err: any) {
    return json({ error: err?.message || "Errore inatteso" }, 500);
  }
});
