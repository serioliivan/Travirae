// Travirae v7-worldwide-r5
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

  const mapSection = $('#map-section');
  const label = $('#map-destination-label');
  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    if(mapSection){ mapSection.scrollIntoView({behavior:'smooth', block:'start'}); }
  }

  const modal = $('#destination-modal');
  const modalTitle = $('#modal-title');
  const modalMap = $('#modal-map');
  const modalDesc = $('#modal-desc');
  const modalBest = $('#modal-best');
  const modalBonus = $('#modal-bonus');
  const modalHighlights = $('#modal-highlights');
  const defaultMap = 'https://www.stay22.com/embed/68cd1c4dc39296915ec0c753';

  const THEMES = {
    beach: ['maldive','seychelles','bora bora','mauritius','zanzibar','bali','phuket','cancun','maui','algarve','santorini','mykonos','ibiza','tenerife'],
    mountain: ['zermatt','chamonix','dolomiti','banff','chalten','annapurna','hakuba','queenstown','aspen','kitz'],
    lake: ['louise','tahoe','bled','plitvice','tekapo','como','titicaca','atitlan','inle','district'],
    city: ['parigi','londra','new york','tokyo','dubai','singapore','barcellona','bangkok','istanbul','roma','amsterdam','vienna'],
    culture: ['kyoto','roma','istanbul','atene','cairo','parigi','cusco','machu','gerusalemme','agra','pechino'],
    safari: ['serengeti','mara','kruger','okavango','etosha','ngorongoro','chobe','luangwa','hwange','amboseli'],
    thermal: ['blue lagoon','saturnia','baden','onsen','spa'],
    nature: ['iceland','fiords','rockies','patagonia','new zealand','barrier','galapagos','grand canyon','amazon','atacama']
  };
  function themeOf(city){
    const c = city.toLowerCase();
    for(const [theme, keys] of Object.entries(THEMES)){
      if(keys.some(k => c.includes(k))) return theme;
    }
    return 'city';
  }
  const TEMPLATES = {
    beach: {
      desc: (c)=>`${c} è perfetta per chi cerca mare cristallino e tramonti infuocati. Calette nascoste, sabbia fine e ristorantini vista mare: alterna relax, gite in barca e snorkeling. ☀️🌊`,
      highlights: ['Spiagge iconiche','Giro in barca & snorkeling','Tramonti panoramici','Cucina di pesce'],
      best: 'Stagione secca locale o mesi estivi mediterranei.',
      bonus: 'Aperitivo al tramonto in barca. 🛥️'
    },
    mountain: {
      desc: (c)=>`${c} regala sentieri panoramici, laghi alpini e rifugi accoglienti. Estate tra trekking e bike, inverno con piste top e après‑ski. 🏔️`,
      highlights: ['Trekking panoramici','Rifugi & malghe','Laghetti alpini','Ski in inverno'],
      best: 'Giu–Set (trekking) • Dic–Mar (sci).',
      bonus: 'Pranzo in rifugio dopo la camminata. 🍲'
    },
    lake: {
      desc: (c)=>`Sulle sponde di ${c} troverai borghi eleganti, ville storiche e acque tranquille per gite in barca. 🌅`,
      highlights: ['Borghi sul lago','Giro in battello','Ville & giardini','Passeggiate panoramiche'],
      best: 'Primavera e inizio autunno.',
      bonus: 'Crociera al tramonto. 🚤'
    },
    city: {
      desc: (c)=>`${c} vibra di musei, quartieri iconici e locali autentici. Perfetta per un city‑break: mattina cultura, pomeriggio shopping o parchi, sera rooftop e luci. 🏙️`,
      highlights: ['Centro storico & piazze','Musei imperdibili','Punti panoramici','Food market & locali'],
      best: 'Primavera e inizio autunno.',
      bonus: 'Free‑tour il primo giorno. 🎧'
    },
    culture: {
      desc: (c)=>`${c} è un viaggio nel tempo: siti archeologici, chiese e palazzi raccontano secoli. 🏛️`,
      highlights: ['Monumenti simbolo','Musei & siti archeologici','Quartieri storici','Cucina tipica'],
      best: 'Mar–Mag e Set–Nov.',
      bonus: 'Alzati presto: luoghi simbolo quasi solo per te. 📸'
    },
    safari: {
      desc: (c)=>`A ${c} la natura è protagonista: safari all’alba e al tramonto tra big five e cieli rossi. 🐘🦁`,
      highlights: ['Game drive all’alba','Guide locali','Tramonti mozzafiato','Lodge nella natura'],
      best: 'Stagione secca (varia per il parco).',
      bonus: 'Aperitivo al tramonto nella savana. 🥂'
    },
    thermal: {
      desc: (c)=>`${c} è sinonimo di relax totale: spa, acque termali e trattamenti rigeneranti. 💆‍♀️`,
      highlights: ['Piscine termali','Spa & massaggi','Borghi tranquilli','Cucina comfort'],
      best: 'Autunno/inverno o tutto l’anno.',
      bonus: 'Ingresso serale: atmosfera magica. ✨'
    },
    nature: {
      desc: (c)=>`${c} è perfetta per chi ama paesaggi incontaminati: cascate, vulcani, coste frastagliate e cieli stellati. 🌋🌌`,
      highlights: ['Percorsi panoramici','Cascate & vulcani','Punti fotografici','Fauna & cieli stellati'],
      best: 'Dipende dalla latitudine (informati sulla stagione).',
      bonus: 'Uscita all’alba + giacca antivento. 🌄'
    }
  };
  function composeData(city){
    const theme = themeOf(city);
    const t = TEMPLATES[theme] || TEMPLATES.city;
    return { title: city, mapSrc: defaultMap, desc: t.desc(city), highlights: t.highlights, best: t.best, bonus: t.bonus };
  }

  let destinationsContent = {
    'New York': { title:'New York 🗽', mapSrc: defaultMap,
      desc:'Skyline infinito, quartieri iconici e parchi inaspettati. Dal MET ai food market di Brooklyn, dai rooftop al tramonto alle passeggiate sulla High Line — ogni giorno è diverso.',
      highlights:['Times Square & Broadway','Central Park & High Line','Brooklyn Bridge & DUMBO','MoMA / MET','Top of the Rock o Edge'],
      best:'Apr–Giu / Set–Ott; Dicembre per Natale.',
      bonus:'Crociera al tramonto verso la Statua della Libertà. 🚤'
    },
    'Santorini': { title:'Santorini 🇬🇷', mapSrc: defaultMap,
      desc:'Case bianche, cupole blu, tramonti sulla caldera. Spiagge nere, cantine locali e vicoli fotogenici: un mix perfetto tra mare e romanticismo.',
      highlights:['Oia & Fira','Tramonto a Imerovigli','Degustazioni','Red/Black Beach'],
      best:'Mag–Giu e Set (clima ideale).',
      bonus:'Cena vista caldera + passeggiata Fira–Oia. 💙'
    }
  };

  function openModal(key){
    const data = destinationsContent[key] || composeData(key);
    modalTitle.textContent = data.title || key;
    modalMap.src = data.mapSrc || defaultMap;
    modalDesc.textContent = data.desc || '';
    modalBest.textContent = data.best || '';
    modalBonus.textContent = data.bonus || '';
    modalHighlights.innerHTML = '';
    (data.highlights || []).forEach(h=>{ const li = document.createElement('li'); li.textContent = h; modalHighlights.appendChild(li); });
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden','true');
    modalMap.src = modalMap.src;
  }
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target.matches('.modal__close, .modal__overlay') || e.target.dataset.close){ closeModal(); }
    });
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
  }
  $$('.more').forEach(btn => btn.addEventListener('click', ()=> openModal(btn.dataset.city)));

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