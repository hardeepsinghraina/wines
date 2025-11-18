'use client';

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

import React, { useState, useEffect } from 'react';
import { PrivateSale } from '../../types/private-sales';
import { PrivateSalesGrid } from '../../components/private-sales';
import { privateSalesApi } from '../../lib/private-sales-api';
import { Loading } from '../../components/ui/Loading';
import { Error } from '../../components/ui/Error';
import { useAuth } from '../../contexts/AuthContext';

// Separate client components for interactive elements
function LoginNotice() {
  return (
    <div className="bg-champagne-gold/10 border border-champagne-gold/20 rounded-lg p-6 mb-8">
      <div className="flex items-center">
        <svg className="w-6 h-6 text-champagne-gold mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <div>
          <h3 className="font-semibold text-charcoal-black">Login Required</h3>
          <p className="text-gray-600 text-sm">
            Please log in to check your eligibility and participate in private sales.
          </p>
        </div>
        <button
          onClick={() => window.location.href = '/login'}
          className="ml-auto px-4 py-2 bg-champagne-gold text-white rounded-lg hover:bg-champagne-gold/90 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="text-gray-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Private Sales Available</h3>
      <p className="text-gray-500 mb-4">
        There are currently no active private sales that match your eligibility.
      </p>
      <button
        onClick={() => window.location.href = '/wines'}
        className="px-6 py-3 bg-champagne-gold text-white rounded-lg hover:bg-champagne-gold/90 transition-colors"
      >
        Browse Regular Collection
      </button>
    </div>
  );
}

function CallToAction() {
  return (
    <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-charcoal-black mb-4">
        Increase Your Eligibility
      </h2>
      <p className="text-gray-600 mb-6">
        Build your purchase history and loyalty status to access more exclusive private sales.
      </p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => window.location.href = '/wines'}
          className="px-6 py-3 bg-champagne-gold text-white rounded-lg hover:bg-champagne-gold/90 transition-colors"
        >
          Shop Wines
        </button>
        <button
          onClick={() => window.location.href = '/account'}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          View Account Status
        </button>
      </div>
    </div>
  );
}

export default function PrivateSalesPage() {
  const { user } = useAuth();
  const [sales, setSales] = useState<PrivateSale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPrivateSales();
  }, []);

  const fetchPrivateSales = async () => {
    try {
      setLoading(true);
      const data = await privateSalesApi.getPrivateSales();
      setSales(data);
    } catch (err) {
      const errorMessage = (err as Error)?.message || 'Failed to load private sales';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-charcoal-black mb-4">Private Sales</h1>
            <p className="text-xl text-gray-600">Exclusive wine offerings for qualified collectors</p>
          </div>
          <Loading size="lg" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="container mx-auto px-4 py-8">
          <Error message={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-charcoal-black mb-4">
            Private Sales
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Exclusive access to rare and limited wines. These private sales are available only to 
            qualified collectors who meet specific eligibility criteria.
          </p>
        </div>

        {/* Authentication Notice */}
        {!user && <LoginNotice />}

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-burgundy/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Eligibility Check</h3>
            <p className="text-gray-600 text-sm">
              Each sale has specific requirements based on spending history, loyalty tier, and account status.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-sapphire-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sapphire-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Limited Time</h3>
            <p className="text-gray-600 text-sm">
              Private sales run for limited periods with restricted quantities available.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-champagne-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Exclusive Access</h3>
            <p className="text-gray-600 text-sm">
              Access rare wines not available through regular sales channels.
            </p>
          </div>
        </div>

        {/* Sales Grid */}
        <PrivateSalesGrid sales={sales} loading={loading} />

        {/* Empty State for Eligible Users */}
        {user && sales.length === 0 && <EmptyState />}

        {/* Call to Action */}
        {sales.length > 0 && <CallToAction />}
      </div>
    </div>
  );
}