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
      const url = 'https://www.aviasales.com/search?q=' + encodeURIComponent(parts.join(' ')) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }

  // ===== Inject category icons & destination modal =====
  const btns = $$('.accordion-toggle.category');
  const slugify = (s)=> s.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
      .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const iconMap = {
    'mare':'beach.svg','montagna':'mountain.svg','lago':'lake.svg','isole':'island.svg',
    'cultura':'museum.svg','relax':'spa.svg','citta':'city.svg','safari':'safari.svg',
    'esotici':'palm.svg','natura':'leaf.svg','destinazioni-popolari':'star.svg',
    'fuga-romantica':'heart.svg','anniversario':'cake.svg','luna-di-miele':'ring.svg',
    'addio-celibato':'party.svg','capodanno-caldo':'sun.svg','premium':'diamond.svg',
    'luxury':'crown.svg','estate':'sun.svg','primavera':'flower.svg','autunno':'leaf.svg',
    'inverno':'snowflake.svg','snowboard':'snowboard.svg','sci':'ski.svg','trekking':'hiking.svg',
    'arrampicata':'climb.svg','ciclismo':'bike.svg','surf':'surf.svg','immersioni':'diving.svg',
    'snorkeling':'snorkel.svg','golf':'golf.svg'
  };
  btns.forEach(btn=>{
    if(!btn.querySelector('img.cat-icon')){
      const label = btn.querySelector('.label')?.textContent || '';
      const slug = slugify(label);
      const iconName = iconMap[slug] || 'category.svg';
      const img = document.createElement('img');
      img.src = 'assets/img/subcats/' + iconName;
      img.alt = label;
      img.className = 'cat-icon';
      btn.insertBefore(img, btn.firstChild);
    }
  });

  // Modal elements
  const modal = $('#destination-modal');
  const closeEls = $$('[data-close]', modal);
  const titleEl = $('#dest-title');
  const descEl = $('.dest-desc', modal);
  const hiEl = $('.dest-highlights', modal);
  const periodEl = $('.dest-period', modal);
  const bonusEl = $('.dest-bonus', modal);

  function openModal(){
    modal.classList.add('open'); document.body.style.overflow='hidden';
  }
  function closeModal(){
    modal.classList.remove('open'); document.body.style.overflow=''; 
  }
  closeEls.forEach(el=> el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function buildContent(city, category){
    const cat = (category||'').toLowerCase();
    const descs = {
      mare: [ `${city} è l'idea giusta per chi ama spiagge chiare e mare calmo.`,
              `Acqua trasparente, tramonti intensi e sapori costieri: ${city} è perfetta per ricaricarsi.`,
              `${city} unisce calette nascoste e lidi attrezzati: c'è sempre l'angolo giusto per te.` ],
      montagna: [ `${city} regala sentieri panoramici e aria frizzante: uno scenario da cartolina.`,
                   `Tra boschi e vette, ${city} è la base ideale per escursioni e rifugi tipici.`,
                   `Ritmo lento, alpeggi e viste infinite: ${city} è montagna come te la immagini.` ],
      citta: [ `${city} sorprende tra quartieri creativi, musei e buon cibo.`,
               `Arte, mercati e vicoli fotogenici: ${city} si gira bene anche a piedi.`,
               `Weekend frizzante a ${city}: cultura, aperitivi e scorci instagrammabili.` ],
      safari: [ `${city} è sinonimo di natura potente: riserve, tramonti e cieli stellati.`,
                `Avvistamenti, piste rosse e lodge immersi nel wild: ${city} emoziona.` ],
      surf: [ `${city} offre spot per tutti i livelli: mattina glassy, pomeriggio long ride.`,
              `Acqua tiepida e line up amichevole: ${city} è la scelta giusta per surfare in relax.` ],
      trekking: [ `Zaino pronto: ${city} è piena di creste e laghi alpini.`,
                  `Trail ben segnati e rifugi con vista: ${city} è un paradiso per il trekking.` ],
      arrampicata: [ `Falesie solide e meteo spesso stabile: ${city} è top per scalare.`,
                     `Tiri lunghi, aderenza e panorami: ${city} fa venire voglia di legarsi subito.` ],
      snorkeling: [ `Maschera e pinne: a ${city} la barriera è a portata di bracciata.` ],
      immersioni: [ `Relitti, grotte e coralli: ${city} regala immersioni memorabili.` ],
      golf: [ `Fairway curati e clima gradevole: ${city} è perfetta per un tee time con vista.` ],
      default: [ `${city} è una meta azzeccata per staccare e tornare pieni di energia.` ]
    };
    const periods = {
      mare: [ 'da maggio a settembre', 'giugno e settembre (meno affollato)', 'luglio-agosto per mare caldo' ],
      montagna: [ 'giugno-settembre per trekking', 'dicembre-marzo per neve', 'settembre-ottobre foliage' ],
      citta: [ 'aprile-giugno e settembre-ottobre', 'tutto l’anno, evita i picchi festivi' ],
      safari: [ 'da giugno ad ottobre (stagione secca)', 'gennaio-marzo per cieli limpidi' ],
      surf: [ 'variabile: tardi estate/autunno', 'inverno per onde più consistenti' ],
      trekking: [ 'maggio-ottobre', 'giugno-settembre (sentieri al top)' ],
      arrampicata: [ 'aprile-giugno e settembre-ottobre' ],
      snorkeling: [ 'maggio-ottobre', 'dicembre-aprile nei tropici' ],
      immersioni: [ 'tutto l’anno, meglio con mare calmo' ],
      golf: [ 'primavera e autunno' ],
      default: [ 'primavera e autunno' ]
    };
    const highlightsMap = {
      mare: [ 'spiagge turchesi','snorkeling','tramonti pazzeschi','chiringuitos' ],
      montagna: [ 'sentieri panoramici','rifugi tipici','malghe','laghi alpini' ],
      citta: [ 'centro storico','musei','mercati locali','vista panoramica' ],
      safari: [ 'game drive all’alba','tramonti infuocati','cena sotto le stelle' ],
      surf: [ 'spot per tutti i livelli','scuole e noleggio','acqua tiepida' ],
      trekking: [ 'creste panoramiche','boschi e torrenti','segnaletica curata' ],
      arrampicata: [ 'falesie attrezzate','aderenza','tiri lunghi' ],
      snorkeling: [ 'pesci colorati','acqua cristallina','barriera vicina' ],
      immersioni: [ 'coralli','relitti','acqua limpida' ],
      golf: [ 'fairway curati','green veloci','clubhouse accogliente' ],
      default: [ 'scorci fotogenici','cucina locale','atmosfera rilassata' ]
    };
    const bonuses = {
      mare: [ 'Noleggia uno scooter al tramonto: zero traffico e foto top.' ],
      montagna: [ 'Prova una cena in rifugio e rientra con la lampada frontale.' ],
      citta: [ 'Compra una city card: salti le file e risparmi.' ],
      safari: [ 'Porta un binocolo leggero: farà la differenza negli avvistamenti.' ],
      surf: [ 'Session all’alba: line up vuota e luce spettacolare.' ],
      trekking: [ 'Parti presto: meteo più stabile e sentieri liberi.' ],
      arrampicata: [ 'Un paio di guanti sottili salva la pelle sui rientri.' ],
      snorkeling: [ 'Maglietta UV: più tempo in acqua senza scottarti.' ],
      immersioni: [ 'Filtro rosso per action cam: colori molto più vivi.' ],
      golf: [ 'Prenota il tee time a metà mattina: vento più calmo.' ],
      default: [ 'Svegliati presto: avrai la città tutta per te.' ]
    };

    const key = Object.keys(iconMap).includes(slugify(cat)) ? slugify(cat) : (
      ['mare','montagna','citta','safari','surf','trekking','arrampicata','snorkeling','immersioni','golf'].find(k=>cat.includes(k)) || 'default'
    );

    const desc = pick(descs[key] || descs.default);
    const per = pick(periods[key] || periods.default);
    const hi = (highlightsMap[key] || highlightsMap.default).slice(0,3);
    const bonus = pick(bonuses[key] || bonuses.default);

    return {desc, period:`Periodo migliore: ${per}.`, highlights: hi, bonus};
  }


  // Per-destination overrides via data-* on the .more button
  function readOverrides(button){
    const d = {};
    if(button.dataset.desc) d.desc = button.dataset.desc;
    if(button.dataset.period) d.period = button.dataset.period;
    if(button.dataset.bonus) d.bonus = button.dataset.bonus;
    if(button.dataset.highlights){
      d.highlights = button.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean);
    }
    return d;
  }


  // attach listeners to "Scopri di più" buttons
  const moreBtns = $$('.btn.more, .btn.secondary.more, button.more');
  moreBtns.forEach(b=>{
    b.addEventListener('click', (e)=>{
      const card = b.closest('.city-card');
      const city = b.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
      const category = b.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      const o = readOverrides(b);
      data = {...data, ...o};
      titleEl.textContent = city;
      descEl.textContent = data.desc;
      periodEl.textContent = data.period;
      bonusEl.textContent = data.bonus;
      hiEl.innerHTML = '';
      data.highlights.forEach(x=>{
        const li = document.createElement('li'); li.textContent = x; hiEl.appendChild(li);
      });
      openModal();
    });
  });

  // Close when clicking backdrop
  $('.modal-backdrop', modal)?.addEventListener('click', closeModal);

})();