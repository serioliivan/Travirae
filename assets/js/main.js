// Travirae front-end V6 — robust proxy negotiation (accept any 2xx), rich diagnostics.
const $=(s,ctx=document)=>ctx.querySelector(s); const $$=(s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
let CFG={API_BASE:'',CURRENCY_DEFAULT:'EUR',LOCALE_DEFAULT:'it',API_BASE_EFFECTIVE:'',API_STYLE:'api'};

fetch('config/app.json').then(r=>r.json()).then(async c=>{
  CFG={...CFG,...c};
  const res = await resolveApi(CFG.API_BASE);
  if(res && res.effective){ CFG.API_BASE_EFFECTIVE=res.effective; CFG.API_STYLE=res.style; notify(`Proxy rilevato: ${CFG.API_BASE_EFFECTIVE} (${CFG.API_STYLE})`); }
  else notify('Proxy offline. Controlla API_BASE in config/app.json','warn');
  initPage();
}).catch(()=>{ notify('Impossibile leggere config/app.json','err'); initPage(); });

function initPage(){
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if($('.nav')) $$('.nav a').forEach(a=>{ if(a.getAttribute('href').toLowerCase()===file) a.setAttribute('aria-current','page') });
  if($('#search-form')) attachFlightForm('#search-form','#results');
  if($('#stay22-widget')) initStays();
  if($('#transport-form')) initTransport();
  if($('#deals-list')) initDeals();
}

// ---- negotiation helpers
function variants(base){ const b=(base||'').replace(/\/+$/,''); const out=[b,b.replace(/\/api\/proxy$/,''),b.replace(/\/\.netlify\/functions\/proxy$/,''),b.replace(/\/api$/,'')]; return out.filter((v,i,a)=>v && a.indexOf(v)===i); }
function join(base, path, style='api'){ base=(base||'').replace(/\/+$/,''); if(style==='direct'){ if(/\/api$/.test(base)) return base + path.replace(/^\/api/,''); return base + path.replace(/^\/api/,''); } if(/\/api$/.test(base)) return base + path.replace(/^\/api/,''); return base + path; }

async function resolveApi(base){
  const tried=new Set();
  for(const b of variants(base)){
    for(const style of ['api','direct']){
      for(const endpoint of ['/api/ping','/ping']){
        const url = join(b, endpoint, style);
        if(tried.has(url)) continue; tried.add(url);
        try{
          const r = await fetch(url, { method:'GET' });
          // Accept ANY 2xx as OK, even if body is not JSON (some proxies return plain text)
          if(r.status >= 200 && r.status < 300){
            let ok=false;
            try{ const js = await r.clone().json(); ok = !!(js && (js.ok || js.status==='ok')); }catch{ ok=true; } // if not JSON, still OK
            if(ok) return { effective:b, style };
          }
        }catch(e){ /* ignore */ }
      }
    }
  }
  return null;
}

function api(path, params={}){
  const base=CFG.API_BASE_EFFECTIVE || CFG.API_BASE || '';
  const url=new URL(join(base, path, CFG.API_STYLE));
  for(const [k,v] of Object.entries(params)) if(v!==undefined && v!=='') url.searchParams.set(k,v);
  return url.toString();
}

// ---- Flights
function attachAutocomplete(input){
  const wrap=document.createElement('div'); wrap.className='input'; input.parentNode.insertBefore(wrap,input); wrap.appendChild(input);
  const ul=document.createElement('ul'); ul.className='suggest'; ul.style.display='none'; wrap.appendChild(ul);
  let items=[], active=-1; const locale=(CFG.LOCALE_DEFAULT||'it').slice(0,2); const max=10;
  function render(list){ items=list.slice(0,max); ul.innerHTML=items.map((x,i)=>`<li data-i="${i}"><span class="iata">${x.iata||x.code}</span> ${escapeHtml(x.name)} <span class="type">${x.type||''}</span></li>`).join(''); ul.style.display=items.length?'block':'none'; active=-1; }
  const fetcher=async q=>{ const r=await fetch(api('/api/airports/suggest',{q,locale})); const js=await r.json(); return js.items||[]; }
  const onInput=debounce(async()=>{ const q=input.value.trim(); if(q.length<2){ ul.style.display='none'; return; } try{ render(await fetcher(q)); }catch(err){ console.warn('autocomplete error',err); } }, 260);
  const pick=i=>{ const it=items[i]; if(!it) return; input.value=`${it.iata||it.code} — ${it.name}`; input.dataset.iata=(it.iata||it.code); ul.style.display='none'; input.blur(); }
  input.addEventListener('input', onInput); input.addEventListener('focus', ()=>{ if(input.value.trim().length===0) onInput(); });
  ul.addEventListener('mousedown', e=>{ const li=e.target.closest('li'); if(!li) return; e.preventDefault(); pick(Number(li.dataset.i)); });
  input.addEventListener('keydown', e=>{ if(ul.style.display==='none') return;
    if(e.key==='ArrowDown'){e.preventDefault(); active=Math.min(active+1,items.length-1);} if(e.key==='ArrowUp'){e.preventDefault(); active=Math.max(active-1,0);} if(e.key==='Enter'){ if(active>=0){ e.preventDefault(); pick(active);} } Array.from(ul.children).forEach((li,i)=>li.classList.toggle('active',i===active)); });
  return { getIata(){ return input.dataset.iata || (input.value.match(/\b([A-Z]{3})\b/i)?.[1]||'').toUpperCase(); } };
}

function attachFlightForm(formSel, resultsSel){
  const form=$(formSel), box=$(resultsSel); if(!form||!box) return;
  const oCtrl=attachAutocomplete($('#origin')); const dCtrl=attachAutocomplete($('#destination'));
  const depart=$('#depart'), ret=$('#return'), pax=$('#pax');
  if(!depart.value) depart.value = new Date(Date.now()+7*86400000).toISOString().slice(0,10);
  form.addEventListener('submit', async e=>{
    e.preventDefault(); clear(box);
    if(!CFG.API_BASE_EFFECTIVE){ notify('Proxy offline: impossibile effettuare la ricerca.','err'); return; }
    const origin=oCtrl.getIata(), destination=dCtrl.getIata();
    if(!origin || !destination){ return notify('Seleziona origine e destinazione (codice IATA).','warn'); }
    const params={ origin, destination, depart:depart.value, return:ret.value, currency:CFG.CURRENCY_DEFAULT||'EUR', limit:10 };
    const url=api('/api/flights/search', params);
    const spinner=document.createElement('div'); spinner.className='banner'; spinner.innerHTML='<span class="spinner" aria-hidden="true"></span> Caricamento risultati…'; box.before(spinner);
    try{
      const r=await fetch(url); const text=await r.text(); let js={}; try{ js=JSON.parse(text); }catch{ throw new Error('Bad JSON: '+text.slice(0,120)); }
      if(!r.ok || !js.ok){ throw new Error((js && js.error) ? js.error : ('HTTP '+r.status)); }
      renderResults(js.results||[], js.currency||params.currency, box);
      if((js.results||[]).length===0){ box.innerHTML=`<div class="empty">Nessun risultato per le date selezionate. Prova altre date o aeroporti.</div>`; }
    }catch(err){ notify(`Errore ricerca: ${String(err)}`,'err'); }
    finally{ spinner.remove(); }
  });
}

function renderResults(list, currency, box){
  clear(box); const fmt=v=>new Intl.NumberFormat(CFG.LOCALE_DEFAULT||'it',{style:'currency',currency}).format(v||0);
  list.forEach(x=>{ const price=fmt(x.price||x.value||0); const date=x.return_date?`${x.depart_date} → ${x.return_date}`:x.depart_date; const stops=(x.changes||0)===0?'Diretto':`${x.changes} scalo/i`; const cta=`<a class="btn btn-primary" href="${escapeAttr(x.deeplink||'#')}" target="_blank" rel="noopener">Book</a>`; const el=document.createElement('article'); el.className='card-result'; el.innerHTML=`<div><div class="route">${x.origin} → ${x.destination}</div><div class="meta">${date} · ${stops}</div></div><div class="price">${price}<div style="margin-top:8px">${cta}</div></div>`; box.appendChild(el); });
}

// ---- Stays, Transport, Deals (same as v5) ----
async function initStays(){ try{ const partners=await (await fetch('config/partners.json')).json().catch(()=>({})); const aid=partners.STAY22_AID||'travirae'; const campaign=partners.STAY22_CAMPAIGN_DEFAULT||'homepage'; const iframe=$('#stay22-widget'); const form=$('#stays-form'); form.addEventListener('submit', async e=>{ e.preventDefault(); const city=$('#stay-city').value.trim(); const checkin=$('#stay-in').value; const checkout=$('#stay-out').value; let lat='41.9028', lng='12.4964'; if(city){ try{ const u=new URL('https://nominatim.openstreetmap.org/search'); u.searchParams.set('q', city); u.searchParams.set('format','json'); u.searchParams.set('limit','1'); const r=await fetch(u.toString(),{headers:{'Accept':'application/json'}}); const js=await r.json(); if(js && js[0]){ lat=js[0].lat; lng=js[0].lon; } }catch{} } iframe.src=`https://www.stay22.com/embed/gm?aid=${encodeURIComponent(aid)}&lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&checkin=${encodeURIComponent(checkin)}&checkout=${encodeURIComponent(checkout)}&campaign=${encodeURIComponent(campaign)}`; }); }catch{} }
async function initTransport(){ const form=$('#transport-form'); if(!form) return; const partners=await (await fetch('config/partners.json')).json().catch(()=>({})); const marker=partners.TP_SHMARKER || '669407'; const promo=partners.TP_PROMO_ID_12GO || 'XXXXX'; const clickDomain=partners.TRAVELPAYOUTS_CLICK_DOMAIN || 'c1.travelpayouts.com'; form.addEventListener('submit', e=>{ e.preventDefault(); const o=$('#t-origin').value.trim(); const d=$('#t-dest').value.trim(); const date=$('#t-date').value; const trip=`https://12go.asia/en/travel/${encodeURIComponent(o)}/${encodeURIComponent(d)}?date=${encodeURIComponent(date)}`; const deep=`https://${clickDomain}/click?shmarker=${encodeURIComponent(marker)}&promo_id=${encodeURIComponent(promo)}&type=click&source_type=customlink&custom_url=${encodeURIComponent(trip)}`; window.open(deep, '_blank','noopener'); }); }
async function initDeals(){ try{ const js=await (await fetch('data/offers.json')).json(); const list=$('#deals-list'); const btn=$('#more-deals'); let i=0; const step=6; const render=()=>{ const slice=js.slice(i,i+step); i+=slice.length; slice.forEach(x=>{ const el=document.createElement('article'); el.className='card-deal'; el.innerHTML=`<img loading="lazy" src="${escapeAttr(x.img)}" alt="${escapeAttr(x.title)}"><div class="route">${escapeHtml(x.title)}</div><div class="meta">${escapeHtml(x.subtitle||'')}</div><div><span class="badge">${escapeHtml(x.price||'')}</span></div><a class="btn btn-primary" href="${escapeAttr(x.link)}" target="_blank" rel="noopener">Apri offerta</a>`; list.appendChild(el); }); if(i>=js.length) btn.style.display='none'; }; btn.addEventListener('click', render); render(); }catch{} }

// ---- Utils
function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }
function notify(t,kind='info'){ const b=document.createElement('div'); b.className='banner'+(kind==='err'?' err':kind==='warn'?' warn':''); b.textContent=t; $('.container').prepend(b); setTimeout(()=>b.remove(), 8000); }
function debounce(fn,ms=260){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms);} }
function escapeHtml(s=''){return String(s).replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(s=''){return String(s).replace(/"/g,'&quot;')}
