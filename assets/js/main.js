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
      mainNav.classList.toggle('is-open', !expanded);
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
    mare:'spiagge da cartolina e tramonti',
    montagna:'tra vette, rifugi e cieli limpidi',
    citta:'musei, rooftop e quartieri iconici',
    surf:'onde perfette e chill vibes',
    golf:'fairway curati e tee time perfetti'
  };
  const t = map[Object.keys(map).find(k=>base.includes(k))] || 'storie, sapori e panorami';
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


// ==== Insert flag emojis on destination cards ====
(function(){
  function normalize(s){
    return (s||'').toLowerCase()
      .normalize('NFD').replace(/\p{Diacritic}/gu,'')
      .replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  const FLAG = {
    // Europe
    'italia':'🇮🇹','francia':'🇫🇷','svizzera':'🇨🇭','austria':'🇦🇹','germania':'🇩🇪','spagna':'🇪🇸','portogallo':'🇵🇹','grecia':'🇬🇷',
    'regno unito':'🇬🇧','inghilterra':'🇬🇧','scozia':'🇬🇧','irlanda':'🇮🇪','islanda':'🇮🇸','norvegia':'🇳🇴','svezia':'🇸🇪','finlandia':'🇫🇮',
    'polonia':'🇵🇱','repubblica ceca':'🇨🇿','cechia':'🇨🇿','slovacchia':'🇸🇰','slovenia':'🇸🇮','croazia':'🇭🇷','serbia':'🇷🇸','bosnia':'🇧🇦',
    'montenegro':'🇲🇪','albania':'🇦🇱','romania':'🇷🇴','bulgaria':'🇧🇬','macedonia':'🇲🇰','cipro':'🇨🇾','malta':'🇲🇹','paesi bassi':'🇳🇱',
    'olanda':'🇳🇱','belgio':'🇧🇪','lussemburgo':'🇱🇺','andorra':'🇦🇩','monaco':'🇲🇨',
    // Americas
    'stati uniti':'🇺🇸','usa':'🇺🇸','hawaii':'🇺🇸','california':'🇺🇸','colorado':'🇺🇸','new york':'🇺🇸','utah':'🇺🇸','arizona':'🇺🇸','alaska':'🇺🇸',
    'canada':'🇨🇦','messico':'🇲🇽','mexico':'🇲🇽','cuba':'🇨🇺','repubblica dominicana':'🇩🇴','giamaica':'🇯🇲','bahamas':'🇧🇸','porto rico':'🇵🇷',
    'costa rica':'🇨🇷','colombia':'🇨🇴','peru':'🇵🇪','peru ':'🇵🇪','cile':'🇨🇱','argentina':'🇦🇷','brasile':'🇧🇷','uruguay':'🇺🇾',
    'bolivia':'🇧🇴','ecuador':'🇪🇨',
    // Africa & Middle East
    'marocco':'🇲🇦','egitto':'🇪🇬','tunisia':'🇹🇳','algeria':'🇩🇿','tanzania':'🇹🇿','kenya':'🇰🇪','sudafrica':'🇿🇦','namibia':'🇳🇦',
    'botswana':'🇧🇼','madagascar':'🇲🇬','seychelles':'🇸🇨','mauritius':'🇲🇺','maldive':'🇲🇻','zanzibar':'🇹🇿',
    'emirati arabi uniti':'🇦🇪','dubai':'🇦🇪','abu dhabi':'🇦🇪','qatar':'🇶🇦','oman':'🇴🇲','giordania':'🇯🇴','israele':'🇮🇱','arabia saudita':'🇸🇦',
    // Asia & Oceania
    'turchia':'🇹🇷','georgia':'🇬🇪','armenia':'🇦🇲','azerbaigian':'🇦🇿',
    'india':'🇮🇳','sri lanka':'🇱🇰','nepal':'🇳🇵','maldive':'🇲🇻','kazakistan':'🇰🇿','uzbekistan':'🇺🇿','kirghizistan':'🇰🇬',
    'cina':'🇨🇳','giappone':'🇯🇵','corea del sud':'🇰🇷','corea':'🇰🇷','taiwan':'🇹🇼','hong kong':'🇭🇰','indonesia':'🇮🇩','bali':'🇮🇩',
    'malesia':'🇲🇾','filippine':'🇵🇭','thailandia':'🇹🇭','vietnam':'🇻🇳','cambogia':'🇰🇭','laos':'🇱🇦','myanmar':'🇲🇲','singapore':'🇸🇬',
    'australia':'🇦🇺','nuova zelanda':'🇳🇿',
    // Territories / islands
    'polinesia francese':'🇵🇫','bora bora':'🇵🇫','oahu':'🇺🇸','maui':'🇺🇸','kauai':'🇺🇸','algarve':'🇵🇹'
  };
  function flagFor(name){
    const raw = name||'';
    const inPar = /\(([^)]+)\)/.exec(raw);
    const candidates = [];
    if(inPar) candidates.push(inPar[1]);
    candidates.push(raw);
    raw.split(/[–—\-/,]/).forEach(x=>candidates.push(x));
    for(const c of candidates){
      const n = normalize(c);
      if(FLAG[n]) return FLAG[n];
      // try includes match
      for(const key in FLAG){ if(n.includes(key)) return FLAG[key]; }
    }
    return null;
  }
  function injectFlags(){
    document.querySelectorAll('.city-card').forEach(card=>{
      const info = card.querySelector('.city-info');
      const title = card.querySelector('h3')?.textContent?.trim() || '';
      const flag = flagFor(title);
      if(!info) return; if(!flag) { flag='🌍'; }
      if(card.querySelector('.flag-emoji')) return;
      const el = document.createElement('span');
      el.className = 'flag-emoji';
      el.textContent = flag;
      info.appendChild(el);
    });
  }
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', injectFlags); }
  else injectFlags();
})();
