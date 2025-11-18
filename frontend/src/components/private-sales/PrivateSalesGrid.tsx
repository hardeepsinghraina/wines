'use client';

import React, { useState } from 'react';
import { PrivateSale } from '../../types/private-sales';
import { PrivateSaleCard } from './PrivateSaleCard';
import { PrivateSalePurchaseModal } from './PrivateSalePurchaseModal';

interface PrivateSalesGridProps {
  sales: PrivateSale[];
  loading?: boolean;
}

export const PrivateSalesGrid: React.FC<PrivateSalesGridProps> = ({
  sales,
  loading = false
}) => {
  const [selectedSale, setSelectedSale] = useState<PrivateSale | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handlePurchase = (sale: PrivateSale) => {
    setSelectedSale(sale);
    setShowPurchaseModal(true);
  };

  const handlePurchaseComplete = () => {
    setShowPurchaseModal(false);
    setSelectedSale(null);
    // Optionally refresh the sales list
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="h-2 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
                <div className="h-10 bg-gray-200 rounded flex-1"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sales.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Private Sales Available</h3>
        <p className="text-gray-500">Check back later for exclusive wine offerings.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sales.map((sale) => (
          <PrivateSaleCard
            key={sale.id}
            sale={sale}
            onPurchase={handlePurchase}
          />
        ))}
      </div>

      {/* Purchase Modal */}
      {selectedSale && (
        <PrivateSalePurchaseModal
          sale={selectedSale}
          isOpen={showPurchaseModal}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseComplete}
        />
      )}
    </>
  );
};