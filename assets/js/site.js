const $=(s,ctx=document)=>ctx.querySelector(s);const $$=(s,ctx=document)=>Array.from(ctx.querySelectorAll(s));

// Load configs
let CFG={}, APP={};
Promise.all([fetch('config/partners.json'), fetch('config/app.json')].map(r=>r.catch(()=>null)))
  .then(async ([p,a])=>{
    try{CFG = await (await p).json();}catch{CFG={}}
    try{APP = await (await a).json();}catch{APP={}}
    init();
  });

function init(){
  const path = location.pathname.split('/').pop()||'index.html';
  $$('.nav a').forEach(a=>{ if(a.getAttribute('href')===path) a.setAttribute('aria-current','page'); });
  if(path==='index.html') initHome();
  if(path==='flights.html') initFlights();
  if(path==='stays.html') initStays();
  if(path==='transport.html') initTransport();
}

/* =============== HOME =============== */
function initHome(){
  const hero=document.getElementById('hero-bg'); if(hero){
    const imgs=[
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1920&q=80',
      'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1920&q=80'
    ]; let i=0; const set=x=>hero.style.backgroundImage=`url('${imgs[x]}')`; set(0); setInterval(()=>{i=(i+1)%imgs.length; set(i);},30000);
  }
  // tabs
  $$('.tab').forEach(b=>b.addEventListener('click',()=>{ $$('.tab').forEach(x=>x.classList.remove('active')); b.classList.add('active'); $$('.tab-pane').forEach(p=>p.classList.remove('active')); const t=$(b.dataset.target); if(t) t.classList.add('active'); }));
  injectAviasalesWidget('#tp-widget-home');
  setupOnsite('#onsite-form','#onsite-results');
}

/* =============== FLIGHTS =============== */
function initFlights(){ injectAviasalesWidget('#tp-widget-flights'); setupOnsite('#onsite-form','#onsite-results'); }

/* =============== STAYS =============== */
function initStays(){
  const iframe = $('#stay22'); const aid=CFG.STAY22_AID||'travirae'; const campaign=CFG.STAY22_CAMPAIGN_DEFAULT||'homepage';
  function setMap(lat,lng,checkin,checkout){ const u=new URL('https://www.stay22.com/embed/gm'); u.searchParams.set('aid',aid); u.searchParams.set('lat',lat); u.searchParams.set('lng',lng); if(checkin)u.searchParams.set('checkin',checkin); if(checkout)u.searchParams.set('checkout',checkout); u.searchParams.append('campaign',campaign); iframe.src=u.toString(); }
  setMap(41.9028,12.4964,new Date().toISOString().slice(0,10), new Date(Date.now()+2*86400000).toISOString().slice(0,10));
  $('#stay-form')?.addEventListener('submit', async e=>{ e.preventDefault(); const city=$('#city').value.trim()||'Rome'; const inD=$('#in').value||''; const outD=$('#out').value||''; try{ const url=new URL('https://nominatim.openstreetmap.org/search'); url.searchParams.set('q',city); url.searchParams.set('format','json'); url.searchParams.set('limit','1'); const r=await fetch(url.toString()); const js=await r.json(); const p=js[0]; if(p) setMap(p.lat,p.lon,inD,outD); else alert('City not found'); }catch(err){ alert('Network error'); } });
}

/* =============== TRANSPORT =============== */
function initTransport(){
  $('#t-form')?.addEventListener('submit', e=>{
    e.preventDefault();
    const f=$('#t-from').value.trim(), t=$('#t-to').value.trim(), d=$('#t-date').value;
    if(!f||!t||!d) return alert('Enter origin, destination, date');
    const u12=`https://12go.asia/en/travel/${encodeURIComponent(f)}/${encodeURIComponent(t)}?date=${encodeURIComponent(d)}&utm_source=travirae&utm_medium=aff&utm_campaign=12go`;
    const click=`https://${CFG.TRAVELPAYOUTS_CLICK_DOMAIN||'c1.travelpayouts.com'}/click?shmarker=${encodeURIComponent(CFG.TP_SHMARKER)}&promo_id=${encodeURIComponent(CFG.TP_PROMO_ID_12GO||'XXXXX')}&source_type=customlink&type=click&custom_url=${encodeURIComponent(u12)}`;
    window.open(click,'_blank','noopener');
  });
}

/* ====== Helpers ====== */
function injectAviasalesWidget(selector){
  const host=$(selector); if(!host) return;
  const p = {
    currency:(CFG.TP_CURRENCY||'EUR').toLowerCase(),
    trs:CFG.TP_TRS, shmarker:CFG.TP_SHMARKER, combine_promos:'101_7873', show_hotels:'true', powered_by:'true',
    locale:CFG.TP_LOCALE||'en', searchUrl:'www.aviasales.com%2Fsearch', primary_override:'#32a8dd', color_button:'#32a8dd', color_icons:'#32a8dd', dark:'#262626', light:'#FFFFFF', secondary:'#FFFFFF', special:'#C4C4C4', color_focused:'#32a8dd', border_radius:'0', plain:'true', promo_id:CFG.TP_PROMO_ID_FLIGHTS||'7879', campaign_id:CFG.TP_CAMPAIGN_ID_FLIGHTS||'100'
  };
  const s=document.createElement('script'); s.async=true; s.charset='utf-8';
  s.src='https://tpemd.com/content?'+(new URLSearchParams(p)).toString();
  host.innerHTML=''; host.appendChild(s);
}

