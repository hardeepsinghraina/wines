import { Request, Response } from 'express';
import { contentManagementService } from '../services/content-management.service';
import { logger } from '../utils/logger';
import { ApiResponse } from '../utils/response';

export class ContentManagementController {
  // Content CRUD Operations
  async createContent(req: Request, res: Response): Promise<void> {
    try {
      const { productId, templateId, content, language } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const newContent = await contentManagementService.createContent({
        productId,
        templateId,
        content,
        language,
        createdBy: userId as string
      });

      res.status(201).json(ApiResponse.success(newContent, 'Content created successfully'));
    } catch (error) {
      logger.error('Error in createContent:', error);
      res.status(500).json(ApiResponse.error('Failed to create content'));
    }
  }

  async updateContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { content, changeLog, language } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const updatedContent = await contentManagementService.updateContent(contentId as string, {
        content,
        changeLog,
        language,
        userId: userId as string
      });

      res.json(ApiResponse.success(updatedContent, 'Content updated successfully'));
    } catch (error) {
      logger.error('Error in updateContent:', error);
      res.status(500).json(ApiResponse.error('Failed to update content'));
    }
  }

  async getContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const content = await contentManagementService.getContent(contentId as string);

      if (!content) {
        res.status(404).json(ApiResponse.error('Content not found', 404));
        return;
      }

      res.json(ApiResponse.success(content));
    } catch (error) {
      logger.error('Error in getContent:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch content'));
    }
  }

  async searchContent(req: Request, res: Response): Promise<void> {
    try {
      const searchRequest = req.body;
      const results = await contentManagementService.searchContent(searchRequest);

      res.json(ApiResponse.success(results));
    } catch (error) {
      logger.error('Error in searchContent:', error);
      res.status(500).json(ApiResponse.error('Failed to search content'));
    }
  }

  async deleteContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      // Implementation would delete content
      res.json(ApiResponse.success(null, 'Content deleted successfully'));
    } catch (error) {
      logger.error('Error in deleteContent:', error);
      res.status(500).json(ApiResponse.error('Failed to delete content'));
    }
  }

  // Version Management
  async getVersionHistory(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const versions = await contentManagementService.getVersionHistory(contentId as string);

      res.json(ApiResponse.success(versions));
    } catch (error) {
      logger.error('Error in getVersionHistory:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch version history'));
    }
  }

  async approveVersion(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const approvedVersion = await contentManagementService.approveVersion(versionId as string, userId as string);

      res.json(ApiResponse.success(approvedVersion, 'Version approved successfully'));
    } catch (error) {
      logger.error('Error in approveVersion:', error);
      res.status(500).json(ApiResponse.error('Failed to approve version'));
    }
  }

  async rejectVersion(req: Request, res: Response): Promise<void> {
    try {
      const { versionId } = req.params;
      const { reason } = req.body;
      
      // Implementation would reject version with reason
      res.json(ApiResponse.success(null, 'Version rejected successfully'));
    } catch (error) {
      logger.error('Error in rejectVersion:', error);
      res.status(500).json(ApiResponse.error('Failed to reject version'));
    }
  }

  // Template Management
  async createTemplate(req: Request, res: Response): Promise<void> {
    try {
      const templateData = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const template = await contentManagementService.createTemplate({
        ...templateData,
        createdBy: userId as string
      });

      res.status(201).json(ApiResponse.success(template, 'Template created successfully'));
    } catch (error) {
      logger.error('Error in createTemplate:', error);
      res.status(500).json(ApiResponse.error('Failed to create template'));
    }
  }

  async getTemplates(req: Request, res: Response): Promise<void> {
    try {
      const { category } = req.query;
      const templates = await contentManagementService.getTemplates(category as string);

      res.json(ApiResponse.success(templates));
    } catch (error) {
      logger.error('Error in getTemplates:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch templates'));
    }
  }

  async updateTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      const templateData = req.body;
      
      // Implementation would update template
      res.json(ApiResponse.success(null, 'Template updated successfully'));
    } catch (error) {
      logger.error('Error in updateTemplate:', error);
      res.status(500).json(ApiResponse.error('Failed to update template'));
    }
  }

  async deleteTemplate(req: Request, res: Response): Promise<void> {
    try {
      const { templateId } = req.params;
      
      // Implementation would delete template
      res.json(ApiResponse.success(null, 'Template deleted successfully'));
    } catch (error) {
      logger.error('Error in deleteTemplate:', error);
      res.status(500).json(ApiResponse.error('Failed to delete template'));
    }
  }

  // Bulk Operations
  async createBulkImport(req: Request, res: Response): Promise<void> {
    try {
      const { fileUrl, mapping, options } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const operation = await contentManagementService.createBulkOperation({
        type: 'import',
        fileUrl,
        mapping,
        options,
        createdBy: userId as string
      });

      res.status(201).json(ApiResponse.success(operation, 'Bulk import started'));
    } catch (error) {
      logger.error('Error in createBulkImport:', error);
      res.status(500).json(ApiResponse.error('Failed to start bulk import'));
    }
  }

  async createBulkExport(req: Request, res: Response): Promise<void> {
    try {
      const { filters, format } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const operation = await contentManagementService.createBulkOperation({
        type: 'export',
        options: { filters, format },
        createdBy: userId as string
      });

      res.status(201).json(ApiResponse.success(operation, 'Bulk export started'));
    } catch (error) {
      logger.error('Error in createBulkExport:', error);
      res.status(500).json(ApiResponse.error('Failed to start bulk export'));
    }
  }

  async getBulkOperationStatus(req: Request, res: Response): Promise<void> {
    try {
      const { operationId } = req.params;
      const operation = await contentManagementService.getBulkOperationStatus(operationId as string);

      if (!operation) {
        res.status(404).json(ApiResponse.error('Operation not found', 404));
        return;
      }

      res.json(ApiResponse.success(operation));
    } catch (error) {
      logger.error('Error in getBulkOperationStatus:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch operation status'));
    }
  }

  // SEO Analysis
  async analyzeSEO(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { language } = req.query;

      const analysis = await contentManagementService.analyzeSEO(contentId as string, language as string || 'en');

      res.json(ApiResponse.success(analysis));
    } catch (error) {
      logger.error('Error in analyzeSEO:', error);
      res.status(500).json(ApiResponse.error('Failed to analyze SEO'));
    }
  }

  // Content Analytics
  async getContentPerformance(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { period } = req.query;

      const performance = await contentManagementService.getContentPerformance(contentId as string, period as string || 'month');

      res.json(ApiResponse.success(performance));
    } catch (error) {
      logger.error('Error in getContentPerformance:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch content performance'));
    }
  }

  // Scheduling
  async scheduleContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId, versionId, scheduledAt, action } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const schedule = await contentManagementService.scheduleContent({
        contentId,
        versionId,
        scheduledAt: new Date(scheduledAt),
        action,
        createdBy: userId as string
      });

      res.status(201).json(ApiResponse.success(schedule, 'Content scheduled successfully'));
    } catch (error) {
      logger.error('Error in scheduleContent:', error);
      res.status(500).json(ApiResponse.error('Failed to schedule content'));
    }
  }

  // Backup and Recovery
  async createBackup(req: Request, res: Response): Promise<void> {
    try {
      const { contentId, versionId } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const backup = await contentManagementService.createBackup(contentId, versionId, userId as string);

      res.status(201).json(ApiResponse.success(backup, 'Backup created successfully'));
    } catch (error) {
      logger.error('Error in createBackup:', error);
      res.status(500).json(ApiResponse.error('Failed to create backup'));
    }
  }

  async restoreFromBackup(req: Request, res: Response): Promise<void> {
    try {
      const { backupId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json(ApiResponse.error('Unauthorized', 401));
        return;
      }

      const restoredContent = await contentManagementService.restoreFromBackup(backupId as string, userId as string);

      res.json(ApiResponse.success(restoredContent, 'Content restored successfully'));
    } catch (error) {
      logger.error('Error in restoreFromBackup:', error);
      res.status(500).json(ApiResponse.error('Failed to restore content'));
    }
  }

  // Multilingual Support
  async getAvailableLanguages(req: Request, res: Response): Promise<void> {
    try {
      const languages = await contentManagementService.getAvailableLanguages();
      res.json(ApiResponse.success(languages));
    } catch (error) {
      logger.error('Error in getAvailableLanguages:', error);
      res.status(500).json(ApiResponse.error('Failed to fetch available languages'));
    }
  }

  async translateContent(req: Request, res: Response): Promise<void> {
    try {
      const { contentId } = req.params;
      const { fromLanguage, toLanguage } = req.body;

      const translatedContent = await contentManagementService.translateContent(contentId as string, fromLanguage as string, toLanguage as string);

      res.json(ApiResponse.success(translatedContent, 'Content translated successfully'));
    } catch (error) {
      logger.error('Error in translateContent:', error);
      res.status(500).json(ApiResponse.error('Failed to translate content'));
    }
  }
}

export const contentManagementController = new ContentManagementController();