
(function(){
  const c = window.supabaseClient;

  // Utility
  function slugify(s){ return (s||'').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,16); }
  function genRef(name){ const base = slugify(name)||'creator'; const rnd = Math.random().toString(36).slice(2,6); return `${base}-${rnd}`; }

  async function ensureInfluencerRow(user, name) {
    // fetch existing
    const { data: exists, error: e1 } = await c.from('influencers').select('*').limit(1);
    if (e1) console.warn('select influencers error', e1);
    if (exists && exists.length) return exists[0];

    // create new
    const ref = genRef(name || user.email?.split('@')[0] || 'creator');
    const row = { ref, name: name || user.email, email: user.email, payout_rate: 0.25, user_id: user.id };
    const { data, error } = await c.from('influencers').insert(row).select().single();
    if (error) throw error;
    return data;
  }

  // Attach handlers
  const su = document.getElementById('signup-form');
  const suMsg = document.getElementById('su-msg');
  su?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    suMsg.textContent = 'Creo l'account...';
    const name = document.getElementById('su-name').value.trim();
    const email = document.getElementById('su-email').value.trim();
    const pass = document.getElementById('su-pass').value;

    // Sign up (email+password). Attenzione: se hai email confirmation ON, servirà confermarla.
    const { data: sign, error: eSign } = await c.auth.signUp({ email, password: pass, options: { data: { name } } });
    if (eSign) { suMsg.textContent = 'Errore: ' + eSign.message; return; }

    // Se l'email confirmation è disabilitata, avrai già la sessione; altrimenti chiedi login dopo conferma.
    const { data: { session } } = await c.auth.getSession();
    if (!session) { suMsg.textContent = 'Registrazione completata. Controlla l'email per confermare e poi accedi.'; return; }

    try{
      await ensureInfluencerRow(session.user, name);
      location.href = './dashboard.html';
    }catch(err){
      suMsg.textContent = 'Registrato, ma non sono riuscito a creare il profilo influencer. Contattaci.';
      console.error(err);
    }
  });

  const li = document.getElementById('login-form');
  const liMsg = document.getElementById('li-msg');
  li?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    liMsg.textContent = 'Accesso...';
    const email = document.getElementById('li-email').value.trim();
    const pass = document.getElementById('li-pass').value;
    const { data, error } = await c.auth.signInWithPassword({ email, password: pass });
    if (error){ liMsg.textContent = 'Errore: ' + error.message; return; }

    // ensure row exists
    const { data: { user } } = await c.auth.getUser();
    try{
      await ensureInfluencerRow(user, user.user_metadata?.name || '');
    }catch(err){ console.warn('ensure row', err); }
    location.href = './dashboard.html';
  });

  // If already logged in, redirect to dashboard
  c.auth.getSession().then(({ data: { session }})=>{ if (session?.user) location.href='./dashboard.html'; });
})();
