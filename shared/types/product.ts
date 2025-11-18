// Product-related TypeScript interfaces for the luxury wine e-commerce platform

export interface Wine {
  id: string
  name: string
  producer: string
  region: string
  appellation?: string
  vintage: number
  category: WineCategory
  categoryId?: string
  description: string
  tastingNotes?: string
  alcoholContent: number
  bottleSize: string
  sku: string
  
  // Premium pricing structure
  originalPrice: number
  currentPrice: number
  discountPercent?: number
  currency: string
  
  // Premium attributes
  terroir?: string
  winemaker?: string
  estate?: string
  classification?: string
  servingTemp?: string
  agingPotential?: string
  harvestDate?: Date
  bottlingDate?: Date
  releaseDate?: Date
  
  // Status and availability
  stock: number
  isActive: boolean
  isFeatured: boolean
  isLimitedEdition: boolean
  isNftAvailable: boolean
  isPreOrder: boolean
  availableFrom?: Date
  
  createdAt: Date
  updatedAt: Date
  
  // Relations
  productCategory?: ProductCategory
  prices: WinePrice[]
  inventory: WineInventory[]
  images: WineImage[]
  variants: WineVariant[]
  specifications?: WineSpecification
  reviews?: WineReview[]
  certifications?: ProductCertification[]
  awards?: ProductAward[]
  seo?: WineSEO
  nfts?: WineNFT[]
}

export interface WinePrice {
  id: string
  wineId: string
  currency: string
  
  // Enhanced pricing structure
  originalPrice: number
  currentPrice: number
  costPrice?: number
  
  // Discount management
  discountType?: string
  discountValue?: number
  discountStartDate?: Date
  discountEndDate?: Date
  
  // Pricing tiers
  tier: string
  minQuantity: number
  maxQuantity?: number
  
