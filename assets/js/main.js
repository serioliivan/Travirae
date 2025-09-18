// Travirae site interactions
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  // Mobile nav toggle
  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.style.display = expanded ? 'none' : 'flex';
    });
  }

  // Year
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  // Accordion behavior (single open per group)
  $$('.accordion').forEach(group => {
    $$('.accordion-item', group).forEach(item => {
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', () => {
        const open = item.classList.contains('open');
        // close all in this group
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

  // Map behavior
  const map = $('#stay22-widget');
  const label = $('#map-destination-label');

  // If you have specific Stay22 embed URLs per città, put them here:
  // Esempio: {'Roma':'https://www.stay22.com/embed/XXXXX', 'Parigi':'https://www.stay22.com/embed/YYYYY'}
  const stay22Embeds = {
    // 'Roma':'https://www.stay22.com/embed/your-map-id',
    // 'Parigi':'https://www.stay22.com/embed/your-map-id'
  };

  function selectDestination(name){
    if(label){ label.textContent = 'Hotel vicino a ' + name; }
    if(stay22Embeds[name]){
      map.src = stay22Embeds[name];
    }
    // Scroll to map
    const mapSection = $('#map-section');
    if(mapSection){ mapSection.scrollIntoView({behavior:'smooth', block:'start'}); }
  }

  // Bind all destination triggers
  $$('[data-destination]').forEach(el => {
    el.addEventListener('click', () => selectDestination(el.dataset.destination));
  });

  // Flights form -> open Google Flights with a smart query
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
      const q = parts.join(' ');
      const url = 'https://www.google.com/travel/flights?q=' + encodeURIComponent(q) + '&hl=it';
      window.open(url, '_blank', 'noopener');
    });
  }
})();