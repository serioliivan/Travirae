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
      const lang = (function(){
        try { return String(window.TRAVIRAE_LANG || localStorage.getItem('travirae_site_lang') || '').toUpperCase(); }
        catch (e) { return String(window.TRAVIRAE_LANG || '').toUpperCase(); }
      })();
      const isDE = lang === 'DEU';
      const isEN = lang === 'ENG';
      const isFR = lang === 'FRA';
      const isES = lang === 'SPA';
      const isRU = lang === 'RUS';
      const isAR = lang === 'ARA';
      const isNL = lang === 'NLD';
      const isZH = lang === 'ZHO';
      const parts = [];
      if(from && to) parts.push(isDE ? `Flug von ${from} nach ${to}` : (isEN ? `Flight from ${from} to ${to}` : (isFR ? `Vol de ${from} à ${to}` : (isES ? `Vuelo de ${from} a ${to}` : (isRU ? `Рейс из ${from} в ${to}` : (isAR ? `رحلة من ${from} إلى ${to}` : (isNL ? `Vlucht van ${from} naar ${to}` : (isZH ? `从${from}飞往${to}的航班` : `volo da ${from} a ${to}`))))))));
      if(d1) parts.push(isDE ? `Abflug ${d1}` : (isEN ? `Departure ${d1}` : (isFR ? `Départ ${d1}` : (isES ? `Salida ${d1}` : (isRU ? `Вылет ${d1}` : (isAR ? `المغادرة ${d1}` : (isNL ? `Vertrek ${d1}` : (isZH ? `出发 ${d1}` : `partenza ${d1}`))))))));
      if(d2) parts.push(isDE ? `Rückflug ${d2}` : (isEN ? `Return ${d2}` : (isFR ? `Retour ${d2}` : (isES ? `Regreso ${d2}` : (isRU ? `Обратный рейс ${d2}` : (isAR ? `العودة ${d2}` : (isNL ? `Retour ${d2}` : (isZH ? `返程 ${d2}` : `ritorno ${d2}`))))))));
      parts.push(isDE ? `${adults} Erwachsene ${cabin}` : (isEN ? `${adults} adults ${cabin}` : (isFR ? `${adults} adultes ${cabin}` : (isES ? `${adults} adultos ${cabin}` : (isRU ? `${adults} взрослых ${cabin}` : (isAR ? `${adults} بالغين ${cabin}` : (isNL ? `${adults} volwassenen ${cabin}` : (isZH ? `${adults} 位成人 ${cabin}` : `${adults} adulti ${cabin}`))))))));
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' ')) + (isDE ? '&hl=de' : (isEN ? '&hl=en' : (isFR ? '&hl=fr' : (isES ? '&hl=es' : (isRU ? '&hl=ru' : (isAR ? '&hl=ar' : (isNL ? '&hl=nl' : '&hl=it')))))));
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
      // i18n: German ONLY when site language is DEU
      const uiLang = (function(){
        try { return String(window.TRAVIRAE_LANG || localStorage.getItem('travirae_site_lang') || '').toUpperCase(); }
        catch (e) { return String(window.TRAVIRAE_LANG || '').toUpperCase(); }
      })();
      const isDE = uiLang === 'DEU';
      const isEN = uiLang === 'ENG';
      const isFR = uiLang === 'FRA';
      const isES = uiLang === 'SPA';
      const isRU = uiLang === 'RUS';
      const isAR = uiLang === 'ARA';
      const isNL = uiLang === 'NLD';
      const isZH = uiLang === 'ZHO';

      if (type === 'error') title.textContent = isDE ? 'Fehler' : (isEN ? 'Error' : (isFR ? 'Erreur' : (isES ? 'Error' : (isNL ? 'Fout' : (isAR ? 'خطأ' : (isRU ? 'Ошибка' : (isZH ? '错误' : 'Errore')))))));
      else if (type === 'info') title.textContent = isRU ? 'Информация' : (isAR ? 'معلومات' : (isZH ? '信息' : 'Info'));
      else title.textContent = isDE ? 'Erfolgreich' : (isEN ? 'Success' : (isFR ? 'Succès' : (isES ? 'Éxito' : (isNL ? 'Succes' : (isAR ? 'تم بنجاح' : (isRU ? 'Успешно' : (isZH ? '成功' : 'Operazione completata')))))));

      const msg = document.createElement('div');
      msg.className = 'tva-toast__msg';
      msg.textContent = message;

      const closeBtn = document.createElement('button');
      closeBtn.type = 'button';
      closeBtn.className = 'tva-toast__close';
      closeBtn.setAttribute('aria-label', isDE ? 'Schließen' : (isEN ? 'Close' : (isFR ? 'Fermer' : (isES ? 'Cerrar' : (isNL ? 'Sluiten' : (isAR ? 'إغلاق' : (isRU ? 'Закрыть' : (isZH ? '关闭' : 'Chiudi'))))))));
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
  // Compatibilità: alcune pagine admin usano sia window.TraviraeToast.showToast(...)
  // sia showToast(...). Manteniamo entrambe senza cambiare il flusso esistente.
  try { window.TraviraeToast.showToast = showToast; } catch (_e) {}
  try { window.showToast = showToast; } catch (_e) {}

  // --- Language (used for emails + later site i18n)
  const LANG_STORAGE_KEY = 'travirae_email_lang';
  const SITE_LANG_STORAGE_KEY = 'travirae_site_lang';
  const SITE_LANG_EXPLICIT_KEY = 'travirae_site_lang_explicit';
  const SITE_LANG_MANUAL_KEY = 'travirae_site_lang_manual';
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
    // Restore original expected behaviour:
    // - first visit -> follow browser language
    // - manual selection from header -> override browser language
    // Prefer navigator.language first, then navigator.languages.
    try {
      const candidates = [];
      if (navigator.language) candidates.push(navigator.language);
      if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);

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
    const isManual = safeGetLS(SITE_LANG_MANUAL_KEY) === '1';
    const storedSite = safeGetLS(SITE_LANG_STORAGE_KEY);
    if (isManual && storedSite) return normalizeLang(storedSite);

    // Important: do NOT persist auto-detected language as if it were a manual choice.
    // This keeps the original expected behaviour: on a fresh visit the site follows
    // the browser language until the user explicitly changes it from the header.
    return normalizeLang(detectSiteLangFromBrowser());
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
    if (persist) {
      safeSetLS(SITE_LANG_STORAGE_KEY, normalized);
      safeSetLS(SITE_LANG_EXPLICIT_KEY, '1');
      safeSetLS(SITE_LANG_MANUAL_KEY, '1');
      // Preserve the previous behaviour for email/newsletter flows when the user
      // explicitly changes the visible site language from the header.
      safeSetLS(LANG_STORAGE_KEY, normalized);
    }
    applyHtmlLang(normalized);

    if (syncSelect) {
      const sel = document.querySelector('#site-lang-select');
      if (sel && sel.value !== normalized) sel.value = normalized;
      if (sel && sel.__ifCustomSelect) {
        try { syncSiteLangCustomSelect(sel); } catch (e) {}
      }
    }

    if (syncUser) void syncUserLangIfLoggedIn(normalized);

    // Expose for debugging
    window.TRAVIRAE_LANG = normalized;
  }

  // Expose helper for other scripts (e.g. affiliate dashboard)
  window.TraviraeSetSiteLang = function(code, opts){ return setSiteLang(code, opts); };
  window.TraviraeGetSiteLang = function(){ return getSiteLang(); };

  // --- Language router (Approach A: *-de.html / *-en.html pages) ---
  function routeByLang(forceCode){
    const code = (forceCode || getSiteLang());
    if (!code) return;

    const file = location.pathname.split('/').pop() || 'index.html';

    const isDe = /-de\.html$/i.test(file);
    const isEn = /-en\.html$/i.test(file);
    const isFr = /-fr\.html$/i.test(file);
    const isEs = /-es\.html$/i.test(file);
    const isRu = /-ru\.html$/i.test(file);
    const isAr = /-ar\.html$/i.test(file);
    const isNl = /-nl\.html$/i.test(file);
    const isZh = /-zh\.html$/i.test(file);

    const go = (target)=>{
      if (!target || target === file) return;
      try {
        const targetStr = String(target);
        const keepSearch = targetStr.indexOf('?') === -1 ? (window.location.search || '') : '';
        const keepHash = targetStr.indexOf('#') === -1 ? (window.location.hash || '') : '';
        const finalTarget = targetStr + keepSearch + keepHash;
        window.__traviraeLangRedirectingTo = finalTarget;
        location.href = finalTarget;
      } catch (e) {
        location.href = target;
      }
    };

    try{
      if (code === 'DEU') {
        if (!isDe) {
          go(file.replace(/\.html$/i, '-de.html').replace(/-(en|fr|es|ru|ar|nl|zh)-de\.html$/i, '-de.html'));
        }
      } else if (code === 'ENG') {
        if (!isEn) {
          go(file.replace(/\.html$/i, '-en.html').replace(/-(de|fr|es|ru|ar|nl|zh)-en\.html$/i, '-en.html'));
        }
      } else if (code === 'FRA') {
        if (!isFr) {
          go(file.replace(/\.html$/i, '-fr.html').replace(/-(de|en|es|ru|ar|nl|zh)-fr\.html$/i, '-fr.html'));
        }
      } else if (code === 'SPA') {
        if (!isEs) {
          go(file.replace(/\.html$/i, '-es.html').replace(/-(de|en|fr|ru|ar|nl|zh)-es\.html$/i, '-es.html'));
        }
      } else if (code === 'RUS') {
        if (!isRu) {
          go(file.replace(/\.html$/i, '-ru.html').replace(/-(de|en|fr|es|ar|nl|zh)-ru\.html$/i, '-ru.html'));
        }
      } else if (code === 'ARA') {
        if (!isAr) {
          go(file.replace(/\.html$/i, '-ar.html').replace(/-(de|en|fr|es|ru|nl|zh)-ar\.html$/i, '-ar.html'));
        }
      } else if (code === 'NLD') {
        if (!isNl) {
          go(file.replace(/\.html$/i, '-nl.html').replace(/-(de|en|fr|es|ru|ar|zh)-nl\.html$/i, '-nl.html'));
        }
      } else if (code === 'ZHO') {
        if (!isZh) {
          go(file.replace(/\.html$/i, '-zh.html').replace(/-(de|en|fr|es|ru|ar|nl)-zh\.html$/i, '-zh.html'));
        }
      } else {
        // Default Italian pages: drop any suffix
        if (isDe || isEn || isFr || isEs || isRu || isAr || isNl || isZh) {
          go(file.replace(/-(de|en|fr|es|ru|ar|nl|zh)\.html$/i, '.html'));
        }
      }
    }catch(e){
      // non-blocking
    }
  }


  // Expose for other scripts / debugging
  window.TraviraeRouteByLang = routeByLang;


  function injectLangSelector(){
    const headerInner = document.querySelector('.site-header .header-inner');
    if (!headerInner) return;
    if (document.querySelector('#site-lang-select')) return;

    const wrap = document.createElement('div');
    wrap.className = 'site-lang';

    const select = document.createElement('select');
    select.id = 'site-lang-select';
    select.className = 'site-lang-select';
    // i18n: aria-label in German ONLY when site language is DEU
    select.setAttribute('aria-label', 'Selettore lingua');

    LANGS.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.code;
      opt.textContent = l.label;
      select.appendChild(opt);
    });

    const initialLang = getSiteLang();

    // a11y label: translate only for DEU/ENG/FRA (others keep Italian)
    if (initialLang === 'DEU') select.setAttribute('aria-label', 'Sprachauswahl');
    else if (initialLang === 'ENG') select.setAttribute('aria-label', 'Language selector');
    else if (initialLang === 'FRA') select.setAttribute('aria-label', 'Sélecteur de langue');
    else if (initialLang === 'SPA') select.setAttribute('aria-label', 'Selector de idioma');
    else if (initialLang === 'RUS') select.setAttribute('aria-label', 'Выбор языка');
    else if (initialLang === 'ARA') select.setAttribute('aria-label', 'اختيار اللغة');
    else if (initialLang === 'NLD') select.setAttribute('aria-label', 'Taalkeuze');
    else if (initialLang === 'ZHO') select.setAttribute('aria-label', '语言选择');
    else select.setAttribute('aria-label', 'Selettore lingua');

    select.value = initialLang;
    select.addEventListener('change', () => {
      setSiteLang(select.value);

      // Keep aria-label in sync with the selected language
      try{
        const v = String(select.value || '').toUpperCase();
        if (v === 'DEU') select.setAttribute('aria-label', 'Sprachauswahl');
        else if (v === 'ENG') select.setAttribute('aria-label', 'Language selector');
        else if (v === 'FRA') select.setAttribute('aria-label', 'Sélecteur de langue');
        else if (v === 'SPA') select.setAttribute('aria-label', 'Selector de idioma');
        else if (v === 'RUS') select.setAttribute('aria-label', 'Выбор языка');
      else if (v === 'ARA') select.setAttribute('aria-label', 'اختيار اللغة');
        else if (v === 'NLD') select.setAttribute('aria-label', 'Taalkeuze');
        else if (v === 'ZHO') select.setAttribute('aria-label', '语言选择');
        else select.setAttribute('aria-label', 'Selettore lingua');
      }catch(e){}

      // Route to the correct language version (Approach A: *-de.html / *-en.html)
      if (typeof window.TraviraeRouteByLang === 'function') {
        try { window.TraviraeRouteByLang(select.value); } catch (e) {}
      }
    });

    wrap.appendChild(select);

    const brand = headerInner.querySelector('.brand');
  if (brand) headerInner.insertBefore(wrap, brand);
  else headerInner.insertBefore(wrap, headerInner.firstChild);


    // Apply on first render
    setSiteLang(select.value, { persist: false, syncSelect: false, syncUser: false });
    try { enhanceSiteLangCustomSelect(); } catch (e) {}
  }

  function closeSiteLangCustomSelects(except){
    $$('.site-lang .if-custom-select').forEach((root) => {
      if (except && root === except) return;
      root.classList.remove('is-open');
      const menu = $('.if-custom-select__menu', root);
      if (menu) menu.hidden = true;
    });
  }

  function syncSiteLangCustomSelect(select){
    if (!select || !select.__ifCustomSelect) return;
    const refs = select.__ifCustomSelect;
    const option = select.options[select.selectedIndex] || null;
    refs.label.textContent = option ? (option.textContent || '') : '';
    refs.menu.innerHTML = '';
    Array.from(select.options || []).forEach((opt) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'if-custom-select__option' + (opt.selected ? ' is-selected' : '');
      btn.setAttribute('data-value', opt.value || '');
      btn.textContent = opt.textContent || '';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        select.value = opt.value || '';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        syncSiteLangCustomSelect(select);
        closeSiteLangCustomSelects();
      });
      refs.menu.appendChild(btn);
    });
  }

  function enhanceSiteLangCustomSelect(){
    const select = document.querySelector('#site-lang-select');
    if (!select || !select.parentNode) return;
    if (select.__ifCustomSelectEnhanced) {
      try { syncSiteLangCustomSelect(select); } catch (e) {}
      return;
    }

    const host = select.parentNode;
    host.classList.add('site-lang--custom');

    const wrapper = document.createElement('div');
    wrapper.className = 'if-custom-select if-custom-select--site-lang';
    host.insertBefore(wrapper, select);
    wrapper.appendChild(select);
    select.classList.add('if-custom-select__native');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'if-custom-select__trigger';

    const label = document.createElement('span');
    label.className = 'if-custom-select__label';

    const arrow = document.createElement('span');
    arrow.className = 'if-custom-select__arrow';

    trigger.appendChild(label);
    trigger.appendChild(arrow);

    const menu = document.createElement('div');
    menu.className = 'if-custom-select__menu';
    menu.hidden = true;

    wrapper.appendChild(trigger);
    wrapper.appendChild(menu);

    select.__ifCustomSelect = {
      wrapper,
      trigger,
      label,
      menu
    };
    select.__ifCustomSelectEnhanced = true;

    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = menu.hidden;
      closeSiteLangCustomSelects(wrapper);
      wrapper.classList.toggle('is-open', willOpen);
      menu.hidden = !willOpen;
    });

    select.addEventListener('change', () => syncSiteLangCustomSelect(select));
    syncSiteLangCustomSelect(select);

    if (!document.body.__traviraeSiteLangCustomBound) {
      document.body.__traviraeSiteLangCustomBound = true;
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.site-lang .if-custom-select')) closeSiteLangCustomSelects();
      });
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeSiteLangCustomSelects();
      });
    }
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

    // Robust subscribe call: keeps the original behaviour for the standard endpoint,
    // but can also fall back to common template slugs (in case Edge Functions were
    // created from a template and later renamed).
    async function callNewsletterSubscribe(reqBody){
      const FN_CANDIDATES = ['newsletter-subscribe', 'smart-worker', 'bright-endpoint', 'swift-endpoint'];
      let lastErr;

      // Prefer Supabase functions.invoke when available.
      if (window.supabaseClient && window.supabaseClient.functions && typeof window.supabaseClient.functions.invoke === 'function') {
        for (const fnName of FN_CANDIDATES) {
          try {
            const { data, error } = await window.supabaseClient.functions.invoke(fnName, { body: reqBody });
            if (error) throw error;
            return data;
          } catch (e) {
            lastErr = e;
          }
        }
        throw lastErr || new Error('Newsletter subscribe failed');
      }

      // Fallback: direct fetch to Edge Function URL
      const cfg = window.TRAVIRAE_CONFIG || {};
      const supaUrl = String(cfg.SUPABASE_URL || window.TRAVIRAE_SUPABASE_URL || '').replace(/\/$/, '');
      const anonKey = String(cfg.SUPABASE_ANON_KEY || window.TRAVIRAE_SUPABASE_ANON_KEY || '');
      const base = supaUrl ? (supaUrl + '/functions/v1') : '';

      const urls = [];
      // Allow a hard override if present.
      if (window.TRAVIRAE_NEWSLETTER_SUBSCRIBE_URL) urls.push(window.TRAVIRAE_NEWSLETTER_SUBSCRIBE_URL);
      if (base) {
        FN_CANDIDATES.forEach((fn) => urls.push(base + '/' + fn));
      }

      // De-duplicate, keep order.
      const seen = new Set();
      const uniqUrls = urls.filter((u) => {
        const k = String(u || '');
        if (!k || seen.has(k)) return false;
        seen.add(k);
        return true;
      });

      if (!uniqUrls.length) throw new Error('Newsletter endpoint non configurato');

      const headers = { 'Content-Type': 'application/json' };
      if (anonKey) {
        headers['apikey'] = anonKey;
        headers['Authorization'] = 'Bearer ' + anonKey;
      }

      for (const url of uniqUrls) {
        try {
          const res = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(reqBody)
          });

          const payload = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(payload?.error || payload?.message || ('HTTP ' + res.status));
          }
          return payload;
        } catch (e) {
          lastErr = e;
        }
      }

      throw lastErr || new Error('Newsletter subscribe failed');
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = (input ? input.value : '').trim();
      if (!email || !/^\S+@\S+\.\S+$/.test(email)){
        showToast((function(){
          var l = getSiteLang();
          if (l === 'DEU') return 'Bitte gib eine gültige E‑Mail-Adresse ein.';
          if (l === 'ENG') return 'Please enter a valid email address.';
          if (l === 'FRA') return 'Veuillez saisir une adresse e‑mail valide.';
          if (l === 'SPA') return 'Por favor, introduce un correo electrónico válido.';
          if (l === 'RUS') return 'Пожалуйста, введите корректный адрес электронной почты.';
          if (l === 'ARA') return 'يرجى إدخال بريد إلكتروني صالح.';
          if (l === 'NLD') return 'Voer een geldig e-mailadres in.';
          if (l === 'ZHO') return '请输入有效的电子邮箱地址。';
          return 'Inserisci un\'email valida.';
        })(), 'error');
        return;
      }

      const lang = getSiteLang();
      setBusy(true);

      try{
        // Prefer Supabase functions.invoke when available (more robust across versions)
        // and avoid relying on private/internal URLs like `functions._url`.
        const reqBody = { email, language: lang, source: 'site_footer' };

        await callNewsletterSubscribe(reqBody);

        if (input) input.value = '';
        const okMsg = (lang === 'DEU') ? 'Abo bestätigt! Danke.'
                      : (lang === 'ENG') ? 'Subscription confirmed. Thank you.'
                      : (lang === 'FRA') ? 'Inscription confirmée. Merci.'
                      : (lang === 'SPA') ? 'Suscripción confirmada. ¡Gracias!'
                      : (lang === 'RUS') ? 'Подписка подтверждена. Спасибо!'
                      : (lang === 'ARA') ? 'تم تأكيد الاشتراك. شكرًا لك.'
                      : (lang === 'NLD') ? 'Inschrijving bevestigd. Bedankt.'
                      : (lang === 'ZHO') ? '订阅已确认。谢谢！'
                      : 'Iscrizione completata! Grazie.';
        showToast(okMsg, 'success');
      } catch (err){
        const errMsg = (lang === 'DEU') ? 'Fehler bei der Anmeldung. Bitte versuche es später erneut.'
                       : (lang === 'ENG') ? 'Subscription failed. Please try again later.'
                       : (lang === 'FRA') ? 'Erreur lors de l’inscription. Réessaie plus tard.'
                       : (lang === 'SPA') ? 'Error al suscribirse. Inténtalo de nuevo más tarde.'
                       : (lang === 'RUS') ? 'Ошибка подписки. Пожалуйста, попробуйте позже.'
                       : (lang === 'ARA') ? 'فشل الاشتراك. يرجى المحاولة لاحقًا.'
                       : (lang === 'NLD') ? 'Abonneren mislukt. Probeer het later opnieuw.'
                       : (lang === 'ZHO') ? '订阅失败。请稍后再试。'
                       : 'Errore durante iscrizione. Riprova tra poco.';
        showToast(errMsg, 'error');
        console.error('[newsletter] subscribe error', err);
      } finally {
        setBusy(false);
      }
    });
  }


  // Init (DOM is already loaded because scripts are at the bottom)
  injectLangSelector();
  initNewsletterSignup();
  // Ensure correct page variant after initial language resolution
  try { if (typeof window.TraviraeRouteByLang === 'function') window.TraviraeRouteByLang(getSiteLang()); } catch(e) {}

  // Ensure the correct language page is shown after init
  try { routeByLang(); } catch (e) {}

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

  // --------------------------------------------
  // Destination long texts (desc/highlights/bonus)
  // Optimized: loaded from JSON on demand to keep HTML light
  // - uses existing data-map-key as stable destination identifier
  // - keeps backward compatibility with old data-* attributes
  // --------------------------------------------
  const __DEST_DATA_FILES = {
    ITA: 'it',
    ENG: 'en',
    DEU: 'de',
    FRA: 'fr',
    SPA: 'es',
    RUS: 'ru',
    ARA: 'ar',
    NLD: 'nl',
    ZHO: 'zh',
  };

  const __DEST_DATA_CACHE = Object.create(null);
  const __DEST_DATA_PROMISE = Object.create(null);
  let __destModalFillToken = 0;

  function __normalizeUiLang(code){
    const up = String(code || '').toUpperCase().trim();
    return __DEST_DATA_FILES[up] ? up : 'ITA';
  }

  function __getDestDataUrl(uiLang){
    const code = __normalizeUiLang(uiLang);
    const file = __DEST_DATA_FILES[code] || 'it';
    return `assets/data/destinations/${file}.json`;
  }

  function __loadDestData(uiLang){
    const code = __normalizeUiLang(uiLang);
    if (__DEST_DATA_CACHE[code]) return Promise.resolve(__DEST_DATA_CACHE[code]);
    if (__DEST_DATA_PROMISE[code]) return __DEST_DATA_PROMISE[code];

    const url = __getDestDataUrl(code);
    __DEST_DATA_PROMISE[code] = fetch(url, { cache: 'force-cache' })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        __DEST_DATA_CACHE[code] = data || {};
        return __DEST_DATA_CACHE[code];
      })
      .catch((err) => {
        console.warn('[Travirae] Could not load destinations content:', url, err);
        __DEST_DATA_CACHE[code] = null;
        return null;
      });

    return __DEST_DATA_PROMISE[code];
  }

  function __readDestDataFromDataset(trg, uiLang){
    const code = __normalizeUiLang(uiLang);
    if (code === 'DEU') return { desc: trg.dataset.descDe || '', hiRaw: trg.dataset.highlightsDe || '', bonus: trg.dataset.bonusDe || '' };
    if (code === 'ENG') return { desc: trg.dataset.descEn || '', hiRaw: trg.dataset.highlightsEn || '', bonus: trg.dataset.bonusEn || '' };
    if (code === 'FRA') return { desc: trg.dataset.descFr || '', hiRaw: trg.dataset.highlightsFr || '', bonus: trg.dataset.bonusFr || '' };
    if (code === 'SPA') return { desc: trg.dataset.descEs || '', hiRaw: trg.dataset.highlightsEs || '', bonus: trg.dataset.bonusEs || '' };
    if (code === 'RUS') return { desc: trg.dataset.descRu || '', hiRaw: trg.dataset.highlightsRu || '', bonus: trg.dataset.bonusRu || '' };
    if (code === 'ARA') return { desc: trg.dataset.descAr || '', hiRaw: trg.dataset.highlightsAr || '', bonus: trg.dataset.bonusAr || '' };
    if (code === 'NLD') return { desc: trg.dataset.descNl || '', hiRaw: trg.dataset.highlightsNl || '', bonus: trg.dataset.bonusNl || '' };
    if (code === 'ZHO') return { desc: trg.dataset.descZh || '', hiRaw: trg.dataset.highlightsZh || '', bonus: trg.dataset.bonusZh || '' };
    // ITA + fallback
    return { desc: trg.dataset.desc || '', hiRaw: trg.dataset.highlights || '', bonus: trg.dataset.bonus || '' };
  }

  function __setHighlights(hiRaw, fallbackList){
    hiEl.innerHTML = '';
    const hiList = (hiRaw ? String(hiRaw).split('|') : fallbackList);
    hiList.forEach((x) => {
      const li = document.createElement('li');
      li.textContent = String(x).trim();
      hiEl.appendChild(li);
    });
  }

  function __setModalContent(desc, hiRaw, bonus, fallback, city, category, isITA){
    // Description
    if (desc) descEl.textContent = desc;
    else descEl.textContent = isITA ? longDescription(city, category) : fallback.missingDesc;

    // Highlights
    __setHighlights(hiRaw, fallback.fallbackHighlights);

    // Bonus
    if (bonus) bonusEl.textContent = bonus;
    else bonusEl.textContent = isITA ? strongBonuses(category) : fallback.missingBonus;
  }

  function __setModalLoading(fallback){
    descEl.textContent = fallback.loadingDesc;
    __setHighlights('', [fallback.loadingHighlights]);
    bonusEl.textContent = fallback.loadingBonus;
  }

  function __getFallback(uiLang){
    const code = __normalizeUiLang(uiLang);
    if (code === 'DEU') return {
      loadingDesc: 'Lädt…',
      loadingHighlights: 'Lädt…',
      loadingBonus: 'Lädt…',
      missingDesc: 'Beschreibung folgt in Kürze.',
      missingBonus: '🎁 Ein kleiner Bonus: Details folgen in Kürze.',
      fallbackHighlights: ['Fotospots', 'Lokale Küche', 'Entspannte Atmosphäre', 'Sonnenuntergänge'],
    };
    if (code === 'ENG') return {
      loadingDesc: 'Loading…',
      loadingHighlights: 'Loading…',
      loadingBonus: 'Loading…',
      missingDesc: 'Description coming soon.',
      missingBonus: '🎁 A little extra: details coming soon.',
      fallbackHighlights: ['Photo spots', 'Local food', 'Relaxed vibe', 'Sunset walks'],
    };
    if (code === 'FRA') return {
      loadingDesc: 'Chargement…',
      loadingHighlights: 'Chargement…',
      loadingBonus: 'Chargement…',
      missingDesc: 'Description à venir.',
      missingBonus: '🎁 Un petit bonus : détails à venir.',
      fallbackHighlights: ['Spots photo', 'Cuisine locale', 'Ambiance détendue', 'Balades au coucher du soleil'],
    };
    if (code === 'SPA') return {
      loadingDesc: 'Cargando…',
      loadingHighlights: 'Cargando…',
      loadingBonus: 'Cargando…',
      missingDesc: 'Descripción próximamente.',
      missingBonus: '🎁 Un pequeño extra: detalles próximamente.',
      fallbackHighlights: ['Lugares para fotos', 'Comida local', 'Ambiente relajado', 'Paseos al atardecer'],
    };
    if (code === 'RUS') return {
      loadingDesc: 'Загрузка…',
      loadingHighlights: 'Загрузка…',
      loadingBonus: 'Загрузка…',
      missingDesc: 'Описание скоро появится.',
      missingBonus: '🎁 Небольшой бонус: подробности скоро.',
      fallbackHighlights: ['Фотолокации', 'Местная кухня', 'Спокойная атмосфера', 'Прогулки на закате'],
    };
    if (code === 'ARA') return {
      loadingDesc: 'جارٍ التحميل…',
      loadingHighlights: 'جارٍ التحميل…',
      loadingBonus: 'جارٍ التحميل…',
      missingDesc: 'سيتم إضافة الوصف قريبًا.',
      missingBonus: '🎁 إضافة بسيطة: التفاصيل قريبًا.',
      fallbackHighlights: ['أماكن للتصوير', 'مطبخ محلي', 'أجواء هادئة', 'نزهات عند الغروب'],
    };
    if (code === 'NLD') return {
      loadingDesc: 'Laden…',
      loadingHighlights: 'Laden…',
      loadingBonus: 'Laden…',
      missingDesc: 'Beschrijving volgt binnenkort.',
      missingBonus: '🎁 Een extraatje: details volgen binnenkort.',
      fallbackHighlights: ['Fotoplekken', 'Lokale keuken', 'Relaxte sfeer', 'Zonsondergangwandelingen'],
    };
    if (code === 'ZHO') return {
      loadingDesc: '加载中…',
      loadingHighlights: '加载中…',
      loadingBonus: '加载中…',
      missingDesc: '简介即将上线。',
      missingBonus: '🎁 小惊喜：详情即将上线。',
      fallbackHighlights: ['拍照打卡点', '本地美食', '轻松氛围', '日落散步'],
    };
    // ITA
    return {
      loadingDesc: 'Caricamento…',
      loadingHighlights: 'Caricamento…',
      loadingBonus: 'Caricamento…',
      missingDesc: 'Descrizione in arrivo.',
      missingBonus: '🎁 Un piccolo bonus: dettagli in arrivo.',
      fallbackHighlights: ['scorci fotogenici','cucina locale','atmosfera rilassata','passeggiate al tramonto'],
    };
  }

  function __populateModalFromData(uiLang, trg, city, category){
    const code = __normalizeUiLang(uiLang);
    const isITA = code === 'ITA';
    const fallback = __getFallback(code);

    // If old HTML still carries data-* long texts, use them immediately.
    const direct = __readDestDataFromDataset(trg, code);
    if ((direct.desc || direct.hiRaw || direct.bonus) && (direct.desc || direct.hiRaw || direct.bonus)) {
      __setModalContent(direct.desc, direct.hiRaw, direct.bonus, fallback, city, category, isITA);
      return;
    }

    // Otherwise load from JSON.
    __setModalLoading(fallback);
    const token = ++__destModalFillToken;
    const mapKey = String(trg.getAttribute('data-map-key') || '').trim();
    __loadDestData(code).then((data) => {
      if (token !== __destModalFillToken) return;
      const entry = (data && mapKey && data[mapKey]) ? data[mapKey] : null;
      const desc = entry && entry.desc ? entry.desc : '';
      const hiRaw = entry && entry.highlights ? entry.highlights : '';
      const bonus = entry && entry.bonus ? entry.bonus : '';
      __setModalContent(desc, hiRaw, bonus, fallback, city, category, isITA);
    });
  }

  // Prefetch destination texts in the background (UX), without blocking.
  try {
    const preUiLang = (function(){
      try {
        if (typeof window.TraviraeGetSiteLang === 'function') return String(window.TraviraeGetSiteLang() || '').toUpperCase();
      } catch(e) {}
      try { return String(window.TRAVIRAE_LANG || localStorage.getItem('travirae_site_lang') || '').toUpperCase(); }
      catch (e2) { return String(window.TRAVIRAE_LANG || '').toUpperCase(); }
    })();
    const prefetch = () => __loadDestData(preUiLang);
    if ('requestIdleCallback' in window) window.requestIdleCallback(prefetch);
    else window.setTimeout(prefetch, 1200);
  } catch (e) {}


  function open(){ modal.classList.add('open'); document.body.style.overflow='hidden'; }
  function close(){ modal.classList.remove('open'); document.body.style.overflow=''; }
  modal.querySelectorAll('[data-close]').forEach(x=> x.addEventListener('click', close));
  document.addEventListener('keydown', e=>{ if(e.key==='Escape') close(); });

  document.addEventListener('click', (ev)=>{
    const trg = ev.target.closest('.more'); if(!trg) return;
    ev.preventDefault();

    const uiLang = (function(){
      try {
        if (typeof window.TraviraeGetSiteLang === 'function') return String(window.TraviraeGetSiteLang() || '').toUpperCase();
      } catch(e) {}
      try { return String(window.TRAVIRAE_LANG || localStorage.getItem('travirae_site_lang') || '').toUpperCase(); }
      catch (e2) { return String(window.TRAVIRAE_LANG || '').toUpperCase(); }
    })();
    const isDE = uiLang === 'DEU';
    const isEN = uiLang === 'ENG';
    const isFR = uiLang === 'FRA';
    const isES = uiLang === 'SPA';
    const isRU = uiLang === 'RUS';
    const isAR = uiLang === 'ARA';
    const isNL = uiLang === 'NLD';
    const isZH = uiLang === 'ZHO';

    const card = trg.closest('.city-card');
    const fallbackCity = isDE ? 'Das Reiseziel'
      : (isEN ? 'The destination'
      : (isFR ? 'La destination'
      : (isES ? 'El destino'
      : (isRU ? 'Направление'
      : (isAR ? 'الوجهة'
      : (isNL ? 'De bestemming'
      : (isZH ? '目的地'
      : 'La destinazione')))))));
    const city = trg.getAttribute('data-city') || (card ? (card.querySelector('h3')?.textContent || fallbackCity) : fallbackCity);
    const category = trg.closest('.accordion-item')?.querySelector('.label')?.textContent || '';

    titleEl.textContent = stripEmojis(city);

    // Load description/highlights/bonus from JSON (optimized), keeping fallbacks per language.
    __populateModalFromData(uiLang, trg, city, category);

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

  // NOTE:
  // In passato l'affiliateId veniva salvato in cookie/localStorage e riusato per giorni.
  // Questo però poteva far conteggiare "booking diretti" come "booking da affiliati".
  // Ora manteniamo la ref SOLO a livello di tab (sessionStorage) e la azzeriamo quando
  // l'utente rientra sul sito senza ?ref da un referrer esterno (o senza referrer).

  function purgeLegacyAffiliateStorage(){
    // pulizia vecchi cookie/localStorage (rimasti da build precedenti)
    try{ if (window.localStorage) localStorage.removeItem('tva_aff'); }catch(e){}
    try{ document.cookie = 'tva_aff=; Max-Age=0; path=/; samesite=lax'; }catch(e){}
  }

  function getStoredAffiliate(){
    var v = '';
    try{
      v = (window.sessionStorage ? (sessionStorage.getItem('tva_session_ref') || '') : '');
    }catch(e){}
    return sanitizeRef(v);
  }

  function storeAffiliate(id){
    if (!id) return;
    try{
      if (window.sessionStorage) sessionStorage.setItem('tva_session_ref', id);
    }catch(e){}
    purgeLegacyAffiliateStorage();
  }

  // --- Bootstrap affiliate id ---
  // sempre: pulizia eventuali vecchi valori persistenti
  purgeLegacyAffiliateStorage();

  var queryRef = readQueryRef();

  // Se non c'è ?ref ma esiste una ref in sessione e l'utente arriva da fuori sito,
  // consideriamo la visita "diretta" e azzeriamo la ref di sessione.
  try{
    if (!queryRef && window.sessionStorage){
      var existingRef = sessionStorage.getItem('tva_session_ref') || '';
      if (existingRef){
        var sameOrigin = false;
        if (document.referrer){
          try{ sameOrigin = (new URL(document.referrer)).origin === window.location.origin; }catch(e){}
        }
        if (!sameOrigin){
          sessionStorage.removeItem('tva_session_ref');
        }
      }
    }
  }catch(e){}

  if (queryRef){
    storeAffiliate(queryRef);
  }

  // Affiliate ID (solo session/tab)
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

  var isLangRedirectInProgress = false;
  try{ isLangRedirectInProgress = !!window.__traviraeLangRedirectingTo; }catch(e){ isLangRedirectInProgress = false; }

  // Logga sempre il pageview (anche senza ref), ma evita il doppio conteggio
  // sulle pagine che stanno solo reindirizzando alla variante lingua corretta.
  if (!isLangRedirectInProgress) insertSitePageview();

  // --- Helper pubblico richiesto ---
  window.traviraeAffiliate = window.traviraeAffiliate || {};
  window.traviraeAffiliate.getId = function(){
    return affiliateId || getStoredAffiliate() || '';
  };


  function getCurrentSiteLang(){
    try{
      var htmlLang = String(document.documentElement.getAttribute('lang') || 'it').toLowerCase();
      htmlLang = htmlLang.split('-')[0];
      return htmlLang || 'it';
    }catch(e){
      return 'it';
    }
  }

  var WIDGET_I18N = {
    it: { openStay22: 'Apri su Stay22', openAviasales: 'Apri su Aviasales' },
    en: { openStay22: 'Open on Stay22', openAviasales: 'Open on Aviasales' },
    de: { openStay22: 'Auf Stay22 öffnen', openAviasales: 'Auf Aviasales öffnen' },
    es: { openStay22: 'Abrir en Stay22', openAviasales: 'Abrir en Aviasales' },
    fr: { openStay22: 'Ouvrir sur Stay22', openAviasales: 'Ouvrir sur Aviasales' },
    nl: { openStay22: 'Openen op Stay22', openAviasales: 'Openen op Aviasales' },
    ru: { openStay22: 'Открыть на Stay22', openAviasales: 'Открыть на Aviasales' },
    ar: { openStay22: 'افتح على Stay22', openAviasales: 'افتح على Aviasales' },
    zh: { openStay22: '在 Stay22 打开', openAviasales: '在 Aviasales 打开' }
  };

  function widgetText(key){
    var lang = getCurrentSiteLang();
    return (WIDGET_I18N[lang] && WIDGET_I18N[lang][key]) || (WIDGET_I18N.it && WIDGET_I18N.it[key]) || key;
  }

  window.traviraeAffiliate.getWidgetText = function(key){
    return widgetText(key);
  };

  function hasRecentWidgetEventLogged(key, dedupeMs){
    try{
      if (!window.sessionStorage || !key) return false;
      var raw = sessionStorage.getItem('tva_widget_event_' + safeKeyPart(key));
      var last = parseInt(raw || '0', 10);
      if (!last) return false;
      return (Date.now() - last) < (dedupeMs || 1500);
    }catch(e){
      return false;
    }
  }

  function markRecentWidgetEventLogged(key){
    try{
      if (!window.sessionStorage || !key) return;
      sessionStorage.setItem('tva_widget_event_' + safeKeyPart(key), String(Date.now()));
    }catch(e){}
  }

  window.traviraeAffiliate.trackWidgetOutbound = async function(options){
    options = options || {};
    var partner = String(options.partner || '').trim() || 'unknown';
    var context = String(options.context || '').trim() || 'site_widget';
    var href = String(options.href || '').trim();
    var destination = String(options.destination || '').trim();
    var dedupeKey = String(options.dedupeKey || (partner + '_' + context + '_' + href)).trim();
    var dedupeMs = typeof options.dedupeMs === 'number' ? options.dedupeMs : 1500;
    if (dedupeKey && hasRecentWidgetEventLogged(dedupeKey, dedupeMs)) return false;
    if (dedupeKey) markRecentWidgetEventLogged(dedupeKey);

    if (!window.supabaseClient || !window.supabaseClient.from) return false;

    var payload = {
      event_type: 'widget_click',
      partner: partner,
      widget_id: context || null,
      session_id: sessionId || uuidv4Fallback(),
      visitor_id: visitorId || uuidv4Fallback(),
      metadata: {
        source: 'site_widget',
        context: context || null,
        page: window.location.pathname || '/',
        href: href || null,
        destination: destination || null,
        locale: getCurrentSiteLang(),
        ref_affiliate_slug: sessionRef || null
      }
    };

    try{
      var res = await window.supabaseClient.from('influencer_post_events').insert(payload);
      return !(res && res.error);
    }catch(err){
      return false;
    }
  };

  function initMainStay22OutboundButton(){
    var iframe = document.getElementById('stay22-widget');
    var section = document.getElementById('map-section');
    if (!iframe || !section) return;
    var frameWrap = section.querySelector('.map-frame');
    if (!frameWrap) return;

    var actions = section.querySelector('[data-stay22-main-actions]');
    if (!actions){
      actions = document.createElement('div');
      actions.className = 'travirae-widget-actions';
      actions.setAttribute('data-stay22-main-actions', '1');
      actions.hidden = true;
      actions.innerHTML = '<a class="btn secondary" target="_blank" rel="noopener"></a>';
      if (frameWrap.nextSibling) frameWrap.parentNode.insertBefore(actions, frameWrap.nextSibling);
      else frameWrap.parentNode.appendChild(actions);
    }

    var link = actions.querySelector('a');
    if (!link) return;

    function syncLink(){
      var href = String(iframe.getAttribute('src') || iframe.src || '').trim();
      if (!href){
        actions.hidden = true;
        return;
      }
      link.href = href;
      link.textContent = widgetText('openStay22');
      actions.hidden = false;
    }

    if (!link.__traviraeBound){
      link.__traviraeBound = true;
      link.addEventListener('click', function(){
        var labelEl = document.getElementById('map-destination-label');
        var destination = labelEl ? String(labelEl.textContent || '').trim() : '';
        window.traviraeAffiliate.trackWidgetOutbound({
          partner: 'stay22',
          context: 'main_stay22_map',
          href: link.href,
          destination: destination,
          dedupeKey: 'sitewidget_stay22_main_' + (destination || 'default'),
          dedupeMs: 1500
        });
      });
    }

    syncLink();
    try{ iframe.addEventListener('load', syncLink, { passive: true }); }catch(e){}
    try{
      if ('MutationObserver' in window){
        var observer = new MutationObserver(syncLink);
        observer.observe(iframe, { attributes: true, attributeFilter: ['src'] });
      }
    }catch(e){}
    document.addEventListener('change', function(e){
      if (e && e.target && e.target.id === 'site-lang-select') {
        window.setTimeout(syncLink, 80);
      }
    });
  }

  function initFlightsWidgetOutboundTracking(){
    var wrapper = document.getElementById('aviasales-widget-wrapper') || document.getElementById('aviasales-widget-container');
    var container = document.getElementById('aviasales-widget-container');
    if (!wrapper || wrapper.getAttribute('data-widget-outbound-init') === '1') return;
    wrapper.setAttribute('data-widget-outbound-init', '1');

    function handleInteraction(){
      var href = '';
      try{
        var script = container && container.querySelector ? container.querySelector('script[src*="tpemd.com/content"]') : null;
        href = script ? String(script.getAttribute('src') || script.src || '') : '';
      }catch(e){ href = ''; }
      window.traviraeAffiliate.trackWidgetOutbound({
        partner: 'aviasales',
        context: 'flights_widget',
        href: href,
        dedupeKey: 'sitewidget_aviasales_flights_widget',
        dedupeMs: 1000 * 60 * 30
      });
    }

    ['pointerdown','touchstart','mousedown'].forEach(function(evt){
      try{
        wrapper.addEventListener(evt, handleInteraction, { passive: true });
      }catch(e){
        wrapper.addEventListener(evt, handleInteraction);
      }
    });
  }

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
  if (queryRef && !isLangRedirectInProgress){
    var p = window.location.pathname || '/';
    if (!hasSessionLandingLogged(queryRef, p)){
      markSessionLandingLogged(queryRef, p);
      insertAffiliateClick(queryRef);
    }
  }

  // --- Legacy no-op: booking click tracking removed ---
  window.traviraeAffiliate.trackBookingClick = function(){
    return false;
  };

  initMainStay22OutboundButton();
  initFlightsWidgetOutboundTracking();

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

