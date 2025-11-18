'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
// Simple debounce implementation to avoid lodash dependency
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

interface SearchSuggestion {
  wines: Array<{
    id: string;
    name: string;
    producer: string;
    region: string;
  }>;
  producers: string[];
  regions: string[];
}

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  autoFocus?: boolean;
  initialValue?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className = '',
  placeholder = 'Search wines, regions, vintages...',
  onSearch,
  autoFocus = false,
  initialValue = ''
}) => {
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('wine-search-recent');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading recent searches:', error);
      }
    }
  }, []);

  // Debounced search suggestions
  const debouncedGetSuggestions = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSuggestions(null);
        setIsLoading(false);
        return;
      }

      try {
        const { getApiUrl } = await import('@/config/api');
        const response = await fetch(
          getApiUrl(`/api/products/search/suggestions?q=${encodeURIComponent(searchQuery)}&limit=8`)
        );
        
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data.data);
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.trim()) {
      setIsLoading(true);
      debouncedGetSuggestions(value);
    } else {
      setSuggestions(null);
      setIsLoading(false);
    }
  };

  // Handle search submission
  const handleSearch = (searchQuery?: string) => {
    const finalQuery = searchQuery || query;
    if (!finalQuery.trim()) return;

    // Save to recent searches
    const updatedRecent = [
      finalQuery,
      ...recentSearches.filter(item => item !== finalQuery)
    ].slice(0, 5);
    
    setRecentSearches(updatedRecent);
    localStorage.setItem('wine-search-recent', JSON.stringify(updatedRecent));

    // Hide suggestions
    setShowSuggestions(false);
    
    // Call onSearch callback or navigate
    if (onSearch) {
      onSearch(finalQuery);
    } else {
      router.push(`/products/search?q=${encodeURIComponent(finalQuery)}`);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    handleSearch(suggestion);
  };

  // Handle wine suggestion click
  const handleWineClick = (wineId: string) => {
    setShowSuggestions(false);
    router.push(`/products/${wineId}`);
  };

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setSuggestions(null);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Handle focus
  const handleFocus = () => {
    setShowSuggestions(true);
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasContent = suggestions?.wines.length || suggestions?.producers.length || suggestions?.regions.length;
  const showRecentSearches = !query.trim() && recentSearches.length > 0;

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-3 lg:py-4 text-base lg:text-lg border border-olive/30 rounded-xl bg-ivory/80 text-charcoal placeholder-olive focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-all duration-200 shadow-md focus:shadow-lg"
        />
        
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 lg:h-6 lg:w-6 text-olive" />
        
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 text-olive hover:text-burgundy transition-colors duration-200"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (showRecentSearches || hasContent || isLoading) && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-2 bg-ivory border border-olive/20 rounded-lg shadow-luxury z-50 max-h-96 overflow-y-auto"
        >
          {isLoading && (
            <div className="p-4 text-center text-olive">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-burgundy mx-auto"></div>
              <p className="mt-2 text-sm">Searching...</p>
            </div>
          )}

          {/* Recent Searches */}
          {showRecentSearches && (
            <div className="p-4 border-b border-olive/10">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="h-4 w-4 text-olive" />
                <span className="text-sm font-medium text-charcoal">Recent Searches</span>
              </div>
              <div className="space-y-1">
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="block w-full text-left px-3 py-2 text-sm text-charcoal hover:bg-champagne/10 rounded-md transition-colors duration-200"
                  >
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Wine Suggestions */}
          {suggestions?.wines && suggestions.wines.length > 0 && (
            <div className="p-4 border-b border-olive/10">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-olive" />
                <span className="text-sm font-medium text-charcoal">Wines</span>
              </div>
              <div className="space-y-1">
                {suggestions.wines.map((wine) => (
                  <button
                    key={wine.id}
                    onClick={() => handleWineClick(wine.id)}
                    className="block w-full text-left px-3 py-2 hover:bg-champagne/10 rounded-md transition-colors duration-200"
                  >
                    <div className="text-sm font-medium text-charcoal">{wine.name}</div>
                    <div className="text-xs text-olive">{wine.producer} • {wine.region}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Producer Suggestions */}
          {suggestions?.producers && suggestions.producers.length > 0 && (
            <div className="p-4 border-b border-olive/10">
              <div className="text-sm font-medium text-charcoal mb-2">Producers</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.producers.map((producer, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(producer)}
                    className="px-3 py-1 text-xs bg-champagne/20 text-charcoal rounded-full hover:bg-champagne/30 transition-colors duration-200"
                  >
                    {producer}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Region Suggestions */}
          {suggestions?.regions && suggestions.regions.length > 0 && (
            <div className="p-4">
              <div className="text-sm font-medium text-charcoal mb-2">Regions</div>
              <div className="flex flex-wrap gap-2">
                {suggestions.regions.map((region, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(region)}
                    className="px-3 py-1 text-xs bg-champagne/20 text-charcoal rounded-full hover:bg-champagne/30 transition-colors duration-200"
                  >
                    {region}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No Results */}
          {!isLoading && query.trim() && !hasContent && (
            <div className="p-4 text-center text-olive">
              <p className="text-sm">No suggestions found for &quot;{query}&quot;</p>
              <button
                onClick={() => handleSearch()}
                className="mt-2 text-sm text-burgundy hover:text-burgundy/80 font-medium"
              >
                Search anyway
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;