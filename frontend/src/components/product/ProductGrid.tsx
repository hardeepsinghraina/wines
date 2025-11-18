'use client'

import { useState, useEffect } from 'react'
import { ProductCard } from './ProductCard'
import { Wine } from '@/types/wine'
import { api } from '@/lib/api'

interface SearchParams {
  category?: string
  region?: string
  vintage?: string
  minPrice?: string
  maxPrice?: string
  search?: string
  page?: string
}

interface ProductGridProps {
  products?: Wine[]
  loading?: boolean
  limit?: number
  excludeId?: string
  category?: string
  searchParams?: SearchParams
  showPagination?: boolean
}

export function ProductGrid({ 
  products, 
  loading: externalLoading, 
  limit, 
  excludeId, 
  category, 
  searchParams,
  showPagination = false 
}: ProductGridProps) {
  const [wines, setWines] = useState<Wine[]>(products || [])
  const [loading, setLoading] = useState(externalLoading || false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    if (products) {
      setWines(products)
      return
    }

    const fetchWines = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams()
        if (searchParams?.category) params.append('category', searchParams.category)
        if (searchParams?.region) params.append('region', searchParams.region)
        if (searchParams?.vintage) params.append('vintage', searchParams.vintage)
        if (searchParams?.minPrice) params.append('minPrice', searchParams.minPrice)
        if (searchParams?.maxPrice) params.append('maxPrice', searchParams.maxPrice)
        if (searchParams?.search) params.append('search', searchParams.search)
        if (searchParams?.page) params.append('page', searchParams.page)
        if (category) params.append('category', category)
        if (limit) params.append('limit', limit.toString())

        const response = await api.get(`/api/products?${params.toString()}`) as any
        
        // Handle different response structures
        let winesData: Wine[] = []
        let paginationData = { totalPages: 1, currentPage: 1 }
        
        if (response.success && response.data) {
          // Backend returns { success: true, data: { wines: [...], totalPages, ... } }
          winesData = response.data.wines || response.data.products || []
          paginationData = {
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.page || response.data.currentPage || 1
          }
        } else if (response.data) {
          // Direct data response
          winesData = response.data.wines || response.data.products || response.data || []
          paginationData = {
            totalPages: response.data.totalPages || 1,
            currentPage: response.data.page || response.data.currentPage || 1
          }
        } else if (Array.isArray(response)) {
          // Direct array response
          winesData = response
        }
        
        console.log('ProductGrid: Fetched wines:', winesData.length)
        setWines(winesData)
        setTotalPages(paginationData.totalPages)
        setCurrentPage(paginationData.currentPage)
      } catch (error) {
        console.error('Failed to fetch wines:', error)
        setWines([])
      } finally {
        setLoading(false)
      }
    }

    fetchWines()
  }, [products, searchParams, category, limit])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 aspect-square rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  // Filter products based on props
  let filteredWines = wines
  if (excludeId) {
    filteredWines = filteredWines.filter(w => w.id !== excludeId)
  }
  if (limit && !showPagination) {
    filteredWines = filteredWines.slice(0, limit)
  }

  if (filteredWines.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No products found</p>
      </div>
    )
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredWines.map((wine) => (
          <ProductCard key={wine.id} wine={wine} />
        ))}
      </div>
      
      {showPagination && totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-4 py-2 rounded-md ${
                page === currentPage
                  ? 'bg-gold-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}