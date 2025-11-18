// TypeScript types for premium product categories

export interface PremiumCategoryConfig {
  id: string
  name: string
  slug: string
  description: string
  parentId?: string
  level: number
  sortOrder: number
  isFeatured: boolean
  imageUrl: string
  iconUrl?: string
  metaTitle?: string
  metaDescription?: string
  priceRange: {
    min: number
    max: number
    currency: string
  }
  characteristics: string[]
}

export interface CategoryHierarchy {
  category: PremiumCategoryConfig
  children: CategoryHierarchy[]
  productCount: number
  url: string
}

export interface CategoryBreadcrumb {
  name: string
  slug: string
  url: string
  isActive?: boolean
}

export interface CategoryFilter {
  featured?: boolean
  level?: number
  parentId?: string
  hasProducts?: boolean
  priceRange?: {
    min?: number
    max?: number
  }
  characteristics?: string[]
}

export interface CategoryDisplayInfo extends PremiumCategoryConfig {
  productCount: number
  url: string
  breadcrumbs: CategoryBreadcrumb[]
  children?: CategoryDisplayInfo[]
  parent?: CategoryDisplayInfo
}

export interface CategoryMetadata {
  title: string
  description: string
  keywords: string[]
  openGraph: {
    title: string
    description: string
    image: string
    url: string
  }
  structuredData: {
    '@context': string
    '@type': string
    name: string
    description: string
    url: string
    image: string
    numberOfItems: number
    offers: {
      '@type': string
      priceCurrency: string
      lowPrice: number
      highPrice: number
      offerCount: number
    }
  }
}

export interface PremiumPriceCalculation {
  discountPercent: number
  discountAmount: number
  finalPrice: number
  savings: number
  isValidPremiumRange: boolean
}

export interface CategoryValidation {
  isValid: boolean
  errors: string[]
  warnings?: string[]
}

export interface CategorySuggestion {
  categoryId: string
  confidence: number
  reason: string
  category: PremiumCategoryConfig
}

// Enums for category types
export enum CategoryLevel {
  ROOT = 0,
  SUBCATEGORY = 1,
  SUB_SUBCATEGORY = 2
}

export enum CategoryType {
  WINE = 'WINE',
  SPIRITS = 'SPIRITS',
  CHAMPAGNE = 'CHAMPAGNE',
  GIFT_SET = 'GIFT_SET',
  COLLECTION = 'COLLECTION'
}

export enum PriceRange {
  BUDGET = 'BUDGET',
  PREMIUM = 'PREMIUM',
  LUXURY = 'LUXURY',
  ULTRA_LUXURY = 'ULTRA_LUXURY'
}

// Category management interfaces
export interface CreateCategoryRequest {
  name: string
  slug: string
  description?: string
  parentId?: string
  level: number
  sortOrder?: number
  isFeatured?: boolean
  imageUrl?: string
  iconUrl?: string
  metaTitle?: string
  metaDescription?: string
  characteristics?: string[]
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  id: string
  isActive?: boolean
}

export interface CategoryListResponse {
  categories: CategoryDisplayInfo[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface CategorySearchParams {
  query?: string
  level?: number
  parentId?: string
  featured?: boolean
  active?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'sortOrder' | 'productCount' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

// Category analytics interfaces
export interface CategoryAnalytics {
  categoryId: string
  productCount: number
  totalRevenue: number
  averageOrderValue: number
  conversionRate: number
  viewCount: number
  clickThroughRate: number
  topProducts: Array<{
    productId: string
    name: string
    revenue: number
    units: number
  }>
  performanceMetrics: {
    bounceRate: number
    timeOnPage: number
    pagesPerSession: number
  }
  period: {
    start: Date
    end: Date
  }
}

export interface CategoryPerformance {
  categoryId: string
  category: PremiumCategoryConfig
  metrics: {
    views: number
    clicks: number
    conversions: number
    revenue: number
    averageOrderValue: number
    conversionRate: number
    clickThroughRate: number
  }
  trends: {
    viewsChange: number
    clicksChange: number
    conversionsChange: number
    revenueChange: number
  }
  topPerformingProducts: Array<{
    productId: string
    name: string
    metrics: {
      views: number
      clicks: number
      conversions: number
      revenue: number
    }
  }>
}

// Category optimization interfaces
export interface CategoryOptimization {
  categoryId: string
  recommendations: Array<{
    type: 'SEO' | 'PRICING' | 'CONTENT' | 'STRUCTURE'
    priority: 'HIGH' | 'MEDIUM' | 'LOW'
    title: string
    description: string
    impact: string
    effort: string
    implementation: string[]
  }>
  seoScore: number
  contentScore: number
  performanceScore: number
  overallScore: number
}

export interface CategoryABTest {
  id: string
  categoryId: string
  name: string
  description: string
  variants: Array<{
    id: string
    name: string
    changes: Record<string, any>
    trafficAllocation: number
  }>
  metrics: Array<{
    name: string
    type: 'CONVERSION' | 'REVENUE' | 'ENGAGEMENT'
    goal: 'INCREASE' | 'DECREASE'
  }>
  status: 'DRAFT' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  startDate: Date
  endDate?: Date
  results?: {
    winner?: string
    confidence: number
    significance: number
    metrics: Record<string, any>
  }
}