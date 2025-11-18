'use client'

import React, { useState, useEffect } from 'react'
import { 
  Filter, 
  Search, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Star, 
  DollarSign, 
  Calendar, 
  MapPin, 
  Wine, 
  Award, 
  Crown, 
  Package,
  SlidersHorizontal,
  RotateCcw
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Wine as WineType, WineFilters } from '@/types/wine'

interface PremiumProductFiltersProps {
  filters: WineFilters
  onFiltersChange: (filters: WineFilters) => void
  onSearch: (query: string) => void
  totalResults?: number
  isLoading?: boolean
  className?: string
}

interface FilterSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  isExpanded: boolean
}

interface PriceRange {
  min: number
  max: number
  label: string
}

interface VintageRange {
  min: number
  max: number
  label: string
}

export function PremiumProductFilters({
  filters,
  onFiltersChange,
  onSearch,
  totalResults = 0,
  isLoading = false,
  className = ''
}: PremiumProductFiltersProps) {
  const [searchQuery, setSearchQuery] = useState(filters.search || '')
  const [expandedSections, setExpandedSections] = useState<string[]>(['search', 'price', 'region'])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Predefined filter options
  const regions = [
    'Bordeaux', 'Burgundy', 'Champagne', 'Rhône Valley', 'Loire Valley',
    'Alsace', 'Languedoc', 'Provence', 'Tuscany', 'Piedmont',
    'Napa Valley', 'Sonoma', 'Barossa Valley', 'Marlborough', 'Rioja'
  ]

  const priceRanges: PriceRange[] = [
    { min: 0, max: 100, label: 'Under $100' },
    { min: 100, max: 250, label: '$100 - $250' },
    { min: 250, max: 500, label: '$250 - $500' },
    { min: 500, max: 1000, label: '$500 - $1,000' },
    { min: 1000, max: 2500, label: '$1,000 - $2,500' },
    { min: 2500, max: 5000, label: '$2,500 - $5,000' },
    { min: 5000, max: Infinity, label: 'Over $5,000' }
  ]

  const vintageRanges: VintageRange[] = [
    { min: 2020, max: 2024, label: '2020-2024 (Recent)' },
    { min: 2015, max: 2019, label: '2015-2019 (Mature)' },
    { min: 2010, max: 2014, label: '2010-2014 (Aged)' },
    { min: 2000, max: 2009, label: '2000-2009 (Vintage)' },
    { min: 1990, max: 1999, label: '1990-1999 (Classic)' },
    { min: 1900, max: 1989, label: 'Pre-1990 (Rare)' }
  ]

  const categories = [
    'bordeaux', 'burgundy', 'champagne', 'rhone-valley', 
    'world-wines', 'specialty-collections'
  ]

  const filterSections: FilterSection[] = [
    { id: 'search', title: 'Search', icon: Search, isExpanded: true },
    { id: 'price', title: 'Price Range', icon: DollarSign, isExpanded: true },
    { id: 'region', title: 'Region', icon: MapPin, isExpanded: true },
    { id: 'vintage', title: 'Vintage', icon: Calendar, isExpanded: false },
    { id: 'category', title: 'Category', icon: Wine, isExpanded: false },
    { id: 'features', title: 'Premium Features', icon: Crown, isExpanded: false }
  ]

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (searchQuery !== filters.search) {
        onSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(delayedSearch)
  }, [searchQuery, filters.search, onSearch])

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const updateFilters = (newFilters: Partial<WineFilters>) => {
    onFiltersChange({ ...filters, ...newFilters })
  }

  const handlePriceRangeChange = (range: PriceRange) => {
    const newPriceFilter = {
      min: range.min,
      max: range.max === Infinity ? undefined : range.max,
      currency: 'USD'
    }
    updateFilters({ price: newPriceFilter })
  }

  const handleVintageRangeChange = (range: VintageRange) => {
    const newVintageFilter = {
      min: range.min,
      max: range.max
    }
    updateFilters({ vintage: newVintageFilter })
  }

  const handleRegionToggle = (region: string) => {
    const currentRegions = filters.region || []
    const newRegions = currentRegions.includes(region)
      ? currentRegions.filter(r => r !== region)
      : [...currentRegions, region]
    updateFilters({ region: newRegions })
  }

  const handleCategoryToggle = (category: string) => {
    const currentCategories = filters.category || []
    const newCategories = currentCategories.includes(category as any)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category as any]
    updateFilters({ category: newCategories })
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    onFiltersChange({})
  }

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.price) count++
    if (filters.region?.length) count++
    if (filters.vintage) count++
    if (filters.category?.length) count++
    if (filters.featured) count++
    return count
  }

  const formatCategoryName = (category: string) => {
    return category.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  return (
    <div className={`premium-product-filters ${className}`}>
      {/* Filter Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-burgundy" />
          <h2 className="text-xl font-semibold text-charcoal-black">
            Premium Wine Filters
          </h2>
          {getActiveFilterCount() > 0 && (
            <span className="bg-burgundy text-white px-2 py-1 rounded-full text-xs font-medium">
              {getActiveFilterCount()} active
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            {showAdvancedFilters ? 'Simple' : 'Advanced'}
          </Button>
          
          {getActiveFilterCount() > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="border-gray-300 text-gray-600 hover:bg-gray-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Results Summary */}
      <div className="mb-6 p-4 bg-gradient-to-r from-burgundy/5 to-burgundy/10 rounded-lg border border-burgundy/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-burgundy" />
            <span className="text-charcoal-black font-medium">
              {isLoading ? 'Searching...' : `${totalResults} premium wines found`}
            </span>
          </div>
          {totalResults > 0 && (
            <span className="text-sm text-muted-olive">
              Curated by our master sommelier
            </span>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {filterSections.map((section) => {
          const isExpanded = expandedSections.includes(section.id)
          
          return (
            <Card key={section.id} className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleSection(section.id)}
              >
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <section.icon className="w-4 h-4 text-burgundy" />
                    {section.title}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-gray-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  )}
                </CardTitle>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  {/* Search Section */}
                  {section.id === 'search' && (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search wines, producers, regions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                      />
                      {searchQuery && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSearchQuery('')}
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  )}

                  {/* Price Section */}
                  {section.id === 'price' && (
                    <div className="space-y-2">
                      {priceRanges.map((range) => {
                        const isSelected = filters.price?.min === range.min && 
                                         (filters.price?.max === range.max || 
                                          (range.max === Infinity && !filters.price?.max))
                        
                        return (
                          <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="priceRange"
                              checked={isSelected}
                              onChange={() => handlePriceRangeChange(range)}
                              className="text-burgundy focus:ring-burgundy"
                            />
                            <span className={`text-sm ${isSelected ? 'font-medium text-burgundy' : 'text-gray-700'}`}>
                              {range.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Region Section */}
                  {section.id === 'region' && (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {regions.map((region) => {
                        const isSelected = filters.region?.includes(region) || false
                        
                        return (
                          <label key={region} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRegionToggle(region)}
                              className="text-burgundy focus:ring-burgundy rounded"
                            />
                            <span className={`text-sm ${isSelected ? 'font-medium text-burgundy' : 'text-gray-700'}`}>
                              {region}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Vintage Section */}
                  {section.id === 'vintage' && (
                    <div className="space-y-2">
                      {vintageRanges.map((range) => {
                        const isSelected = filters.vintage?.min === range.min && filters.vintage?.max === range.max
                        
                        return (
                          <label key={range.label} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="vintageRange"
                              checked={isSelected}
                              onChange={() => handleVintageRangeChange(range)}
                              className="text-burgundy focus:ring-burgundy"
                            />
                            <span className={`text-sm ${isSelected ? 'font-medium text-burgundy' : 'text-gray-700'}`}>
                              {range.label}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Category Section */}
                  {section.id === 'category' && (
                    <div className="space-y-2">
                      {categories.map((category) => {
                        const isSelected = filters.category?.includes(category as any) || false
                        
                        return (
                          <label key={category} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleCategoryToggle(category)}
                              className="text-burgundy focus:ring-burgundy rounded"
                            />
                            <span className={`text-sm ${isSelected ? 'font-medium text-burgundy' : 'text-gray-700'}`}>
                              {formatCategoryName(category)}
                            </span>
                          </label>
                        )
                      })}
                    </div>
                  )}

                  {/* Premium Features Section */}
                  {section.id === 'features' && (
                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={filters.featured || false}
                          onChange={(e) => updateFilters({ featured: e.target.checked })}
                          className="text-burgundy focus:ring-burgundy rounded"
                        />
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500" />
                          <span className="text-sm text-gray-700">Featured Wines</span>
                        </div>
                      </label>

                      {showAdvancedFilters && (
                        <>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="text-burgundy focus:ring-burgundy rounded"
                            />
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-purple-500" />
                              <span className="text-sm text-gray-700">Award Winners</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="text-burgundy focus:ring-burgundy rounded"
                            />
                            <div className="flex items-center gap-2">
                              <Crown className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm text-gray-700">Limited Edition</span>
                            </div>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              className="text-burgundy focus:ring-burgundy rounded"
                            />
                            <div className="flex items-center gap-2">
                              <Package className="w-4 h-4 text-blue-500" />
                              <span className="text-sm text-gray-700">NFT Available</span>
                            </div>
                          </label>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>

      {/* Active Filters Summary */}
      {getActiveFilterCount() > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Active Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <div className="flex items-center gap-1 bg-burgundy/10 text-burgundy px-3 py-1 rounded-full text-sm">
                  <Search className="w-3 h-3" />
                  "{filters.search}"
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ search: undefined })}
                    className="p-0 h-auto ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {filters.price && (
                <div className="flex items-center gap-1 bg-burgundy/10 text-burgundy px-3 py-1 rounded-full text-sm">
                  <DollarSign className="w-3 h-3" />
                  ${filters.price.min} - {filters.price.max ? `$${filters.price.max}` : 'Max'}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ price: undefined })}
                    className="p-0 h-auto ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
              
              {filters.region?.map((region) => (
                <div key={region} className="flex items-center gap-1 bg-burgundy/10 text-burgundy px-3 py-1 rounded-full text-sm">
                  <MapPin className="w-3 h-3" />
                  {region}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegionToggle(region)}
                    className="p-0 h-auto ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
              
              {filters.vintage && (
                <div className="flex items-center gap-1 bg-burgundy/10 text-burgundy px-3 py-1 rounded-full text-sm">
                  <Calendar className="w-3 h-3" />
                  {filters.vintage.min} - {filters.vintage.max}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => updateFilters({ vintage: undefined })}
                    className="p-0 h-auto ml-1 hover:bg-transparent"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}