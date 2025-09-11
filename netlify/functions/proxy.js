
const https=require('https');const http=require('http');
function get(u,h={},t=10000){return new Promise((res,rej)=>{try{const U=new URL(u);const m=U.protocol==='https:'?https:http;const r=m.request(U,{method:'GET',headers:h,timeout:t},R=>{let d='';R.on('data',c=>d+=c);R.on('end',()=>res({status:R.statusCode,text:d,headers:R.headers}))});r.on('timeout',()=>r.destroy(new Error('timeout')));r.on('error',rej);r.end()}catch(e){rej(e)}})}
async function follow(u,h={},hops=3){let r=await get(u,h);let i=0;while((r.status===301||r.status===302||r.status===307||r.status===308)&&i<hops){const L=r.headers.location;if(!L)break;const n=new URL(L,u).toString();r=await get(n,h);i++;}return r;}

exports.handler = async (event, context) => {
  const K=process.env.TP_API_KEY||'';
  const M=process.env.TP_PARTNER_MARKER||'';
  const REF=process.env.TP_REFERER||'https://travirae.com/';
  const path = event.path || '';
  const q = new URLSearchParams(event.rawQuery||event.rawQueryString||'');
  const J=(o,s=200)=>({statusCode:s,headers:{'Content-Type':'application/json; charset=utf-8','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'},body:JSON.stringify(o)});
  try{
    if(path.endsWith('/api/ping')) return J({ok:true,msg:'proxy alive'});
    if(path.endsWith('/api/airports/suggest')){
      const term=q.get('q')||''; const locale=q.get('locale')||'en';
      const U=new URL('https://autocomplete.travelpayouts.com/places2'); U.searchParams.set('term',term); U.searchParams.set('locale',locale); U.searchParams.append('types[]','city'); U.searchParams.append('types[]','airport');
      const r=await follow(U.toString(), {'Referer':REF,'User-Agent':'travirae/1.0'}); let arr=[]; try{arr=JSON.parse(r.text)}catch{};
      const items=(Array.isArray(arr)?arr:[]).slice(0,10).map(x=>({name:x.name,country:x.country_name||x.country_code,iata:x.code||x.iata,type:x.type})).filter(x=>x.iata);
      return J({ok:true,items});
    }
    if(path.endsWith('/api/flights/search')){
      const o=(q.get('origin')||'').toUpperCase().slice(0,3), d=(q.get('destination')||'').toUpperCase().slice(0,3); const depart=q.get('depart')||''; const rtrn=q.get('return')||''; const cur=(q.get('currency')||'EUR').toUpperCase(); const limit=parseInt(q.get('limit')||'12',10);
      const base='https://api.travelpayouts.com/aviasales/v3'; const U=new URL(base+'/prices_for_dates'); U.searchParams.set('origin',o); U.searchParams.set('destination',d); U.searchParams.set('departure_at',depart); if(rtrn)U.searchParams.set('return_at',rtrn); U.searchParams.set('currency',cur); U.searchParams.set('page','1'); U.searchParams.set('limit',String(limit)); U.searchParams.set('sorting','price'); U.searchParams.set('trip_class','0'); U.searchParams.set('token',K);
      const H={'User-Agent':'travirae/1.0','X-Access-Token':K,'Referer':REF,'X-Partner-Marker':M}; let r=await follow(U.toString(),H); let items=[]; try{items=JSON.parse(r.text).data||[]}catch{};
      if(!items||!items.length){ const dt=new Date(depart); const mon=isNaN(+dt)?'':`${dt.getUTCFullYear()}-${String(dt.getUTCMonth()+1).padStart(2,'0')}-01`; const U2=new URL(base+'/prices_for_month'); U2.searchParams.set('origin',o); U2.searchParams.set('destination',d); U2.searchParams.set('month',mon); U2.searchParams.set('currency',cur); U2.searchParams.set('token',K); const r2=await follow(U2.toString(),H); try{items=JSON.parse(r2.text).data||[]}catch{} }
      const out=(items||[]).map(it=>({value:it.value,origin:it.origin,destination:it.destination,depart_date:it.depart_date||it.departure_at||it.departure_date,return_date:it.return_date||it.return_at||null,changes:it.number_of_changes||it.transfers||0,link:it.link||null}));
      return J({ok:true,currency:cur,results:out});
    }
    return J({ok:false,error:'unknown_api'},404);
  }catch(e){ return J({ok:false,error:String(e)},500); }
};
