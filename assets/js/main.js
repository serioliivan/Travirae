// Travirae v7-worldwide-r7
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', async ()=>{ await loadContentBundle((document.documentElement.lang||'it').slice(0,2)); 
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('is-open', !expanded);
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', async ()=>{ await loadContentBundle((document.documentElement.lang||'it').slice(0,2)); 
        const open = item.classList.contains('open');
        $$('.accordion-item', group).forEach(i=>{
          i.classList.remove('open');
          $('.accordion-toggle', i).setAttribute('aria-expanded','false');
          $('.accordion-panel', i).hidden = true;
        });
        if(!open){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          panel.hidden = false;
        }
      });
    });
  });

  // Flights form -> Google Flights
  const flightsForm = $('#flights-form');
  if(flightsForm){
    flightsForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const from = $('#from').value.trim();
      const to = $('#to').value.trim();
      const d1 = $('#depart').value;
      const d2 = $('#return').value;
      const adults = $('#adults').value || '1';
      const cabin = $('#cabin').value || 'economy';
      const parts = [];
      if(from && to) parts.push(`volo da ${from} a ${to}`);
      if(d1) parts.push(`partenza ${d1}`);
      if(d2) parts.push(`ritorno ${d2}`);
      parts.push(`${adults} adulti ${cabin}`);
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' ')) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }
})();


// Helpers
const $ = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));

// ===== Catchy content for modal =====
function catchyTagline(category, city){
  const base = (category||'').toLowerCase();
  const map = {
    mare:'spiagge da cartolina e tramonti 🔆',
    montagna:'tra vette, rifugi e cieli limpidi 🏔️',
    citta:'musei, rooftop e quartieri iconici 🏙️',
    surf:'onde perfette e chill vibes 🏄',
    golf:'fairway curati e tee time perfetti ⛳️'
  };
  const t = map[Object.keys(map).find(k=>base.includes(k))] || 'storie, sapori e panorami ✨';
  return `${city} — ${t}`;
}

function longDescription(city, category){
  const base=(category||'').toLowerCase();
  const L=window.__I18N__||{}; const D=L.longDesc||L.longDesc_fallback||{};
  const key=['mare','montagna','citta','surf','golf'].find(k=>base.includes(k))||'other';
  return (D[key]||'').replace(/\{\{city\}\}/g, city);
}

function strongBonuses(category){
  const base=(category||'').toLowerCase(); const L=window.__I18N__||{}; const B=L.bonuses||L.bonuses_fallback||{};
  if(base.includes('mare')||base.includes('isole')||base.includes('snork')) return B.mare||'';
  if(base.includes('montagna')||base.includes('trek')||base.includes('arramp')) return B.montagna||'';
  if(base.includes('citt')) return B.citta||'';
  if(base.includes('surf')) return B.surf||'';
  if(base.includes('golf')) return B.golf||'';
  return B.mare||'';
}

// ===== Open/close modal and delegate clicks on "Scopri di più"
(function(){
  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const titleEl = modal.querySelector('#dest-title');
  const descEl = modal.querySelector('.dest-desc');
  const hiEl   = modal.querySelector('.dest-highlights');
  const bonusEl= modal.querySelector('.dest-bonus');

  function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  modal.querySelectorAll('[data-close]').forEach(x=> x.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  document.addEventListener('click', (ev)=>{
    const trg = ev.target.closest('.more'); if(!trg) return;
    ev.preventDefault();
    const card = trg.closest('.city-card');
    const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent || 'La destinazione') : 'La destinazione');
    const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
    titleEl.textContent = catchyTagline(category, city);
    descEl.textContent = longDescription(city, category);
    hiEl.innerHTML = '';
    (trg.dataset.highlights ? trg.dataset.highlights.split('|') : ['scorci fotogenici','cucina locale','atmosfera rilassata','passeggiate al tramonto']).forEach(x=>{
      const li = document.createElement('li'); li.textContent = x.trim(); hiEl.appendChild(li);
    });
    bonusEl.textContent = trg.dataset.bonus || strongBonuses(category);
    open();
  });
})();

