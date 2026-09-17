# Pepesto Grocery API — Code Examples

Real JavaScript examples for each European supermarket supported by the [Pepesto API](https://www.pepesto.com/ai-grocery-shopping-agent/).

## What is Pepesto?

Pepesto is a grocery API that lets you parse recipes, match ingredients to real supermarket SKUs across 26 European supermarkets, and create checkout sessions — all via a simple REST API. [Docs at pepesto.com/api](https://www.pepesto.com/ai-grocery-shopping-agent/).

## Getting Started

```bash
export PEPESTO_EMAIL=you@example.com
node getting-started/get-api-key.js

export PEPESTO_API_KEY=pep_sk_your_key_here
node supermarkets/tesco-recipe-to-cart-oneshot.js
```

## Examples by Supermarket

| # | Country | Supermarket | Script | Solution |
|---|---------|-------------|--------|-------|
| 1 | 🇬🇧 GB | Tesco | [`tesco-recipe-to-cart-oneshot.js`](tesco-recipe-to-cart-oneshot.js) | [tesco](https://www.pepesto.com/built-with-pepesto/tesco/) |
| 2 | 🇬🇧 GB | Sainsbury's | [`sainsburys-weekly-meal-planner.js`](sainsburys-weekly-meal-planner.js) | [sainsburys](https://pepesto.com/built-with-pepesto/sainsburys/) |
| 3 | 🇬🇧 GB | ASDA | [`asda-budget-week-50-pounds.js`](asda-budget-week-50-pounds.js) | [asda](https://pepesto.com/built-with-pepesto/asda/) |
| 4 | 🇬🇧 GB | Morrisons | [`morrisons-telegram-grocery-bot.js`](morrisons-telegram-grocery-bot.js) | [morrisons](https://pepesto.com/built-with-pepesto/morrisons/) |
| 5 | 🇬🇧 GB | Waitrose | [`waitrose-promotions-scanner.js`](waitrose-promotions-scanner.js) | [waitrose](https://pepesto.com/built-with-pepesto/waitrose/) |
| 6 | 🇳🇱 NL | Albert Heijn | [`albert-heijn-price-comparison-nl.js`](albert-heijn-price-comparison-nl.js) | [albert-heijn](https://pepesto.com/built-with-pepesto/albert-heijn/) |
| 7 | 🇳🇱 NL | Jumbo | [`jumbo-vegan-week-meal-plan.js`](jumbo-vegan-week-meal-plan.js) | [jumbo](https://pepesto.com/built-with-pepesto/jumbo/) |
| 8 | 🇳🇱 NL | Plus NL | [`plus-nl-price-tracker-webhook.js`](plus-nl-price-tracker-webhook.js) | [plus-nl](https://pepesto.com/built-with-pepesto/plus-nl/) |
| 9 | 🇩🇪 DE | Rewe | [`rewe-germany-vs-switzerland-prices.js`](rewe-germany-vs-switzerland-prices.js) | [rewe](https://pepesto.com/built-with-pepesto/rewe/) |
| 10 | 🇨🇭 CH | Coop CH | [`coop-ch-sunday-dinner-oneshot.js`](coop-ch-sunday-dinner-oneshot.js) | [coop-ch](https://pepesto.com/built-with-pepesto/coop-ch/) |
| 11 | 🇨🇭 CH | Migros | [`migros-promotions-scanner-chf.js`](migros-promotions-scanner-chf.js) | [migros](https://pepesto.com/built-with-pepesto/migros/) |
| 13 | 🇨🇭 CH | Aldi CH | [`aldi-ch-cheapest-carbonara.js`](aldi-ch-cheapest-carbonara.js) | [aldi-ch](https://pepesto.com/built-with-pepesto/aldi-ch/) |
| 14 | 🇧🇪 BE | Colruyt | [`colruyt-vs-delhaize-belgium-comparison.js`](colruyt-vs-delhaize-belgium-comparison.js) | [colruyt](https://pepesto.com/built-with-pepesto/colruyt/) |
| 15 | 🇧🇪 BE | Delhaize | [`delhaize-keto-week-meal-plan.js`](delhaize-keto-week-meal-plan.js) | [delhaize](https://pepesto.com/built-with-pepesto/delhaize/) |
| 16 | 🇮🇪 IE | Tesco IE | [`tesco-ie-vs-gb-price-gap.js`](tesco-ie-vs-gb-price-gap.js) | [tesco-ie](https://pepesto.com/built-with-pepesto/tesco-ie/) |
| 17 | 🇮🇪 IE | SuperValu | [`supervalu-dinner-party-three-courses.js`](supervalu-dinner-party-three-courses.js) | [supervalu](https://pepesto.com/built-with-pepesto/supervalu/) |
| 18 | 🇮🇪 IE | Dunnes | [`dunnes-reorder-usual-shop.js`](dunnes-reorder-usual-shop.js) | [dunnes](https://pepesto.com/built-with-pepesto/dunnes/) |
| 19 | 🇮🇹 IT | Esselunga | [`esselunga-italian-sunday-lunch.js`](esselunga-italian-sunday-lunch.js) | [esselunga](https://pepesto.com/built-with-pepesto/esselunga/) |
| 20 | 🇮🇹 IT | Conad | [`conad-italy-promotions-scanner.js`](conad-italy-promotions-scanner.js) | [conad](https://pepesto.com/built-with-pepesto/conad/) |
| 21 | 🇩🇰 DK | Nemlig | [`nemlig-dk-meal-prep-five-lunches.js`](nemlig-dk-meal-prep-five-lunches.js) | [nemlig](https://pepesto.com/built-with-pepesto/nemlig/) |
| 22 | 🇳🇴 NO | Meny | [`meny-no-budget-week-500-nok.js`](meny-no-budget-week-500-nok.js) | [meny](https://pepesto.com/built-with-pepesto/meny/) |
| 23 | 🇵🇱 PL | Frisco | [`frisco-pl-family-shop-builder.js`](frisco-pl-family-shop-builder.js) | [frisco](https://pepesto.com/built-with-pepesto/frisco/) |
| 24 | 🇵🇱 PL | Auchan PL | [`auchan-pl-price-tracker-weekly.js`](auchan-pl-price-tracker-weekly.js) | [auchan-pl](https://pepesto.com/built-with-pepesto/auchan-pl/) |
| 25 | 🇧🇬 BG | Bulmag | [`bulmag-bg-first-integration.js`](bulmag-bg-first-integration.js) | [bulmag](https://pepesto.com/built-with-pepesto/bulmag/) |
| 26 | 🇧🇬 BG | eBag | [`ebag-vs-bulmag-bg-price-comparison.js`](ebag-vs-bulmag-bg-price-comparison.js) | [ebag](https://pepesto.com/built-with-pepesto/ebag/) |

## Utilities

| File | Purpose |
|------|---------|
| `utils/format-currency.js` | Format Pepesto price integers to readable strings (EUR, GBP, CHF, NOK, PLN, BGN) |
| `utils/find-promotions.js` | Extract and sort promoted products from a `/api/catalog` response |
| `getting-started/get-api-key.js` | Request an API key via /api/link and check your credit balance |

## License

MIT
