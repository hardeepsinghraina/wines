// Promotional pricing and discount management types

export interface PromotionalPricing {
  id: string
  wineId: string
  
  // Pricing structure
  originalPrice: number
  currentPrice: number
  discountAmount: number
  discountPercent: number
  currency: string
  
  // Promotion details
  promotionId?: string
  promotionType: PromotionType
  promotionName: string
  promotionDescription?: string
  
  // Timing
  startDate: Date
  endDate: Date
  isActive: boolean
  
  // Targeting
  customerTiers: CustomerTier[]
  minQuantity?: number
  maxQuantity?: number
  
  // Urgency indicators
  stockScarcity?: StockScarcityConfig
  limitedTimeOffer?: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface Promotion {
  id: string
  name: string
  description: string
  type: PromotionType
  
  // Discount configuration
  discountType: DiscountType
  discountValue: number // Percentage or fixed amount
  maxDiscountAmount?: number | undefined // Cap for percentage discounts
  
  // Conditions
  minOrderAmount?: number
  maxOrderAmount?: number
  minQuantity?: number
  maxQuantity?: number
  applicableProducts: string[] // Product IDs
  applicableCategories: string[] // Category IDs
  
  // Customer targeting
  customerTiers: CustomerTier[]
  newCustomersOnly?: boolean
  existingCustomersOnly?: boolean
  
  // Usage limits
  totalUsageLimit?: number
  perCustomerLimit?: number
  currentUsageCount: number
  
  // Timing
  startDate: Date
  endDate: Date
  isActive: boolean
  
  // Display and messaging
  bannerMessage?: string
  emailSubject?: string
  emailTemplate?: string
  urgencyMessage?: string
  
  // Analytics
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  
  createdAt: Date
  updatedAt: Date
}

export interface DiscountCode {
  id: string
  code: string
  name: string
  description?: string | undefined
  
  // Discount configuration
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number | undefined
  
  // Conditions
  minOrderAmount?: number
  applicableProducts: string[]
  applicableCategories: string[]
  
  // Customer targeting
  customerTiers: CustomerTier[]
  allowedEmails?: string[] // Specific email addresses
  
  // Usage limits
  totalUsageLimit?: number
  perCustomerLimit?: number
  currentUsageCount: number
  
  // Timing
  startDate: Date
  endDate: Date
  isActive: boolean
  
  // Analytics
  usageCount: number
  revenue: number
  
  createdAt: Date
  updatedAt: Date
}

export interface BulkPricingTier {
  id: string
  wineId: string
  
  // Tier configuration
  minQuantity: number
  maxQuantity?: number
  discountPercent: number
  tierName: string
  
  // Pricing
  unitPrice: number
  totalSavings: number
  
  // Status
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface VIPPricingTier {
  id: string
  customerTier: CustomerTier
  
  // Discount configuration
  discountPercent: number
  additionalBenefits: string[]
  
  // Conditions
  minOrderAmount?: number
  applicableProducts: string[]
  applicableCategories: string[]
  
  // Status
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface StockScarcityConfig {
  enabled: boolean
  threshold: number // Show scarcity when stock <= threshold
  message: string
  urgencyLevel: 'low' | 'medium' | 'high'
  showExactCount: boolean
}

export interface PromotionalAnalytics {
  promotionId: string
  
  // Performance metrics
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  
  // Conversion funnel
  viewToClick: number
  clickToConversion: number
  overallConversion: number
  
  // Customer metrics
  newCustomers: number
  returningCustomers: number
  averageOrderValue: number
  
  // Time-based metrics
  dailyMetrics: DailyPromotionMetrics[]
  
  // Product performance
  topPerformingProducts: ProductPerformance[]
  
  updatedAt: Date
}

export interface DailyPromotionMetrics {
  date: Date
  impressions: number
  clicks: number
  conversions: number
  revenue: number
}

export interface ProductPerformance {
  productId: string
  productName: string
  impressions: number
  clicks: number
  conversions: number
  revenue: number
  conversionRate: number
}

// Enums and Types
export type PromotionType = 
  | 'flash_sale'
  | 'seasonal'
  | 'clearance'
  | 'new_customer'
  | 'loyalty_reward'
  | 'bulk_discount'
  | 'vip_exclusive'
  | 'limited_edition'

export type DiscountType = 
  | 'percentage'
  | 'fixed_amount'
  | 'buy_x_get_y'
  | 'free_shipping'

export type CustomerTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum'
  | 'vip'

// API Request/Response Types
export interface CreatePromotionRequest {
  name: string
  description: string
  type: PromotionType
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  applicableProducts: string[]
  applicableCategories: string[]
  customerTiers: CustomerTier[]
  totalUsageLimit?: number
  perCustomerLimit?: number
  startDate: Date
  endDate: Date
  bannerMessage?: string
  emailSubject?: string
  urgencyMessage?: string
}

export interface CreateDiscountCodeRequest {
  code: string
  name: string
  description?: string
  discountType: DiscountType
  discountValue: number
  maxDiscountAmount?: number
  minOrderAmount?: number
  applicableProducts: string[]
  customerTiers: CustomerTier[]
  totalUsageLimit?: number
  perCustomerLimit?: number
  startDate: Date
  endDate: Date
}

export interface ApplyDiscountRequest {
  code?: string
  promotionId?: string
  cartItems: Array<{
    productId: string
    quantity: number
    price: number
  }>
  customerTier?: CustomerTier
  customerId?: string
}

export interface ApplyDiscountResponse {
  success: boolean
  discountAmount: number
  discountPercent: number
  originalTotal: number
  discountedTotal: number
  savings: number
  appliedPromotion?: Promotion
  appliedDiscountCode?: DiscountCode
  message?: string
  error?: string
}

export interface PromotionalPricingResponse {
  productId: string
  originalPrice: number
  currentPrice: number
  discountAmount: number
  discountPercent: number
  savings: number
  promotionName?: string
  urgencyMessage?: string | undefined
  stockScarcity?: {
    isLow: boolean
    remaining: number
    message: string
  }
  bulkPricing?: BulkPricingTier[]
  vipPricing?: {
    tier: CustomerTier
    discountPercent: number
    vipPrice: number
  }
}

// Utility Types
export interface PriceCalculation {
  originalPrice: number
  discountAmount: number
  finalPrice: number
  discountPercent: number
  savings: number
  currency: string
}

export interface PromotionValidation {
  isValid: boolean
  errors: string[]
  warnings: string[]
}