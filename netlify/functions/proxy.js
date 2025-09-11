
const https=require('https'); const http=require('http');

function req(u,headers={},timeout=12000){ return new Promise((resolve,reject)=>{
  try{ const U = new URL(u); const m = U.protocol==='https:'?https:http;
    const r = m.request(U,{method:'GET',headers,timeout},res=>{
      let data=''; res.on('data',c=>data+=c); res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,text:data}));
    });
    r.on('timeout',()=>r.destroy(new Error('timeout'))); r.on('error',reject); r.end();
  }catch(e){ reject(e); }
}); }

async function follow(u,headers={},max=4){ let r=await req(u,headers); let i=0;
  while([301,302,307,308].includes(r.status) && i<max){ const loc=r.headers.location; if(!loc) break; u=new URL(loc,u).toString(); r=await req(u,headers); i++; }
  return r;
}

function J(body,status=200){ return { statusCode:status, headers:{ 'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'*'}, body: JSON.stringify(body) }; }

exports.handler = async (event, context) => {
  try{
    if(event.httpMethod==='OPTIONS') return J({ok:true});
    const TP_API_KEY = process.env.TP_API_KEY;
    const TP_MARKER  = process.env.TP_PARTNER_MARKER;
    const TP_REFERER = process.env.TP_REFERER || 'https://travirae.com/';

    // Robust path detection (works for both /.netlify/functions/proxy and redirects /api/*)
    const rawUrl = event.rawUrl || (`https://${(event.headers&&event.headers.host)||'example.com'}${event.path||''}${event.rawQuery||event.rawQueryString?('?'+(event.rawQuery||event.rawQueryString)) : ''}`);
    const uIn = new URL(rawUrl);
    let route = uIn.pathname || '/';
    // Strip prefix up to and including the function name if present
    const fx = '/.netlify/functions/proxy';
    const idx = route.indexOf(fx);
    if (idx >= 0) route = route.slice(idx + fx.length); // e.g. '/api/flights/search'
    if (route === '') route = '/';
    const q = uIn.searchParams;
    const LOCALE = (q.get('locale') || 'it').slice(0,2);

    if (route === '/' || route === '/api' || route === '/api/' || route === '/api/ping'){
      return J({ ok:true, ts: Date.now(), route });
    }

    if (route === '/api/airports/suggest'){
      const term = q.get('q') || '';
      const url = new URL('https://autocomplete.travelpayouts.com/places2');
      url.searchParams.set('term', term);
      url.searchParams.set('locale', LOCALE);
      url.searchParams.append('types[]', 'city');
      url.searchParams.append('types[]', 'airport');
      const r = await follow(url.toString(), { 'User-Agent':'travirae/1.0', 'Referer': TP_REFERER });
      let arr=[]; try{ arr = JSON.parse(r.text); }catch{ arr=[]; }
      const items = (Array.isArray(arr)?arr:[]).slice(0,10).map(x=>({ name:x.name, iata:x.code||x.iata, type:x.type, country:x.country_name||x.country_code }));
      return J({ ok:true, items });
    }

    if (route === '/api/flights/search'){
      const origin = (q.get('origin')||'').toUpperCase().slice(0,3);
      const destination = (q.get('destination')||'').toUpperCase().slice(0,3);
      const depart = q.get('depart') || '';
      const ret = q.get('return') || '';
      const currency = (q.get('currency')||'EUR').toUpperCase();
      const limit = parseInt(q.get('limit')||'10',10);
      if(!origin || !destination || !depart) return J({ ok:false, error:'origin,destination,depart required' }, 400);

      const base = 'https://api.travelpayouts.com/aviasales/v3';
      const headers = { 'User-Agent':'travirae/1.0', 'X-Access-Token': TP_API_KEY, 'X-Partner-Marker': TP_MARKER, 'Referer': TP_REFERER };

      const u = new URL(base+'/prices_for_dates');
      u.searchParams.set('origin', origin); u.searchParams.set('destination', destination);
      u.searchParams.set('departure_at', depart); if(ret) u.searchParams.set('return_at', ret);
      u.searchParams.set('currency', currency); u.searchParams.set('page','1'); u.searchParams.set('limit', String(limit));
      u.searchParams.set('sorting','price'); u.searchParams.set('trip_class','0'); u.searchParams.set('token', TP_API_KEY);
      let r = await follow(u.toString(), headers); let data=[]; try{ data = (JSON.parse(r.text)||{}).data || []; }catch{ data=[]; }

      if(!data || data.length===0){
        const d=new Date(depart); const month=isNaN(+d)?'':`${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-01`;
        const u2=new URL(base+'/prices_for_month'); u2.searchParams.set('origin',origin); u2.searchParams.set('destination',destination); u2.searchParams.set('month',month); u2.searchParams.set('currency',currency); u2.searchParams.set('token',TP_API_KEY);
        const r2=await follow(u2.toString(), headers); try{ data=(JSON.parse(r2.text)||{}).data||[] }catch{ data=[] }
      }

      const out=(data||[]).slice(0,limit).map(it=>{
        const dep = it.depart_date || it.departure_at || it.departure_date || '';
        const retD = it.return_date || it.return_at || null;
        const avia = new URL('https://www.aviasales.com/search');
        avia.searchParams.set('marker', TP_MARKER);
        avia.searchParams.set('origin_iata', origin);
        avia.searchParams.set('destination_iata', destination);
        avia.searchParams.set('depart_date', String(dep).split('T')[0]);
        if(retD) avia.searchParams.set('return_date', String(retD).split('T')[0]);
        avia.searchParams.set('adults','1'); avia.searchParams.set('with_request','true'); avia.searchParams.set('currency', currency);
        return { price: it.value, origin: it.origin, destination: it.destination, depart_date: String(dep).split('T')[0]||'', return_date: retD?String(retD).split('T')[0]:null, changes: it.number_of_changes||it.transfers||0, deeplink: avia.toString() };
      });
      return J({ ok:true, currency, results: out });
    }

    return J({ ok:false, error:'unknown_api', route }, 404);
  }catch(e){
    return J({ ok:false, error:String(e) }, 500);
  }
};
