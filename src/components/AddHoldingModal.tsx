import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Holding } from '../types';

interface AddHoldingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (holding: Omit<Holding, 'id' | 'currentPrice' | 'lastUpdated'>) => void;
  type: 'stock' | 'crypto';
}

export const AddHoldingModal: React.FC<AddHoldingModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  type 
}) => {
  const [formData, setFormData] = useState({
    symbol: '',
    name: '',
    quantity: '',
    avgBuyPrice: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    const newErrors: Record<string, string> = {};
    
    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    const quantity = parseFloat(formData.quantity);
    if (isNaN(quantity) || quantity <= 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    
    const avgBuyPrice = parseFloat(formData.avgBuyPrice);
    if (isNaN(avgBuyPrice) || avgBuyPrice <= 0) {
      newErrors.avgBuyPrice = 'Average buy price must be a positive number';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create holding
    const newHolding = {
      symbol: formData.symbol.toUpperCase(),
      name: formData.name,
      quantity: quantity,
      avgBuyPrice: avgBuyPrice,
      type: type
    };

    onAdd(newHolding);
    
    // Reset form
    setFormData({
      symbol: '',
      name: '',
      quantity: '',
      avgBuyPrice: ''
    });
    setErrors({});
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Add {type === 'stock' ? 'Stock' : 'Crypto'} Holding
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Symbol *
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={formData.symbol}
                  onChange={(e) => handleInputChange('symbol', e.target.value)}
                  placeholder="e.g., AAPL, BTC"
                  className={`w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.symbol ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.symbol && <p className="text-red-500 text-sm mt-1">{errors.symbol}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder={`e.g., Apple Inc., Bitcoin`}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity *
              </label>
              <input
                type="number"
                step="0.000001"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="100"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.quantity && <p className="text-red-500 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Average Buy Price (USD) *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.avgBuyPrice}
                onChange={(e) => handleInputChange('avgBuyPrice', e.target.value)}
                placeholder="150.00"
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.avgBuyPrice ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.avgBuyPrice && <p className="text-red-500 text-sm mt-1">{errors.avgBuyPrice}</p>}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Holding</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};