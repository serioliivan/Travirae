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
      mainNav.classList.toggle('is-open', !expanded);
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  
  // Global accordion behavior: only one open item at a time across ALL groups
  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
        const wasOpen = item.classList.contains('open');
        // Close ALL open items across the page (any group/nicchia)
        $$('.accordion-item.open').forEach(i=>{
          i.classList.remove('open');
          const b = $('.accordion-toggle', i);
          const p = $('.accordion-panel', i);
          if(b) b.setAttribute('aria-expanded','false');
          if(p) p.hidden = true;
        });
        // Toggle current: if it was not open, open it now (single open globally)
        if(!wasOpen){
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
})();


// Helpers
function sanitizePopupTitles(root=document){
  const sels = [
    '.modal .modal-title','[role="dialog"] h1','[role="dialog"] h2','[role="dialog"] h3',
    '.popup h1','.popup h2','.popup h3','.dialog-title','.popup-title'
  ];
  sels.forEach(sel => {
    root.querySelectorAll(sel).forEach(el=>{
      if(typeof stripEmojis==='function'){ el.textContent = stripEmojis(el.textContent||''); }
    });
  });
}
document.addEventListener('DOMContentLoaded', ()=>{
  try{ sanitizePopupTitles(); }catch(e){}
  try{
    const mo = new MutationObserver(muts=>{
      muts.forEach(m=> m.addedNodes && m.addedNodes.forEach(n=>{
        if(n.nodeType===1) sanitizePopupTitles(n);
      }));
    });
    mo.observe(document.documentElement,{childList:true,subtree:true});
  }catch(e){}
});

// Remove emoji characters (general ranges)
function stripEmojis(str){
  if(!str) return str;
  return String(str)
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/[\u{1F900}-\u{1F9FF}]/gu,'')
    .replace(/[\u2600-\u27BF]/g,'')
    .replace(/[\u{FE0F}]/gu,'');
}

const $ = (sel, root=document)=> root.querySelector(sel);
const $$ = (sel, root=document)=> Array.from(root.querySelectorAll(sel));

// ===== Catchy content for modal =====
function catchyTagline(category, city){
  const base = (category||'').toLowerCase();
  const map = {
    mare:'spiagge da cartolina e tramonti 🔆',
    montagna:'tra vette, rifugi e cieli limpidi 🏔️',
    citta:'musei, rooftop e quartieri iconici 🏙️',
    surf:'onde perfette e chill vibes 🏄',
    golf:'fairway curati e tee time perfetti ⛳️'
  };
  const t = map[Object.keys(map).find(k=>base.includes(k))] || 'storie, sapori e panorami ✨';
  return `${city} — ${t}`;
}

function longDescription(city, category){
  const c = (category||'').toLowerCase();
  if(c.includes('mare')) return `${city} profuma di salsedine e libertà: mattine lente, sabbia setosa e acqua cristallina. A pranzo ti aspettano chioschi sul mare e piatti di pesce freschissimi. Il pomeriggio scorre tra calette nascoste e passeggiate sul lungomare. E al tramonto? Colori intensi e cocktail vista orizzonte.`;
  if(c.includes('montagna')) return `A ${city} la montagna è un invito a respirare meglio e guardare lontano. Tra boschi profumati e torrenti, i sentieri conducono a rifugi di legno e pietra. Le giornate scorrono tra escursioni, panorami infiniti e pranzi genuini. La sera il cielo si riempie di stelle e il silenzio fa da colonna sonora.`;
  if(c.includes('citt')) return `${city} sorprende a ogni angolo: musei, gallerie, street food e architetture iconiche. Tra quartieri creativi e rooftop con vista, è la meta ideale per chi ama scoprire e fotografare.`;
  return `${city} è una fuga che riconcilia: luoghi belli, gente accogliente e tempi rilassati. Fra passeggiate, scoperte e piccole sorprese, la voglia di restare cresce.`;
}

function strongBonuses(category){
  const c= (category||'').toLowerCase();
  if(c.includes('mare')||c.includes('isole')||c.includes('snork')) return '🎁 Bonus: tour in barca al tramonto con snorkeling in una caletta segreta (+ drink a bordo).';
  if(c.includes('montagna')||c.includes('trek')||c.includes('arramp')) return '🎁 Bonus: cena in rifugio con rientro sotto il cielo stellato.';
  if(c.includes('citt')) return '🎁 Bonus: pass salta‑fila a 2 musei + drink su un rooftop panoramico.';
  if(c.includes('surf')) return '🎁 Bonus: session all’alba con coach locale e foto professionali.';
  if(c.includes('golf')) return '🎁 Bonus: tee time al mattino con green veloci garantiti.';
  return '🎁 Bonus: esperienza sorpresa curata dal nostro team locale – zero sbatti, solo wow.';
}

