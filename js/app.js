import { CONFIG } from './config.js';

const form = document.getElementById('search-form');
const flightBox = document.getElementById('flight-results');
const hotelBox = document.getElementById('hotel-results');
const spinner = document.getElementById('spinner');

function showSpinner(show) { spinner.classList[show ? 'add' : 'remove']('show'); }
function fmtPrice(v, c){ try{ return new Intl.NumberFormat('it-IT',{style:'currency',currency:c}).format(v);}catch(e){return v+' '+c;}}
function card(html){ const d=document.createElement('div'); d.className='result-card'; d.innerHTML=html; return d; }
async function fetchJSON(url){ const r=await fetch(url,{mode:'cors'}); if(!r.ok){ throw new Error(`Errore ${r.status}: ${await r.text()}`);} return r.json(); }
function q(obj){ return Object.entries(obj).filter(([k,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&'); }

async function searchFlights({ origin, destination, depart, back, currency }){
  const url = `${CONFIG.PROXY_BASE_URL}/api/flights?`+q({ origin, destination, departure_at: depart, return_at: back||undefined, currency, locale: CONFIG.DEFAULT_LOCALE, market: CONFIG.DEFAULT_MARKET });
  const data = await fetchJSON(url);
  return data.results||[];
}

async function searchHotels({ location, checkIn, checkOut, adults, currency }){
  const url = `${CONFIG.PROXY_BASE_URL}/api/hotels?`+q({ location, checkIn, checkOut, adults: adults||1, currency });
  const data = await fetchJSON(url);
  return data.results||[];
}

function renderFlights(items,currency){
  flightBox.innerHTML='';
  if(!items.length){ flightBox.appendChild(card('<div>Nessun volo trovato.</div>')); return; }
  for(const it of items){
    const html = `
      <div>
        <div class="price">${fmtPrice(it.price, currency)}</div>
        <div class="helper">
          ${it.origin} → ${it.destination} • ${new Date(it.departure_at).toLocaleString('it-IT')}
          ${it.return_at ? ' • ritorno '+new Date(it.return_at).toLocaleString('it-IT') : ''}
        </div>
        <div class="helper">Compagnia: ${it.airline||'-'} • Scali: ${it.transfers??0}</div>
      </div>
      <div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Aviasales</a></div>`;
    flightBox.appendChild(card(html));
  }
}

function renderHotels(items,currency){
  hotelBox.innerHTML='';
  if(!items.length){ hotelBox.appendChild(card('<div>Nessun hotel trovato.</div>')); return; }
  for(const it of items){
    const stars = it.stars ? '⭐'.repeat(Math.min(5, it.stars)) : '';
    const html = `
      <div>
        <div class="price">${fmtPrice(it.priceFrom, currency)}</div>
        <div class="helper">${it.hotelName||'Hotel'} ${stars}</div>
      </div>
      <div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Hotellook</a></div>`;
    hotelBox.appendChild(card(html));
  }
}

form.addEventListener('submit', async (e)=>{
  e.preventDefault(); showSpinner(true); flightBox.innerHTML=''; hotelBox.innerHTML='';
  const origin = document.getElementById('origin').value.trim().toUpperCase();
  const destination = document.getElementById('destination').value.trim().toUpperCase();
  const depart = document.getElementById('depart').value;
  const back = document.getElementById('return').value;
  const adults = document.getElementById('adults').value || 1;
  const currency = document.getElementById('currency').value || CONFIG.DEFAULT_CURRENCY;
  try{
    const [flights, hotels] = await Promise.all([
      searchFlights({ origin, destination, depart, back, currency }),
      searchHotels({ location: destination, checkIn: depart, checkOut: back || depart, adults, currency })
    ]);
    renderFlights(flights, currency);
    renderHotels(hotels, currency);
  }catch(err){
    const msg = err && err.message ? err.message : String(err);
    flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${msg}</div>`));
  }finally{ showSpinner(false); }
});