
/*! Auto-injected: replace Stay22 default map with Excel-provided embed for each destination. */
(function(){
  var lastBtn = null;
  function decode(b64){
    try{ return atob(b64); }catch(e){ return ''; }
  }
  function norm(s){
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
    if(!btn) return;
    var modal = document.getElementById('destination-modal');
    if(!modal) return;
    // Prefer the mount container; fall back to first iframe in modal
    var mount = modal.querySelector('#map-mount') || modal.querySelector('.map-mount');
    var frame = modal.querySelector('iframe.map-embed') || modal.querySelector('iframe');
    var embedB64 = btn.getAttribute('data-map-embed-b64');
    var src = btn.getAttribute('data-map-src');
    var city = btn.getAttribute('data-city') || '';
    // If we have a mount container, render embed HTML inside it
    if(mount){
      mount.innerHTML = ''; // clear
      if(embedB64){
        var html = decode(embedB64);
        if(html){
          mount.insertAdjacentHTML('beforeend', html);
          var newFrame = mount.querySelector('iframe');
          if(newFrame && city) newFrame.setAttribute('title', 'Mappa hotel a ' + city);
          lastBtn = btn;
          return;
        }
      }
      // fallback to src
      if(src){
        var tag = document.createElement('iframe');
        tag.setAttribute('width','100%');
        tag.setAttribute('height','428');
        tag.setAttribute('frameborder','0');
        tag.setAttribute('loading','lazy');
        tag.setAttribute('allowfullscreen','');
        tag.setAttribute('style','border:0;');
        tag.src = src;
        if(city) tag.title = 'Mappa hotel a ' + city;
        mount.appendChild(tag);
        lastBtn = btn;
        return;
      }
    }
    // Fallback: replace existing iframe element
    if(frame){
      if(embedB64){
        var html = decode(embedB64);
        if(html){
          frame.insertAdjacentHTML('afterend', html);
          var next = frame.nextElementSibling;
          frame.remove();
          if(next && next.tagName==='IFRAME' && city) next.setAttribute('title', 'Mappa hotel a ' + city);
          lastBtn = btn;
          return;
        }
      }
      if(src){
        frame.setAttribute('src', src);
        if(city) frame.setAttribute('title', 'Mappa hotel a ' + city);
        lastBtn = btn;
        return;
      }
    }
  }

  // Click handler
  document.addEventListener('click', function(ev){
    var btn = ev.target && ev.target.closest && ev.target.closest('button.more');
    if(btn){ setMapFromButton(btn); }
  }, true);

  // Keyboard (Enter/Space) on buttons
  document.addEventListener('keydown', function(ev){
    if((ev.key === 'Enter' || ev.key === ' ') && ev.target && ev.target.closest){
      var btn = ev.target.closest('button.more');
      if(btn){ setMapFromButton(btn); }
    }
  }, true);

  // As a safety net: when the modal becomes visible, re-apply the last clicked button's map
  var modal = document.getElementById('destination-modal');
  if(modal && 'MutationObserver' in window){
    var obs = new MutationObserver(function(){
      if(modal.classList && modal.classList.contains('open') && lastBtn){
        setMapFromButton(lastBtn);
      }
    });
    obs.observe(modal, {attributes:true, attributeFilter:['class']});
  }
})();