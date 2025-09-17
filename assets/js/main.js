(function(){
  const cfg = (window.TRAVIRAE_CONFIG||{});
  const remote = cfg.BG_IMAGES_REMOTE || [];
  const local = cfg.BG_IMAGES_LOCAL || [];
  const ROT = cfg.HERO_ROTATION_MS || 45000;

  function preload(url){ return new Promise(res => { const i = new Image(); i.onload = ()=>res(url); i.onerror = ()=>res(null); i.src = url; }); }
  async function prepareList(){
    const loaded = [];
    for(const url of remote){
      const ok = await preload(url);
      if(ok) loaded.push(ok);
    }
    if(loaded.length) return loaded;
    return local.filter(Boolean);
  }

  function setBg(el, url){ if(el) el.style.backgroundImage = `url('${url}')`; }

  window.addEventListener('load', async function(){
    const hero  = document.querySelector('.hero-bg');
    const a = document.querySelector('.hero-bg .layer-a');
    const b = document.querySelector('.hero-bg .layer-b');
    if(!hero || !a || !b) return;
    const list = await prepareList();
    if(!list.length) return;
    // initial
    let index = 0, aTop = true;
    setBg(a, list[0]);
    setBg(b, list[1 % list.length]);
    setInterval(()=>{
      index = (index + 1) % list.length;
      if(aTop){ setBg(b, list[index]); hero.classList.add('swap'); }
      else    { setBg(a, list[index]); hero.classList.remove('swap'); }
      aTop = !aTop;
    }, ROT);
  });
})();