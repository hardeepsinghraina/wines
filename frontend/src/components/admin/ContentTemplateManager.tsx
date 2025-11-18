'use client'

import React, { useState, useEffect } from 'react'
import { contentManagementAPI } from '@/lib/content-management-api'
import { 
  ContentTemplate, 
  ContentTemplateField 
} from '@shared/types/content-management'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { Loading } from '@/components/ui/Loading'

interface ContentTemplateManagerProps {
  className?: string;
}

export const ContentTemplateManager: React.FC<ContentTemplateManagerProps> = ({
  className = ''
}) => {
  const [templates, setTemplates] = useState<ContentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContentTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    description: '',
    category: 'wine' as 'wine' | 'spirits' | 'champagne' | 'gift-set' | 'accessories',
    fields: [] as ContentTemplateField[],
    isActive: true,
    defaultValues: {} as Record<string, any>,
    validationRules: {} as Record<string, any>,
    createdBy: 'admin'
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const templateList = await contentManagementAPI.getTemplates();
      setTemplates(templateList);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: '',
      description: '',
      category: 'wine',
      fields: [],
      isActive: true,
      defaultValues: {},
      validationRules: {},
      createdBy: 'admin'
    });
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: ContentTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      description: template.description,
      category: template.category,
      fields: template.fields,
      isActive: template.isActive,
      defaultValues: template.defaultValues || {},
      validationRules: template.validationRules || {},
      createdBy: template.createdBy
    });
    setShowCreateModal(true);
  };

  const handleSaveTemplate = async () => {
    try {
      if (editingTemplate) {
        await contentManagementAPI.updateTemplate(editingTemplate.id, templateForm);
      } else {
        await contentManagementAPI.createTemplate(templateForm);
      }
      setShowCreateModal(false);
      loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (confirm('Are you sure you want to delete this template?')) {
      try {
        await contentManagementAPI.deleteTemplate(templateId);
        loadTemplates();
      } catch (error) {
        console.error('Error deleting template:', error);
      }
    }
  };

  const addField = () => {
    const newField: ContentTemplateField = {
      id: `field_${Date.now()}`,
      name: '',
      type: 'text',
      label: { en: '' },
      placeholder: { en: '' },
      required: false,
      multiLanguage: true,
      validation: {},
      helpText: { en: '' },
      order: templateForm.fields.length
    };
    setTemplateForm(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const updateField = (index: number, field: Partial<ContentTemplateField>) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }));
  };

  const removeField = (index: number) => {
    setTemplateForm(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wine': return '🍷';
      case 'spirits': return '🥃';
      case 'champagne': return '🍾';
      case 'gift-set': return '🎁';
      case 'accessories': return '🍸';
      default: return '📦';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`content-template-manager ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Templates</h2>
          <p className="text-gray-600">Create and manage content templates for consistency</p>
        </div>
        <Button
          onClick={handleCreateTemplate}
          className="bg-amber-600 hover:bg-amber-700"
        >
          Create Template
        </Button>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{getCategoryIcon(template.category)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{template.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`w-2 h-2 rounded-full ${template.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                <span className="text-xs text-gray-500">
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4">{template.description}</p>

            <div className="mb-4">
              <div className="text-sm text-gray-500 mb-2">
                {template.fields.length} fields
              </div>
              <div className="flex flex-wrap gap-1">
                {template.fields.slice(0, 3).map((field) => (
                  <span
                    key={field.id}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                  >
                    {field.name}
                  </span>
                ))}
                {template.fields.length > 3 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                    +{template.fields.length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center text-sm text-gray-500 mb-4">
              <span>Created {new Date(template.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleEditTemplate(template)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Edit
              </Button>
              <Button
                onClick={() => handleDeleteTemplate(template.id)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No templates yet</h3>
            <p className="text-gray-500 mb-4">Create your first content template to get started</p>
            <Button
              onClick={handleCreateTemplate}
              className="bg-amber-600 hover:bg-amber-700"
            >
              Create Template
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Template Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title={editingTemplate ? 'Edit Template' : 'Create Template'}
          size="xl"
        >
          <div className="space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateForm.name}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category *
                </label>
                <select
                  value={templateForm.category}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="wine">Wine</option>
                  <option value="spirits">Spirits</option>
                  <option value="champagne">Champagne</option>
                  <option value="gift-set">Gift Set</option>
                  <option value="accessories">Accessories</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={templateForm.description}
                onChange={(e) => setTemplateForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={templateForm.isActive}
                  onChange={(e) => setTemplateForm(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="mr-2"
                />
                Active template
              </label>
            </div>

            {/* Fields */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Template Fields</h3>
                <Button
                  onClick={addField}
                  variant="outline"
                  size="sm"
                >
                  Add Field
                </Button>
              </div>

              <div className="space-y-4">
                {templateForm.fields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Name *
                        </label>
                        <input
                          type="text"
                          value={field.name}
                          onChange={(e) => updateField(index, { name: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Field Type *
                        </label>
                        <select
                          value={field.type}
                          onChange={(e) => updateField(index, { type: e.target.value as any })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                          <option value="text">Text</option>
                          <option value="textarea">Textarea</option>
                          <option value="rich-text">Rich Text</option>
                          <option value="select">Select</option>
                          <option value="multi-select">Multi Select</option>
                          <option value="number">Number</option>
                          <option value="date">Date</option>
                          <option value="boolean">Boolean</option>
                          <option value="image">Image</option>
                          <option value="file">File</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Label (English) *
                        </label>
                        <input
                          type="text"
                          value={field.label.en || ''}
                          onChange={(e) => updateField(index, { 
                            label: { ...field.label, en: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Placeholder (English)
                        </label>
                        <input
                          type="text"
                          value={field.placeholder?.en || ''}
                          onChange={(e) => updateField(index, { 
                            placeholder: { ...field.placeholder, en: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Help Text (English)
                        </label>
                        <input
                          type="text"
                          value={field.helpText?.en || ''}
                          onChange={(e) => updateField(index, { 
                            helpText: { ...field.helpText, en: e.target.value }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(index, { required: e.target.checked })}
                            className="mr-2"
                          />
                          Required
                        </label>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={field.multiLanguage}
                            onChange={(e) => updateField(index, { multiLanguage: e.target.checked })}
                            className="mr-2"
                          />
                          Multi-language
                        </label>
                      </div>
                      <Button
                        onClick={() => removeField(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                {templateForm.fields.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No fields added yet</p>
                    <p className="text-sm mt-1">Click "Add Field" to create template fields</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                onClick={() => setShowCreateModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveTemplate}
                disabled={!templateForm.name || templateForm.fields.length === 0}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ContentTemplateManager;