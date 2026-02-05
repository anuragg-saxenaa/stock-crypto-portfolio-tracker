import React, { useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Holding } from '../types';
import { HoldingItem } from './HoldingItem';
import { AddHoldingModal } from './AddHoldingModal';
import { PortfolioService } from '../services/portfolioService';

interface HoldingsSectionProps {
  title: string;
  holdings: Holding[];
  type: 'stock' | 'crypto';
  onUpdateHolding: (id: string, updates: Partial<Holding>) => void;
  onRemoveHolding: (id: string) => void;
  onAddHolding: (holding: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => void;
  totalValue: number;
  totalPnL: number;
  totalPnLPercentage: number;
}

export const HoldingsSection: React.FC<HoldingsSectionProps> = ({
  title,
  holdings,
  type,
  onUpdateHolding,
  onRemoveHolding,
  onAddHolding,
  totalValue,
  totalPnL,
  totalPnLPercentage
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const portfolioService = PortfolioService.getInstance();

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
    if (value > 0) return <TrendingUp className="w-5 h-5" />;
    if (value < 0) return <TrendingDown className="w-5 h-5" />;
    return <Minus className="w-5 h-5" />;
  };

  const handleAddHolding = (holdingData: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => {
    const newHolding: Holding = {
      ...holdingData,
      id: Date.now().toString(),
      currentPrice: holdingData.avgBuyPrice, // Will be updated by price service
      lastUpdated: new Date()
    };
    
    onAddHolding(newHolding);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add {type === 'stock' ? 'Stock' : 'Crypto'}</span>
        </button>
      </div>

      {holdings.length > 0 && (
        <div className="bg-white rounded-lg p-4 mb-6 border border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-xl font-semibold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total P&L</p>
              <p className={`text-xl font-semibold ${getPnlColor(totalPnL)}`}>
                {formatCurrency(totalPnL)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">P&L %</p>
              <div className={`flex items-center space-x-1 ${getPnlColor(totalPnLPercentage)}`}>
                {getPnlIcon(totalPnLPercentage)}
                <p className="text-xl font-semibold">{formatPercentage(totalPnLPercentage)}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Holdings</p>
              <p className="text-xl font-semibold text-gray-900">{holdings.length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {holdings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <TrendingUp className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {type === 'stock' ? 'stocks' : 'cryptocurrencies'} yet
            </h3>
            <p className="text-gray-600 mb-4">
              Add your first {type === 'stock' ? 'stock' : 'crypto'} holding to start tracking your portfolio
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add {type === 'stock' ? 'Stock' : 'Crypto'}</span>
            </button>
          </div>
        ) : (
          holdings.map(holding => (
            <HoldingItem
              key={holding.id}
              holding={holding}
              onUpdate={onUpdateHolding}
              onRemove={onRemoveHolding}
            />
          ))
        )}
      </div>

      <AddHoldingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddHolding}
        type={type}
      />
    </div>
  );
};