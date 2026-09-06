/* Run: node scripts/test-widget-routing-v6.cjs
 * Offline regression tests. No Google/Stay22 calls and no affiliate clicks.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const file = path.join(root, 'assets/js/stay22-search-widget.js');
let source = fs.readFileSync(file, 'utf8');
// Expose pure URL/date helpers only in this test VM, never in the website.
source = source.replace('  function boot(){', `
  window.__test={buildBookingHotelLink,findBookingPropertyOverride,parseIso,addDaysIso};
  function boot(){`);
const sandbox = {window:{}, document:{readyState:'loading',addEventListener(){}}, URL};
vm.runInNewContext(source, sandbox, {filename:file});
const t = sandbox.window.__test;
assert(t, 'Missing test hook');
let count = 0;
function test(name, fn){fn();count++;console.log('PASS',name);}
const locale = {lang:'it',currency:'EUR'};
function link(name,address,query=''){
 return t.buildBookingHotelLink(name,address,query,'2027-10-10','2027-10-13',2,1,locale);
}
test('Nizza Riccione exact property',()=>{
 const url = new URL(link('Hotel Nizza Riccione',"Viale D’Annunzio, 165, 47838 Riccione RN, Italia").url);
 assert.equal(url.origin,'https://www.booking.com');
 assert.equal(url.pathname,'/hotel/it/nizza-riccione.html');
 assert.equal(url.searchParams.get('checkin'),'2027-10-10');
 assert.equal(url.searchParams.get('checkout'),'2027-10-13');
 assert.equal(url.searchParams.get('group_adults'),'2');
 assert.equal(url.searchParams.get('group_children'),'1');
 assert.equal(url.searchParams.get('lang'),'it');
 assert.equal(url.searchParams.get('selected_currency'),'EUR');
});
test('Nizza name variation with B&B',()=>{
 assert.equal(new URL(link('Hotel B&B Nizza Riccione - zona Samsara','Riccione, Italia').url).pathname,'/hotel/it/nizza-riccione.html');
});
test('Previous typed query cannot override another selected hotel',()=>{
 const target = new URL(link('Hotel Aurora','47838 Riccione RN, Italia','Hotel Nizza Riccione').url);
 assert.equal(target.pathname,'/searchresults.html');
 assert.equal(target.searchParams.get('ss'),'Hotel Aurora Riccione');
});
test('Hotel Nizza in another city is not Riccione',()=>{
 assert.equal(t.findBookingPropertyOverride('Hotel Nizza','Roma RM, Italia','Hotel Nizza Riccione'),null);
});
test('User input cannot set an external destination',()=>{
 const target = new URL(link('https://other.example/','Roma, Italia').url);
 assert.equal(target.origin,'https://www.booking.com');
});
test('Special characters cannot create query parameters',()=>{
 const target = new URL(link('Hotel A & B ?aid=other','# Test, Parigi, Francia').url);
 assert.equal(target.searchParams.get('aid'),null);
});
for(const value of ['2026-02-31','2026-13-01','2026-00-15','not-a-date','2027-02-29']){
 test('Invalid date rejected: '+value,()=>assert.equal(t.parseIso(value),null));
}
test('Leap day is valid',()=>assert.notEqual(t.parseIso('2028-02-29'),null));
test('Year rollover is correct',()=>assert.equal(t.addDaysIso('2026-12-31',1),'2027-01-01'));
console.log(`Completed ${count} offline regression checks.`);
