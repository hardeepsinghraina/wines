'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import { ContentEditor } from './ContentEditor';
import { BulkContentManager } from './BulkContentManager';
import { ContentTemplateManager } from './ContentTemplateManager';
import { ContentScheduler } from './ContentScheduler';
import { ContentAnalyticsDashboard } from './ContentAnalyticsDashboard';
import { SEOOptimizationPanel } from './SEOOptimizationPanel';
import { MultilingualContentManager } from './MultilingualContentManager';
import { contentManagementAPI } from '../../lib/content-management-api';
import { ProductContent, ContentSearchRequest } from '../../../../shared/types/content-management';

interface ContentManagementDashboardProps {
  className?: string;
}

export const ContentManagementDashboard: React.FC<ContentManagementDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<string>('content');
  const [contents, setContents] = useState<ProductContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<ProductContent | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: [] as string[],
    language: [] as string[],
    category: [] as string[]
  });

  useEffect(() => {
    loadContents();
  }, [searchQuery, filters]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const searchRequest: ContentSearchRequest = {
        query: searchQuery,
        filters: {
          status: filters.status.length > 0 ? filters.status : undefined,
          language: filters.language.length > 0 ? filters.language : undefined,
          category: filters.category.length > 0 ? filters.category : undefined
        },
        sort: {
          field: 'lastModified',
          direction: 'desc'
        },
        pagination: {
          page: 1,
          limit: 50
        }
      };

      const response = await contentManagementAPI.searchContent(searchRequest);
      setContents(response.items);
    } catch (error) {
      console.error('Error loading contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContent = () => {
    setSelectedContent(null);
    setShowEditor(true);
  };

  const handleEditContent = (content: ProductContent) => {
    setSelectedContent(content);
    setShowEditor(true);
  };

  const handleDeleteContent = async (contentId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await contentManagementAPI.deleteContent(contentId);
        await loadContents();
      } catch (error) {
        console.error('Error deleting content:', error);
      }
    }
  };

  const handleContentSaved = () => {
    setShowEditor(false);
    loadContents();
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'archived': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tabs = [
    { id: 'content', label: 'Content Management', icon: '📝' },
    { id: 'templates', label: 'Templates', icon: '📋' },
    { id: 'bulk', label: 'Bulk Operations', icon: '📦' },
    { id: 'scheduler', label: 'Scheduler', icon: '⏰' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'seo', label: 'SEO Tools', icon: '🔍' },
    { id: 'multilingual', label: 'Multilingual', icon: '🌐' }
  ];

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`content-management-dashboard ${className}`}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Content Management System
        </h1>
        <p className="text-gray-600">
          Manage premium product content, templates, and multilingual support
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card className="p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-2">
                <select
                  multiple
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    status: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                >
                  <option value="draft">Draft</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="approved">Approved</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
                <Button onClick={handleCreateContent} className="bg-amber-600 hover:bg-amber-700">
                  Create Content
                </Button>
              </div>
            </div>
          </Card>

          {/* Content List */}
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Modified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {contents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {content.title.en || 'Untitled'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {content.productId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor('draft')}`}>
                          Draft
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        EN
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(content.lastModified).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditContent(content)}
                          className="text-amber-600 hover:text-amber-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteContent(content.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'templates' && <ContentTemplateManager />}
      {activeTab === 'bulk' && <BulkContentManager />}
      {activeTab === 'scheduler' && <ContentScheduler />}
      {activeTab === 'analytics' && <ContentAnalyticsDashboard />}
      {activeTab === 'seo' && <SEOOptimizationPanel />}
      {activeTab === 'multilingual' && <MultilingualContentManager />}

      {/* Content Editor Modal */}
      {showEditor && (
        <Modal
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          title={selectedContent ? 'Edit Content' : 'Create Content'}
          size="xl"
        >
          <ContentEditor
            content={selectedContent}
            onSave={handleContentSaved}
            onCancel={() => setShowEditor(false)}
          />
        </Modal>
      )}
    </div>
  );
};

export default ContentManagementDashboard;