// Travirae v7-fixed – active nav, CTA buttons, modal scroll, persuasive descriptions
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  // Mobile nav toggle
  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }

  // Year
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  // Accordion: single open per group
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

  // Scroll to map when selecting a destination (future hook)
  const mapSection = $('#map-section');
  const label = $('#map-destination-label');
  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    if(mapSection){ mapSection.scrollIntoView({behavior:'smooth', block:'start'}); }
  }
  $$('[data-destination]').forEach(el => {
    el.addEventListener('click', () => selectDestination(el.dataset.destination));
  });

  // Modal
  const modal = $('#destination-modal');
  const modalTitle = $('#modal-title');
  const modalMap = $('#modal-map');
  const modalDesc = $('#modal-desc');
  const modalBest = $('#modal-best');
  const modalBonus = $('#modal-bonus');
  const modalHighlights = $('#modal-highlights');
  const defaultMap = 'https://www.stay22.com/embed/68cd1c4dc39296915ec0c753';

  // Themed copy generator (persuasive & varied)
  const THEMES = {
    beach: ['sardegna','sicilia','amalfitana','salento','algarve','costa brava','santorini','mykonos','ibiza','tenerife','maldive','seychelles','zanzibar','phuket','koh samui','mauritius','bora bora','cancun','punta cana','hvar','gran canaria','madeira','capri','ischia'],
    mountain: ['dolomiti','val gardena','livigno','courmayeur','cervinia','chamonix','zermatt','innsbruck','st. moritz','zell am see'],
    lake: ['lago di como','lago di garda','lago maggiore','braies','hallstatt','lago di bled','plitvice','lake district','lago di lugano','lago di annecy','sirmione'],
    city: ['new york','londra','parigi','roma','tokyo','dubai','barcellona','amsterdam','praga','vienna','los angeles','miami','san francisco','cairo','malta','venezia','lisbona','berlino','siviglia','atene'],
    culture: ['roma','firenze','pompei','atene','istanbul','kyoto','petra','gerusalemme','granada','vienna','napoli'],
    safari: ['masai mara','serengeti','kruger','okavango','etosha','chobe','ngorongoro','south luangwa','hwange','amboseli'],
    thermal: ['saturnia','abano','terme','montecatini','spa alto adige'],
    nature: ['islanda','fiordi','canadian rockies','patagonia','nuova zelanda','azzorre','highlands','madeira','lofoten']
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
      desc: (c)=>`${c} è perfetta per chi cerca mare cristallino e tramonti infuocati. Tra spiagge di sabbia fine, calette nascoste e chioschi sul mare potrai alternare relax e giornate active in barca o snorkeling. La sera ti aspettano ristorantini vista mare e passeggiate sul lungomare. ☀️🌊`,
      highlights: ['Spiagge iconiche','Gite in barca & snorkeling','Tramonti panoramici','Cucina di mare'],
      best: 'Giugno–Settembre; Maggio/Ottobre per più calma.',
      bonus: 'Aperitivo al tramonto in barca. 🛥️'
    },
    mountain: {
      desc: (c)=>`${c} offre sentieri panoramici, laghi alpini e rifugi accoglienti. D’estate trekking e bike, d’inverno piste perfette e après‑ski. Aria tersa e viste leggendarie. 🏔️`,
      highlights: ['Trekking panoramici','Rifugi & malghe','Laghetti alpini','Ski in inverno'],
      best: 'Giu–Set (trekking) • Dic–Mar (sci).',
      bonus: 'Pranzo in rifugio dopo la camminata. 🍲'
    },
    lake: {
      desc: (c)=>`Sulle sponde di ${c} ti attendono borghi eleganti, ville storiche e acque tranquille per gite in barca. Ideale per un weekend romantico o family‑friendly. 🌅`,
      highlights: ['Borghi sul lago','Giro in battello','Ville & giardini','Passeggiate panoramiche'],
      best: 'Apr–Giu e Set–Ott.',
      bonus: 'Crociera al tramonto. 🚤'
    },
    city: {
      desc: (c)=>`${c} vibra di musei, quartieri iconici e locali autentici. Perfetta per un city‑break: mattina cultura, pomeriggio shopping o parchi, sera rooftop e luci. 🏙️`,
      highlights: ['Centro storico & piazze','Musei imperdibili','Punti panoramici','Food market & locali'],
      best: 'Primavera e inizio autunno.',
      bonus: 'Free‑tour il primo giorno per scoprire chicche. 🎧'
    },
    culture: {
      desc: (c)=>`${c} è un tuffo nella storia: siti archeologici, chiese e palazzi che raccontano secoli. Ogni quartiere svela botteghe e piatti tipici. 🏛️`,
      highlights: ['Monumenti simbolo','Musei & siti archeologici','Quartieri storici','Cucina tradizionale'],
      best: 'Mar–Mag e Set–Nov.',
      bonus: 'Alzati presto: luoghi simbolo quasi solo per te. 📸'
    },
    safari: {
      desc: (c)=>`A ${c} la natura è protagonista: safari all’alba e al tramonto tra big five, pianure infinite e cieli rossi. 🐘🦁`,
      highlights: ['Game drive all’alba','Guide locali','Tramonti mozzafiato','Lodge nella natura'],
      best: 'Giu–Ott (dipende dal parco).',
      bonus: 'Aperitivo al tramonto nella savana. 🥂'
    },
    thermal: {
      desc: (c)=>`${c} è sinonimo di relax: spa, acque termali e trattamenti rigeneranti. 💆‍♀️`,
      highlights: ['Piscine termali','Spa & massaggi','Borghi tranquilli','Cucina comfort'],
      best: 'Tutto l’anno; top in autunno/inverno.',
      bonus: 'Accesso serale alle terme: atmosfera magica. ✨'
    },
    nature: {
      desc: (c)=>`${c} è un paradiso per chi ama paesaggi incontaminati: cascate, coste frastagliate, vulcani e cieli stellati. 🌋🌌`,
      highlights: ['Percorsi panoramici','Cascate & vulcani','Punti fotografici','Fauna & cieli stellati'],
      best: 'Maggio–Settembre (variabile).',
      bonus: 'Uscita all’alba + giacca antivento. 🌄'
    }
  };
  function composeData(city){
    const theme = themeOf(city);
    const t = TEMPLATES[theme] || TEMPLATES.city;
    return { title: city, mapSrc: defaultMap, desc: t.desc(city), highlights: t.highlights, best: t.best, bonus: t.bonus };
  }

  // Some hand-crafted examples
  let destinationsContent = {
    'New York': { title:'New York 🗽', mapSrc: defaultMap,
      desc:'La città che non dorme mai: skyline infinito, parchi inaspettati e quartieri iconici. Dai musei top ai rooftop al tramonto, ogni giorno è diverso.',
      highlights:['Times Square & Broadway','Central Park & High Line','Brooklyn Bridge & DUMBO','MoMA / MET','Top of the Rock o Edge'],
      best:'Apr–Giu / Set–Ott; Dicembre per l’atmosfera natalizia.',
      bonus:'Crociera al tramonto verso la Statua della Libertà. 🚤'
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