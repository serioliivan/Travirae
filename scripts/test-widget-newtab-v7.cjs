// Offline regression tests: node scripts/test-widget-newtab-v7.cjs
// No external API calls, real affiliate events or credentials required.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'assets/js/stay22-search-widget.js'), 'utf8');
const begin = source.indexOf('    function openResultsTab(href){');
const end = source.indexOf('    function getAffiliateId(){', begin);
assert(begin >= 0 && end > begin, 'New-tab helper must exist');
function helper(window) {
  return vm.runInNewContext('(' + source.slice(begin, end).trim() + ')', {window});
}
let count = 0;
function test(name, fn) { fn(); count += 1; console.log('PASS ' + name); }

test('Exactly one tab request; detach opener before redirect; retain URL byte-for-byte', () => {
  const log = [];
  const target = {
    set opener(value) { log.push(['opener', value]); },
    location: { replace(href) { log.push(['redirect', href]); } },
    close() { log.push(['close']); }
  };
  const open = helper({open(url, name) { log.push(['open', url, name]); return target; }});
  const href = 'https://www.stay22.com/allez/booking?aid=travirae&campaign=creator_test&link=https%3A%2F%2Fwww.booking.com%2Fhotel%2Fit%2Fnizza-riccione.html%3Fcheckin%3D2026-10-10';
  assert.equal(open(href), true);
  assert.deepEqual(log, [['open', 'about:blank', '_blank'], ['opener', null], ['redirect', href]]);
});

test('Blocked tab returns false, without navigating the current page', () => {
  let attempts = 0;
  const open = helper({open() { attempts += 1; return null; }});
  assert.equal(open('https://www.stay22.com/allez/searchbar?aid=travirae'), false);
  assert.equal(attempts, 1);
});

test('Failure to detach opener closes the blank tab before any external navigation', () => {
  let closed = false;
  const target = {
    set opener(_) { throw new Error('test: blocked setter'); },
    location: { replace() { assert.fail('Must not navigate with an attached opener'); } },
    close() { closed = true; }
  };
  assert.equal(helper({open() { return target; }})('https://www.stay22.com/'), false);
  assert.equal(closed, true);
});

test('Failed external navigation closes the blank tab and reports failure', () => {
  let closed = false;
  const target = {opener: {}, location: {replace() { throw new Error('test: navigation failed'); }}, close() {closed = true;}};
  assert.equal(helper({open() {return target;}})('https://www.stay22.com/'), false);
  assert.equal(closed, true);
  assert.equal(target.opener, null);
});

test('No delayed or same-tab navigation remains in the widget', () => {
  assert(!source.includes('window.location.assign('));
  assert(!source.includes('window.location.replace('));
  assert(source.includes('navigationTimer = window.setTimeout(resetNavigation,800);'));
  assert(!source.includes('noreferrer,'));
});

test('All nine homepage forms target a new tab with noopener', () => {
  const files = fs.readdirSync(root).filter(x => /^index(?:-(?:ar|de|en|es|fr|nl|ru|zh))?\.html$/.test(x));
  assert.equal(files.length, 9);
  for (const file of files) {
    const html = fs.readFileSync(path.join(root, file), 'utf8');
    const form = html.match(/<form[^>]*id="travirae-stay-search-form"[^>]*>/);
    assert(form, file);
    assert(form[0].includes('target="_blank"'), file);
    assert(form[0].includes('rel="noopener"'), file);
    assert(html.includes('20260910-selected-hotel-v8'), file);
  }
});

test('Both modes share the same CSS layout and full-width action row', () => {
  const css = fs.readFileSync(path.join(root, 'assets/css/stay22-search-widget.css'), 'utf8');
  assert(!css.includes('.is-hotel-mode'), 'No mode-dependent layout rules');
  assert(css.includes('.travirae-stay-search__submit{grid-column:1 / -1;min-width:0}'));
});
console.log('Completed ' + count + ' offline v7 regression checks.');
