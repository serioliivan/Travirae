
import { CONFIG } from './config.js';

const form = document.getElementById('search-form');
const flightBox = document.getElementById('flight-results');
const flightNote = document.getElementById('flight-note');
const flightsMore = document.getElementById('flights-more');
const hotelsMore = document.getElementById('hotels-more');
const hotelBox = document.getElementById('hotel-results');
const spinner = document.getElementById('spinner');
const modalRoot = document.getElementById('modal-root');

const inputOrigin = document.getElementById('origin');
const inputDestination = document.getElementById('destination');
const pillOrigin = document.getElementById('origin-code');
const pillDestination = document.getElementById('destination-code');

const tabs = document.querySelectorAll('.topnav .tab');
let MODE = 'both'; // 'both' | 'flights' | 'hotels'

const state = {
  flightsAll: [], flightsShown: 0,
  hotelsAll: [], hotelsShown: 0,
  pageSize: 10,
  selections: { origin: null, destination: null }
};

// ---------- Helpers ----------
const todayISO = () => new Date().toISOString().slice(0,10);
function showSpinner(show) { spinner.classList[show ? 'add' : 'remove']('show'); }
function fmtPrice(value, currency) { try { return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value); } catch { return value + ' ' + currency; } }
function card(html){ const d=document.createElement('div'); d.className='result-card'; d.innerHTML = html; return d; }
function q(obj){ return Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
async function fetchJSON(url){ const res = await fetch(url, { mode:'cors' }); if(!res.ok){ throw new Error(`HTTP ${res.status}: ${await res.text()}`); } return res.json(); }
function isIATA(s){ return /^[A-Za-z]{3}$/.test((s||'').trim()); }
function debounce(fn, t=160){ let id; return (...args)=>{ clearTimeout(id); id = setTimeout(()=>fn(...args), t); }; }
function setNote(msg){ flightNote.textContent = msg || ''; flightNote.style.display = msg ? 'block' : 'none'; }
function minutesToHM(min){ if(!min && min!==0) return '-'; const h=Math.floor(min/60), m=min%60; return `${h}h ${m}m`; }

// ---------- Modal ----------
function openModal(title, html){
  modalRoot.innerHTML = `<div class="modal-card">
    <div class="modal-head"><div class="modal-title">${title}</div><button class="modal-close" aria-label="Chiudi">Chiudi</button></div>
    <div class="modal-body">${html}</div></div>`;
  modalRoot.classList.remove('hidden');
  modalRoot.setAttribute('aria-hidden','false');
  modalRoot.querySelector('.modal-close').onclick = closeModal;
  modalRoot.onclick = (e)=>{ if(e.target===modalRoot) closeModal(); };
}
function closeModal(){ modalRoot.classList.add('hidden'); modalRoot.setAttribute('aria-hidden','true'); modalRoot.innerHTML=''; }

// ---------- Top nav ----------
tabs.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    tabs.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    MODE = btn.dataset.mode;
  });
});

// ---------- Autocomplete (custom) ----------
class Autocomplete {
  constructor(input, pill){
    this.input = input; this.pill = pill;
    this.min = 2; this.maxItems = 12;
    this.index = -1; this.items = [];
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ac-dropdown';
    input.parentElement.appendChild(this.dropdown);
    input.addEventListener('input', debounce(()=>this.onType(), 150));
    input.addEventListener('keydown', (e)=>this.onKey(e));
    input.addEventListener('blur', ()=>setTimeout(()=>this.hide(), 120));
    input.addEventListener('input', ()=>{ this.pill.classList.remove('show'); input.removeAttribute('data-iata'); });
  }
  async onType(){
    const term = this.input.value.trim();
    if (term.length < this.min) { this.hide(); return; }
    this.items = await getSuggestions(term);
    this.render();
  }
  render(){
    if (!this.items.length) { this.hide(); return; }
    this.dropdown.innerHTML = '';
    this.items.slice(0, this.maxItems).forEach((it, i)=>{
      const row = document.createElement('div');
      row.className = 'ac-item';
      row.innerHTML = `
        <div class="ac-code">${it.code}</div>
        <div>
          <div class="ac-title">${it.title}</div>
          <div class="ac-meta">${it.subtitle}</div>
        </div>`;
      row.addEventListener('mousedown', (e)=>{ e.preventDefault(); this.choose(i); });
      this.dropdown.appendChild(row);
    });
    this.index = -1;
    this.show();
  }
  onKey(e){
    if (!this.dropdown.classList.contains('show')) return;
    const max = this.dropdown.children.length;
    if (e.key === 'ArrowDown'){ e.preventDefault(); this.index = (this.index + 1) % max; this.highlight(); }
    else if (e.key === 'ArrowUp'){ e.preventDefault(); this.index = (this.index - 1 + max) % max; this.highlight(); }
    else if (e.key === 'Enter'){ if (this.index >= 0){ e.preventDefault(); this.choose(this.index); } }
    else if (e.key === 'Escape'){ this.hide(); }
  }
  highlight(){ [...this.dropdown.children].forEach((el,i)=> el.classList.toggle('active', i===this.index)); }
  choose(i){
    const it = this.items[i]; if (!it) return;
    this.input.value = it.title; // mostra nome leggibile
    this.input.dataset.iata = it.code; // codice selezionato (aeroporto o città)
    this.input.dataset.cityIata = (it.city_code || it.code);
    this.input.dataset.cityName = it.cityName || it.title;
    this.input.dataset.type = it.type;
    this.pill.textContent = it.code; this.pill.classList.add('show');
    this.hide();
  }
  show(){ this.dropdown.classList.add('show'); }
  hide(){ this.dropdown.classList.remove('show'); }
}
new Autocomplete(inputOrigin, pillOrigin);
new Autocomplete(inputDestination, pillDestination);

