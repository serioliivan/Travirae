import { CONFIG } from './config.js';

const form = document.getElementById('search-form');
const flightBox = document.getElementById('flight-results');
const hotelBox = document.getElementById('hotel-results');
const spinner = document.getElementById('spinner');

const inputOrigin = document.getElementById('origin');
const inputDestination = document.getElementById('destination');
const dlOrigin = document.getElementById('origin-list');
const dlDestination = document.getElementById('destination-list');

// ---------- Helpers ----------
const sleep = ms => new Promise(r => setTimeout(r, ms));
function showSpinner(show) { spinner.classList[show ? 'add' : 'remove']('show'); }
function fmtPrice(value, currency) { try { return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value); } catch { return value + ' ' + currency; } }
function card(html){ const d=document.createElement('div'); d.className='result-card'; d.innerHTML = html; return d; }
function q(obj){ return Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }
async function fetchJSON(url){ const res = await fetch(url, { mode:'cors' }); if(!res.ok){ throw new Error(`HTTP ${res.status}: ${await res.text()}`); } return res.json(); }
function isIATA(s){ return /^[A-Za-z]{3}$/.test((s||'').trim()); }
function debounce(fn, t=250){ let id; return (...args)=>{ clearTimeout(id); id = setTimeout(()=>fn(...args), t); }; }

// ---------- Travelpayouts Autocomplete (public, no token) ----------
async function getSuggestions(term){
  if(!term || term.trim().length < 2) return [];
  const url = `https://autocomplete.travelpayouts.com/places2?term=${encodeURIComponent(term)}&locale=it&types[]=city&types[]=airport`;
  try {
    const list = await fetchJSON(url);
    // Normalize: prefer 'city' entries; build label and chosen code
    const items = list.map(x=>{
      const code = x.type === 'city' ? x.code : (x.city_code || x.code);
      const cityName = x.type === 'city' ? x.name : (x.city_name || x.name);
      const label = `${x.name}${x.country_name ? ', '+x.country_name : ''} (${code})${x.type==='airport' ? ' • Aeroporto' : ''}`;
      return { code, label, type: x.type, cityName };
    });
    // Unique by label
    const seen = new Set();
    return items.filter(i=>!seen.has(i.label) && seen.add(i.label)).slice(0, 15);
  } catch (e) {
    console.warn('autocomplete error', e);
    return [];
  }
}

function fillDatalist(datalist, items){
  datalist.innerHTML='';
  items.forEach(i=>{
    const opt = document.createElement('option');
    opt.value = i.code; // allow quick code fill
    opt.label = i.label;
    datalist.appendChild(opt);
  });
}

const onTypeOrigin = debounce(async ()=>{
  const term = inputOrigin.value.trim();
  const items = await getSuggestions(term);
  fillDatalist(dlOrigin, items);
}, 200);

const onTypeDest = debounce(async ()=>{
  const term = inputDestination.value.trim();
  const items = await getSuggestions(term);
  fillDatalist(dlDestination, items);
}, 200);

inputOrigin.addEventListener('input', onTypeOrigin);
inputDestination.addEventListener('input', onTypeDest);

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
  showSpinner(true);
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

    const [flights, hotels] = await Promise.all([
      searchFlights({ origin: originIata, destination: destIata, depart, back, currency }),
      searchHotels({ location: destCity || destIata, checkIn: depart, checkOut: back || depart, adults, currency })
    ]);

    renderFlights(flights, currency);
    renderHotels(hotels, currency);
  }catch(err){
    const msg = err && err.message ? err.message : String(err);
    flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${msg}</div>`));
  }finally{
    showSpinner(false);
  }
});