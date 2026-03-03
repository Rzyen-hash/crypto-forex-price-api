export interface PriceResponse {
  pair: string;
  price: number;
  change24h: number;
  change24hPct: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  source: string;
  freshness: {
    fetchedAt: string;
    staleness: number;
    confidence: number;
  };
}

export interface BatchPriceRequest {
  pairs: string[];
}

export interface BatchPriceResponse {
  results: PriceResponse[];
  errors?: string[];
}

export interface HistoryRequest {
  pair: string;
  days: number;
}

export interface HistoryResponse {
  pair: string;
  days: number;
  prices: {
    timestamp: number;
    price: number;
  }[];
  source: string;
  freshness: {
    fetchedAt: string;
    staleness: number;
    confidence: number;
  };
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  uptime: number;
}
