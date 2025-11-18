import Joi from 'joi'

export const createProductSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Product name is required',
      'string.max': 'Product name must be less than 255 characters',
      'any.required': 'Product name is required'
    }),
  producer: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Producer is required',
      'string.max': 'Producer must be less than 255 characters',
      'any.required': 'Producer is required'
    }),
  region: Joi.string()
    .min(1)
    .max(255)
    .required()
    .messages({
      'string.min': 'Region is required',
      'string.max': 'Region must be less than 255 characters',
      'any.required': 'Region is required'
    }),
  vintage: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .required()
    .messages({
      'number.base': 'Vintage must be a number',
      'number.integer': 'Vintage must be an integer',
      'number.min': 'Vintage must be after 1800',
      'number.max': 'Vintage cannot be more than 5 years in the future',
      'any.required': 'Vintage is required'
    }),
  category: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'Category is required',
      'string.max': 'Category must be less than 100 characters',
      'any.required': 'Category is required'
    }),
  description: Joi.string()
    .min(1)
    .max(2000)
    .required()
    .messages({
      'string.min': 'Description is required',
      'string.max': 'Description must be less than 2000 characters',
      'any.required': 'Description is required'
    }),
  tastingNotes: Joi.string()
    .max(1000)
    .optional()
    .messages({
      'string.max': 'Tasting notes must be less than 1000 characters'
    }),
  alcoholContent: Joi.number()
    .min(0)
    .max(100)
    .required()
    .messages({
      'number.base': 'Alcohol content must be a number',
      'number.min': 'Alcohol content cannot be negative',
      'number.max': 'Alcohol content cannot exceed 100%',
      'any.required': 'Alcohol content is required'
    }),
  bottleSize: Joi.string()
    .max(50)
    .optional()
    .default('750ml')
    .messages({
      'string.max': 'Bottle size must be less than 50 characters'
    }),
  sku: Joi.string()
    .min(1)
    .max(100)
    .required()
    .messages({
      'string.min': 'SKU is required',
      'string.max': 'SKU must be less than 100 characters',
      'any.required': 'SKU is required'
    }),
  isActive: Joi.boolean()
    .optional()
    .default(true),
  isFeatured: Joi.boolean()
    .optional()
    .default(false),
  isNftAvailable: Joi.boolean()
    .optional()
    .default(false),
  prices: Joi.array()
    .items(
      Joi.object({
        currency: Joi.string()
          .required()
          .messages({
            'any.required': 'Currency is required for price'
          }),
        price: Joi.number()
          .positive()
          .required()
          .messages({
            'number.positive': 'Price must be positive',
            'any.required': 'Price is required'
          }),
        isActive: Joi.boolean()
          .optional()
          .default(true)
      })
    )
    .optional(),
  inventory: Joi.array()
    .items(
      Joi.object({
        quantity: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity cannot be negative',
            'any.required': 'Quantity is required'
          }),
        reservedQty: Joi.number()
          .integer()
          .min(0)
          .optional()
          .default(0)
          .messages({
            'number.integer': 'Reserved quantity must be an integer',
            'number.min': 'Reserved quantity cannot be negative'
          }),
        location: Joi.string()
          .max(100)
          .optional()
          .default('main_warehouse')
          .messages({
            'string.max': 'Location must be less than 100 characters'
          })
      })
    )
    .optional(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string()
          .uri()
          .required()
          .messages({
            'string.uri': 'Image URL must be valid',
            'any.required': 'Image URL is required'
          }),
        altText: Joi.string()
          .max(255)
          .optional()
          .messages({
            'string.max': 'Alt text must be less than 255 characters'
          })
      })
    )
    .optional(),
  specifications: Joi.object({
    grapeVariety: Joi.array()
      .items(Joi.string())
      .optional(),
    servingTemp: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Serving temperature must be less than 100 characters'
      }),
    agingPotential: Joi.string()
      .max(100)
      .optional()
      .messages({
        'string.max': 'Aging potential must be less than 100 characters'
      }),
    foodPairing: Joi.string()
      .max(500)
      .optional()
      .messages({
        'string.max': 'Food pairing must be less than 500 characters'
      }),
    awards: Joi.array()
      .items(Joi.string())
      .optional()
  }).optional()
})