/* ====== On-site search (needs API_BASE) ====== */
async function setupOnsite(formSel, resultsSel){
  const form=$(formSel), box=$(resultsSel), msg=$('#onsite-msg');
  if(!form||!box) return;
  const API_BASE = (APP.API_BASE||'').trim();
  if(!API_BASE){
    msg.innerHTML='On‑site results disabilitati su GitHub Pages. <br>Per attivarli, pubblica l’API proxy Netlify/Vercel inclusa e metti l’URL in <code>config/app.json</code>.';
    msg.hidden=false;
  }

  const sugg = (inp)=>{
    const wrap=document.createElement('div'); wrap.style.position='relative'; inp.parentNode.insertBefore(wrap,inp); wrap.appendChild(inp);
    const ul=document.createElement('ul'); ul.className='suggest'; ul.style.display='none'; wrap.appendChild(ul);
    let items=[],active=-1,last='';
    const fmt=(x)=>`<span class="iata">${x.code||x.iata}</span>${x.name} <span class="muted">· ${x.country_name||x.country_code||''}</span>`;
    async function onInput(){ const q=inp.value.trim(); if(q.length<2){ ul.style.display='none'; return; } last=q;
      try{
        const u=new URL('https://autocomplete.travelpayouts.com/places2'); u.searchParams.set('term',q); u.searchParams.set('locale','en'); u.searchParams.append('types[]','city'); u.searchParams.append('types[]','airport');
        const r=await fetch(u.toString(),{mode:'cors'}); const arr=await r.json();
        items=(arr||[]).slice(0,8); ul.innerHTML=items.map((it,i)=>`<li data-i="${i}">${fmt(it)}</li>`).join(''); ul.style.display=items.length?'block':'none'; active=-1;
      }catch{ /* ignore */ }
    }
    function pick(i){ const it=items[i]; if(!it) return; inp.value = `${(it.code||it.iata)} - ${it.name}`; inp.dataset.iata=(it.code||it.iata); ul.style.display='none'; inp.blur(); }
    inp.addEventListener('input', debounce(onInput,180)); inp.addEventListener('focus', ()=>{ if(inp.value.length===0) onInput(); });
    ul.addEventListener('mousedown', e=>{ const li=e.target.closest('li'); if(!li) return; e.preventDefault(); pick(Number(li.dataset.i)); });
    inp.addEventListener('keydown', e=>{ if(ul.style.display==='none') return;
      if(e.key==='ArrowDown'){e.preventDefault(); active=Math.min(active+1,items.length-1);}
      if(e.key==='ArrowUp'){e.preventDefault(); active=Math.max(active-1,0);}
      if(e.key==='Enter'){ if(active>=0){ e.preventDefault(); pick(active);} }
      Array.from(ul.children).forEach((li,i)=>li.classList.toggle('active',i===active));
    });
    return { get: ()=> (inp.dataset.iata || (inp.value.match(/[A-Z]{3}/)?.[0]||'')).toUpperCase() };
  };
  const sFrom=sugg($('#o-from')), sTo=sugg($('#o-to'));

  form.addEventListener('submit', async e=>{
    e.preventDefault(); box.innerHTML=''; if(!API_BASE){ alert('Attiva prima API_BASE in config/app.json'); return; }
    const o=sFrom.get(), d=sTo.get(); const depart=$('#o-depart').value, ret=$('#o-return').value;
    if(!o||!d||!depart){ alert('Origin, Destination e Departure sono obbligatori'); return; }
    try{
      const u=new URL(API_BASE.replace(/\/$/,'') + '/flights/search'); u.searchParams.set('origin',o); u.searchParams.set('destination',d); u.searchParams.set('depart',depart); if(ret) u.searchParams.set('return',ret); u.searchParams.set('currency','EUR'); u.searchParams.set('limit','12');
      const r=await fetch(u.toString(),{mode:'cors'}); const js=await r.json(); if(!js.ok) throw new Error(js.error||'API error');
      if(!js.results||!js.results.length){ msg.textContent='Nessun risultato per le date selezionate. Prova altre date/aeroporti.'; msg.hidden=false; return; }
      msg.hidden=true;
      box.innerHTML = js.results.map(x=>{
        const date = x.return_date ? `${x.depart_date} → ${x.return_date}` : x.depart_date;
        const price = new Intl.NumberFormat(undefined,{style:'currency',currency:js.currency||'EUR'}).format(x.value||0);
        const link  = x.link ? `<p><a class='btn btn-primary' href='${x.link}' target='_blank' rel='noopener'>Book</a></p>` : '';
        const chg   = (x.changes||0)===0?'Direct':`${x.changes} stop(s)`;
        return `<article class="result"><h3>${x.origin} → ${x.destination}</h3><p class="muted">${date} · ${chg}</p><p><strong>${price}</strong></p>${link}</article>`;
      }).join('');
    }catch(err){ msg.textContent='Errore server: '+String(err); msg.hidden=false; }
  });
}

function debounce(fn,ms=180){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms);} }
