import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Holding } from '../types';
import { PortfolioService } from '../services/portfolioService';

interface HoldingItemProps {
  holding: Holding;
  onUpdate: (id: string, updates: Partial<Holding>) => void;
  onRemove: (id: string) => void;
}

export const HoldingItem: React.FC<HoldingItemProps> = ({ holding, onUpdate, onRemove }) => {
  const portfolioService = PortfolioService.getInstance();
  
  const currentValue = portfolioService.calculateHoldingValue(holding);
  const pnl = portfolioService.calculateHoldingPnL(holding);
  const pnlPercentage = portfolioService.calculateHoldingPnLPercentage(holding);
  const costBasis = holding.quantity * holding.avgBuyPrice;

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

  const getPnlIcon = (value: number) => {
    if (value > 0) return <TrendingUp className="w-4 h-4" />;
    if (value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-gray-900 text-lg">{holding.symbol}</h3>
          <p className="text-sm text-gray-600">{holding.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Qty: {holding.quantity}</p>
          <p className="text-sm text-gray-600">Avg: {formatCurrency(holding.avgBuyPrice)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(holding.currentPrice)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Value</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(currentValue)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className={`flex items-center space-x-1 ${getPnlColor(pnl)}`}>
          {getPnlIcon(pnl)}
          <span className="font-medium">P&L: {formatCurrency(pnl)}</span>
        </div>
        <div className={`flex items-center space-x-1 ${getPnlColor(pnlPercentage)}`}>
          {getPnlIcon(pnlPercentage)}
          <span className="font-medium">{formatPercentage(pnlPercentage)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>Cost Basis: {formatCurrency(costBasis)}</span>
        <span>Updated: {holding.lastUpdated.toLocaleTimeString()}</span>
      </div>

      <div className="flex justify-end space-x-2 mt-4">
        <button
          onClick={() => onRemove(holding.id)}
          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
        >
          Remove
        </button>
      </div>
    </div>
  );
};