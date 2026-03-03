# Crypto & Forex Price API

A paid Lucid Agent API providing live cryptocurrency and forex prices with x402 micropayments.

## Features

- **Live Crypto Prices**: Real-time cryptocurrency prices from CoinGecko
- **Forex Rates**: Live currency exchange rates from Frankfurter
- **Batch Queries**: Fetch up to 10 pairs in a single request
- **Price History**: Historical price data for analysis
- **x402 Payments**: Built-in micropayment support

## Endpoints

### Health Check (Free)
```
GET /health
```

### Get Single Price ($0.001)
```
GET /v1/price?pair=ETH-USD
```

### Get Batch Prices ($0.003)
```
GET /v1/price/batch?pairs=ETH-USD,BTC-USD,EUR-USD
```

### Get Price History ($0.002)
```
GET /v1/price/history?pair=ETH-USD&days=7
```

## Supported Pairs

### Crypto
- BTC-USD, ETH-USD, SOL-USD, ADA-USD, DOT-USD
- AVAX-USD, MATIC-USD, LINK-USD, UNI-USD, AAVE-USD

### Forex
- EUR-USD, GBP-USD, JPY-USD, AUD-USD, CAD-USD
- CHF-USD, CNY-USD, and 15+ more pairs

## Tech Stack

- **Runtime**: Bun
- **Framework**: Hono
- **Validation**: Zod
- **Data Sources**: CoinGecko API, Frankfurter API
- **Deployment**: Railway
- **Payments**: x402

## Development

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run tests
bun test

# Type check
bun run typecheck
```

## Deployment

### Railway

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login and deploy:
```bash
railway login
railway init
railway up
```

3. Get your domain:
```bash
railway domain
```

### Environment Variables

```env
PORT=3000
```

## API Response Format

```json
{
  "pair": "ETH-USD",
  "price": 3456.78,
  "change24h": 123.45,
  "change24hPct": 3.75,
  "high24h": 3500.00,
  "low24h": 3300.00,
  "volume24h": 15000000000,
  "source": "coingecko",
  "freshness": {
    "fetchedAt": "2026-03-03T12:00:00.000Z",
    "staleness": 0,
    "confidence": 0.95
  }
}
```

## Testing

```bash
# Run all tests
bun test

# Run with coverage
bun test --coverage
```

## License

MIT
# Trigger redeploy
