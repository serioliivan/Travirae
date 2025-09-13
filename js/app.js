
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
function pad2(n){ return String(n).padStart(2,'0'); }
function card(html){ const d=document.createElement('div'); d.className='result-card'; d.innerHTML = html; return d; }
function q(obj){ return Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
async function fetchJSON(url){ const res = await fetch(url, { mode:'cors' }); if(!res.ok){ throw new Error(`HTTP ${res.status}: ${await res.text()}`); } return res.json(); }
function isIATA(s){ return /^[A-Za-z]{3}$/.test((s||'').trim()); }
function debounce(fn, t=180){ let id; return (...args)=>{ clearTimeout(id); id = setTimeout(()=>fn(...args), t); }; }
function setNote(msg){ flightNote.textContent = msg || ''; flightNote.style.display = msg ? 'block' : 'none'; }
function minutesToHM(min){ if(!min && min!==0) return '-'; const h=Math.floor(min/60), m=min%60; return `${h}h ${m}m`; }

// ---------- Modal ----------
function openModal(title, html){
  modalRoot.innerHTML = `<div class="modal-card">
    <div class="modal-head"><div class="modal-title">${title}</div><button class="modal-close" aria-label="Chiudi">Chiudi</button></div>
    <div class="modal-body">${html}</div>
  </div>`;
  modalRoot.classList.remove('hidden');
  modalRoot.setAttribute('aria-hidden','false');
  modalRoot.querySelector('.modal-close').onclick = closeModal;
  modalRoot.onclick = (e)=>{ if(e.target===modalRoot) closeModal(); };
}
function closeModal(){
  modalRoot.classList.add('hidden');
  modalRoot.setAttribute('aria-hidden','true');
  modalRoot.innerHTML='';
}

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
    input.addEventListener('input', ()=>{ this.pill.classList.remove('show'); });
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
    this.input.value = it.title; // visualizza il nome (es. "Aeroporto di Milano Linate")
    this.input.dataset.iata = it.code; // mantieni IATA selezionato
    this.input.dataset.city = it.cityName || it.city_code || it.code;
    this.input.dataset.type = it.type;
    this.pill.textContent = it.code; this.pill.classList.add('show');
    this.hide();
    // salva selezione globale
    const key = (this.input.id === 'origin') ? 'origin' : 'destination';
    state.selections[key] = { iata: it.code, title: it.title, type: it.type, city: this.input.dataset.city };
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
      // IMPORTANT: for airports show airport IATA (LIN, MXP, BGY). For cities show city IATA (MIL).
      const code = (x.type === 'airport') ? (x.code || x.iata) : (x.code || x.iata);
      const cityName = x.city_name || x.name;
      const title = x.type === 'airport' ? `${x.name}` : `${x.name}`;
      const subtitle = x.type === 'airport' ? `${cityName}${x.country_name ? ', '+x.country_name : ''} • Aeroporto` : `${x.country_name || ''}`;
      return { code: String(code||'').toUpperCase(), title, subtitle, type: x.type, cityName, city_code: x.city_code };
    }).filter(it=>it.code);
  }catch(e){ console.warn('autocomplete error', e); return []; }
}

// Resolve to IATA and city when submitting
async function resolveField(input){
  const raw = (input.value||'').trim();
  if (input.dataset.iata && raw.length) {
    return { iata: input.dataset.iata.toUpperCase(), city: (input.dataset.city||input.dataset.iata).toUpperCase(), title: input.value };
  }
  if (isIATA(raw)) {
    const suggestions = await getSuggestions(raw);
    const first = suggestions.find(s=>s.code.toUpperCase()===raw.toUpperCase());
    const city = first?.cityName || raw.toUpperCase();
    return { iata: raw.toUpperCase(), city: city.toUpperCase(), title: first?.title || raw.toUpperCase() };
  }
  // last resort: try fetch suggestions and take best
  const items = await getSuggestions(raw);
  if (!items.length) throw new Error('Località non trovata. Inserisci una città o codice IATA (3 lettere).');
  const best = items[0];
  return { iata: best.code.toUpperCase(), city: (best.cityName||best.code).toUpperCase(), title: best.title };
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

// ---------- Rendering with pagination ----------
function renderFlightsPaged(items, currency){
  state.flightsAll = items; state.flightsShown = 0;
  flightBox.innerHTML = '';
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
  state.hotelsAll = items; state.hotelsShown = 0;
  hotelBox.innerHTML = '';
  showMoreHotels(currency);
}
function showMoreHotels(currency){
  const start = state.hotelsShown, end = Math.min(state.hotelsAll.length, start + state.pageSize);
  const slice = state.hotelsAll.slice(start, end);
  for (const it of slice){
    const photoCandidates = [
      `https://photo.hotellook.com/image_v2/limit/h${it.hotelId}/640/420.jpg`,
      `https://photo.hotellook.com/image_v2/limit/${it.hotelId}/640/420.auto`,
      `https://picsum.photos/seed/h${it.hotelId}/640/420`
    ];
    const imgHtml = `<div class="slider" data-hid="${it.hotelId}">
      <img alt="Foto ${it.hotelName||'Hotel'}" src="${photoCandidates[0]}" onerror="this.dataset.i=(this.dataset.i||0); let i=parseInt(this.dataset.i)+1; const arr=['${photoCandidates[0]}','${photoCandidates[1]}','${photoCandidates[2]}']; if(i<arr.length){ this.src=arr[i]; this.dataset.i=i; }">
      <div class="nav"><button class="btn" data-s="prev">‹</button><button class="btn" data-s="next">›</button></div>
      <div class="dots"><span class="dot active"></span><span class="dot"></span><span class="dot"></span></div>
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
    // slider dumb next/prev (cycles placeholder candidates)
    const slider = el.querySelector('.slider');
    const img = slider.querySelector('img');
    const dots = slider.querySelectorAll('.dot');
    let idx = 0;
    function setIdx(i){ idx = (i+3)%3; img.dataset.i = idx; const arr=[
      `https://photo.hotellook.com/image_v2/limit/h${it.hotelId}/640/420.jpg`,
      `https://photo.hotellook.com/image_v2/limit/${it.hotelId}/640/420.auto`,
      `https://picsum.photos/seed/h${it.hotelId}/640/420`
    ]; img.src = arr[idx]; dots.forEach((d,j)=>d.classList.toggle('active', j===idx)); }
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

// ---------- Submit ----------
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
      tasks.push(searchFlights({ origin: orig.iata, destination: dest.iata, depart, back, currency }).then(async (flights)=>{
        // Fallback per mese
        if (!flights.length && depart){
          const month = depart.slice(0,7);
          const backMonth = back ? back.slice(0,7) : undefined;
          const flightsMonth = await searchFlights({ origin: orig.iata, destination: dest.iata, depart: month, back: backMonth, currency });
          if (flightsMonth.length) setNote('Nessun risultato nel giorno scelto. Mostro alternative nello stesso mese.');
          flights = flightsMonth;
        }
        flights.sort((a,b)=> (a.price??1e15) - (b.price??1e15));
        renderFlightsPaged(flights, currency);
      }));
    }
    if (MODE !== 'flights'){
      tasks.push(searchHotels({ location: dest.city || dest.iata, checkIn: depart, checkOut: back || depart, adults, currency }).then((hotels)=>{
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

// ---------- Defaults: set sensible min dates ----------
(function initDates(){
  const d = document.getElementById('depart');
  const r = document.getElementById('return');
  const today = todayISO();
  d.min = today; r.min = today;
  d.addEventListener('change', ()=>{ if (r.value && r.value < d.value) r.value = d.value; r.min = d.value || today; });
})();