// Suggestions from Travelpayouts Autocomplete
async function getSuggestions(term){
  const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=it&types[]=city&types[]=airport`;
  try{
    const list = await fetchJSON(url);
    return list.map(x=>{
      const code = (x.code || x.iata || '').toUpperCase();
      const city_code = (x.city_code || x.code || '').toUpperCase();
      const cityName = x.city_name || x.name;
      const title = x.type === 'airport' ? `${x.name}` : `${x.name}`;
      const subtitle = x.type === 'airport' ? `${cityName}${x.country_name ? ', '+x.country_name : ''} • Aeroporto` : `${x.country_name || ''}`;
      return { code, city_code, cityName, title, subtitle, type: x.type };
    }).filter(it=>it.code);
  }catch(e){ console.warn('autocomplete error', e); return []; }
}

// Resolve to IATA & city for submit
async function resolveField(input){
  const raw = (input.value||'').trim();
  if (input.dataset.iata && raw.length){
    return {
      displayCode: input.dataset.iata.toUpperCase(),
      flightIata: (input.dataset.cityIata || input.dataset.iata).toUpperCase(), // per voli usiamo il codice CITTA'
      cityIata: (input.dataset.cityIata || input.dataset.iata).toUpperCase(),
      cityName: input.dataset.cityName || input.value,
      title: input.value,
      type: input.dataset.type || 'city'
    };
  }
  if (isIATA(raw)){
    const items = await getSuggestions(raw);
    const first = items.find(i=>i.code===raw.toUpperCase()) || items[0];
    return {
      displayCode: first?.code || raw.toUpperCase(),
      flightIata: first?.city_code || raw.toUpperCase(),
      cityIata: first?.city_code || raw.toUpperCase(),
      cityName: first?.cityName || raw.toUpperCase(),
      title: first?.title || raw.toUpperCase(),
      type: first?.type || 'city'
    };
  }
  const items = await getSuggestions(raw);
  if (!items.length) throw new Error('Località non trovata. Inserisci una città o codice IATA.');
  const best = items[0];
  return {
    displayCode: best.code,
    flightIata: best.city_code || best.code,
    cityIata: best.city_code || best.code,
    cityName: best.cityName || best.title,
    title: best.title,
    type: best.type
  };
}

// ---------- Proxy calls ----------
async function searchFlights({ origin, destination, depart, back, currency }){
  const url = `${CONFIG.PROXY_BASE_URL}/api/flights?` + q({
    origin, destination, departure_at: depart, return_at: back || undefined,
    currency, locale: CONFIG.DEFAULT_LOCALE, market: CONFIG.DEFAULT_MARKET
  });
  const data = await fetchJSON(url);
  return data.results || [];
}

async function searchHotels({ location, checkIn, checkOut, adults, currency }){
  const url = `${CONFIG.PROXY_BASE_URL}/api/hotels?` + q({ location, checkIn, checkOut, adults: adults || 1, currency });
  const data = await fetchJSON(url);
  return data.results || [];
}

// ---------- Rendering & pagination ----------
function renderFlightsPaged(items, currency){
  state.flightsAll = items; state.flightsShown = 0; flightBox.innerHTML = '';
  showMoreFlights(currency);
}
function showMoreFlights(currency){
  const start = state.flightsShown, end = Math.min(state.flightsAll.length, start + state.pageSize);
  const slice = state.flightsAll.slice(start, end);
  for (const it of slice){
    const html = `
      <div>
        <div class="price">${fmtPrice(it.price, currency)}</div>
        <div class="helper">
          ${it.origin} → ${it.destination} • ${new Date(it.departure_at).toLocaleString('it-IT')}
          ${it.return_at ? ' • ritorno '+new Date(it.return_at).toLocaleString('it-IT') : ''}
        </div>
        <div class="helper">Compagnia: ${it.airline || '-'} • Scali: ${it.transfers ?? 0} • Durata: ${minutesToHM(it.duration)}</div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Aviasales</a>
          <button class="btn" type="button" data-action="info">Info</button>
        </div>
      </div>`;
    const el = card(html);
    el.querySelector('[data-action="info"]').addEventListener('click', ()=>{
      const info = `
        <div class="helper">Tratta: <b>${it.origin} → ${it.destination}</b></div>
        <ul>
          <li><b>Partenza:</b> ${new Date(it.departure_at).toLocaleString('it-IT')}</li>
          ${it.return_at ? `<li><b>Ritorno:</b> ${new Date(it.return_at).toLocaleString('it-IT')}</li>` : ''}
          <li><b>Compagnia:</b> ${it.airline || '-'}</li>
          ${it.flight_number ? `<li><b>Volo:</b> ${it.airline || ''} ${it.flight_number}</li>` : ''}
          <li><b>Scali andata:</b> ${it.transfers ?? 0}${it.return_transfers!=null ? ` • Scali ritorno: ${it.return_transfers}` : ''}</li>
          <li><b>Durata totale:</b> ${minutesToHM(it.duration)}</li>
        </ul>
        <div style="margin-top:10px"><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Apri su Aviasales</a></div>
      `;
      openModal('Dettagli volo', info);
    });
    flightBox.appendChild(el);
  }
  state.flightsShown = end;
  flightsMore.classList.toggle('hidden', end >= state.flightsAll.length);
}

function renderHotelsPaged(items, currency){
  state.hotelsAll = items; state.hotelsShown = 0; hotelBox.innerHTML = '';
  showMoreHotels(currency);
}
function buildPhotoList(hid){
  // try multiple real hotel photos: h{id}_1, h{id}_2, ... (fallback to main and picsum)
  const list = [];
  for (let i=1;i<=6;i++){ list.push(`https://photo.hotellook.com/image_v2/limit/h${hid}_${i}/640/420.auto`); }
  list.push(`https://photo.hotellook.com/image_v2/limit/h${hid}/640/420.jpg`);
  list.push(`https://picsum.photos/seed/h${hid}/640/420`);
  return list;
}
function showMoreHotels(currency){
  const start = state.hotelsShown, end = Math.min(state.hotelsAll.length, start + state.pageSize);
  const slice = state.hotelsAll.slice(start, end);
  for (const it of slice){
    const photos = buildPhotoList(it.hotelId || it.id || '0');
    const imgHtml = `<div class="slider" data-hid="${it.hotelId}">
      <img alt="Foto ${it.hotelName||'Hotel'}" src="${photos[0]}" onerror="(function(el){ const arr='${photos.join('|')}'.split('|'); let i=(+el.dataset.i||0)+1; if(i<arr.length){ el.src=arr[i]; el.dataset.i=i; } })(this)">
      <div class="nav"><button class="btn" data-s="prev">‹</button><button class="btn" data-s="next">›</button></div>
      <div class="dots">${photos.slice(0,3).map((_,i)=>`<span class="dot ${i===0?'active':''}"></span>`).join('')}</div>
    </div>`;

    const stars = it.stars ? '⭐'.repeat(Math.min(5, it.stars)) : '';
    const html = `
      <div>
        ${imgHtml}
        <div style="margin-top:8px">
          <div class="price">${fmtPrice(it.priceFrom, currency)}</div>
          <div class="helper">${it.hotelName || 'Hotel'} ${stars}</div>
        </div>
        <div style="margin-top:8px;display:flex;gap:8px;flex-wrap:wrap">
          <a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Hotellook</a>
          <button class="btn" type="button" data-action="info">Info</button>
        </div>
      </div>`;

    const el = card(html);
    // slider simple next/prev over photos
    const slider = el.querySelector('.slider');
    const img = slider.querySelector('img');
    const dots = slider.querySelectorAll('.dot');
    let idx = 0;
    function setIdx(i){ const n=photos.length; idx=((i%n)+n)%n; img.dataset.i = idx; img.src = photos[idx]; dots.forEach((d,j)=>d.classList.toggle('active', j===idx%3)); }
    slider.querySelector('[data-s="prev"]').onclick = ()=> setIdx(idx-1);
    slider.querySelector('[data-s="next"]').onclick = ()=> setIdx(idx+1);

    el.querySelector('[data-action="info"]').addEventListener('click', ()=>{
      const info = `
        <div class="helper"><b>${it.hotelName || 'Hotel'}</b>${stars? ' • '+stars : ''}</div>
        <ul>
          ${it.hotelId ? `<li><b>ID hotel:</b> ${it.hotelId}</li>`: ''}
          ${it.locationId ? `<li><b>ID località:</b> ${it.locationId}</li>`: ''}
          <li><b>Prezzo da:</b> ${fmtPrice(it.priceFrom, currency)}</li>
          <li>Nota: immagini e dettagli sono indicativi; verifica su Hotellook prima di prenotare.</li>
        </ul>
        <div style="margin-top:10px"><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Apri su Hotellook</a></div>
      `;
      openModal('Informazioni hotel', info);
    });

    hotelBox.appendChild(el);
  }
  state.hotelsShown = end;
  hotelsMore.classList.toggle('hidden', end >= state.hotelsAll.length);
}

