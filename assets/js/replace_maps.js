
/*! Perf patch: on-demand Stay22 map injection with JSON mapping (keeps affiliate params intact) */
(function(){
  var cache = null; var lastBtn = null;
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
            u.searchParams.set('campaign', aff);
            frame.src = u.toString();
          } catch (eUrl) {
            frame.src = src + (src.indexOf('?') === -1 ? '?' : '&') + 'campaign=' + encodeURIComponent(aff);
          }
        } else {
          frame.src = src;
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

        if(city) frame.setAttribute('title', 'Mappa hotel a ' + city);
        mount.appendChild(frame);

        // Overlay per tracking affidabile: i click dentro iframe cross-origin spesso NON propagano.
        // Lo attiviamo SEMPRE (anche senza affiliate id) per avere tracking affidabile su mobile/incognito.
        try {
          try { if (!mount.style.position) mount.style.position = 'relative'; } catch(ePos){}
          var ov = document.createElement('div');
          ov.className = 'tva-stay22-overlay';
          ov.setAttribute('aria-label', 'Attiva la mappa');
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
        p.textContent = 'Mappa non disponibile al momento.';
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
  }
})();