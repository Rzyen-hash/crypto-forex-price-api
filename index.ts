import { Hono } from 'hono';
import { getPrice, getBatchPrices, getHistory, isValidPair } from './src/services/price';
import type { BatchPriceResponse, HistoryResponse, HealthResponse } from './src/types';

const app = new Hono();

const startTime = Date.now();

// Health check endpoint (free)
app.get('/health', (c) => {
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    uptime: Date.now() - startTime,
  };
  return c.json(response);
});

// GET /v1/price?pair=ETH-USD ($0.001)
app.get('/v1/price', async (c) => {
  const pair = c.req.query('pair');
  
  if (!pair) {
    return c.json({ error: 'Missing required parameter: pair' }, 400);
  }
  
  // Validate pair format
  if (!isValidPair(pair)) {
    return c.json({ error: `Invalid or unsupported pair: ${pair}. Use format BASE-QUOTE (e.g., ETH-USD, EUR-USD)` }, 400);
  }
  
  const price = await getPrice(pair);
  
  if (!price) {
    return c.json({ error: `Failed to fetch price for ${pair}` }, 404);
  }
  
  return c.json(price);
});

// GET /v1/price/batch?pairs=ETH-USD,BTC-USD ($0.003, max 10)
app.get('/v1/price/batch', async (c) => {
  const pairsParam = c.req.query('pairs');
  
  if (!pairsParam) {
    return c.json({ error: 'Missing required parameter: pairs' }, 400);
  }
  
  const pairs = pairsParam.split(',').map(p => p.trim().toUpperCase());
  
  // Validate number of pairs
  if (pairs.length > 10) {
    return c.json({ error: 'Maximum 10 pairs allowed per batch request' }, 400);
  }
  
  // Validate all pairs
  const invalidPairs = pairs.filter(p => !isValidPair(p));
  if (invalidPairs.length > 0) {
    return c.json({ 
      error: `Invalid pairs: ${invalidPairs.join(', ')}`,
      message: 'Use format BASE-QUOTE (e.g., ETH-USD, EUR-USD)'
    }, 400);
  }
  
  const { results, errors } = await getBatchPrices(pairs);
  
  const response: BatchPriceResponse = {
    results,
  };
  
  if (errors.length > 0) {
    response.errors = errors;
  }
  
  return c.json(response);
});

// GET /v1/price/history?pair=ETH-USD&days=7 ($0.002)
app.get('/v1/price/history', async (c) => {
  const pair = c.req.query('pair');
  const daysParam = c.req.query('days');
  
  if (!pair || !daysParam) {
    return c.json({ error: 'Missing required parameters: pair and days' }, 400);
  }
  
  const days = parseInt(daysParam, 10);
  
  if (isNaN(days) || days < 1 || days > 365) {
    return c.json({ error: 'Invalid days parameter. Must be between 1 and 365' }, 400);
  }
  
  if (!isValidPair(pair)) {
    return c.json({ error: `Invalid or unsupported pair: ${pair}` }, 400);
  }
  
  const history = await getHistory(pair, days);
  
  if (!history) {
    return c.json({ error: `Failed to fetch history for ${pair}` }, 404);
  }
  
  return c.json(history);
});

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

const port = process.env.PORT || 3000;

// Bun serve
Bun.serve({
  port,
  fetch: app.fetch,
});

console.log(`Server running at http://localhost:${port}`);
