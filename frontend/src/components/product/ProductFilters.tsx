'use client';

import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';

interface FilterOptions {
  regions: Array<{ name: string; count: number }>;
  producers: Array<{ name: string; count: number }>;
  vintages: { min: number; max: number };
  priceRanges: { currency: string; min: number; max: number }[];
  categories: Array<{ name: string; count: number }>;
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

interface ProductFiltersProps {
  filters?: FilterValues;
  onFiltersChange?: (filters: FilterValues) => void;
  onClearFilters?: () => void;
  className?: string;
  searchParams?: {
    category?: string;
    region?: string;
    vintage?: string;
    minPrice?: string;
    maxPrice?: string;
    search?: string;
    page?: string;
  };
}

const CURRENCIES = [
  { id: 'EUR', name: 'EUR (€)' },
  { id: 'USD', name: 'USD ($)' },
  { id: 'BTC', name: 'Bitcoin' },
  { id: 'ETH', name: 'Ethereum' },
  { id: 'USDC', name: 'USDC' }
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters = {},
  onFiltersChange = () => {},
  onClearFilters = () => {},
  className = '',
  searchParams = {}
}) => {
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['category', 'price', 'availability'])
  );

  // Load filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const { getApiUrl } = await import('@/config/api');
        const response = await fetch(getApiUrl('/api/products/filters'));
        if (response.ok) {
          const data = await response.json();
          setFilterOptions(data.data);
        }
      } catch (error) {
        console.error('Error loading filter options:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Toggle section expansion
  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Handle category change
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    const currentCategories = filters.category || [];
    const newCategories = checked
      ? [...currentCategories, categoryId]
      : currentCategories.filter(c => c !== categoryId);
    
    onFiltersChange({
      ...filters,
      category: newCategories.length > 0 ? newCategories : undefined
    });
  };

  // Handle region change
  const handleRegionChange = (region: string, checked: boolean) => {
    const currentRegions = filters.region || [];
    const newRegions = checked
      ? [...currentRegions, region]
      : currentRegions.filter(r => r !== region);
    
    onFiltersChange({
      ...filters,
      region: newRegions.length > 0 ? newRegions : undefined
    });
  };

  // Handle producer change
  const handleProducerChange = (producer: string, checked: boolean) => {
    const currentProducers = filters.producer || [];
    const newProducers = checked
      ? [...currentProducers, producer]
      : currentProducers.filter(p => p !== producer);
    
    onFiltersChange({
      ...filters,
      producer: newProducers.length > 0 ? newProducers : undefined
    });
  };

  // Handle vintage change
  const handleVintageChange = (type: 'min' | 'max', value: string) => {
    const numValue = value ? parseInt(value) : undefined;
    onFiltersChange({
      ...filters,
      vintage: {
        ...filters.vintage,
        [type]: numValue
      }
    });
  };

  // Handle price change
  const handlePriceChange = (type: 'min' | 'max' | 'currency', value: string) => {
    if (type === 'currency') {
      onFiltersChange({
        ...filters,
        price: {
          ...filters.price,
          currency: value || undefined
        }
      });
    } else {
      const numValue = value ? parseFloat(value) : undefined;
      onFiltersChange({
        ...filters,
        price: {
          ...filters.price,
          [type]: numValue
        }
      });
    }
  };

  // Handle boolean filter change
  const handleBooleanChange = (key: 'availability' | 'featured', checked: boolean) => {
    onFiltersChange({
      ...filters,
      [key]: checked || undefined
    });
  };

  // Check if filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== null && 
    (Array.isArray(value) ? value.length > 0 : true)
  );

  if (isLoading) {
    return (
      <div className={`bg-ivory border border-olive/20 rounded-lg p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-olive/20 rounded w-1/3"></div>
          <div className="space-y-2">
            <div className="h-4 bg-olive/20 rounded"></div>
            <div className="h-4 bg-olive/20 rounded w-3/4"></div>
            <div className="h-4 bg-olive/20 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const FilterSection: React.FC<{
    title: string;
    id: string;
    children: React.ReactNode;
  }> = ({ title, id, children }) => {
    const isExpanded = expandedSections.has(id);
    
    return (
      <div className="border-b border-olive/10 last:border-b-0">
        <button
          onClick={() => toggleSection(id)}
          className="w-full flex items-center justify-between py-4 text-left hover:text-burgundy transition-colors duration-200"
        >
          <span className="font-medium text-charcoal">{title}</span>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-olive" />
          ) : (
            <ChevronDown className="h-4 w-4 text-olive" />
          )}
        </button>
        
        {isExpanded && (
          <div className="pb-4 space-y-3">
            {children}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-ivory border border-olive/20 rounded-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-olive/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-burgundy" />
            <h3 className="font-display font-semibold text-lg text-charcoal">Filters</h3>
          </div>
          
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="text-burgundy hover:text-burgundy/80"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="p-6 space-y-0">
        {/* Categories */}
        {filterOptions?.categories && filterOptions.categories.length > 0 && (
          <FilterSection title="Wine Categories" id="category">
            <div className="space-y-2">
              {filterOptions.categories.map((category) => (
                <label key={category.name} className="flex items-center justify-between space-x-3 cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={filters.category?.includes(category.name) || false}
                      onChange={(e) => handleCategoryChange(category.name, e.target.checked)}
                      className="rounded border-olive/30 text-burgundy focus:ring-burgundy focus:ring-offset-0"
                    />
                    <span className="text-sm text-charcoal group-hover:text-burgundy transition-colors">
                      {category.name}
                    </span>
                  </div>
                  <span className="text-xs text-olive/60">({category.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Regions */}
        {filterOptions?.regions && filterOptions.regions.length > 0 && (
          <FilterSection title="Regions" id="region">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.regions.slice(0, 20).map((region) => (
                <label key={region.name} className="flex items-center justify-between space-x-3 cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={filters.region?.includes(region.name) || false}
                      onChange={(e) => handleRegionChange(region.name, e.target.checked)}
                      className="rounded border-olive/30 text-burgundy focus:ring-burgundy focus:ring-offset-0"
                    />
                    <span className="text-sm text-charcoal group-hover:text-burgundy transition-colors">
                      {region.name}
                    </span>
                  </div>
                  <span className="text-xs text-olive/60">({region.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Producers */}
        {filterOptions?.producers && filterOptions.producers.length > 0 && (
          <FilterSection title="Producers" id="producer">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {filterOptions.producers.slice(0, 20).map((producer) => (
                <label key={producer.name} className="flex items-center justify-between space-x-3 cursor-pointer group">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={filters.producer?.includes(producer.name) || false}
                      onChange={(e) => handleProducerChange(producer.name, e.target.checked)}
                      className="rounded border-olive/30 text-burgundy focus:ring-burgundy focus:ring-offset-0"
                    />
                    <span className="text-sm text-charcoal group-hover:text-burgundy transition-colors">
                      {producer.name}
                    </span>
                  </div>
                  <span className="text-xs text-olive/60">({producer.count})</span>
                </label>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Vintage Range */}
        {filterOptions?.vintages && (
          <FilterSection title="Vintage" id="vintage">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-olive mb-1">From</label>
                  <input
                    type="number"
                    min={filterOptions.vintages.min}
                    max={filterOptions.vintages.max}
                    value={filters.vintage?.min || ''}
                    onChange={(e) => handleVintageChange('min', e.target.value)}
                    placeholder={filterOptions.vintages.min.toString()}
                    className="w-full px-3 py-2 text-sm border border-olive/30 rounded-md bg-ivory focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-olive mb-1">To</label>
                  <input
                    type="number"
                    min={filterOptions.vintages.min}
                    max={filterOptions.vintages.max}
                    value={filters.vintage?.max || ''}
                    onChange={(e) => handleVintageChange('max', e.target.value)}
                    placeholder={filterOptions.vintages.max.toString()}
                    className="w-full px-3 py-2 text-sm border border-olive/30 rounded-md bg-ivory focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </FilterSection>
        )}

        {/* Price Range */}
        <FilterSection title="Price" id="price">
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-olive mb-1">Currency</label>
              <select
                value={filters.price?.currency || ''}
                onChange={(e) => handlePriceChange('currency', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-olive/30 rounded-md bg-ivory focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
              >
                <option value="">Select currency</option>
                {CURRENCIES.map((currency) => (
                  <option key={currency.id} value={currency.id}>
                    {currency.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-olive mb-1">Min Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.price?.min || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 text-sm border border-olive/30 rounded-md bg-ivory focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-olive mb-1">Max Price</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={filters.price?.max || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 text-sm border border-olive/30 rounded-md bg-ivory focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Availability & Features */}
        <FilterSection title="Availability & Features" id="availability">
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.availability || false}
                onChange={(e) => handleBooleanChange('availability', e.target.checked)}
                className="rounded border-olive/30 text-burgundy focus:ring-burgundy focus:ring-offset-0"
              />
              <span className="text-sm text-charcoal">In Stock Only</span>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured || false}
                onChange={(e) => handleBooleanChange('featured', e.target.checked)}
                className="rounded border-olive/30 text-burgundy focus:ring-burgundy focus:ring-offset-0"
              />
              <span className="text-sm text-charcoal">Featured Wines</span>
            </label>
          </div>
        </FilterSection>
      </div>
    </div>
  );
};

export default ProductFilters;