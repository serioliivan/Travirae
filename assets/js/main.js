(function(){
  const cfg = (window.TRAVIRAE_CONFIG||{});
  const images = (cfg.BG_IMAGES||[]);
  let aIsTop = true, index = 0;

  function setBg(el, url){ if(el) el.style.backgroundImage = `url('${url}')`; }
  function preload(urls){ urls.forEach(u=>{ const i=new Image(); i.src=u; }); }

  window.addEventListener('load', function(){
    const hero = document.querySelector('.hero-bg');
    const a = document.querySelector('.hero-bg .layer-a');
    const b = document.querySelector('.hero-bg .layer-b');
    if(images.length && hero && a && b){
      setBg(a, images[0]);
      setBg(b, images[1 % images.length]);
      preload(images);
      setInterval(()=>{
        index = (index + 1) % images.length;
        if(aIsTop){
          setBg(b, images[index]);
          hero.classList.add('swap');
        } else {
          setBg(a, images[index]);
          hero.classList.remove('swap');
        }
        aIsTop = !aIsTop;
      }, (cfg.HERO_ROTATION_MS||45000));
    }

    // Stay22 mini search -> embed/gm with address + dates
    const form = document.getElementById('stay22-form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const dest = form.querySelector('[name="address"]').value.trim();
        const ci = form.querySelector('[name="checkin"]').value;
        const co = form.querySelector('[name="checkout"]').value;
        if(!dest){ alert('Inserisci una destinazione.'); return; }
        const p = new URLSearchParams();
        p.set('aid', cfg.STAY22_AID||'travirae');
        p.set('address', dest);
        if(ci) p.set('checkin', ci);
        if(co) p.set('checkout', co);
        p.set('campaign', 'home_dynamic_map');
        const src = "https://www.stay22.com/embed/gm?" + p.toString();
        const frame = document.getElementById('stay22-dynamic');
        if(frame) frame.src = src;
      });
    }
  });
})();