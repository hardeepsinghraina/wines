// Utility functions for premium product categories

import { PREMIUM_WINE_CATEGORIES, PremiumCategoryConfig, PREMIUM_PRICE_RANGES } from '../constants/premium-categories'
import type { ProductCategory, Wine } from '../types/product'

/**
 * Convert premium category config to database category model
 */
export const categoryConfigToModel = (config: PremiumCategoryConfig): Omit<ProductCategory, 'id' | 'createdAt' | 'updatedAt'> => {
  return {
    name: config.name,
    slug: config.slug,
    description: config.description,
    parentId: config.parentId,
    level: config.level,
    sortOrder: config.sortOrder,
    isActive: true,
    isFeatured: config.isFeatured,
    metaTitle: config.metaTitle,
    metaDescription: config.metaDescription,
    imageUrl: config.imageUrl,
    iconUrl: config.iconUrl
  }
}

/**
 * Generate category breadcrumbs for navigation
 */
export const generateCategoryBreadcrumbs = (categoryId: string): Array<{ name: string; slug: string; url: string }> => {
  const breadcrumbs: Array<{ name: string; slug: string; url: string }> = []
  
  const category = PREMIUM_WINE_CATEGORIES[categoryId]
  if (!category) return breadcrumbs
  
  // Add parent category if exists
  if (category.parentId) {
    const parent = PREMIUM_WINE_CATEGORIES[category.parentId]
    if (parent) {
      breadcrumbs.push({
        name: parent.name,
        slug: parent.slug,
        url: `/categories/${parent.slug}`
      })
    }
  }
  
  // Add current category
  breadcrumbs.push({
    name: category.name,
    slug: category.slug,
    url: `/categories/${category.slug}`
  })
  
  return breadcrumbs
}

/**
 * Calculate discount information for premium pricing
 */
export const calculatePremiumDiscount = (originalPrice: number): {
  discountPercent: number
  discountAmount: number
  finalPrice: number
  savings: number
} => {
  const discountPercent = PREMIUM_PRICE_RANGES.DISCOUNT_PERCENT
  const discountAmount = originalPrice * (discountPercent / 100)
  const finalPrice = originalPrice - discountAmount
  
  return {
    discountPercent,
    discountAmount,
    finalPrice,
    savings: discountAmount
  }
}

/**
 * Validate if a price falls within premium range
 */
export const isPremiumPriceRange = (originalPrice: number, finalPrice: number): boolean => {
  const { min: originalMin, max: originalMax } = PREMIUM_PRICE_RANGES.ORIGINAL
  const { min: finalMin, max: finalMax } = PREMIUM_PRICE_RANGES.DISCOUNTED
  
  return originalPrice >= originalMin && 
         originalPrice <= originalMax && 
         finalPrice >= finalMin && 
         finalPrice <= finalMax
}

/**
 * Generate SEO-friendly category URL
 */
export const generateCategoryUrl = (categorySlug: string, baseUrl: string = ''): string => {
  return `${baseUrl}/categories/${categorySlug}`
}

/**
 * Get category display information with product count
 */
export const getCategoryDisplayInfo = (
  categoryId: string, 
  productCount: number = 0
): PremiumCategoryConfig & { productCount: number; url: string } => {
  const category = PREMIUM_WINE_CATEGORIES[categoryId]
  if (!category) {
    throw new Error(`Category not found: ${categoryId}`)
  }
  
  return {
    ...category,
    productCount,
    url: generateCategoryUrl(category.slug)
  }
}

/**
 * Filter categories by criteria
 */
