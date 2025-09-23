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
  // OFFLINE_CAT_PHOTOS: always-visible local thumbnails for categories
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      if(!btn.querySelector('img.cat-bg')){
        const img=document.createElement('img');
        img.className='cat-bg'; img.alt = btn.querySelector('.label')?.textContent||'';
        img.src='assets/img/common/hero.jpg'; // fallback always visible
        img.loading='lazy'; btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  // BACKGROUND_PHOTOS_V2: enforce full-width background photos
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
    const applyBg = (el,url)=>{
      el.style.setProperty('background-image', `url('${url}')`, 'important');
      el.style.setProperty('background-position', 'center', 'important');
      el.style.setProperty('background-size', 'cover', 'important');
      el.style.setProperty('background-repeat', 'no-repeat', 'important');
    };
    $$('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const q = map[slug(label)] || 'travel,landscape';
      const src = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q));
      const img = new Image();
      img.onload = ()=> applyBg(btn, src);
      img.onerror = ()=> applyBg(btn, 'assets/img/common/hero.jpg');
      img.src = src;
    });
  });

})();

// ===== Helpers =====
const $ = (s,el=document)=>el.querySelector(s);
const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

// ===== Replace category icons with photo thumbnails =====
(function(){
  const photoMap = {
    'mare':'beach,sea,coast','montagna':'mountain,alps,peak','lago':'lake,alpine lake','isole':'tropical island,lagoon',
    'cultura':'museum,old town','relax':'spa,resort','citta':'city skyline,europe city','safari':'safari,africa',
    'esotici':'tropical,paradise beach','natura':'forest,nature','destinazioni-popolari':'landmark,iconic',
    'fuga-romantica':'romantic,couple','anniversario':'romantic dinner,city night','luna-di-miele':'honeymoon,overwater',
    'addio-celibato':'party,nightlife','capodanno-caldo':'fireworks,beach','premium':'luxury,resort','luxury':'luxury,resort',
    'estate':'summer,beach','primavera':'spring,flowers','autunno':'autumn,foliage','inverno':'winter,snow',
    'snowboard':'snowboard,freeride','sci':'ski,skiing','trekking':'hiking,trail','arrampicata':'rock climbing,climber',
    'ciclismo':'cycling,road bike','surf':'surf,wave','immersioni':'scuba diving,reef','snorkeling':'snorkeling,reef','golf':'golf course'
  };
  const slugify = (s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  $$('.accordion-toggle.category').forEach(btn=>{
    if(!btn.querySelector('img.cat-bg')){
      const label = btn.querySelector('.label')?.textContent || '';
      const slug = slugify(label);
      const q = photoMap[slug] || 'travel,landscape';
      const src = `https://source.unsplash.com/1600x420/?${encodeURIComponent(q)}`;
      const img = document.createElement('img');
      img.className = 'cat-bg'; img.alt = label; img.loading = 'lazy';
      img.src = src;
      btn.insertBefore(img, btn.firstChild);
    }
  });
  // OFFLINE_CAT_PHOTOS: always-visible local thumbnails for categories
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      if(!btn.querySelector('img.cat-bg')){
        const img=document.createElement('img');
        img.className='cat-bg'; img.alt = btn.querySelector('.label')?.textContent||'';
        img.src='assets/img/common/hero.jpg'; // fallback always visible
        img.loading='lazy'; btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  // BACKGROUND_PHOTOS_V2: enforce full-width background photos
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
    const applyBg = (el,url)=>{
      el.style.setProperty('background-image', `url('${url}')`, 'important');
      el.style.setProperty('background-position', 'center', 'important');
      el.style.setProperty('background-size', 'cover', 'important');
      el.style.setProperty('background-repeat', 'no-repeat', 'important');
    };
    $$('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const q = map[slug(label)] || 'travel,landscape';
      const src = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q));
      const img = new Image();
      img.onload = ()=> applyBg(btn, src);
      img.onerror = ()=> applyBg(btn, 'assets/img/common/hero.jpg');
      img.src = src;
    });
  });

})();

