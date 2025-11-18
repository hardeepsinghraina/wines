'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { Modal } from '../ui/Modal';
import { contentManagementAPI } from '../../lib/content-management-api';
import { BulkContentOperation } from '../../../../shared/types/content-management';

interface BulkContentManagerProps {
  className?: string;
}

export const BulkContentManager: React.FC<BulkContentManagerProps> = ({
  className = ''
}) => {
  const [operations, setOperations] = useState<BulkContentOperation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importMapping, setImportMapping] = useState<Record<string, string>>({});
  const [importOptions, setImportOptions] = useState({
    skipErrors: true,
    updateExisting: false,
    validateOnly: false
  });
  const [exportFilters, setExportFilters] = useState({
    status: [] as string[],
    language: [] as string[],
    dateRange: null as { start: Date; end: Date } | null
  });
  const [exportFormat, setExportFormat] = useState<'csv' | 'xlsx' | 'json'>('xlsx');

  useEffect(() => {
    loadOperations();
    const interval = setInterval(loadOperations, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadOperations = async () => {
    try {
      // In a real implementation, this would fetch from API
      setOperations([]);
    } catch (error) {
      console.error('Error loading operations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      const operation = await contentManagementAPI.createBulkImport({
        file: importFile,
        mapping: importMapping,
        options: importOptions
      });

      setOperations(prev => [operation, ...prev]);
      setShowImportModal(false);
      setImportFile(null);
      setImportMapping({});
    } catch (error) {
      console.error('Error starting import:', error);
    }
  };

  const handleExport = async () => {
    try {
      const operation = await contentManagementAPI.createBulkExport(exportFilters, exportFormat);
      setOperations(prev => [operation, ...prev]);
      setShowExportModal(false);
    } catch (error) {
      console.error('Error starting export:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getOperationIcon = (type: string) => {
    switch (type) {
      case 'import': return '📥';
      case 'export': return '📤';
      case 'update': return '✏️';
      case 'delete': return '🗑️';
      case 'publish': return '🚀';
      default: return '📦';
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`bulk-content-manager ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Bulk Operations</h2>
          <p className="text-gray-600">Import, export, and manage content in bulk</p>
        </div>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowImportModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            📥 Import Content
          </Button>
          <Button
            onClick={() => setShowExportModal(true)}
            className="bg-green-600 hover:bg-green-700"
          >
            📤 Export Content
          </Button>
        </div>
      </div>

      {/* Operations List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Operations</h3>
        
        {operations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📦</div>
            <p>No bulk operations yet</p>
            <p className="text-sm mt-2">Start by importing or exporting content</p>
          </div>
        ) : (
          <div className="space-y-4">
            {operations.map((operation) => (
              <div
                key={operation.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getOperationIcon(operation.type)}</span>
                    <div>
                      <div className="font-medium text-gray-900 capitalize">
                        {operation.type} Operation
                      </div>
                      <div className="text-sm text-gray-500">
                        Started {new Date(operation.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(operation.status)}`}>
                      {operation.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {operation.status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{operation.processedItems}/{operation.totalItems}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${operation.totalItems > 0 ? (operation.processedItems / operation.totalItems) * 100 : 0}%`
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Summary */}
                {operation.failedItems > 0 && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-800">
                      <strong>{operation.failedItems}</strong> items failed to process
                    </div>
                    {operation.errors.length > 0 && (
                      <div className="mt-2 text-xs text-red-600">
                        <details>
                          <summary className="cursor-pointer">View errors</summary>
                          <div className="mt-2 space-y-1">
                            {operation.errors.slice(0, 5).map((error, index) => (
                              <div key={index}>
                                Row {error.row}: {error.error}
                              </div>
                            ))}
                            {operation.errors.length > 5 && (
                              <div>... and {operation.errors.length - 5} more errors</div>
                            )}
                          </div>
                        </details>
                      </div>
                    )}
                  </div>
                )}

                {/* Download Link */}
                {operation.status === 'completed' && operation.type === 'export' && operation.fileUrl && (
                  <div className="mt-3">
                    <a
                      href={operation.fileUrl}
                      download
                      className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                    >
                      📥 Download Export File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Import Modal */}
      {showImportModal && (
        <Modal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Content"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-sm text-gray-500 mt-1">
                Supported formats: CSV, XLSX, JSON
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field Mapping
              </label>
              <div className="space-y-2">
                {['title', 'description', 'price', 'category'].map((field) => (
                  <div key={field} className="flex items-center space-x-3">
                    <span className="w-24 text-sm text-gray-600 capitalize">{field}:</span>
                    <input
                      type="text"
                      placeholder={`Column name for ${field}`}
                      value={importMapping[field] || ''}
                      onChange={(e) => setImportMapping(prev => ({
                        ...prev,
                        [field]: e.target.value
                      }))}
                      className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Options
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.skipErrors}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      skipErrors: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Skip rows with errors
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.updateExisting}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      updateExisting: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Update existing content
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={importOptions.validateOnly}
                    onChange={(e) => setImportOptions(prev => ({
                      ...prev,
                      validateOnly: e.target.checked
                    }))}
                    className="mr-2"
                  />
                  Validate only (don't import)
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowImportModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleImport}
                disabled={!importFile}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Start Import
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <Modal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          title="Export Content"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Export Format
              </label>
              <select
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value as 'csv' | 'xlsx' | 'json')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filters
              </label>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Status</label>
                  <select
                    multiple
                    value={exportFilters.status}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      status: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Language</label>
                  <select
                    multiple
                    value={exportFilters.language}
                    onChange={(e) => setExportFilters(prev => ({
                      ...prev,
                      language: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                onClick={() => setShowExportModal(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={handleExport}
                className="bg-green-600 hover:bg-green-700"
              >
                Start Export
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default BulkContentManager;