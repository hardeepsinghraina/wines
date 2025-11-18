// Premium product categories for luxury wine e-commerce platform

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

// Luxury Wine Categories (80% discount, $499-799 final price)
export const PREMIUM_WINE_CATEGORIES: Record<string, PremiumCategoryConfig> = {
  // Root Categories
  'vintage-reserves': {
    id: 'vintage-reserves',
    name: 'Vintage Reserves',
    slug: 'vintage-reserves',
    description: 'Exceptional vintage wines from prestigious estates, carefully aged to perfection',
    level: 0,
    sortOrder: 1,
    isFeatured: true,
    imageUrl: '/images/categories/vintage-reserves.jpg',
    iconUrl: '/icons/vintage-reserves.svg',
    metaTitle: 'Vintage Reserve Wines - Premium Aged Collections',
    metaDescription: 'Discover our exclusive vintage reserve wines with 80% off. Original prices $2495-3995, now $499-799.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Aged 10+ years', 'Limited production', 'Collector quality', 'Investment grade']
  },
  
  'estate-collections': {
    id: 'estate-collections',
    name: 'Estate Collections',
    slug: 'estate-collections',
    description: 'Curated selections from world-renowned wine estates and prestigious vineyards',
    level: 0,
    sortOrder: 2,
    isFeatured: true,
    imageUrl: '/images/categories/estate-collections.jpg',
    iconUrl: '/icons/estate-collections.svg',
    metaTitle: 'Estate Collection Wines - Premium Vineyard Selections',
    metaDescription: 'Exclusive estate wines from legendary vineyards. 80% discount on original prices $2495-3995.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Single estate', 'Terroir-driven', 'Family heritage', 'Artisanal production']
  },
  
  'limited-editions': {
    id: 'limited-editions',
    name: 'Limited Editions',
    slug: 'limited-editions',
    description: 'Rare and exclusive limited edition wines with numbered bottles and certificates',
    level: 0,
    sortOrder: 3,
    isFeatured: true,
    imageUrl: '/images/categories/limited-editions.jpg',
    iconUrl: '/icons/limited-editions.svg',
    metaTitle: 'Limited Edition Wines - Rare Collector Bottles',
    metaDescription: 'Ultra-rare limited edition wines. Numbered bottles with certificates. 80% off premium pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Numbered bottles', 'Certificate of authenticity', 'Ultra-limited', 'Collector exclusive']
  },

  // Premium Spirits Categories
  'single-malt-whiskeys': {
    id: 'single-malt-whiskeys',
    name: 'Single Malt Whiskeys',
    slug: 'single-malt-whiskeys',
    description: 'Premium aged single malt whiskeys from Scotland\'s finest distilleries',
    level: 0,
    sortOrder: 4,
    isFeatured: true,
    imageUrl: '/images/categories/single-malt-whiskeys.jpg',
    iconUrl: '/icons/single-malt-whiskeys.svg',
    metaTitle: 'Premium Single Malt Whiskeys - Aged Scottish Excellence',
    metaDescription: 'Exceptional single malt whiskeys aged 18+ years. Original prices $2495-3995, now $499-799.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['18+ years aged', 'Single distillery', 'Cask strength options', 'Master distiller selected']
  },
  
  'aged-cognacs': {
    id: 'aged-cognacs',
    name: 'Aged Cognacs',
    slug: 'aged-cognacs',
    description: 'Luxurious aged cognacs from prestigious French houses with decades of maturation',
    level: 0,
    sortOrder: 5,
    isFeatured: true,
    imageUrl: '/images/categories/aged-cognacs.jpg',
    iconUrl: '/icons/aged-cognacs.svg',
    metaTitle: 'Premium Aged Cognacs - French Luxury Spirits',
    metaDescription: 'Exceptional aged cognacs from Grande Champagne. XO and beyond. 80% off luxury pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['XO and beyond', 'Grande Champagne', '25+ years aged', 'Crystal decanters']
  },
  
  'artisan-gins': {
    id: 'artisan-gins',
    name: 'Artisan Gins',
    slug: 'artisan-gins',
    description: 'Small-batch artisan gins with unique botanical blends and premium distillation',
    level: 0,
    sortOrder: 6,
    isFeatured: false,
    imageUrl: '/images/categories/artisan-gins.jpg',
    iconUrl: '/icons/artisan-gins.svg',
    metaTitle: 'Artisan Premium Gins - Small Batch Botanical Excellence',
    metaDescription: 'Rare artisan gins with unique botanicals. Limited production. 80% off original pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Small batch', 'Unique botanicals', 'Craft distilled', 'Limited production']
  },

  // Champagne and Sparkling
  'vintage-champagnes': {
    id: 'vintage-champagnes',
    name: 'Vintage Champagnes',
    slug: 'vintage-champagnes',
    description: 'Prestigious vintage champagnes from legendary houses in the Champagne region',
    level: 0,
    sortOrder: 7,
    isFeatured: true,
    imageUrl: '/images/categories/vintage-champagnes.jpg',
    iconUrl: '/icons/vintage-champagnes.svg',
    metaTitle: 'Vintage Champagnes - Prestigious French Bubbles',
    metaDescription: 'Legendary vintage champagnes from prestigious houses. 80% discount on luxury pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Vintage dated', 'Prestigious houses', 'Extended lees aging', 'Celebration worthy']
  },
  
  'premium-sparkling': {
    id: 'premium-sparkling',
    name: 'Premium Sparkling',
    slug: 'premium-sparkling',
    description: 'Exceptional sparkling wines from renowned regions worldwide using traditional methods',
    level: 0,
    sortOrder: 8,
    isFeatured: false,
    imageUrl: '/images/categories/premium-sparkling.jpg',
    iconUrl: '/icons/premium-sparkling.svg',
    metaTitle: 'Premium Sparkling Wines - Traditional Method Excellence',
    metaDescription: 'World-class sparkling wines made using traditional methods. 80% off premium pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Traditional method', 'Extended aging', 'Premium regions', 'Celebration quality']
  },

  // Regional Specialties
  'bordeaux-premiers': {
    id: 'bordeaux-premiers',
    name: 'Bordeaux Premiers',
    slug: 'bordeaux-premiers',
    description: 'First Growth and exceptional Bordeaux wines from classified estates',
    parentId: 'vintage-reserves',
    level: 1,
    sortOrder: 1,
    isFeatured: true,
    imageUrl: '/images/categories/bordeaux-premiers.jpg',
    iconUrl: '/icons/bordeaux-premiers.svg',
    metaTitle: 'Premier Bordeaux Wines - First Growth Excellence',
    metaDescription: 'Classified Bordeaux wines from premier estates. Investment grade bottles with 80% discount.',
    priceRange: { min: 599, max: 799, currency: 'USD' },
    characteristics: ['Classified growth', 'Left bank excellence', 'Cabernet Sauvignon blend', 'Investment grade']
  },
  
  'burgundy-grands-crus': {
    id: 'burgundy-grands-crus',
    name: 'Burgundy Grands Crus',
    slug: 'burgundy-grands-crus',
    description: 'Grand Cru Burgundy wines from legendary vineyards and prestigious domaines',
    parentId: 'vintage-reserves',
    level: 1,
    sortOrder: 2,
    isFeatured: true,
    imageUrl: '/images/categories/burgundy-grands-crus.jpg',
    iconUrl: '/icons/burgundy-grands-crus.svg',
    metaTitle: 'Grand Cru Burgundy - Legendary Vineyard Wines',
    metaDescription: 'Exceptional Grand Cru Burgundy from legendary vineyards. 80% off collector pricing.',
    priceRange: { min: 649, max: 799, currency: 'USD' },
    characteristics: ['Grand Cru status', 'Pinot Noir mastery', 'Legendary vineyards', 'Collector sought']
  },
  
  'napa-cult-wines': {
    id: 'napa-cult-wines',
    name: 'Napa Cult Wines',
    slug: 'napa-cult-wines',
    description: 'Cult status Napa Valley Cabernets from legendary producers and premium vineyards',
    parentId: 'estate-collections',
    level: 1,
    sortOrder: 3,
    isFeatured: true,
    imageUrl: '/images/categories/napa-cult-wines.jpg',
    iconUrl: '/icons/napa-cult-wines.svg',
    metaTitle: 'Napa Cult Wines - California\'s Finest Cabernets',
    metaDescription: 'Cult status Napa Cabernets from legendary producers. 80% discount on collector pricing.',
    priceRange: { min: 549, max: 799, currency: 'USD' },
    characteristics: ['Cult status', 'Napa Valley AVA', 'Premium Cabernet', 'Collector favorite']
  },

  // Gift Collections
  'luxury-gift-sets': {
    id: 'luxury-gift-sets',
    name: 'Luxury Gift Sets',
    slug: 'luxury-gift-sets',
    description: 'Curated luxury gift sets with premium wines, spirits, and accessories',
    level: 0,
    sortOrder: 9,
    isFeatured: true,
    imageUrl: '/images/categories/luxury-gift-sets.jpg',
    iconUrl: '/icons/luxury-gift-sets.svg',
    metaTitle: 'Luxury Wine Gift Sets - Premium Curated Collections',
    metaDescription: 'Exquisite gift sets with premium wines and accessories. 80% off luxury pricing.',
    priceRange: { min: 499, max: 799, currency: 'USD' },
    characteristics: ['Curated selection', 'Premium packaging', 'Gift accessories', 'Corporate suitable']
  },
  
  'collectors-editions': {
    id: 'collectors-editions',
    name: 'Collectors Editions',
    slug: 'collectors-editions',
    description: 'Special collector editions with unique packaging, certificates, and provenance',
    parentId: 'limited-editions',
    level: 1,
    sortOrder: 4,
    isFeatured: true,
    imageUrl: '/images/categories/collectors-editions.jpg',
    iconUrl: '/icons/collectors-editions.svg',
    metaTitle: 'Collector Edition Wines - Investment Grade Bottles',
    metaDescription: 'Special collector editions with certificates and provenance. 80% off investment pricing.',
    priceRange: { min: 649, max: 799, currency: 'USD' },
    characteristics: ['Investment grade', 'Provenance certified', 'Special packaging', 'Numbered series']
  }
}