flightsMore.querySelector('button').addEventListener('click', ()=> showMoreFlights(document.getElementById('currency').value || 'EUR'));
hotelsMore.querySelector('button').addEventListener('click', ()=> showMoreHotels(document.getElementById('currency').value || 'EUR'));

// ---------- Submit with smart fallback ----------
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  showSpinner(true); setNote('');
  flightBox.innerHTML=''; hotelBox.innerHTML='';
  flightsMore.classList.add('hidden'); hotelsMore.classList.add('hidden');

  const depart = document.getElementById('depart').value;
  const back = document.getElementById('return').value;
  const adults = document.getElementById('adults').value || 1;
  const currency = document.getElementById('currency').value || CONFIG.DEFAULT_CURRENCY;

  // keep return >= depart
  if (depart && back && back < depart){
    document.getElementById('return').value = depart;
  }

  try{
    const [orig, dest] = await Promise.all([resolveField(inputOrigin), resolveField(inputDestination)]);

    const tasks = [];
    if (MODE !== 'hotels'){
      tasks.push((async ()=>{
        let flights = await searchFlights({ origin: orig.flightIata, destination: dest.flightIata, depart, back, currency });

        // If zero results on that exact day, try +/- 2 days (flex) before falling back to month
        if (!flights.length && depart){
          const d = new Date(depart);
          const candidates = [ -2, -1, 1, 2 ].map(off=>{
            const dd = new Date(d); dd.setDate(dd.getDate()+off);
            return dd.toISOString().slice(0,10);
          });
          for (const dd of candidates){
            const res = await searchFlights({ origin: orig.flightIata, destination: dest.flightIata, depart: dd, back, currency });
            flights = flights.concat(res || []);
          }
          if (flights.length) setNote('Nessun risultato esatto nel giorno scelto. Mostro alternative ±2 giorni.');
        }

        // if still none, do month
        if (!flights.length && depart){
          const month = depart.slice(0,7);
          const backMonth = back ? back.slice(0,7) : undefined;
          const flightsMonth = await searchFlights({ origin: orig.flightIata, destination: dest.flightIata, depart: month, back: backMonth, currency });
          if (flightsMonth.length) setNote('Nessun risultato nel giorno scelto. Mostro alternative nello stesso mese.');
          flights = flightsMonth;
        }

        // sort and render
        flights.sort((a,b)=> (a.price??1e15) - (b.price??1e15));
        renderFlightsPaged(flights, currency);
      })());
    }
    if (MODE !== 'flights'){
      tasks.push(searchHotels({ location: dest.cityName || dest.cityIata, checkIn: depart, checkOut: back || depart, adults, currency }).then((hotels)=>{
        renderHotelsPaged(hotels, currency);
      }));
    }
    await Promise.all(tasks);
  }catch(err){
    const msg = err && err.message ? err.message : String(err);
    flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${msg}</div>`));
  }finally{
    showSpinner(false);
  }
});

// ---------- Defaults: min dates ----------
(function initDates(){
  const d = document.getElementById('depart');
  const r = document.getElementById('return');
  const today = new Date().toISOString().slice(0,10);
  d.min = today; r.min = today;
  d.addEventListener('change', ()=>{ if (r.value && r.value < d.value) r.value = d.value; r.min = d.value || today; });
})();
