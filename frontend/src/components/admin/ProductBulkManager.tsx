'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { adminProductApi } from '@/lib/admin-product-api'

interface BulkImportResult {
  created: number
  updated: number
  errors: Array<{ product: any; error: string }>
}

interface ProductBulkManagerProps {
  onImportComplete?: () => void
}

export function ProductBulkManager({ onImportComplete }: ProductBulkManagerProps) {
  const [showImportModal, setShowImportModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [importResult, setImportResult] = useState<BulkImportResult | null>(null)
  const [csvData, setCsvData] = useState('')
  const [importFormat, setImportFormat] = useState<'csv' | 'json'>('csv')
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('csv')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const csvTemplate = `name,producer,region,vintage,category,description,tastingNotes,alcoholContent,bottleSize,sku,price,currency,stock,isActive,isFeatured
Château Margaux 2015,Château Margaux,Bordeaux,2015,Red Wine,"Exceptional Bordeaux from premier grand cru classé","Rich and complex with notes of blackcurrant and cedar",13.5,750ml,CM-2015-001,850.00,USD,12,true,true
Dom Pérignon 2012,Dom Pérignon,Champagne,2012,Champagne,"Prestigious vintage champagne","Elegant bubbles with citrus and brioche notes",12.5,750ml,DP-2012-001,250.00,USD,24,true,false`

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setCsvData(content)
    }
    reader.readAsText(file)
  }

  const parseCsvData = (csvContent: string) => {
    const lines = csvContent.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const product: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index]
        
        switch (header) {
          case 'vintage':
          case 'stock':
            product[header] = parseInt(value) || 0
            break
          case 'alcoholContent':
          case 'price':
            product[header] = parseFloat(value) || 0
            break
          case 'isActive':
          case 'isFeatured':
          case 'isNftAvailable':
            product[header] = value.toLowerCase() === 'true'
            break
          default:
            product[header] = value
        }
      })
      
      return product
    })
  }

  const handleBulkImport = async () => {
    if (!csvData.trim()) return

    try {
      setImporting(true)
      setImportResult(null)

      let products: any[]
      
      if (importFormat === 'csv') {
        products = parseCsvData(csvData)
      } else {
        products = JSON.parse(csvData)
      }

      const result = await adminProductApi.bulkImport(products)
      setImportResult(result)
      
      if (onImportComplete) {
        onImportComplete()
      }
    } catch (error) {
      console.error('Bulk import failed:', error)
      setImportResult({
        created: 0,
        updated: 0,
        errors: [{ product: {}, error: error instanceof Error ? error.message : 'Import failed' }]
      })
    } finally {
      setImporting(false)
    }
  }

  const handleExport = async () => {
    try {
      setExporting(true)
      
      if (exportFormat === 'csv') {
        // Trigger CSV download
        const { getApiUrl } = await import('@/config/api');
        const response = await fetch(getApiUrl('/api/admin/products/export?format=csv'))
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        // JSON export
        const products = await adminProductApi.exportProducts()
        const dataStr = JSON.stringify(products, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = window.URL.createObjectURL(dataBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `products-export-${new Date().toISOString().split('T')[0]}.json`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
      
      setShowExportModal(false)
    } catch (error) {
      console.error('Export failed:', error)
    } finally {
      setExporting(false)
    }
  }

  const downloadTemplate = () => {
    const blob = new Blob([csvTemplate], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  }

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Bulk Operations</h3>
            <p className="text-sm text-gray-600">Import and export products in bulk</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowImportModal(true)}
            >
              Import Products
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowExportModal(true)}
            >
              Export Products
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">📥</div>
            <div className="text-sm font-medium text-gray-900 mt-2">Bulk Import</div>
            <div className="text-xs text-gray-600">Upload CSV or JSON files</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">📤</div>
            <div className="text-sm font-medium text-gray-900 mt-2">Bulk Export</div>
            <div className="text-xs text-gray-600">Download all products</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">📋</div>
            <div className="text-sm font-medium text-gray-900 mt-2">Template</div>
            <div className="text-xs text-gray-600">Download import template</div>
            <Button
              size="sm"
              variant="outline"
              onClick={downloadTemplate}
              className="mt-2"
            >
              Download
            </Button>
          </div>
        </div>
      </Card>

      {/* Import Modal */}
      <Modal
        isOpen={showImportModal}
        onClose={() => {
          setShowImportModal(false)
          setCsvData('')
          setImportResult(null)
        }}
        title="Bulk Import Products"
        size="xl"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="text-md font-medium text-gray-900">Import Format</h4>
              <p className="text-sm text-gray-600">Choose your import format</p>
            </div>
            <div className="flex space-x-2">
              <Button
                size="sm"
                variant={importFormat === 'csv' ? 'primary' : 'outline'}
                onClick={() => setImportFormat('csv')}
              >
                CSV
              </Button>
              <Button
                size="sm"
                variant={importFormat === 'json' ? 'primary' : 'outline'}
                onClick={() => setImportFormat('json')}
              >
                JSON
              </Button>
            </div>
          </div>

          {/* File Upload */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={importFormat === 'csv' ? '.csv' : '.json'}
              onChange={handleFileUpload}
              className="hidden"
            />
            <div className="text-center">
              <div className="text-4xl mb-2">📁</div>
              <p className="text-gray-600 mb-2">
                Upload {importFormat.toUpperCase()} file or paste data below
              </p>
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                Choose File
              </Button>
            </div>
          </div>

          {/* Data Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {importFormat.toUpperCase()} Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full h-40 px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
              placeholder={
                importFormat === 'csv'
                  ? 'Paste CSV data here...\nname,producer,region,vintage,category...'
                  : 'Paste JSON data here...\n[{"name": "Wine Name", "producer": "Producer", ...}]'
              }
            />
          </div>

          {/* Import Result */}
          {importResult && (
            <Card className="p-4 bg-gray-50">
              <h5 className="font-medium text-gray-900 mb-2">Import Results</h5>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{importResult.created}</div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{importResult.updated}</div>
                  <div className="text-sm text-gray-600">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{importResult.errors.length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>
              
              {importResult.errors.length > 0 && (
                <div>
                  <h6 className="font-medium text-red-700 mb-2">Errors:</h6>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error.error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => {
                setShowImportModal(false)
                setCsvData('')
                setImportResult(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={downloadTemplate}
              variant="outline"
            >
              Download Template
            </Button>
            <Button
              onClick={handleBulkImport}
              disabled={!csvData.trim() || importing}
            >
              {importing ? 'Importing...' : 'Import Products'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        title="Export Products"
      >
        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-2">Export Format</h4>
            <div className="flex space-x-2">
              <Button
                variant={exportFormat === 'csv' ? 'primary' : 'outline'}
                onClick={() => setExportFormat('csv')}
              >
                CSV
              </Button>
              <Button
                variant={exportFormat === 'json' ? 'primary' : 'outline'}
                onClick={() => setExportFormat('json')}
              >
                JSON
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h5 className="font-medium text-gray-900 mb-2">Export includes:</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Basic product information</li>
              <li>• Pricing and inventory data</li>
              <li>• Product specifications</li>
              <li>• Primary image URLs</li>
              <li>• SEO metadata (JSON only)</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="secondary"
              onClick={() => setShowExportModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : `Export as ${exportFormat.toUpperCase()}`}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}