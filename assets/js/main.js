
(function(){
  const cfg = window.TRV_CFG||{};
  const I18N = window.I18N||{};
  const DEFAULT_LANG = localStorage.getItem('travirae_lang') || 'it';

  function applyLang(lang){
    const dict = I18N[lang] || I18N.it || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{
      const k = el.getAttribute('data-i18n'); if(dict[k]) el.textContent = dict[k];
    });
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
    if(sel){
      sel.value = DEFAULT_LANG;
      sel.addEventListener('change', e=>{localStorage.setItem('travirae_lang', e.target.value); applyLang(e.target.value);});
    }
    applyLang(DEFAULT_LANG);
  }

  function setStayMap(lat,lng){
    const map = document.getElementById('stay22-widget');
    if(!map) return;
    const url = `https://www.stay22.com/embed/${cfg.STAY22_EMBED_ID}?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}`;
    map.src = url;
    document.getElementById('stay22-section').scrollIntoView({behavior:'smooth', block:'start'});
  }

  function initDestCards(){
    document.querySelectorAll('.dest-card').forEach(card=>{
      const {lat, lng} = card.dataset;
      // Click anywhere on card (except Flights) -> open stays
      card.addEventListener('click', (e)=>{
        if(e.target.closest('[data-action="flights"]')) return;
        e.preventDefault();
        setStayMap(lat,lng);
      });
      // Explicit buttons
      const stayBtn = card.querySelector('[data-action="stays"]');
      const flightBtn = card.querySelector('[data-action="flights"]');
      if(stayBtn){ stayBtn.addEventListener('click', (e)=>{ e.preventDefault(); setStayMap(lat,lng); }); }
      if(flightBtn){ flightBtn.addEventListener('click', ()=>{
        document.getElementById('flight-widget')?.scrollIntoView({behavior:'smooth'});
      }); }
    });
  }

  window.addEventListener('load', function(){ initLang(); initDestCards(); });
})();
