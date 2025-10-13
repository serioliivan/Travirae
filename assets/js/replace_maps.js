
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
        frame.src = src;
        if(city) frame.setAttribute('title', 'Mappa hotel a ' + city);
        mount.appendChild(frame);
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
    if(btn){ setMapFor(btn); }
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