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


// =============================
// Site Language + Newsletter
// =============================
(function(){
  'use strict';

  // ------------------------------------------------------------
  // Toast globale (stesso stile dei popup dell’area affiliati)
  // - appare in alto al centro
  // - chiusura manuale (X)
  // - auto-chiusura dopo 5 secondi
  // ------------------------------------------------------------
  function showToast(message, type = 'success') {
    try {
      // One-at-a-time: rimuove eventuali toast già presenti
      document.querySelectorAll('.tva-toast').forEach((t) => t.remove());

      const toast = document.createElement('div');
      toast.className = `tva-toast is-${type}`;
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');

      const inner = document.createElement('div');
      inner.className = 'tva-toast__inner';

      const title = document.createElement('div');
      title.className = 'tva-toast__title';
      if (type === 'error') title.textContent = 'Errore';
      else if (type === 'info') title.textContent = 'Info';
      else title.textContent = 'Operazione completata';

      const msg = document.createElement('div');
      msg.className = 'tva-toast__msg';
      msg.textContent = message;

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'tva-toast__close';
      closeBtn.setAttribute('aria-label', 'Chiudi');
      closeBtn.textContent = '×';

      inner.appendChild(title);
      inner.appendChild(msg);
      inner.appendChild(closeBtn);
      toast.appendChild(inner);
      document.body.appendChild(toast);

      const close = () => {
        toast.classList.remove('is-visible');
        window.setTimeout(() => toast.remove(), 180);
      };

      closeBtn.addEventListener('click', close);

      // Mostra (animazione)
      window.requestAnimationFrame(() => toast.classList.add('is-visible'));

      // Auto-close
      window.setTimeout(close, 5000);

      return true;
    } catch (e) {
      try { alert(message); } catch (_) {}
      return false;
    }
  }

  // Espone globalmente per altri script (es. pagine admin)
  window.TraviraeToast = showToast;

  // --- Language (used for emails + later site i18n)
  const LANG_STORAGE_KEY = 'travirae_email_lang';
  // Fallback when the browser language is not supported.
  // Requirement: if a user's browser is set to an unsupported language -> default to English.
  const LANG_DEFAULT = 'ENG';
  const LANGS = [
    { code: 'ITA', label: 'ITA', htmlLang: 'it' },
    { code: 'ENG', label: 'ENG', htmlLang: 'en' },
    { code: 'ARA', label: 'ARA', htmlLang: 'ar' },
    { code: 'DEU', label: 'DEU', htmlLang: 'de' },
    { code: 'SPA', label: 'SPA', htmlLang: 'es' },
    { code: 'RUS', label: 'RUS', htmlLang: 'ru' },
    { code: 'NLD', label: 'NLD', htmlLang: 'nl' },
    { code: 'ZHO', label: 'ZHO', htmlLang: 'zh' },
    { code: 'FRA', label: 'FRA', htmlLang: 'fr' },
  ];

  function safeGetLS(key){
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function safeSetLS(key, val){
    try { localStorage.setItem(key, val); } catch { /* ignore */ }
  }

  function normalizeLang(code){
    const up = String(code || '').toUpperCase().trim();
    return LANGS.some(l => l.code === up) ? up : LANG_DEFAULT;
  }

  function detectSiteLangFromBrowser(){
    // Use browser language preferences (navigator.languages) to choose the best supported language.
    // We only use the primary tag (e.g. "fr" from "fr-FR").
    try {
      const candidates = [];
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
      if (navigator.language) candidates.push(navigator.language);

      for (const tag of candidates) {
        const base = String(tag || '').toLowerCase().split(/[-_]/)[0];
        if (!base) continue;
        const match = LANGS.find(l => l.htmlLang === base);
        if (match) return match.code;
      }
    } catch (e) {
      // Ignore and fall back to default.
    }
    return LANG_DEFAULT;
  }

  function getSiteLang(){
    const stored = safeGetLS(LANG_STORAGE_KEY);
    if (stored) return normalizeLang(stored);

    const detected = normalizeLang(detectSiteLangFromBrowser());
    // Persist detected language so newsletter + auth emails follow the currently selected site language.
    safeSetLS(LANG_STORAGE_KEY, detected);
    return detected;
  }

  function applyHtmlLang(code){
    const found = LANGS.find(l => l.code === code);
    if (found && document?.documentElement) {
      document.documentElement.setAttribute('lang', found.htmlLang || 'it');
      // Helpful for Arabic (RTL)
      if (found.htmlLang === 'ar') document.documentElement.setAttribute('dir', 'rtl');
      else document.documentElement.setAttribute('dir', 'ltr');
    }
  }

  async function syncUserLangIfLoggedIn(code){
    try {
      const sb = window.supabaseClient;
      if (!sb?.auth) return;
      const { data } = await sb.auth.getSession();
      const session = data?.session;
      if (!session?.user) return;
      // Keep user metadata aligned so Supabase Auth emails can choose the right language.
      await sb.auth.updateUser({ data: { language: code } });
    } catch (e) {
      // Non-blocking
      console.debug('[lang] could not sync user metadata', e);
    }
  }

  // NOTE: user metadata is *not* synced automatically. Affiliates can change email language
  // explicitly from their dashboard ("Cambia Lingua").
  function setSiteLang(code, { persist = true, syncSelect = true, syncUser = false } = {}){
    const normalized = normalizeLang(code);
    if (persist) safeSetLS(LANG_STORAGE_KEY, normalized);
    applyHtmlLang(normalized);

    if (syncSelect) {
      const sel = document.querySelector('#site-lang-select');
      if (sel && sel.value !== normalized) sel.value = normalized;
    }

    if (syncUser) void syncUserLangIfLoggedIn(normalized);

    // Expose for debugging
    window.TRAVIRAE_LANG = normalized;
  }

  // Expose helper for other scripts (e.g. affiliate dashboard)
  window.TraviraeSetSiteLang = function(code, opts){ return setSiteLang(code, opts); };
  window.TraviraeGetSiteLang = function(){ return getSiteLang(); };

  function injectLangSelector(){
    const headerInner = document.querySelector('.site-header .header-inner');
    if (!headerInner) return;
    if (document.querySelector('#site-lang-select')) return;

    const wrap = document.createElement('div');
    wrap.className = 'site-lang';

    const select = document.createElement('select');
    select.id = 'site-lang-select';
    select.className = 'site-lang-select';
    select.setAttribute('aria-label', 'Selettore lingua');

    LANGS.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      select.appendChild(opt);
    });

    select.value = getSiteLang();
    select.addEventListener('change', () => {
      setSiteLang(select.value);
    });

    wrap.appendChild(select);

    const brand = headerInner.querySelector('.brand');
  if (brand) headerInner.insertBefore(wrap, brand);
  else headerInner.insertBefore(wrap, headerInner.firstChild);

    // Apply on first render
    setSiteLang(select.value, { persist: false, syncSelect: false, syncUser: false });
  }

  // --- Newsletter signup (footer form)
  function initNewsletterSignup(){
    const form = document.getElementById('newsletter-form');
    if (!form) return;

    const input = form.querySelector('input[name="newsletter_email"]');
    const btn = form.querySelector('button[type="submit"], button');

    function setBusy(isBusy){
      if (btn) btn.disabled = !!isBusy;
      if (input) input.disabled = !!isBusy;
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = (input ? input.value : '').trim();
      if (!email || !/^\S+@\S+\.\S+$/.test(email)){
        showToast('Inserisci un\'email valida.', 'error');
        return;
      }

      const lang = getSiteLang();
      setBusy(true);

      try{
        // Prefer Supabase functions.invoke when available (more robust across versions)
        // and avoid relying on private/internal URLs like `functions._url`.
        const reqBody = { email, language: lang, source: 'site_footer' };

        if (window.supabaseClient && window.supabaseClient.functions && typeof window.supabaseClient.functions.invoke === 'function') {
          const { data, error } = await window.supabaseClient.functions.invoke('newsletter-subscribe', { body: reqBody });
          if (error) throw error;
        } else {
          // Fallback: direct fetch to Edge Function URL
          const cfg = window.TRAVIRAE_CONFIG || {};
          const supaUrl = String(cfg.SUPABASE_URL || window.TRAVIRAE_SUPABASE_URL || '').replace(/\/$/, '');
          const anonKey = String(cfg.SUPABASE_ANON_KEY || window.TRAVIRAE_SUPABASE_ANON_KEY || '');
          const base = supaUrl ? (supaUrl + '/functions/v1') : '';
          const url = window.TRAVIRAE_NEWSLETTER_SUBSCRIBE_URL || (base ? (base + '/newsletter-subscribe') : '');
          if (!url) throw new Error('Newsletter endpoint non configurato');

          const headers = { 'Content-Type': 'application/json' };
          if (anonKey) {
            headers['apikey'] = anonKey;
            headers['Authorization'] = 'Bearer ' + anonKey;
          }

          const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(reqBody)
          });

          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(payload?.error || payload?.message || ('HTTP ' + res.status));
          }
        }

        if (input) input.value = '';
        showToast('Iscrizione completata! Grazie.', 'success');
      } catch (err){
        showToast('Errore durante iscrizione. Riprova tra poco.', 'error');
        console.error('[newsletter] subscribe error', err);
      } finally {
        setBusy(false);
      }
    });
  }


  // Init (DOM is already loaded because scripts are at the bottom)
  injectLangSelector();
  initNewsletterSignup();

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

  // --- 0) Site traffic (visite totali) ---
  // Registra un pageview su Supabase per calcolare:
  // - Pageview totali
  // - Visite (sessioni) uniche
  // - Traffico da affiliati vs diretto
  function uuidv4Fallback(){
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c){
      var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });
  }

  function getOrCreateStorageId(storage, key){
    try{
      if (!storage) return '';
      var v = storage.getItem(key) || '';
      if (v) return v;
      var id = '';
      try{
        id = (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : uuidv4Fallback();
      }catch(e){
        id = uuidv4Fallback();
      }
      storage.setItem(key, id);
      return id;
    }catch(e){
      return '';
    }
  }

  // visitor_id: persiste tra visite (localStorage). session_id: persiste solo nel tab (sessionStorage).
  var visitorId = getOrCreateStorageId(window.localStorage, 'tva_visitor_id');
  var sessionId = getOrCreateStorageId(window.sessionStorage, 'tva_session_id');

  // session_ref: “sorgente” della sessione (se l'utente è entrato con ?ref=...)
  var sessionRef = '';
  try{
    sessionRef = (window.sessionStorage ? (sessionStorage.getItem('tva_session_ref') || '') : '');
    if (queryRef && !sessionRef){
      sessionRef = queryRef;
      sessionStorage.setItem('tva_session_ref', sessionRef);
    }
  }catch(e){
    sessionRef = queryRef || '';
  }

  async function insertSitePageview(){
    if (!window.supabaseClient || !window.supabaseClient.from) return;

    var payload = {
      session_id: sessionId || uuidv4Fallback(),
      visitor_id: visitorId || uuidv4Fallback(),
      page: window.location.pathname || '/',
      ref_affiliate_slug: sessionRef ? sessionRef : null,
      referrer: (document && document.referrer) ? document.referrer : null,
      user_agent: (navigator && navigator.userAgent) ? navigator.userAgent : null
    };

    try{
      // Best effort: se alcune colonne non esistono (es. referrer/user_agent), ritenta con payload minimo.
      var res = await window.supabaseClient.from('site_pageviews').insert(payload);
      if (res && res.error){
        var minPayload = {
          session_id: payload.session_id,
          visitor_id: payload.visitor_id,
          page: payload.page,
          ref_affiliate_slug: payload.ref_affiliate_slug
        };
        await window.supabaseClient.from('site_pageviews').insert(minPayload);
      }
    }catch(e){}
  }

  // Logga sempre il pageview (anche senza ref)
  insertSitePageview();

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

      // Per la colonna affiliate_slug usiamo SEMPRE l'ID attribuito (cookie/localStorage) se presente,
      // altrimenti 'direct'. Questo rende l'attribuzione coerente con la finestra (es. 30 giorni).
      var id = '';
      try { id = (window.traviraeAffiliate.getId && window.traviraeAffiliate.getId()) ? String(window.traviraeAffiliate.getId()).trim() : ''; } catch(eId) { id = ''; }
      if (!id) id = 'direct';

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

      var payload = {
        affiliate_slug: id,
        partner: partner,
        status: 'click',
        booked_at: new Date().toISOString(),
        currency: 'USD',
        metadata: {
          page: (window.location && window.location.pathname) ? window.location.pathname : '/',
          referrer: document.referrer || null,
          // info debug utili:
          session_ref: (sessionRef && String(sessionRef).trim()) ? String(sessionRef).trim() : null,
          query_ref: (queryRef && String(queryRef).trim()) ? String(queryRef).trim() : null
        }
      };

      // IMPORTANTISSIMO (fix mobile/incognito): quando il click apre subito una pagina esterna
      // nello stesso tab, alcune richieste fetch "normali" vengono annullate.
      // Usiamo quindi una POST REST con keepalive=true.
      try {
        var cfg = window.TRAVIRAE_CONFIG || {};
        var supaUrl = String(cfg.SUPABASE_URL || window.TRAVIRAE_SUPABASE_URL || '').replace(/\/$/, '');
        var anonKey = String(cfg.SUPABASE_ANON_KEY || window.TRAVIRAE_SUPABASE_ANON_KEY || '');
        if (supaUrl && anonKey && typeof fetch === 'function') {
          fetch(supaUrl + '/rest/v1/bookings', {
            method: 'POST',
            mode: 'cors',
            keepalive: true,
            headers: {
              'Content-Type': 'application/json',
              'apikey': anonKey,
              'Authorization': 'Bearer ' + anonKey,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify(payload)
          }).then(function(res){
            if (!res || !res.ok) {
              // Best effort log (non bloccare UX)
              try {
                res.json().then(function(j){
                  if (window.console && console.error) console.error('Travirae: errore REST insert bookings (booking click)', j);
                }).catch(function(){
                  if (window.console && console.error) console.error('Travirae: errore REST insert bookings (booking click)', res && res.status);
                });
              } catch(eJson){
                if (window.console && console.error) console.error('Travirae: errore REST insert bookings (booking click)', res && res.status);
              }
            } else {
              if (window.console && console.log) console.log('Travirae: booking click registrato', payload);
            }
          }).catch(function(err){
            if (window.console && console.error) console.error('Travirae: errore REST insert bookings (booking click)', err);
            // Fallback (meno affidabile su unload): supabase-js
            try {
              if (window.supabaseClient && window.supabaseClient.from) {
                window.supabaseClient.from('bookings').insert(payload);
              }
            } catch(e2){}
          });
          return;
        }
      } catch(eRest) {}

      // Fallback: usa supabase-js se fetch keepalive non è disponibile
      if (!window.supabaseClient || !window.supabaseClient.from){
        if (window.console && console.warn) console.warn('Travirae: trackBookingClick chiamato ma supabaseClient non disponibile');
        return;
      }

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

  // -----------------------------------------------------------------------------
  // UI helper: mostra/nascondi password (icona "occhio") su tutti gli input password
  // -----------------------------------------------------------------------------
  function initPasswordToggles() {
    var eyeSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"></path>' +
      '<circle cx="12" cy="12" r="3"></circle>' +
      '</svg>';

    var eyeOffSvg =
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
      'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94"></path>' +
      '<path d="M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.13 3.19"></path>' +
      '<path d="M1 1l22 22"></path>' +
      '</svg>';

    function addToggle(input) {
      try {
        if (!input || input.dataset.pwToggle === '1') return;
        if (String(input.getAttribute('type') || '').toLowerCase() !== 'password') return;

        input.dataset.pwToggle = '1';

        var parent = input.parentElement;
        if (!parent) return;

        // Evita di wrappare due volte se il markup cambia
        if (parent.classList && parent.classList.contains('password-input-wrap')) return;

        var wrapper = document.createElement('div');
        wrapper.className = 'password-input-wrap';

        parent.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        input.classList.add('password-with-toggle');

        // Usiamo un <span role="button"> per evitare lo stile globale su <button>
        // (che nel sito forza background blu e hover con "saltello").
        var btn = document.createElement('span');
        btn.className = 'password-toggle';
        btn.setAttribute('role', 'button');
        btn.setAttribute('tabindex', '0');
        btn.setAttribute('aria-label', 'Mostra password');
        btn.innerHTML = eyeSvg;

        function togglePassword(){
          var isHidden = input.type === 'password';
          input.type = isHidden ? 'text' : 'password';
          btn.innerHTML = isHidden ? eyeOffSvg : eyeSvg;
          btn.setAttribute('aria-label', isHidden ? 'Nascondi password' : 'Mostra password');
          try { input.focus({ preventScroll: true }); } catch (e) {}
        }

        btn.addEventListener('click', function (e) {
          if (e && e.preventDefault) e.preventDefault();
          togglePassword();
        });
        btn.addEventListener('keydown', function(e){
          var k = e && e.key;
          if (k === 'Enter' || k === ' ') {
            if (e && e.preventDefault) e.preventDefault();
            togglePassword();
          }
        });

        wrapper.appendChild(btn);
      } catch (e) {
        // no-op
      }
    }

    function enhance() {
      try {
        var inputs = document.querySelectorAll('input[type="password"]');
        if (!inputs || !inputs.length) return;
        for (var i = 0; i < inputs.length; i++) addToggle(inputs[i]);
      } catch (e) {
        // no-op
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', enhance);
    } else {
      enhance();
    }
  }

  initPasswordToggles();

})();

