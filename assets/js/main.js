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
  // Inject photo thumbnails for each "sottocategoria" (category toggle)
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
    const slug = s => (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    $$('.accordion-toggle.category').forEach(btn=>{
      if(!btn.querySelector('img.cat-photo')){
        const label = btn.querySelector('.label')?.textContent || '';
        const key = slug(label);
        const query = photoMap[key] || 'travel,landscape';
        const src = `https://source.unsplash.com/collection/190727/400x240/?${encodeURIComponent(query)}`;
        const img = document.createElement('img');
        img.className = 'cat-photo'; img.alt = label; img.loading = 'lazy'; img.src = src;
        btn.insertBefore(img, btn.firstChild);
      }
    });
  })();

  // ===== Modal content (longer copy with emojis) and event delegation
  const modal = document.getElementById('destination-modal');
  const titleEl = modal ? modal.querySelector('#dest-title') : null;
  const descEl = modal ? modal.querySelector('.dest-desc') : null;
  const hiEl = modal ? modal.querySelector('.dest-highlights') : null;
  const bonusEl = modal ? modal.querySelector('.dest-bonus') : null;

  function openModal(){ if(!modal) return; modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(){ if(!modal) return; modal.classList.remove('open'); document.body.style.overflow=''; }

  if(modal){
    modal.querySelectorAll('[data-close]').forEach(el=> el.addEventListener('click', closeModal));
    modal.querySelector('.modal-backdrop')?.addEventListener('click', closeModal);
    document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });
  }

  function catchyTagline(category, city){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')) return `${city} — spiagge da cartolina e tramonti 🔆`;
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata')) return `${city} — tra vette, sentieri e cieli limpidi 🏔️`;
    if(c.includes('citt')) return `${city} — musei, rooftop e quartieri iconici 🏙️`;
    if(c.includes('surf')) return `${city} — onde perfette e chill vibes 🏄`;
    if(c.includes('immersioni')||c.includes('snorkeling')) return `${city} — fondali colorati e acque trasparenti 🤿`;
    return `${city} — storie, sapori e panorami ✨`;
  }

  function longDescription(city, category){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')){
      return `${city} profuma di salsedine e libertà: mattine lente, sabbia setosa e acqua cristallina. `+
             `A pranzo ti aspettano chioschi sul mare e piatti di pesce freschissimi. `+
             `Il pomeriggio scorre tra calette nascoste e passeggiate sul lungomare. `+
             `E al tramonto? Colori intensi e cocktail vista orizzonte: difficile desiderare di più. `+
             `Di sera, musica soffusa e locali sulla spiaggia completano l’atmosfera.`;
    }
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata')||c.includes('sci')||c.includes('snow')){
      return `A ${city} la montagna è un invito a respirare meglio e guardare lontano. `+
             `Tra boschi profumati e torrenti, i sentieri conducono a rifugi di legno e pietra. `+
             `Le giornate scorrono tra escursioni, panorami infiniti e pranzi genuini. `+
             `La sera il cielo si riempie di stelle e il silenzio fa da colonna sonora. `+
             `Perfetta per chi cerca natura autentica e ritmi più umani.`;
    }
    if(c.includes('citt')){
      return `${city} sorprende a ogni angolo: musei, gallerie, street food e architetture iconiche. `+
             `Basta una passeggiata per passare da un quartiere creativo a un rooftop con vista. `+
             `Tra mercati, boutique indipendenti e caffè di design, il tempo vola. `+
             `La notte si accende tra cocktail bar e ristoranti che sperimentano. `+
             `Ideale per chi ama scoprire, fotografare e assaggiare.`;
    }
    return `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati. `+
           `Ogni giornata regala qualcosa: un panorama, un sapore, un incontro. `+
           `Fra passeggiate, scoperte e piccole sorprese, la voglia di restare cresce. `+
           `E quando arriva la sera, la luce si fa morbida e il tempo rallenta. `+
           `Qui è facile ricaricarsi e tornare con idee nuove.`;
  }

  function buildHighlights(category){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')) return ['spiagge turchesi', 'snorkeling', 'tramonti pazzeschi', 'chiringuitos', 'gite in barca'];
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata')) return ['sentieri panoramici', 'rifugi tipici', 'laghi alpini', 'cucina di montagna', 'skyline di vette'];
    if(c.includes('citt')) return ['centro storico', 'musei', 'mercati locali', 'rooftop con vista', 'quartieri creativi'];
    if(c.includes('surf')) return ['spot per tutti i livelli','scuole & noleggio','acqua tiepida','tramonti sulla spiaggia','foto in line-up'];
    if(c.includes('immersioni')||c.includes('snorkeling')) return ['barriera corallina','acqua limpida','pesci tropicali','gite in barca','calette protette'];
    return ['scorci fotogenici','cucina locale','atmosfera rilassata','passeggiate facili','ospitalità sincera'];
  }

  function strongBonus(category){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')||c.includes('snorkeling')) return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata')) return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato (trasporto incluso).';
    if(c.includes('citt')||c.includes('cultura')) return '🎁 Bonus: pass salta‑fila ai 2 musei più richiesti + drink su un rooftop panoramico.';
    if(c.includes('surf')) return '🎁 Bonus: session all’alba con coach locale e foto professionali della tua surfata.';
    if(c.includes('sci')||c.includes('snow')) return '🎁 Bonus: ciaspolata al tramonto con aperitivo caldo in baita.';
    return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
  }

  // Event delegation per tutti i bottoni "Scopri di più"
  document.addEventListener('click', (e)=>{
    const btn = e.target.closest('.more');
    if(!btn) return;
    if(!modal) return;
    const card = btn.closest('.city-card');
    const city = btn.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
    const category = btn.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
    // titolo, desc, highlights, bonus
    titleEl.textContent = catchyTagline(category, city);
    descEl.textContent = longDescription(city, category);
    const items = buildHighlights(category);
    hiEl.innerHTML = ''; items.slice(0,5).forEach(t=>{ const li=document.createElement('li'); li.textContent=t; hiEl.appendChild(li); });
    bonusEl.textContent = strongBonus(category);
    openModal();
  });

