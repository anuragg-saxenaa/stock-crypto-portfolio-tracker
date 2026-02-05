export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  currentPrice: number;
  lastUpdated: Date;
  type: 'stock' | 'crypto';
}

export interface Portfolio {
  stocks: Holding[];
  crypto: Holding[];
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
  lastUpdated: Date;
}

export interface PriceUpdate {
  symbol: string;
  price: number;
  timestamp: Date;
  source: 'api' | 'websocket' | 'poll';
}

export interface APIResponse {
  symbol: string;
  price: number;
  change?: number;
  changePercent?: number;
  timestamp: string;
}

export interface WebSocketMessage {
  type: 'price_update' | 'connection_status' | 'error';
  data?: any;
  timestamp: Date;
}

export interface ResponsiveBreakpoint {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}

export type SortOption = 'symbol' | 'value' | 'pnl' | 'pnl_percentage';
export type FilterOption = 'all' | 'profit' | 'loss';