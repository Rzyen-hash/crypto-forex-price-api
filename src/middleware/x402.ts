import type { Context, Next } from 'hono';

// x402 Payment Configuration
const X402_CONFIG = {
  // Taskmarket wallet address
  payTo: '0x84FDEbBfe9692392abd30429e1a6Ae75D8B7fb3B',
  // USDC on Base
  asset: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  // Base network
  chainId: 8453,
  // Default price: 0.01 USDC (10000 wei)
  defaultAmount: '10000',
};

// Payment requirement header value (base64 encoded JSON)
function createPaymentRequirement(amount: string): string {
  const requirement = {
    scheme: 'exact',
    network: 'base',
    asset: X402_CONFIG.asset,
    amount: amount,
    payTo: X402_CONFIG.payTo,
    maxTimeoutSeconds: 300,
  };
  return Buffer.from(JSON.stringify(requirement)).toString('base64');
}

// Verify payment signature (simplified - production should use proper verification)
function verifyPayment(paymentHeader: string): boolean {
  try {
    // Decode payment header
    const payment = JSON.parse(Buffer.from(paymentHeader, 'base64').toString());
    
    // Basic validation
    if (!payment.signature || !payment.amount || !payment.payTo) {
      return false;
    }
    
    // Verify payTo matches our config
    if (payment.payTo.toLowerCase() !== X402_CONFIG.payTo.toLowerCase()) {
      return false;
    }
    
    // In production: verify signature cryptographically
    // For demo: accept any well-formed payment
    return true;
  } catch (e) {
    return false;
  }
}

// x402 Middleware for Hono
export function x402Middleware(amount?: string) {
  return async (c: Context, next: Next) => {
    const paymentAmount = amount || X402_CONFIG.defaultAmount;
    const paymentHeader = c.req.header('X-PAYMENT') || c.req.header('PAYMENT-SIGNATURE');
    
    // If no payment header, return 402
    if (!paymentHeader) {
      const requirement = createPaymentRequirement(paymentAmount);
      
      return c.json({
        error: 'Payment Required',
        message: 'This endpoint requires x402 payment. Include X-PAYMENT header.',
        paymentRequired: requirement,
        documentation: 'https://x402.org',
      }, 402, {
        'X-PAYMENT-REQUIRED': requirement,
        'X-PAYMENT-VERSION': '2',
      });
    }
    
    // Verify payment
    if (!verifyPayment(paymentHeader)) {
      return c.json({
        error: 'Invalid Payment',
        message: 'Payment signature verification failed',
      }, 402);
    }
    
    // Payment valid, continue to handler
    await next();
  };
}

// x402 Middleware with different amounts per endpoint
export function x402PriceMiddleware() {
  return x402Middleware('10000'); // 0.01 USDC
}

export function x402BatchMiddleware() {
  return x402Middleware('30000'); // 0.03 USDC for batch (max 10 pairs)
}

export function x402HistoryMiddleware() {
  return x402Middleware('20000'); // 0.02 USDC for history
}

// Manifest endpoint for XGate discovery
export function getX402Manifest() {
  return {
    resource: 'https://crypto-forex-price-api-production.up.railway.app',
    type: 'http',
    x402Version: 2,
    networks: ['eip155:8453'],
    assets: [X402_CONFIG.asset],
    maxAmountRequired: '30000',
    payTo: [X402_CONFIG.payTo],
    accepts: [
      {
        asset: X402_CONFIG.asset,
        description: 'Get live cryptocurrency and forex prices. Endpoints: /v1/price?pair=ETH-USD (0.01 USDC), /v1/price/batch?pairs=ETH-USD,BTC-USD (0.03 USDC), /v1/price/history?pair=ETH-USD&days=7 (0.02 USDC)',
        extra: {
          name: 'USD Coin',
          version: '2',
        },
        maxAmountRequired: '10000',
        maxTimeoutSeconds: 300,
        mimeType: 'application/json',
        network: 'eip155:8453',
        payTo: X402_CONFIG.payTo,
        resource: 'https://crypto-forex-price-api-production.up.railway.app/v1/price',
        scheme: 'exact',
      },
      {
        asset: X402_CONFIG.asset,
        description: 'Batch price lookup for up to 10 crypto/forex pairs',
        extra: {
          name: 'USD Coin',
          version: '2',
        },
        maxAmountRequired: '30000',
        maxTimeoutSeconds: 300,
        mimeType: 'application/json',
        network: 'eip155:8453',
        payTo: X402_CONFIG.payTo,
        resource: 'https://crypto-forex-price-api-production.up.railway.app/v1/price/batch',
        scheme: 'exact',
      },
      {
        asset: X402_CONFIG.asset,
        description: 'Historical price data for crypto/forex pairs',
        extra: {
          name: 'USD Coin',
          version: '2',
        },
        maxAmountRequired: '20000',
        maxTimeoutSeconds: 300,
        mimeType: 'application/json',
        network: 'eip155:8453',
        payTo: X402_CONFIG.payTo,
        resource: 'https://crypto-forex-price-api-production.up.railway.app/v1/price/history',
        scheme: 'exact',
      },
    ],
    metadata: {},
    lastUpdated: new Date().toISOString(),
  };
}