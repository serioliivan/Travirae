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

// Keep only place name, remove trailing country in parentheses
function cityForTitle(raw){
  if(!raw) return '';
  let s = String(raw).trim();
  s = s.replace(/\s*\([^)]*\)\s*$/,'').trim();
  return s;
}


// === Emoji sanitation ===
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

// ===== Country labels on cards (two-line title) =====
(function(){
  // Canonical country names in IT
  const CAN = {
    it:'Italia', fr:'Francia', es:'Spagna', pt:'Portogallo', gr:'Grecia',
    ch:'Svizzera', at:'Austria', de:'Germania', uk:'Regno Unito',
    us:'Stati Uniti', ca:'Canada', mx:'Messico', br:'Brasile', ar:'Argentina', pe:'Perù', bo:'Bolivia', cl:'Cile', ec:'Ecuador', gt:'Guatemala', myanmar:'Myanmar',
    ma:'Marocco', eg:'Egitto', tr:'Turchia', ae:'Emirati Arabi Uniti', qa:'Qatar',
    au:'Australia', nz:'Nuova Zelanda', id:'Indonesia', th:'Thailandia', ph:'Filippine', my:'Malesia', mm:'Myanmar', jp:'Giappone', kr:'Corea del Sud', tw:'Taiwan', cn:'Cina',
    is:'Islanda', no:'Norvegia', se:'Svezia', fi:'Finlandia', ie:'Irlanda', dk:'Danimarca', mt:'Malta', tn:'Tunisia', mauritius:'Mauritius', tanzania:'Tanzania', madagascar:'Madagascar', ae2:'Emirati Arabi Uniti'
  };

  // Exact destination -> country (covers nomi senza parentesi)
  const EXACT = {
    'Iceland': CAN.is,
    'Norwegian Fjords': CAN.no,
    'Azores': CAN.pt,
    'Galapagos': CAN.ec,
    'Kyoto': CAN.jp,
    'Roma': CAN.it,
    'Istanbul': CAN.tr,
    'Atene': CAN.gr,
    'Cairo': CAN.eg,
    'Lisbona': CAN.pt,
    'Sydney': CAN.au,
    'Melbourne': CAN.au,
    'Vancouver': CAN.ca,
    'Quebec City': CAN.ca,
    'Seoul': CAN.kr,
    'Taipei': CAN.tw,
    'Chiang Mai': CAN.th,
    'Bali': CAN.id,
    'Azores (Azzorre)': CAN.pt,
    'Azores (Portugal)': CAN.pt,
    'Norway': CAN.no,
    'Scotland': CAN.uk,
    'Ireland': CAN.ie,
    'Marbella': CAN.es,
    'Vilamoura (Algarve)': CAN.pt,
    'Costa del Sol': CAN.es
  };

  // Keywords inside name or parentheses -> country
  const KEY = [
    [/\\bfrance|francia|chamonix|tignes|val d.?is[eè]re|courchevel|val thorens/i, CAN.fr],
    [/\\bswitzerland|svizzera|zermatt|st\\.?\\s*moritz|verbier|grindelwald/i, CAN.ch],
    [/\\baustria|innsbruck|zillertal|tirol|kitzb[uü]hel/i, CAN.at],
    [/\\bitaly|italia|dolomiti|cortina|amalfi|sardegna|puglia|roma|venezia|sicilia/i, CAN.it],
    [/\\bspain|espa[nñ]a|spagna|ibiza|formentera|marbella|costa del sol/i, CAN.es],
    [/\\bportugal|portogallo|algarve|azores|azores/i, CAN.pt],
    [/\\bgreece|grecia|santorini|mykonos|athens?/i, CAN.gr],
    [/\\busa|u\\.s\\.a|united states|hawaii|colorado|california|arizona|utah|new york|aspen|pebble beach/i, CAN.us],
    [/\\bcanada|banff|whistler|qu[eé]bec|vancouver/i, CAN.ca],
    [/\\bmexico|canc[uú]n|riviera maya|cozumel/i, CAN.mx],
    [/\\bjapan|giappone|kyoto|hakuba|niseko/i, CAN.jp],
    [/\\bthailand|thailandia|phuket|koh samui|chiang mai|koh tao/i, CAN.th],
    [/\\bindonesia|bali|nusa lembongan/i, CAN.id],
    [/\\bphilippines|filippine|boracay/i, CAN.ph],
    [/\\bmadagascar|nosy be/i, CAN.madagascar],
    [/\\btanzania|zanzibar/i, CAN.tanzania],
    [/\\baustralia|sydney|melbourne/i, CAN.au],
    [/\\bnew zealand|nuova zelanda|queenstown|cape kidnappers/i, CAN.nz],
    [/\\bargentina|patagonia|el chalten/i, CAN.ar],
    [/\\bper[uú]|titicaca/i, CAN.pe],
    [/\\bbolivia/i, CAN.bo],
    [/\\bguatemala|atitlan/i, CAN.gt],
    [/\\bmyanmar|inle/i, CAN.mm],
    [/\\bebitto|egitto|red sea|sharm/i, CAN.eg],
    [/\\bmarocco|marrakech|merzouga/i, CAN.ma],
    [/\\bturchia|turkey|istanbul|cappadocia/i, CAN.tr],
    [/\\bu(nited)?\\s?arab|emirati|dubai|abu dhabi|yas links/i, CAN.ae],
    [/\\bmalta/i, CAN.mt],
    [/\\btunisia/i, CAN.tn],
    [/\\bmauritius/i, CAN.mauritius]
  ];

  function extractParenCountry(raw){
    const m = String(raw).match(/\\(([^)]*)\\)\\s*$/);
    if(!m) return '';
    const hint = m[1].trim();
    const h = hint.toLowerCase();
    // normalize quick wins
    if(/hawaii/.test(h)) return CAN.us;
    if(/bali/.test(h)) return CAN.id;
    if(/banff|canada/.test(h)) return CAN.ca;
    if(/sardegna|puglia|ital/i.test(h)) return CAN.it;
    if(/tirol|t[ií]rolo/.test(h)) return CAN.at;
    if(/scotland|scotia|scozia/.test(h)) return CAN.uk;
    if(/new zealand|nz/.test(h)) return CAN.nz;
    if(/france|francia/.test(h)) return CAN.fr;
    if(/switzerland|svizzera/.test(h)) return CAN.ch;
    if(/austria/.test(h)) return CAN.at;
    if(/spain|espa[nñ]a|spagna/.test(h)) return CAN.es;
    if(/portugal|portogallo/.test(h)) return CAN.pt;
    if(/greece|grecia/.test(h)) return CAN.gr;
    if(/mexico|messico/.test(h)) return CAN.mx;
    if(/argentina/.test(h)) return CAN.ar;
    if(/peru/.test(h)) return CAN.pe;
    if(/bolivia/.test(h)) return CAN.bo;
    if(/guatemala/.test(h)) return CAN.gt;
    if(/myanmar/.test(h)) return CAN.mm;
    if(/thailand|thailandia/.test(h)) return CAN.th;
    if(/indonesia/.test(h)) return CAN.id;
    if(/philippines|filippine/.test(h)) return CAN.ph;
    if(/madagascar/.test(h)) return CAN.madagascar;
    if(/tanzania/.test(h)) return CAN.tanzania;
    if(/egypt|egitto/.test(h)) return CAN.eg;
    if(/morocco|marocco/.test(h)) return CAN.ma;
    if(/turkey|turchia/.test(h)) return CAN.tr;
    if(/uae|emirati|dubai|abu dhabi/.test(h)) return CAN.ae;
    if(/japan|giappone/.test(h)) return CAN.jp;
    if(/australia/.test(h)) return CAN.au;
    if(/taiwan/.test(h)) return CAN.tw;
    if(/korea|corea/.test(h)) return CAN.kr;
    if(/iceland|islanda/.test(h)) return CAN.is;
    if(/ireland|irlanda/.test(h)) return CAN.ie;
    return '';
  }

  function findCountry(raw){
    const par = extractParenCountry(raw);
    if(par) return par;
    const name = String(raw).trim();
    if(EXACT[name]) return EXACT[name];
    const lower = name.toLowerCase();
    for(const [rx, val] of KEY){
      if(rx.test(lower)) return val;
    }
    return ''; // fallback: none
  }

  function baseName(raw){
    return String(raw).replace(/\\s*\\([^)]*\\)\\s*$/,'').trim();
  }

  function applyCardCountryLabels(){
    document.querySelectorAll('.city-card .city-info h3').forEach(h=>{
      const raw = (h.textContent||'').trim();
      const place = baseName(raw);
      const country = findCountry(raw);
      if(h.querySelector('.place-line')) return;
      h.textContent = '';
      const placeEl = document.createElement('span'); placeEl.className='place-line'; placeEl.textContent = place;
      h.appendChild(placeEl);
      const countryEl = document.createElement('span'); countryEl.className='country-line'; countryEl.textContent = `(${country||'—'})`;
      h.appendChild(countryEl);
    });
  }
  document.addEventListener('DOMContentLoaded', applyCardCountryLabels);
})();
