'use client';

import React from 'react';
import Image from 'next/image';
import { NFTCollection } from '../../types/nft';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

interface NFTCollectionGridProps {
  collections: NFTCollection[];
  loading?: boolean;
}

export const NFTCollectionGrid: React.FC<NFTCollectionGridProps> = ({
  collections,
  loading = false
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <Card className="p-6">
              <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-4"></div>
              <div className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    );
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No NFT Collections Available</h3>
        <p className="text-gray-500">Check back later for exclusive Wine NFT collections.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map((collection) => (
        <NFTCollectionCard key={collection.id} collection={collection} />
      ))}
    </div>
  );
};

interface NFTCollectionCardProps {
  collection: NFTCollection;
}

const NFTCollectionCard: React.FC<NFTCollectionCardProps> = ({ collection }) => {
  const progressPercentage = (collection.mintedCount / collection.totalSupply) * 100;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="relative">
        <Image
          src={collection.coverImage}
          alt={collection.name}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-burgundy text-white">
            {collection.blockchain.toUpperCase()}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-semibold text-charcoal-black mb-2">
          {collection.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {collection.description}
        </p>
        
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">Minted</span>
            <span className="font-medium">
              {collection.mintedCount} / {collection.totalSupply}
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-champagne-gold h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Floor Price</span>
            <span className="font-semibold text-champagne-gold">
              {collection.floorPrice} ETH
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="w-full flex-1"
            onClick={() => window.location.href = `/nft/collections/${collection.id}`}
          >
            View Collection
          </Button>
          <Button 
            className="w-full flex-1"
            onClick={() => window.location.href = `/nft/collections/${collection.id}/purchase`}
          >
            Purchase NFT
          </Button>
        </div>
      </div>
    </Card>
  );
};