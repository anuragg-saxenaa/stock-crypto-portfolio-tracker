import { useEffect, useState } from 'react';
import { PortfolioSummary } from './components/PortfolioSummary';
import { HoldingsSection } from './components/HoldingsSection';
import { usePortfolio } from './hooks/usePortfolio';
import { usePriceUpdates } from './hooks/usePriceUpdates';
import { useResponsive } from './hooks/useResponsive';
import { Holding } from './types';
import './index.css';

function App() {
  const { portfolio, addHolding, updateHolding, removeHolding, updatePrices, clearPortfolio, exportPortfolio, importPortfolio } = usePortfolio();
  const { isDesktop } = useResponsive();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get all symbols for price updates
  const allSymbols = [...portfolio.stocks, ...portfolio.crypto].map(h => h.symbol);
  
  const { priceUpdates, isLoading, error, refreshPrices } = usePriceUpdates({
    symbols: allSymbols,
    updateInterval: 5000, // Update every 5 seconds
    useWebSocket: false // Using polling for this demo
  });

  // Update portfolio prices when we receive updates
  useEffect(() => {
    if (priceUpdates.length > 0) {
      const updates = priceUpdates.map(update => ({
        symbol: update.symbol,
        price: update.price
      }));
      updatePrices(updates);
    }
  }, [priceUpdates, updatePrices]);

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    await refreshPrices();
    setIsRefreshing(false);
  };

  const handleAddHolding = (holdingData: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => {
    addHolding({
      ...holdingData,
      id: Date.now().toString(),
      currentPrice: holdingData.avgBuyPrice, // Will be updated by price service
      lastUpdated: new Date()
    });
  };

  const handleExportPortfolio = () => {
    const data = exportPortfolio();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportPortfolio = (data: string) => {
    try {
      importPortfolio(data);
      alert('Portfolio imported successfully!');
    } catch (error) {
      alert('Failed to import portfolio. Please check the file format.');
    }
  };

  // Add some demo data on first load if portfolio is empty
  useEffect(() => {
    if (portfolio.stocks.length === 0 && portfolio.crypto.length === 0) {
      // Add demo holdings
      const demoHoldings = [
        {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 10,
          avgBuyPrice: 180.00,
          type: 'stock' as const
        },
        {
          symbol: 'BTC',
          name: 'Bitcoin',
          quantity: 0.5,
          avgBuyPrice: 40000.00,
          type: 'crypto' as const
        }
      ];

      demoHoldings.forEach(holding => {
        handleAddHolding(holding);
      });
    }
  }, []); // Only run once on mount

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-6">
        <PortfolioSummary
          portfolio={portfolio}
          onRefreshPrices={handleRefreshPrices}
          onClearPortfolio={clearPortfolio}
          onExportPortfolio={handleExportPortfolio}
          onImportPortfolio={handleImportPortfolio}
          isRefreshing={isRefreshing}
        />

        <div className={`grid gap-6 ${isDesktop ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <HoldingsSection
            title="Stock Holdings"
            holdings={portfolio.stocks}
            type="stock"
            onUpdateHolding={updateHolding}
            onRemoveHolding={removeHolding}
            onAddHolding={handleAddHolding}
            totalValue={portfolio.stocks.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0)}
            totalPnL={portfolio.stocks.reduce((sum, h) => {
              const pnl = (h.quantity * h.currentPrice) - (h.quantity * h.avgBuyPrice);
              return sum + pnl;
            }, 0)}
            totalPnLPercentage={portfolio.stocks.reduce((sum, h) => {
              const costBasis = h.quantity * h.avgBuyPrice;
              const pnl = (h.quantity * h.currentPrice) - costBasis;
              const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              return sum + pnlPercentage;
            }, 0) / (portfolio.stocks.length || 1)}
          />

          <HoldingsSection
            title="Crypto Holdings"
            holdings={portfolio.crypto}
            type="crypto"
            onUpdateHolding={updateHolding}
            onRemoveHolding={removeHolding}
            onAddHolding={handleAddHolding}
            totalValue={portfolio.crypto.reduce((sum, h) => sum + (h.quantity * h.currentPrice), 0)}
            totalPnL={portfolio.crypto.reduce((sum, h) => {
              const pnl = (h.quantity * h.currentPrice) - (h.quantity * h.avgBuyPrice);
              return sum + pnl;
            }, 0)}
            totalPnLPercentage={portfolio.crypto.reduce((sum, h) => {
              const costBasis = h.quantity * h.avgBuyPrice;
              const pnl = (h.quantity * h.currentPrice) - costBasis;
              const pnlPercentage = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
              return sum + pnlPercentage;
            }, 0) / (portfolio.crypto.length || 1)}
          />
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            <p className="font-medium">Error updating prices:</p>
            <p>{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg">
            Updating prices...
          </div>
        )}
      </div>
    </div>
  );
}

export default App;