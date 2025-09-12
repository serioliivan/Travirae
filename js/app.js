
import { CONFIG } from './config.js';

const form = document.getElementById('search-form');
const flightBox = document.getElementById('flight-results');
const flightNote = document.getElementById('flight-note');
const hotelBox = document.getElementById('hotel-results');
const spinner = document.getElementById('spinner');

const inputOrigin = document.getElementById('origin');
const inputDestination = document.getElementById('destination');

// ---------- Helpers ----------
function showSpinner(show) { spinner.classList[show ? 'add' : 'remove']('show'); }
function fmtPrice(value, currency) { try { return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value); } catch { return value + ' ' + currency; } }
function card(html){ const d=document.createElement('div'); d.className='result-card'; d.innerHTML = html; return d; }
function q(obj){ return Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
async function fetchJSON(url){ const res = await fetch(url, { mode:'cors' }); if(!res.ok){ throw new Error(`HTTP ${res.status}: ${await res.text()}`); } return res.json(); }
function isIATA(s){ return /^[A-Za-z]{3}$/.test((s||'').trim()); }
function debounce(fn, t=200){ let id; return (...args)=>{ clearTimeout(id); id = setTimeout(()=>fn(...args), t); }; }
function setNote(msg){ flightNote.textContent = msg || ''; flightNote.style.display = msg ? 'block' : 'none'; }

// ---------- Custom Autocomplete ----------
class Autocomplete {
  constructor(input, opts = {}){
    this.input = input;
    this.min = opts.min ?? 2;
    this.maxItems = opts.maxItems ?? 10;
    this.index = -1;
    this.items = [];
    this.dropdown = document.createElement('div');
    this.dropdown.className = 'ac-dropdown';
    input.parentElement.appendChild(this.dropdown);
    this.bind();
  }
  bind(){
    this.input.addEventListener('input', debounce(()=>this.onType(), 180));
    this.input.addEventListener('keydown', (e)=>this.onKey(e));
    this.input.addEventListener('blur', ()=>setTimeout(()=>this.hide(), 150));
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
      row.setAttribute('role', 'option');
      row.innerHTML = `<span class="ac-code">${it.code}</span>
        <div><div>${it.cityName || it.name || ''}</div><div class="ac-meta">${it.label}</div></div>`;
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
  highlight(){
    [...this.dropdown.children].forEach((el,i)=> el.classList.toggle('active', i===this.index));
  }
  choose(i){
    const it = this.items[i];
    if (!it) return;
    this.input.value = it.code; // fill with IATA code
    this.hide();
  }
  show(){ this.dropdown.classList.add('show'); }
  hide(){ this.dropdown.classList.remove('show'); }
}
new Autocomplete(inputOrigin, { min: 2 });
new Autocomplete(inputDestination, { min: 2 });

// ---------- Travelpayouts Autocomplete API (public) ----------
async function getSuggestions(term){
  const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=it&types[]=city&types[]=airport`;
  try {
    const list = await fetchJSON(url);
    return list.map(x=>{
      const code = x.type === 'city' ? x.code : (x.city_code || x.code);
      const cityName = x.type === 'city' ? x.name : (x.city_name || x.name);
      const country = x.country_name || '';
      const label = `${x.name}${country ? ', '+country : ''}${x.type==='airport' ? ' • Aeroporto' : ''}`;
      return { code: (code||'').toUpperCase(), label, cityName, type: x.type, name: x.name };
    });
  } catch (e) { console.warn('autocomplete error', e); return []; }
}

// Resolve to IATA (3 letters) + city name (for hotels)
async function resolveToIATAAndCity(value){
  const raw = (value||'').trim();
  if (isIATA(raw)) return { iata: raw.toUpperCase(), city: raw.toUpperCase() };
  const items = await getSuggestions(raw);
  if (!items.length) throw new Error('Località non trovata. Inserisci una città o codice IATA (3 lettere).');
  const best = items[0];
  return { iata: best.code.toUpperCase(), city: best.cityName || best.code.toUpperCase() };
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
  const url = `${CONFIG.PROXY_BASE_URL}/api/hotels?` + q({
    location, checkIn, checkOut, adults: adults || 1, currency
  });
  const data = await fetchJSON(url);
  return data.results || [];
}

// ---------- Render ----------
function renderFlights(items, currency){
  flightBox.innerHTML = '';
  if(!items.length){ flightBox.appendChild(card('<div>Nessun risultato voli.</div>')); return; }
  items.forEach(it=>{
    const html = `
      <div>
        <div class="price">${fmtPrice(it.price, currency)}</div>
        <div class="helper">
          ${it.origin} → ${it.destination} • ${new Date(it.departure_at).toLocaleString('it-IT')}
          ${it.return_at ? ' • ritorno '+new Date(it.return_at).toLocaleString('it-IT') : ''}
        </div>
        <div class="helper">Compagnia: ${it.airline || '-'} • Scali: ${it.transfers ?? 0}</div>
      </div>
      <div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Aviasales</a></div>`;
    flightBox.appendChild(card(html));
  });
}
function renderHotels(items, currency){
  hotelBox.innerHTML = '';
  if(!items.length){ hotelBox.appendChild(card('<div>Nessun risultato hotel.</div>')); return; }
  items.forEach(it=>{
    const stars = it.stars ? '⭐'.repeat(Math.min(5, it.stars)) : '';
    const html = `
      <div>
        <div class="price">${fmtPrice(it.priceFrom, currency)}</div>
        <div class="helper">${it.hotelName || 'Hotel'} ${stars}</div>
      </div>
      <div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Hotellook</a></div>`;
    hotelBox.appendChild(card(html));
  });
}

// ---------- Submit ----------
form.addEventListener('submit', async (e)=>{
  e.preventDefault();
  showSpinner(true); setNote('');
  flightBox.innerHTML=''; hotelBox.innerHTML='';
  const rawOrigin = inputOrigin.value;
  const rawDest = inputDestination.value;
  const depart = document.getElementById('depart').value;
  const back = document.getElementById('return').value;
  const adults = document.getElementById('adults').value || 1;
  const currency = document.getElementById('currency').value || CONFIG.DEFAULT_CURRENCY;

  try{
    const [{ iata: originIata }, { iata: destIata, city: destCity }] = await Promise.all([
      resolveToIATAAndCity(rawOrigin),
      resolveToIATAAndCity(rawDest)
    ]);

    let flights = await searchFlights({ origin: originIata, destination: destIata, depart, back, currency });
    // Fallback: nessun risultato nel giorno esatto -> usa il mese
    if (!flights.length && depart) {
      const month = depart.slice(0,7);
      const backMonth = back ? back.slice(0,7) : undefined;
      flights = await searchFlights({ origin: originIata, destination: destIata, depart: month, back: backMonth, currency });
      if (flights.length) setNote('Nessun risultato nel giorno scelto. Mostro alternative nello stesso mese.');
    }
    // ordina per prezzo
    flights.sort((a,b)=> (a.price??1e15) - (b.price??1e15));

    const hotels = await searchHotels({ location: destCity || destIata, checkIn: depart, checkOut: back || depart, adults, currency });

    renderFlights(flights, currency);
    renderHotels(hotels, currency);
  }catch(err){
    const msg = err && err.message ? err.message : String(err);
    flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${msg}</div>`));
  }finally{
    showSpinner(false);
  }
});