  // Status and metadata
  isActive: boolean
  isPromotion: boolean
  promotionCode?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface WineInventory {
  id: string
  wineId: string
  
  // Inventory quantities
  quantity: number
  reservedQty: number
  availableQty: number
  damagedQty: number
  
  // Location and storage
  location: string
  warehouse?: string
  zone?: string
  temperature?: number
  humidity?: number
  
  // Inventory management
  lowStockThreshold: number
  reorderPoint: number
  maxStockLevel?: number
  
  // Tracking dates
  lastRestocked?: Date
  lastSold?: Date
  lastInventoryCheck?: Date
  expiryDate?: Date
  
  // Batch and lot tracking
  batchNumber?: string
  lotNumber?: string
  supplierRef?: string
  
  // Cost tracking
  unitCost?: number
  totalValue?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface WineImage {
  id: string
  wineId: string
  
  // Image details
  url: string
  filename?: string
  altText?: string
  title?: string
  caption?: string
  
  // Image properties
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  
  // Image types and organization
  type: string
  isPrimary: boolean
  sortOrder: number
  
  // Image variants for responsive design
  thumbnailUrl?: string
  mediumUrl?: string
  largeUrl?: string
  
  // SEO and metadata
  seoScore?: number
  tags?: string[]
  
  // Status
  isActive: boolean
  isProcessed: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface WineSpecification {
  id: string
  wineId: string
  grapeVariety: string[]
  alcoholContent?: number
  servingTemp?: string
  tastingNotes?: string
  foodPairing?: string
  awards: string[] // Deprecated, use ProductAward
  
  // Enhanced premium specifications
  ph?: number
  residualSugar?: number
  tannins?: string
  acidity?: string
  body?: string
  finish?: string
  oakTreatment?: string
  malolacticFermentation?: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface WineReview {
  id: string
  wineId: string
  userId: string
  
  // Review content
  rating: number
  title?: string
  comment: string
  
  // Detailed ratings (optional)
  tasteRating?: number
  aromaRating?: number
  appearanceRating?: number
  valueRating?: number
  
  // Review metadata
  status: string
  isVerifiedPurchase: boolean
  purchaseDate?: Date
  
  // Community interaction
  helpfulVotes: number
  unhelpfulVotes: number
  reportCount: number
  responseCount: number
  
  // Moderation
  moderatorNotes?: string
  moderatedBy?: string
  moderatedAt?: Date
  
  // Review quality metrics
  qualityScore?: number
  sentimentScore?: number
  
  createdAt: Date
  updatedAt: Date
}

export interface WineNFT {
  id: string
  wineId: string
  tokenId: string
  contractAddress: string
  blockchain: string
  metadataUri: string
  ownerAddress?: string
  isForSale: boolean
  price?: number
  createdAt: Date
  updatedAt: Date
}

// New interfaces for enhanced product management
export interface ProductCategory {
  id: string
  name: string
  slug: string
  description?: string
  parentId?: string
  level: number
  sortOrder: number
  isActive: boolean
  isFeatured: boolean
  
  // SEO and display
  metaTitle?: string
  metaDescription?: string
  imageUrl?: string
  iconUrl?: string
  
  // Relations
  parent?: ProductCategory
  children?: ProductCategory[]
  wines?: Wine[]
  
  createdAt: Date
  updatedAt: Date
}

export interface WineVariant {
  id: string
  wineId: string
  name: string
  sku: string
  
  // Variant attributes
  bottleSize: string
  packaging?: string
  format?: string
  
  // Pricing
  originalPrice: number
  currentPrice: number
  priceModifier: number
  
  // Inventory
  stockQuantity: number
  reservedQty: number
  
  // Status
  isActive: boolean
  isDefault: boolean
  
  // Additional attributes
  attributes: Record<string, any>
  
  createdAt: Date
  updatedAt: Date
}

export interface ProductCertification {
  id: string
  wineId: string
  
  // Certification details
  name: string
  certifyingBody: string
  certificateNumber?: string
  
  // Certification metadata
  type: string
  level?: string
  description?: string
  
  // Validity
  issuedDate: Date
  expiryDate?: Date
  isActive: boolean
  isVerified: boolean
  
  // Documentation
  certificateUrl?: string
  logoUrl?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface ProductAward {
  id: string
  wineId: string
  
  // Award details
  name: string
  title: string
  category?: string
  
  // Award metadata
  awardingBody: string
  competition?: string
  year: number
  score?: number
  maxScore?: number
  
  // Award level and recognition
  level?: string
  rank?: number
  description?: string
  
  // Documentation
  certificateUrl?: string
  logoUrl?: string
  pressRelease?: string
  
  // Status
  isActive: boolean
  isVerified: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface WineSEO {
  id: string
  wineId: string
  
  // Basic SEO
  metaTitle?: string
  metaDescription?: string
  metaKeywords: string[]
  slug?: string
  canonicalUrl?: string
  
  // Open Graph
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  
  // Twitter Cards
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: string
  
  // Structured Data
  structuredData: Record<string, any>
  breadcrumbData?: Record<string, any>
  productSchema?: Record<string, any>
  
  // SEO Performance
  seoScore?: number
  keywordDensity?: Record<string, number>
  readabilityScore?: number
  
  // Search optimization
  searchTerms?: string[]
  competitorKeywords?: string[]
  
  // Performance tracking
  lastOptimized?: Date
  optimizationNotes?: string
  
  createdAt: Date
  updatedAt: Date
}

export interface ProductRecommendation {
  id: string
  sourceProductId: string
  targetProductId?: string
  
  // Recommendation details
  type: string
  title: string
  description: string
  reason?: string
  
  // Targeting and conditions
  conditions: Record<string, any>
  targetProducts: string[]
  customerSegments?: string[]
  
  // Performance and optimization
  priority: number
  weight: number
  clickThroughRate?: number
  conversionRate?: number
  
  // Scheduling and availability
  startDate?: Date
  endDate?: Date
  isActive: boolean
  isAutoGenerated: boolean
  
  // A/B testing
  testGroup?: string
  testVariant?: string
  
  createdAt: Date
  updatedAt: Date
}

// Enums and Types
export type WineCategory = 
  | 'bordeaux'
  | 'burgundy'
  | 'rhone-valley'
  | 'champagne'
  | 'world-wines'
  | 'specialty-collections'

export type CryptoCurrency = 
  | 'BTC' 
  | 'ETH' 
  | 'SOL' 
  | 'DOGE' 
  | 'LTC' 
  | 'USDC' 
  | 'USDT'

export type FiatCurrency = 'USD' | 'EUR'

export type Currency = CryptoCurrency | FiatCurrency

// API Request/Response Types
export interface CreateWineRequest {
  name: string
  producer: string
  region: string
  appellation?: string
  vintage: number
  category: WineCategory
  categoryId?: string
  description: string
  tastingNotes?: string
  alcoholContent: number
  bottleSize: string
  sku: string
  
  // Premium pricing structure
  originalPrice: number
  currentPrice: number
  discountPercent?: number
  currency: string
  
  // Premium attributes
  terroir?: string
  winemaker?: string
  estate?: string
  classification?: string
  servingTemp?: string
  agingPotential?: string
  harvestDate?: Date
  bottlingDate?: Date
  releaseDate?: Date
  
  // Status and availability
  stock: number
  isActive?: boolean
  isFeatured?: boolean
  isLimitedEdition?: boolean
  isNftAvailable?: boolean
  isPreOrder?: boolean
  availableFrom?: Date
  
  prices: CreateWinePriceRequest[]
  inventory: CreateWineInventoryRequest[]
  images: CreateWineImageRequest[]
  variants?: CreateWineVariantRequest[]
  specifications?: CreateWineSpecificationRequest
  certifications?: CreateProductCertificationRequest[]
  awards?: CreateProductAwardRequest[]
  seo?: CreateWineSEORequest
}

export interface CreateWinePriceRequest {
  currency: Currency
  originalPrice: number
  currentPrice: number
  costPrice?: number
  discountType?: string
  discountValue?: number
  discountStartDate?: Date
  discountEndDate?: Date
  tier?: string
  minQuantity?: number
  maxQuantity?: number
  isPromotion?: boolean
  promotionCode?: string
}

export interface CreateWineInventoryRequest {
  quantity: number
  location?: string
  warehouse?: string
  zone?: string
  temperature?: number
  humidity?: number
  lowStockThreshold?: number
  reorderPoint?: number
  maxStockLevel?: number
  batchNumber?: string
  lotNumber?: string
  supplierRef?: string
  unitCost?: number
}

export interface CreateWineImageRequest {
  url: string
  filename?: string
  altText?: string
  title?: string
  caption?: string
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
  type?: string
  isPrimary: boolean
  sortOrder: number
  thumbnailUrl?: string
  mediumUrl?: string
  largeUrl?: string
  tags?: string[]
}

export interface CreateWineVariantRequest {
  name: string
  sku: string
  bottleSize: string
  packaging?: string
  format?: string
  originalPrice: number
  currentPrice: number
  priceModifier?: number
  stockQuantity: number
  isDefault?: boolean
  attributes?: Record<string, any>
}

export interface CreateWineSpecificationRequest {
  grapeVariety: string[]
  alcoholContent?: number
  servingTemp?: string
  tastingNotes?: string
  foodPairing?: string
  awards?: string[] // Deprecated
  ph?: number
  residualSugar?: number
  tannins?: string
  acidity?: string
  body?: string
  finish?: string
  oakTreatment?: string
  malolacticFermentation?: boolean
}

export interface CreateProductCertificationRequest {
  name: string
  certifyingBody: string
  certificateNumber?: string
  type: string
  level?: string
  description?: string
  issuedDate: Date
  expiryDate?: Date
  certificateUrl?: string
  logoUrl?: string
}

export interface CreateProductAwardRequest {
  name: string
  title: string
  category?: string
  awardingBody: string
  competition?: string
  year: number
  score?: number
  maxScore?: number
  level?: string
  rank?: number
  description?: string
  certificateUrl?: string
  logoUrl?: string
  pressRelease?: string
}

export interface CreateWineSEORequest {
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string[]
  slug?: string
  canonicalUrl?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCard?: string
  structuredData?: Record<string, any>
  breadcrumbData?: Record<string, any>
  productSchema?: Record<string, any>
  searchTerms?: string[]
  competitorKeywords?: string[]
}

export interface UpdateWineRequest extends Partial<CreateWineRequest> {
  id: string
  isActive?: boolean
  isFeatured?: boolean
  isNftAvailable?: boolean
}

export interface WineFilters {
  category?: WineCategory[]
  region?: string[]
  vintage?: {
    min?: number
    max?: number
  }
  price?: {
    min?: number
    max?: number
    currency?: Currency
  }
  producer?: string[]
  availability?: boolean
  featured?: boolean
  search?: string
}

export interface WineSearchParams extends WineFilters {
  page?: number
  limit?: number
  sortBy?: 'name' | 'price' | 'vintage' | 'createdAt' | 'rating'
  sortOrder?: 'asc' | 'desc'
}

export interface WineListResponse {
  wines: Wine[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface WineDetailResponse extends Wine {
  relatedWines?: Wine[]
  averageRating?: number
  reviewCount?: number
}

// Price Display Types
export interface PriceDisplay {
  fiat: {
    usd: number
    eur: number
  }
  crypto: {
    [K in CryptoCurrency]?: number
  }
  displayCurrency: Currency
  lastUpdated: Date
}

// Category Types
export interface WineCategoryInfo {
  id: WineCategory
  name: string
  description: string
  image: string
  wineCount: number
  featured: boolean
}

export const WINE_CATEGORIES: Record<WineCategory, WineCategoryInfo> = {
  'bordeaux': {
    id: 'bordeaux',
    name: 'Bordeaux',
    description: 'Premium wines from the prestigious Bordeaux region',
    image: '/images/categories/bordeaux.jpg',
    wineCount: 0,
    featured: true
  },
  'burgundy': {
    id: 'burgundy',
    name: 'Burgundy',
    description: 'Elegant Pinot Noir and Chardonnay from Burgundy',
    image: '/images/categories/burgundy.jpg',
    wineCount: 0,
    featured: true
  },
  'rhone-valley': {
    id: 'rhone-valley',
    name: 'Rhône Valley',
    description: 'Bold and expressive wines from the Rhône Valley',
    image: '/images/categories/rhone-valley.jpg',
    wineCount: 0,
    featured: true
  },
  'champagne': {
    id: 'champagne',
    name: 'Champagne',
    description: 'Luxury sparkling wines from the Champagne region',
    image: '/images/categories/champagne.jpg',
    wineCount: 0,
    featured: true
  },
  'world-wines': {
    id: 'world-wines',
    name: 'World Wines',
    description: 'Exceptional wines from around the globe',
    image: '/images/categories/world-wines.jpg',
    wineCount: 0,
    featured: false
  },
  'specialty-collections': {
    id: 'specialty-collections',
    name: 'Specialty Collections',
    description: 'Rare and exclusive wine collections',
    image: '/images/categories/specialty.jpg',
    wineCount: 0,
    featured: false
  }
}