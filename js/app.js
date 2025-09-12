import { CONFIG } from './config.js';

const form = document.getElementById('search-form');
const flightBox = document.getElementById('flight-results');
const hotelBox = document.getElementById('hotel-results');
const spinner = document.getElementById('spinner');

function showSpinner(show) {
  spinner.classList[show ? 'add' : 'remove']('show');
}

function fmtPrice(value, currency) {
  try {
    return new Intl.NumberFormat('it-IT', { style: 'currency', currency }).format(value);
  } catch (e) {
    return `${value} ${currency}`;
  }
}

function card(html) {
  const div = document.createElement('div');
  div.className = 'result-card';
  div.innerHTML = html;
  return div;
}

async function fetchJSON(url) {
  const res = await fetch(url, { mode: 'cors' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Errore ${res.status}: ${text}`);
  }
  return await res.json();
}

function buildQuery(params) {
  return Object.entries(params)
    .filter(([,v]) => v !== undefined && v !== null && v !== '')
    .map(([k,v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&');
}

async function searchFlights({ origin, destination, depart, back, currency }) {
  const qs = buildQuery({
    origin,
    destination,
    departure_at: depart,
    return_at: back || undefined,
    currency,
    locale: CONFIG.DEFAULT_LOCALE,
    market: CONFIG.DEFAULT_MARKET
  });
  const url = `${CONFIG.PROXY_BASE_URL}/api/flights?${qs}`;
  const data = await fetchJSON(url);
  return data.results || [];
}

async function searchHotels({ location, checkIn, checkOut, adults, currency }) {
  const qs = buildQuery({
    location,
    checkIn,
    checkOut,
    adults: adults || 1,
    currency
  });
  const url = `${CONFIG.PROXY_BASE_URL}/api/hotels?${qs}`;
  const data = await fetchJSON(url);
  return data.results || [];
}

function renderFlights(items, currency) {
  flightBox.innerHTML = '';
  if (!items.length) {
    flightBox.appendChild(card('<div>Nessun risultato trovato per i voli.</div>'));
    return;
  }
  for (const it of items) {
    const html = `
      <div>
        <div class="price">${fmtPrice(it.price, currency)}</div>
        <div class="helper">
          ${it.origin} → ${it.destination} • ${new Date(it.departure_at).toLocaleString('it-IT')}
          ${it.return_at ? ' • ritorno ' + new Date(it.return_at).toLocaleString('it-IT') : ''}
        </div>
        <div class="helper">Compagnia: ${it.airline || '-'} • Scali: ${it.transfers ?? 0}</div>
      </div>
      <div>
        <a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Aviasales</a>
      </div>
    `;
    flightBox.appendChild(card(html));
  }
}

function renderHotels(items, currency) {
  hotelBox.innerHTML = '';
  if (!items.length) {
    hotelBox.appendChild(card('<div>Nessun risultato trovato per gli hotel.</div>'));
    return;
  }
  for (const it of items) {
    const html = `
      <div>
        <div class="price">${fmtPrice(it.priceFrom, currency)}</div>
        <div class="helper">${it.hotelName || 'Hotel'} ${it.stars ? '⭐'.repeat(Math.min(5, it.stars)) : ''}</div>
      </div>
      <div>
        <a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Hotellook</a>
      </div>
    `;
    hotelBox.appendChild(card(html));
  }
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  showSpinner(true);
  flightBox.innerHTML = '';
  hotelBox.innerHTML = '';

  const origin = document.getElementById('origin').value.trim().toUpperCase();
  const destination = document.getElementById('destination').value.trim().toUpperCase();
  const depart = document.getElementById('depart').value;
  const back = document.getElementById('return').value;
  const adults = document.getElementById('adults').value || 1;
  const currency = document.getElementById('currency').value || CONFIG.DEFAULT_CURRENCY;

  try {
    const [flights, hotels] = await Promise.all([
      searchFlights({ origin, destination, depart, back, currency }),
      searchHotels({ location: destination, checkIn: depart, checkOut: back || depart, adults, currency })
    ]);

    renderFlights(flights, currency);
    renderHotels(hotels, currency);
  } catch (err) {
    const msg = (err && err.message) ? err.message : String(err);
    flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${msg}</div>`));
  } finally {
    showSpinner(false);
  }
});