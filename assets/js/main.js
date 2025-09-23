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
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' ')) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }

  // ===== Category photos in headers (real images) =====
  (function(){
    const qMap = {
      'mare':'beach,sea,coast,tropical',
      'montagna':'mountains,alps,ridge',
      'lago':'lake,alpine lake',
      'isole':'island,tropical island',
      'citta':'city skyline,old town',
      'cultura':'museum,architecture',
      'relax':'spa,resort,pool',
      'safari':'safari,africa,wildlife',
      'esotici':'tropical,maldives',
      'natura':'nature,forest,waterfall',
      'fuga-romantica':'romantic,couple,city night',
      'anniversario':'romantic dinner,city',
      'luna-di-miele':'honeymoon,overwater',
      'estate':'summer,beach',
      'primavera':'spring,flowers',
      'autunno':'autumn,foliage',
      'inverno':'winter,snow',
      'snowboard':'snowboard,alps',
      'sci':'ski,slope',
      'trekking':'hiking,trail,alps',
      'arrampicata':'rock climbing,climbing',
      'ciclismo':'cycling,road bike',
      'surf':'surf,beach,wave',
      'immersioni':'scuba diving,underwater',
      'snorkeling':'snorkeling,reef',
      'golf':'golf course,greens'
    };
    const source = (q)=>`https://source.unsplash.com/1200x600/?${encodeURIComponent(q)}`;
    const cats = $$('.accordion-toggle.category');
    cats.forEach(c=>{
      // remove any icon/thumb inside
      c.querySelectorAll('img, svg').forEach(e=>e.remove());
      const labelEl = c.querySelector('.label');
      const slug = (labelEl?.textContent||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const q = qMap[slug] || (slug.replace(/-/g,' ') || 'travel');
      c.style.setProperty('--cat-bg', `url('${source(q)}')`);
      c.classList.add('category--photo');
    });
  })();

  // PHOTO_INJECTION_V2: real photo thumbnails for categories
  document.addEventListener('DOMContentLoaded', ()=>{
  // DATA_PHOTO_OVERRIDE: allow fixed image via data-photo on the accordion item/toggle
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    if(btn.dataset.photo){
      let img = btn.querySelector('img.cat-photo');
      if(!img){ img = document.createElement('img'); img.className='cat-photo'; img.loading='lazy'; btn.insertBefore(img, btn.firstChild); }
      img.src = btn.dataset.photo; img.alt = btn.querySelector('.label')?.textContent || 'Categoria';
    }
  });

    const photoMap = {
      'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine',
      'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
      'citta':'city skyline,europe','safari':'safari,africa','esotici':'tropical,paradise',
      'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
      'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
      'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
      'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
      'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving','snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slugify=(s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      btn.querySelectorAll('img.cat-icon').forEach(el=>el.remove());
      if(!btn.querySelector('img.cat-photo')){
        const label = btn.querySelector('.label')?.textContent||'';
        const q = photoMap[slugify(label)] || 'travel,landscape';
        const img = document.createElement('img');
        img.className='cat-photo'; img.alt=label; img.loading='lazy';
        img.width=300; img.height=180;
        img.src = 'https://source.unsplash.com/300x180/?'+encodeURIComponent(q);
        btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  // DELEGATED_MORE_HANDLER: open modal on any ".more" click
  document.addEventListener('click', (e)=>{
    const trg = e.target.closest('.more');
    if(!trg) return;
    e.preventDefault();
    try{
      const card = trg.closest('.city-card');
      const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
      const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      const o = {};
      if(trg.dataset.desc) o.desc = trg.dataset.desc;
      if(trg.dataset.bonus) o.bonus = trg.dataset.bonus;
      if(trg.dataset.highlights) o.highlights = trg.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean);
      data = {...data, ...o};
      const modal = document.getElementById('destination-modal');
      const titleEl = modal.querySelector('#dest-title');
      const descEl = modal.querySelector('.dest-desc');
      const hiEl = modal.querySelector('.dest-highlights');
      const bonusEl = modal.querySelector('.dest-bonus');
      titleEl.textContent = catchyTagline(category, city);
      descEl.textContent = longDescription(city, category);
      hiEl.innerHTML='';
      (data.highlights||[]).slice(0,5).forEach(x=>{
        const li=document.createElement('li'); li.textContent=x; hiEl.appendChild(li);
      });
      bonusEl.textContent = data.bonus || strongBonuses(category);
      modal.classList.add('open'); document.body.style.overflow='hidden';
    }catch(err){ console.error(err); }
  });

})();

