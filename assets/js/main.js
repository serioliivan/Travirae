// Travirae v7-worldwide-r7
(function(){
// === Helpers: emoji strip + clean city title ===
function stripEmojis(str){
  if(!str) return str;
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
    .replace(/[\u2600-\u27BF]/g,'')
    .replace(/[\u{FE0F}]/gu,'');
}
function cityForTitle(raw){
  if(!raw) return '';
  return String(raw).replace(/\s*\([^)]*\)\s*$/,'').trim();
}
// Deterministic PRNG from a string (for consistent, unique copy per city)
function seedFrom(str){
  let h=0; for(let i=0;i<str.length;i++){ h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
  return (h>>>0);
}
function rng(seed){ // Mulberry32
  return function(){ seed|=0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1|seed);
    t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0) / 4294967296; };
}
// Pick with seeded randomness (stable per city)
function pick(arr, rfn){ return arr[Math.floor(rfn()*arr.length)]; }

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
    mare:'spiagge da cartolina e tramonti 🔆',
    montagna:'tra vette, rifugi e cieli limpidi 🏔️',
    citta:'musei, rooftop e quartieri iconici 🏙️',
    surf:'onde perfette e chill vibes 🏄',
    golf:'fairway curati e tee time perfetti ⛳️'
  };
  const t = map[Object.keys(map).find(k=>base.includes(k))] || 'storie, sapori e panorami ✨';
  return cityForTitle(city);
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
// === Helpers: emoji strip + clean city title ===
function stripEmojis(str){
  if(!str) return str;
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
    .replace(/[\u2600-\u27BF]/g,'')
    .replace(/[\u{FE0F}]/gu,'');
}
function cityForTitle(raw){
  if(!raw) return '';
  return String(raw).replace(/\s*\([^)]*\)\s*$/,'').trim();
}
// Deterministic PRNG from a string (for consistent, unique copy per city)
function seedFrom(str){
  let h=0; for(let i=0;i<str.length;i++){ h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
  return (h>>>0);
}
function rng(seed){ // Mulberry32
  return function(){ seed|=0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1|seed);
    t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0) / 4294967296; };
}
// Pick with seeded randomness (stable per city)
function pick(arr, rfn){ return arr[Math.floor(rfn()*arr.length)]; }

  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const titleEl = modal.querySelector('#dest-title');const descEl = modal.querySelector('.dest-desc');
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
    titleEl.textContent = cityForTitle(city);
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
// === Helpers: emoji strip + clean city title ===
function stripEmojis(str){
  if(!str) return str;
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
    .replace(/[\u2600-\u27BF]/g,'')
    .replace(/[\u{FE0F}]/gu,'');
}
function cityForTitle(raw){
  if(!raw) return '';
  return String(raw).replace(/\s*\([^)]*\)\s*$/,'').trim();
}
// Deterministic PRNG from a string (for consistent, unique copy per city)
function seedFrom(str){
  let h=0; for(let i=0;i<str.length;i++){ h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
  return (h>>>0);
}
function rng(seed){ // Mulberry32
  return function(){ seed|=0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed>>>15, 1|seed);
    t = t + Math.imul(t ^ t>>>7, 61|t) ^ t; return ((t ^ t>>>14)>>>0) / 4294967296; };
}
// Pick with seeded randomness (stable per city)
function pick(arr, rfn){ return arr[Math.floor(rfn()*arr.length)]; }

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

