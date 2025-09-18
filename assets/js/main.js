
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
    const params = [
      `lat=${lat}`, `lng=${lng}`, `zoom=12`,
      `q=${q}`, `query=${q}`, `search=${q}`, `place=${q}`, `address=${q}`, `city=${q}`,
      `destination=${q}`, `location=${q}`, `where=${q}`, `keyword=${q}`, `text=${q}`, `name=${q}`
    ].join('&');
    return `https://www.stay22.com/embed/${id}?${params}`;
  }

  // Modal helpers
  const modal = { el:null, iframe:null, closeBtn:null, open(city,lat,lng){
      if(!this.el){
        this.el = document.getElementById('stay22-modal');
        this.iframe = document.getElementById('stay22-modal-iframe');
        this.closeBtn = this.el.querySelector('.modal__close');
        // close handlers
        this.el.addEventListener('click', (e)=>{ if(e.target === this.el) modal.hide(); });
        this.closeBtn.addEventListener('click', ()=> modal.hide());
        document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') modal.hide(); });
      }
      this.iframe.src = buildStayURL(city, lat, lng);
      this.el.classList.add('show');
      document.body.style.overflow = 'hidden';
      // focus management (a11y)
      this.closeBtn.focus();
    },
    hide(){
      if(!this.el) return;
      this.el.classList.remove('show');
      this.iframe.src = 'about:blank';
      document.body.style.overflow = '';
    }
  };

  function initDestinations(){
    document.querySelectorAll('.dest-card').forEach(card=>{
      const city = card.dataset.city;
      const lat = card.dataset.lat;
      const lng = card.dataset.lng;
      const stays = card.querySelector('[data-action="stays"]');
      if(stays){
        stays.addEventListener('click', (e)=>{
          e.preventDefault();
          e.stopPropagation();
          modal.open(city, lat, lng);
        });
      }
      // Optional: click anywhere on image/title also opens modal
      card.querySelector('img')?.addEventListener('click', (e)=>{ e.preventDefault(); modal.open(city, lat, lng); });
      card.querySelector('.title')?.addEventListener('click', (e)=>{ e.preventDefault(); modal.open(city, lat, lng); });
    });
  }

  // Ensure default (in-page) map is blank; but popup will handle searches
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
