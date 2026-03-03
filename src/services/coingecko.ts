import type { PriceResponse } from '../types';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const CACHE_TTL = 30000; // 30 seconds

interface CoinGeckoCache {
  data: PriceResponse | null;
  timestamp: number;
}

const cache: Map<string, CoinGeckoCache> = new Map();

const cryptoSymbols: Record<string, string> = {
  'BTC': 'bitcoin',
  'ETH': 'ethereum',
  'SOL': 'solana',
  'ADA': 'cardano',
  'DOT': 'polkadot',
  'AVAX': 'avalanche-2',
  'MATIC': 'matic-network',
  'LINK': 'chainlink',
  'UNI': 'uniswap',
  'AAVE': 'aave',
};

export function parsePair(pair: string): { base: string; quote: string } | null {
  const parts = pair.split('-');
  if (parts.length !== 2) return null;
  return { base: parts[0].toUpperCase(), quote: parts[1].toUpperCase() };
}

export function isCryptoPair(pair: string): boolean {
  const parsed = parsePair(pair);
  if (!parsed) return false;
  return !!cryptoSymbols[parsed.base];
}

export async function getCryptoPrice(pair: string): Promise<PriceResponse | null> {
  const parsed = parsePair(pair);
  if (!parsed) return null;
  
  const { base, quote } = parsed;
  const coinId = cryptoSymbols[base];
  
  if (!coinId) return null;
  
  // Check cache
  const cached = cache.get(pair);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const marketData = data.market_data;
    
    const quoteLower = quote.toLowerCase();
    const price = marketData.current_price[quoteLower];
    
    if (price === undefined) {
      throw new Error(`Quote currency ${quote} not supported`);
    }
    
    const result: PriceResponse = {
      pair: `${base}-${quote}`,
      price: price,
      change24h: marketData.price_change_24h_in_currency?.[quoteLower] || 0,
      change24hPct: marketData.price_change_percentage_24h_in_currency?.[quoteLower] || 0,
      high24h: marketData.high_24h?.[quoteLower] || 0,
      low24h: marketData.low_24h?.[quoteLower] || 0,
      volume24h: marketData.total_volume?.[quoteLower] || 0,
      source: 'coingecko',
      freshness: {
        fetchedAt: new Date().toISOString(),
        staleness: 0,
        confidence: 0.95,
      },
    };
    
    // Update cache
    cache.set(pair, { data: result, timestamp: Date.now() });
    
    return result;
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    return null;
  }
}

export async function getCryptoHistory(pair: string, days: number): Promise<any | null> {
  const parsed = parsePair(pair);
  if (!parsed) return null;
  
  const { base, quote } = parsed;
  const coinId = cryptoSymbols[base];
  
  if (!coinId) return null;
  
  try {
    const response = await fetch(
      `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=${quote.toLowerCase()}&days=${days}&interval=daily`
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      pair,
      days,
      prices: data.prices.map((p: [number, number]) => ({
        timestamp: p[0],
        price: p[1],
      })),
      source: 'coingecko',
      freshness: {
        fetchedAt: new Date().toISOString(),
        staleness: 0,
        confidence: 0.95,
      },
    };
  } catch (error) {
    console.error('Error fetching crypto history:', error);
    return null;
  }
}
