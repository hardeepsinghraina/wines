import { Router } from 'express';
import { contentManagementController } from '../controllers/content-management.controller';
import { authenticateToken } from '../middleware/auth';
import { authenticateAdmin } from '../middleware/admin-auth';
import { validateRequest } from '../middleware/joi-validation';
import { 
  createContentSchema,
  updateContentSchema,
  searchContentSchema,
  createTemplateSchema,
  bulkImportSchema,
  scheduleContentSchema,
  translateContentSchema
} from '../validation/content-management.validation';

const router = Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Content CRUD Operations
router.post('/content', validateRequest(createContentSchema), contentManagementController.createContent);
router.put('/content/:contentId', validateRequest(updateContentSchema), contentManagementController.updateContent);
router.get('/content/:contentId', contentManagementController.getContent);
router.post('/content/search', validateRequest(searchContentSchema), contentManagementController.searchContent);
router.delete('/content/:contentId', authenticateAdmin, contentManagementController.deleteContent);

// Version Management
router.get('/content/:contentId/versions', contentManagementController.getVersionHistory);
router.post('/versions/:versionId/approve', authenticateAdmin, contentManagementController.approveVersion);
router.post('/versions/:versionId/reject', authenticateAdmin, contentManagementController.rejectVersion);

// Template Management (Admin only)
router.post('/templates', authenticateAdmin, validateRequest(createTemplateSchema), contentManagementController.createTemplate);
router.get('/templates', contentManagementController.getTemplates);
router.put('/templates/:templateId', authenticateAdmin, contentManagementController.updateTemplate);
router.delete('/templates/:templateId', authenticateAdmin, contentManagementController.deleteTemplate);

// Bulk Operations (Admin only)
router.post('/bulk/import', authenticateAdmin, validateRequest(bulkImportSchema), contentManagementController.createBulkImport);
router.post('/bulk/export', authenticateAdmin, contentManagementController.createBulkExport);
router.get('/bulk/:operationId/status', contentManagementController.getBulkOperationStatus);

// SEO Analysis
router.post('/content/:contentId/seo-analysis', contentManagementController.analyzeSEO);

// Content Analytics
router.get('/content/:contentId/performance', contentManagementController.getContentPerformance);

// Scheduling
router.post('/content/schedule', validateRequest(scheduleContentSchema), contentManagementController.scheduleContent);

// Backup and Recovery (Admin only)
router.post('/backup', authenticateAdmin, contentManagementController.createBackup);
router.post('/restore/:backupId', authenticateAdmin, contentManagementController.restoreFromBackup);

// Multilingual Support
router.get('/languages', contentManagementController.getAvailableLanguages);
router.post('/content/:contentId/translate', validateRequest(translateContentSchema), contentManagementController.translateContent);

export { router as contentManagementRoutes };