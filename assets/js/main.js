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

// ===== Background photos for category bars (Unsplash)
(function(){
  function slug(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');}
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
  function applyBG(){
  document.querySelectorAll('.accordion-toggle.category').forEach(btn=>{
    const label = btn.querySelector('.label')?.textContent || '';
    const s = slug(label);
    const qmap = {
      mare:'beach,tropical,blue water',
      montagna:'mountain,alps',
      lago:'lake,alpine lake',
      isole:'island,tropical',
      cultura:'culture,city old town',
      relax:'spa,resort',
      'città':'city skyline',
      safari:'safari,africa wildlife',
      esotici:'tropical,exotic island',
      natura:'nature,landscape',
      'destinazioni-popolari':'famous landmarks',
      'fuga-romantica':'romantic getaway,couple',
      anniversario:'romantic dinner,hotel',
      'luna-di-miele':'honeymoon,overwater villa',
      'addio-celibato':'party,nightlife',
      'capodanno-caldo':'new year,beach fireworks',
      premium:'luxury,resort',
      luxury:'luxury,resort',
      estate:'summer,beach',
      primavera:'spring,flowers',
      autunno:'autumn,foliage',
      inverno:'winter,snow',
      snowboard:'snowboard,freeride',
      sci:'ski,alps',
      trekking:'hiking,trail',
      arrampicata:'rock climbing',
      ciclismo:'cycling,road bike',
      surf:'surf,wave',
      immersioni:'scuba diving,reef',
      snorkeling:'snorkeling,reef',
      golf:'golf course'
    };
    const query = qmap[s] || 'travel,landscape';
    const local = 'assets/img/categories/' + s + '.jpg';
    const unsplash = 'https://source.unsplash.com/1600x400/?' + encodeURIComponent(query);
    const explicit = btn.dataset.photo;

    function setBG(url){ btn.style.backgroundImage = 'url(\"'+url+'\")'; }
    function tryURL(url, onfail){
      const test = new Image();
      test.onload = ()=> setBG(url);
      test.onerror = onfail;
      test.src = url;
    }
    // Priority: explicit data-photo -> local -> unsplash -> fallback
    if(explicit){ tryURL(explicit, ()=>tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)')))); }
    else { tryURL(local, ()=>tryURL(unsplash, ()=>setBG('linear-gradient(120deg,#e8edff,#efe8ff)'))); }
  });
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', applyBG);
else applyBG();
})();

// === Travirae affiliate tracking (landing click + ?ref propagation + booking helper) ===
(function(){
  if (typeof window === 'undefined') return;

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
      document.cookie = name + '=' + encodeURIComponent(value || '') + expires + '; path=/';
    }catch(e){}
  }

  function sanitizeRef(raw){
    if (!raw) return '';
    var str = String(raw).trim();
    var m = str.match(/[a-zA-Z0-9_-]+/g);
    if (!m) return '';
    return m.join('');
  }

  function readQueryRef(){
    try{
      var qs = window.location.search || '';
      if (!qs) return '';
      var params = new URLSearchParams(qs);
      return sanitizeRef(params.get('ref'));
    }catch(e){
      return '';
    }
  }

  function getStoredAffiliate(){
    var v = '';
    try{
      v = window.localStorage ? (localStorage.getItem('tva_aff') || '') : '';
    }catch(e){}
    if (!v) v = getCookie('tva_aff') || '';
    return sanitizeRef(v);
  }

  function storeAffiliate(id){
    if (!id) return;
    try{
      if (window.localStorage) localStorage.setItem('tva_aff', id);
    }catch(e){}
    setCookie('tva_aff', id, 30);
  }

  function hasTrackedLanding(id){
    if (!id) return false;
    var v = '';
    try{
      if (window.localStorage) v = localStorage.getItem('tva_aff_tracked') || '';
    }catch(e){}
    if (!v) v = getCookie('tva_aff_tracked') || '';
    return v === id;
  }

  function markLandingTracked(id){
    if (!id) return;
    try{
      if (window.localStorage) localStorage.setItem('tva_aff_tracked', id);
    }catch(e){}
    setCookie('tva_aff_tracked', id, 30);
  }

  var queryRef = readQueryRef();
  if (queryRef){
    storeAffiliate(queryRef);
  }
  var affiliateId = queryRef || getStoredAffiliate();

  // Esponi helper globale
  window.traviraeAffiliate = window.traviraeAffiliate || {};
  window.traviraeAffiliate.getId = function(){
    return affiliateId || getStoredAffiliate() || '';
  };

  // Landing click: viene contato UNA volta per browser per Affiliate ID
  function logLandingClick(id){
    if (!id) return;
    if (hasTrackedLanding(id)) return;
    if (!window.supabaseClient || !window.supabaseClient.from) return;
    try{
      window.supabaseClient
        .from('affiliate_clicks')
        .insert({
          affiliate_slug: id,
          page: window.location.pathname || '/'
        })
        .then(function(res){
          if (res && res.error && window.console && console.warn){
            console.warn('Travirae: errore insert affiliate_clicks', res.error);
          }
        })
        .catch(function(err){
          if (window.console && console.warn) console.warn('Travirae: errore registrazione click affiliato', err);
        });
      markLandingTracked(id);
    }catch(e){
      if (window.console && console.warn) console.warn('Travirae: errore imprevisto tracking click affiliato', e);
    }
  }

  if (queryRef && affiliateId){
    logLandingClick(affiliateId);
  }

  // Decorazione link interni con ?ref=ID
  function isInternalLink(href){
    if (!href) return false;
    if (href.indexOf('mailto:') === 0 || href.indexOf('tel:') === 0 || href.indexOf('javascript:') === 0) return false;
    if (href.indexOf('#') === 0) return false;
    if (/^https?:\/\//i.test(href)){
      try{
        var url = new URL(href);
        return url.hostname === window.location.hostname;
      }catch(e){
        return false;
      }
    }
    return true;
  }

  function decorateInternalLinks(id){
    if (!id) return;
    try{
      var links = document.querySelectorAll('a[href]');
      links.forEach(function(a){
        var href = a.getAttribute('href');
        if (!isInternalLink(href)) return;
        try{
          var url;
          if (/^https?:\/\//i.test(href)){
            url = new URL(href);
          }else{
            url = new URL(href, window.location.origin);
          }
          if (url.searchParams.has('ref')) return;
          url.searchParams.set('ref', id);
          var newHref;
          if (/^https?:\/\//i.test(href)){
            newHref = url.toString();
          }else{
            newHref = url.pathname + url.search + url.hash;
          }
          a.setAttribute('href', newHref);
        }catch(e){}
      });
    }catch(e){
      if (window.console && console.warn) console.warn('Travirae: errore decorazione link affiliate', e);
    }
  }

  if (affiliateId){
    if (document.readyState === 'loading'){
      document.addEventListener('DOMContentLoaded', function(){ decorateInternalLinks(affiliateId); });
    }else{
      decorateInternalLinks(affiliateId);
    }
  }

  // Helper booking click -> inserisce una riga in `bookings` con status = 'click'
  window.traviraeAffiliate.trackBookingClick = function(partner){
    try{
      var id = window.traviraeAffiliate.getId();
      partner = partner || 'unknown';
      if (!id || !window.supabaseClient || !window.supabaseClient.from) return;
      var payload = {
        affiliate_slug: id,
        partner: partner,
        status: 'click',
        booked_at: new Date().toISOString()
      };
      window.supabaseClient
        .from('bookings')
        .insert(payload)
        .then(function(res){
          if (res && res.error && window.console && console.warn){
            console.warn('Travirae: errore insert bookings (booking click)', res.error);
          }else if (window.console && console.log){
            console.log('Travirae: booking click registrato', payload);
          }
        })
        .catch(function(err){
          if (window.console && console.warn) console.warn('Travirae: errore registrazione booking click', err);
        });
    }catch(e){
      if (window.console && console.warn) console.warn('Travirae: errore imprevisto trackBookingClick', e);
    }
  };

})();
