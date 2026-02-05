import React from 'react';
import { RefreshCw, Download, Upload, Trash2 } from 'lucide-react';
import { Portfolio } from '../types';

interface PortfolioSummaryProps {
  portfolio: Portfolio;
  onRefreshPrices: () => void;
  onClearPortfolio: () => void;
  onExportPortfolio: () => void;
  onImportPortfolio: (data: string) => void;
  isRefreshing?: boolean;
}

export const PortfolioSummary: React.FC<PortfolioSummaryProps> = ({
  portfolio,
  onRefreshPrices,
  onClearPortfolio,
  onExportPortfolio,
  onImportPortfolio,
  isRefreshing = false
}) => {

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (value: number): string => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const getPnlColor = (value: number): string => {
    if (value > 0) return 'text-profit';
    if (value < 0) return 'text-loss';
    return 'text-neutral';
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          onImportPortfolio(content);
        } catch (error) {
          alert('Invalid portfolio file format');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
      <div className="flex justify-between items-start mb-4">
        <h1 className="text-3xl font-bold">Portfolio Summary</h1>
        <div className="flex space-x-2">
          <button
            onClick={onRefreshPrices}
            disabled={isRefreshing}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 disabled:opacity-50 p-2 rounded-md transition-colors"
            title="Refresh Prices"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onExportPortfolio}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-md transition-colors"
            title="Export Portfolio"
          >
            <Download className="w-5 h-5" />
          </button>
          <label className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-md transition-colors cursor-pointer" title="Import Portfolio">
            <Upload className="w-5 h-5" />
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to clear all holdings?')) {
                onClearPortfolio();
              }
            }}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 p-2 rounded-md transition-colors"
            title="Clear Portfolio"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="text-center">
          <p className="text-blue-100 text-sm mb-1">Total Value</p>
          <p className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</p>
        </div>
        
        <div className="text-center">
          <p className="text-blue-100 text-sm mb-1">Total P&L</p>
          <p className={`text-2xl font-bold ${getPnlColor(portfolio.totalPnL)}`}>
            {formatCurrency(portfolio.totalPnL)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-blue-100 text-sm mb-1">Total P&L %</p>
          <p className={`text-2xl font-bold ${getPnlColor(portfolio.totalPnLPercentage)}`}>
            {formatPercentage(portfolio.totalPnLPercentage)}
          </p>
        </div>
        
        <div className="text-center">
          <p className="text-blue-100 text-sm mb-1">Total Holdings</p>
          <p className="text-2xl font-bold">
            {portfolio.stocks.length + portfolio.crypto.length}
          </p>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white border-opacity-20">
        <div className="flex justify-between text-sm text-blue-100">
          <span>Last Updated: {portfolio.lastUpdated.toLocaleString()}</span>
          <span>
            Stocks: {portfolio.stocks.length} | Crypto: {portfolio.crypto.length}
          </span>
        </div>
      </div>
    </div>
  );
};