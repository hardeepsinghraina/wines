import { adminApi } from '@/lib/admin-api'

import { API_CONFIG } from '@/config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

interface ProductQueryParams {
  page?: number
  limit?: number
  search?: string
  category?: string
  isActive?: boolean
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

interface Product {
  id: string
  name: string
  producer: string
  region: string
  vintage: number
  category: string
  description: string
  tastingNotes?: string
  alcoholContent: number
  bottleSize: string
  sku: string
  isActive: boolean
  isFeatured: boolean
  isNftAvailable: boolean
  createdAt: string
  updatedAt: string
  prices: Array<{
    id: string
    currency: string
    price: number
    isActive: boolean
  }>
  inventory: Array<{
    id: string
    quantity: number
    reservedQty: number
    location: string
    lastRestocked?: string
  }>
  images: Array<{
    id: string
    url: string
    altText?: string
    isPrimary: boolean
    sortOrder: number
  }>
  specifications?: {
    grapeVariety: string[]
    servingTemp?: string
    agingPotential?: string
    foodPairing?: string
    awards: string[]
  }
  _count?: {
    reviews: number
    orderItems: number
    cartItems?: number
  }
}

interface CreateProductData {
  name: string
  producer: string
  region: string
  vintage: number
  category: string
  description: string
  tastingNotes?: string
  alcoholContent: number
  bottleSize?: string
  sku: string
  isActive?: boolean
  isFeatured?: boolean
  isNftAvailable?: boolean
  prices?: Array<{
    currency: string
    price: number
    isActive?: boolean
  }>
  inventory?: Array<{
    quantity: number
    reservedQty?: number
    location?: string
  }>
  images?: Array<{
    url: string
    altText?: string
  }>
  specifications?: {
    grapeVariety?: string[]
    servingTemp?: string
    agingPotential?: string
    foodPairing?: string
    awards?: string[]
  }
}

interface UpdateInventoryData {
  inventory: Array<{
    quantity: number
    reservedQty?: number
    location?: string
    lastRestocked?: string
  }>
}

interface BulkImportData {
  products: CreateProductData[]
}

interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class AdminProductApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = `${API_BASE_URL}/api/admin/products`
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    const token = adminApi.getAccessToken()
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    }

    const response = await fetch(url, config)
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `HTTP ${response.status}`)
    }

    const data = await response.json()
    return data.data || data
  }

  /**
   * Get all products with pagination and filtering
   */
  async getProducts(params: ProductQueryParams = {}): Promise<PaginatedResponse<Product>> {
    const searchParams = new URLSearchParams()
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    const endpoint = queryString ? `/?${queryString}` : '/'
    
    return this.request<PaginatedResponse<Product>>(endpoint)
  }

  /**
   * Get single product by ID
   */
  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/${id}`)
  }

  /**
   * Create new product
   */
  async createProduct(productData: CreateProductData): Promise<Product> {
    return this.request<Product>('/', {
      method: 'POST',
      body: JSON.stringify(productData),
    })
  }

  /**
   * Update existing product
   */
  async updateProduct(id: string, productData: Partial<CreateProductData>): Promise<Product> {
    return this.request<Product>(`/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    })
  }

  /**
   * Delete product
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}`, {
      method: 'DELETE',
    })
  }

  /**
   * Bulk import products
   */
  async bulkImportProducts(data: BulkImportData): Promise<{
    created: number
    updated: number
    errors: Array<{ product: any; error: string }>
  }> {
    return this.request('/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  /**
   * Bulk import products (simplified method)
   */
  async bulkImport(products: CreateProductData[]): Promise<{
    created: number
    updated: number
    errors: Array<{ product: any; error: string }>
  }> {
    return this.bulkImportProducts({ products })
  }

  /**
   * Export products
   */
  async exportProducts(format: 'csv' | 'json' = 'json'): Promise<Product[]> {
    return this.request<Product[]>(`/export?format=${format}`)
  }

  /**
   * Update product inventory
   */
  async updateInventory(id: string, data: UpdateInventoryData): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/${id}/inventory`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  /**
   * Get inventory summary
   */
  async getInventorySummary(): Promise<{
    summary: Array<{
      location: string
      _sum: {
        quantity: number
        reservedQty: number
      }
      _count: {
        wineId: number
      }
    }>
    lowStockProducts: Product[]
    totalLocations: number
  }> {
    return this.request('/inventory/summary')
  }
}

export const adminProductApi = new AdminProductApiClient()
export type { Product, CreateProductData, ProductQueryParams, UpdateInventoryData, BulkImportData }