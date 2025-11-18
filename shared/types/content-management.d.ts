export interface ContentVersion {
    id: string;
    version: number;
    content: ProductContent;
    status: 'draft' | 'pending_approval' | 'approved' | 'published' | 'archived';
    createdBy: string;
    createdAt: Date;
    approvedBy?: string;
    approvedAt?: Date;
    publishedAt?: Date;
    scheduledPublishAt?: Date;
    changeLog: string;
    language: string;
}
export interface ProductContent {
    id: string;
    productId: string;
    title: Record<string, string>;
    description: Record<string, string>;
    shortDescription: Record<string, string>;
    specifications: Record<string, any>;
    tastingNotes: Record<string, string>;
    pairingNotes: Record<string, string>;
    servingInstructions: Record<string, string>;
    storageInstructions: Record<string, string>;
    seoTitle: Record<string, string>;
    seoDescription: Record<string, string>;
    seoKeywords: Record<string, string[]>;
    metaTags: Record<string, Record<string, string>>;
    structuredData: Record<string, any>;
    currentVersion: number;
    publishedVersion?: number;
    templateId?: string;
    customFields: Record<string, any>;
    contentAnalytics: ContentAnalytics;
    lastModified: Date;
    lastModifiedBy: string;
}
export interface ContentAnalytics {
    views: number;
    engagement: number;
    conversionRate: number;
    searchRanking: Record<string, number>;
    performanceScore: number;
    lastAnalyzed: Date;
}
export interface ContentTemplate {
    id: string;
    name: string;
    description: string;
    category: 'wine' | 'spirits' | 'champagne' | 'gift-set' | 'accessories';
    fields: ContentTemplateField[];
    defaultValues: Record<string, any>;
    validationRules: Record<string, any>;
    isActive: boolean;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface ContentTemplateField {
    id: string;
    name: string;
    type: 'text' | 'textarea' | 'rich-text' | 'select' | 'multi-select' | 'number' | 'date' | 'boolean' | 'image' | 'file';
    label: Record<string, string>;
    placeholder: Record<string, string>;
    required: boolean;
    multiLanguage: boolean;
    validation: {
        minLength?: number;
        maxLength?: number;
        pattern?: string;
        options?: string[];
    };
    defaultValue?: any;
    helpText: Record<string, string>;
    order: number;
}
export interface ContentWorkflow {
    id: string;
    name: string;
    steps: ContentWorkflowStep[];
    isDefault: boolean;
    createdBy: string;
    createdAt: Date;
}
export interface ContentWorkflowStep {
    id: string;
    name: string;
    type: 'review' | 'approval' | 'publish' | 'schedule';
    assignedTo: string[];
    requiredApprovals: number;
    autoAdvance: boolean;
    order: number;
    conditions: Record<string, any>;
}
export interface ContentSchedule {
    id: string;
    contentId: string;
    versionId: string;
    scheduledAt: Date;
    action: 'publish' | 'unpublish' | 'archive';
    status: 'pending' | 'executed' | 'failed' | 'cancelled';
    executedAt?: Date;
    error?: string;
    createdBy: string;
    createdAt: Date;
}
export interface ContentCollaboration {
    id: string;
    contentId: string;
    versionId: string;
    userId: string;
    action: 'edit' | 'comment' | 'approve' | 'reject';
    data: any;
    timestamp: Date;
    ipAddress: string;
}
export interface ContentComment {
    id: string;
    contentId: string;
    versionId: string;
    userId: string;
    comment: string;
    fieldPath?: string;
    resolved: boolean;
    resolvedBy?: string;
    resolvedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export interface ContentBackup {
    id: string;
    contentId: string;
    versionId: string;
    backupData: any;
    backupType: 'manual' | 'automatic' | 'scheduled';
    createdBy: string;
    createdAt: Date;
    retentionUntil: Date;
    size: number;
    checksum: string;
}
export interface BulkContentOperation {
    id: string;
    type: 'import' | 'export' | 'update' | 'delete' | 'publish';
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    totalItems: number;
    processedItems: number;
    failedItems: number;
    errors: BulkOperationError[];
    fileUrl?: string;
    mapping?: Record<string, string>;
    options: Record<string, any>;
    createdBy: string;
    createdAt: Date;
    completedAt?: Date;
}
export interface BulkOperationError {
    row: number;
    field: string;
    error: string;
    value: any;
}
export interface SEOAnalysis {
    contentId: string;
    language: string;
    score: number;
    issues: SEOIssue[];
    recommendations: SEORecommendation[];
    keywords: KeywordAnalysis[];
    analyzedAt: Date;
}
export interface SEOIssue {
    type: 'error' | 'warning' | 'info';
    field: string;
    message: string;
    impact: 'high' | 'medium' | 'low';
}
export interface SEORecommendation {
    field: string;
    suggestion: string;
    priority: 'high' | 'medium' | 'low';
    estimatedImpact: string;
}
export interface KeywordAnalysis {
    keyword: string;
    density: number;
    position: number;
    competition: number;
    searchVolume: number;
    difficulty: number;
}
export interface ContentPerformanceMetrics {
    contentId: string;
    period: 'day' | 'week' | 'month' | 'quarter' | 'year';
    startDate: Date;
    endDate: Date;
    metrics: {
        pageViews: number;
        uniqueViews: number;
        averageTimeOnPage: number;
        bounceRate: number;
        conversionRate: number;
        searchImpressions: number;
        searchClicks: number;
        averagePosition: number;
        socialShares: number;
        backlinks: number;
    };
    topKeywords: string[];
    topReferrers: string[];
    deviceBreakdown: Record<string, number>;
    locationBreakdown: Record<string, number>;
}
export interface CreateContentRequest {
    productId: string;
    templateId?: string;
    content: Partial<ProductContent>;
    language: string;
}
export interface UpdateContentRequest {
    content: Partial<ProductContent>;
    changeLog: string;
    language: string;
}
export interface BulkImportRequest {
    file: File;
    mapping: Record<string, string>;
    options: {
        skipErrors: boolean;
        updateExisting: boolean;
        validateOnly: boolean;
    };
}
export interface ContentSearchRequest {
    query?: string;
    filters: {
        status?: string[];
        language?: string[];
        category?: string[];
        dateRange?: {
            start: Date;
            end: Date;
        };
        createdBy?: string[];
    };
    sort: {
        field: string;
        direction: 'asc' | 'desc';
    };
    pagination: {
        page: number;
        limit: number;
    };
}
export interface ContentSearchResponse {
    items: ProductContent[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
//# sourceMappingURL=content-management.d.ts.map