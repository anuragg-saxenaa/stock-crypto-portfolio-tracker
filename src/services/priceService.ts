import { APIResponse } from '../types';

export class PriceService {
  private static instance: PriceService;
  // API keys / URLs would be configured here for a production implementation.

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getStockPrice(symbol: string): Promise<APIResponse> {
    try {
      // Using a mock API response for demo purposes
      // In production, this would call real APIs
      const mockPrice = this.generateMockPrice(symbol);
      return {
        symbol: symbol.toUpperCase(),
        price: mockPrice.price,
        change: mockPrice.change,
        changePercent: mockPrice.changePercent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching stock price:', error);
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
  }

  async getCryptoPrice(symbol: string): Promise<APIResponse> {
    try {
      // Using a mock API response for demo purposes
      const mockPrice = this.generateMockPrice(symbol);
      return {
        symbol: symbol.toUpperCase(),
        price: mockPrice.price,
        change: mockPrice.change,
        changePercent: mockPrice.changePercent,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching crypto price:', error);
      throw new Error(`Failed to fetch price for ${symbol}`);
    }
  }

  async getMultiplePrices(symbols: string[]): Promise<APIResponse[]> {
    const promises = symbols.map(symbol => {
      // Simple heuristic to determine if it's crypto or stock
      if (['BTC', 'ETH', 'ADA', 'DOT', 'LINK'].includes(symbol.toUpperCase())) {
        return this.getCryptoPrice(symbol);
      }
      return this.getStockPrice(symbol);
    });

    return Promise.all(promises);
  }

  private generateMockPrice(symbol: string): { price: number; change: number; changePercent: number } {
    // Generate realistic mock prices based on symbol
    const basePrices: { [key: string]: number } = {
      'AAPL': 185.92,
      'GOOGL': 142.65,
      'MSFT': 378.91,
      'TSLA': 248.42,
      'AMZN': 155.33,
      'BTC': 43250.00,
      'ETH': 2650.00,
      'ADA': 0.48,
      'DOT': 7.25,
      'LINK': 14.80
    };

    const basePrice = basePrices[symbol.toUpperCase()] || 100.00;
    const variation = (Math.random() - 0.5) * 0.02; // ±1% variation
    const price = basePrice * (1 + variation);
    const change = price - basePrice;
    const changePercent = (change / basePrice) * 100;

    return {
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100
    };
  }

  // WebSocket connection methods would go here in a full implementation
  connectWebSocket(symbols: string[]): WebSocket | null {
    // Mock WebSocket connection for demo
    // In production, this would establish real WebSocket connections
    console.log(`Connecting WebSocket for symbols: ${symbols.join(', ')}`);
    return null;
  }

  disconnectWebSocket(): void {
    console.log('Disconnecting WebSocket');
  }
}