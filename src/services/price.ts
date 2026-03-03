import { getCryptoPrice, getCryptoHistory, isCryptoPair } from './coingecko';
import { getForexPrice, getForexHistory, isForexPair } from './frankfurter';
import type { PriceResponse, HistoryResponse } from '../types';

export async function getPrice(pair: string): Promise<PriceResponse | null> {
  // Try crypto first
  if (isCryptoPair(pair)) {
    return getCryptoPrice(pair);
  }
  
  // Try forex
  if (isForexPair(pair)) {
    return getForexPrice(pair);
  }
  
  return null;
}

export async function getBatchPrices(pairs: string[]): Promise<{ results: PriceResponse[]; errors: string[] }> {
  const results: PriceResponse[] = [];
  const errors: string[] = [];
  
  // Limit to 10 pairs
  const limitedPairs = pairs.slice(0, 10);
  
  const promises = limitedPairs.map(async (pair) => {
    const price = await getPrice(pair);
    if (price) {
      results.push(price);
    } else {
      errors.push(`Failed to fetch price for ${pair}`);
    }
  });
  
  await Promise.all(promises);
  
  return { results, errors };
}

export async function getHistory(pair: string, days: number): Promise<HistoryResponse | null> {
  // Validate days parameter
  if (days < 1 || days > 365) {
    return null;
  }
  
  // Try crypto first
  if (isCryptoPair(pair)) {
    const data = await getCryptoHistory(pair, days);
    if (data) {
      return data as HistoryResponse;
    }
  }
  
  // Try forex
  if (isForexPair(pair)) {
    const data = await getForexHistory(pair, days);
    if (data) {
      return data as HistoryResponse;
    }
  }
  
  return null;
}

export function isValidPair(pair: string): boolean {
  return isCryptoPair(pair) || isForexPair(pair);
}