// ===== Background photos for category bars (Unsplash)
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const map = {
    'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine',
    'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
    'citta':'city skyline,europe','safari':'safari,africa','esotici':'tropical,paradise',
    'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
    'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
    'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
    'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
    'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
    'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving,reef','snorkeling':'snorkeling,reef',
    'golf':'golf course'
  };
  function applyBG(){
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    const label = btn.querySelector('.label')?.textContent || '';
    const s = slug(label);
    const qmap = {
      mare:'beach,tropical,blue water',
      montagna:'mountain,alps',
      lago:'lake,alpine lake',
      isole:'island,tropical',
      cultura:'culture,city old town',
      relax:'spa,resort',
      'città':'city skyline',
      safari:'safari,africa wildlife',
      esotici:'tropical,exotic island',
      natura:'nature,landscape',
      'destinazioni-popolari':'famous landmarks',
      'fuga-romantica':'romantic getaway,couple',
      anniversario:'romantic dinner,hotel',
      'luna-di-miele':'honeymoon,overwater villa',
      'addio-celibato':'party,nightlife',
      'capodanno-caldo':'new year,beach fireworks',
      premium:'luxury,resort',
      luxury:'luxury,resort',
      estate:'summer,beach',
      primavera:'spring,flowers',
      autunno:'autumn,foliage',
      inverno:'winter,snow',
      snowboard:'snowboard,freeride',
      sci:'ski,alps',
      trekking:'hiking,trail',
      arrampicata:'rock climbing',
      ciclismo:'cycling,road bike',
      surf:'surf,wave',
      immersioni:'scuba diving,reef',
      snorkeling:'snorkeling,reef',
      golf:'golf course'
    };
    const query = qmap[s] || 'travel,landscape';
    const local = 'assets/img/categories/' + s + '.jpg';
    const unsplash = 'https://source.unsplash.com/1600x400/?' + encodeURIComponent(query);
    const explicit = btn.dataset.photo;

    function setBG(url){ btn.style.backgroundImage = 'url(\"'+url+'\")'; }
    function tryURL(url, onfail){
      const test = new Image();
      test.onload = ()=> setBG(url);
      test.onerror = onfail;
      test.src = url;
    }
    // Priority: explicit data-photo -> local -> unsplash -> fallback
    if(explicit){ tryURL(explicit, ()=>tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)')))); }
    else { tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)'))); }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
else applyBG();
})();


