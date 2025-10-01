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

function cityForTitle(raw){
  if(!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/\s*\([^)]*\)\s*$/,'').trim();
  return s;
}


// Emoji sanitation
function stripEmojis(str){
  if(!str) return str;
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
    .replace(/[\u2600-\u27BF]/g,'')
    .replace(/[\u{FE0F}]/gu,'');
}

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
    titleEl.textContent = stripEmojis(cityForTitle(city) || '');
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

// ===== Country labels on cards =====
(function(){
  const MAP = {
    // quick exact matches
    'Iceland':'Islanda','Norwegian Fjords':'Norvegia','Azores':'Portogallo','Galapagos':'Ecuador',
    'Kyoto':'Giappone','Seoul':'Corea del Sud','Taipei':'Taiwan','Quebec City':'Canada','Vancouver':'Canada','Sydney':'Australia','Melbourne':'Australia',
    'Bali':'Indonesia','Lisbona':'Portogallo','Marbella':'Spagna','Vilamoura (Algarve)':'Portogallo','Costa del Sol':'Spagna'
  };
  const KEY = [
    [/francia|chamonix|tignes|val d.?is[eè]re|courchevel|val thorens/i, 'Francia'],
    [/svizzera|zermatt|st\.?\s*moritz|verbier|grindelwald/i, 'Svizzera'],
    [/austria|innsbruck|zillertal|tirol|kitzb[uü]hel/i, 'Austria'],
    [/italia|dolomiti|cortina|amalfi|sardegna|puglia|roma|venezia|sicilia/i, 'Italia'],
    [/spagna|ibiza|formentera|marbella|costa del sol/i, 'Spagna'],
    [/portogallo|algarve|azores/i, 'Portogallo'],
    [/grecia|santorini|mykonos|athens?/i, 'Grecia'],
    [/hawaii|aspen|colorado|california|arizona|utah|new york|pebble beach/i, 'Stati Uniti'],
    [/canada|banff|whistler|qu[eé]bec|vancouver/i, 'Canada'],
    [/messico|canc[uú]n|riviera maya|cozumel/i, 'Messico'],
    [/giappone|kyoto|hakuba|niseko/i, 'Giappone'],
    [/thailandia|phuket|koh samui|chiang mai|koh tao/i, 'Thailandia'],
    [/indonesia|bali|nusa lembongan/i, 'Indonesia'],
    [/filippine|boracay/i, 'Filippine'],
    [/madagascar|nosy be/i, 'Madagascar'],
    [/tanzania|zanzibar/i, 'Tanzania'],
    [/australia|sydney|melbourne/i, 'Australia'],
    [/nuova zelanda|queenstown|cape kidnappers/i, 'Nuova Zelanda'],
    [/argentina|patagonia|el chalten/i, 'Argentina'],
    [/per[uú]|titicaca/i, 'Perù'],
    [/bolivia/i, 'Bolivia'],
    [/guatemala|atitlan/i, 'Guatemala'],
    [/myanmar|inle/i, 'Myanmar'],
    [/egitto|red sea|sharm/i, 'Egitto'],
    [/marocco|marrakech|merzouga/i, 'Marocco'],
    [/turchia|istanbul|cappadocia/i, 'Turchia'],
    [/emirati|dubai|abu dhabi|yas links/i, 'Emirati Arabi Uniti'],
    [/islanda/i, 'Islanda'],
    [/irlanda/i, 'Irlanda'],
    [/regno unito|scotland|highlands/i, 'Regno Unito']
  ];
  function baseName(raw){ return String(raw).replace(/\s*\([^)]*\)\s*$/,'').trim(); }
  function findCountry(raw){
    const m = String(raw).match(/\(([^)]*)\)\s*$/);
    if(m){ const h = m[1].toLowerCase();
      if(/hawaii/.test(h)) return 'Stati Uniti';
      if(/svizzera/.test(h)) return 'Svizzera';
      if(/francia/.test(h)) return 'Francia';
      if(/ital(i|y)/.test(h)) return 'Italia';
      if(/spagna/.test(h)) return 'Spagna';
      if(/portogallo/.test(h)) return 'Portogallo';
      if(/grecia/.test(h)) return 'Grecia';
      if(/canada/.test(h)) return 'Canada';
      if(/mexico|messico/.test(h)) return 'Messico';
      if(/giappone/.test(h)) return 'Giappone';
      if(/thailand/.test(h)) return 'Thailandia';
      if(/indonesia/.test(h)) return 'Indonesia';
      if(/philippines|filippine/.test(h)) return 'Filippine';
      if(/madagascar/.test(h)) return 'Madagascar';
      if(/tanzania/.test(h)) return 'Tanzania';
      if(/nuova zelanda|new zealand/.test(h)) return 'Nuova Zelanda';
      if(/australia/.test(h)) return 'Australia';
    }
    const name = String(raw).trim();
    if(MAP[name]) return MAP[name];
    const low = name.toLowerCase();
    for(const [rx, c] of KEY){ if(rx.test(low)) return c; }
    return '—';
  }
  function decorate(){
    document.querySelectorAll('.city-card .city-info h3').forEach(h=>{
      if(h.querySelector('.place-line')) return;
      const raw = (h.textContent||'').trim();
      const place = baseName(raw);
      const country = findCountry(raw);
      h.textContent = '';
      const s1 = document.createElement('span'); s1.className = 'place-line'; s1.textContent = place;
      const s2 = document.createElement('span'); s2.className = 'country-line'; s2.textContent = `(${country})`;
      h.appendChild(s1); h.appendChild(s2);
    });
  }
  document.addEventListener('DOMContentLoaded', decorate);
})();
