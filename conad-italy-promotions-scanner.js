/**
 * Pepesto API Example — Best Italian promotions this week at Conad
 * Supermarket: Conad (spesaonline.conad.it)
 * Built with Pepesto: https://www.pepesto.com/built-with-pepesto/conad/
 * Docs: https://pepesto.com/api
 *
 * Run: node conad-italy-promotions-scanner.js
 * Requires: PEPESTO_API_KEY env var
 */

const BASE_URL = 'https://s.pepesto.com/api';
const API_KEY  = process.env.PEPESTO_API_KEY;

if (!API_KEY) {
  console.error('Set PEPESTO_API_KEY before running.');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${API_KEY}`,
};

/**
 * Fetches every Conad product that is currently on promotion, as a flat list.
 *
 * /catalog answers with a parsed_products object keyed by the product's page
 * URL. Without promo_only it returns the whole indexed range; with promo_only
 * set it returns only the discounted part, which is all this script wants and
 * costs a third of the price.
 */
// #region fetch-promotions
async function fetchConadPromotions() {
  console.log('Fetching Conad promotions...');
  const res = await fetch(`${BASE_URL}/catalog`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ supermarket_domain: 'spesaonline.conad.it', promo_only: true }),
  });
  if (!res.ok) throw new Error(`/catalog failed: ${res.status}`);
  const data = await res.json();
  return Object.entries(data.parsed_products ?? {}).map(([url, product]) => ({ url, ...product }));
}
// #endregion

function formatPrice(cents) {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * The pack size as a short string, e.g. "375g" or "500ml". Returns an empty
 * string when the catalog does not know the size.
 */
function formatQuantity(quantity) {
  if (!quantity) return '';
  if (quantity.accurate_grams) return `${quantity.accurate_grams}g`;
  if (quantity.Unit?.Milliliters) return `${quantity.Unit.Milliliters}ml`;
  return '';
}

/** Deepest discount first. Promotions with no published percentage go last. */
// #region rank-deals
// promo_percentage is the honest measure of a deal, but Conad only publishes it
// for straightforward price cuts. A "buy 2 get 3" carries no percentage, so
// those sort to the back and are ordered by price instead.
function rankByDiscount(products) {
  const discountOf = p => p.promo_percentage ?? 0;
  return [...products].sort(
    (a, b) => discountOf(b) - discountOf(a) || (a.price ?? 0) - (b.price ?? 0),
  );
}

function printDeal(p, i) {
  const rank     = String(i + 1).padStart(2, ' ');
  const name     = p.names?.en || p.names?.it || 'Unnamed product';
  const price    = typeof p.price === 'number' ? formatPrice(p.price) : 'price unavailable';
  const discount = p.promo_percentage ? ` — ${p.promo_percentage}% off` : '';
  const qty      = formatQuantity(p.quantity);
  // Note the spelling: the field really is price_per_meausure_unit. It is a
  // display string ("2.98 € / L"), not a number, so print it rather than
  // trying to do arithmetic on it.
  const perUnit  = p.price_per_meausure_unit ? ` @ ${p.price_per_meausure_unit}` : '';

  console.log(`${rank}. ${name}${discount}`);
  console.log(`    ${qty ? `${qty} | ` : ''}${price}${perUnit}`);
  console.log();
}
// #endregion

async function main() {
  const products = await fetchConadPromotions();

  console.log(`Conad has ${products.length} products on promotion.\n`);

  const ranked = rankByDiscount(products);

  const TOP_N = 25;
  console.log(`=== Top ${TOP_N} Conad promotions this week ===\n`);

  ranked.slice(0, TOP_N).forEach(printDeal);

  // How deep the discounts go. Products with no published percentage are
  // counted separately rather than silently treated as 0% off.
  const bands = [
    { label: '50% or more', test: d => d >= 50 },
    { label: '30% to 49%',  test: d => d >= 30 },
    { label: '15% to 29%',  test: d => d >= 15 },
    { label: 'under 15%',   test: d => d > 0 },
  ];

  console.log('=== How deep the discounts go ===\n');

  let unpublished = 0;
  const counts = new Map(bands.map(b => [b.label, 0]));

  products.forEach(p => {
    const discount = p.promo_percentage ?? 0;
    if (!discount) {
      unpublished += 1;
      return;
    }
    const band = bands.find(b => b.test(discount));
    counts.set(band.label, counts.get(band.label) + 1);
  });

  bands.forEach(({ label }) => {
    console.log(`  ${label.padEnd(24)} ${counts.get(label)} products`);
  });
  console.log(`  ${'no percentage published'.padEnd(24)} ${unpublished} products`);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