// ===== Destination modal content =====
(function(){
  const modal = $('#destination-modal');
  if(!modal) return;
  const modalBackdrop = $('.modal-backdrop', modal);
  const modalDialog = $('.modal-dialog', modal);
  const titleEl = $('#dest-title', modal);
  const descEl = $('.dest-desc', modal);
  const hiEl = $('.dest-highlights', modal);
  const bonusEl = $('.dest-bonus', modal);

  function openModal(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function closeModal(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  $$('[data-close]', modal).forEach(el=> el.addEventListener('click', closeModal));
  if(modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

  function catchyTagline(category, city){
    const base = (category||'').toLowerCase();
    const map = {
      mare: 'spiagge da cartolina e tramonti 🔆', montagna: 'tra vette, rifugi e cieli limpidi 🏔️',
      lago: 'specchi d’acqua e passeggiate romantiche 🌅', isole: 'sabbia fine e ritmi lenti 🏝️',
      cultura: 'musei, quartieri creativi e sapori locali 🖼️', relax: 'giorni lenti, spa e silenzio 😌',
      citta: 'musei, rooftop e quartieri iconici 🏙️', safari: 'grandi spazi e tramonti infuocati 🐾',
      esotici: 'colori vividi e profumi tropicali 🌺', natura: 'boschi, cascate e aria buona 🌿',
      surf: 'onde perfette e chill vibes 🏄', immersioni: 'fondali colorati e acque trasparenti 🤿',
      snorkeling: 'pesci tropicali a due bracciate 🐠', trekking: 'sentieri panoramici e rifugi caldi 🥾',
      arrampicata: 'falesie leggendarie e aderenza 🔗', sci: 'neve curata e rifugi golosi 🎿',
      snowboard: 'powder e linee creative 🏂', ciclismo: 'salite epiche e strade panoramiche 🚴‍♂️',
      golf: 'fairway curati e tee time perfetti ⛳️'
    };
    const t = map[base] || 'storie, sapori e panorami ✨';
    return `${city} — ${t}`;
  }

  function longDescription(city, category){
    const themes = {
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
    const c = (category||'').toLowerCase();
    const key = c.includes('mare')?'mare':(c.includes('montagna')?'montagna':(c.includes('citt')?'citta':'default'));
    return themes[key].join(' ');
  }

  function strongBonuses(category){
    const c = (category||'').toLowerCase();
    if(c.includes('mare')||c.includes('isole')||c.includes('snorkeling')) 
      return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
    if(c.includes('montagna')||c.includes('trekking')||c.includes('arrampicata'))
      return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato (trasporto incluso).';
    if(c.includes('citta')||c.includes('cultura'))
      return '🎁 Bonus: pass salta‑fila ai 2 musei più richiesti + drink su un rooftop panoramico.';
    if(c.includes('surf'))
      return '🎁 Bonus: session all’alba con coach locale e foto professionali della tua surfata.';
    if(c.includes('sci')||c.includes('snow'))
      return '🎁 Bonus: ciaspolata al tramonto con aperitivo caldo in baita.';
    return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
  }

  function pick(arr){ return arr[Math.floor(Math.random()*arr.length)]; }

  function buildContent(city, category){
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
      default: [ `${city} è una meta azzeccata per staccare e tornare pieni di energia.` ]
    };
    const highlightsMap = {
      mare: [ 'spiagge turchesi','snorkeling','tramonti pazzeschi','chiringuitos','gite in barca' ],
      montagna: [ 'sentieri panoramici','rifugi tipici','malghe','laghi alpini','cieli stellati' ],
      citta: [ 'centro storico','musei','mercati locali','vista panoramica','rooftop' ],
      surf: [ 'spot per tutti i livelli','scuole e noleggio','acqua tiepida','long ride','tramonti sul mare' ],
      trekking: [ 'creste panoramiche','boschi e torrenti','segnaletica curata','rifugi accoglienti','laghetti' ],
      arrampicata: [ 'falesie attrezzate','aderenza','tiri lunghi','panorami top','multipitch' ],
      snorkeling: [ 'pesci colorati','acqua cristallina','barriera vicina','calette','gufi di mare' ],
      immersioni: [ 'coralli','relitti','acqua limpida','centri diving','macro' ],
      sci: [ 'piste ampie','neve curata','rifugi golosi','après-ski','panorami' ],
      snowboard: [ 'powder','park','linee creative','boschetti','pendii larghi' ],
      ciclismo: [ 'salite epiche','discese veloci','strade panoramiche','bike café','panorami' ],
      golf: [ 'fairway curati','green veloci','clubhouse','lezioni pro','tee time top' ],
      default: [ 'scorci fotogenici','cucina locale','atmosfera rilassata','itinerari facili','gente accogliente' ]
    };

    const c = (category||'').toLowerCase();
    const main = c.includes('mare')?'mare':(c.includes('montagna')?'montagna':(c.includes('citt')?'citta':'default'));
    const desc = longDescription(city, main);
    const hi = (highlightsMap[c] || highlightsMap[main] || highlightsMap.default).slice(0,5);
    const bonus = strongBonuses(c);

    return {desc, highlights: hi, bonus};
  }

  // Per-destination overrides
  function readOverrides(button){
    const d = {};
    if(button.dataset.desc) d.desc = button.dataset.desc;
    if(button.dataset.bonus) d.bonus = button.dataset.bonus;
    if(button.dataset.highlights) d.highlights = button.dataset.highlights.split('|').map(s=>s.trim()).filter(Boolean);
    return d;
  }

  // Bind open to all "Scopri di più"
  const moreBtns = $$('.btn.more, .btn.secondary.more, button.more');
  moreBtns.forEach(b=>{
    b.addEventListener('click', ()=>{
      const card = b.closest('.city-card');
      const city = b.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent||'La destinazione') : 'La destinazione');
      const category = b.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
      let data = buildContent(city, category);
      const o = readOverrides(b); data = {...data, ...o};
      titleEl.textContent = catchyTagline(category, city);
      descEl.textContent = data.desc;
      hiEl.innerHTML = '';
      (data.highlights||[]).forEach(x=>{ const li=document.createElement('li'); li.textContent=x; hiEl.appendChild(li);});
      bonusEl.textContent = data.bonus || '';
      openModal();
    });
  });
  // OFFLINE_CAT_PHOTOS: always-visible local thumbnails for categories
  document.addEventListener('DOMContentLoaded', ()=>{
    document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
      if(!btn.querySelector('img.cat-bg')){
        const img=document.createElement('img');
        img.className='cat-bg'; img.alt = btn.querySelector('.label')?.textContent||'';
        img.src='assets/img/common/hero.jpg'; // fallback always visible
        img.loading='lazy'; btn.insertBefore(img, btn.firstChild);
      }
    });
  });

  // BACKGROUND_PHOTOS_V2: enforce full-width background photos
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
    const applyBg = (el,url)=>{
      el.style.setProperty('background-image', `url('${url}')`, 'important');
      el.style.setProperty('background-position', 'center', 'important');
      el.style.setProperty('background-size', 'cover', 'important');
      el.style.setProperty('background-repeat', 'no-repeat', 'important');
    };
    $$('.accordion-toggle.category').forEach(btn=>{
      const label = btn.querySelector('.label')?.textContent || '';
      const q = map[slug(label)] || 'travel,landscape';
      const src = btn.dataset.photo || ('https://source.unsplash.com/1600x400/?'+encodeURIComponent(q));
      const img = new Image();
      img.onload = ()=> applyBg(btn, src);
      img.onerror = ()=> applyBg(btn, 'assets/img/common/hero.jpg');
      img.src = src;
    });
  });

})();
