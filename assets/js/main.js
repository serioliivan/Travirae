(function(){
  const cfg = (window.TRAVIRAE_CONFIG||{});
  const remote = cfg.BG_IMAGES_REMOTE || [];
  const local = cfg.BG_IMAGES_LOCAL || [];
  const ROT = cfg.HERO_ROTATION_MS || 45000;

  function preload(url){ return new Promise(res => { const i = new Image(); i.loading = 'eager'; i.decoding='async'; i.onload = ()=>res(url); i.onerror = ()=>res(null); i.src = url; }); }
  async function buildList(){
    const list = [];
    for(const url of remote){
      const ok = await preload(url);
      if(ok) list.push(ok);
    }
    if(list.length) return list;
    return local;
  }
  function setBg(el,u){ if(el) el.style.backgroundImage = `url('${u}')`; }

  window.addEventListener('load', async function(){
    const hero  = document.querySelector('.hero-bg');
    const a = document.querySelector('.hero-bg .layer-a');
    const b = document.querySelector('.hero-bg .layer-b');
    if(!hero||!a||!b) return;
    // instant local fallback
    if(local && local.length){ setBg(a, local[0]); setBg(b, local[1%local.length]); }
    // now upgrade to remote when ready
    const list = await buildList();
    if(!list.length) return;
    setBg(a, list[0]); setBg(b, list[1%list.length]);
    let index = 0, aTop = true;
    setInterval(()=>{
      index = (index + 1) % list.length;
      if(aTop){ setBg(b, list[index]); hero.classList.add('swap'); }
      else    { setBg(a, list[index]); hero.classList.remove('swap'); }
      aTop = !aTop;
    }, ROT);
  });
})();