// === i18n bundle loader (UI + content) ===
async function loadUIBundle(lang){
  const m = location.pathname.match(/^\/([a-z]{2})\//);
  const prefix = m ? "../" : "";
  const url = prefix + "assets/i18n/i18n.min.json";
  const resp = await fetch(url, {cache:'no-cache'});
  const all = await resp.json();
  window.__I18N_ALL__ = all; const data = all[lang].ui; window.__I18N_UI__ = data; window.__I18N__ = data; return data;
}
async function loadContentBundle(lang){
  const m = location.pathname.match(/^\/([a-z]{2})\//);
  const prefix = m ? "../" : "";
  const url = prefix + "assets/i18n/i18n.min.json";
  if(!window.__I18N_ALL__){ const r = await fetch(url,{cache:"no-cache"}); window.__I18N_ALL__ = await r.json(); }
  const data = window.__I18N_ALL__[lang].content; window.__I18N_MODAL__ = data; window.__I18N__ = Object.assign({}, window.__I18N_UI__||{}, data); return data;
}
function applyLocaleTexts(dict){
  document.documentElement.lang = dict.lang || 'it';
  document.documentElement.dir = dict.dir || 'ltr';
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const path = el.getAttribute('data-i18n').split('.'); let val = dict;
    path.forEach(k=> val = (val||{})[k]); if(typeof val==='string') el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    const path = el.getAttribute('data-i18n-placeholder').split('.'); let val = dict;
    path.forEach(k=> val = (val||{})[k]); if(typeof val==='string') el.setAttribute('placeholder', val);
  });
  if(dict.labels){
    document.querySelectorAll('.accordion-toggle.category .label').forEach(el=>{
      const it = el.textContent.trim(); if(dict.labels[it]) el.textContent = dict.labels[it];
    });
  }
}
async function initI18n(){
  let langFromPath = (location.pathname.match(/^\/([a-z]{2})\//)||[])[1];
  let saved = localStorage.getItem('lang'); const lang = (langFromPath || saved || 'it').slice(0,2);
  const sel=document.getElementById('lang-switcher'); if(sel){ sel.value=lang; sel.addEventListener('change',()=>{ localStorage.setItem('lang',sel.value); const file=(location.pathname.split('/').pop()||'index.html'); if(location.pathname.match(/^\/[a-z]{2}\//)){const rest=location.pathname.replace(/^\/[a-z]{2}\//,''); location.href='/' + sel.value + '/' + rest;} else {location.href='/' + sel.value + '/' + file;} }); }
  const dict = await loadUIBundle(lang); applyLocaleTexts(dict);
  // Auto-translate trustbar labels if present
  if(dict.home && dict.home.trust){ document.querySelectorAll('.trust-item .label').forEach(el=>{ const cur=el.textContent.trim(); const map=dict.home.trust; if(/Utenti soddisfatti|Happy users|满意用户|Usuarios satisfechos|Utilisateurs satisfaits|Zufriedene Nutzer|Довольные пользователи|مستخدمون سعداء|खुश उपयोगकर्ता/.test(cur)) el.textContent = map.users; else if(/Destinazioni|Destinations|目的地|Destinos|Ziele|Направления|وجهات|गंतव्य/.test(cur)) el.textContent=map.destinations; else if(/Partner affidabili|Trusted partners|可靠合作伙伴|Socios de confianza|Partenaires de confiance|Vertrauenspartner|Надёжные партнёры|شركاء موثوقون|विश्वसनीय पार्टनर/.test(cur)) el.textContent = map.partners; }); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', initI18n); else initI18n();


// === CMP Logic ===
function getConsent(){ try{ return JSON.parse(localStorage.getItem('cmpConsent')||''); }catch(e){ return null; } }
function saveConsent(obj){ localStorage.setItem('cmpConsent', JSON.stringify(obj)); document.getElementById('cmp-banner')?.setAttribute('hidden',''); document.dispatchEvent(new CustomEvent('cmp:change',{detail:obj})); }
function showCMP(){ const el=document.getElementById('cmp-banner'); if(!el) return; el.removeAttribute('hidden'); const cur=getConsent()||{necessary:true,preferences:false,analytics:false,marketing:false}; el.querySelectorAll('[data-cmp-cat]').forEach(i=>{const k=i.getAttribute('data-cmp-cat'); if(k==='necessary'){i.checked=true;i.disabled=true;} else {i.checked=!!cur[k];}}); el.querySelector('#cmp-accept')?.addEventListener('click',()=>saveConsent({necessary:true,preferences:true,analytics:true,marketing:true,ts:Date.now()})); el.querySelector('#cmp-reject')?.addEventListener('click',()=>saveConsent({necessary:true,preferences:false,analytics:false,marketing:false,ts:Date.now()})); el.querySelector('#cmp-save')?.addEventListener('click',()=>{const res={necessary:true,preferences:false,analytics:false,marketing:false,ts:Date.now()}; el.querySelectorAll('[data-cmp-cat]').forEach(i=>{const k=i.getAttribute('data-cmp-cat'); if(k!=='necessary') res[k]=i.checked;}); saveConsent(res);}); }
(function(){ if(!getConsent()){ document.addEventListener('DOMContentLoaded', showCMP); } })();
document.addEventListener('DOMContentLoaded', ()=>{ document.querySelectorAll('[data-open-cmp]').forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); showCMP(); })); });
// Stay22 is considered functional; analytics/marketing iframes can be gated via data-consent attribute (not used in current build).
