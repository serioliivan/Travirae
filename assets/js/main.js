
/* Travirae main.js - on-site search using Netlify proxy + Travelpayouts */
const CONFIG = {};
async function loadConfig(){
  const res = await fetch('config/app.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Missing config/app.json');
  Object.assign(CONFIG, await res.json());
}

function el(sel, root=document){ return root.querySelector(sel); }
function esc(s){ return s.replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m])); }

function debounce(fn, delay=250){ let t; return (...args)=>{ clearTimeout(t); t=setTimeout(()=>fn(...args), delay); }; }

function setupDates(){
  const today = new Date(); today.setHours(0,0,0,0);
  const fmt = (d)=>d.toISOString().slice(0,10);
  el('#departInput').min = fmt(today);
  el('#returnInput').min = fmt(today);
  el('#departInput').value = fmt(new Date(today.getTime()+7*864e5));
  el('#returnInput').value = fmt(new Date(today.getTime()+10*864e5));
}

async function ping(){
  try{
    const r = await fetch(`${CONFIG.API_BASE}/api/ping`);
    if(!r.ok) throw new Error('HTTP '+r.status);
    const j = await r.json();
    if(!j.ok) throw new Error('Proxy responded not ok');
    showInfo('✅ Proxy attivo.');
  }catch(e){ showInfo('❌ Proxy offline. Controlla API_BASE o Netlify. '+e.message, true); }
}

function showInfo(msg, isErr=false){
  const bar = el('#infoBar');
  bar.classList.remove('hidden');
  bar.style.borderColor = isErr ? 'rgba(239,68,68,.4)' : 'var(--border)';
  bar.textContent = msg;
}

function setupAutocomplete(inputId, listId){
  const input = el(inputId);
  const list = el(listId);
  const render = (items)=>{
    if(!items?.length){ list.innerHTML=''; return; }
    const ul = document.createElement('ul');
    items.slice(0,10).forEach(it=>{
      const li = document.createElement('li');
      const label = `${it.name} ${it.iata ? '('+it.iata+')' : ''}${it.country ? ' — '+it.country : ''}`;
      li.innerHTML = esc(label);
      li.onclick = ()=>{
        input.value = `${it.name} (${it.iata})`;
        input.dataset.iata = it.iata || '';
        list.innerHTML='';
      };
      ul.appendChild(li);
    });
    list.innerHTML=''; list.appendChild(ul);
  };
  const search = debounce(async (q)=>{
    input.dataset.iata = '';
    if(q.length < 2){ list.innerHTML=''; return; }
    try{
      const url = `${CONFIG.API_BASE}/api/airports/suggest?q=${encodeURIComponent(q)}&locale=${CONFIG.LOCALE_DEFAULT || 'it'}`;
      const r = await fetch(url);
      if(!r.ok) throw new Error('HTTP '+r.status);
      const j = await r.json();
      if(!j.ok) throw new Error(j.error || 'autocomplete error');
      render(j.items);
    }catch(e){ console.error('autocomplete', e); list.innerHTML=''; }
  }, 250);
  input.addEventListener('input', e=>search(e.target.value.trim()));
  document.addEventListener('click', e=>{ if(!list.contains(e.target) && e.target!==input) list.innerHTML=''; });
}

function extractIATA(val, fallback=''){
  const m = /\(([A-Z]{3})\)/.exec(val.toUpperCase());
  return m ? m[1] : fallback;
}

function buildDeeplink(o, d, depart, ret, marker){
  // Aviasales search pattern: /search/OO1DDMMYYDD... Variation exists—use simple URL builder fallback.
  const dep = depart.replace(/-/g,'');
  const rt = ret ? ret.replace(/-/g,'') : '';
  const pax = '1'; // adults
  // Basic WL link; marker as query param to ensure attribution
  return `https://www.aviasales.com/search/${o}${dep}${d}${pax}?marker=${encodeURIComponent(marker)}`;
}

async function doSearch(evt){
  evt.preventDefault();
  const o = el('#originInput');
  const d = el('#destInput');
  const depart = el('#departInput').value;
  const ret = el('#returnInput').value || '';
  let O = o.dataset.iata || extractIATA(o.value);
  let D = d.dataset.iata || extractIATA(d.value);
  if(!O || !D){ showInfo('Seleziona gli aeroporti dai suggerimenti (IATA mancante).', true); return; }
  const resultsEl = el('#results'); resultsEl.innerHTML='';
  showInfo('⏳ Cerco i prezzi…');
  try{
    const url = `${CONFIG.API_BASE}/api/flights/search?origin=${O}&destination=${D}&depart=${depart}${ret?`&return=${ret}`:''}&currency=${CONFIG.CURRENCY_DEFAULT||'EUR'}&limit=10`;
    const r = await fetch(url);
    const j = await r.json();
    if(!r.ok || !j.ok) throw new Error((j && j.error) || ('HTTP '+r.status));
    if(!j.results?.length){ showInfo('Nessun volo trovato per le date selezionate.'); return; }
    showInfo(`✅ Trovate ${j.results.length} tariffe (valuta ${j.currency}).`);
    const frag = document.createDocumentFragment();
    j.results.forEach(it=>{
      const card = document.createElement('div');
      card.className = 'result';
      card.innerHTML = `
        <h3>${esc(O)} → ${esc(D)}</h3>
        <div class="price">${esc(it.value ? (it.value+' '+(j.currency||'EUR')) : '—')}</div>
        <div class="meta">Partenza: ${esc(it.depart_date || '-')} ${it.return_date ? (' · Ritorno: '+esc(it.return_date)) : ''}</div>
        <div class="meta">Scali: ${esc(String(it.changes ?? 0))}</div>
        <div class="cta"><a target="_blank" rel="nofollow noopener" href="${esc(it.link || buildDeeplink(O,D,depart,ret,'669407'))}">Book →</a></div>
      `;
      frag.appendChild(card);
    });
    resultsEl.appendChild(frag);
  }catch(e){
    console.error(e);
    showInfo('❌ Errore server: '+e.message, true);
  }
}

document.addEventListener('DOMContentLoaded', async()=>{
  try{
    await loadConfig();
    setupDates();
    setupAutocomplete('#originInput', '#originList');
    setupAutocomplete('#destInput', '#destList');
    await ping();
    el('#searchForm').addEventListener('submit', doSearch);
  }catch(e){
    console.error(e);
    showInfo('❌ Config mancante o proxy non raggiungibile. '+e.message, true);
  }
});
