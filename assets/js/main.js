
// i18n dictionaries are loaded by i18n.js (same as v15r). Below we only add behaviors.
(function(){
  const cfg = window.TRV_CFG||{};
  const I18N = window.I18N||{};
  const DEFAULT_LANG = localStorage.getItem('travirae_lang') || 'it';

  function applyLang(lang){
    const dict = I18N[lang] || I18N.it || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    const login = document.querySelector('.auth a.login'); if(login && dict['login']) login.textContent = dict['login'];
    const signup = document.querySelector('.auth a.signup'); if(signup && dict['signup']) signup.textContent = dict['signup'];

    // reload Aviasales widget with locale
    const cont = document.getElementById('tp-widget-container');
    if(cont){
      cont.innerHTML = '';
      const s = document.createElement('script');
      s.async = true; s.charset = 'utf-8';
      s.src = (cfg.TP_WIDGET_BASE||'') + encodeURIComponent(lang);
      cont.appendChild(s);
    }
  }

  function initLang(){
    const sel = document.getElementById('lang-select');
    if(sel){ sel.value = DEFAULT_LANG; sel.addEventListener('change', e=>{localStorage.setItem('travirae_lang', e.target.value); applyLang(e.target.value);}); }
    applyLang(DEFAULT_LANG);
  }

  // Clicking "Stays" on a destination centers Stay22 on that city
  function initDestinations(){
    const map = document.getElementById('stay22-widget');
    document.querySelectorAll('[data-stay-lat][data-stay-lng]').forEach(btn=>{
      btn.addEventListener('click', function(e){
        e.preventDefault();
        const lat = btn.getAttribute('data-stay-lat');
        const lng = btn.getAttribute('data-stay-lng');
        const url = `https://www.stay22.com/embed/${cfg.STAY22_EMBED_ID}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
        if(map){ map.src = url; }
        document.getElementById('stay22-section').scrollIntoView({behavior:'smooth', block:'start'});
      });
    });
  }

  window.addEventListener('load', function(){ initLang(); initDestinations(); });
})();
