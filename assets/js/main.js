(function(){
  const cfg = window.TRAVIRAE_CONFIG||{};
  function setBg(el,u){ if(el) el.style.backgroundImage = `url('${u}')`; }
  function preload(url){ return new Promise(res => { const i=new Image(); i.loading='eager'; i.decoding='async'; i.onload=()=>res(url); i.onerror=()=>res(null); i.src=url; }); }
  window.addEventListener('load', async function(){
    const hero = document.querySelector('.hero-bg .layer');
    if(!hero) return;
    // immediate local
    if(cfg.HERO_IMAGE_LOCAL) setBg(hero, cfg.HERO_IMAGE_LOCAL);
    // upgrade to remote if available
    if(cfg.HERO_IMAGE_REMOTE){
      const ok = await preload(cfg.HERO_IMAGE_REMOTE);
      if(ok) setBg(hero, ok);
    }
  });
})();