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

// ===== Background photos for category bars
// ===== Background photos for category bars (LOCAL only) =====
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  function applyBG(){
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const key = slug(label);
      const localPath = 'assets/img/categories/' + key + '.jpg';
      const test = new Image();
      test.onload  = ()=>{ btn.style.backgroundImage = 'url("'+localPath+'")'; };
      test.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero-plane.jpg)'; };
      test.src = localPath;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
  else applyBG();
})();


// ===== Category strips photos (Unsplash) — final layout
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const map = {
    'addio-celibato':'beach club,nightlife,party' ,'anniversario':'city night lights,romantic dinner' ,'arrampicata':'rock climbing,cliff' ,'autunno':'autumn foliage,forest,trail' ,'capodanno-caldo':'new year beach,fireworks' ,'capodanno-sulla-neve':'new year ski resort,fireworks' ,'ciclismo':'road cycling,mountain pass' ,'citta':'europe city skyline,old town street' ,'compleanno':'birthday trip,celebration travel' ,'coppia':'romantic couple,sunset beach' ,'cultura':'historic old town,architecture,museum' ,'da-solo':'solo traveler,road trip,scenic' ,'destinazioni-popolari':'world famous landmark,iconic' ,'esotici':'paradise island,turquoise water,overwater' ,'estate':'summer beach,sunshine,sea' ,'famiglia-con-bambini-piccoli':'family beach,kids playing' ,'famiglia-con-ragazzi-grandi':'family hiking,teens,adventure' ,'fuga-romantica':'couple sunset,romantic beach' ,'golf':'golf course,green,tee' ,'gruppo-di-amici':'group of friends,adventure travel' ,'gruppo-di-ragazzi-giovani':'friends travel,beach party' ,'immersioni':'scuba diving,reef,underwater' ,'inverno':'winter snow,mountain,alps' ,'isole':'tropical island,lagoon,aerial' ,'lago':'alpine lake,blue water,shore' ,'low-cost':'cheap flight,city skyline' ,'luna-di-miele':'honeymoon resort,overwater bungalow' ,'luxury':'luxury resort,private beach' ,'mare':'tropical beach,clear water,palm island' ,'meno-di-99':'budget city break,street view' ,'montagna':'alps mountain,lake,peak' ,'natura':'forest waterfall,national park,scenic' ,'premium':'luxury hotel,resort aerial' ,'primavera':'spring flowers,bloom,city park' ,'relax':'spa resort,thermal bath,wellness' ,'safari':'africa safari,savanna,animals' ,'sci':'ski piste,alpine skiing' ,'snorkeling':'snorkeling coral reef,tropical fish' ,'snowboard':'snowboard freeride,action' ,'surf':'surf wave,barrel,action' ,'trekking':'hiking trail,alps ridge'
  };
  function applyBG(){
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const q = map[slug(label)] || 'travel,landscape';
      const remote = 'https://source.unsplash.com/1600x400/?' + encodeURIComponent(q);
      const chosen = btn.dataset.photo || remote;
      const test = new Image();
      test.onload  = ()=>{ btn.style.backgroundImage = 'url("'+chosen+'")'; };
      test.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero-plane.jpg)'; };
      test.src = chosen;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
  else applyBG();
})();
