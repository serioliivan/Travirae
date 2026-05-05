#!/usr/bin/env node
/**
 * Travirae – Destination popup content validator
 *
 * Checks that every destination card (button.more) has a matching entry
 * in assets/data/destinations/<lang>.json with:
 *   - desc
 *   - highlights
 *   - bonus
 *
 * Run from the Travirae/ folder:
 *   node scripts/validate-destination-content.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const LANGS = [
  { code: 'ITA', index: 'index.html', json: 'it.json' },
  { code: 'ENG', index: 'index-en.html', json: 'en.json' },
  { code: 'DEU', index: 'index-de.html', json: 'de.json' },
  { code: 'FRA', index: 'index-fr.html', json: 'fr.json' },
  { code: 'SPA', index: 'index-es.html', json: 'es.json' },
  { code: 'RUS', index: 'index-ru.html', json: 'ru.json' },
  { code: 'ARA', index: 'index-ar.html', json: 'ar.json' },
  { code: 'NLD', index: 'index-nl.html', json: 'nl.json' },
  { code: 'ZHO', index: 'index-zh.html', json: 'zh.json' },
];

function readFile(p) {
  return fs.readFileSync(p, { encoding: 'utf8' });
}

function extractMapKeys(html) {
  // data-map-key appears on every button.more.
  // We don't want to pull in external dependencies, so regex is enough here.
  const re = /data-map-key="([^"]+)"/g;
  const keys = [];
  let m;
  while ((m = re.exec(html))) {
    keys.push(String(m[1] || '').trim());
  }
  return keys;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function main() {
  let anyError = false;

  for (const lang of LANGS) {
    const htmlPath = path.join(ROOT, lang.index);
    const jsonPath = path.join(ROOT, 'assets', 'data', 'destinations', lang.json);

    if (!fs.existsSync(htmlPath)) {
      console.error(`[${lang.code}] Missing HTML: ${lang.index}`);
      anyError = true;
      continue;
    }
    if (!fs.existsSync(jsonPath)) {
      console.error(`[${lang.code}] Missing JSON: assets/data/destinations/${lang.json}`);
      anyError = true;
      continue;
    }

    const html = readFile(htmlPath);
    const keys = extractMapKeys(html);
    const uniqueKeys = uniq(keys);

    let json;
    try {
      json = JSON.parse(readFile(jsonPath));
    } catch (e) {
      console.error(`[${lang.code}] Invalid JSON: ${lang.json}:`, e.message);
      anyError = true;
      continue;
    }

    const jsonKeys = Object.keys(json || {});

    const missing = [];
    for (const k of keys) {
      const entry = json && Object.prototype.hasOwnProperty.call(json, k) ? json[k] : null;
      if (!entry) {
        missing.push({ k, reason: 'missing entry' });
        continue;
      }
      if (!entry.desc || !String(entry.desc).trim()) missing.push({ k, reason: 'missing desc' });
      if (!entry.highlights || !String(entry.highlights).trim()) missing.push({ k, reason: 'missing highlights' });
      if (!entry.bonus || !String(entry.bonus).trim()) missing.push({ k, reason: 'missing bonus' });
    }

    // Extra safety: ensure we didn't accidentally leave old heavy attributes in HTML
    const leftoverAttrs = /\sdata-(?:desc|highlights|bonus)(?:-[a-z]{2})?="/i.test(html);
    const leftoverNote = leftoverAttrs ? ' (WARNING: leftover data-desc/highlights/bonus found)' : '';

    const ok = missing.length === 0;
    console.log(
      `[${lang.code}] cards: ${keys.length}, unique keys: ${uniqueKeys.length}, json keys: ${jsonKeys.length}, missing fields: ${missing.length}${leftoverNote}`
    );

    if (!ok) {
      anyError = true;
      const sample = missing.slice(0, 25);
      console.log(`  First ${sample.length} issues:`);
      for (const m of sample) {
        console.log(`   - ${m.k}: ${m.reason}`);
      }
      if (missing.length > sample.length) {
        console.log(`  ...and ${missing.length - sample.length} more.`);
      }
    }
  }

  if (anyError) {
    console.error('\nValidation FAILED. Fix the issues above.');
    process.exit(1);
  }

  console.log('\nValidation OK ✅');
  process.exit(0);
}

main();
