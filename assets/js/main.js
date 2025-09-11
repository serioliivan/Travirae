const $=(s,ctx=document)=>ctx.querySelector(s); const $$=(s,ctx=document)=>Array.from(ctx.querySelectorAll(s));
let CFG={API_BASE:'',CURRENCY_DEFAULT:'EUR',LOCALE_DEFAULT:'it',API_BASE_EFFECTIVE:''}; let API_OK=false;

// Load config then negotiate API_BASE
fetch('config/app.json').then(r=>r.json()).then(async c=>{
  CFG={...CFG,...c};
  const negotiated = await negotiateBase(CFG.API_BASE);
  if(negotiated){ CFG.API_BASE_EFFECTIVE = negotiated; API_OK=true; } else { notify('Proxy offline. Controlla API_BASE in config/app.json','warn'); }
  init();
}).catch(()=>{ notify('Impossibile leggere config/app.json','err'); init(); });

function join(base, path){
  base = (base||'').replace(/\/+$/,'');
  if(/\/\.netlify\/functions\/proxy$/.test(base) || /\/api\/proxy$/.test(base)) return base + path;
  if(/\/api$/.test(base)) return base + path.replace(/^\/api/,''); // avoid /api/api
  return base + path;
}

async function negotiateBase(base){
  const roots = [];
  const b = (base||'').replace(/\/+$/,'');
  if(!b) return null;
  roots.push(b); // as-is
  // Try trimming known suffixes
  roots.push(b.replace(/\/api\/proxy$/,''));
  roots.push(b.replace(/\/\.netlify\/functions\/proxy$/,''));
  // Remove any trailing '/api'
  roots.push(b.replace(/\/api$/,''));
  const tried=new Set();
  for(const r of roots){
    const url = join(r,'/api/ping');
    if(tried.has(url)) continue;
    tried.add(url);
    try{
      const resp = await fetch(url);
      if(resp.ok){
        let js={}; try{js=await resp.json()}catch{js={}};
        if(js && js.ok) return r;
      }
    }catch{}
  }
  return null;
}

function api(path, params={}){
  const base = CFG.API_BASE_EFFECTIVE || CFG.API_BASE || '';
  const url = new URL(join(base, path));
  for(const [k,v] of Object.entries(params)) if(v!==undefined && v!=='') url.searchParams.set(k,v);
  return url.toString();
}

function init(){
  const file=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  if($('.nav')) $$('.nav a').forEach(a=>{ if(a.getAttribute('href').toLowerCase()===file) a.setAttribute('aria-current','page') });
  if($('#search-form')) attachSearchForm('#search-form','#results');
}

/* ---------------- Autocomplete ---------------- */
function attachAutocomplete(input){
  const wrap=document.createElement('div'); wrap.className='input'; input.parentNode.insertBefore(wrap,input); wrap.appendChild(input);
  const ul=document.createElement('ul'); ul.className='suggest'; ul.style.display='none'; wrap.appendChild(ul);
  let items=[], active=-1;
  const locale=(CFG.LOCALE_DEFAULT||'it').slice(0,2);
  const max=10;
  function render(list){ items=list.slice(0,max); ul.innerHTML=items.map((x,i)=>`<li data-i="${i}"><span class="iata">${x.iata||x.code}</span> ${escapeHtml(x.name)} <span class="type">${x.type||''}</span></li>`).join(''); ul.style.display=items.length?'block':'none'; active=-1; }
  const fetcher=async q=>{ const r=await fetch(api('/api/airports/suggest',{q,locale})); const js=await r.json(); return js.items||[]; }
  const onInput=debounce(async()=>{ const q=input.value.trim(); if(q.length<2){ ul.style.display='none'; return; } try{ render(await fetcher(q)); }catch{} }, 250);
  const pick=i=>{ const it=items[i]; if(!it) return; input.value=`${it.iata||it.code} — ${it.name}`; input.dataset.iata=(it.iata||it.code); ul.style.display='none'; input.blur(); }
  input.addEventListener('input', onInput);
  input.addEventListener('focus', ()=>{ if(input.value.trim().length===0) onInput(); });
  ul.addEventListener('mousedown', e=>{ const li=e.target.closest('li'); if(!li) return; e.preventDefault(); pick(Number(li.dataset.i)); });
  input.addEventListener('keydown', e=>{ if(ul.style.display==='none') return;
    if(e.key==='ArrowDown'){e.preventDefault(); active=Math.min(active+1,items.length-1);}
    if(e.key==='ArrowUp'){e.preventDefault(); active=Math.max(active-1,0);}
    if(e.key==='Enter'){ if(active>=0){ e.preventDefault(); pick(active);} }
    Array.from(ul.children).forEach((li,i)=>li.classList.toggle('active',i===active));
  });
  return { getIata(){ return input.dataset.iata || (input.value.match(/\b([A-Z]{3})\b/i)?.[1]||'').toUpperCase(); } };
}

/* ---------------- Search form ---------------- */
function attachSearchForm(formSel, resultsSel){
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
      const r=await fetch(url); const text=await r.text(); let js={}; try{ js=JSON.parse(text); }catch{ throw new Error('Bad JSON'); }
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

/* ---------------- Utils ---------------- */
function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }
function notify(t,kind='info'){ const b=document.createElement('div'); b.className='banner'+(kind==='err'?' err':kind==='warn'?' warn':''); b.textContent=t; $('.container').prepend(b); setTimeout(()=>b.remove(), 8000); }
function debounce(fn,ms=250){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a),ms);} }
function escapeHtml(s=''){return s.replace(/[&<>"']/g,m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function escapeAttr(s=''){return String(s).replace(/"/g,'&quot;')}
