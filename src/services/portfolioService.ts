import { Holding, Portfolio } from '../types';

export class PortfolioService {
  private static instance: PortfolioService;
  private readonly STORAGE_KEY = 'portfolio-tracker-data';

  static getInstance(): PortfolioService {
    if (!PortfolioService.instance) {
      PortfolioService.instance = new PortfolioService();
    }
    return PortfolioService.instance;
  }

  savePortfolio(portfolio: Portfolio): void {
    try {
      const data = JSON.stringify({
        stocks: portfolio.stocks,
        crypto: portfolio.crypto,
        lastUpdated: portfolio.lastUpdated.toISOString()
      });
      localStorage.setItem(this.STORAGE_KEY, data);
    } catch (error) {
      console.error('Error saving portfolio:', error);
      throw new Error('Failed to save portfolio data');
    }
  }

  loadPortfolio(): Portfolio {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) {
        return this.getDefaultPortfolio();
      }

      const parsed = JSON.parse(data);
      const portfolio: Portfolio = {
        stocks: parsed.stocks || [],
        crypto: parsed.crypto || [],
        totalValue: 0,
        totalPnL: 0,
        totalPnLPercentage: 0,
        lastUpdated: new Date(parsed.lastUpdated || Date.now())
      };

      return this.calculatePortfolioTotals(portfolio);
    } catch (error) {
      console.error('Error loading portfolio:', error);
      return this.getDefaultPortfolio();
    }
  }

  clearPortfolio(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  exportPortfolio(): string {
    const portfolio = this.loadPortfolio();
    return JSON.stringify(portfolio, null, 2);
  }

  importPortfolio(jsonString: string): void {
    try {
      const portfolio = JSON.parse(jsonString);
      this.savePortfolio(portfolio);
    } catch (error) {
      console.error('Error importing portfolio:', error);
      throw new Error('Invalid portfolio data format');
    }
  }

  calculateHoldingValue(holding: Holding): number {
    return holding.quantity * holding.currentPrice;
  }

  calculateHoldingPnL(holding: Holding): number {
    const currentValue = this.calculateHoldingValue(holding);
    const costBasis = holding.quantity * holding.avgBuyPrice;
    return currentValue - costBasis;
  }

  calculateHoldingPnLPercentage(holding: Holding): number {
    const costBasis = holding.quantity * holding.avgBuyPrice;
    if (costBasis === 0) return 0;
    const pnl = this.calculateHoldingPnL(holding);
    return (pnl / costBasis) * 100;
  }

  calculatePortfolioTotals(portfolio: Portfolio): Portfolio {
    const allHoldings = [...portfolio.stocks, ...portfolio.crypto];
    
    portfolio.totalValue = allHoldings.reduce((total, holding) => {
      return total + this.calculateHoldingValue(holding);
    }, 0);

    portfolio.totalPnL = allHoldings.reduce((total, holding) => {
      return total + this.calculateHoldingPnL(holding);
    }, 0);

    const totalCostBasis = allHoldings.reduce((total, holding) => {
      return total + (holding.quantity * holding.avgBuyPrice);
    }, 0);

    if (totalCostBasis > 0) {
      portfolio.totalPnLPercentage = (portfolio.totalPnL / totalCostBasis) * 100;
    } else {
      portfolio.totalPnLPercentage = 0;
    }

    portfolio.lastUpdated = new Date();
    return portfolio;
  }

  addHolding(portfolio: Portfolio, holding: Holding): Portfolio {
    if (holding.type === 'stock') {
      portfolio.stocks.push(holding);
    } else {
      portfolio.crypto.push(holding);
    }
    return this.calculatePortfolioTotals(portfolio);
  }

  updateHolding(portfolio: Portfolio, holdingId: string, updates: Partial<Holding>): Portfolio {
    const allHoldings = [...portfolio.stocks, ...portfolio.crypto];
    const holding = allHoldings.find(h => h.id === holdingId);
    
    if (holding) {
      Object.assign(holding, updates);
    }
    
    return this.calculatePortfolioTotals(portfolio);
  }

  removeHolding(portfolio: Portfolio, holdingId: string): Portfolio {
    portfolio.stocks = portfolio.stocks.filter(h => h.id !== holdingId);
    portfolio.crypto = portfolio.crypto.filter(h => h.id !== holdingId);
    return this.calculatePortfolioTotals(portfolio);
  }

  private getDefaultPortfolio(): Portfolio {
    return {
      stocks: [],
      crypto: [],
      totalValue: 0,
      totalPnL: 0,
      totalPnLPercentage: 0,
      lastUpdated: new Date()
    };
  }
}