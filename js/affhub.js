
// === Gateway functions (go through aff-hub to log + redirect) ===
function openAviasales({ origin, destination, depart, ret, adults=1, trip_class=0 }) {
  const ref = window.getRef?.() || '';
  const target = new URL('https://search.aviasales.com/flights/');
  target.search = new URLSearchParams({
    origin_iata: origin,
    destination_iata: destination,
    depart_date: depart,
    return_date: ret || '',
    adults, trip_class
  }).toString();
  const url = `${window.AFF_HUB_BASE}/api/go-tp?target=${encodeURIComponent(target)}&subid=${encodeURIComponent(ref)}`;
  window.open(url, '_blank', 'noopener');
}

function openStay22({ address, lat, lng, checkin, checkout }) {
  const ref = window.getRef?.() || '';
  const p = new URLSearchParams();
  if (address) p.set('address', address);
  if (lat && lng) { p.set('lat', lat); p.set('lng', lng); }
  if (checkin) p.set('checkin', checkin);
  if (checkout) p.set('checkout', checkout);
  p.set('campaign', ref);
  const url = `${window.AFF_HUB_BASE}/api/go-stay22?${p.toString()}`;
  window.open(url, '_blank', 'noopener');
}

window.openAviasales = openAviasales;
window.openStay22 = openStay22;
