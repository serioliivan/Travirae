// v5: local images, centered texts
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const navToggle = $('.nav-toggle'); const mainNav = $('.main-nav');
  if(navToggle){ navToggle.addEventListener('click', ()=>{
    const expanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!expanded));
    mainNav.style.display = expanded ? 'none' : 'flex';
  });}
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  // Accordion single-open
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

  // Map hero behavior
  const map = $('#stay22-widget');
  const label = $('#map-destination-label');
  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    $('#map-section')?.scrollIntoView({behavior:'smooth', block:'start'});
  }
  $$('[data-destination]').forEach(el => { el.addEventListener('click', () => selectDestination(el.dataset.destination)); });

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
      title: 'New York 🗽', mapSrc: defaultMap,
      desc: 'La Big Apple è energia pura: quartieri diversissimi, skyline mozzafiato e cultura in ogni angolo. Dal MET ai food market di Brooklyn, tra rooftop al tramonto e High Line, la città sorprende a ogni isolato.',
      highlights: ['Times Square & Broadway', 'Central Park & High Line', 'Brooklyn Bridge & DUMBO', 'MoMA & MET', 'Top of the Rock / Edge'],
      best: 'Apr–Giu e Set–Ott; Dic per atmosfera natalizia.',
      bonus: 'Rooftop al tramonto + battello per la Statua della Libertà'
    },
    'Parigi': {
      title: 'Parigi ❤️', mapSrc: defaultMap,
      desc: 'Elegante e romantica, perfetta da vivere lentamente tra caffè, passeggiate sulla Senna e musei. Ogni quartiere ha un’anima: dai tetti di Montmartre ai boulevards Haussmann. Di sera, bistrot e luci la rendono magica.',
      highlights: ['Torre Eiffel', 'Louvre & Orsay', 'Montmartre', 'Île de la Cité', 'Versailles'],
      best: 'Primavera e inizio autunno.',
      bonus: 'Croissant al Trocadéro'
    },
    'Roma': {
      title: 'Roma 🇮🇹', mapSrc: defaultMap,
      desc: 'Un museo a cielo aperto: rovine millenarie, piazze barocche e tramonti dorati. Tra i vicoli di Trastevere trovi trattorie sincere, gelati speciali e scorci unici. Ogni rione ha un carattere diverso da scoprire.',
      highlights: ['Colosseo', 'Trevi & Pantheon', 'Trastevere', 'Musei Vaticani', 'Gianicolo'],
      best: 'Mar–Mag e Set–Ott.',
      bonus: 'Carbonara e gelato artigianale'
    },
    'Londra': {
      title: 'Londra 🇬🇧', mapSrc: defaultMap,
      desc: 'Dinamica e creativa: musei gratuiti, mercati, parchi e quartieri iconici. Dalla classicissima Westminster a Notting Hill e Shoreditch: ogni zona offre qualcosa di diverso, anche a tavola.',
      highlights: ['Westminster', 'British Museum', 'Camden Market', 'Hyde Park', 'Sky Garden'],
      best: 'Maggio‑settembre.',
      bonus: 'Pub crawl + vista Sky Garden'
    }
  };
  function defaultData(city){
    return {
      title: city, mapSrc: defaultMap,
      desc: `${city} è una meta ricca di luoghi da scoprire: centro storico, punti panoramici e sapori locali. Perfetta per un weekend lungo o come base per escursioni nei dintorni.`,
      highlights: ['Centro & piazze', 'Musei / cultura', 'Punti panoramici', 'Cucina locale'],
      best: 'Primavera e inizio autunno in genere sono ideali.',
      bonus: 'Tramonto in un belvedere + specialità tipica'
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
    (data.highlights || []).forEach(h=>{ const li=document.createElement('li'); li.textContent=h; modalHighlights.appendChild(li); });
    modal.classList.add('open'); document.body.style.overflow='hidden'; modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){ modal.classList.remove('open'); document.body.style.overflow=''; modal.setAttribute('aria-hidden','true'); modalMap.src = modalMap.src; }
  if(modal){
    modal.addEventListener('click', (e)=>{ if(e.target.matches('.modal__close, .modal__overlay') || e.target.dataset.close){ closeModal(); }});
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape' && modal.classList.contains('open')) closeModal(); });
  }
  $$('.more').forEach(btn=> btn.addEventListener('click', ()=> openModal(btn.dataset.city)));

  // Flights form
  const flightsForm = $('#flights-form');
  if(flightsForm){
    flightsForm.addEventListener('submit',(e)=>{
      e.preventDefault();
      const from = $('#from').value.trim(), to = $('#to').value.trim();
      const d1=$('#depart').value, d2=$('#return').value;
      const adults=$('#adults').value||'1', cabin=$('#cabin').value||'economy';
      const parts=[]; if(from&&to) parts.push(`volo da ${from} a ${to}`);
      if(d1) parts.push(`partenza ${d1}`); if(d2) parts.push(`ritorno ${d2}`); parts.push(`${adults} adulti ${cabin}`);
      const url='https://www.google.com/travel/flights?q='+encodeURIComponent(parts.join(' '))+'&hl=it';
      window.open(url,'_blank','noopener');
    });
  }
})();