// ===== Open/close modal and delegate clicks on "Scopri di più"
(function(){
  const modal = document.getElementById('destination-modal');
  if(!modal) return;
  const titleEl = modal.querySelector('#dest-title');
  const descEl = modal.querySelector('.dest-desc');
  const hiEl   = modal.querySelector('.dest-highlights');
  const bonusEl= modal.querySelector('.dest-bonus');

  function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  modal.querySelectorAll('[data-close]').forEach(x=> x.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  document.addEventListener('click', (ev)=>{
    const trg = ev.target.closest('.more'); if(!trg) return;
    ev.preventDefault();
    const card = trg.closest('.city-card');
    const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent || 'La destinazione') : 'La destinazione');
    const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';
    titleEl.textContent = stripEmojis(city);
    descEl.textContent = (trg.dataset.desc || longDescription(city, category));
    hiEl.innerHTML = '';
    (trg.dataset.highlights ? trg.dataset.highlights.split('|') : ['scorci fotogenici','cucina locale','atmosfera rilassata','passeggiate al tramonto']).forEach(x=>{
      const li = document.createElement('li'); li.textContent = x.trim(); hiEl.appendChild(li);
    });
    bonusEl.textContent = trg.dataset.bonus || strongBonuses(category);
    open();
  });
})();