// Category hierarchy helper functions
export const getCategoryHierarchy = (categoryId: string): PremiumCategoryConfig[] => {
  const category = PREMIUM_WINE_CATEGORIES[categoryId]
  if (!category) return []
  
  const hierarchy: PremiumCategoryConfig[] = [category]
  
  if (category.parentId) {
    const parent = PREMIUM_WINE_CATEGORIES[category.parentId]
    if (parent) {
      hierarchy.unshift(parent)
    }
  }
  
  return hierarchy
}

export const getRootCategories = (): PremiumCategoryConfig[] => {
  return Object.values(PREMIUM_WINE_CATEGORIES)
    .filter(cat => cat.level === 0)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getSubCategories = (parentId: string): PremiumCategoryConfig[] => {
  return Object.values(PREMIUM_WINE_CATEGORIES)
    .filter(cat => cat.parentId === parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export const getFeaturedCategories = (): PremiumCategoryConfig[] => {
  return Object.values(PREMIUM_WINE_CATEGORIES)
    .filter(cat => cat.isFeatured)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

// Price range constants for premium products
export const PREMIUM_PRICE_RANGES = {
  ORIGINAL: { min: 2495, max: 3995, currency: 'USD' },
  DISCOUNTED: { min: 499, max: 799, currency: 'USD' },
  DISCOUNT_PERCENT: 80
}

// Product type constants
export const PRODUCT_TYPES = {
  WINE: 'WINE',
  SPIRITS: 'SPIRITS',
  CHAMPAGNE: 'CHAMPAGNE',
  GIFT_SET: 'GIFT_SET'
} as const

export type ProductType = typeof PRODUCT_TYPES[keyof typeof PRODUCT_TYPES]