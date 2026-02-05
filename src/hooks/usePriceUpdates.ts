import { useState, useEffect, useCallback, useRef } from 'react';
import { PriceUpdate } from '../types';
import { PriceService } from '../services/priceService';

interface UsePriceUpdatesOptions {
  symbols: string[];
  updateInterval?: number;
  useWebSocket?: boolean;
}

export const usePriceUpdates = ({ 
  symbols, 
  updateInterval = 5000, 
  useWebSocket = false 
}: UsePriceUpdatesOptions) => {
  const [priceUpdates, setPriceUpdates] = useState<PriceUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const websocketRef = useRef<WebSocket | null>(null);

  const priceService = PriceService.getInstance();

  const fetchPrices = useCallback(async () => {
    if (symbols.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const responses = await priceService.getMultiplePrices(symbols);
      const updates: PriceUpdate[] = responses.map(response => ({
        symbol: response.symbol,
        price: response.price,
        timestamp: new Date(),
        source: 'api'
      }));

      setPriceUpdates(updates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
      console.error('Price update error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [symbols, priceService]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    fetchPrices(); // Initial fetch
    intervalRef.current = setInterval(fetchPrices, updateInterval);
  }, [fetchPrices, updateInterval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const connectWebSocket = useCallback(() => {
    if (symbols.length === 0 || !useWebSocket) return;

    // For demo purposes, we'll use polling instead of real WebSocket
    // In production, this would establish actual WebSocket connections
    console.log('WebSocket connection simulated - using polling instead');
    startPolling();
  }, [symbols, useWebSocket, startPolling]);

  const disconnectWebSocket = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    stopPolling();
  }, [stopPolling]);

  useEffect(() => {
    if (useWebSocket) {
      connectWebSocket();
    } else {
      startPolling();
    }

    return () => {
      disconnectWebSocket();
    };
  }, [useWebSocket, connectWebSocket, disconnectWebSocket, startPolling]);

  useEffect(() => {
    // Restart polling when symbols change
    if (useWebSocket) {
      connectWebSocket();
    } else {
      stopPolling();
      startPolling();
    }
  }, [symbols, useWebSocket, connectWebSocket, stopPolling, startPolling]);

  const getPriceForSymbol = useCallback((symbol: string): number | null => {
    const update = priceUpdates.find(update => update.symbol === symbol);
    return update ? update.price : null;
  }, [priceUpdates]);

  return {
    priceUpdates,
    isLoading,
    error,
    getPriceForSymbol,
    refreshPrices: fetchPrices,
    disconnect: disconnectWebSocket
  };
};