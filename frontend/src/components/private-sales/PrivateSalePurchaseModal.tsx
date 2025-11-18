'use client';

import React, { useState } from 'react';
import { PrivateSale, PrivateSalePurchase } from '../../types/private-sales';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { privateSalesApi } from '../../lib/private-sales-api';

interface PrivateSalePurchaseModalProps {
  sale: PrivateSale;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (purchase: PrivateSalePurchase) => void;
}

export const PrivateSalePurchaseModal: React.FC<PrivateSalePurchaseModalProps> = ({
  sale,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [purchase, setPurchase] = useState<PrivateSalePurchase | null>(null);

  const maxAvailable = sale.maxQuantity - sale.soldQuantity;
  const totalPrice = quantity * sale.price;

  const handlePurchase = async () => {
    try {
      setLoading(true);
      setError(null);

      const purchaseResult = await privateSalesApi.purchaseFromPrivateSale(sale.id, quantity);
      setPurchase(purchaseResult);
      setSuccess(true);
      onSuccess?.(purchaseResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setQuantity(1);
    setError(null);
    setSuccess(false);
    setPurchase(null);
    onClose();
  };

  if (success && purchase) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="Purchase Successful">
        <div className="text-center space-y-4">
          <div className="text-green-500 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h3 className="text-lg font-semibold text-green-600">Purchase Confirmed!</h3>
          
          <div className="bg-gray-50 p-4 rounded-lg text-left">
            <h4 className="font-medium text-charcoal-black mb-2">Purchase Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sale:</span>
                <span className="font-medium">{sale.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Quantity:</span>
                <span className="font-medium">{purchase.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Unit Price:</span>
                <span className="font-medium">${purchase.unitPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${purchase.totalPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-medium capitalize">{purchase.status}</span>
              </div>
            </div>
          </div>
          
          <p className="text-gray-600 text-sm">
            You will receive a confirmation email shortly. The wine will be processed and shipped according to your preferences.
          </p>
          
          <Button onClick={handleClose} className="w-full">
            Continue Shopping
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Purchase from Private Sale">
      <div className="space-y-6">
        {/* Sale Info */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-charcoal-black mb-2">{sale.title}</h3>
          <p className="text-gray-600 text-sm mb-3">{sale.description}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Price per bottle:</span>
            <span className="font-semibold text-champagne-gold">${sale.price.toLocaleString()}</span>
          </div>
        </div>

        {/* Quantity Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity
          </label>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Math.min(maxAvailable, parseInt(e.target.value) || 1)))}
              min={1}
              max={maxAvailable}
              className="w-20 text-center border border-gray-300 rounded-lg py-2 focus:ring-2 focus:ring-champagne-gold focus:border-transparent"
            />
            <button
              onClick={() => setQuantity(Math.min(maxAvailable, quantity + 1))}
              disabled={quantity >= maxAvailable}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              +
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Maximum available: {maxAvailable} bottles
          </p>
        </div>

        {/* Price Summary */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Unit Price:</span>
              <span>${sale.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Quantity:</span>
              <span>{quantity}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg">
              <span>Total:</span>
              <span className="text-champagne-gold">${totalPrice.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={loading || quantity <= 0 || quantity > maxAvailable}
            className="flex-1"
          >
            {loading ? <Loading size="sm" /> : `Purchase for $${totalPrice.toLocaleString()}`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};