// ---- PHOTO FILLER v3: first show local fallback, then try remote; ensure text always centered
(function(){
  const photoMap = {
    'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine','isole':'tropical island,lagoon',
    'cultura':'museum,old town','relax':'spa,resort','citta':'city skyline,europe','safari':'safari,africa',
    'esotici':'tropical,paradise','natura':'forest,nature','fuga-romantica':'romantic,couple',
    'anniversario':'anniversary,romantic','luna-di-miele':'honeymoon,overwater','addio-celibato':'party,nightlife',
    'capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
    'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
    'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing',
    'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving','snorkeling':'snorkeling,reef','golf':'golf course'
  };
  const slugify = (s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    // remove old icons
    btn.querySelectorAll('img.cat-icon').forEach(i=>i.remove());
    // add photo if missing
    if(!btn.querySelector('img.cat-photo')){
      const label = btn.querySelector('.label')?.textContent || '';
      const slug = slugify(label);
      const img = document.createElement('img');
      img.className='cat-photo';
      img.alt = label;
      img.loading='lazy';
      // local fallback first
      img.src = 'assets/img/subcats-fallback/'+slug+'.jpg';
      // swap to remote if it loads
      const q = photoMap[slug] || 'travel,landscape';
      const remote = new Image();
      remote.onload = ()=>{ img.src = remote.src; };
      remote.onerror = ()=>{}; // keep local
      remote.src = 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=600&q=70&'+encodeURIComponent(q);
      btn.insertBefore(img, btn.firstChild);
    }
  });
// ---- POPUP CLICK DELEGATION v2
document.addEventListener('click', (ev)=>{
  // Work with any element that either has class .more OR contains the label "Scopri di più"
  const trg = ev.target.closest('.more, [data-action="more"], a, button');
  if(!trg) return;
  const text = (trg.textContent || '').trim().toLowerCase();
  if(!trg.classList.contains('more') && !/scopri\s+di\s+pi[ùu]/i.test(text)) return;
  ev.preventDefault();
  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const card = trg.closest('.city-card');
  const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
  const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
  // Build content via functions already in the file
  const titleEl = modal.querySelector('#dest-title');
  const descEl = modal.querySelector('.dest-desc');
  const hiEl   = modal.querySelector('.dest-highlights');
  const bonusEl= modal.querySelector('.dest-bonus');

  titleEl.textContent = catchyTagline(category, city);
  descEl.textContent = longDescription(city, category);
  const items = buildHighlights(category);
  hiEl.innerHTML='';
  (items||[]).slice(0,5).forEach(t=>{
    const li=document.createElement('li'); li.textContent=t; hiEl.appendChild(li);
  });
  bonusEl.textContent = strongBonus(category);

  modal.classList.add('open');
  document.body.style.overflow='hidden';
});

})();

// ---- POPUP CLICK DELEGATION v2
document.addEventListener('click', (ev)=>{
  // Work with any element that either has class .more OR contains the label "Scopri di più"
  const trg = ev.target.closest('.more, [data-action="more"], a, button');
  if(!trg) return;
  const text = (trg.textContent || '').trim().toLowerCase();
  if(!trg.classList.contains('more') && !/scopri\s+di\s+pi[ùu]/i.test(text)) return;
  ev.preventDefault();
  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const card = trg.closest('.city-card');
  const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
  const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
  // Build content via functions already in the file
  const titleEl = modal.querySelector('#dest-title');
  const descEl = modal.querySelector('.dest-desc');
  const hiEl   = modal.querySelector('.dest-highlights');
  const bonusEl= modal.querySelector('.dest-bonus');

  titleEl.textContent = catchyTagline(category, city);
  descEl.textContent = longDescription(city, category);
  const items = buildHighlights(category);
  hiEl.innerHTML='';
  (items||[]).slice(0,5).forEach(t=>{
    const li=document.createElement('li'); li.textContent=t; hiEl.appendChild(li);
  });
  bonusEl.textContent = strongBonus(category);

  modal.classList.add('open');
  document.body.style.overflow='hidden';
});

})();
  // BACKGROUND_PHOTOS_V1: use full-width background photos for each category bar
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
      const chosen = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q));
      const img = new Image();
      img.onload = ()=>{ btn.style.backgroundImage = `url('${chosen}')`; };
      img.onerror = ()=>{ btn.style.backgroundImage = 'url(assets/img/common/hero.jpg)'; };
      img.src = chosen;
    });
  });
