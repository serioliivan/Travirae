// Travirae v7-worldwide-r7
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
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
  const c = (category||'').toLowerCase();
  if(c.includes('mare')) return `${city} profuma di salsedine e libertà: mattine lente, sabbia setosa e acqua cristallina. A pranzo ti aspettano chioschi sul mare e piatti di pesce freschissimi. Il pomeriggio scorre tra calette nascoste e passeggiate sul lungomare. E al tramonto? Colori intensi e cocktail vista orizzonte.`;
  if(c.includes('montagna')) return `A ${city} la montagna è un invito a respirare meglio e guardare lontano. Tra boschi profumati e torrenti, i sentieri conducono a rifugi di legno e pietra. Le giornate scorrono tra escursioni, panorami infiniti e pranzi genuini. La sera il cielo si riempie di stelle e il silenzio fa da colonna sonora.`;
  if(c.includes('citt')) return `${city} sorprende a ogni angolo: musei, gallerie, street food e architetture iconiche. Tra quartieri creativi e rooftop con vista, è la meta ideale per chi ama scoprire e fotografare.`;
  return `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati. Fra passeggiate, scoperte e piccole sorprese, la voglia di restare cresce.`;
}

function strongBonuses(category){
  const c= (category||'').toLowerCase();
  if(c.includes('mare')||c.includes('isole')||c.includes('snork')) return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
  if(c.includes('montagna')||c.includes('trek')||c.includes('arramp')) return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato.';
  if(c.includes('citt')) return '🎁 Bonus: pass salta‑fila a 2 musei + drink su un rooftop panoramico.';
  if(c.includes('surf')) return '🎁 Bonus: session all’alba con coach locale e foto professionali.';
  if(c.includes('golf')) return '🎁 Bonus: tee time al mattino con green veloci garantiti.';
  return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
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

// ===== Category photos (image element, local → remote → fallback) =====
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const queryMap = (function(){
    const collect = {};
    document.querySelectorAll('.accordion-toggle.category .label').forEach(el=>{ 
      const k = slug(el.textContent||''); 
      collect[k] = collect[k] || 'travel landscape'; 
    });
    // curated overrides
    Object.assign(collect, {
      'mare':'beach tropical crystal water',
      'montagna':'mountain alps meadow',
      'lago':'mountain lake aerial',
      'isole':'tropical island lagoon',
      'citta':'city skyline europe old town',
      'safari':'safari savannah wildlife',
      'esotici':'tropical paradise palm lagoon',
      'natura':'forest waterfall national park',
      'fuga-romantica':'romantic couple sunset coast',
      'anniversario':'romantic dinner city night',
      'luna-di-miele':'overwater bungalow honeymoon',
      'addio-celibato':'party beach club nightlife',
      'capodanno-caldo':'new year beach fireworks',
      'capodanno-sulla-neve':'new year ski resort fireworks',
      'premium':'luxury resort infinity pool',
      'luxury':'luxury resort overwater',
      'estate':'summer beach',
      'primavera':'spring flowers nature',
      'autunno':'autumn foliage forest',
      'inverno':'winter snow mountains',
      'snowboard':'snowboard freeride powder',
      'sci':'ski piste alpine',
      'trekking':'hiking trail alps',
      'arrampicata':'rock climbing',
      'ciclismo':'cycling road bike scenic',
      'surf':'surf wave barrel',
      'immersioni':'scuba diving coral reef',
      'snorkeling':'snorkeling reef fish',
      'golf':'golf course green tee',
      'destinazioni-popolari':'famous landmark world travel',
      'compleanno':'birthday trip celebration',
      'da-solo':'solo traveler scenic road',
      'coppia':'romantic sunset beach',
      'famiglia-con-bambini-piccoli':'family beach kids',
      'famiglia-con-ragazzi-grandi':'family adventure teens hiking',
      'gruppo-di-ragazzi-giovani':'friends travel party beach',
      'gruppo-di-amici':'group of friends travel',
      'meno-di-99':'budget city break streets',
      'low-cost':'cheap flight city skyline'
    });
    return collect;
  })();

  function setPhoto(btn, key, query){
    let img = btn.querySelector('img.cat-photo');
    if(!img){ img = document.createElement('img'); img.className='cat-photo'; img.alt=''; img.setAttribute('aria-hidden','true'); btn.appendChild(img); }
    const localPath = 'assets/img/categories/' + key + '.jpg';
    const remote = 'https://source.unsplash.com/1600x400/?' + encodeURIComponent(query||'travel landscape');
    const fallback = 'assets/img/common/hero-plane.jpg';

    const t1 = new Image();
    t1.onload = ()=>{ img.src = localPath; };
    t1.onerror = ()=>{
      const t2 = new Image();
      t2.onload = ()=>{ img.src = remote; };
      t2.onerror = ()=>{ img.src = fallback; };
      t2.src = remote;
    };
    t1.src = localPath;
  }

  function applyToAll(){
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const key = slug(label);
      const q = queryMap[key] || 'travel landscape';
      setPhoto(btn, key, q);
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyToAll);
  else applyToAll();
})();
