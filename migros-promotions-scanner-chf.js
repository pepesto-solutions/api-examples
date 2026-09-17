/**
 * Pepesto API Example — CHF Promotions Scanner
 * Supermarket: Migros (migros.ch)
 * Built with Pepesto: https://www.pepesto.com/built-with-pepesto/migros/
 * Docs: https://pepesto.com/api
 *
 * Run: node migros-promotions-scanner-chf.js
 * Requires: PEPESTO_API_KEY env var
 */

const API_BASE = 'https://s.pepesto.com/api';
const API_KEY = process.env.PEPESTO_API_KEY;

if (!API_KEY) {
  console.error('Error: PEPESTO_API_KEY environment variable is not set.');
  console.error('Get your API key at https://www.pepesto.com/ai-grocery-shopping-agent/#setup-authentication');
  process.exit(1);
}

/**
 * Fetches the Migros CH products currently on promotion. /catalog with
 * promo_only returns only the discounted range, for a third of the full price.
 */
async function fetchMigrosPromotions() {
  console.log('Fetching Migros CH promotions...');
  const response = await fetch(`${API_BASE}/catalog`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({ supermarket_domain: 'migros.ch', promo_only: true }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pepesto API error ${response.status}: ${errorText}`);
  }

  const data = await response.json();
  return data.parsed_products;
}

/**
 * Flattens the promoted items into an array sorted by expiry, then price.
 * The promo check is a guard: with promo_only set, every product in the
 * response should already be on offer.
 */
function extractPromos(catalog) {
  const promos = [];

  for (const [url, product] of Object.entries(catalog)) {
    if (!product.promo) continue;

    promos.push({
      url,
      name: product.names?.en || product.names?.de || 'Unnamed product',
      nameDe: product.names?.de || '',
      price: product.price,
      currency: product.currency || 'CHF',
      quantityStr: formatQuantity(product.quantity),
      pricePerUnit: product.price_per_meausure_unit || '',
      discount: product.promo_percentage || 0,
      deadline: product.promo_deadline_yyyy_mm_dd || null,
    });
  }

  // Sort: items with a deadline first (soonest first), then remaining promos
  promos.sort((a, b) => {
    if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
    if (a.deadline) return -1;
    if (b.deadline) return 1;
    return a.price - b.price;
  });

  return promos;
}

/**
 * Groups promos by how deep the discount is. Migros does not publish a
 * percentage for every promotion, so those are counted on their own rather
 * than being lumped in with the shallow discounts.
 */
function groupByDiscountBand(promos) {
  const bands = {
    '50% or more': [],
    '30% to 49%': [],
    '15% to 29%': [],
    'under 15%': [],
    'no percentage published': [],
  };

  for (const p of promos) {
    if (!p.discount) bands['no percentage published'].push(p);
    else if (p.discount >= 50) bands['50% or more'].push(p);
    else if (p.discount >= 30) bands['30% to 49%'].push(p);
    else if (p.discount >= 15) bands['15% to 29%'].push(p);
    else bands['under 15%'].push(p);
  }

  return bands;
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

/**
 * Formats the promo list as a plain-text email body.
 * In a real script you'd send this via SendGrid, Resend, or similar.
 */
function formatEmailBody(promos, fetchedAt) {
  const lines = [
    `Migros Promotions Summary — ${fetchedAt}`,
    `Total items on promotion: ${promos.length}`,
    '',
    '=== Items expiring soonest ===',
  ];

  const withDeadline = promos.filter(p => p.deadline).slice(0, 10);
  for (const p of withDeadline) {
    const price = `CHF ${(p.price / 100).toFixed(2)}`;
    lines.push(`  • ${p.name} (${p.quantityStr}) — ${price}  [expires ${p.deadline}]`);
  }

  lines.push('', '=== All current promotions ===');
  for (const p of promos) {
    const price = `CHF ${(p.price / 100).toFixed(2)}`;
    const discount = p.discount ? ` (-${p.discount}%)` : '';
    lines.push(`  • ${p.name} (${p.quantityStr}) — ${price}${discount}`);
  }

  lines.push('', '---');
  lines.push('Powered by the Pepesto Grocery API — https://pepesto.com/api');

  return lines.join('\n');
}

async function main() {
  console.log('=== Migros CH Promotions Scanner ===\n');

  const promos = extractPromos(await fetchMigrosPromotions());
  const fetchedAt = new Date().toISOString().slice(0, 10);

  if (promos.length === 0) {
    console.log('No promotions found in today\'s snapshot. Try again later.');
    return;
  }

  console.log(`Found ${promos.length} products on promotion.\n`);

  // Print top 20 by soonest deadline
  console.log('=== Promotions (soonest expiry first) ===\n');
  const display = promos.slice(0, 20);
  for (const p of display) {
    const price = `CHF ${(p.price / 100).toFixed(2)}`;
    const deadline = p.deadline ? ` — expires ${p.deadline}` : '';
    const discount = p.discount ? ` (-${p.discount}%)` : '';
    console.log(`  ${p.name.padEnd(50)} ${price.padEnd(12)} ${p.quantityStr.padEnd(10)}${deadline}${discount}`);
  }

  // How deep the discounts go
  const bands = groupByDiscountBand(promos);
  console.log('\n=== How deep the discounts go ===\n');
  for (const [band, items] of Object.entries(bands)) {
    console.log(`  ${band.padEnd(35)} ${items.length} item(s)`);
  }

  // Generate email body
  const emailBody = formatEmailBody(promos, fetchedAt);
  console.log('\n=== Email preview (first 20 lines) ===\n');
  console.log(emailBody.split('\n').slice(0, 20).join('\n'));
  console.log('...');
  console.log('\nIn production: pass emailBody to your email sender (Resend, SendGrid, etc.)');
}

main().catch(err => {
  console.error('Unexpected error:', err.message);
  process.exit(1);
});
