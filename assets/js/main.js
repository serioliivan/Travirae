// Travirae interactions v4
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

  // Map behavior (hero)
  const map = $('#stay22-widget');
  const label = $('#map-destination-label');
  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    const mapSection = $('#map-section');
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

  let destinationsContent = {
    'New York': {
      title: 'New York 🗽',
      mapSrc: defaultMap,
      desc: 'La Big Apple è energia pura: quartieri diversissimi tra loro, skyline mozzafiato e cultura in ogni angolo. In un solo giorno puoi passare dai capolavori del MET ai food market di Brooklyn, tra rooftop al tramonto e passeggiate sulla High Line. È la città ideale per perdersi a piedi e farsi sorprendere, ogni isolato racconta una storia diversa. 🇺🇸',
      highlights: ['Times Square & Broadway 🎭', 'Central Park & High Line 🌳', 'Brooklyn Bridge & DUMBO 🌉', 'MoMA & MET 🖼️', 'Top of the Rock o Edge 🌆'],
      best: 'Apr–Giu e Set–Ott; Dicembre per l’atmosfera natalizia.',
      bonus: 'Rooftop al tramonto e battello verso la Statua della Libertà 🚤'
    },
    'Parigi': {
      title: 'Parigi ❤️',
      mapSrc: defaultMap,
      desc: 'Elegante e romantica, Parigi è fatta per essere vissuta lentamente: un caffè al mattino, una passeggiata lungo la Senna, un pomeriggio tra Louvre e Orsay. Ogni quartiere ha un carattere unico, dai tetti di Montmartre ai boulevards Haussmann. Di sera, luci e bistrot trasformano la città in un set cinematografico.',
      highlights: ['Torre Eiffel', 'Louvre & Orsay', 'Montmartre', 'Île de la Cité', 'Versailles'],
      best: 'Primavera e inizio autunno.',
      bonus: 'Croissant al Trocadéro 🥐'
    },
    'Roma': {
      title: 'Roma 🇮🇹',
      mapSrc: defaultMap,
      desc: 'La Città Eterna è un museo a cielo aperto: rovine millenarie, piazze barocche e tramonti dorati si susseguono senza sosta. Tra una fontana e un vicolo di Trastevere, scoprirai osterie autentiche, gelati artigianali e scorci che non stancano mai. Ogni rione ha un’anima diversa, tutte da assaporare con calma.',
      highlights: ['Colosseo', 'Fontana di Trevi', 'Trastevere', 'Musei Vaticani', 'Gianicolo'],
      best: 'Mar–Mag e Set–Ott.',
      bonus: 'Carbonara e gelato artigianale 🍝'
    },
    'Londra': {
      title: 'Londra 🇬🇧',
      mapSrc: defaultMap,
      desc: 'Metropoli dinamica e creativa, dove musei gratuiti, mercati e parchi convivono con quartieri dallo stile inconfondibile. Dalla classicissima Westminster ai colori di Notting Hill, passando per il fermento di Shoreditch, troverai sempre qualcosa di nuovo da vedere. La scena gastronomica è sorprendente e multiculturale.',
      highlights: ['Westminster', 'British Museum', 'Camden Market', 'Hyde Park', 'Sky Garden'],
      best: 'Maggio‑settembre.',
      bonus: 'Pub crawl + skyline dallo Sky Garden ☕'
    },
    'Tokyo': {
      title: 'Tokyo 🇯🇵',
      mapSrc: defaultMap,
      desc: 'Futuro e tradizione convivono alla perfezione: templi silenziosi, giardini ordinatissimi e quartieri iper‑tecnologici pieni di neon. Dalle vibrazioni di Shibuya alle atmosfere zen di Asakusa, ogni zona è un viaggio nel viaggio. Il cibo è un capitolo a parte: ramen fumante, sushi impeccabile e dolci creativi.',
      highlights: ['Shibuya', 'Asakusa', 'Ueno', 'Mercati & sushi', 'Gita a Nikko/Hakone'],
      best: 'Mar‑Apr e Ott‑Nov.',
      bonus: 'Onsen e izakaya 🍜'
    },
    'Dubai': {
      title: 'Dubai 🇦🇪',
      mapSrc: defaultMap,
      desc: 'Una città che corre verso il futuro: grattacieli record, resort di lusso e spiagge dorate. Si passa dal deserto ai quartieri moderni in pochi minuti, tra shopping, musei e ristoranti internazionali. Perfetta per un break al caldo in inverno.',
      highlights: ['Burj Khalifa', 'Dubai Marina', 'Desert safari', 'Old Dubai', 'Palm Jumeirah'],
      best: 'Nov‑Mar.',
      bonus: 'Crociera in dhow + fontane danzanti 🎵'
    }
  };

  function defaultData(city){
    return {
      title: city,
      mapSrc: defaultMap,
      desc: `${city} è una meta ricca di luoghi da scoprire: dal centro storico ai quartieri più caratteristici troverai cibo locale, panorami e tanta atmosfera. Ideale per un weekend lungo o come base per escursioni nei dintorni. Preparati a camminare, assaggiare e lasciarti sorprendere — ogni zona racconta una storia diversa. ✨`,
      highlights: ['Centro storico & piazze', 'Musei', 'Punti panoramici', 'Cibo tipico'],
      best: 'Primavera e inizio autunno di solito sono perfetti.',
      bonus: 'Tramonto in un punto panoramico + specialità locale 🍽️'
    };
  }

  function openModal(key){
    const data = destinationsContent[key] || defaultData(key);
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

  // Flights form -> open Google Flights
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