// ---- City Modal ----
(function(){
  var modal = document.getElementById('city-modal');
  if(!modal) return;
  var titleEl = modal.querySelector('#city-title');
  var descEl = modal.querySelector('#city-desc');
  var highlightsEl = modal.querySelector('#city-highlights');
  var whenEl = modal.querySelector('#city-when');
  var bonusEl = modal.querySelector('#city-bonus');
  var moreBtns = document.querySelectorAll('.btn.more[data-city]');

  function fallbackContent(name){
    return {
      title: name,
      desc: `Scopri ${name}: una meta che combina esperienze uniche tra natura, cultura e buon cibo. Abbiamo raccolto qualche consiglio utile per pianificare al meglio il viaggio.`,
      highlights: [
        'Quartieri/zone consigliate da esplorare',
        'Esperienze autentiche e punti panoramici',
        'Piatti tipici e mercati locali'
      ],
      when: 'Periodo consigliato: valuta la stagione in base al tipo di viaggio (mare: giugno–settembre; tropici: dicembre–marzo; città: aprile–giugno e settembre–ottobre).',
      bonus: 'Suggerimento: salva la meta e attiva un alert prezzo per cogliere l’offerta migliore.'
    };
  }

  function populate(data){
    titleEl.textContent = data.title || '';
    descEl.textContent = data.desc || '';
    // build highlights
    highlightsEl.innerHTML = '';
    (data.highlights || []).forEach(function(item){
      var li = document.createElement('li');
      li.textContent = item;
      highlightsEl.appendChild(li);
    });
    whenEl.textContent = data.when || '';
    bonusEl.textContent = data.bonus || '';

  // ===== Content builder: catchy titles, longer descriptions, 4-5 highlights, bonus; NYC map placeholder
  const heroEl = $('#dest-hero');
  function catchyTitle(city, category){
    const map = {
      'mare': ['%s, dove il mare ha mille sfumature','%s: spiagge, tramonti e felicità'],
      'montagna': ['%s, tra vette e rifugi','%s: aria buona e panorami'],
      'citta': ['%s, città che vibra','%s: arte, quartieri e sapori'],
      'isole': ['%s, l’isola da ricordare','%s: sabbia fine e acque chiare'],
      'safari': ['%s, emozioni nella savana'],
      'trekking': ['%s, zaino in spalla'],
      'arrampicata': ['%s, falesie e aderenza'],
      'surf': ['%s, onde e good vibes'],
      'default': ['%s, il tuo prossimo posto felice']
    };
    const key = Object.keys(map).find(k=> (category||'').toLowerCase().includes(k)) || 'default';
    const pool = map[key];
    const pick = pool[Math.floor(Math.random()*pool.length)];
    return pick.replace('%s', city);
  }

  function longParagraphs(city, category){
    const base = [
      `🌍 ${city} conquista al primo sguardo: scorci fotogenici, ritmi che invogliano a rallentare e una scena locale tutta da scoprire.`,
      `🍽️ Tra sapori tipici e indirizzi di tendenza, qui ogni pasto diventa un ricordo. Dalla colazione lenta agli aperitivi con vista, non manca nulla.`,
      `🚶 Itinerari facili da vivere: passeggiate, quartieri autentici e panorami che cambiano luce durante la giornata.`,
      `📸 E poi c’è quell’atmosfera speciale che ti fa dire “torno presto”, perfetta per coppie, amici o un viaggio in solitaria.`
    ];
    // Mescola un quinto paragrafo opzionale per varietà
    const extra = [
      `💡 Consiglio: prenditi tempo per perderti un po’ — è così che saltano fuori gli angoli più belli e le storie migliori.`,
      `🌅 Al tramonto la magia raddoppia: tieni la fotocamera pronta.`
    ];
    if (Math.random()>0.5) base.push(extra[Math.floor(Math.random()*extra.length)]);
    return base.join(' ');
  }

  function highlightsFor(category){
    const m = {
      mare: ['spiagge turchesi','snorkeling 🤿','tramonti pazzeschi','chiringuitos','gite in barca'],
      montagna: ['sentieri panoramici 🥾','rifugi tipici','laghi alpini','malghe','stelle nitidissime'],
      citta: ['centro storico','quartieri creativi','musei e gallerie','mercati locali','belvedere'],
      isole: ['acque cristalline','spiagge diverse ogni giorno','tramonti rosa','villaggi bianchi','barche'],
      safari: ['game drive all’alba','cieli incredibili','lodge nella natura','fotografia wild','tramonti fuoco'],
      trekking: ['trail ben segnati','passi e creste','rifugi accoglienti','laghetti','boschi profumati'],
      arrampicata: ['falesie perfette','aderenza top','tiri lunghi','panorami','community rock'],
      surf: ['onde per tutti','scuole e noleggio','acqua tiepida','spiagge lunghe','tramonti sul mare'],
      default: ['scorci fotogenici','cucina locale','percorsi facili','atmosfera rilassata','posti instagrammabili']
    };
    const key = Object.keys(m).find(k=> category.toLowerCase().includes(k)) || 'default';
    return m[key];
  }

  function greatBonus(category){
    const pool = [
      '🎁 Sorpresa: una mappa con i 7 spot segreti da vedere al tramonto — poco turistici, molto memorabili.',
      '🎁 Un itinerario “48 ore” pronto all’uso: arrivo, must‑see, pause golose e vista finale.',
      '🎁 Una mini‑guida di 10 locali scelti bene: niente trappole, solo posti fighi dove tornare.'
    ];
    return pool[Math.floor(Math.random()*pool.length)];
  }

  
  function setNYHero(){
    const hero = document.getElementById('dest-hero');
    if(!hero) return;
    // Prova a riutilizzare l'iframe Stay22 già presente in homepage
    const src = document.getElementById('stay22-widget')?.getAttribute('src');
    if(src && src !== '' && !/\.\.\./.test(src)){
      hero.innerHTML = `<iframe src="${src}" width="100%" height="100%" style="border:0;border-radius:14px" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>`;
    }else{
      // Fallback: foto di New York
      hero.style.backgroundImage = "url('https://source.unsplash.com/1200x600/?new%20york%20city,manhattan,skyline')";
    }
  }


  }

  function openModal(){
    modal.classList.add('open');
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }

  modal.addEventListener('click', function(e){
    if(e.target.dataset.close) closeModal();
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape') closeModal();
  });
  var closeBtn = modal.querySelector('.modal-close');
  if(closeBtn) closeBtn.addEventListener('click', closeModal);

  // Prepare data map from a JSON if present
  var DATA = window.CITY_DATA || {};

  moreBtns.forEach(function(btn){
    btn.addEventListener('click', function(){
      var name = this.getAttribute('data-city') || this.textContent.trim();
      var data = DATA[name] || fallbackContent(name);
      populate(data);
      openModal();
    });
  });

  // ===== Category photos in headers (real images) =====
  (function(){
    const qMap = {
      'mare':'beach,sea,coast,tropical',
      'montagna':'mountains,alps,ridge',
      'lago':'lake,alpine lake',
      'isole':'island,tropical island',
      'citta':'city skyline,old town',
      'cultura':'museum,architecture',
      'relax':'spa,resort,pool',
      'safari':'safari,africa,wildlife',
      'esotici':'tropical,maldives',
      'natura':'nature,forest,waterfall',
      'fuga-romantica':'romantic,couple,city night',
      'anniversario':'romantic dinner,city',
      'luna-di-miele':'honeymoon,overwater',
      'estate':'summer,beach',
      'primavera':'spring,flowers',
      'autunno':'autumn,foliage',
      'inverno':'winter,snow',
      'snowboard':'snowboard,alps',
      'sci':'ski,slope',
      'trekking':'hiking,trail,alps',
      'arrampicata':'rock climbing,climbing',
      'ciclismo':'cycling,road bike',
      'surf':'surf,beach,wave',
      'immersioni':'scuba diving,underwater',
      'snorkeling':'snorkeling,reef',
      'golf':'golf course,greens'
    };
    const source = (q)=>`https://source.unsplash.com/1200x600/?${encodeURIComponent(q)}`;
    const cats = $$('.accordion-toggle.category');
    cats.forEach(c=>{
      // remove any icon/thumb inside
      c.querySelectorAll('img, svg').forEach(e=>e.remove());
      const labelEl = c.querySelector('.label');
      const slug = (labelEl?.textContent||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
      const q = qMap[slug] || (slug.replace(/-/g,' ') || 'travel');
      c.style.setProperty('--cat-bg', `url('${source(q)}')`);
      c.classList.add('category--photo');
    });
  })();

  // PHOTO_INJECTION_V2: real photo thumbnails for categories
  document.addEventListener('DOMContentLoaded', ()=>{
  // DATA_PHOTO_OVERRIDE: allow fixed image via data-photo on the accordion item/toggle
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    if(btn.dataset.photo){
      let img = btn.querySelector('img.cat-photo');
      if(!img){ img = document.createElement('img'); img.className='cat-photo'; img.loading='lazy'; btn.insertBefore(img, btn.firstChild); }
      img.src = btn.dataset.photo; img.alt = btn.querySelector('.label')?.textContent || 'Categoria';
    }
  });

    const photoMap = {
      'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine',
      'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
      'citta':'city skyline,europe','safari':'safari,africa','esotici':'tropical,paradise',
      'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
      'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
      'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
      'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
      'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving','snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slugify=(s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      btn.querySelectorAll('img.cat-icon').forEach(el=>el.remove());
      if(!btn.querySelector('img.cat-photo')){
        const label = btn.querySelector('.label')?.textContent||'';
        const q = photoMap[slugify(label)] || 'travel,landscape';
        const img = document.createElement('img');
        img.className='cat-photo'; img.alt=label; img.loading='lazy';
        img.width=300; img.height=180;
        img.src = 'https://source.unsplash.com/300x180/?'+encodeURIComponent(q);
        btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  // DELEGATED_MORE_HANDLER: open modal on any ".more" click
  document.addEventListener('click', (e)=>{
    const trg = e.target.closest('.more');
    if(!trg) return;
    e.preventDefault();
    try{
      const card = trg.closest('.city-card');
      const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
      const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      const o = {};
      if(trg.dataset.desc) o.desc = trg.dataset.desc;
      if(trg.dataset.bonus) o.bonus = trg.dataset.bonus;
      if(trg.dataset.highlights) o.highlights = trg.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean);
      data = {...data, ...o};
      const modal = document.getElementById('destination-modal');
      const titleEl = modal.querySelector('#dest-title');
      const descEl = modal.querySelector('.dest-desc');
      const hiEl = modal.querySelector('.dest-highlights');
      const bonusEl = modal.querySelector('.dest-bonus');
      titleEl.textContent = catchyTagline(category, city);
      descEl.textContent = longDescription(city, category);
      hiEl.innerHTML='';
      (data.highlights||[]).slice(0,5).forEach(x=>{
        const li=document.createElement('li'); li.textContent=x; hiEl.appendChild(li);
      });
      bonusEl.textContent = data.bonus || strongBonuses(category);
      modal.classList.add('open'); document.body.style.overflow='hidden';
    }catch(err){ console.error(err); }
  });

})();
