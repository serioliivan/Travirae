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

// Footer year + partners odd centering
(function(){ const y=$('#year-copy'); if(y) y.textContent=new Date().getFullYear();
  $$('.partners-logos').forEach(p=>{ const n=p.querySelectorAll('img').length; if(n%2===1) p.classList.add('is-odd'); });
})();

// ===== Modal logic & content (if modal exists) =====
(function(){
  const modal = $('#destination-modal');
  if(!modal) return;
  const titleEl = $('#dest-title', modal);
  const descEl  = $('.dest-desc', modal);
  const hiEl    = $('.dest-highlights', modal);
  const bonusEl = $('.dest-bonus', modal);

  function catchyTagline(category, city){
    const base=(category||'').toLowerCase();
    const map={
      mare:'spiagge da cartolina e tramonti 🔆', montagna:'tra vette, rifugi e cieli limpidi 🏔️',
      citta:'musei, rooftop e quartieri iconici 🏙️', surf:'onde perfette e chill vibes 🏄', golf:'fairway curati e tee time perfetti ⛳️'
    };
    const key=Object.keys(map).find(k=>base.includes(k));
    const t=map[key]||'storie, sapori e panorami ✨'; return `${city} — ${t}`;
  }
  function longDescription(city, category){
    const c=(category||'').toLowerCase();
    if(c.includes('mare')) return `${city} profuma di salsedine e libertà: mattine lente, sabbia setosa e acqua cristallina. A pranzo chioschi sul mare e pesce freschissimo. Pomeriggi tra calette e passeggiate; al tramonto cocktail vista orizzonte.`;
    if(c.includes('montagna')) return `A ${city} si respira meglio: boschi, torrenti e rifugi di legno e pietra. Giornate tra escursioni e panorami infiniti; la sera il cielo è pieno di stelle.`;
    if(c.includes('citt')) return `${city} sorprende a ogni angolo: musei, gallerie, street food e architetture iconiche. Tra quartieri creativi e rooftop con vista, è una meta che accende curiosità.`;
    return `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati. Tra passeggiate e piccole sorprese, la voglia di restare cresce.`;
  }
  function strongBonuses(category){
    const c=(category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')||c.includes('snork')) return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
    if(c.includes('montagna')||c.includes('trek')||c.includes('arramp')) return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato.';
    if(c.includes('citt')) return '🎁 Bonus: pass salta‑fila a 2 musei + drink su un rooftop panoramico.';
    if(c.includes('surf')) return '🎁 Bonus: session all’alba con coach locale e foto professionali.';
    if(c.includes('golf')) return '🎁 Bonus: tee time al mattino con green veloci garantiti.';
    return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
  }

  function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  modal.querySelectorAll('[data-close]').forEach(x=>x.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  document.addEventListener('click', ev=>{
    const trg=ev.target.closest('.more'); if(!trg) return;
    ev.preventDefault();
    const card=trg.closest('.city-card');
    const city=trg.getAttribute('data-city')||(card?(card.querySelector('h3')?.textContent||'La destinazione'):'La destinazione');
    const category=trg.closest('.accordion-item')?.querySelector('.label')?.textContent||'';
    titleEl.textContent=catchyTagline(category, city);
    descEl.textContent=longDescription(city, category);
    hiEl.innerHTML='';
    const arr=(trg.dataset.highlights||'scorci fotogenici|cucina locale|atmosfera rilassata|passeggiate al tramonto|quartieri caratteristici').split('|');
    arr.forEach(x=>{const li=document.createElement('li'); li.textContent=x.trim(); hiEl.appendChild(li);});
    bonusEl.textContent=trg.dataset.bonus||strongBonuses(category);
    open();
  });
})();

// ===== Background photos for category bars (robust + observer) =====
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const map={
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
  function applyTo(el){
    const label=el.querySelector('.label')?.textContent||'';
    const q=map[slug(label)]||'travel,landscape';
    const chosen=el.dataset.photo||('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q));
    const img=new Image();
    img.onload=()=>{ el.style.backgroundImage='url("'+chosen+'")'; };
    img.onerror=()=>{ el.style.backgroundImage='url(assets/img/common/hero.jpg)'; };
    img.src=chosen;
  }
  function init(){
    document.querySelectorAll('.accordion-toggle.category').forEach(el=>applyTo(el));
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();

  // Observe future nodes (in case of lazy rendering)
  const obs=new MutationObserver(muts=>{
    muts.forEach(m=>{
      m.addedNodes.forEach(n=>{
        if(n.nodeType===1 && n.matches && n.matches('.accordion-toggle.category')) applyTo(n);
        if(n.nodeType===1) n.querySelectorAll && n.querySelectorAll('.accordion-toggle.category').forEach(applyTo);
      });
    });
  });
  obs.observe(document.documentElement,{childList:true,subtree:true});
})();
