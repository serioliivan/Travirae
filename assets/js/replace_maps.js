
/*! Perf patch: on-demand Stay22 map injection with JSON mapping (keeps affiliate params intact) */
(function(){
  var cache = null; var lastBtn = null;

// --- Widget i18n: map site language code -> Stay22 language + currency ---
var WIDGET_I18N = {
  ENG: { ljs: 'en', currency: 'USD' },
  // NOTE: Stay22 MAP currently does not support Arabic/Russian UI via `ljs`.
  // We keep the currency aligned with the selected language, but fall back to English UI.
  ARA: { ljs: 'en', currency: 'AED' },
  DEU: { ljs: 'de', currency: 'EUR' },
  SPA: { ljs: 'es', currency: 'EUR' },
  RUS: { ljs: 'en', currency: 'RUB' },
  NLD: { ljs: 'nl', currency: 'EUR' },
  ZHO: { ljs: 'zh', currency: 'CNY' },
  ITA: { ljs: 'it', currency: 'EUR' },
  FRA: { ljs: 'fr', currency: 'EUR' }
};

function safeGetLS(key){
  try { return (window.localStorage ? localStorage.getItem(key) : '') || ''; } catch(e) { return ''; }
}

function getCurrentLangCode(){
  try {
    var sel = document.getElementById('site-lang-select');
    if (sel && sel.value) return sel.value;
  } catch(eSel) {}
  if (window.TRAVIRAE_LANG) return window.TRAVIRAE_LANG;
  return safeGetLS('travirae_email_lang') || 'ENG';
}

function getStay22I18n(){
  var code = getCurrentLangCode();
  return WIDGET_I18N[code] || WIDGET_I18N.ENG;
}
  function loadMapping(){
    if(cache) return Promise.resolve(cache);
    return fetch('assets/data/maps.json', {credentials:'same-origin'})
      .then(function(r){ return r.json(); })
      .then(function(data){ cache = data || {}; return cache; })
      .catch(function(){ cache = {}; return cache; });
  }
  function setMapFor(btn){
    if(!btn) return;
    var modal = document.getElementById('destination-modal');
    if(!modal) return;
    var mount = modal.querySelector('#map-mount') || modal.querySelector('.map-mount');
    if(!mount) return;
    var city = btn.getAttribute('data-city') || '';
    var key  = btn.getAttribute('data-map-key') || '';
    loadMapping().then(function(map){
      var src = map[key] || '';
      mount.innerHTML = '';
      if(src){
        var frame = document.createElement('iframe');
        frame.width = '100%'; frame.height = '428';
        frame.setAttribute('frameborder','0');
        frame.setAttribute('loading','lazy');
        frame.setAttribute('allowfullscreen','');
        frame.setAttribute('style','border:0;');

        // Aggiungi campaign=AFFILIATE_SLUG alla src (se presente un affiliate id)
        var aff = '';
        try {
          if (window.traviraeAffiliate && typeof window.traviraeAffiliate.getId === 'function') {
            aff = window.traviraeAffiliate.getId() || '';
          }
        } catch (e) {}
        if (aff) {
          try {
            var u = new URL(src);
            var cfg = getStay22I18n();
            u.searchParams.set('ljs', cfg.ljs);
            u.searchParams.set('currency', cfg.currency);
            u.searchParams.set('campaign', aff);
            frame.src = u.toString();
          } catch (eUrl) {
            var cfg2 = getStay22I18n();
            var sep2 = (src.indexOf('?') === -1 ? '?' : '&');
            frame.src = src + sep2 + 'ljs=' + encodeURIComponent(cfg2.ljs) + '&currency=' + encodeURIComponent(cfg2.currency) + '&campaign=' + encodeURIComponent(aff);
          }
        } else {
          try {
            var u0 = new URL(src);
            var cfg0 = getStay22I18n();
            u0.searchParams.set('ljs', cfg0.ljs);
            u0.searchParams.set('currency', cfg0.currency);
            frame.src = u0.toString();
          } catch(e0) {
            // Fallback: append params without breaking the base embed/tracking
            var cfg1 = getStay22I18n();
            var sep = (src.indexOf('?') === -1 ? '?' : '&');
            frame.src = src + sep + 'ljs=' + encodeURIComponent(cfg1.ljs) + '&currency=' + encodeURIComponent(cfg1.currency);
          }
        }


        // Traccia un booking click Stay22 quando l'utente clicca sulla mappa (solo la prima volta)
        try {
          var bookedOnce = false;
          var handler = function(){
            if (bookedOnce) return;
            bookedOnce = true;
            try {
              if (window.traviraeAffiliate && typeof window.traviraeAffiliate.trackBookingClick === 'function') {
                if (window.console && console.log) console.log('Travirae: click mappa Stay22 (mappe dinamiche)');
                window.traviraeAffiliate.trackBookingClick('stay22');
              }
            } catch(eTrack) {
              if (window.console && console.warn) console.warn('Travirae: errore tracking booking Stay22 (mappe dinamiche)', eTrack);
            }
          };
          // Usiamo sia pointerdown che click per intercettare tap/click sull'iframe
          frame.addEventListener('pointerdown', handler, true);
          frame.addEventListener('click', handler, true);
          frame.addEventListener('focus', handler, true);
          // Fallback: prova anche sul container della mappa (alcuni browser non propagano eventi dall'iframe)
          mount.addEventListener('pointerdown', handler, { capture: true, once: true });
          mount.addEventListener('click', handler, { capture: true, once: true });
        } catch(eBind) {
          if (window.console && console.warn) console.warn('Travirae: impossibile collegare tracking Stay22 (mappe dinamiche)', eBind);
        }

        if(city) frame.setAttribute('title', (function(){
          var c = getCurrentLangCode();
          if (c === 'DEU') return 'Hotelkarte in ';
          if (c === 'ENG') return 'Hotel map in ';
          if (c === 'FRA') return 'Carte des hôtels à ';
          if (c === 'SPA') return 'Mapa de hoteles en ';
          if (c === 'RUS') return 'Карта отелей в ';
          if (c === 'ARA') return 'خريطة الفنادق في ';
          if (c === 'NLD') return 'Hotelkaart in ';
          if (c === 'ZHO') return '酒店地图：';
          return 'Mappa hotel a ';
        })() + city);
        mount.appendChild(frame);

        // Overlay per tracking affidabile: i click dentro iframe cross-origin spesso NON propagano.
        // Lo attiviamo SEMPRE (anche senza affiliate id) per avere tracking affidabile su mobile/incognito.
        try {
          try { if (!mount.style.position) mount.style.position = 'relative'; } catch(ePos){}
          var ov = document.createElement('div');
          ov.className = 'tva-stay22-overlay';
          ov.setAttribute('aria-label', (function(){
            var c = getCurrentLangCode();
            if (c === 'DEU') return 'Karte aktivieren';
            if (c === 'ENG') return 'Activate the map';
            if (c === 'FRA') return 'Activer la carte';
            if (c === 'SPA') return 'Activar el mapa';
            if (c === 'RUS') return 'Активировать карту';
            if (c === 'ARA') return 'تفعيل الخريطة';
            if (c === 'NLD') return 'Kaart activeren';
            if (c === 'ZHO') return '启用地图';
            return 'Attiva la mappa';
          })());
          ov.style.cssText = 'position:absolute; inset:0; z-index:5; background:transparent; display:block;';
          ov.innerHTML = '';
          mount.appendChild(ov);

          var hide = function(){
            try { ov.style.pointerEvents = 'none'; ov.style.opacity = '0'; } catch(eCss){}
            try { ov.remove(); } catch(eRm){ ov.style.display = 'none'; }
          };

          var fire = function(){
            try {
              // usa la stessa logica handler (setta bookedOnce e chiama trackBookingClick)
              try { handler(); } catch(eH) {
                // fallback diretto
                if (window.traviraeAffiliate && typeof window.traviraeAffiliate.trackBookingClick === 'function') {
                  window.traviraeAffiliate.trackBookingClick('stay22');
                }
              }
            } finally {
              hide();
            }
          };

          ov.addEventListener('pointerdown', fire, true);
          ov.addEventListener('mousedown', fire, true);
          ov.addEventListener('touchstart', fire, { capture: true, passive: true });
        } catch(eOverlay) {
          if (window.console && console.warn) console.warn('Travirae: overlay tracking Stay22 (mappe dinamiche) non disponibile', eOverlay);
        }
      } else {
        var p = document.createElement('p');
        p.className = 'muted'; p.style.margin = '1rem 0';
        p.textContent = (function(){
          var c = getCurrentLangCode();
          if (c === 'DEU') return 'Karte ist momentan nicht verfügbar.';
          if (c === 'ENG') return 'Map is currently unavailable.';
          if (c === 'FRA') return 'La carte est momentanément indisponible.';
          if (c === 'SPA') return 'El mapa no está disponible en este momento.';
          if (c === 'RUS') return 'Карта сейчас недоступна.';
          if (c === 'ARA') return 'الخريطة غير متاحة حاليًا.';
          if (c === 'NLD') return 'Kaart is momenteel niet beschikbaar.';
          if (c === 'ZHO') return '地图暂时不可用。';
          return 'Mappa non disponibile al momento.';
        })();
        mount.appendChild(p);
      }
    });
    lastBtn = btn;
  }
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('button.more');
    if(btn){
      // L'utente ha aperto una mappa Stay22 per una destinazione:
      // apriamo la mappa ma NON contiamo il booking qui.
      setMapFor(btn);
    }
  }, true);
  var modal = document.getElementById('destination-modal');
  if(modal && 'MutationObserver' in window){
    var obs = new MutationObserver(function(){
      if(modal.classList && modal.classList.contains('open') && lastBtn){
        setMapFor(lastBtn);
      }
    });
    obs.observe(modal, {attributes:true, attributeFilter:['class']});

// Refresh the dynamic Stay22 map when the site language changes (if modal is open)
document.addEventListener('change', function(e){
  try {
    if (!(e && e.target && e.target.id === 'site-lang-select')) return;
    var m = document.getElementById('destination-modal');
    if (m && m.classList && m.classList.contains('open') && lastBtn) {
      setMapFor(lastBtn);
    }
  } catch(e2) {}
});
  }
})();