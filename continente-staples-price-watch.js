/**
 * Pepesto API Example — Continente staples price watch on the Starter pack
 * Supermarket: Continente (continente.pt)
 * Built with Pepesto: https://www.pepesto.com/built-with-pepesto/continente/
 * Docs: https://pepesto.com/api
 *
 * Run: node continente-staples-price-watch.js
 * Requires: PEPESTO_API_KEY env var
 *
 * Prices a fixed basket of Portuguese staples every day with one /catalog
 * call in its preselected form: pass product_urls and only those products
 * come back. That form costs a tenth of a full catalog and is the one bulk
 * call available on Starter.
 *
 * The first run turns a plain shopping list into Continente product URLs
 * with /products and caches them next to the script. Every run saves a
 * price snapshot and diffs it against the previous one.
 */

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const BASE_URL = 'https://s.pepesto.com/api';
const API_KEY  = process.env.PEPESTO_API_KEY;
const DOMAIN   = 'continente.pt';

if (!API_KEY) {
  console.error('Set PEPESTO_API_KEY before running.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

// The basket, as you would write it on paper. /products turns each line into
// a real Continente product.
const SHOPPING_LIST = [
  'leite meio-gordo 1L', 'ovos médios', 'manteiga com sal', 'pão de forma',
  'arroz carolino 1kg', 'esparguete 500g', 'peito de frango', 'bananas',
  'maçãs', 'cenouras', 'cebolas', 'batatas', 'tomate pelado em lata',
  'azeite virgem extra', 'flocos de aveia', 'farinha de trigo',
  'iogurte natural', 'atum em água', 'grão-de-bico cozido', 'café moído',
];

const HERE = import.meta.dirname;
const WATCHLIST_FILE = path.join(HERE, 'continente-watchlist.json');
const SNAPSHOT_PREFIX = 'continente-staples-';

/**
 * Resolves the shopping list to product URLs, once. /products matches each
 * free-text line to Continente products and returns the page URL of every
 * match as product_id. The best match per line becomes the watchlist.
 */
// #region build-watchlist
async function buildWatchlist() {
  console.log(`Matching ${SHOPPING_LIST.length} items at Continente...`);
  const res = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      supermarket_domain: DOMAIN,
      manual_shopping_list: SHOPPING_LIST.join(', '),
      item_names_locale: 'pt-PT',
    }),
  });
  if (!res.ok) throw new Error(`/products failed: ${res.status}`);
  const data = await res.json();

  const watchlist = [];
  for (const item of data.items ?? []) {
    const best = item.products?.[0]?.product;
    if (!best) {
      console.log(`  no match for "${item.item_name}", leaving it out`);
      continue;
    }
    watchlist.push({ item: item.item_name, url: best.product_id });
  }
  writeFileSync(WATCHLIST_FILE, JSON.stringify(watchlist, null, 2));
  console.log(`Watchlist of ${watchlist.length} products saved to ${path.basename(WATCHLIST_FILE)}.\n`);
  return watchlist;
}
// #endregion

function loadWatchlist() {
  if (existsSync(WATCHLIST_FILE)) return JSON.parse(readFileSync(WATCHLIST_FILE, 'utf8'));
  return buildWatchlist();
}

/**
 * Fetches today's price for every product on the watchlist.
 *
 * With product_urls set, /catalog answers in its usual shape, a
 * parsed_products object keyed by product URL, but holds only the URLs you
 * asked for. A URL Continente no longer lists is simply absent.
 */
// #region fetch-watchlist
async function fetchWatchlist(watchlist) {
  console.log(`Pricing ${watchlist.length} Continente staples...`);
  const res = await fetch(`${BASE_URL}/catalog`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ supermarket_domain: DOMAIN, product_urls: watchlist.map(w => w.url) }),
  });
  if (!res.ok) throw new Error(`/catalog failed: ${res.status}`);
  const data = await res.json();
  return data.parsed_products ?? {};
}
// #endregion

function formatPrice(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

/** Today's snapshot: one row per watched product, in watchlist order. */
function buildSnapshot(watchlist, products) {
  return watchlist.map(({ item, url }) => {
    const p = products[url];
    if (!p) return { item, url, listed: false };
    return {
      item,
      url,
      listed: true,
      name: p.names?.pt ?? p.names?.en ?? 'Unnamed product',
      price: p.price,
      perUnit: p.price_per_meausure_unit ?? '',
      promo: Boolean(p.promo),
      promoPercentage: p.promo_percentage ?? null,
    };
  });
}

// Snapshots live next to the script as continente-staples-YYYY-MM-DD.json.
// The newest one from an earlier day is the baseline for today's diff.
function loadPreviousSnapshot(today) {
  const files = readdirSync(HERE)
    .filter(f => f.startsWith(SNAPSHOT_PREFIX) && f.endsWith('.json'))
    .filter(f => f < `${SNAPSHOT_PREFIX}${today}.json`)
    .sort();
  if (files.length === 0) return null;
  const file = files[files.length - 1];
  return {
    date: file.slice(SNAPSHOT_PREFIX.length, -'.json'.length),
    rows: JSON.parse(readFileSync(path.join(HERE, file), 'utf8')),
  };
}

/** Prints the basket, flags promos, and shows what moved since the previous snapshot. */
// #region basket-report
function printReport(rows, previous) {
  const byUrl = new Map((previous?.rows ?? []).map(r => [r.url, r]));

  console.log(`\n=== Continente staples basket${previous ? ` — changes since ${previous.date}` : ''} ===\n`);

  let total = 0;
  let promos = 0;
  const missing = [];

  for (const row of rows) {
    if (!row.listed) {
      missing.push(row);
      continue;
    }
    total += row.price;
    if (row.promo) promos += 1;

    const before = byUrl.get(row.url);
    let movement = '';
    if (before?.listed && before.price !== row.price) {
      const delta = row.price - before.price;
      movement = ` (${delta > 0 ? '+' : '-'}${formatPrice(Math.abs(delta))} since ${previous.date})`;
    }
    const promo = row.promo ? (row.promoPercentage ? ` — ${row.promoPercentage}% off` : ' — on offer') : '';

    console.log(`${formatPrice(row.price).padStart(7)}  ${row.name}${promo}${movement}`);
    if (row.perUnit) console.log(`         ${row.perUnit}`);
  }

  console.log(`\nBasket total: ${formatPrice(total)} for ${rows.length - missing.length} items, ${promos} on offer.`);
  if (previous) {
    const beforeTotal = previous.rows.filter(r => r.listed).reduce((sum, r) => sum + r.price, 0);
    const delta = total - beforeTotal;
    console.log(`Since ${previous.date}: ${delta === 0 ? 'no change' : `${delta > 0 ? '+' : '-'}${formatPrice(Math.abs(delta))}`}.`);
  }
  if (missing.length > 0) {
    console.log(`\n${missing.length} watched product(s) are no longer listed:`);
    missing.forEach(row => console.log(`  ${row.item}: ${row.url}`));
  }
}
// #endregion

async function main() {
  const today = new Date().toISOString().slice(0, 10);
  const watchlist = await loadWatchlist();
  const products = await fetchWatchlist(watchlist);
  const rows = buildSnapshot(watchlist, products);

  printReport(rows, loadPreviousSnapshot(today));

  const file = path.join(HERE, `${SNAPSHOT_PREFIX}${today}.json`);
  writeFileSync(file, JSON.stringify(rows, null, 2));
  console.log(`\nSnapshot saved to ${path.basename(file)}. Run this daily and the diff builds itself.`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