export const filterCategories = (criteria: {
  featured?: boolean
  level?: number
  parentId?: string
  hasProducts?: boolean
}): PremiumCategoryConfig[] => {
  return Object.values(PREMIUM_WINE_CATEGORIES).filter(category => {
    if (criteria.featured !== undefined && category.isFeatured !== criteria.featured) {
      return false
    }
    
    if (criteria.level !== undefined && category.level !== criteria.level) {
      return false
    }
    
    if (criteria.parentId !== undefined && category.parentId !== criteria.parentId) {
      return false
    }
    
    return true
  }).sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Generate category tree structure
 */
export const generateCategoryTree = (): Array<PremiumCategoryConfig & { children: PremiumCategoryConfig[] }> => {
  const rootCategories = filterCategories({ level: 0 })
  
  return rootCategories.map(root => ({
    ...root,
    children: filterCategories({ parentId: root.id })
  }))
}

/**
 * Get category suggestions based on wine attributes
 */
export const suggestCategoriesForWine = (wine: Partial<Wine>): string[] => {
  const suggestions: string[] = []
  
  // Price-based suggestions
  if (wine.originalPrice && wine.currentPrice) {
    if (isPremiumPriceRange(wine.originalPrice, wine.currentPrice)) {
      if (wine.vintage && new Date().getFullYear() - wine.vintage >= 10) {
        suggestions.push('vintage-reserves')
      }
      
      if (wine.isLimitedEdition) {
        suggestions.push('limited-editions')
      }
    }
  }
  
  // Region-based suggestions
  if (wine.region) {
    const region = wine.region.toLowerCase()
    
    if (region.includes('bordeaux')) {
      suggestions.push('bordeaux-premiers')
    } else if (region.includes('burgundy')) {
      suggestions.push('burgundy-grands-crus')
    } else if (region.includes('napa')) {
      suggestions.push('napa-cult-wines')
    } else if (region.includes('champagne')) {
      suggestions.push('vintage-champagnes')
    }
  }
  
  // Producer-based suggestions
  if (wine.producer) {
    const producer = wine.producer.toLowerCase()
    
    // Add logic for specific producers
    if (producer.includes('estate') || producer.includes('domaine')) {
      suggestions.push('estate-collections')
    }
  }
  
  return [...new Set(suggestions)] // Remove duplicates
}

/**
 * Validate category hierarchy consistency
 */
export const validateCategoryHierarchy = (): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  Object.values(PREMIUM_WINE_CATEGORIES).forEach(category => {
    // Check parent exists if parentId is set
    if (category.parentId && !PREMIUM_WINE_CATEGORIES[category.parentId]) {
      errors.push(`Category ${category.id} references non-existent parent ${category.parentId}`)
    }
    
    // Check level consistency
    if (category.parentId) {
      const parent = PREMIUM_WINE_CATEGORIES[category.parentId]
      if (parent && category.level !== parent.level + 1) {
        errors.push(`Category ${category.id} has incorrect level ${category.level}, should be ${parent.level + 1}`)
      }
    } else if (category.level !== 0) {
      errors.push(`Root category ${category.id} should have level 0, has ${category.level}`)
    }
    
    // Check slug uniqueness
    const duplicateSlugs = Object.values(PREMIUM_WINE_CATEGORIES)
      .filter(c => c.slug === category.slug && c.id !== category.id)
    
    if (duplicateSlugs.length > 0) {
      errors.push(`Duplicate slug ${category.slug} found in categories: ${[category.id, ...duplicateSlugs.map(c => c.id)].join(', ')}`)
    }
  })
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Generate category metadata for SEO
 */
export const generateCategoryMetadata = (categoryId: string, productCount: number = 0) => {
  const category = PREMIUM_WINE_CATEGORIES[categoryId]
  if (!category) return null
  
  const discount = calculatePremiumDiscount(PREMIUM_PRICE_RANGES.ORIGINAL.max)
  
  return {
    title: category.metaTitle || `${category.name} - Premium Wine Collection`,
    description: category.metaDescription || 
      `Discover ${productCount} exceptional ${category.name.toLowerCase()} with ${discount.discountPercent}% off. ` +
      `Original prices $${PREMIUM_PRICE_RANGES.ORIGINAL.min}-${PREMIUM_PRICE_RANGES.ORIGINAL.max}, ` +
      `now $${PREMIUM_PRICE_RANGES.DISCOUNTED.min}-${PREMIUM_PRICE_RANGES.DISCOUNTED.max}.`,
    keywords: [
      category.name.toLowerCase(),
      'premium wine',
      'luxury wine',
      'wine collection',
      'discount wine',
      ...category.characteristics.map(c => c.toLowerCase())
    ],
    openGraph: {
      title: category.metaTitle || `${category.name} - Premium Wine Collection`,
      description: category.description,
      image: category.imageUrl,
      url: generateCategoryUrl(category.slug)
    },
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: category.name,
      description: category.description,
      url: generateCategoryUrl(category.slug),
      image: category.imageUrl,
      numberOfItems: productCount,
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: PREMIUM_PRICE_RANGES.DISCOUNTED.currency,
        lowPrice: PREMIUM_PRICE_RANGES.DISCOUNTED.min,
        highPrice: PREMIUM_PRICE_RANGES.DISCOUNTED.max,
        offerCount: productCount
      }
    }
  }
}