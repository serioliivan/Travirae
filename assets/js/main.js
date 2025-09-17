(function(){
  const cfg = window.TRAVIRAE_CONFIG||{};
  const I18N = window.I18N||{};
  const DEFAULT_LANG = localStorage.getItem('travirae_lang') || 'en';

  function setBg(el,u){ if(el) el.style.backgroundImage = `url('${u}')`; }
  function preload(url){ return new Promise(res => { const i=new Image(); i.loading='eager'; i.decoding='async'; i.onload=()=>res(url); i.onerror=()=>res(null); i.src=url; }); }

  async function initHero(){
    const layer = document.querySelector('.hero-bg .layer');
    if(!layer) return;
    if(cfg.HERO_IMAGE_LOCAL) setBg(layer, cfg.HERO_IMAGE_LOCAL);
    if(cfg.HERO_IMAGE_REMOTE){
      const ok = await preload(cfg.HERO_IMAGE_REMOTE);
      if(ok) setBg(layer, ok);
    }
  }

  function applyLang(lang){
    const dict = I18N[lang] || I18N.en || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    const login = document.querySelector('.auth a.login'); if(login && dict['login']) login.textContent = dict['login'];
    const signup = document.querySelector('.auth a.signup'); if(signup && dict['signup']) signup.textContent = dict['signup'];

    document.querySelectorAll('#tp-widget-container').forEach(container=>{
      container.innerHTML = '';
      const s = document.createElement('script');
      s.async = true; s.charset = 'utf-8';
      s.src = (cfg.TP_WIDGET_BASE || '') + encodeURIComponent(lang);
      container.appendChild(s);
    });
  }

  function initLangSelector(){
    const sel = document.getElementById('lang-select');
    if(!sel) return;
    sel.value = DEFAULT_LANG;
    applyLang(DEFAULT_LANG);
    sel.addEventListener('change', function(){
      const lang = sel.value;
      localStorage.setItem('travirae_lang', lang);
      applyLang(lang);
    });
  }

  function initQuicklinks(){
    document.body.addEventListener('click', function(e){
      const anchor = e.target.closest('a[data-address]');
      if(!anchor) return;
      const addr = anchor.getAttribute('data-address');
      if(!addr) return;
      e.preventDefault();
      const frame = document.getElementById('stay22-dynamic');
      if(frame){
        const p = new URLSearchParams();
        p.set('aid', cfg.STAY22_AID||'travirae');
        p.set('address', addr);
        p.set('campaign', 'home_destination_card');
        frame.src = "https://www.stay22.com/embed/gm?" + p.toString();
      }
      document.getElementById('stay22-section')?.scrollIntoView({behavior:'smooth', block:'start'});
    });
  }

  window.addEventListener('load', function(){
    initHero();
    initLangSelector();
    initQuicklinks();
  });
})();