import { useState, useCallback } from 'react';
import { Holding, Portfolio } from '../types';
import { PortfolioService } from '../services/portfolioService';

export const usePortfolio = () => {
  const [portfolio, setPortfolio] = useState<Portfolio>(() => {
    const portfolioService = PortfolioService.getInstance();
    return portfolioService.loadPortfolio();
  });

  const portfolioService = PortfolioService.getInstance();

  const addHolding = useCallback((holding: Holding) => {
    const updatedPortfolio = portfolioService.addHolding(portfolio, holding);
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  }, [portfolio, portfolioService]);

  const updateHolding = useCallback((holdingId: string, updates: Partial<Holding>) => {
    const updatedPortfolio = portfolioService.updateHolding(portfolio, holdingId, updates);
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  }, [portfolio, portfolioService]);

  const removeHolding = useCallback((holdingId: string) => {
    const updatedPortfolio = portfolioService.removeHolding(portfolio, holdingId);
    setPortfolio(updatedPortfolio);
    portfolioService.savePortfolio(updatedPortfolio);
  }, [portfolio, portfolioService]);

  const updatePrices = useCallback((updates: { symbol: string; price: number }[]) => {
    const updatedPortfolio = { ...portfolio };
    
    updates.forEach(update => {
      const allHoldings = [...updatedPortfolio.stocks, ...updatedPortfolio.crypto];
      const holding = allHoldings.find(h => h.symbol === update.symbol);
      if (holding) {
        holding.currentPrice = update.price;
        holding.lastUpdated = new Date();
      }
    });

    const finalPortfolio = portfolioService.calculatePortfolioTotals(updatedPortfolio);
    setPortfolio(finalPortfolio);
    portfolioService.savePortfolio(finalPortfolio);
  }, [portfolio, portfolioService]);

  const clearPortfolio = useCallback(() => {
    portfolioService.clearPortfolio();
    const emptyPortfolio = portfolioService.loadPortfolio();
    setPortfolio(emptyPortfolio);
  }, [portfolioService]);

  const exportPortfolio = useCallback(() => {
    return portfolioService.exportPortfolio();
  }, [portfolioService]);

  const importPortfolio = useCallback((jsonString: string) => {
    portfolioService.importPortfolio(jsonString);
    const importedPortfolio = portfolioService.loadPortfolio();
    setPortfolio(importedPortfolio);
  }, [portfolioService]);

  return {
    portfolio,
    addHolding,
    updateHolding,
    removeHolding,
    updatePrices,
    clearPortfolio,
    exportPortfolio,
    importPortfolio
  };
};