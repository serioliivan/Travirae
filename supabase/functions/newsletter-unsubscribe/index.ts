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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { token } = await req.json().catch(() => ({ token: '' }))
    const t = String(token || '').trim()

    if (!t || t.length < 8) {
      return json(400, { ok: false, error: 'Missing token' })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!supabaseUrl || !serviceKey) {
      return json(500, { ok: false, error: 'Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY' })
    }

    const sb = createClient(supabaseUrl, serviceKey)

    const { error } = await sb
      .from('newsletter_subscribers')
      .update({ subscribed: false, unsubscribed_at: new Date().toISOString() })
      .eq('token', t)

    if (error) throw error

    return json(200, { ok: true })
  } catch (e) {
    console.error('newsletter-unsubscribe error:', e)
    return json(500, { ok: false, error: (e as Error)?.message || String(e) })
  }
})
