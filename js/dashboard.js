
(async function(){
  const c = window.supabaseClient;

  // redirect if not logged
  const { data: { session } } = await c.auth.getSession();
  if (!session?.user){ location.href = './affiliazioni.html#login'; return; }

  // load influencer row
  const { data: influencer, error: eInf } = await c.from('influencers').select('*').single();
  if (eInf || !influencer){ document.getElementById('infocard').innerHTML = '<div class="msg">Errore: profilo non trovato.</div>'; return; }

  const ref = influencer.ref;
  const affLink = `${location.origin}/?ref=${encodeURIComponent(ref)}`;

  // draw infocard
  document.getElementById('infocard').innerHTML = `
    <div class="row">
      <span class="badge">Nome: <b>${influencer.name||'-'}</b></span>
      <span class="badge">Email: <b>${influencer.email||'-'}</b></span>
      <span class="badge">Ref: <b>${ref}</b></span>
      <span class="badge">Payout: <b>${Math.round((influencer.payout_rate||0)*100)}%</b></span>
    </div>
    <div class="row">
      <input id="link" value="${affLink}" readonly style="flex:1;padding:10px;border-radius:10px;border:1px solid var(--border);background:#0b1340;color:#e5e7eb" />
      <button id="copy" class="copy">Copia link</button>
    </div>`;
  document.getElementById('copy').onclick = ()=>{
    const el = document.getElementById('link'); el.select(); document.execCommand('copy');
    document.getElementById('copy').textContent = 'Copiato ✓';
    setTimeout(()=> document.getElementById('copy').textContent='Copia link', 1200);
  };

  // summary
  const { data: summary } = await c.from('aff_summary').select('*').single();
  const clicks = summary?.clicks || 0;
  const bookings = summary?.bookings_paid || 0;
  const revenue = Number(summary?.revenue_paid || 0);
  document.getElementById('summary').innerHTML = `
    <div class="kpi"><div class="label">Click</div><div class="n">${clicks}</div></div>
    <div class="kpi"><div class="label">Prenotazioni pagate</div><div class="n">${bookings}</div></div>
    <div class="kpi"><div class="label">Ricavi pagati</div><div class="n">${revenue.toFixed(2)} €</div></div>`;

  // monthly detail
  const { data: monthly } = await c.from('aff_monthly').select('*').order('month', { ascending:false }).limit(24);
  const tbody = document.querySelector('#monthly tbody');
  (monthly||[]).forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.month}</td><td>${(r.revenue_paid||0).toFixed(2)}</td><td>${Math.round(r.payout_rate*100)}%</td><td><b>${(r.payout_due||0).toFixed(2)}</b></td>`;
    tbody.appendChild(tr);
  });
})();
