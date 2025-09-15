
(function(){
  const tabs = document.querySelectorAll('.tab');
  let MODE = 'both';
  tabs.forEach(b=> b.addEventListener('click', ()=>{
    tabs.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    MODE = b.dataset.mode;
  }));

  const d = document.getElementById('depart');
  const r = document.getElementById('return');
  const today = new Date().toISOString().slice(0,10);
  d.min = today; r.min = today;
  d.addEventListener('change', ()=>{ if (r.value && r.value < d.value) r.value = d.value; r.min = d.value || today; });

  const form = document.getElementById('search-form');
  const btnFlights = document.getElementById('cta-flights');
  const btnHotels  = document.getElementById('cta-hotels');
  const btnBoth    = document.getElementById('cta-both');

  const embedWrap  = document.getElementById('embed-hotel');
  const mapIframe  = document.getElementById('stay22-map');
  const openStay22Btn = document.getElementById('open-stay22');

  function getFields(){
    const originIata = window.resolveIATA(document.getElementById('origin'));
    const destIata   = window.resolveIATA(document.getElementById('destination'));
    const depart = document.getElementById('depart').value;
    const ret    = document.getElementById('return').value;
    const adults = parseInt(document.getElementById('adults').value || '1', 10);
    return { originIata, destIata, depart, ret, adults };
  }
  function ensureFields({ originIata, destIata, depart }){
    if (!originIata || !destIata){ alert('Seleziona origine/destinazione (IATA)'); return false; }
    if (!depart){ alert('Seleziona una data'); return false; }
    return true;
  }
  function updateStay22Embed(address, checkin, checkout){
    const ref = window.getRef?.() || '';
    const base = new URL('https://www.stay22.com/embed/gm');
    base.searchParams.set('aid', window.STAY22_AID);
    base.searchParams.set('address', address);
    if (checkin) base.searchParams.set('checkin', checkin);
    if (checkout) base.searchParams.set('checkout', checkout || checkin);
    if (ref) base.searchParams.append('campaign', ref);
    mapIframe.src = base.toString();
    embedWrap.classList.remove('hidden');
    openStay22Btn.onclick = ()=> window.openStay22({ address, checkin, checkout: checkout || checkin });
  }

  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const f = getFields(); if (!ensureFields(f)) return;
    if (MODE==='flights'){ window.openAviasales({ origin:f.originIata, destination:f.destIata, depart:f.depart, ret:f.ret, adults:f.adults, trip_class:0 }); return; }
    if (MODE==='hotels'){ updateStay22Embed(document.getElementById('destination').value.trim(), f.depart, f.ret || f.depart); return; }
    window.openAviasales({ origin:f.originIata, destination:f.destIata, depart:f.depart, ret:f.ret, adults:f.adults, trip_class:0 });
    updateStay22Embed(document.getElementById('destination').value.trim(), f.depart, f.ret || f.depart);
  });
  btnFlights.addEventListener('click', ()=>{ const f = getFields(); if (!ensureFields(f)) return; window.openAviasales({ origin:f.originIata, destination:f.destIata, depart:f.depart, ret:f.ret, adults:f.adults, trip_class:0 }); });
  btnHotels.addEventListener('click', ()=>{ const f = getFields(); if (!ensureFields(f)) return; updateStay22Embed(document.getElementById('destination').value.trim(), f.depart, f.ret || f.depart); });
})();
