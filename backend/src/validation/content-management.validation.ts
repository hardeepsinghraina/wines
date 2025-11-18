import Joi from 'joi';

export const createContentSchema = Joi.object({
  productId: Joi.string().uuid().required(),
  templateId: Joi.string().uuid().optional(),
  language: Joi.string().length(2).required(),
  content: Joi.object({
    title: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    description: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    shortDescription: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    specifications: Joi.object().optional(),
    tastingNotes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    pairingNotes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    servingInstructions: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    storageInstructions: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoTitle: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoDescription: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoKeywords: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional(),
    metaTags: Joi.object().optional(),
    structuredData: Joi.object().optional(),
    customFields: Joi.object().optional()
  }).required()
});

export const updateContentSchema = Joi.object({
  changeLog: Joi.string().min(1).max(500).required(),
  language: Joi.string().length(2).required(),
  content: Joi.object({
    title: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    description: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    shortDescription: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    specifications: Joi.object().optional(),
    tastingNotes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    pairingNotes: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    servingInstructions: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    storageInstructions: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoTitle: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoDescription: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
    seoKeywords: Joi.object().pattern(Joi.string(), Joi.array().items(Joi.string())).optional(),
    metaTags: Joi.object().optional(),
    structuredData: Joi.object().optional(),
    customFields: Joi.object().optional()
  }).required()
});

export const searchContentSchema = Joi.object({
  query: Joi.string().optional(),
  filters: Joi.object({
    status: Joi.array().items(Joi.string().valid('draft', 'pending_approval', 'approved', 'published', 'archived')).optional(),
    language: Joi.array().items(Joi.string().length(2)).optional(),
    category: Joi.array().items(Joi.string()).optional(),
    dateRange: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required()
    }).optional(),
    createdBy: Joi.array().items(Joi.string().uuid()).optional()
  }).required(),
  sort: Joi.object({
    field: Joi.string().valid('title', 'createdAt', 'updatedAt', 'status', 'language').required(),
    direction: Joi.string().valid('asc', 'desc').required()
  }).required(),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).required(),
    limit: Joi.number().integer().min(1).max(100).required()
  }).required()
});

export const createTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).required(),
  category: Joi.string().valid('wine', 'spirits', 'champagne', 'gift-set', 'accessories').required(),
  fields: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('text', 'textarea', 'rich-text', 'select', 'multi-select', 'number', 'date', 'boolean', 'image', 'file').required(),
      label: Joi.object().pattern(Joi.string(), Joi.string()).required(),
      placeholder: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      required: Joi.boolean().required(),
      multiLanguage: Joi.boolean().required(),
      validation: Joi.object({
        minLength: Joi.number().integer().min(0).optional(),
        maxLength: Joi.number().integer().min(0).optional(),
        pattern: Joi.string().optional(),
        options: Joi.array().items(Joi.string()).optional()
      }).optional(),
      defaultValue: Joi.any().optional(),
      helpText: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      order: Joi.number().integer().min(0).required()
    })
  ).required(),
  defaultValues: Joi.object().optional(),
  validationRules: Joi.object().optional(),
  isActive: Joi.boolean().required()
});

export const bulkImportSchema = Joi.object({
  fileUrl: Joi.string().uri().required(),
  mapping: Joi.object().pattern(Joi.string(), Joi.string()).required(),
  options: Joi.object({
    skipErrors: Joi.boolean().required(),
    updateExisting: Joi.boolean().required(),
    validateOnly: Joi.boolean().required()
  }).required()
});

export const scheduleContentSchema = Joi.object({
  contentId: Joi.string().uuid().required(),
  versionId: Joi.string().uuid().required(),
  scheduledAt: Joi.date().greater('now').required(),
  action: Joi.string().valid('publish', 'unpublish', 'archive').required()
});

export const translateContentSchema = Joi.object({
  fromLanguage: Joi.string().length(2).required(),
  toLanguage: Joi.string().length(2).required()
});

export const rejectVersionSchema = Joi.object({
  reason: Joi.string().min(1).max(500).required()
});

export const createBackupSchema = Joi.object({
  contentId: Joi.string().uuid().required(),
  versionId: Joi.string().uuid().required()
});

export const bulkExportSchema = Joi.object({
  filters: Joi.object({
    status: Joi.array().items(Joi.string().valid('draft', 'pending_approval', 'approved', 'published', 'archived')).optional(),
    language: Joi.array().items(Joi.string().length(2)).optional(),
    category: Joi.array().items(Joi.string()).optional(),
    dateRange: Joi.object({
      start: Joi.date().required(),
      end: Joi.date().required()
    }).optional(),
    productIds: Joi.array().items(Joi.string().uuid()).optional()
  }).optional(),
  format: Joi.string().valid('csv', 'xlsx', 'json').required()
});

export const updateTemplateSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(500).optional(),
  category: Joi.string().valid('wine', 'spirits', 'champagne', 'gift-set', 'accessories').optional(),
  fields: Joi.array().items(
    Joi.object({
      id: Joi.string().required(),
      name: Joi.string().required(),
      type: Joi.string().valid('text', 'textarea', 'rich-text', 'select', 'multi-select', 'number', 'date', 'boolean', 'image', 'file').required(),
      label: Joi.object().pattern(Joi.string(), Joi.string()).required(),
      placeholder: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      required: Joi.boolean().required(),
      multiLanguage: Joi.boolean().required(),
      validation: Joi.object({
        minLength: Joi.number().integer().min(0).optional(),
        maxLength: Joi.number().integer().min(0).optional(),
        pattern: Joi.string().optional(),
        options: Joi.array().items(Joi.string()).optional()
      }).optional(),
      defaultValue: Joi.any().optional(),
      helpText: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
      order: Joi.number().integer().min(0).required()
    })
  ).optional(),
  defaultValues: Joi.object().optional(),
  validationRules: Joi.object().optional(),
  isActive: Joi.boolean().optional()
});