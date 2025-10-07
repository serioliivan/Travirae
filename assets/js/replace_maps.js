// Injected by automation: replace Stay22 map in destination modal using data-map-src from clicked button
(function(){
  function normalize(s){
    try {
      return (s||'').toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
        .replace(/[^a-z0-9\s\-_/]/g,' ')
        .replace(/\s+/g,' ')
        .trim();
    } catch(e){
      return (s||'').toLowerCase().trim();
    }
  }
  function setMapFromButton(btn){
    var modal = document.getElementById('destination-modal');
    if(!modal) return;
    var frame = modal.querySelector('iframe.map-embed') || modal.querySelector('iframe');
    if(!frame) return;
    var src = btn && btn.getAttribute('data-map-src');
    var embedB64 = btn && btn.getAttribute('data-map-embed-b64');
    var city = btn && btn.getAttribute('data-city');
    if(embedB64){
      try {
        var html = atob(embedB64);
        // Replace the iframe element entirely to preserve provider attributes
        frame.insertAdjacentHTML('afterend', html);
        frame.remove();
        // Optionally set title attribute if city available
        var newFrame = modal.querySelector('iframe') || null;
        if(newFrame && city){
          newFrame.setAttribute('title', 'Mappa hotel a ' + city);
        }
        return;
      } catch(e){ /* fallback to src*/ }
    }
    if(src){
      frame.setAttribute('src', src);
      if(city){
        frame.setAttribute('title', 'Mappa hotel a ' + city);
      }
    }
  }
  document.addEventListener('click', function(ev){
    var btn = ev.target && ev.target.closest && ev.target.closest('button.more');
    if(btn){
      setMapFromButton(btn);
    }
  }, true);
})();
