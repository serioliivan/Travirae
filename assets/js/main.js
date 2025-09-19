// Travirae interactions v3: accordion, image categories, carousels, modal with long desc, flights form
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

  // Accordion behavior (single open per group)
  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        // close all in this group
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
  const stay22Embeds = {}; // opzionale

  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    if(stay22Embeds[name]){
      map.src = stay22Embeds[name];
    }
    const mapSection = $('#map-section');
    if(mapSection){ mapSection.scrollIntoView({behavior:'smooth', block:'start'}); }
  }
  // chips -> scroll alla mappa (nella sezione per viaggiatori)
  $$('[data-destination]').forEach(el => {
    el.addEventListener('click', () => selectDestination(el.dataset.destination));
  });

  // ==================
  // MODAL DESTINAZIONI
  // ==================
  const modal = $('#destination-modal');
  const modalTitle = $('#modal-title');
  const modalMap = $('#modal-map');
  const modalDesc = $('#modal-desc');
  const modalBest = $('#modal-best');
  const modalBonus = $('#modal-bonus');
  const modalHighlights = $('#modal-highlights');

  const defaultMap = 'https://www.stay22.com/embed/68cd1c4dc39296915ec0c753';

  // Descrizioni più lunghe (3-4 righe) per alcune città
  let destinationsContent = {
    'New York': {
      title: 'New York 🗽',
      mapSrc: defaultMap,
      desc: 'La Big Apple è energia pura: quartieri diversissimi tra loro, skyline mozzafiato e cultura in ogni angolo. In un solo giorno puoi passare dai capolavori del MET ai food market di Brooklyn, tra rooftop al tramonto e passeggiate sulla High Line. È la città ideale per perdersi a piedi e farsi sorprendere, ogni isolato racconta una storia diversa. 🇺🇸',
      highlights: ['Times Square & Broadway 🎭', 'Central Park & High Line 🌳', 'Brooklyn Bridge & DUMBO 🌉', 'Musei top: MoMA, MET 🖼️', 'Panorami: Top of the Rock o Edge 🌆'],
      best: 'Apr–Giu e Set–Ott: clima ideale e meno umidità; Dicembre per l’atmosfera natalizia.',
      bonus: 'Bagel a colazione, rooftop al tramonto e battello verso la Statua della Libertà 🚤'
    },
    'Parigi': {
      title: 'Parigi ❤️',
      mapSrc: defaultMap,
      desc: 'Elegante e romantica, Parigi è fatta per essere vissuta lentamente: un caffè al mattino, una passeggiata lungo la Senna, un pomeriggio tra Louvre e Orsay. Ogni quartiere ha un carattere unico, dai tetti di Montmartre ai boulevards Hausmann. Di sera, luci e bistrot trasformano la città in un set cinematografico.',
      highlights: ['Torre Eiffel & Champs‑Élysées', 'Louvre & Musée d’Orsay', 'Montmartre & Sacré‑Cœur', 'Île de la Cité & Notre‑Dame', 'Gita a Versailles'],
      best: 'Primavera e inizio autunno: temperature miti e cieli limpidi perfetti per camminare.',
      bonus: 'Croissant caldi + vista dal Trocadéro 🥐'
    },
    'Roma': {
      title: 'Roma 🇮🇹',
      mapSrc: defaultMap,
      desc: 'La Città Eterna è un museo a cielo aperto: rovine millenarie, piazze barocche e tramonti dorati si susseguono senza sosta. Tra una fontana e un vicolo di Trastevere, scoprirai osterie autentiche, gelati artigianali e scorci che non stancano mai. Ogni rione ha un’anima diversa, tutte da assaporare con calma.',
      highlights: ['Colosseo & Fori Imperiali', 'Fontana di Trevi & Pantheon', 'Trastevere & Gianicolo', 'Musei Vaticani & San Pietro', 'Ostia Antica come extra day'],
      best: 'Mar–Mag e Set–Ott per evitare caldo intenso e grandi folle.',
      bonus: 'Carbonara originale e gelato al pistacchio a fine serata 🍝'
    },
    'Londra': {
      title: 'Londra 🇬🇧',
      mapSrc: defaultMap,
      desc: 'Metropoli dinamica e creativa, dove musei gratuiti, mercati e parchi convivono con quartieri dallo stile inconfondibile. Dalla classicissima Westminster ai colori di Notting Hill, passando per il fermento di Shoreditch, troverai sempre qualcosa di nuovo da vedere. La scena gastronomica è sorprendente e multiculturale.',
      highlights: ['Westminster & Big Ben', 'British Museum & National Gallery', 'Camden Market & Notting Hill', 'Hyde Park & Regent’s Park', 'Sky Garden (prenotazione gratis)'],
      best: 'Maggio‑settembre: giornate più lunghe e meteo più stabile.',
      bonus: 'Pub crawl e skyline dallo Sky Garden ☕'
    },
    'Tokyo': {
      title: 'Tokyo 🇯🇵',
      mapSrc: defaultMap,
      desc: 'Futuro e tradizione convivono alla perfezione: templi silenziosi, giardini ordinatissimi e quartieri iper‑tecnologici pieni di neon. Dalle vibrazioni di Shibuya alle atmosfere zen di Asakusa, ogni zona è un viaggio nel viaggio. Il cibo è un capitolo a parte: ramen fumante, sushi impeccabile e dolci creativi.',
      highlights: ['Shibuya Crossing & Shinjuku', 'Asakusa & Senso‑ji', 'Akihabara & Ueno', 'Tsukiji & sushi', 'Gita a Nikko o Hakone'],
      best: 'Mar‑Apr (sakura) e Ott‑Nov (foliage) per clima e colori unici.',
      bonus: 'Onsen rilassanti e serata in izakaya 🍜'
    },
    'Dubai': {
      title: 'Dubai 🇦🇪',
      mapSrc: defaultMap,
      desc: 'Una città che corre verso il futuro: grattacieli record, resort di lusso e spiagge dorate. Si passa dal deserto ai quartieri moderni in pochi minuti, tra shopping, musei e ristoranti internazionali. Perfetta per un break al caldo in inverno, con tanti svaghi per ogni tipo di viaggiatore.',
      highlights: ['Burj Khalifa & Dubai Mall', 'Dubai Marina & JBR', 'Desert safari', 'Old Dubai: creek & souk', 'Palm Jumeirah'],
      best: 'Nov‑Mar: temperature piacevoli e cielo terso.',
      bonus: 'Crociera in dhow al tramonto e fontane danzanti 🎵'
    }
  };

  function defaultData(city){
    return {
      title: city,
      mapSrc: defaultMap,
      desc: `${city} è una meta ricca di luoghi da scoprire: dal centro storico ai quartieri più caratteristici troverai cibo locale, panorami e tanta atmosfera. Ideale per un weekend lungo o come base per escursioni nei dintorni. Preparati a camminare, assaggiare e lasciarti sorprendere — ogni zona racconta una storia diversa. ✨`,
      highlights: ['Centro storico & piazze', 'Musei/local culture', 'Punti panoramici', 'Cibo tipico & mercati'],
      best: 'Primavera e inizio autunno sono in genere i periodi più gradevoli.',
      bonus: 'Prova uno spot al tramonto e una specialità locale 🍽️'
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
  // Bind buttons in cards (popolari + categorie)
  $$('.more').forEach(btn => {
    btn.addEventListener('click', ()=> openModal(btn.dataset.city));
  });

  // Flights form -> open Google Flights with a smart query
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
      const q = parts.join(' ');
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }

  // Supabase (opzionale) come nella v2: se configurato, sovrascrive destinationsContent
  async function tryLoadFromSupabase(){
    try{
      if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || !window.supabase){ return; }
      const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      const { data, error } = await sb.from('destinations').select('*').eq('active', true);
      if(error){ console.warn('Supabase error', error); return; }
      const fromDb = {};
      (data||[]).forEach(row=>{
        const key = row.slug || row.title;
        fromDb[key] = {
          title: row.title || key,
          mapSrc: row.map_src || defaultMap,
          desc: row.desc,
          highlights: Array.isArray(row.highlights) ? row.highlights : [],
          best: row.best,
          bonus: row.bonus
        };
      });
      destinationsContent = Object.assign({}, destinationsContent, fromDb);
      console.log('Destinazioni caricate da Supabase:', Object.keys(fromDb));
    }catch(err){
      console.warn('Supabase load failed', err);
    }
  }
  tryLoadFromSupabase();
})();