// === Unique content generator per destinazione ===
function contentFor(city, category){
  const baseCity = cityForTitle(city);
  const cat = (category||'').toLowerCase();
  const seed = seedFrom(baseCity + '|' + cat);
  const rand = rng(seed);

  const lib = {
    mare: {
      intros: [
        `${baseCity} è quel blu che non dimentichi: baie riparate, sabbia chiara e mare trasparente all’infinito.`,
        `A ${baseCity} le giornate scorrono lente tra tuffi, calette segrete e tramonti da cartolina.`,
        `${baseCity} è profumo di salsedine, scogli dorati e la promessa di un bagno al tramonto.`,
        `Se cerchi acqua cristallina e ritmi dolci, ${baseCity} conquista dal primo sguardo.`
      ],
      bodies: [
        `Ogni mattina parte con un caffè vista mare, poi via a esplorare spiagge diverse, dall’angolino più selvaggio al lido con lettini e cocktail.`,
        `Scopri chioschi sulla spiaggia, trattorie di pesce fresco e sentieri panoramici tra fichi d’india e macchia mediterranea.`,
        `Noleggia una barchetta, raggiungi una grotta nascosta e fermati per un bagno dove l’acqua è più turchese.`,
        `Tra snorkeling, SUP e passeggiate al lungomare, c’è sempre un motivo per restare un giorno in più.`
      ],
      strengths: [
        ['spiagge da fotografia','acqua limpida tutto il giorno','local food vista mare','ritmo lento e rigenerante'],
        ['calette raggiungibili a piedi','barche e SUP a noleggio','trattorie di pesce verace','tramonti spettacolari'],
        ['snorkeling facile','lidi attrezzati e beach club','percorsi panoramici','cocktail sul mare'],
        ['mare turchese','angoli ancora autentici','ristoranti di cucina locale','serate a piedi nudi']
      ],
      bonuses: [
        `Giro in barca al tramonto con bagno in una caletta segreta (+ prosecco a bordo).`,
        `Lezione di SUP all’alba e colazione in spiaggia inclusa.`,
        `Snorkeling guidato su secca ricca di pesci colorati, con foto subacquee ricordo.`,
        `Tavolo riservato in beach club al tramonto con drink signature.`
      ]
    },
    montagna: {
      intros: [
        `${baseCity} è aria sottile e orizzonti larghi: boschi, rifugi e silenzi che ricaricano.`,
        `A ${baseCity} la montagna si vive davvero: sentieri, malghe e cieli limpidi.`,
        `${baseCity} regala vette scenografiche, laghetti alpini e baite di legno profumate.`,
        `Il profumo di resina e il suono dei torrenti: ${baseCity} è una pausa che rimette in equilibrio.`
      ],
      bodies: [
        `Cammina tra pascoli e cascate, fermati in rifugio per un piatto caldo e una vista che vale la salita.`,
        `Tra trekking dolci e percorsi più tosti, ognuno trova il suo passo. E la sera? Stelle come non le vedevi da tempo.`,
        `Prendi la funivia, raggiungi un balcone naturale e brinda con una birra artigianale al panorama che si apre sotto.`,
        `Noleggia una e‑bike e scopri strade bianche, ponticelli e radure perfette per un picnic.`
      ],
      strengths: [
        ['panorami d’alta quota','rifugi accoglienti','sentieri per tutti i livelli','cucina montana autentica'],
        ['laghetti alpini','malghe panoramiche','e‑bike & trekking','cieli stellati'],
        ['boschi profumati','cascate e torrenti','passeggiate family‑friendly','piatti tipici locali'],
        ['fermate in baita','vista a 360°','sentieri ben segnalati','aria fresca e pulita']
      ],
      bonuses: [
        `Cena in rifugio con rientro al chiaro di luna (discesa guidata inclusa).`,
        `Escursione all’alba con guida e colazione in malga.`,
        `Ingresso spa alpina + aperitivo vista vette.`,
        `Tour e‑bike tra malghe con degustazione di formaggi tipici.`
      ]
    },
    citta: {
      intros: [
        `${baseCity} è energia pura: quartieri iconici, musei e rooftop da vedere almeno una volta.`,
        `A ${baseCity} trovi arte, architettura e locali nascosti dove fermarti “come uno del posto”.`,
        `${baseCity} è perfetta per un weekend di scoperte: vicoli, piazze e scorci instagrammabili.`,
        `Tra musei, mercati e cocktail bar, ${baseCity} sorprende a ogni incrocio.`
      ],
      bodies: [
        `Dalla mattina al tramonto alterna mostre a passeggiate nei quartieri più vivi, con pause tra caffè storici e street‑food.`,
        `Sali su un rooftop al tramonto, guarda le luci accendersi e chiudi la serata in un bistrot scelto tra i locali del momento.`,
        `Perditi tra botteghe e gallerie, poi ricaricati in un parco centrale con gelato alla mano.`,
        `Prenota un tour a piedi con guida locale: aneddoti, tappe insolite e consigli che fanno la differenza.`
      ],
      strengths: [
        ['musei e cultura','quartieri caratteristici','cucina locale autentica','rooftop e skyline'],
        ['mercati e botteghe','street‑food d’autore','parchi cittadini','serate easy tra cocktail bar'],
        ['architettura iconica','passeggiate urbane','punti foto top','vita notturna'],
        ['arte e design','caffè storici','tour guidati','tramonti in terrazza']
      ],
      bonuses: [
        `Accesso salta‑fila a 2 musei + drink su rooftop panoramico.`,
        `Tour a piedi con guida locale tra quartieri di tendenza (degustazioni incluse).`,
        `Workshop di fotografia urbana al tramonto con fotografo locale.`,
        `Giro in bici tra i punti più instagrammabili + pranzo tipico.`
      ]
    },
    natura: {
      intros: [
        `${baseCity} è natura in grande formato: cascate, foreste e scorci da “wow” continuo.`,
        `A ${baseCity} respiri verde e silenzi: sentieri morbidi e punti panoramici inaspettati.`,
        `${baseCity} è il posto giusto per chi ama esplorare: canyon, laghi e riserve che sembrano dipinte.`,
        `Foreste, cieli puliti e paesaggi che rimettono in pace: ${baseCity} è la scelta giusta.`
      ],
      bodies: [
        `Percorri passerelle e trail ben segnalati, fermandoti nei belvedere dove il tempo si ferma.`,
        `Tra una cascata e un piccolo lago, troverai angoli perfetti per un picnic con vista.`,
        `Scegli un trail all’alba, quando le luci sono morbide e la natura si sveglia piano.`,
        `Unisci passeggiate facili a una gita in barca o in kayak, per cambiare prospettiva.`
      ],
      strengths: [
        ['belvedere mozzafiato','sentieri curati','biodiversità ricchissima','silenzio rigenerante'],
        ['canyon e cascate','aree picnic panoramiche','trail per ogni livello','punti foto pazzeschi'],
        ['laghi e foreste','percorsi ad anello','fauna da osservare','tramonti intensi'],
        ['natura incontaminata','guide locali','escursioni in kayak','cieli puliti per osservare le stelle']
      ],
      bonuses: [
        `Uscita in kayak al tramonto con guida naturalistica.`,
        `Tour fotografico all’alba nei migliori belvedere.`,
        `Picnic gourmet preparato da produttori locali (coperta inclusa).`,
        `Ingresso a riserva naturale con guida e telescopio per le stelle.`
      ]
    }
  };

  // mappa categoria->macro
  function macro(cat){
    const c = (cat||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')||c.includes('spiagge')||c.includes('relax mare')) return 'mare';
    if(c.includes('montagna')||c.includes('trek')||c.includes('scia')||c.includes('neve')) return 'montagna';
    if(c.includes('citt')) return 'citta';
    if(c.includes('natura')||c.includes('parchi')||c.includes('laghi')||c.includes('canyon')||c.includes('foreste')||c.includes('safari')) return 'natura';
    return 'citta';
  }

  const M = lib[ macro(cat) ];
  const intro = pick(M.intros, rand);
  const body = pick(M.bodies, rand);
  const strengths = pick(M.strengths, rand);
  const bonus = pick(M.bonuses, rand);

  return {
    title: baseCity,
    desc: intro + ' ' + body,
    strengths,
    bonus
  };
}
