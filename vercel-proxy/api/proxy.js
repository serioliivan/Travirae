// Vercel function example — drop this file in your travirae-proxy repo at /api/proxy.js
// It supports both '/api/proxy/api/*' and '/api/proxy/*' routes.
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const TP_API_KEY = process.env.TP_API_KEY;
  const TP_MARKER = process.env.TP_PARTNER_MARKER || '669407';
  const TP_REFERER = process.env.TP_REFERER || 'https://travirae.com/';

  const url = new URL(req.url, `https://${req.headers.host}`);
  let route = url.pathname.replace(/^\/api\/proxy/, '') || '/';
  const locale = (url.searchParams.get('locale') || 'it').slice(0,2);

  const J = (obj, code=200) => {
    res.status(code).setHeader('Content-Type','application/json; charset=utf-8');
    res.end(JSON.stringify(obj));
  };

  if (route === '/' || route === '/ping' || route === '/api' || route === '/api/ping') {
    return J({ ok:true, ts: Date.now(), route });
  }

  if (route === '/airports/suggest' || route === '/api/airports/suggest') {
    const q = url.searchParams.get('q') || '';
    const U = new URL('https://autocomplete.travelpayouts.com/places2');
    U.searchParams.set('term', q);
    U.searchParams.set('locale', locale);
    U.searchParams.append('types[]','city'); U.searchParams.append('types[]','airport');
    const r = await fetch(U.toString(), { headers: { 'User-Agent':'travirae/1.0', 'Referer': TP_REFERER } });
    let arr = []; try{ arr = await r.json(); }catch{}
    const items = (Array.isArray(arr)?arr:[]).slice(0,10).map(x=>({ name:x.name, iata:x.code||x.iata, type:x.type, country:x.country_name||x.country_code }));
    return J({ ok:true, items });
  }

  if (route === '/flights/search' || route === '/api/flights/search') {
    const origin=(url.searchParams.get('origin')||'').toUpperCase().slice(0,3);
    const destination=(url.searchParams.get('destination')||'').toUpperCase().slice(0,3);
    const depart=url.searchParams.get('depart')||'';
    const ret=url.searchParams.get('return')||'';
    const currency=(url.searchParams.get('currency')||'EUR').toUpperCase();
    const limit=parseInt(url.searchParams.get('limit')||'10',10);
    if(!origin||!destination||!depart) return J({ ok:false, error:'origin,destination,depart required' }, 400);

    const base='https://api.travelpayouts.com/aviasales/v3';
    const headers={ 'User-Agent':'travirae/1.0', 'X-Access-Token': TP_API_KEY || '', 'X-Partner-Marker': TP_MARKER, 'Referer': TP_REFERER };

    const U = new URL(base+'/prices_for_dates');
    U.searchParams.set('origin', origin); U.searchParams.set('destination', destination);
    U.searchParams.set('departure_at', depart); if(ret) U.searchParams.set('return_at', ret);
    U.searchParams.set('currency', currency); U.searchParams.set('page','1'); U.searchParams.set('limit', String(limit));
    U.searchParams.set('sorting','price'); U.searchParams.set('trip_class','0'); if(TP_API_KEY) U.searchParams.set('token', TP_API_KEY);
    let data=[]; try{ const r=await fetch(U.toString(),{ headers }); const js=await r.json(); data=js.data||[]; }catch{}

    if(!data || data.length===0){
      try{
        const d=new Date(depart); const month=isNaN(+d)?'':`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`;
        const U2=new URL(base+'/prices_for_month'); U2.searchParams.set('origin',origin); U2.searchParams.set('destination',destination); U2.searchParams.set('month',month); U2.searchParams.set('currency',currency); if(TP_API_KEY) U2.searchParams.set('token',TP_API_KEY);
        const r2=await fetch(U2.toString(),{ headers }); const js2=await r2.json(); data=js2.data||[];
      }catch{}
    }

    const out=(data||[]).slice(0,limit).map(it=>{
      const dep = it.depart_date || it.departure_at || it.departure_date || '';
      const retD = it.return_date || it.return_at || null;
      const deeplink = (()=>{
        const u=new URL('https://www.aviasales.com/search');
        u.searchParams.set('marker', TP_MARKER);
        u.searchParams.set('origin_iata', origin);
        u.searchParams.set('destination_iata', destination);
        u.searchParams.set('depart_date', String(dep).split('T')[0]);
        if(retD) u.searchParams.set('return_date', String(retD).split('T')[0]);
        u.searchParams.set('adults','1'); u.searchParams.set('with_request','true'); u.searchParams.set('currency', currency);
        return u.toString();
      })();
      return { price: it.value, origin: it.origin||origin, destination: it.destination||destination, depart_date: String(dep).split('T')[0]||'', return_date: retD?String(retD).split('T')[0]:null, changes: it.number_of_changes||it.transfers||0, deeplink };
    });
    return J({ ok:true, currency, results: out });
  }

  return J({ ok:false, error:'unknown_api', route }, 404);
}
