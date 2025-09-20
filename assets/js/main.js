// Travirae v8 – fix gaps, active nav, CTA, modal scroll, persuasive descriptions
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

  // Accordion (single open per group)
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

  // Map behavior (hero)
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

  // Theme classifier
  const THEMES = {
    beach: ['sardegna','sicilia','amalfitana','salento','algarve','costa brava','santorini','mykonos','ibiza','tenerife','maldive','seychelles','zanzibar','phuket','koh samui','mauritius','bora bora','cancun','punta cana','hvar','gran canaria','madeira','capri','ischia'],
    mountain: ['dolomiti','val gardena','livigno','courmayeur','cervinia','chamonix','zermatt','innsbruck','st. moritz','zell am see','stelvio','kitzbühel','val d'isère','sölden','courchevel','verbier'],
    lake: ['lago di como','lago di garda','lago maggiore','braies','hallstatt','lago di bled','plitvice','lake district','lago di lugano','lago di annecy','sirmione'],
    city: ['new york','londra','parigi','roma','tokyo','dubai','barcellona','amsterdam','praga','vienna','los angeles','miami','san francisco','cairo','malta','venezia','lisbona','berlino','siviglia','atene','quebec','salonicco','monaco'],
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
      best: 'Giugno–Settembre; Maggio/Ottobre per chi preferisce calma e prezzi migliori.',
      bonus: 'Prenota un’escursione al tramonto con aperitivo in barca. 🛥️'
    },
    mountain: {
      desc: (c)=>`${c} offre sentieri panoramici, laghi alpini e rifugi accoglienti. D’estate trekking e bike, d’inverno piste perfette e après‑ski. Aria tersa, boschi profumati e viste che riempiono la memoria del telefono. 🏔️`,
      highlights: ['Trekking panoramici','Rifugi & malghe','Laghetti alpini','Impianti e piste in inverno'],
      best: 'Giugno–Settembre per trekking; Dicembre–Marzo per sci.',
      bonus: 'Assaggia piatti tipici in rifugio dopo una passeggiata. 🍲'
    },
    lake: {
      desc: (c)=>`Sulle sponde di ${c} ti attendono borghi eleganti, ville storiche e acque tranquille per gite in barca. È la meta ideale per un weekend romantico o family‑friendly, tra passeggiate sul lungolago e panorami rilassanti. 🌅`,
      highlights: ['Borghi sul lago','Giro in battello','Ville & giardini','Passeggiate panoramiche'],
      best: 'Aprile–Giugno e Settembre–Ottobre.',
      bonus: 'Crociera al tramonto con cena leggera. 🚤'
    },
    city: {
      desc: (c)=>`${c} vibra di musei, quartieri iconici e locali dove provare sapori autentici. Perfetta per un city‑break: al mattino cultura, al pomeriggio shopping o parchi, la sera rooftop e luci che cambiano l’atmosfera. 🏙️`,
      highlights: ['Centro storico & piazze','Musei imperdibili','Punti panoramici','Food market & locali'],
      best: 'Primavera e inizio autunno; in inverno atmosfera magica nei weekend.',
      bonus: 'Prenota un free‑tour il primo giorno per orientarti e scoprire chicche. 🎧'
    },
    culture: {
      desc: (c)=>`${c} è un tuffo nella storia: siti archeologici, chiese e palazzi che raccontano secoli. Ogni quartiere svela botteghe e piatti tipici. Ottima per chi ama arte e passeggiate lente tra vicoli e piazze. 🏛️`,
      highlights: ['Monumenti simbolo','Musei & siti archeologici','Quartieri storici','Cucina tradizionale'],
      best: 'Marzo–Maggio e Settembre–Novembre.',
      bonus: 'Svegliati presto per goderti i luoghi simbolo quasi solo per te. 📸'
    },
    safari: {
      desc: (c)=>`A ${c} la natura è protagonista: safari all’alba e al tramonto tra big five, pianure infinite e cieli rossi. Un viaggio che resta nel cuore, perfetto in combo con qualche giorno di mare. 🐘🦁`,
      highlights: ['Game drive all’alba','Guide locali esperte','Tramonti mozzafiato','Lodge immersi nella natura'],
      best: 'Da giugno a ottobre in molte aree; verifica il periodo esatto per il parco scelto.',
      bonus: 'Scegli un safari al tramonto con aperitivo nella savana. 🥂'
    },
    thermal: {
      desc: (c)=>`${c} è sinonimo di relax: spa, acque termali e trattamenti rigeneranti. Perfetta per ricaricare le energie tra un massaggio e una passeggiata in borghi tranquilli. 💆‍♀️`,
      highlights: ['Piscine termali','Spa & massaggi','Borghi tranquilli','Cucina comfort'],
      best: 'Tutto l’anno; ideali autunno e inverno.',
      bonus: 'Scegli una struttura con accesso serale alle terme per serate romantiche. ✨'
    },
    nature: {
      desc: (c)=>`${c} è un paradiso per chi ama paesaggi incontaminati: cascate, coste frastagliate, vulcani e cieli stellati. Perfetta per road‑trip e hiking con viste da cartolina. 🌋🌌`,
      highlights: ['Percorsi panoramici','Cascate & vulcani','Punti fotografici','Fauna e cieli stellati'],
      best: 'Da maggio a settembre (variabile per latitudine).',
      bonus: 'Porta con te una giacca antivento e organizza un’uscita all’alba. 🌄'
    }
  };

  function composeData(city){
    const theme = themeOf(city);
    const t = TEMPLATES[theme] || TEMPLATES.city;
    return {
      title: city,
      mapSrc: defaultMap,
      desc: t.desc(city),
      highlights: t.highlights,
      best: t.best,
      bonus: t.bonus
    };
  }

  // Hand-crafted examples (sovrascrivono il template quando serve)
  let destinationsContent = {
    'New York': {
      title: 'New York 🗽',
      mapSrc: defaultMap,
      desc: 'La città che non dorme mai: skyline infinito, parchi inaspettati e quartieri con personalità fortissime. Dalla High Line ai rooftop al tramonto, dai musei di classe mondiale ai food market di Brooklyn. Ogni giorno è diverso.',
      highlights: ['Times Square & Broadway','Central Park & High Line','Brooklyn Bridge & DUMBO','MoMA / MET','Top of the Rock o Edge'],
      best: 'Apr–Giu / Set–Ott; Dicembre per l’atmosfera natalizia.',
      bonus: 'Crociera al tramonto verso la Statua della Libertà. 🚤'
    },
    'Santorini': {
      title: 'Santorini 🇬🇷',
      mapSrc: defaultMap,
      desc: 'Case bianche, cupole blu e tramonti che tingono il cratere di arancio. Spiagge nere, degustazioni nelle cantine e vicoli fotogenici. Perfetta per una fuga romantica o una settimana tra mare e relax.',
      highlights: ['Oia & Fira','Tramonto a Imerovigli','Degustazioni di vini','Red/Black Beach'],
      best: 'Mag–Giu e Set; Lug–Ago per mare pieno.',
      bonus: 'Cena vista caldera + passeggiata Fira–Oia al tramonto. 💙'
    },
    'Dolomiti (Cortina)': {
      title: 'Dolomiti – Cortina 🏔️',
      mapSrc: defaultMap,
      desc: 'Le Regine delle Dolomiti: laghi color smeraldo, vette imponenti e rifugi caldi. Trekking estivi con viste leggendarie, inverno tra piste top e baite per l’après‑ski.',
      highlights: ['Tre Cime / Cinque Torri','Lago di Sorapis','Rifugi & pascoli','Ski area Dolomiti Superski'],
      best: 'Giu–Set per trekking; Dic–Mar per sci.',
      bonus: 'Strudel caldo in rifugio dopo il giro. 🥧'
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
    (data.highlights || []).forEach(h=>{
      const li = document.createElement('li'); li.textContent = h; modalHighlights.appendChild(li);
    });
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    modal.classList.remove('open');
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden','true');
    modalMap.src = modalMap.src; // reset iframe
  }
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target.matches('.modal__close, .modal__overlay') || e.target.dataset.close){
        closeModal();
      }
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }
  $$('.more').forEach(btn => {
    btn.addEventListener('click', ()=> openModal(btn.dataset.city));
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