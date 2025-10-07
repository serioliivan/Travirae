
/*! Perf patch: lightweight map injection per click, JSON mapping, no base64 in DOM */
(function(){
  var cache = null; // will store { key: src }
  var lastBtn = null;

  function norm(s){
    try{
      return (s||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9\s\-_\/]/g,' ')
        .replace(/\s+/g,' ')
        .trim();
    }catch(e){ return (s||'').toLowerCase().trim(); }
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
    var key  = btn.getAttribute('data-map-key') || norm(city);

    loadMapping().then(function(map){
      var src = map[key] || '';
      // Safety: clear previous iframe
      mount.innerHTML = '';
      if(src){
        var frame = document.createElement('iframe');
        frame.width = '100%';
        frame.height = '428';
        frame.setAttribute('frameborder','0');
        frame.setAttribute('loading','lazy');
        frame.setAttribute('allowfullscreen','');
        frame.setAttribute('style','border:0;');
        frame.src = src;
        if(city) frame.setAttribute('title', 'Mappa hotel a ' + city);
        mount.appendChild(frame);
      } else {
        // Graceful fallback: show a small message
        var p = document.createElement('p');
        p.className = 'muted';
        p.style.margin = '1rem 0';
        p.textContent = 'Mappa non disponibile al momento.';
        mount.appendChild(p);
      }
    });
    lastBtn = btn;
  }

  // Delegate click on "Scopri di più"
  document.addEventListener('click', function(e){
    var btn = e.target && e.target.closest && e.target.closest('button.more');
    if(btn){ setMapFor(btn); }
  }, true);

  // Re-apply when modal gets the class 'open'
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