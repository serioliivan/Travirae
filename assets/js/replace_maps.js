
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


function getWidgetButtonText(){
  try {
    if (window.traviraeAffiliate && typeof window.traviraeAffiliate.getWidgetText === 'function') {
      return window.traviraeAffiliate.getWidgetText('openStay22');
    }
  } catch(e) {}
  return 'Apri su Stay22';
}

function ensureModalWidgetActions(modal){
  if (!modal) return null;
  var frameWrap = modal.querySelector('.map-frame');
  if (!frameWrap) return null;
  var actions = modal.querySelector('[data-stay22-modal-actions]');
  if (!actions){
    actions = document.createElement('div');
    actions.className = 'travirae-widget-actions';
    actions.setAttribute('data-stay22-modal-actions', '1');
    actions.hidden = true;
    actions.innerHTML = '<a class="btn secondary" target="_blank" rel="noopener"></a>';
    if (frameWrap.nextSibling) frameWrap.parentNode.insertBefore(actions, frameWrap.nextSibling);
    else frameWrap.parentNode.appendChild(actions);
  }
  return actions;
}

function updateModalWidgetActions(modal, href, city, key){
  var actions = ensureModalWidgetActions(modal);
  if (!actions) return;
  var link = actions.querySelector('a');
  if (!link) return;
  link.textContent = getWidgetButtonText();
  if (!href){
    actions.hidden = true;
    link.removeAttribute('href');
    return;
  }
  link.href = href;
  actions.hidden = false;
  if (!link.__traviraeBound){
    link.__traviraeBound = true;
    link.addEventListener('click', function(){
      try{
        if (window.traviraeAffiliate && typeof window.traviraeAffiliate.trackWidgetOutbound === 'function') {
          window.traviraeAffiliate.trackWidgetOutbound({
            partner: 'stay22',
            context: 'destination_modal_map',
            href: link.href,
            destination: city || key || '',
            dedupeKey: 'sitewidget_stay22_modal_' + String(city || key || 'map'),
            dedupeMs: 1500
          });
        }
      }catch(e){}
    });
  }
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
        updateModalWidgetActions(modal, frame.src || '', city, key);
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
        updateModalWidgetActions(modal, '', city, key);
      }
    });
    lastBtn = btn;
  }
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('button.more');
    if(btn){
      // L'utente ha aperto una mappa Stay22 per una destinazione.
      // Apriamo direttamente la mappa selezionata senza overlay invisibili.
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