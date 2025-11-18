import Joi from 'joi'

// Wine categories enum validation
const wineCategories = [
  'bordeaux',
  'burgundy', 
  'rhone-valley',
  'champagne',
  'world-wines',
  'specialty-collections'
]

// Currency validation
const currencies = ['USD', 'EUR', 'BTC', 'ETH', 'SOL', 'DOGE', 'LTC', 'USDC', 'USDT']

// Create wine validation schema
export const createWineValidation = {
  body: Joi.object({
    name: Joi.string().required().min(1).max(255),
    producer: Joi.string().required().min(1).max(255),
    region: Joi.string().required().min(1).max(255),
    vintage: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).required(),
    category: Joi.string().valid(...wineCategories).required(),
    description: Joi.string().required().min(10).max(2000),
    tastingNotes: Joi.string().optional().max(1000),
    alcoholContent: Joi.number().min(0).max(50).required(),
    bottleSize: Joi.string().required().max(50),
    sku: Joi.string().required().min(1).max(100),
    prices: Joi.array().items(
      Joi.object({
        currency: Joi.string().valid(...currencies).required(),
        price: Joi.number().positive().required()
      })
    ).min(1).required(),
    inventory: Joi.array().items(
      Joi.object({
        quantity: Joi.number().integer().min(0).required(),
        location: Joi.string().optional().max(255)
      })
    ).min(1).required(),
    images: Joi.array().items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().optional().max(255),
        isPrimary: Joi.boolean().required(),
        sortOrder: Joi.number().integer().min(0).required()
      })
    ).min(1).required(),
    specifications: Joi.object({
      grapeVariety: Joi.array().items(Joi.string().max(100)).min(1).required(),
      servingTemp: Joi.string().optional().max(100),
      agingPotential: Joi.string().optional().max(255),
      foodPairing: Joi.string().optional().max(500),
      awards: Joi.array().items(Joi.string().max(255)).optional()
    }).optional()
  })
}

// Update wine validation schema
export const updateWineValidation = {
  params: Joi.object({
    id: Joi.string().required()
  }),
  body: Joi.object({
    name: Joi.string().optional().min(1).max(255),
    producer: Joi.string().optional().min(1).max(255),
    region: Joi.string().optional().min(1).max(255),
    vintage: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    category: Joi.string().valid(...wineCategories).optional(),
    description: Joi.string().optional().min(10).max(2000),
    tastingNotes: Joi.string().optional().max(1000),
    alcoholContent: Joi.number().min(0).max(50).optional(),
    bottleSize: Joi.string().optional().max(50),
    sku: Joi.string().optional().min(1).max(100),
    isActive: Joi.boolean().optional(),
    isFeatured: Joi.boolean().optional(),
    isNftAvailable: Joi.boolean().optional()
  }).min(1)
}

// Wine search validation schema
export const wineSearchValidation = {
  query: Joi.object({
    q: Joi.string().required().min(1).max(255),
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid('name', 'price', 'vintage', 'createdAt', 'rating').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    category: Joi.alternatives().try(
      Joi.string().valid(...wineCategories),
      Joi.array().items(Joi.string().valid(...wineCategories))
    ).optional(),
    region: Joi.alternatives().try(
      Joi.string().max(255),
      Joi.array().items(Joi.string().max(255))
    ).optional(),
    producer: Joi.alternatives().try(
      Joi.string().max(255),
      Joi.array().items(Joi.string().max(255))
    ).optional(),
    vintageMin: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    vintageMax: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    priceMin: Joi.number().positive().optional(),
    priceMax: Joi.number().positive().optional(),
    priceCurrency: Joi.string().valid(...currencies).optional(),
    featured: Joi.boolean().optional(),
    availability: Joi.boolean().optional()
  })
}

// Search suggestions validation schema
export const searchSuggestionsValidation = {
  query: Joi.object({
    q: Joi.string().required().min(1).max(255),
    limit: Joi.number().integer().min(1).max(20).optional()
  })
}

// Wine params validation schema
export const wineParamsValidation = {
  params: Joi.object({
    id: Joi.string().required()
  })
}

// Wine list query validation schema
export const wineListValidation = {
  query: Joi.object({
    page: Joi.number().integer().min(1).optional(),
    limit: Joi.number().integer().min(1).max(100).optional(),
    sortBy: Joi.string().valid('name', 'price', 'vintage', 'createdAt', 'rating').optional(),
    sortOrder: Joi.string().valid('asc', 'desc').optional(),
    category: Joi.alternatives().try(
      Joi.string().valid(...wineCategories),
      Joi.array().items(Joi.string().valid(...wineCategories))
    ).optional(),
    region: Joi.alternatives().try(
      Joi.string().max(255),
      Joi.array().items(Joi.string().max(255))
    ).optional(),
    producer: Joi.alternatives().try(
      Joi.string().max(255),
      Joi.array().items(Joi.string().max(255))
    ).optional(),
    vintageMin: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    vintageMax: Joi.number().integer().min(1800).max(new Date().getFullYear() + 5).optional(),
    priceMin: Joi.number().positive().optional(),
    priceMax: Joi.number().positive().optional(),
    priceCurrency: Joi.string().valid(...currencies).optional(),
    featured: Joi.boolean().optional(),
    availability: Joi.boolean().optional(),
    search: Joi.string().max(255).optional()
  })
}