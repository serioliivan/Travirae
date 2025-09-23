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
$$('.partners-logos').forEach(p=>{const n=p.querySelectorAll('img').length; if(n%2===1) p.classList.add('is-odd');});

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

  // ===== Subcategory photo injection & destination modal v2 content =====
  const catBtns = $$('.accordion-toggle.category');
  const slugify = (s)=> s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  const photoMap = {
    'mare':'beach,coast,sea',
    'montagna':'mountain,alps,peak',
    'lago':'alpine lake,lake',
    'isole':'tropical island,lagoon',
    'citta':'city skyline,rooftop',
    'relax':'spa,resort,zen',
    'safari':'safari,africa',
    'esotici':'tropical paradise',
    'natura':'forest,nature',
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
  catBtns.forEach(btn=>{
    const label = btn.querySelector('.label')?.textContent || '';
    const slug = slugify(label);
    if(!btn.querySelector('img.cat-photo')){
      const img = document.createElement('img');
      img.className = 'cat-photo';
      img.alt = label;
      img.src = `https://source.unsplash.com/featured/320x180/?${encodeURIComponent(photoMap[slug] || 'travel,landscape')}`;
      btn.insertBefore(img, btn.firstChild);
    }
    // remove possible old icon
    const old = btn.querySelector('img.cat-icon'); if(old) old.remove();
  });

  // ===== Modal content builders =====
  const modal = $('#destination-modal');
  const titleEl = $('#dest-title');
  const descEl = $('.dest-desc', modal);
  const hiEl = $('.dest-highlights', modal);
  const bonusEl = $('.dest-bonus', modal);
  const closeEls = $$('[data-close]', modal);
  function openModal(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  closeEls.forEach(el=> el.addEventListener('click', closeModal));
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
  $('.modal-backdrop', modal)?.addEventListener('click', closeModal);

  const taglines = {
    mare: ['tra calette segrete e tramonti infuocati','dove il blu non finisce mai','tra sabbia fine e chiringuitos'],
    montagna: ['tra vette spettacolari e rifugi di legno','dove l’aria è pulita e il cielo è vicino','tra sentieri, laghi e cieli limpidi'],
    citta: ['tra musei, quartieri creativi e buon cibo','dove ogni angolo racconta una storia','tra cocktail bar, mercati e scorci iconici'],
    isole: ['tra acque turchesi e ritmi lenti','piccoli paradisi da scoprire uno a uno'],
    safari: ['tra piste rosse e cieli stellati','faccia a faccia con la natura più potente'],
    surf: ['tra onde lunghe e vibrazioni rilassate','spot per tutti i livelli'],
    trekking: ['creste panoramiche e boschi profumati'],
    arrampicata: ['falesie perfette e panorami da brividi'],
    snorkeling: ['barriere vicine e acqua cristallina'],
    immersioni: ['relitti, grotte e coralli'],
    default: ['che sa come sorprenderti']
  };

  
  const cityTaglines = {
    'parigi':'la città dell’amore',
    'venezia':'la magia sull’acqua',
    'roma':'la grande bellezza',
    'new york':'la città che non dorme mai',
    'tokyo':'tradizione e futuro a neon',
    'bali':'templi, risaie e surf',
    'santorini':'bianchi vicoli e tramonti viola',
    'mykonos':'l’isola del vento',
    'dubai':'deserto e grattacieli',
    'londra':'pub, parchi e musei',
    'barcellona':'arte, tapas e mare'
  };

  function buildTagline(city, category){
    const key = slugify(category).split('-')[0];
    const lowCity = city.toLowerCase();
    if(cityTaglines[lowCity]) return `${city} — ${cityTaglines[lowCity]}`;
    const arr = taglines[key] || taglines.default;
    const t = arr[Math.floor(Math.random()*arr.length)];
    return `${city} — ${t}`;
  }

  function paragraph(city, category){
    const base = (txt)=>txt.replace(/\s+/g,' ').trim();
    const cat = slugify(category);
    let sentences = [];
    if(cat.includes('mare') || cat.includes('isole')){
      sentences = [
        `${city} profuma di salsedine e giornate senza orari.`,
        `Tra spiagge dorate e baie nascoste, il tempo scorre più lento.`,
        `La sera i colori si accendono, i tavolini si riempiono e l’atmosfera diventa magica.`,
        `È il posto giusto per chi vuole alternare relax e piccole avventure in mare.`,
        `Porta la fotocamera: i tramonti qui non deludono mai.`
      ];
    } else if(cat.includes('montagna') || cat.includes('trekking') || cat.includes('sci') || cat.includes('snow')){
      sentences = [
        `${city} è una boccata d’aria fresca: boschi, laghi e cieli immensi.`,
        `I sentieri salgono dolci tra profumo di resina e campanacci lontani.`,
        `Ogni balconata regala panorami che restano in memoria a lungo.`,
        `Dopo il giro, rifugio caldo e piatti di montagna fanno il resto.`,
        `Qui il ritmo diventa quello giusto, naturale e senza fretta.`
      ];
    } else if(cat.includes('citta')){
      sentences = [
        `${city} sorprende a ogni passo: musei, piazze, vicoli fotogenici.`,
        `Tra botteghe storiche e locali nuovi di zecca, è impossibile annoiarsi.`,
        `Il bello è perdersi: dietro ogni angolo spunta un dettaglio da fotografare.`,
        `La sera, luci e profumi trasformano le strade in un palcoscenico vivo.`,
        `È la meta perfetta per chi cerca idee, sapori e storie.`
      ];
    } else {
      sentences = [
        `${city} è la scelta giusta per staccare e tornare pieni di energia.`,
        `Paesaggi diversi in pochi chilometri e tante esperienze a portata di mano.`,
        `Le giornate scorrono tra scoperte, pause lente e piccole sorprese.`,
        `Ogni momento qui sa diventare un ricordo.`,
        `Parti leggero: il resto te lo regala il posto.`
      ];
    }
    return base(sentences.join(' '));
  }

  function highlightSet(category){
    const cat = slugify(category);
    if(cat.includes('mare') || cat.includes('isole')) return ['Calette turchesi 🐚','Beach bar al tramonto 🌅','Snorkeling facile 🐠','Escursioni in barca ⛵','Cucina di pesce 🦐'];
    if(cat.includes('montagna') || cat.includes('trekking') || cat.includes('sci') || cat.includes('snow')) return ['Sentieri panoramici 🥾','Rifugi tipici 🛖','Laghi alpini 🐟','Albe pulite 🌄','Cucina sostanziosa 🧀'];
    if(cat.includes('citta')) return ['Musei e gallerie 🖼️','Quartieri creativi 🧭','Mercati locali 🧺','Rooftop con vista 🌇','Caffè e bakery ☕'];
    if(cat.includes('safari')) return ['Game drive all’alba 🦁','Cieli stellati ✨','Sundowner nel bush 🍹','Lodge immersi 🌿','Guide esperte 🧭'];
    if(cat.includes('surf')) return ['Spot per tutti 🏄','Acqua tiepida 🌊','Scuole e noleggio 🏫','Tramonti in line‑up 🌅','Caffè post‑session ☕'];
    if(cat.includes('arrampicata')) return ['Falesie affidabili 🧗','Vie ben chiodate 🧩','Aderenze top 🪨','Panorami pieni 🔭','Comunità accogliente 🤝'];
    if(cat.includes('snorkeling') || cat.includes('immersioni')) return ['Barriera vicina 🪸','Pesci colorati 🐡','Acqua limpida 💧','Gite in barca ⛵','GOPRO friendly 🎥'];
    if(cat.includes('golf')) return ['Fairway curati ⛳','Green veloci 🟢','Clubhouse accogliente 🏡','Clima mite 🌤️','Scorci panoramici 📸'];
    return ['Scorci fotogenici 📷','Cucina locale 🥗','Passeggiate facili 🚶','Tramonti belli 🌅','Relax assicurato 😌'];
  }

  function bonusLine(category){
    const cat = slugify(category);
    if(cat.includes('mare') || cat.includes('isole')) return 'Noleggia una barchetta al tramonto: piccole baie tutte per te. 🚤';
    if(cat.includes('montagna') || cat.includes('trekking')) return 'Cena in rifugio e rientro con frontale: cielo pieno di stelle. ✨';
    if(cat.includes('citta')) return 'Prenota un rooftop al tramonto: drink + vista da cartolina. 🍸';
    if(cat.includes('safari')) return 'Porta un binocolo leggero: riconoscerai animali anche lontano. 🔭';
    if(cat.includes('surf')) return 'Sessione all’alba: line‑up vuota e luce spettacolare. 🌅';
    if(cat.includes('arrampicata')) return 'Top delle mani + nastro: più tentativi, più divertimento. 🧗';
    if(cat.includes('snorkeling') || cat.includes('immersioni')) return 'Filtro rosso per l’action cam: colori pazzeschi sott’acqua. 🎥';
    if(cat.includes('golf')) return 'Tee time a metà mattina: vento calmo e fairway perfetti. ⛳';
    return 'Svegliati presto e cammina 10 minuti in più: scoprirai angoli solo tuoi. 🌟';
  }

  // Attach to "Scopri di più"
  document.addEventListener('click', (ev)=>{
  const b = ev.target.closest('.btn.more, .btn.secondary.more, button.more');
  if(!b) return;
  const card = b.closest('.city-card');
  const city = b.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
  const category = b.closest('.accordion-item')?.querySelector('.label')?.textContent || 'Viaggio';
  titleEl.textContent = buildTagline(city, category);
  descEl.textContent = paragraph(city, category);
  const items = highlightSet(category);
  hiEl.innerHTML = '';
  items.forEach(t=>{ const li = document.createElement('li'); li.textContent = '• ' + t; hiEl.appendChild(li); });
  bonusEl.textContent = bonusLine(category);
  openModal();
});

  // FULLBAR_BG_V1: set photo as full-width background for each category bar
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
    const slugify=(s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const slug = slugify(label);
      const q = photoMap[slug] || 'travel,landscape';
      const src = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q)+'); // default fallback
      let finalUrl = btn.dataset.photo || ('https://source.unsplash.com/1400x600/?'+encodeURIComponent(q));
      btn.classList.add('has-photo');
      btn.style.backgroundImage = 'url("'+finalUrl+'")';
    });
  })();

})();
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      if(!btn.querySelector('img.cat-photo')){
        const img = document.createElement('img'); img.className='cat-photo'; img.loading='lazy'; img.src='assets/img/common/hero.jpg'; btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  document.addEventListener('click', (e)=>{
    const trg = e.target.closest('.more');
    if(!trg) return;
    e.preventDefault();
    try{
      const modal = document.getElementById('destination-modal');
      if(!modal){ return; }
      const card = trg.closest('.city-card');
      const city = trg.dataset.city || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
      const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      const titleEl = modal.querySelector('#dest-title');
      const descEl = modal.querySelector('.dest-desc');
      const hiEl = modal.querySelector('.dest-highlights');
      const bonusEl = modal.querySelector('.dest-bonus');
      titleEl.textContent = catchyTagline(category, city);
      descEl.textContent = longDescription(city, category);
      hiEl.innerHTML = '';
      (data.highlights||[]).slice(0,5).forEach(x=>{ const li=document.createElement('li'); li.textContent=x; hiEl.appendChild(li); });
      bonusEl.textContent = data.bonus || strongBonuses(category);
      modal.classList.add('open'); document.body.style.overflow='hidden';
    }catch(err){ console.error(err); }
  });

  // BACKGROUND_PHOTOS_V1: background photos for each category bar (full cover)
  document.addEventListener('DOMContentLoaded', ()=>{
    const map = {
      'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine',
      'isole':'tropical island,lagoon','cultura':'museum,old town','relax':'spa,resort',
      'citta':'city skyline,europe','safari':'safari,africa','esotici':'tropical,paradise',
      'natura':'forest,nature','fuga-romantica':'romantic,couple','anniversario':'anniversary,romantic',
      'luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
      'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
      'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
      'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving,reef','snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slug = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    $$('.accordion-toggle.category').forEach(btn=>{
      btn.querySelectorAll('img.cat-photo, img.cat-icon').forEach(n=>n.remove());
      const label = btn.querySelector('.label')?.textContent || '';
      const q = map[slug(label)] || 'travel,landscape';
      const chosen = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q)+' + Math.random() + '&' + encodeURIComponent(q));
      const test = new Image();
      test.onload = ()=>{ btn.style.backgroundImage = 'url("'+chosen+'")'; };
      test.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero.jpg)'; };
      test.src = chosen;
    });
  });
