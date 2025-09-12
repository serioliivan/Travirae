
import { CONFIG } from './config.js';
const $=id=>document.getElementById(id); const flightBox=$('flight-results'), hotelBox=$('hotel-results'), spinner=$('spinner');
const fmt=(v,c)=>{try{return new Intl.NumberFormat('it-IT',{style:'currency',currency:c}).format(v);}catch(e){return v+' '+c;}};
const card=html=>{const d=document.createElement('div');d.className='result-card';d.innerHTML=html;return d;};
const q=o=>Object.entries(o).filter(([,v])=>v!==undefined&&v!==null&&v!=='').map(([k,v])=>`${encodeURIComponent(k)}=${encodeURIComponent(v)}`).join('&');
const fetchJSON=async u=>{const r=await fetch(u,{mode:'cors'});if(!r.ok)throw new Error(`HTTP ${r.status}: ${await r.text()}`);return r.json();};
const flights=async p=>{const u=`${CONFIG.PROXY_BASE_URL}/api/flights?`+q(p);return (await fetchJSON(u)).results||[];};
const hotels=async p=>{const u=`${CONFIG.PROXY_BASE_URL}/api/hotels?`+q(p);return (await fetchJSON(u)).results||[];};
$('search-form').addEventListener('submit',async e=>{
  e.preventDefault(); spinner.classList.add('show'); flightBox.innerHTML=''; hotelBox.innerHTML='';
  const origin=$('origin').value.trim().toUpperCase(); const destination=$('destination').value.trim().toUpperCase();
  const depart=$('depart').value; const back=$('return').value; const adults=$('adults').value||1; const currency=$('currency').value||CONFIG.DEFAULT_CURRENCY;
  try{
    const [fs,hs]=await Promise.all([
      flights({ origin, destination, departure_at:depart, return_at: back||undefined, currency, locale: CONFIG.DEFAULT_LOCALE, market: CONFIG.DEFAULT_MARKET }),
      hotels({ location: destination, checkIn: depart, checkOut: back||depart, adults, currency })
    ]);
    if(fs.length===0) flightBox.appendChild(card('<div>Nessun volo trovato.</div>')); 
    else fs.forEach(it=>flightBox.appendChild(card(`<div><div class="price">${fmt(it.price,currency)}</div><div class="helper">${it.origin} → ${it.destination} • ${new Date(it.departure_at).toLocaleString('it-IT')}${it.return_at?' • ritorno '+new Date(it.return_at).toLocaleString('it-IT'):''}</div><div class="helper">Compagnia: ${it.airline||'-'} • Scali: ${it.transfers??0}</div></div><div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Aviasales</a></div>`)));
    if(hs.length===0) hotelBox.appendChild(card('<div>Nessun hotel trovato.</div>'));
    else hs.forEach(it=>{ const stars=it.stars?'⭐'.repeat(Math.min(5,it.stars)):''; hotelBox.appendChild(card(`<div><div class="price">${fmt(it.priceFrom,currency)}</div><div class="helper">${it.hotelName||'Hotel'} ${stars}</div></div><div><a class="btn" rel="nofollow noopener" target="_blank" href="${it.buy_url}">Vedi su Hotellook</a></div>`)); });
  }catch(err){ flightBox.appendChild(card(`<div class="helper" style="color:#fca5a5">Errore: ${err.message||String(err)}</div>`)); }
  finally{ spinner.classList.remove('show'); }
});
