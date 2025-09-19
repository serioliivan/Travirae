// Travirae site interactions (accordion, map scroll, modal, flights form, optional Supabase)
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
  const stay22Embeds = {}; // opzionale: mappa per città specifiche

  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    if(stay22Embeds[name]){
      map.src = stay22Embeds[name];
    }
    const mapSection = $('#map-section');
    if(mapSection){ mapSection.scrollIntoView({behavior:'smooth', block:'start'}); }
  }
  // chips -> scroll alla mappa
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

  // Contenuti statici (si possono sostituire con Supabase)
  let destinationsContent = {
    'New York': {
      title: 'New York 🗽',
      mapSrc: defaultMap,
      desc: 'La Big Apple è energia pura: grattacieli, quartieri iconici e mille cose da fare h24. Perfetta per un primo viaggio negli USA! 🇺🇸',
      highlights: ['Times Square & Broadway 🎭', 'Central Park & High Line 🌳', 'Brooklyn Bridge & DUMBO 🌉', 'Musei top: MoMA, MET 🖼️', 'Panorami: Top of the Rock o Edge 🌆'],
      best: 'Apr–Giu e Set–Ott: clima ideale e meno umidità. Dicembre per l’atmosfera natalizia ✨',
      bonus: 'Bagel a colazione, rooftop al tramonto e giro in battello fino alla Statua della Libertà 🚤'
    },
    'Parigi': {
      title: 'Parigi ❤️',
      mapSrc: defaultMap,
      desc: 'Romantica e sofisticata, tra bistrot, musei e passeggiate sulla Senna.',
      highlights: ['Torre Eiffel & Champs-Élysées', 'Louvre & Orsay', 'Montmartre & Sacré-Cœur', 'Quartiere Latino & Île de la Cité', 'Versailles come gita fuori porta'],
      best: 'Primavera e inizio autunno: clima mite e tanta luce.',
      bonus: 'Croissant caldi + panorama dal Trocadéro 🥐'
    },
    'Roma': {
      title: 'Roma 🇮🇹',
      mapSrc: defaultMap,
      desc: 'Storia a cielo aperto, cibo clamoroso e tramonti dorati: la Città Eterna non delude mai.',
      highlights: ['Colosseo & Fori', 'Fontana di Trevi & Pantheon', 'Trastevere & Gianicolo', 'Musei Vaticani & San Pietro', 'Ostia Antica come extra day'],
      best: 'Mar–Mag e Set–Ott per evitare caldo e folle.',
      bonus: 'Gelato artigianale e carbonara autentica 🍝'
    },
    'Londra': {
      title: 'Londra 🇬🇧',
      mapSrc: defaultMap,
      desc: 'Vibrante e cosmopolita, tra mercati, musei gratuiti e parchi immensi.',
      highlights: ['Westminster & Big Ben', 'British Museum & National Gallery', 'Camden Market & Notting Hill', 'Hyde Park & Regent’s Park', 'Sky Garden (gratis)'],
      best: 'Da maggio a settembre: giornate più lunghe e clima più secco.',
      bonus: 'Pub crawl e vista dallo Sky Garden ☕'
    },
    'Tokyo': {
      title: 'Tokyo 🇯🇵',
      mapSrc: defaultMap,
      desc: 'Tradizione e futuro, templi silenziosi e neon. Un’esperienza unica!',
      highlights: ['Shibuya Crossing & Shinjuku', 'Asakusa & Senso-ji', 'Akihabara & Ueno', 'Mercato del pesce & sushi', 'Gita a Nikko o Hakone'],
      best: 'Mar–Apr (sakura) e Ott–Nov (foliage).',
      bonus: 'Onsen e ramen fumante 🍜'
    },
    'Dubai': {
      title: 'Dubai 🇦🇪',
      mapSrc: defaultMap,
      desc: 'Grattacieli record, shopping e mare: tutto in grande.',
      highlights: ['Burj Khalifa & Dubai Mall', 'Dubai Marina & JBR', 'Desert safari', 'Old Dubai: creek & souk', 'Palm Jumeirah'],
      best: 'Nov–Mar: temperature piacevoli.',
      bonus: 'Crociera in dhow al tramonto 🚤'
    }
  };

  function openModal(key){
    const data = destinationsContent[key];
    if(!data) return;
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
  // Bind buttons in cards
  $$('.city-card .more').forEach(btn => {
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

  // ======================
  // SUPABASE (OPZIONALE)
  // ======================
  // Per abilitare, definisci window.SUPABASE_URL e window.SUPABASE_ANON_KEY
  // e includi <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script> prima di questo file.
  async function tryLoadFromSupabase(){
    try{
      if(!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY || !window.supabase){ return; }
      const sb = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
      // expected table: destinations (columns: slug, title, map_src, desc, highlights (json), best, bonus, active)
      const { data, error } = await sb.from('destinations').select('*').eq('active', true);
      if(error){ console.warn('Supabase error', error); return; }
      const fromDb = {};
      (data||[]).forEach(row=>{
        const key = row.slug || row.title;
        fromDb[key] = {
          title: row.title,
          mapSrc: row.map_src || defaultMap,
          desc: row.desc,
          highlights: Array.isArray(row.highlights) ? row.highlights : [],
          best: row.best,
          bonus: row.bonus
        };
      });
      // merge, db overrides static
      destinationsContent = Object.assign({}, destinationsContent, fromDb);
      console.log('Destinazioni caricate da Supabase:', Object.keys(fromDb));
    }catch(err){
      console.warn('Supabase load failed', err);
    }
  }
  tryLoadFromSupabase();
})();