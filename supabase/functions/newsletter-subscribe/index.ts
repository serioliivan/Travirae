import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function isValidEmail(email: string) {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)
}

const ALLOWED_LANGS = new Set(['ITA', 'ENG', 'ARA', 'DEU', 'SPA', 'RUS', 'NLD', 'ZHO', 'FRA'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json().catch(() => ({})) as { email?: string; language?: string }
    const email = String(payload.email || '').trim().toLowerCase()
    let language = String(payload.language || '').trim().toUpperCase()

    if (!ALLOWED_LANGS.has(language)) language = 'ITA'

    if (!email || !isValidEmail(email)) {
      return json(400, { ok: false, error: 'Email non valida.' })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !serviceRoleKey) {
      return json(500, { ok: false, error: 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.' })
    }

    const sb = createClient(supabaseUrl, serviceRoleKey)

    // check existing
    const { data: existing, error: selErr } = await sb
      .from('newsletter_subscribers')
      .select('id, token, subscribed')
      .eq('email', email)
      .maybeSingle()

    if (selErr) throw selErr

    if (existing) {
      const already = !!existing.subscribed
      const { error: updErr } = await sb
        .from('newsletter_subscribers')
        .update({ subscribed: true, language, updated_at: new Date().toISOString(), unsubscribed_at: null })
        .eq('id', existing.id)

      if (updErr) throw updErr

      return json(200, { ok: true, already_subscribed: already })
    }

    const token = crypto.randomUUID()

    const { error: insErr } = await sb
      .from('newsletter_subscribers')
      .insert({
        email,
        language,
        subscribed: true,
        token,
      })

    if (insErr) throw insErr

    return json(200, { ok: true, already_subscribed: false })
  } catch (e) {
    console.error('newsletter-subscribe error:', e)
    return json(500, { ok: false, error: (e as Error)?.message || String(e) })
  }
})
