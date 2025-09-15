
// Lightweight autocomplete using Travelpayouts places2 endpoint
(function(){
  const ORIGIN = document.getElementById('origin');
  const DEST = document.getElementById('destination');
  const P1 = document.getElementById('origin-code');
  const P2 = document.getElementById('destination-code');
  const comps = [
    { input: ORIGIN, pill: P1 },
    { input: DEST, pill: P2 }
  ];

  function debounce(fn, t=150){ let id; return (...a)=>{ clearTimeout(id); id=setTimeout(()=>fn(...a), t);}}
  function isIATA(x){ return /^[A-Za-z]{3}$/.test((x||'').trim()); }

  class AC {
    constructor(input, pill){
      this.input = input; this.pill = pill;
      this.box = document.createElement('div');
      this.box.className = 'ac-dropdown';
      input.parentElement.appendChild(this.box);
      input.addEventListener('input', debounce(()=>this.onType(), 120));
      input.addEventListener('keydown', (e)=>this.onKey(e));
      input.addEventListener('blur', ()=> setTimeout(()=> this.hide(), 150));
      input.addEventListener('input', ()=>{ pill.classList.remove('show'); input.removeAttribute('data-iata'); });
      this.items = []; this.index = -1;
    }
    async onType(){
      const term = this.input.value.trim();
      if (term.length < 2){ this.hide(); return; }
      try{
        const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=it&types[]=city&types[]=airport`;
        const r = await fetch(url); const list = await r.json();
        this.items = list.map(x=>{
          const code = (x.code || x.iata || '').toUpperCase();
          const city = x.city_name || x.name;
          const title = x.name;
          const subtitle = x.type === 'airport' ? `${city}${x.country_name ? ', '+x.country_name : ''} • Aeroporto` : `${x.country_name||''}`;
          return { code, title, subtitle };
        }).filter(i=>i.code);
        this.render();
      }catch(e){ this.items=[]; this.hide(); }
    }
    render(){
      if (!this.items.length){ this.hide(); return; }
      this.box.innerHTML = '';
      this.items.slice(0,12).forEach((it,i)=>{
        const row = document.createElement('div');
        row.className = 'ac-item';
        row.innerHTML = `<div class="ac-code">${it.code}</div><div><div class="ac-title">${it.title}</div><div class="ac-meta">${it.subtitle}</div></div>`;
        row.addEventListener('mousedown', (e)=>{ e.preventDefault(); this.choose(i); });
        this.box.appendChild(row);
      });
      this.index = -1; this.show();
    }
    onKey(e){
      if (!this.box.classList.contains('show')) return;
      const max = this.box.children.length;
      if (e.key==='ArrowDown'){ e.preventDefault(); this.index=(this.index+1)%max; this.hi(); }
      else if (e.key==='ArrowUp'){ e.preventDefault(); this.index=(this.index-1+max)%max; this.hi(); }
      else if (e.key==='Enter'){ if (this.index>=0){ e.preventDefault(); this.choose(this.index); } }
      else if (e.key==='Escape'){ this.hide(); }
    }
    hi(){ [...this.box.children].forEach((el,i)=> el.classList.toggle('active', i===this.index)); }
    choose(i){
      const it = this.items[i]; if (!it) return;
      this.input.value = it.title; this.input.dataset.iata = it.code;
      this.pill.textContent = it.code; this.pill.classList.add('show');
      this.hide();
    }
    show(){ this.box.classList.add('show'); }
    hide(){ this.box.classList.remove('show'); }
  }

  comps.forEach(c=> new AC(c.input, c.pill));

  // helpers to resolve IATA
  window.resolveIATA = function(inputEl){
    const raw = (inputEl.value||'').trim();
    if (inputEl.dataset.iata) return inputEl.dataset.iata.toUpperCase();
    if (/^[A-Za-z]{3}$/.test(raw)) return raw.toUpperCase();
    return null; // ask user to pick from dropdown
  };
})();
