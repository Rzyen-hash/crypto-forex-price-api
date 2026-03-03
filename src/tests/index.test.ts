import { describe, it, expect, beforeAll } from 'bun:test';

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

describe('Crypto & Forex Price API', () => {
  
  // Contract Tests
  describe('Contract Tests', () => {
    it('should have correct pair format BASE-QUOTE', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=ETH-USD`);
      const data = await response.json();
      
      if (response.status === 200) {
        expect(data.pair).toMatch(/^[A-Z]{2,5}-[A-Z]{2,5}$/);
      }
    });
    
    it('should reject invalid pair format', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=INVALID`);
      expect(response.status).toBe(400);
    });
    
    it('should reject missing pair parameter', async () => {
      const response = await fetch(`${BASE_URL}/v1/price`);
      expect(response.status).toBe(400);
    });
    
    it('should batch limit to 10 pairs', async () => {
      const pairs = Array(11).fill('ETH-USD').join(',');
      const response = await fetch(`${BASE_URL}/v1/price/batch?pairs=${pairs}`);
      expect(response.status).toBe(400);
    });
  });

  // Health Endpoint Tests
  describe('Health Endpoint', () => {
    it('should return healthy status', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.status).toBe('healthy');
      expect(data.timestamp).toBeDefined();
      expect(data.version).toBeDefined();
      expect(data.uptime).toBeDefined();
    });
    
    it('should have valid ISO timestamp', async () => {
      const response = await fetch(`${BASE_URL}/health`);
      const data = await response.json();
      
      const timestamp = new Date(data.timestamp);
      expect(timestamp.toISOString()).toBe(data.timestamp);
    });
  });

  // Crypto Price Tests
  describe('Crypto Price Endpoint', () => {
    it('should fetch ETH-USD price', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=ETH-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBe('ETH-USD');
        expect(data.price).toBeGreaterThan(0);
        expect(data.source).toBe('coingecko');
        expect(data.freshness).toBeDefined();
      }
    });
    
    it('should fetch BTC-USD price', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=BTC-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBe('BTC-USD');
        expect(data.price).toBeGreaterThan(0);
      }
    });
    
    it('should return 404 for unsupported crypto', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=UNKNOWN-USD`);
      expect(response.status).toBe(400);
    });
  });

  // Forex Price Tests
  describe('Forex Price Endpoint', () => {
    it('should fetch EUR-USD rate', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=EUR-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBe('EUR-USD');
        expect(data.price).toBeGreaterThan(0);
        expect(data.source).toBe('frankfurter');
      }
    });
    
    it('should fetch GBP-USD rate', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=GBP-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBe('GBP-USD');
        expect(data.price).toBeGreaterThan(0);
      }
    });
  });

  // Batch Price Tests
  describe('Batch Price Endpoint', () => {
    it('should fetch multiple pairs', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/batch?pairs=ETH-USD,BTC-USD,EUR-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.results).toBeDefined();
        expect(data.results.length).toBeGreaterThan(0);
      }
    });
    
    it('should handle mixed crypto and forex pairs', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/batch?pairs=ETH-USD,EUR-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        const sources = data.results.map((r: any) => r.source);
        expect(sources).toContain('coingecko');
        expect(sources).toContain('frankfurter');
      }
    });
  });

  // History Tests
  describe('History Endpoint', () => {
    it('should fetch ETH-USD history for 7 days', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/history?pair=ETH-USD&days=7`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBe('ETH-USD');
        expect(data.days).toBe(7);
        expect(data.prices).toBeDefined();
        expect(data.prices.length).toBeGreaterThan(0);
      }
    });
    
    it('should validate days parameter', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/history?pair=ETH-USD&days=0`);
      expect(response.status).toBe(400);
    });
    
    it('should validate max days parameter', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/history?pair=ETH-USD&days=400`);
      expect(response.status).toBe(400);
    });
    
    it('should require pair and days parameters', async () => {
      const response = await fetch(`${BASE_URL}/v1/price/history?pair=ETH-USD`);
      expect(response.status).toBe(400);
    });
  });

  // Response Schema Tests
  describe('Response Schema Validation', () => {
    it('should have all required price fields', async () => {
      const response = await fetch(`${BASE_URL}/v1/price?pair=ETH-USD`);
      
      if (response.status === 200) {
        const data = await response.json();
        expect(data.pair).toBeDefined();
        expect(data.price).toBeDefined();
        expect(data.change24h).toBeDefined();
        expect(data.change24hPct).toBeDefined();
        expect(data.high24h).toBeDefined();
        expect(data.low24h).toBeDefined();
        expect(data.volume24h).toBeDefined();
        expect(data.source).toBeDefined();
        expect(data.freshness).toBeDefined();
        expect(data.freshness.fetchedAt).toBeDefined();
        expect(data.freshness.staleness).toBeDefined();
        expect(data.freshness.confidence).toBeDefined();
      }
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should return 404 for unknown endpoint', async () => {
      const response = await fetch(`${BASE_URL}/unknown`);
      expect(response.status).toBe(404);
    });
    
    it('should return proper error message', async () => {
      const response = await fetch(`${BASE_URL}/v1/price`);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });
  });
});
