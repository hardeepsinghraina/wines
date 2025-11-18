'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { contentManagementAPI } from '../../lib/content-management-api';
import { ProductContent, ContentTemplate } from '../../../../shared/types/content-management';

interface ContentEditorProps {
  content?: ProductContent | null;
  onSave: () => void;
  onCancel: () => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  content,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    productId: '',
    templateId: '',
    language: 'en',
    title: { en: '' } as Record<string, string>,
    description: { en: '' } as Record<string, string>,
    shortDescription: { en: '' } as Record<string, string>,
    specifications: {},
    tastingNotes: { en: '' } as Record<string, string>,
    pairingNotes: { en: '' } as Record<string, string>,
    servingInstructions: { en: '' } as Record<string, string>,
    storageInstructions: { en: '' } as Record<string, string>,
    seoTitle: { en: '' } as Record<string, string>,
    seoDescription: { en: '' } as Record<string, string>,
    seoKeywords: { en: [] as string[] } as Record<string, string[]>,
    customFields: {}
  });
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [changeLog, setChangeLog] = useState('');

  useEffect(() => {
    loadTemplates();
    if (content) {
      setFormData({
        productId: content.productId,
        templateId: content.templateId || '',
        language: 'en',
        title: content.title,
        description: content.description,
        shortDescription: content.shortDescription,
        specifications: content.specifications,
        tastingNotes: content.tastingNotes,
        pairingNotes: content.pairingNotes,
        servingInstructions: content.servingInstructions,
        storageInstructions: content.storageInstructions,
        seoTitle: content.seoTitle,
        seoDescription: content.seoDescription,
        seoKeywords: content.seoKeywords,
        customFields: content.customFields
      });
    }
  }, [content]);

  const loadTemplates = async () => {
    try {
      const templateList = await contentManagementAPI.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleInputChange = (field: string, value: any, language: string = 'en') => {
    setFormData(prev => {
      if (field.includes('.')) {
        const [parentField, childField] = field.split('.');
        const parentValue = prev[parentField as keyof typeof prev];
        return {
          ...prev,
          [parentField]: {
            ...(typeof parentValue === 'object' && parentValue !== null ? parentValue : {}),
            [language]: value
          }
        };
      } else {
        const fieldValue = prev[field as keyof typeof prev];
        return {
          ...prev,
          [field]: typeof fieldValue === 'object' && fieldValue !== null
            ? { ...(fieldValue as Record<string, any>), [language]: value }
            : value
        };
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      if (content) {
        // Update existing content
        await contentManagementAPI.updateContent(content.id, {
          content: formData,
          changeLog: changeLog || 'Content updated',
          language: formData.language
        });
      } else {
        // Create new content
        await contentManagementAPI.createContent({
          productId: formData.productId,
          templateId: formData.templateId || undefined,
          content: formData,
          language: formData.language
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Error saving content:', error);
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: '📝' },
    { id: 'details', label: 'Product Details', icon: '🍷' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
    { id: 'custom', label: 'Custom Fields', icon: '⚙️' }
  ];

  return (
    <div className="content-editor max-h-[80vh] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {content ? 'Edit Content' : 'Create Content'}
        </h2>
        {content && (
          <div className="text-sm text-gray-600">
            Product ID: {content.productId} | Version: {content.currentVersion}
          </div>
        )}
      </div>

      {/* Change Log for Updates */}
      {content && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Change Log *
          </label>
          <input
            type="text"
            value={changeLog}
            onChange={(e) => setChangeLog(e.target.value)}
            placeholder="Describe what you changed..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            required
          />
        </div>
      )}

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
      <div className="space-y-6">
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product ID *
                </label>
                <input
                  type="text"
                  value={formData.productId}
                  onChange={(e) => handleInputChange('productId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                  disabled={!!content}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template
                </label>
                <select
                  value={formData.templateId}
                  onChange={(e) => handleInputChange('templateId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">No Template</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title.en || ''}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Short Description
              </label>
              <textarea
                value={formData.shortDescription.en || ''}
                onChange={(e) => handleInputChange('shortDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={formData.description.en || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tasting Notes
              </label>
              <textarea
                value={formData.tastingNotes.en || ''}
                onChange={(e) => handleInputChange('tastingNotes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Describe the taste, aroma, and characteristics..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pairing Notes
              </label>
              <textarea
                value={formData.pairingNotes.en || ''}
                onChange={(e) => handleInputChange('pairingNotes', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Recommended food pairings..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serving Instructions
              </label>
              <textarea
                value={formData.servingInstructions.en || ''}
                onChange={(e) => handleInputChange('servingInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="How to serve this product..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Storage Instructions
              </label>
              <textarea
                value={formData.storageInstructions.en || ''}
                onChange={(e) => handleInputChange('storageInstructions', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="How to store this product..."
              />
            </div>
          </div>
        )}

        {activeTab === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Title
              </label>
              <input
                type="text"
                value={formData.seoTitle.en || ''}
                onChange={(e) => handleInputChange('seoTitle', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Optimized title for search engines..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Description
              </label>
              <textarea
                value={formData.seoDescription.en || ''}
                onChange={(e) => handleInputChange('seoDescription', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Meta description for search engines..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SEO Keywords
              </label>
              <input
                type="text"
                value={(formData.seoKeywords.en || []).join(', ')}
                onChange={(e) => handleInputChange('seoKeywords', e.target.value.split(',').map(k => k.trim()).filter(k => k))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="keyword1, keyword2, keyword3..."
              />
              <p className="text-sm text-gray-500 mt-1">
                Separate keywords with commas
              </p>
            </div>
          </div>
        )}

        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="text-center py-8 text-gray-500">
              <p>Custom fields will be displayed here based on the selected template.</p>
              <p className="text-sm mt-2">Select a template to see custom field options.</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
        <Button
          onClick={onCancel}
          variant="outline"
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={Boolean(saving || (!content && !formData.productId) || (content && !changeLog))}
          className="bg-amber-600 hover:bg-amber-700"
        >
          {saving ? <Loading size="sm" /> : (content ? 'Update Content' : 'Create Content')}
        </Button>
      </div>
    </div>
  );
};

export default ContentEditor;