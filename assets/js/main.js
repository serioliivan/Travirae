
(function(){
  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>Array.from(el.querySelectorAll(s));
  const year = new Date().getFullYear();
  (document.getElementById('year')||{}).textContent = year;

  // Accordion
  $$('.acc-toggle').forEach(btn=>{
    const panel = btn.parentElement.querySelector('.acc-panel');
    btn.addEventListener('click', ()=>{
      const isOpen = btn.classList.contains('open');
      document.querySelectorAll('.acc-toggle.open').forEach(b=>{b.classList.remove('open'); b.parentElement.querySelector('.acc-panel').hidden=true;});
      if(!isOpen){ btn.classList.add('open'); panel.hidden=false; }
      else panel.hidden=true;
    });
  });

  // Modal
  const modal = document.getElementById('modal');
  if(modal){
    const close = modal.querySelector('.modal-close');
    const backdrop = modal.querySelector('.modal-backdrop');
    const title = modal.querySelector('#modal-title');
    const desc  = modal.querySelector('.desc');
    const bullets = modal.querySelector('.bullets');
    const when = modal.querySelector('.when');
    const bonus = modal.querySelector('.bonus');
    function open(city){
      title.textContent = city;
      desc.textContent = city + ' è una scelta top per un viaggio memorabile: atmosfera locale, panorami e esperienze autentiche. Ideale per 3–5 giorni. ✨';
      bullets.innerHTML = ['Quartieri/viewpoint','Luoghi simbolo','Cibo tipico','Gite in giornata'].map(x=>'<li>'+x+'</li>').join('');
      when.innerHTML = '📅 <strong>Periodo consigliato:</strong> in genere da fine primavera a inizio autunno (varia per mare/neve).';
      bonus.innerHTML = '🎁 <strong>Bonus:</strong> prenota in settimana per prezzi migliori.';
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    }
    function closeM(){ modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    close.addEventListener('click', closeM);
    backdrop.addEventListener('click', closeM);
    window.addEventListener('keydown', e=>{ if(e.key==='Escape') closeM(); });
    document.querySelectorAll('.more').forEach(b=>b.addEventListener('click', e=>open(e.currentTarget.dataset.city)));
  }
})(); 
