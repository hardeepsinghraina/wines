'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { WineImage } from '@/components/ui/PlaceholderImage';
import { api } from '@/lib/api';
import type { Wine } from '@/types/wine';

interface SaleProduct extends Wine {
  originalPrice: number;
  salePrice: number;
  discountPercentage: number;
  saleEndDate?: string;
}

export function SalePage() {
  const [products, setProducts] = useState<SaleProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'discount' | 'price' | 'name'>('discount');

  useEffect(() => {
    fetchSaleProducts();
  }, [sortBy]);

  const fetchSaleProducts = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API call
      const mockSaleProducts: SaleProduct[] = [
        {
          id: 'sale-1',
          name: 'Château Margaux 2015',
          description: 'Exceptional Bordeaux from a legendary vintage',
          price: 450,
          currency: 'USD',
          stock: 12,
          originalPrice: 600,
          salePrice: 450,
          discountPercentage: 25,
          imageUrl: '/images/wines/margaux-2015.jpg',
          region: 'Bordeaux, France',
          vintage: 2015,
          producer: 'Château Margaux',
          isActive: true,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          saleEndDate: '2024-12-31'
        },
        {
          id: 'sale-2',
          name: 'Dom Pérignon 2012',
          description: 'Prestigious Champagne with exceptional aging potential',
          price: 180,
          currency: 'USD',
          stock: 8,
          originalPrice: 220,
          salePrice: 180,
          discountPercentage: 18,
          imageUrl: '/images/wines/dom-perignon-2012.jpg',
          region: 'Champagne, France',
          vintage: 2012,
          producer: 'Dom Pérignon',
          isActive: true,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sale-3',
          name: 'Opus One 2018',
          description: 'Napa Valley\'s most celebrated collaboration',
          price: 320,
          currency: 'USD',
          stock: 5,
          originalPrice: 400,
          salePrice: 320,
          discountPercentage: 20,
          imageUrl: '/images/wines/opus-one-2018.jpg',
          region: 'Napa Valley, USA',
          vintage: 2018,
          producer: 'Opus One',
          isActive: true,
          isFeatured: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      // Sort products based on selected criteria
      const sortedProducts = [...mockSaleProducts].sort((a, b) => {
        switch (sortBy) {
          case 'discount':
            return b.discountPercentage - a.discountPercentage;
          case 'price':
            return a.salePrice - b.salePrice;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });

      setProducts(sortedProducts);
    } catch (err) {
      setError('Failed to load sale products');
      console.error('Error fetching sale products:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeRemaining = (endDate: string) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Sale Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} days left`;
    return `${hours} hours left`;
  };

  if (loading) {
    return <LoadingState message="Loading sale items..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Sale & Clearance</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchSaleProducts} className="mt-4">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Sale & Clearance</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Exceptional wines at exceptional prices. Limited-time offers on premium selections 
          from our carefully curated collection.
        </p>
      </div>

      {/* Sale Banner */}
      <div className="mb-12">
        <Card className="p-8 bg-gradient-to-r from-red-600 to-pink-600 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🔥 Limited Time Offers</h2>
            <p className="text-lg mb-6 opacity-90">
              Save up to 30% on premium wines. These exceptional bottles won't last long at these prices.
            </p>
            <div className="flex justify-center gap-8">
              <div className="text-center">
                <div className="text-2xl font-bold">Up to 30%</div>
                <div className="text-sm opacity-80">Discount</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm opacity-80">Items on Sale</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">Limited</div>
                <div className="text-sm opacity-80">Quantities</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sort Options */}
      <div className="mb-8 flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Sale Items</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'discount' | 'price' | 'name')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="discount">Highest Discount</option>
            <option value="price">Lowest Price</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Sale Badge */}
                <div className="absolute top-4 left-4 z-10">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                    -{product.discountPercentage}%
                  </span>
                </div>

                {/* Timer Badge */}
                {product.saleEndDate && (
                  <div className="absolute top-4 right-4 z-10">
                    <span className="bg-orange-500 text-white px-2 py-1 rounded text-xs font-medium">
                      {calculateTimeRemaining(product.saleEndDate)}
                    </span>
                  </div>
                )}

                <div className="aspect-w-3 aspect-h-4 bg-gray-200">
                  <WineImage
                    src={product.imageUrl}
                    alt={product.name}
                    width={400}
                    height={300}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.region}</p>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-red-600">${product.salePrice}</span>
                        <span className="text-lg text-gray-400 line-through">${product.originalPrice}</span>
                      </div>
                      <div className="text-sm text-green-600 font-medium">
                        Save ${product.originalPrice - product.salePrice}
                      </div>
                    </div>
                  </div>

                  <Button className="w-full">
                    Add to Cart
                  </Button>
                </div>
              </Card>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🏷️</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No Sale Items Available</h3>
          <p className="text-gray-500 mb-4">
            Check back soon for new deals and special offers.
          </p>
          <Button onClick={() => window.location.href = '/products'}>
            Browse All Products
          </Button>
        </div>
      )}

      {/* Sale Terms */}
      <div className="mt-16">
        <Card className="p-8 bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4 text-center">Sale Terms & Conditions</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-gray-600">
            <div>
              <h3 className="font-semibold mb-2">Sale Information</h3>
              <ul className="space-y-1">
                <li>• Limited quantities available</li>
                <li>• Prices valid while supplies last</li>
                <li>• No additional discounts apply</li>
                <li>• Sale prices are final</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Shipping & Returns</h3>
              <ul className="space-y-1">
                <li>• Standard shipping rates apply</li>
                <li>• 30-day return policy</li>
                <li>• Original packaging required</li>
                <li>• Refunds processed within 5-7 days</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}