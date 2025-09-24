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

// ===== Background photos for category bars (Unsplash)
// ===== Background photos for category bars (LOCAL)
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const photoMap = {
    'addio-celibato':'addio-celibato.jpg',
    'anniversario':'anniversario.jpg',
    'arrampicata':'arrampicata.jpg',
    'autunno':'autunno.jpg',
    'capodanno-caldo':'capodanno-caldo.jpg',
    'capodanno-sulla-neve':'capodanno-sulla-neve.jpg',
    'ciclismo':'ciclismo.jpg',
    'citta':'citta.jpg',
    'compleanno':'compleanno.jpg',
    'coppia':'coppia.jpg',
    'cultura':'cultura.jpg',
    'da-solo':'da-solo.jpg',
    'destinazioni-popolari':'destinazioni-popolari.jpg',
    'esotici':'esotici.jpg',
    'estate':'estate.jpg',
    'famiglia-con-bambini-piccoli':'famiglia-con-bambini-piccoli.jpg',
    'famiglia-con-ragazzi-grandi':'famiglia-con-ragazzi-grandi.jpg',
    'fuga-romantica':'fuga-romantica.jpg',
    'golf':'golf.jpg',
    'gruppo-di-amici':'gruppo-di-amici.jpg',
    'gruppo-di-ragazzi-giovani':'gruppo-di-ragazzi-giovani.jpg',
    'immersioni':'immersioni.jpg',
    'inverno':'inverno.jpg',
    'isole':'isole.jpg',
    'lago':'lago.jpg',
    'low-cost':'low-cost.jpg',
    'luna-di-miele':'luna-di-miele.jpg',
    'luxury':'luxury.jpg',
    'mare':'mare.jpg',
    'meno-di-99':'meno-di-99.jpg',
    'montagna':'montagna.jpg',
    'natura':'natura.jpg',
    'premium':'premium.jpg',
    'primavera':'primavera.jpg',
    'relax':'relax.jpg',
    'safari':'safari.jpg',
    'sci':'sci.jpg',
    'snorkeling':'snorkeling.jpg',
    'snowboard':'snowboard.jpg',
    'surf':'surf.jpg',
    'trekking':'trekking.jpg'
  };
  function applyBG(){
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const key = slug(label);
      const localPath = 'assets/img/categories/' + (photoMap[key] || (key + '.jpg'));
      const chosen = btn.dataset.photo || localPath;
      const test = new Image();
      test.onload  = ()=>{ btn.style.backgroundImage = 'url("'+chosen+'")'; };
      test.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero.jpg)'; };
      test.src = chosen;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
  else applyBG();
})();



  // === Background images per subcategory (added by ChatGPT) ===
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
  const picsMap = {
    'mare':'beach,sea,coast,sunny',
    'montagna':'mountain,alps,peak',
    'lago':'lake,alpine,lakeside',
    'isole':'tropical island,lagoon,palm',
    'cultura':'museum,old town,architecture',
    'relax':'spa,resort,pool',
    'citta':'city skyline,europe,old town',
    'safari':'safari,africa,jeep',
    'esotici':'tropical,paradise,island',
    'natura':'forest,nature,waterfall',
    'destinazioni-popolari':'famous landmarks,city skyline',
    'fuga-romantica':'romantic couple sunset',
    'anniversario':'romantic dinner view',
    'luna-di-miele':'honeymoon,overwater,bungalow',
    'addio-celibato':'party,nightlife,rooftop',
    'capodanno-caldo':'new year beach fireworks',
    'capodanno-sulla-neve':'new year snow ski fireworks',
    'compleanno':'birthday travel city view',
    'da-solo':'solo traveler backpacker scenic',
    'coppia':'couple travel romantic',
    'famiglia-con-bambini-piccoli':'family with kids beach resort',
    'famiglia-con-ragazzi-grandi':'family teens adventure travel',
    'gruppo-di-ragazzi-giovani':'friends group beach party',
    'gruppo-di-amici':'friends group hiking city',
    'meno-di-99€':'budget travel city break',
    'low-cost':'budget travel backpacker',
    'premium':'luxury resort ocean',
    'luxury':'luxury hotel suite ocean',
    'estate':'summer beach',
    'primavera':'spring flowers city',
    'autunno':'autumn foliage lake',
    'inverno':'winter snow mountain',
    'snowboard':'snowboard freeride powder',
    'sci':'ski alpine',
    'trekking':'hiking trail mountain',
    'arrampicata':'rock climbing cliff',
    'ciclismo':'cycling road bike scenic',
    'surf':'surf big wave',
    'immersioni':'scuba diving reef',
    'snorkeling':'snorkeling coral reef',
    'golf':'golf course green fairway'
  };

  // Insert a sublabel with the group title (e.g., Budget, Sport) under the main label
  (function addSublabels(){
    document.querySelectorAll('.categories-list').forEach(list=>{
      const group = list.getAttribute('data-group') || '';
      // Prettify group name
      const pretty = group.charAt(0).toUpperCase() + group.slice(1);
      list.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
        if(!btn.querySelector('.sublabel')){
          const s = document.createElement('span');
          s.className = 'sublabel';
          s.textContent = pretty;
          btn.insertBefore(s, btn.querySelector('.chevron'));
        }
      });
    });
  })();

  // Apply background images
  function applyBG(){
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const key = slug(label);
      const query = picsMap[key] || 'travel,landscape';
      // Use Unsplash Source dynamic endpoint at 1920x500 for crisp images
      const url = btn.dataset.photo || ('https://source.unsplash.com/1920x500/?'+encodeURIComponent(query));
      const test = new Image();
      test.onload  = ()=>{ btn.style.backgroundImage = 'url("'+url+'")'; };
      test.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero.jpg)'; };
      test.src = url;
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
  else applyBG();
