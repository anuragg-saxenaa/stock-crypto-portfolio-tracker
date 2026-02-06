import { APIResponse } from '../types';

type PriceApiResponse = {
  quotes: Array<{
    symbol: string;
    price: number;
    changePercent?: number;
    timestamp: string;
    source?: string;
  }>;
  ts: string;
};

export class PriceService {
  private static instance: PriceService;

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getMultiplePrices(symbols: string[]): Promise<APIResponse[]> {
    const unique = Array.from(
      new Set(symbols.map(s => s.trim().toUpperCase()).filter(Boolean))
    );
    if (unique.length === 0) return [];

    // Prefer our local API (server/index.mjs). In dev, Vite proxies /api to it.
    // In prod, the same server serves the static files + /api.
    const res = await fetch(`/api/prices?symbols=${encodeURIComponent(unique.join(','))}`);
    if (!res.ok) {
      throw new Error(`Price API failed: ${res.status}`);
    }

    const data = (await res.json()) as PriceApiResponse;
    return (data.quotes ?? []).map(q => ({
      symbol: q.symbol,
      price: q.price,
      changePercent: q.changePercent,
      timestamp: q.timestamp
    }));
  }
}
