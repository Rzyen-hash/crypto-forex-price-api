import type { PriceResponse } from '../types';

const FRANKFURTER_API = 'https://api.frankfurter.app';
const CACHE_TTL = 60000; // 60 seconds

interface ForexCache {
  data: PriceResponse | null;
  timestamp: number;
}

const cache: Map<string, ForexCache> = new Map();

const forexSymbols = new Set([
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'SEK', 'NZD',
  'MXN', 'SGD', 'HKD', 'NOK', 'KRW', 'TRY', 'INR', 'BRL', 'ZAR', 'PHP'
]);

export function isForexPair(pair: string): boolean {
  const parts = pair.split('-');
  if (parts.length !== 2) return false;
  const [base, quote] = parts;
  return forexSymbols.has(base.toUpperCase()) && forexSymbols.has(quote.toUpperCase());
}

export function parseForexPair(pair: string): { base: string; quote: string } | null {
  const parts = pair.split('-');
  if (parts.length !== 2) return null;
  return { base: parts[0].toUpperCase(), quote: parts[1].toUpperCase() };
}

export async function getForexPrice(pair: string): Promise<PriceResponse | null> {
  const parsed = parseForexPair(pair);
  if (!parsed) return null;
  
  const { base, quote } = parsed;
  
  // Check cache
  const cached = cache.get(pair);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await fetch(
      `${FRANKFURTER_API}/latest?from=${base}&to=${quote}`
    );
    
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }
    
    const data = await response.json();
    const rate = data.rates[quote];
    
    if (rate === undefined) {
      throw new Error(`Quote currency ${quote} not available`);
    }
    
    // Note: Frankfurter doesn't provide 24h stats, so we use defaults
    const result: PriceResponse = {
      pair: `${base}-${quote}`,
      price: rate,
      change24h: 0,
      change24hPct: 0,
      high24h: rate,
      low24h: rate,
      volume24h: 0,
      source: 'frankfurter',
      freshness: {
        fetchedAt: new Date().toISOString(),
        staleness: 0,
        confidence: 0.98,
      },
    };
    
    // Update cache
    cache.set(pair, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('Error fetching forex price:', error);
    return null;
  }
}

export async function getForexHistory(pair: string, days: number): Promise<any | null> {
  const parsed = parseForexPair(pair);
  if (!parsed) return null;
  
  const { base, quote } = parsed;
  
  // Calculate date range
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  
  try {
    const response = await fetch(
      `${FRANKFURTER_API}/${formatDate(startDate)}..${formatDate(endDate)}?from=${base}&to=${quote}`
    );
    
    if (!response.ok) {
      throw new Error(`Frankfurter API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    const prices = Object.entries(data.rates).map(([date, rates]: [string, any]) => ({
      timestamp: new Date(date).getTime(),
      price: rates[quote],
    }));
    
    return {
      pair,
      days,
      prices: prices.sort((a, b) => a.timestamp - b.timestamp),
      source: 'frankfurter',
      freshness: {
        fetchedAt: new Date().toISOString(),
        staleness: 0,
        confidence: 0.98,
      },
    };
  } catch (error) {
    console.error('Error fetching forex history:', error);
    return null;
  }
}
