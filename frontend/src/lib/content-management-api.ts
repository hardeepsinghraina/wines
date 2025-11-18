import { api } from './api';
import {
  ProductContent,
  ContentVersion,
  ContentTemplate,
  BulkContentOperation,
  ContentSearchRequest,
  ContentSearchResponse,
  SEOAnalysis,
  ContentPerformanceMetrics,
  ContentSchedule,
  ContentBackup,
  CreateContentRequest,
  UpdateContentRequest,
  BulkImportRequest
} from '../../../shared/types/content-management';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export class ContentManagementAPI {
  private baseUrl = '/api/content-management';

  // Content CRUD Operations
  async createContent(data: CreateContentRequest): Promise<ProductContent> {
    const response = await api.post<ApiResponse<ProductContent>>(`${this.baseUrl}/content`, data);
    return response.data;
  }

  async updateContent(contentId: string, data: UpdateContentRequest): Promise<ProductContent> {
    const response = await api.put<ApiResponse<ProductContent>>(`${this.baseUrl}/content/${contentId}`, data);
    return response.data;
  }

  async getContent(contentId: string): Promise<ProductContent> {
    const response = await api.get<ApiResponse<ProductContent>>(`${this.baseUrl}/content/${contentId}`);
    return response.data;
  }

  async searchContent(request: ContentSearchRequest): Promise<ContentSearchResponse> {
    const response = await api.post<ApiResponse<ContentSearchResponse>>(`${this.baseUrl}/content/search`, request);
    return response.data;
  }

  async deleteContent(contentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/content/${contentId}`);
  }

  // Version Management
  async getVersionHistory(contentId: string): Promise<ContentVersion[]> {
    const response = await api.get<ApiResponse<ContentVersion[]>>(`${this.baseUrl}/content/${contentId}/versions`);
    return response.data;
  }

  async approveVersion(versionId: string): Promise<ContentVersion> {
    const response = await api.post<ApiResponse<ContentVersion>>(`${this.baseUrl}/versions/${versionId}/approve`);
    return response.data;
  }

  async rejectVersion(versionId: string, reason: string): Promise<void> {
    await api.post(`${this.baseUrl}/versions/${versionId}/reject`, { reason });
  }

  // Template Management
  async createTemplate(template: Omit<ContentTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContentTemplate> {
    const response = await api.post<ApiResponse<ContentTemplate>>(`${this.baseUrl}/templates`, template);
    return response.data;
  }

  async getTemplates(category?: string): Promise<ContentTemplate[]> {
    const endpoint = category ? `${this.baseUrl}/templates?category=${encodeURIComponent(category)}` : `${this.baseUrl}/templates`;
    const response = await api.get<ApiResponse<ContentTemplate[]>>(endpoint);
    return response.data;
  }

  async updateTemplate(templateId: string, template: Partial<ContentTemplate>): Promise<ContentTemplate> {
    const response = await api.put<ApiResponse<ContentTemplate>>(`${this.baseUrl}/templates/${templateId}`, template);
    return response.data;
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/templates/${templateId}`);
  }

  // Bulk Operations
  async createBulkImport(data: BulkImportRequest): Promise<BulkContentOperation> {
    const formData = new FormData();
    formData.append('file', data.file);
    formData.append('mapping', JSON.stringify(data.mapping));
    formData.append('options', JSON.stringify(data.options));

    const response = await api.upload<ApiResponse<BulkContentOperation>>(`${this.baseUrl}/bulk/import`, formData);
    return response.data;
  }

  async createBulkExport(filters: any, format: 'csv' | 'xlsx' | 'json'): Promise<BulkContentOperation> {
    const response = await api.post<ApiResponse<BulkContentOperation>>(`${this.baseUrl}/bulk/export`, { filters, format });
    return response.data;
  }

  async getBulkOperationStatus(operationId: string): Promise<BulkContentOperation> {
    const response = await api.get<ApiResponse<BulkContentOperation>>(`${this.baseUrl}/bulk/${operationId}/status`);
    return response.data;
  }

  // SEO Analysis
  async analyzeSEO(contentId: string, language: string = 'en'): Promise<SEOAnalysis> {
    const response = await api.post<ApiResponse<SEOAnalysis>>(`${this.baseUrl}/content/${contentId}/seo-analysis?language=${encodeURIComponent(language)}`, null);
    return response.data;
  }

  // Content Analytics
  async getContentPerformance(contentId: string, period: string = 'month'): Promise<ContentPerformanceMetrics> {
    const response = await api.get<ApiResponse<ContentPerformanceMetrics>>(`${this.baseUrl}/content/${contentId}/performance?period=${encodeURIComponent(period)}`);
    return response.data;
  }

  // Scheduling
  async scheduleContent(data: {
    contentId: string;
    versionId: string;
    scheduledAt: Date;
    action: 'publish' | 'unpublish' | 'archive';
  }): Promise<ContentSchedule> {
    const response = await api.post<ApiResponse<ContentSchedule>>(`${this.baseUrl}/content/schedule`, data);
    return response.data;
  }

  async getScheduledContent(): Promise<ContentSchedule[]> {
    const response = await api.get<ApiResponse<ContentSchedule[]>>(`${this.baseUrl}/content/scheduled`);
    return response.data;
  }

  async cancelScheduledContent(scheduleId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/content/scheduled/${scheduleId}`);
  }

  // Backup and Recovery
  async createBackup(contentId: string, versionId: string): Promise<ContentBackup> {
    const response = await api.post<ApiResponse<ContentBackup>>(`${this.baseUrl}/backup`, { contentId, versionId });
    return response.data;
  }

  async restoreFromBackup(backupId: string): Promise<ProductContent> {
    const response = await api.post<ApiResponse<ProductContent>>(`${this.baseUrl}/restore/${backupId}`);
    return response.data;
  }

  async getBackups(contentId?: string): Promise<ContentBackup[]> {
    const endpoint = contentId ? `${this.baseUrl}/backups?contentId=${encodeURIComponent(contentId)}` : `${this.baseUrl}/backups`;
    const response = await api.get<ApiResponse<ContentBackup[]>>(endpoint);
    return response.data;
  }

  // Multilingual Support
  async getAvailableLanguages(): Promise<string[]> {
    const response = await api.get<ApiResponse<string[]>>(`${this.baseUrl}/languages`);
    return response.data;
  }

  async translateContent(contentId: string, fromLanguage: string, toLanguage: string): Promise<ProductContent> {
    const response = await api.post<ApiResponse<ProductContent>>(`${this.baseUrl}/content/${contentId}/translate`, {
      fromLanguage,
      toLanguage
    });
    return response.data;
  }

  // Content Collaboration
  async addComment(contentId: string, versionId: string, comment: string, fieldPath?: string): Promise<void> {
    await api.post(`${this.baseUrl}/content/${contentId}/comments`, {
      versionId,
      comment,
      fieldPath
    });
  }

  async getComments(contentId: string, versionId?: string): Promise<any[]> {
    const endpoint = versionId ? `${this.baseUrl}/content/${contentId}/comments?versionId=${encodeURIComponent(versionId)}` : `${this.baseUrl}/content/${contentId}/comments`;
    const response = await api.get<ApiResponse<any[]>>(endpoint);
    return response.data;
  }

  async resolveComment(commentId: string): Promise<void> {
    await api.post(`${this.baseUrl}/comments/${commentId}/resolve`);
  }

  // Content Workflow
  async getWorkflows(): Promise<any[]> {
    const response = await api.get<ApiResponse<any[]>>(`${this.baseUrl}/workflows`);
    return response.data;
  }

  async createWorkflow(workflow: any): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`${this.baseUrl}/workflows`, workflow);
    return response.data;
  }

  async updateWorkflow(workflowId: string, workflow: any): Promise<any> {
    const response = await api.put<ApiResponse<any>>(`${this.baseUrl}/workflows/${workflowId}`, workflow);
    return response.data;
  }

  async deleteWorkflow(workflowId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/workflows/${workflowId}`);
  }

  // Content Publishing
  async publishContent(contentId: string, versionId: string): Promise<void> {
    await api.post(`${this.baseUrl}/content/${contentId}/publish`, { versionId });
  }

  async unpublishContent(contentId: string): Promise<void> {
    await api.post(`${this.baseUrl}/content/${contentId}/unpublish`);
  }

  async archiveContent(contentId: string): Promise<void> {
    await api.post(`${this.baseUrl}/content/${contentId}/archive`);
  }

  // Content Duplication
  async duplicateContent(contentId: string, newProductId?: string): Promise<ProductContent> {
    const response = await api.post<ApiResponse<ProductContent>>(`${this.baseUrl}/content/${contentId}/duplicate`, { newProductId });
    return response.data;
  }

  // Content Validation
  async validateContent(contentId: string, language: string): Promise<any> {
    const response = await api.post<ApiResponse<any>>(`${this.baseUrl}/content/${contentId}/validate`, { language });
    return response.data;
  }

  // Content Preview
  async previewContent(contentId: string, versionId: string): Promise<string> {
    const response = await api.get<ApiResponse<string>>(`${this.baseUrl}/content/${contentId}/preview/${versionId}`);
    return response.data;
  }

  // Content Comparison
  async compareVersions(contentId: string, version1: number, version2: number): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`${this.baseUrl}/content/${contentId}/compare?version1=${version1}&version2=${version2}`);
    return response.data;
  }
}

export const contentManagementAPI = new ContentManagementAPI();