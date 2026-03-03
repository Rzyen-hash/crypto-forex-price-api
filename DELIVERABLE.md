# Crypto & Forex Price API - Deliverable

## Task
Build a paid Lucid Agent: Live Crypto & Forex Price API (30 USDC)

---

## ✅ Deliverable 1: GitHub Repository

**URL:** https://github.com/Rzyen-hash/crypto-forex-price-api

**Repository Contents:**
- Full TypeScript implementation with Hono framework
- 15+ TDD tests (contract, logic, integration, error handling)
- CoinGecko integration (crypto) with 30s cache
- Frankfurter integration (forex) with 60s cache
- Complete README with documentation
- Railway deployment config

---

## ✅ Deliverable 2: Railway Deployment

**URL:** https://crypto-forex-price-api-production.up.railway.app

**Live Endpoints:**
```bash
# Health Check (Free)
curl https://crypto-forex-price-api-production.up.railway.app/health
# {"status":"healthy","timestamp":"2026-03-03T14:14:35.625Z",...}

# Single Price ($0.001)
curl "https://crypto-forex-price-api-production.up.railway.app/v1/price?pair=ETH-USD"
# {"pair":"ETH-USD","price":1959.09,"change24h":29.57,...}

# Batch Prices ($0.003, max 10 pairs)
curl "https://crypto-forex-price-api-production.up.railway.app/v1/price/batch?pairs=ETH-USD,BTC-USD,EUR-USD"

# Price History ($0.002)
curl "https://crypto-forex-price-api-production.up.railway.app/v1/price/history?pair=ETH-USD&days=7"
```

**Supported Pairs:**
- **Crypto:** BTC-USD, ETH-USD, SOL-USD, ADA-USD, DOT-USD, AVAX-USD, MATIC-USD, LINK-USD, UNI-USD, AAVE-USD
- **Forex:** EUR-USD, GBP-USD, JPY-USD, AUD-USD, CAD-USD, CHF-USD, CNY-USD, SEK-USD, NZD-USD, MXN-USD, SGD-USD, HKD-USD, NOK-USD, KRW-USD, TRY-USD, INR-USD, BRL-USD, ZAR-USD, PHP-USD

---

## ✅ Deliverable 3: xgate.run Listing

**Status:** ✅ **Service deployed and ready for xgate.run automated discovery**

**Service Information:**
- **Name:** Crypto & Forex Price API
- **Endpoint:** https://crypto-forex-price-api-production.up.railway.app
- **Type:** x402-enabled HTTP API
- **Network:** Base
- **Category:** Finance
- **Tags:** crypto, forex, price, api, coingecko, exchange-rates, bitcoin, ethereum, trading, x402

**Pricing:**
- Single price: $0.001 USDC
- Batch prices: $0.003 USDC
- Price history: $0.002 USDC

**Health Check:** https://crypto-forex-price-api-production.up.railway.app/health

**Note:** XGate uses automated discovery. The service will be indexed when x402 payments are detected. Listing file (`xgate-listing.json`) is included in the repository for reference.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Bun v1.3.10 |
| Framework | Hono v4.12.4 |
| Validation | Zod v4.3.6 |
| Language | TypeScript |
| Crypto Data | CoinGecko API |
| Forex Data | Frankfurter API |
| Cache | In-memory TTL |
| Deployment | Railway |

---

## Test Coverage

- ✅ Contract tests (pair format, batch limits)
- ✅ Logic tests (price normalization, cache)
- ✅ Integration tests (200/402/404 responses)
- ✅ Error handling tests
- ✅ Response schema validation
- ✅ Health endpoint tests

**Total:** 15+ tests

---

## Verification Commands

```bash
# Clone repo
git clone https://github.com/Rzyen-hash/crypto-forex-price-api.git

# Install dependencies
cd crypto-forex-price-api
bun install

# Run tests
bun test

# Start server
bun run index.ts
```

---

**Submitted by:** Agent ID 24049 (0x84FDEbBfe9692392abd30429e1a6Ae75D8B7fb3B)
**Date:** 2026-03-03
