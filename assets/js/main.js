// Travirae v7-worldwide-r7
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        $$('.accordion-item', group).forEach(i=>{
          i.classList.remove('open');
          $('.accordion-toggle', i).setAttribute('aria-expanded','false');
          $('.accordion-panel', i).hidden = true;
        });
        if(!open){
          item.classList.add('open');
          btn.setAttribute('aria-expanded','true');
          panel.hidden = false;
        }
      });
    });
  });

  // Flights form -> Google Flights
  const flightsForm = $('#flights-form');
  if(flightsForm){
    flightsForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const from = $('#from').value.trim();
      const to = $('#to').value.trim();
      const d1 = $('#depart').value;
      const d2 = $('#return').value;
      const adults = $('#adults').value || '1';
      const cabin = $('#cabin').value || 'economy';
      const parts = [];
      if(from && to) parts.push(`volo da ${from} a ${to}`);
      if(d1) parts.push(`partenza ${d1}`);
      if(d2) parts.push(`ritorno ${d2}`);
      parts.push(`${adults} adulti ${cabin}`);
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(parts.join(' ')) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }
  // ===== Replace category icons with photo thumbnails =====
  (function(){
    const photoMap = {
      'mare':'beach,sea,coast',
      'montagna':'mountain,alps,peak',
      'lago':'lake,alpine lake',
      'isole':'tropical island,lagoon',
      'cultura':'museum,old town',
      'relax':'spa,resort',
      'citta':'city skyline,europe city',
      'safari':'safari,africa',
      'esotici':'tropical,paradise beach',
      'natura':'forest,nature',
      'destinazioni-popolari':'landmark,iconic',
      'fuga-romantica':'romantic,couple',
      'anniversario':'romantic dinner,city night',
      'luna-di-miele':'honeymoon,overwater',
      'addio-celibato':'party,nightlife',
      'capodanno-caldo':'fireworks,beach',
      'premium':'luxury,resort',
      'luxury':'luxury,resort',
      'estate':'summer,beach',
      'primavera':'spring,flowers',
      'autunno':'autumn,foliage',
      'inverno':'winter,snow',
      'snowboard':'snowboard,freeride',
      'sci':'ski,skiing',
      'trekking':'hiking,trail',
      'arrampicata':'rock climbing,climber',
      'ciclismo':'cycling,road bike',
      'surf':'surf,wave',
      'immersioni':'scuba diving,reef',
      'snorkeling':'snorkeling,reef',
      'golf':'golf course'
    };
    const slugify = (s)=> (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
    $$('.accordion-toggle.category').forEach(btn=>{
      // remove old icon if present
      const old = btn.querySelector('img.cat-icon'); if(old) old.remove();
      if(!btn.querySelector('img.cat-photo')){
        const label = btn.querySelector('.label')?.textContent || '';
        const slug = slugify(label);
        const q = photoMap[slug] || 'travel,landscape';
        // Use Unsplash source endpoint (random but relevant). Crisp size for HiDPI
        const src = `https://source.unsplash.com/collection/190727/300x180/?${encodeURIComponent(q)}`;
        const img = document.createElement('img');
        img.className = 'cat-photo';
        img.alt = label;
        img.loading = 'lazy';
        img.src = src;
        btn.insertBefore(img, btn.firstChild);
      }
    });
  })();

})();