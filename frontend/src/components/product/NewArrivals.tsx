'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProductCard } from '@/components/product/ProductCard';
import { LoadingState } from '@/components/ui/LoadingState';
import { api } from '@/lib/api';
import type { Wine } from '@/types/wine';

interface FilterOptions {
  region: string;
  priceRange: string;
  wineType: string;
}

export function NewArrivals() {
  const [products, setProducts] = useState<Wine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    region: 'all',
    priceRange: 'all',
    wineType: 'all'
  });

  useEffect(() => {
    fetchNewArrivals();
  }, [filters]);

  const fetchNewArrivals = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        sortBy: 'createdAt',
        sortOrder: 'desc',
        limit: '20',
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== 'all')
        )
      });
      
      const response = await api.get(`/products?${params}`) as { data: { products: Wine[] } };
      setProducts(response.data.products || []);
    } catch (err) {
      setError('Failed to load new arrivals');
      console.error('Error fetching new arrivals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (loading) {
    return <LoadingState message="Loading new arrivals..." />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <p className="text-red-600">{error}</p>
            <Button onClick={fetchNewArrivals} className="mt-4">
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">New Arrivals</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Discover the latest additions to our luxury wine collection. 
          Carefully curated premium wines from renowned producers worldwide.
        </p>
      </div>

      {/* Highlight Banner */}
      <div className="mb-12">
        <Card className="p-8 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Fresh Selections Weekly</h2>
            <p className="text-lg mb-6 opacity-90">
              We add new premium wines every week. Be the first to discover exceptional bottles 
              from emerging regions and established estates.
            </p>
            <div className="flex justify-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{products.length}</div>
                <div className="text-sm opacity-80">New This Month</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">15+</div>
                <div className="text-sm opacity-80">Countries</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">95+</div>
                <div className="text-sm opacity-80">Avg. Rating</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Filter New Arrivals</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wine Type
              </label>
              <select
                value={filters.wineType}
                onChange={(e) => handleFilterChange('wineType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="red">Red Wine</option>
                <option value="white">White Wine</option>
                <option value="sparkling">Sparkling</option>
                <option value="rosé">Rosé</option>
                <option value="dessert">Dessert Wine</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Region
              </label>
              <select
                value={filters.region}
                onChange={(e) => handleFilterChange('region', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Regions</option>
                <option value="france">France</option>
                <option value="italy">Italy</option>
                <option value="spain">Spain</option>
                <option value="usa">United States</option>
                <option value="australia">Australia</option>
                <option value="chile">Chile</option>
                <option value="argentina">Argentina</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price Range
              </label>
              <select
                value={filters.priceRange}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Prices</option>
                <option value="0-100">Under $100</option>
                <option value="100-250">$100 - $250</option>
                <option value="250-500">$250 - $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000+">$1,000+</option>
              </select>
            </div>
          </div>
        </Card>
      </div>

      {/* Products Grid */}
      {products.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  New
                </span>
              </div>
              <ProductCard wine={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🍷</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No New Arrivals Found</h3>
          <p className="text-gray-500 mb-4">
            Try adjusting your filters or check back soon for new additions.
          </p>
          <Button onClick={() => setFilters({ region: 'all', priceRange: 'all', wineType: 'all' })}>
            Clear Filters
          </Button>
        </div>
      )}

      {/* Newsletter Signup */}
      <div className="mt-16">
        <Card className="p-8 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Stay Updated</h2>
            <p className="text-gray-600 mb-6">
              Be the first to know about new arrivals, exclusive releases, and special offers.
            </p>
            <div className="max-w-md mx-auto flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}