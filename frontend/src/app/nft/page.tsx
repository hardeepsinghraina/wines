'use client';

import React, { useState, useEffect } from 'react';
import { NFTCollection } from '../../types/nft';
import { NFTCollectionGrid } from '../../components/nft';
import { nftApi } from '../../lib/nft-api';
import { Loading } from '../../components/ui/Loading';
import { Error } from '../../components/ui/Error';

// Separate client component for the call to action section
function CallToActionSection() {
  return (
    <div className="text-center mt-12 p-8 bg-white rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold text-charcoal-black mb-4">
        Start Your Wine NFT Collection
      </h2>
      <p className="text-gray-600 mb-6">
        Join the future of wine collecting with blockchain-verified authenticity and digital ownership.
      </p>
      <div className="flex justify-center gap-4">
        <button 
          className="px-6 py-3 bg-champagne-gold text-white rounded-lg hover:bg-champagne-gold/90 transition-colors"
          onClick={() => {
            // Scroll to collections or navigate
            const collectionsSection = document.querySelector('[data-collections-grid]');
            collectionsSection?.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          Browse Collections
        </button>
        <button 
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          onClick={() => {
            // Navigate to learn more page or show modal
            window.open('/about#nft-info', '_blank');
          }}
        >
          Learn More
        </button>
      </div>
    </div>
  );
}

export default function NFTPage() {
  const [collections, setCollections] = useState<NFTCollection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        const data = await nftApi.getCollections();
        setCollections(data);
      } catch (err) {
        const errorMessage = (err as Error)?.message || 'Failed to load NFT collections';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-charcoal-black mb-4">Wine NFT Collections</h1>
            <p className="text-xl text-gray-600">Discover exclusive digital wine certificates</p>
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
            Wine NFT Collections
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Own a piece of wine history with our exclusive NFT collections. Each NFT represents 
            a unique digital certificate of authenticity for premium wines, stored securely on the blockchain.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-champagne-gold/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-champagne-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Authenticity Guaranteed</h3>
            <p className="text-gray-600 text-sm">
              Each NFT comes with a verified digital certificate of authenticity and provenance.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-sapphire-blue/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-sapphire-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Blockchain Secured</h3>
            <p className="text-gray-600 text-sm">
              Powered by Ethereum, Polygon, and Solana for maximum security and accessibility.
            </p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-burgundy/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-charcoal-black mb-2">Investment Potential</h3>
            <p className="text-gray-600 text-sm">
              Rare wine NFTs with potential for appreciation and exclusive collector benefits.
            </p>
          </div>
        </div>

        {/* Collections Grid */}
        <div data-collections-grid>
          <NFTCollectionGrid collections={collections} loading={loading} />
        </div>

        {/* Call to Action */}
        {collections.length > 0 && (
          <CallToActionSection />
        )}
      </div>
    </div>
  );
}