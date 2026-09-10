/* Offline v8 regression checks: node scripts/test-widget-routing-v8.cjs
 * No real Google/Stay22 requests, affiliate clicks, secrets or reservations.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const assert=require('node:assert/strict');
const root=path.join(__dirname,'..');
let source=fs.readFileSync(path.join(root,'assets/js/stay22-search-widget.js'),'utf8');
source=source.replace('  function boot(){',`
  window.__test={buildBookingHotelLink,buildSelectedHotelQuery,getSelectedHotelCity,extractSelectedLocality,parseIso,addDaysIso};
  function boot(){`);
const sandbox={window:{},document:{readyState:'loading',addEventListener(){}},URL};
vm.runInNewContext(source,sandbox);
const t=sandbox.window.__test;
let count=0;
function test(name,fn){fn();console.log('PASS '+name);count++;}
function hotel(name,location='',address=location,extra={}){return {placeId:'test_selected_id',name,location,address,...extra};}
function target(h,lang='it',currency='EUR'){return t.buildBookingHotelLink(h,'2027-10-10','2027-10-13',2,1,{lang,currency});}
const cases=[
 ['Hotel Lidomare','Largo Duchi Piccolomini, Amalfi, SA, Italia','Largo Duchi Piccolomini, 9, 84011 Amalfi SA, Italia','Hotel Lidomare Amalfi'],
 ['Hotel XYZ - Xyu Resort','Amalfi, SA, Italia','','Hotel XYZ - Xyu Resort Amalfi'],
 ['Hotel Schneeberg - Family Spa Resort','Ridanna, BZ, Italia','Masseria, 22, 39040 Ridanna BZ, Italia','Hotel Schneeberg - Family Spa Resort Ridanna'],
 ['Hotel Nizza','Riccione, RN, Italia','Viale D’Annunzio, 165, 47838 Riccione RN, Italia','Hotel Nizza Riccione'],
 ['Hotel Nizza Riccione','Riccione, RN, Italia','','Hotel Nizza Riccione'],
 ['Hotel Nizza','Roma, RM, Italia','','Hotel Nizza Roma'],
 ['Hotel Aurora','Riccione, RN, Italia','','Hotel Aurora Riccione'],
 ['Hotel Amalfico','Amalfi, SA, Italia','','Hotel Amalfico Amalfi'],
 ['Hôtel A & B — Côte d’Azur','Nice, France','','Hôtel A & B — Côte d’Azur Nice'],
 ['Hilton New York Times Square','234 West 42nd Street, New York, NY, USA','234 W 42nd St, New York, NY 10036, USA','Hilton New York Times Square'],
 ['Example Lodge','350 Example Road, London, UK','350 Example Rd, London SW1A 1AA, UK','Example Lodge London'],
 ['Hotel Central','','Alexanderplatz, 10178 Berlin, Germany','Hotel Central Berlin'],
 ['Marina Bay Sands','10 Bayfront Avenue, Singapore','10 Bayfront Avenue, Singapore 018956','Marina Bay Sands Singapore'],
 ['ザ・ホテル — 東京','千代田区, 東京, 日本','','ザ・ホテル — 東京'],
 ['فندق النور','القاهرة، مصر','','فندق النور القاهرة، مصر'],
 ['酒店 — 春天','中国上海','','酒店 — 春天 中国上海'],
 ['Hotel Full Name','','','Hotel Full Name'],
 ['A&B + Residence #1 ?campaign=evil','Amalfi, SA, Italia','','A&B + Residence #1 ?campaign=evil Amalfi'],
];
for(const [name,location,address,expected] of cases){
 test('Selected full name/locality: '+name,()=>{
   const h=hotel(name,location,address,{searchQuery:'WRONG PARTIAL OLD HOTEL'});
   const result=target(h);const u=new URL(result.url);
   assert.equal(result.searchQuery,expected);
   assert.equal(u.searchParams.get('ss'),expected);
   assert.equal(u.searchParams.get('ss_raw'),expected);
   assert.equal(u.origin,'https://www.booking.com');
   assert.equal(u.pathname,'/searchresults.html');
   for(const forbidden of ['dest_id','dest_type','aid','campaign','hotelname','lat','lng','hid']) assert.equal(u.searchParams.has(forbidden),false);
   assert.equal(u.searchParams.get('checkin'),'2027-10-10');
   assert.equal(u.searchParams.get('checkout'),'2027-10-13');
   assert.equal(u.searchParams.get('group_adults'),'2');
   assert.equal(u.searchParams.get('group_children'),'1');
   assert.equal(u.searchParams.get('no_rooms'),'1');
 });
}
test('Structured locality takes priority over address heuristics',()=>{
 assert.equal(t.buildSelectedHotelQuery(hotel('Hotel Sunset','Paris, France','Paris, France',{locality:'Amalfi'})),'Hotel Sunset Amalfi');
});
test('Optional structured Google components supported without requiring them',()=>{
 assert.equal(t.buildSelectedHotelQuery(hotel('Hotel Sunset','','',{addressComponents:[{types:['locality'],longText:'Amalfi'}]})),'Hotel Sunset Amalfi');
});
test('Missing selection rejected instead of using an old typed query',()=>{
 assert.throws(()=>t.buildSelectedHotelQuery({name:'Hotel Lidomar'}),/missing_selected_hotel/);
 assert.throws(()=>t.buildSelectedHotelQuery({placeId:'x',searchQuery:'Hotel Lidomar'}),/missing_selected_hotel_name/);
});
test('Caller supplied URL cannot change destination domain',()=>{
 const u=new URL(target(hotel('https://evil.example/?x=1&aid=wrong','Amalfi, Italia')).url);
 assert.equal(u.origin,'https://www.booking.com'); assert.equal(u.searchParams.get('aid'),null);
});
for(const [lang,currency] of [['it','EUR'],['en','USD'],['de','EUR'],['fr','EUR'],['es','EUR'],['nl','EUR'],['ru','RUB'],['ar','AED'],['zh','CNY']]){
 test('Nested encoding and tracking preserved ('+lang+')',()=>{
  const inner=target(hotel('Hôtel Lido & Mare — Special + Stay','Amalfi, SA, Italia'),lang,currency);
  const outer=new URL('https://www.stay22.com/allez/booking');
  outer.searchParams.set('aid','travirae'); outer.searchParams.set('link',inner.url);
  outer.searchParams.set('campaign','creator_123'); outer.searchParams.set('roam','false');
  const roundTrip=new URL(outer.toString()); const decoded=new URL(roundTrip.searchParams.get('link'));
  assert.equal(decoded.searchParams.get('ss'),inner.searchQuery);
  assert.equal(decoded.searchParams.get('ss_raw'),inner.searchQuery);
  assert.equal(decoded.searchParams.get('lang'),lang);
  assert.equal(decoded.searchParams.get('selected_currency'),currency);
  assert.equal(roundTrip.searchParams.get('aid'),'travirae');
  assert.equal(roundTrip.searchParams.get('campaign'),'creator_123');
  assert.equal(roundTrip.searchParams.get('link'),inner.url);
 });
}
for(const value of ['2026-02-31','2026-13-01','2026-00-15','not-a-date','2027-02-29']){
 test('Invalid date rejected: '+value,()=>assert.equal(t.parseIso(value),null));
}
test('Leap day',()=>assert.notEqual(t.parseIso('2028-02-29'),null));
test('New-year boundary',()=>assert.equal(t.addDaysIso('2026-12-31',1),'2027-01-01'));
test('Selected name and locality retained by autocomplete; typed-query fallback removed',()=>{
 const js=fs.readFileSync(path.join(root,'assets/js/google-hotel-autocomplete.js'),'utf8');
 assert(js.includes('name:prediction.name')); assert(js.includes('location:prediction.location'));
 assert(!js.includes('typedQuery')); assert(!source.includes('cleanHotelNameForBooking'));
 assert(!source.includes('BOOKING_PROPERTY_OVERRIDES'));
});
console.log('Completed '+count+' offline v8 regression checks.');
