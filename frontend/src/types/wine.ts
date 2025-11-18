export interface Wine {
  id: string
  name: string
  description: string
  region: string
  vintage: number
  price: number
  currency: string
  stock: number
  isActive: boolean
  isFeatured: boolean
  imageUrl?: string
  createdAt: Date | string
  updatedAt: Date | string
  
  // Additional properties expected by components
  producer?: string
  category?: string
  alcoholContent?: number
  bottleSize?: string
  tastingNotes?: string
  isNftAvailable?: boolean
  
  // Complex nested properties
  images?: Array<{
    id: string
    url: string
    altText?: string
    isPrimary: boolean
  }>
  
  prices?: Array<{
    id: string
    currency: string
    price: number
  }>
  
  inventory?: Array<{
    id: string
    quantity: number
    reservedQty: number
  }>
  
  reviews?: Array<{
    id: string
    rating: number
    comment?: string
  }>
  
  specification?: {
    grapeVariety: string
    alcoholContent?: number
    servingTemp?: string
    tastingNotes?: string
    foodPairing?: string
  }
  
  specifications?: {
    grapeVariety: string
    alcoholContent?: number
    servingTemp?: string
    tastingNotes?: string
    foodPairing?: string
  }
}

export interface WineFilters {
  category?: string[]
  region?: string[]
  vintage?: {
    min?: number
    max?: number
  }
  price?: {
    min?: number
    max?: number
    currency?: string
  }
  search?: string
  featured?: boolean
}

export interface WineSearchParams extends WineFilters {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface WineListResponse {
  wines: Wine[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNextPage: boolean
  hasPrevPage: boolean
}