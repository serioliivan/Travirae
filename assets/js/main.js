
(function(){
  const cfg = window.TRV_CFG||{};
  const I18N = window.I18N||{};
  const DEFAULT_LANG = localStorage.getItem('travirae_lang') || 'it';

  function applyLang(lang){
    const dict = I18N[lang] || I18N.it || {};
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el=>{ const k=el.getAttribute('data-i18n'); if(dict[k]) el.textContent = dict[k]; });
    const cont = document.getElementById('tp-widget-container');
    if(cont){
      cont.innerHTML = '';
      const s = document.createElement('script');
      s.async = true; s.charset='utf-8';
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

  function buildStayURL(city, lat, lng){
    const id = cfg.STAY22_EMBED_ID;
    const q = encodeURIComponent(city);
    // send multiple synonyms to satisfy different embed configurations
    const params = [
      `lat=${lat}`, `lng=${lng}`,
      `q=${q}`, `query=${q}`, `search=${q}`, `place=${q}`, `address=${q}`, `city=${q}`, `destination=${q}`, `location=${q}`, `where=${q}`, `keyword=${q}`, `text=${q}`, `name=${q}`,
      `zoom=12`
    ].join('&');
    return `https://www.stay22.com/embed/${id}?${params}`;
  }

  let mapSetTimer = null;
  function setStayMap(city, lat, lng){
    const map = document.getElementById('stay22-widget');
    if(!map) return;
    // Debounce to avoid racing with default load
    clearTimeout(mapSetTimer);
    mapSetTimer = setTimeout(()=>{
      map.src = buildStayURL(city, lat, lng);
      document.getElementById('stay22-section').scrollIntoView({behavior:'smooth', block:'start'});
    }, 120);
  }

  function initDestinations(){
    document.querySelectorAll('.dest-card').forEach(card=>{
      const city = card.dataset.city;
      const lat = card.dataset.lat;
      const lng = card.dataset.lng;
      // Click on card (except Flights button)
      card.addEventListener('click', (e)=>{
        if(e.target.closest('[data-action="flights"]')) return;
        e.preventDefault();
        setStayMap(city, lat, lng);
      });
      const stays = card.querySelector('[data-action="stays"]');
      if(stays){ stays.addEventListener('click', (e)=>{ e.preventDefault(); setStayMap(city, lat, lng); }); }
    });
  }

  function setDefaultBlankMap(){
    const map = document.getElementById('stay22-widget');
    if(!map) return;
    const id = cfg.STAY22_EMBED_ID;
    map.src = `https://www.stay22.com/embed/${id}?lat=0&lng=0&q=&query=&search=&place=&address=&city=&destination=&location=&where=&keyword=&text=&name=`;
  }

  window.addEventListener('load', function(){
    initLang();
    setDefaultBlankMap();
    initDestinations();
  });
})();