export const updateProductSchema = Joi.object({
  name: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Product name cannot be empty',
      'string.max': 'Product name must be less than 255 characters'
    }),
  producer: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Producer cannot be empty',
      'string.max': 'Producer must be less than 255 characters'
    }),
  region: Joi.string()
    .min(1)
    .max(255)
    .optional()
    .messages({
      'string.min': 'Region cannot be empty',
      'string.max': 'Region must be less than 255 characters'
    }),
  vintage: Joi.number()
    .integer()
    .min(1800)
    .max(new Date().getFullYear() + 5)
    .optional()
    .messages({
      'number.base': 'Vintage must be a number',
      'number.integer': 'Vintage must be an integer',
      'number.min': 'Vintage must be after 1800',
      'number.max': 'Vintage cannot be more than 5 years in the future'
    }),
  category: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Category cannot be empty',
      'string.max': 'Category must be less than 100 characters'
    }),
  description: Joi.string()
    .min(1)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Description cannot be empty',
      'string.max': 'Description must be less than 2000 characters'
    }),
  tastingNotes: Joi.string()
    .max(1000)
    .optional()
    .allow('')
    .messages({
      'string.max': 'Tasting notes must be less than 1000 characters'
    }),
  alcoholContent: Joi.number()
    .min(0)
    .max(100)
    .optional()
    .messages({
      'number.base': 'Alcohol content must be a number',
      'number.min': 'Alcohol content cannot be negative',
      'number.max': 'Alcohol content cannot exceed 100%'
    }),
  bottleSize: Joi.string()
    .max(50)
    .optional()
    .messages({
      'string.max': 'Bottle size must be less than 50 characters'
    }),
  sku: Joi.string()
    .min(1)
    .max(100)
    .optional()
    .messages({
      'string.min': 'SKU cannot be empty',
      'string.max': 'SKU must be less than 100 characters'
    }),
  isActive: Joi.boolean().optional(),
  isFeatured: Joi.boolean().optional(),
  isNftAvailable: Joi.boolean().optional(),
  prices: Joi.array()
    .items(
      Joi.object({
        currency: Joi.string().required(),
        price: Joi.number().positive().required(),
        isActive: Joi.boolean().optional().default(true)
      })
    )
    .optional(),
  inventory: Joi.array()
    .items(
      Joi.object({
        quantity: Joi.number().integer().min(0).required(),
        reservedQty: Joi.number().integer().min(0).optional().default(0),
        location: Joi.string().max(100).optional().default('main_warehouse')
      })
    )
    .optional(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().max(255).optional()
      })
    )
    .optional(),
  specifications: Joi.object({
    grapeVariety: Joi.array().items(Joi.string()).optional(),
    servingTemp: Joi.string().max(100).optional().allow(''),
    agingPotential: Joi.string().max(100).optional().allow(''),
    foodPairing: Joi.string().max(500).optional().allow(''),
    awards: Joi.array().items(Joi.string()).optional()
  }).optional()
})

export const bulkImportSchema = Joi.object({
  products: Joi.array()
    .items(createProductSchema)
    .min(1)
    .max(100)
    .required()
    .messages({
      'array.min': 'At least one product is required',
      'array.max': 'Cannot import more than 100 products at once',
      'any.required': 'Products array is required'
    })
})

export const updateInventorySchema = Joi.object({
  inventory: Joi.array()
    .items(
      Joi.object({
        quantity: Joi.number()
          .integer()
          .min(0)
          .required()
          .messages({
            'number.integer': 'Quantity must be an integer',
            'number.min': 'Quantity cannot be negative',
            'any.required': 'Quantity is required'
          }),
        reservedQty: Joi.number()
          .integer()
          .min(0)
          .optional()
          .default(0)
          .messages({
            'number.integer': 'Reserved quantity must be an integer',
            'number.min': 'Reserved quantity cannot be negative'
          }),
        location: Joi.string()
          .max(100)
          .optional()
          .default('main_warehouse')
          .messages({
            'string.max': 'Location must be less than 100 characters'
          }),
        lastRestocked: Joi.date()
          .optional()
          .messages({
            'date.base': 'Last restocked must be a valid date'
          })
      })
    )
    .min(1)
    .required()
    .messages({
      'array.min': 'At least one inventory entry is required',
      'any.required': 'Inventory array is required'
    })
})

export const productQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.integer': 'Page must be an integer',
      'number.min': 'Page must be at least 1'
    }),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
    .messages({
      'number.integer': 'Limit must be an integer',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100'
    }),
  search: Joi.string()
    .max(255)
    .optional()
    .messages({
      'string.max': 'Search term must be less than 255 characters'
    }),
  category: Joi.string()
    .max(100)
    .optional()
    .messages({
      'string.max': 'Category must be less than 100 characters'
    }),
  isActive: Joi.string()
    .valid('true', 'false')
    .optional()
    .messages({
      'any.only': 'isActive must be "true" or "false"'
    }),
  sortBy: Joi.string()
    .valid('name', 'producer', 'region', 'vintage', 'category', 'createdAt', 'updatedAt')
    .optional()
    .default('createdAt')
    .messages({
      'any.only': 'sortBy must be one of: name, producer, region, vintage, category, createdAt, updatedAt'
    }),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
    .messages({
      'any.only': 'sortOrder must be "asc" or "desc"'
    })
})