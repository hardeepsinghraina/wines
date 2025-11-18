'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchBar } from '@/components/product/SearchBar';
import { ProductFilters } from '@/components/product/ProductFilters';
import { Loading } from '@/components/ui/Loading';
import { Error } from '@/components/ui/Error';
import { Button } from '@/components/ui/Button';
import { WineImage } from '@/components/ui/PlaceholderImage';
import { Grid, List, SlidersHorizontal, X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

// Separate component for error display to avoid SSR issues
function SearchErrorDisplay({ error }: { error: string }) {
  return (
    <Error 
      message={error}
      showRetry
      onRetry={() => window.location.reload()}
    />
  );
}

import type { Wine } from '@/types/wine';

interface SearchResult {
  wines: Wine[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface FilterValues {
  category?: string[];
  region?: string[];
  producer?: string[];
  vintage?: { min?: number; max?: number };
  price?: { min?: number; max?: number; currency?: string };
  availability?: boolean;
  featured?: boolean;
}

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest First' },
  { value: 'createdAt:asc', label: 'Oldest First' },
  { value: 'name:asc', label: 'Name A-Z' },
  { value: 'name:desc', label: 'Name Z-A' },
  { value: 'vintage:desc', label: 'Vintage (Newest)' },
  { value: 'vintage:asc', label: 'Vintage (Oldest)' },
  { value: 'price:asc', label: 'Price (Low to High)' },
  { value: 'price:desc', label: 'Price (High to Low)' }
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { addToCart, openCart } = useCart();
  
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterValues>({});
  const [sortBy, setSortBy] = useState('createdAt:desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page') || '1');

  // Load search results
  useEffect(() => {
    if (!query.trim()) return;

    const loadSearchResults = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          q: query,
          page: page.toString(),
          limit: '20',
          ...(sortBy && { 
            sortBy: sortBy.split(':')[0],
            sortOrder: sortBy.split(':')[1]
          })
        });

        // Add filters to params
        if (filters.category?.length) {
          filters.category.forEach(cat => params.append('category', cat));
        }
        if (filters.region?.length) {
          filters.region.forEach(region => params.append('region', region));
        }
        if (filters.producer?.length) {
          filters.producer.forEach(producer => params.append('producer', producer));
        }
        if (filters.vintage?.min) {
          params.append('vintageMin', filters.vintage.min.toString());
        }
        if (filters.vintage?.max) {
          params.append('vintageMax', filters.vintage.max.toString());
        }
        if (filters.price?.min) {
          params.append('priceMin', filters.price.min.toString());
        }
        if (filters.price?.max) {
          params.append('priceMax', filters.price.max.toString());
        }
        if (filters.price?.currency) {
          params.append('priceCurrency', filters.price.currency);
        }
        if (filters.availability) {
          params.append('availability', 'true');
        }
        if (filters.featured) {
          params.append('featured', 'true');
        }

        const { getApiUrl } = await import('@/config/api');
        const { normalizeProductResponse } = await import('@/lib/api-helpers');
        const response = await fetch(getApiUrl(`/api/products/search?${params}`));
        
        if (!response.ok) {
          throw 'Failed to search wines';
        }

        const data = await response.json();
        const wines = normalizeProductResponse(data);
        
        // Construct SearchResult object
        const searchResult: SearchResult = {
          wines,
          total: data.data?.total || data.total || wines.length,
          page: data.data?.page || data.page || 1,
          limit: data.data?.limit || data.limit || wines.length,
          totalPages: data.data?.totalPages || data.totalPages || 1,
          hasNext: data.data?.hasNext || data.hasNext || false,
          hasPrev: data.data?.hasPrev || data.hasPrev || false,
        };
        
        setSearchResults(searchResult);
      } catch (err) {
        setError(typeof err === 'string' ? err : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadSearchResults();
  }, [query, page, filters, sortBy]);

  // Handle search
  const handleSearch = (newQuery: string) => {
    const params = new URLSearchParams();
    params.set('q', newQuery);
    if (page > 1) params.set('page', '1');
    router.push(`/products/search?${params}`);
  };

  // Handle filters change
  const handleFiltersChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    // Reset to page 1 when filters change
    if (page > 1) {
      const params = new URLSearchParams(searchParams);
      params.set('page', '1');
      router.push(`/products/search?${params}`);
    }
  };

  // Clear filters
  const handleClearFilters = () => {
    setFilters({});
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', newPage.toString());
    router.push(`/products/search?${params}`);
  };

  // Get primary image
  const getPrimaryImage = (wine: Wine) => {
    const primaryImage = wine.images?.find(img => img.isPrimary);
    return primaryImage?.url;
  };

  // Get primary price
  const getPrimaryPrice = (wine: Wine) => {
    const eurPrice = wine.prices?.find(p => p.currency === 'EUR');
    const usdPrice = wine.prices?.find(p => p.currency === 'USD');
    return eurPrice || usdPrice || wine.prices?.[0];
  };

  // Get stock status
  const getStockStatus = (wine: Wine) => {
    const totalStock = wine.inventory?.reduce((sum, inv) => sum + inv.quantity, 0) || 0;
    return totalStock > 0;
  };

  // Handle add to cart
  const handleAddToCart = async (wineId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setAddingToCart(wineId);
      await addToCart(wineId, 1);
      openCart();
    } catch (error) {
      console.error('Failed to add to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  if (!query.trim()) {
    return (
      <div className="min-h-screen bg-ivory">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-charcoal mb-4">
              Search Wines
            </h1>
            <p className="text-olive mb-8">Enter a search term to find wines</p>
            <div className="max-w-md mx-auto">
              <SearchBar autoFocus />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-charcoal mb-4">
            Search Results
          </h1>
          <div className="max-w-2xl">
            <SearchBar 
              onSearch={handleSearch}
              className="w-full"
            />
          </div>
        </div>

        {/* Results Info and Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <p className="text-olive">
              {isLoading ? (
                'Searching...'
              ) : searchResults ? (
                `${searchResults.total} results for "${query}"`
              ) : (
                `Results for "${query}"`
              )}
            </p>
            
            {/* Mobile Filter Toggle */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-olive/30 rounded-lg bg-ivory text-charcoal focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="hidden sm:flex border border-olive/30 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-burgundy text-ivory'
                    : 'bg-ivory text-charcoal hover:bg-champagne/20'
                } transition-colors duration-200`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${
                  viewMode === 'list'
                    ? 'bg-burgundy text-ivory'
                    : 'bg-ivory text-charcoal hover:bg-champagne/20'
                } transition-colors duration-200`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filters Sidebar */}
          <div className={`${
            showFilters ? 'block' : 'hidden'
          } lg:block w-full lg:w-80 flex-shrink-0`}>
            {showFilters && (
              <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setShowFilters(false)} />
            )}
            <div className={`${
              showFilters ? 'fixed inset-y-0 left-0 z-50 w-80 bg-ivory shadow-xl' : ''
            } lg:relative lg:inset-auto lg:z-auto lg:w-auto lg:bg-transparent lg:shadow-none`}>
              {showFilters && (
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-olive/20">
                  <h3 className="font-display font-semibold text-lg text-charcoal">Filters</h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 text-charcoal hover:text-burgundy"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              )}
              <div className={showFilters ? 'p-4 lg:p-0' : ''}>
                <ProductFilters
                  filters={filters}
                  onFiltersChange={handleFiltersChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loading />
              </div>
            )}

            {error && (
              <SearchErrorDisplay error={error} />
            )}

            {searchResults && !isLoading && (
              <>
                {searchResults.wines.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="max-w-md mx-auto">
                      <p className="text-charcoal font-semibold text-lg mb-2">No wines found</p>
                      <p className="text-olive mb-6">
                        We couldn&apos;t find any wines matching &quot;{query}&quot;
                      </p>
                      
                      <div className="bg-champagne/10 border border-champagne/30 rounded-lg p-6 mb-6">
                        <p className="text-sm text-charcoal font-medium mb-3">Try these suggestions:</p>
                        <ul className="text-sm text-olive space-y-2 text-left">
                          <li>• Check your spelling</li>
                          <li>• Try more general keywords</li>
                          <li>• Search by region (e.g., &quot;Bordeaux&quot;, &quot;Burgundy&quot;)</li>
                          <li>• Search by wine type (e.g., &quot;Red Wine&quot;, &quot;Champagne&quot;)</li>
                          <li>• Browse our collections instead</li>
                        </ul>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button onClick={handleClearFilters} variant="outline">
                          Clear Filters
                        </Button>
                        <Button onClick={() => router.push('/products')}>
                          Browse All Wines
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Wine Grid/List */}
                    <div className={
                      viewMode === 'grid'
                        ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                        : 'space-y-6'
                    }>
                      {searchResults.wines.map((wine) => {
                        const primaryImage = getPrimaryImage(wine);
                        const primaryPrice = getPrimaryPrice(wine);
                        const inStock = getStockStatus(wine);

                        return (
                          <div
                            key={wine.id}
                            className={`bg-ivory border border-olive/20 rounded-lg overflow-hidden hover:shadow-luxury transition-shadow duration-300 ${
                              viewMode === 'list' ? 'flex' : ''
                            }`}
                          >
                            <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-[3/4]'}`}>
                              <WineImage
                                src={primaryImage}
                                alt={wine.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            
                            <div className="p-6 flex-1">
                              <div className="mb-2">
                                <h3 className="font-display font-semibold text-lg text-charcoal mb-1">
                                  {wine.name}
                                </h3>
                                <p className="text-olive text-sm">
                                  {wine.producer} • {wine.region} • {wine.vintage}
                                </p>
                              </div>
                              
                              {viewMode === 'list' && (
                                <p className="text-charcoal text-sm mb-4 line-clamp-2">
                                  {wine.description}
                                </p>
                              )}
                              
                              <div className="flex items-center justify-between gap-2">
                                <div>
                                  {primaryPrice && (
                                    <p className="font-semibold text-burgundy">
                                      {primaryPrice.currency === 'EUR' ? '€' : '$'}
                                      {primaryPrice.price.toFixed(2)}
                                    </p>
                                  )}
                                  <p className={`text-xs ${inStock ? 'text-green-600' : 'text-red-600'}`}>
                                    {inStock ? 'In Stock' : 'Out of Stock'}
                                  </p>
                                </div>
                                
                                <div className="flex items-center gap-2">
                                  {inStock && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={(e) => handleAddToCart(wine.id, e)}
                                      disabled={addingToCart === wine.id}
                                      className="flex items-center gap-1"
                                      title="Add to cart"
                                    >
                                      <ShoppingCart className="h-4 w-4" />
                                      {addingToCart === wine.id ? (
                                        <span className="animate-spin">⏳</span>
                                      ) : (
                                        <span className="hidden sm:inline">Add</span>
                                      )}
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    onClick={() => router.push(`/products/${wine.id}`)}
                                  >
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {searchResults.totalPages > 1 && (
                      <div className="flex justify-center mt-12">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            disabled={!searchResults.hasPrev}
                            onClick={() => handlePageChange(page - 1)}
                          >
                            Previous
                          </Button>
                          
                          <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, searchResults.totalPages) }, (_, i) => {
                              const pageNum = Math.max(1, Math.min(
                                searchResults.totalPages - 4,
                                page - 2
                              )) + i;
                              
                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => handlePageChange(pageNum)}
                                  className={`px-3 py-2 text-sm rounded-md transition-colors duration-200 ${
                                    pageNum === page
                                      ? 'bg-burgundy text-ivory'
                                      : 'text-charcoal hover:bg-champagne/20'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            })}
                          </div>
                          
                          <Button
                            variant="outline"
                            disabled={!searchResults.hasNext}
                            onClick={() => handlePageChange(page + 1)}
                          >
                            Next
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Disable SSR for this page to avoid prerendering issues
export const dynamic = 'force-dynamic'

export default function SearchPage() {
  return (
    <Suspense fallback={<Loading />}>
      <SearchPageContent />
    </Suspense>
  );
}