// === Travirae affiliate tracking (global ?ref + affiliate_clicks + booking helper) ===
(function(){
  if (typeof window === 'undefined') return;

  // --- Cookie helpers ---
  function getCookie(name){
    try{
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
      return m ? decodeURIComponent(m[1] || '') : '';
    }catch(e){
      return '';
    }
  }

  function setCookie(name, value, days){
    try{
      var expires = '';
      if (typeof days === 'number'){
        var d = new Date();
        d.setTime(d.getTime() + days*24*60*60*1000);
        expires = '; expires=' + d.toUTCString();
      }
      // path=/ richiesto
      document.cookie = name + '=' + encodeURIComponent(value || '') + expires + '; path=/; samesite=lax';
    }catch(e){}
  }

  // --- Sanitization: solo [a-zA-Z0-9_-] ---
  function sanitizeRef(raw){
    if (!raw) return '';
    return String(raw).trim().replace(/[^a-zA-Z0-9_-]/g, '');
  }

  function readQueryRef(){
    try{
      var params = new URLSearchParams(window.location.search || '');
      return sanitizeRef(params.get('ref'));
    }catch(e){
      return '';
    }
  }

  function getStoredAffiliate(){
    var v = '';
    try{
      v = (window.localStorage ? (localStorage.getItem('tva_aff') || '') : '');
    }catch(e){}
    if (!v) v = getCookie('tva_aff') || '';
    return sanitizeRef(v);
  }

  function storeAffiliate(id){
    if (!id) return;
    // Cookie 30 giorni + localStorage (se disponibile)
    setCookie('tva_aff', id, 30);
    try{
      if (window.localStorage) localStorage.setItem('tva_aff', id);
    }catch(e){}
  }

  // --- Bootstrap affiliate id ---
  var queryRef = readQueryRef();
  if (queryRef){
    storeAffiliate(queryRef);
  }
  var affiliateId = queryRef || getStoredAffiliate();

  // --- Helper pubblico richiesto ---
  window.traviraeAffiliate = window.traviraeAffiliate || {};
  window.traviraeAffiliate.getId = function(){
    return affiliateId || getStoredAffiliate() || '';
  };

  // --- 2) Click totali: 1 evento per sessione/pagina quando si entra con ?ref=SLUG ---
  function safeKeyPart(str){
    return String(str || '').replace(/[^a-zA-Z0-9_-]/g, '_');
  }

  function hasSessionLandingLogged(slug, path){
    try{
      if (!window.sessionStorage) return false;
      var key = 'tva_landing_logged_' + safeKeyPart(slug) + '_' + safeKeyPart(path);
      return sessionStorage.getItem(key) === '1';
    }catch(e){
      return false;
    }
  }

  function markSessionLandingLogged(slug, path){
    try{
      if (!window.sessionStorage) return;
      var key = 'tva_landing_logged_' + safeKeyPart(slug) + '_' + safeKeyPart(path);
      sessionStorage.setItem(key, '1');
    }catch(e){}
  }

  async function insertAffiliateClick(slug){
    if (!slug) return;

    if (!window.supabaseClient || !window.supabaseClient.from){
      if (window.console && console.warn) console.warn('Travirae: supabaseClient non disponibile per affiliate_clicks');
      return;
    }

    var basePayload = {
      affiliate_slug: slug,
      page: window.location.pathname || '/'
    };

    // Aggiungi user_agent se la colonna esiste; altrimenti evita (fallback su errore colonna)
    var ua = '';
    try{ ua = (navigator && navigator.userAgent) ? navigator.userAgent : ''; }catch(e){ ua=''; }
    var payloadWithUA = Object.assign({}, basePayload, { user_agent: ua });

    try{
      var res = await window.supabaseClient.from('affiliate_clicks').insert(payloadWithUA);
      if (res && res.error){
        var msg = ((res.error.message || '') + ' ' + (res.error.details || '') + ' ' + (res.error.hint || '')).toLowerCase();
        var isMissingUserAgentCol = (res.error.code === '42703') || msg.indexOf('user_agent') !== -1 || msg.indexOf('user agent') !== -1;
        if (isMissingUserAgentCol){
          res = await window.supabaseClient.from('affiliate_clicks').insert(basePayload);
        }
      }

      if (res && res.error){
        if (window.console && console.error) console.error('Travirae: errore insert affiliate_clicks', res.error);
      }else{
        if (window.console && console.log) console.log('Travirae: landing affiliato registrata', basePayload);
      }
    }catch(err){
      if (window.console && console.error) console.error('Travirae: errore insert affiliate_clicks', err);
    }
  }

  // Logga SOLO se l'utente è entrato con ?ref (non da cookie/localStorage)
  if (queryRef){
    var p = window.location.pathname || '/';
    if (!hasSessionLandingLogged(queryRef, p)){
      markSessionLandingLogged(queryRef, p);
      insertAffiliateClick(queryRef);
    }
  }

  // --- 4) Booking totali: helper per inserire click verso partner ---
  window.traviraeAffiliate.trackBookingClick = function(partner){
    try{
      partner = partner || 'unknown';
      var id = window.traviraeAffiliate.getId();

      // Anti-doppio conteggio: su widget/iframe possono arrivare 2 trigger ravvicinati
      // (es. overlay + click interno, oppure pointerdown + click). Deduplica su finestra breve.
      try {
        if (window.sessionStorage) {
          var page = (window.location && window.location.pathname) ? window.location.pathname : '/';
          var guardKey = 'tva_booking_guard_' + safeKeyPart(id) + '_' + safeKeyPart(partner) + '_' + safeKeyPart(page);
          var now = Date.now();
          var last = parseInt(sessionStorage.getItem(guardKey) || '0', 10);
          // Se un booking click per stesso partner/pagina arriva entro 1200ms, ignora il duplicato.
          if (last && (now - last) < 1200) {
            if (window.console && console.log) console.log('Travirae: booking click duplicato ignorato', { partner: partner, page: page });
            return;
          }
          sessionStorage.setItem(guardKey, String(now));
        }
      } catch(eGuard) {}

      if (!id){
        if (window.console && console.warn) console.warn('Travirae: trackBookingClick chiamato ma Affiliate ID mancante per partner', partner);
        return;
      }
      if (!window.supabaseClient || !window.supabaseClient.from){
        if (window.console && console.warn) console.warn('Travirae: trackBookingClick chiamato ma supabaseClient non disponibile');
        return;
      }

      var payload = {
        affiliate_slug: id,
        partner: partner,
        status: 'click',
        booked_at: new Date().toISOString(),
        currency: 'USD'
      };

      window.supabaseClient
        .from('bookings')
        .insert(payload)
        .then(function(res){
          if (res && res.error){
            if (window.console && console.error) console.error('Travirae: errore insert bookings (booking click)', res.error);
          }else{
            if (window.console && console.log) console.log('Travirae: booking click registrato', payload);
          }
        })
        .catch(function(err){
          if (window.console && console.error) console.error('Travirae: errore insert bookings (booking click)', err);
        });
    }catch(e){
      if (window.console && console.error) console.error('Travirae: errore insert bookings (booking click)', e);
    }
  };
})();

