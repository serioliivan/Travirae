(function(){
  const cfg = window.TRAVIRAE_CONFIG||{};
  const I18N = window.I18N||{};
  const DEFAULT_LANG = localStorage.getItem('travirae_lang') || 'en';

  function applyLang(lang){
    const dict = I18N[lang] || I18N.en || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const key = el.getAttribute('data-i18n');
      if(dict[key]) el.textContent = dict[key];
    });
    const login = document.querySelector('.auth a.login'); if(login && dict['login']) login.textContent = dict['login'];
    const signup = document.querySelector('.auth a.signup'); if(signup && dict['signup']) signup.textContent = dict['signup'];

    // Travelpayouts widget (locale)
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

  // Defer loading TP widget until hero is painted
  window.addEventListener('load', function(){
    initLangSelector();
  });
})();