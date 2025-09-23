// Travirae r11
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));

  const navToggle = $('.nav-toggle');
  const mainNav = $('.main-nav');
  if(navToggle){
    navToggle.addEventListener('click', ()=>{
      const open = mainNav.style.display==='flex';
      mainNav.style.display = open ? 'none' : 'flex';
    });
  }
  const y = $('#year-copy'); if(y) y.textContent = new Date().getFullYear();

  // Accordion
  $$('.accordion').forEach(group=>{
    $$('.accordion-item', group).forEach(item=>{
      const btn = $('.accordion-toggle', item);
      const panel = $('.accordion-panel', item);
      btn.addEventListener('click', ()=>{
        const isOpen = item.classList.contains('open');
        $$('.accordion-item', group).forEach(i=>{i.classList.remove('open'); $('.accordion-panel', i).hidden = true; $('.accordion-toggle', i).setAttribute('aria-expanded','false');});
        if(!isOpen){ item.classList.add('open'); panel.hidden = false; btn.setAttribute('aria-expanded','true'); }
      });
    });
  });

  // Modal "Scopri di più"
  const modal = $('#modal');
  if(modal){
    const closeBtn = $('.modal-close', modal);
    const titleEl = $('#modal-title', modal);
    const descEl = $('.desc', modal);
    const bulletsEl = $('.bullets', modal);
    const whenEl = $('.when', modal);
    const bonusEl = $('.bonus', modal);

    const makeCopy = (name)=>({
      desc: `${name} è una scelta top per un viaggio memorabile: atmosfera locale, panorami e esperienze autentiche. Ideale per 3–5 giorni, ma perfetta anche per un soggiorno più lungo se vuoi esplorare con calma. ✨`,
      bullets: ['Quartieri imperdibili e viewpoint','Musei/luoghi simbolo','Cibo tipico e mercati','Gite a breve raggio'],
      when: '📅 <strong>Periodo consigliato:</strong> in genere da fine primavera a inizio autunno; per mare o neve varia in base alla meta.',
      bonus: '🎁 <strong>Bonus:</strong> prenota in settimana per prezzi migliori e orari più comodi.'
    });

    function openModal(city){
      const copy = makeCopy(city);
      titleEl.textContent = city;
      descEl.textContent = copy.desc;
      bulletsEl.innerHTML = copy.bullets.map(b=>`<li>${b}</li>`).join('');
      whenEl.innerHTML = copy.when;
      bonusEl.innerHTML = copy.bonus;
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    }
    function closeModal(){
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    }
    closeBtn.addEventListener('click', closeModal);
    $('.modal-backdrop', modal).addEventListener('click', closeModal);
    window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeModal(); });

    $$('.more').forEach(btn=>btn.addEventListener('click', e=>{
      const city = e.currentTarget.dataset.city || 'Destinazione';
      openModal(city);
    }));
  }
})();