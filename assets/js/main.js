// Travirae r8
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

  // Modal basic (same templates as before)
  const modal = document.getElementById('destination-modal');
  if(modal){
    modal.addEventListener('click', (e)=>{
      if(e.target.matches('.modal__close, .modal__overlay')){
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    document.addEventListener('keydown', (e)=>{
      if(e.key==='Escape' && modal.classList.contains('open')){
        modal.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
    $$('.more').forEach(btn => btn.addEventListener('click', ()=>{
      modal.classList.add('open'); document.body.style.overflow='hidden';
    }));
  }
})();