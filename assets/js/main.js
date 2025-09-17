(function(){
  const cfg = (window.TRAVIRAE_CONFIG||{});
  const imgs = (cfg.BG_IMAGES||[]);
  let idx = 0;
  function setBg(url){
    const hero = document.querySelector('.hero-bg');
    if(!hero) return;
    hero.style.setProperty('--bg-url-next', `url('${url}')`);
    hero.classList.add('fade');
    setTimeout(()=>{
      hero.style.setProperty('--bg-url', `var(--bg-url-next)`);
      hero.classList.remove('fade');
    }, 900); // match CSS transition
  }
  function preload(list){
    list.forEach(u=>{ const i = new Image(); i.src = u; });
  }
  window.addEventListener('load', function(){
    if(imgs.length){
      // initial
      const hero = document.querySelector('.hero-bg');
      if(hero){
        hero.style.setProperty('--bg-url', `url('${imgs[0]}')`);
      }
      preload(imgs);
      setInterval(function(){
        idx = (idx + 1) % imgs.length;
        setBg(imgs[idx]);
      }, (cfg.HERO_ROTATION_MS||45000));
    }
    // Stay22 mini search
    const form = document.getElementById('stay22-form');
    if(form){
      form.addEventListener('submit', function(e){
        e.preventDefault();
        const dest = form.querySelector('[name="address"]').value.trim();
        const checkin = form.querySelector('[name="checkin"]').value;
        const checkout = form.querySelector('[name="checkout"]').value;
        if(!dest){ alert('Inserisci una destinazione.'); return; }
        const params = new URLSearchParams();
        params.set('aid', cfg.STAY22_AID||'travirae');
        params.set('address', dest);
        if(checkin) params.set('checkin', checkin);
        if(checkout) params.set('checkout', checkout);
        params.set('campaign', 'home_dynamic_map');
        const src = "https://www.stay22.com/embed/gm?" + params.toString();
        const iframe = document.getElementById('stay22-dynamic');
        if(iframe){ iframe.src = src; }
      });
    }
  });
})();