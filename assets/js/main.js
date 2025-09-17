(function(){
  const cfg = window.TRAVIRAE_CONFIG||{};
  function setBg(el,u){ if(el) el.style.backgroundImage = `url('${u}')`; }
  function preload(url){ return new Promise(res => { const i=new Image(); i.loading='eager'; i.decoding='async'; i.onload=()=>res(url); i.onerror=()=>res(null); i.src=url; }); }
  window.addEventListener('load', async function(){
    const hero = document.querySelector('.hero-bg .layer');
    if(hero){
      if(cfg.HERO_IMAGE_LOCAL) setBg(hero, cfg.HERO_IMAGE_LOCAL);
      if(cfg.HERO_IMAGE_REMOTE){
        const ok = await preload(cfg.HERO_IMAGE_REMOTE);
        if(ok) setBg(hero, ok);
      }
    }
    // Delegate clicks for chips and destination cards
    document.body.addEventListener('click', function(e){
      const a = e.target.closest('a[data-address]');
      if(!a) return;
      const addr = a.getAttribute('data-address');
      if(!addr) return;
      e.preventDefault();
      // Scroll to map and update iframe
      const section = document.getElementById('stay22-section');
      if(section) section.scrollIntoView({behavior:'smooth', block:'start'});
      const frame = document.getElementById('stay22-dynamic');
      if(frame){
        const p = new URLSearchParams();
        p.set('aid', cfg.STAY22_AID||'travirae');
        p.set('address', addr);
        p.set('campaign', 'home_quicklink');
        frame.src = "https://www.stay22.com/embed/gm?" + p.toString();
      }
    });
  });
})();