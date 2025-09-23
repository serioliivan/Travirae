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
// mark odd partners grids so the last item goes centered
$$('.partners-logos').forEach(p=>{ const n=p.querySelectorAll('img').length; if(n%2===1) p.classList.add('is-odd'); });
  // === Rich content for destination modal (longer copy & emojis) ===
  function catchyTagline(category, city){
    const base = (category||'').toLowerCase();
    const map = {
      'mare':'spiagge da cartolina e tramonti 🔆',
      'montagna':'tra vette, rifugi e cieli limpidi 🏔️',
      'lago':'specchi d’acqua e passeggiate romantiche 🌅',
      'isole':'sabbia fine e ritmi lenti 🏝️',
      'cultura':'musei, quartieri creativi e sapori locali 🖼️',
      'relax':'giorni lenti, spa e silenzio 😌',
      'città':'musei, rooftop e quartieri iconici 🏙️',
      'safari':'grandi spazi e tramonti infuocati 🐾',
      'esotici':'colori vividi e profumi tropicali 🌺',
      'natura':'boschi, cascate e aria buona 🌿',
      'fuga romantica':'angoli intimi e viste da cartolina 💞',
      'anniversario':'momenti speciali da ricordare 🎉',
      'luna di miele':'notti stellate e coccole di lusso ✨',
      'addio celibato':'energia, musica e divertimento 🎧',
      'premium':'hotel scenografici e dettagli curati 💎',
      'luxury':'resort di charme e fine dining 👑',
      'surf':'onde perfette e chill vibes 🏄',
      'immersioni':'fondali colorati e acque trasparenti 🤿',
      'snorkeling':'pesci tropicali a due bracciate 🐠',
      'trekking':'sentieri panoramici e rifugi caldi 🥾',
      'arrampicata':'falesie leggendarie e aderenza 🔗',
      'sci':'neve curata e rifugi golosi 🎿',
      'snowboard':'powder e linee creative 🏂',
      'ciclismo':'salite epiche e strade panoramiche 🚴‍♂️',
      'golf':'fairway curati e tee time perfetti ⛳️'
    };
    const key = Object.keys(map).find(k=>base.includes(k)) || 'natura';
    return `${city} — ${map[key]}`;
  }
  function longDescription(city, category){
    const c = (category||'').toLowerCase();
    const blocks = {
      mare: [
        `${city} profuma di salsedine e libertà: mattine lente, sabbia setosa e acqua cristallina.`,
        `A pranzo ti aspettano chioschi sul mare e piatti di pesce freschissimi.`,
        `Il pomeriggio scorre tra calette nascoste e passeggiate sul lungomare.`,
        `E al tramonto? Colori intensi e cocktail vista orizzonte: difficile desiderare di più.`,
        `Di sera, locali sulla spiaggia e musica soffusa completano l’atmosfera.`
      ],
      montagna: [
        `A ${city} la montagna è un invito a respirare meglio e guardare lontano.`,
        `Tra boschi profumati e torrenti, i sentieri conducono a rifugi di legno e pietra.`,
        `Le giornate scorrono tra escursioni, panorami infiniti e pranzi genuini.`,
        `La sera il cielo è pieno di stelle e il silenzio fa da colonna sonora.`,
        `Perfetta per chi cerca natura autentica e ritmi più umani.`
      ],
      citta: [
        `${city} sorprende a ogni angolo: musei, gallerie, street food e architetture iconiche.`,
        `Basta una passeggiata per passare da un quartiere creativo a un rooftop con vista.`,
        `Tra mercati, boutique indipendenti e caffè di design, il tempo vola.`,
        `La notte si accende tra cocktail bar e ristoranti che sperimentano.`,
        `Ideale per chi ama scoprire, fotografare e assaggiare.`
      ],
      default: [
        `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati.`,
        `Ogni giornata regala qualcosa: un panorama, un sapore, un incontro.`,
        `Fra passeggiate, scoperte e piccole sorprese, la voglia di restare cresce.`,
        `E quando arriva la sera, la luce si fa morbida e il tempo rallenta.`,
        `Qui è facile ricaricarsi e tornare con idee nuove.`
      ]
    };
    const key = c.includes('mare')?'mare':(c.includes('montagna')?'montagna':(c.includes('citt')?'citta':'default'));
    return blocks[key].join(' ');
  }
  function strongBonuses(category){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')||c.includes('snorkeling')) 
      return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata'))
      return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato (trasporto incluso).';
    if(c.includes('citt')||c.includes('cultura'))
      return '🎁 Bonus: pass salta‑fila ai 2 musei più richiesti + drink su un rooftop panoramico.';
    if(c.includes('surf'))
      return '🎁 Bonus: session all’alba con coach locale e foto professionali della tua surfata.';
    if(c.includes('sci')||c.includes('snow'))
      return '🎁 Bonus: ciaspolata al tramonto con aperitivo caldo in baita.';
    return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
  }


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
  // === Insert real photos inside category bars (sottocategorie) ===
  (function(){
    const photoMap = {
      'mare':'beach,sea,coast',
      'montagna':'mountain,alps,peak',
      'lago':'lake,alpine lake',
      'isole':'tropical island,lagoon',
      'cultura':'museum,old town',
      'relax':'spa,resort',
      'citta':'city skyline,europe city',
      'safari':'safari,africa',
      'esotici':'tropical,paradise beach',
      'natura':'forest,nature',
      'destinazioni-popolari':'landmark,iconic',
      'fuga-romantica':'romantic,couple',
      'anniversario':'romantic dinner,city night',
      'luna-di-miele':'honeymoon,overwater',
      'addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach',
      'premium':'luxury,resort',
      'luxury':'luxury,resort',
      'estate':'summer,beach',
      'primavera':'spring,flowers',
      'autunno':'autumn,foliage',
      'inverno':'winter,snow',
      'snowboard':'snowboard,freeride',
      'sci':'ski,skiing',
      'trekking':'hiking,trail',
      'arrampicata':'rock climbing,climber',
      'ciclismo':'cycling,road bike',
      'surf':'surf,wave',
      'immersioni':'scuba diving,reef',
      'snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slugify = (s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    $$('.accordion-toggle.category').forEach(btn=>{
      // guard: avoid duplicates
      if(btn.querySelector('img.cat-photo')) return;
      const label = btn.querySelector('.label')?.textContent || '';
      const slug = slugify(label);
      const q = photoMap[slug] || 'travel,landscape';
      const src = `https://source.unsplash.com/featured/300x200/?${encodeURIComponent(q)}`;
      const img = document.createElement('img');
      img.className = 'cat-photo';
      img.alt = label;
      img.loading = 'lazy';
      img.src = src;
      btn.appendChild(img); // position absolute via CSS, label stays perfectly centered
    });
  })();

  function buildContent(city, category){
    const highlightsMap = {
      mare: [ 'spiagge turchesi','snorkeling','tramonti pazzeschi','chiringuitos','acqua calda' ],
      montagna: [ 'sentieri panoramici','rifugi tipici','malghe','laghi alpini','cielo stellato' ],
      citta: [ 'centro storico','musei','mercati locali','rooftop vista skyline','quartieri creativi' ],
      safari: [ 'game drive all’alba','tramonti infuocati','cena sotto le stelle','guide esperte' ],
      surf: [ 'spot per tutti i livelli','scuole e noleggio','acqua tiepida','sunset session' ],
      trekking: [ 'creste panoramiche','boschi e torrenti','segnaletica curata','rifugi accoglienti' ],
      arrampicata: [ 'falesie attrezzate','aderenza','tiri lunghi','panorami fotonici' ],
      snorkeling: [ 'pesci colorati','barriera vicino riva','acqua cristallina','escursioni in barca' ],
      immersioni: [ 'coralli','relitti','acqua limpida','centri diving qualificati' ],
      golf: [ 'fairway curati','green veloci','clubhouse accogliente','tee time perfetto' ],
      default: [ 'scorci fotogenici','cucina locale','atmosfera rilassata','ospitalità sincera' ]
    };
    const c = (category||'').toLowerCase();
    const key = Object.keys(highlightsMap).find(k=>c.includes(k)) || 'default';
    const hi = (highlightsMap[key] || highlightsMap.default).slice(0,5);
    const desc = longDescription(city, category);
    const bonus = strongBonuses(category);
    return { desc, highlights: hi, bonus };
  }

  // Attach listeners to "Scopri di più"
  const modal = $('#destination-modal');
  if(modal){
    const closeEls = $$('[data-close]', modal);
    const titleEl = $('#dest-title', modal);
    const descEl = $('.dest-desc', modal);
    const hiEl = $('.dest-highlights', modal);
    const bonusEl = $('.dest-bonus', modal);

    function openModal(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
    function closeModal(){ modal.classList.remove('open'); document.body.style.overflow=''; }

    closeEls.forEach(el=> el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
    $('.modal-backdrop', modal)?.addEventListener('click', closeModal);

    const moreBtns = $$('.btn.more, .btn.secondary.more, button.more');
    moreBtns.forEach(b=>{
      b.addEventListener('click', ()=>{
        const card = b.closest('.city-card');
        const city = b.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
        const category = b.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
        let data = buildContent(city, category);
        // overrides via data-*
        if(b.dataset.desc) data.desc = b.dataset.desc;
        if(b.dataset.bonus) data.bonus = b.dataset.bonus;
        if(b.dataset.highlights) data.highlights = b.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean).slice(0,5);

        titleEl.textContent = catchyTagline(category, city);
        descEl.textContent = data.desc;
        bonusEl.textContent = data.bonus;
        hiEl.innerHTML = '';
        (data.highlights||[]).forEach(x=>{
          const li = document.createElement('li'); li.textContent = x; hiEl.appendChild(li);
        });
        openModal();
      });
    });
  }

  // PHOTO_INJECTION_V3: show real photo per category (fallback to local hero.jpg on error)
  (function(){
    const photoMap = {
      'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine lake',
      'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
      'citta':'city skyline,europe city','safari':'safari,africa','esotici':'tropical,paradise beach',
      'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
      'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
      'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
      'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
      'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving,reef','snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slugify = (s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    $$('.accordion-toggle.category').forEach(btn=>{
      btn.querySelectorAll('img.cat-icon').forEach(el=>el.remove());
      if(!btn.querySelector('img.cat-photo')){
        const label = btn.querySelector('.label')?.textContent || '';
        const slug = slugify(label);
        const q = photoMap[slug] || 'travel,landscape';
        const img = document.createElement('img');
        img.className='cat-photo'; img.alt=label; img.loading='lazy';
        img.width=300; img.height=180;
        img.src = 'https://source.unsplash.com/300x180/?'+encodeURIComponent(q);
        img.onerror = ()=>{ img.onerror=null; img.src='assets/img/common/hero.jpg'; };
        // Allow override via data-photo on the button
        if(btn.dataset.photo){ img.src = btn.dataset.photo; img.onerror = ()=>{ img.src='assets/img/common/hero.jpg'; }; }
        btn.insertBefore(img, btn.firstChild);
      }
    });
  })();

  // DELEGATED_MORE_HANDLER: robust open for all 'Scopri di più' buttons/links
  document.addEventListener('click', (ev)=>{
    const el = ev.target.closest('.more');
    if(!el) return;
    ev.preventDefault();
    try{
      const modal = document.getElementById('destination-modal');
      if(!modal) return;
      const titleEl = modal.querySelector('#dest-title');
      const descEl = modal.querySelector('.dest-desc');
      const hiEl = modal.querySelector('.dest-highlights');
      const bonusEl = modal.querySelector('.dest-bonus');
      const card = el.closest('.city-card');
      const city = el.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent || 'La destinazione') : 'La destinazione');
      const category = el.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      // overrides
      if(el.dataset.desc) data.desc = el.dataset.desc;
      if(el.dataset.highlights) data.highlights = el.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean);
      if(el.dataset.bonus) data.bonus = el.dataset.bonus;
      titleEl.textContent = catchyTagline(category, city);
      descEl.textContent = longDescription(city, category);
      hiEl.innerHTML = '';
      (data.highlights||[]).slice(0,5).forEach(x=>{
        const li=document.createElement('li'); li.textContent=x; hiEl.appendChild(li);
      });
      bonusEl.textContent = data.bonus || strongBonuses(category);
      modal.classList.add('open'); document.body.style.overflow='hidden';
    }catch(err){ console.error('Modal error', err); }
  });

})();