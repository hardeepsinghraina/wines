'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { adminProductApi } from '@/lib/admin-product-api'

interface BulkImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: () => void
}

interface ImportResult {
  created: number
  updated: number
  errors: Array<{ product: any; error: string }>
}

export function BulkImportModal({ isOpen, onClose, onImport }: BulkImportModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [importing, setImporting] = useState(false)
  const [results, setResults] = useState<ImportResult | null>(null)
  const [previewData, setPreviewData] = useState<any[]>([])
  const [showPreview, setShowPreview] = useState(false)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)
    
    // Parse CSV for preview
    const text = await selectedFile.text()
    const lines = text.split('\n')
    const headers = lines[0].split(',').map(h => h.trim())
    const preview = lines.slice(1, 6).map(line => {
      const values = line.split(',').map(v => v.trim())
      const obj: any = {}
      headers.forEach((header, index) => {
        obj[header] = values[index] || ''
      })
      return obj
    }).filter(obj => Object.values(obj).some(v => v))

    setPreviewData(preview)
    setShowPreview(preview.length > 0)
  }

  const parseCSVToProducts = (csvText: string) => {
    const lines = csvText.split('\n')
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim())
      const product: any = {}
      
      headers.forEach((header, index) => {
        const value = values[index] || ''
        
        switch (header) {
          case 'name':
            product.name = value
            break
          case 'producer':
            product.producer = value
            break
          case 'region':
            product.region = value
            break
          case 'vintage':
            product.vintage = parseInt(value) || new Date().getFullYear()
            break
          case 'category':
            product.category = value
            break
          case 'description':
            product.description = value
            break
          case 'tastingnotes':
          case 'tasting_notes':
            product.tastingNotes = value
            break
          case 'alcoholcontent':
          case 'alcohol_content':
            product.alcoholContent = parseFloat(value) || 13.5
            break
          case 'bottlesize':
          case 'bottle_size':
          case 'volume':
            product.bottleSize = value || '750ml'
            break
          case 'sku':
            product.sku = value
            break
          case 'price':
            if (value) {
              product.prices = [{
                currency: 'USD',
                price: parseFloat(value),
                isActive: true
              }]
            }
            break
          case 'stock':
          case 'quantity':
            if (value) {
              product.inventory = [{
                quantity: parseInt(value) || 0,
                reservedQty: 0,
                location: 'main_warehouse'
              }]
            }
            break
          case 'imageurl':
          case 'image_url':
            if (value) {
              product.images = [{
                url: value,
                altText: product.name,
                isPrimary: true,
                sortOrder: 0
              }]
            }
            break
        }
      })
      
      // Generate SKU if not provided
      if (!product.sku && product.name) {
        product.sku = product.name
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '-')
          .replace(/-+/g, '-')
          .substring(0, 20)
      }
      
      return product
    }).filter(product => product.name && product.producer)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    try {
      setImporting(true)
      setResults(null)
      
      const csvText = await file.text()
      const products = parseCSVToProducts(csvText)
      
      if (products.length === 0) {
        throw new Error('No valid products found in CSV file')
      }

      const result = await adminProductApi.bulkImportProducts({ products })
      setResults(result)
      
      if (result.errors.length === 0) {
        setTimeout(() => {
          onImport()
          onClose()
          setFile(null)
          setResults(null)
          setPreviewData([])
          setShowPreview(false)
        }, 2000)
      }
    } catch (error) {
      console.error('Import failed:', error)
      setResults({
        created: 0,
        updated: 0,
        errors: [{ product: {}, error: error instanceof Error ? error.message : 'Import failed' }]
      })
    } finally {
      setImporting(false)
    }
  }

  const downloadTemplate = () => {
    const template = `name,producer,region,vintage,category,description,tastingNotes,alcoholContent,bottleSize,sku,price,stock,imageUrl
Château Margaux 2015,Château Margaux,Bordeaux,2015,bordeaux,"Exceptional vintage from premier grand cru classé","Complex aromas of blackcurrant and violet",13.5,750ml,MARG-2015,1200.00,5,https://example.com/margaux.jpg
Dom Pérignon 2012,Moët & Chandon,Champagne,2012,champagne,"Prestigious champagne from legendary house","Elegant bubbles with notes of citrus and brioche",12.5,750ml,DOMP-2012,300.00,10,https://example.com/domperignon.jpg`
    
    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'product-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Import Products" size="lg">
      <div className="space-y-6">
        {!results && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Select CSV File
                </label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={downloadTemplate}
                >
                  Download Template
                </Button>
              </div>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                required
              />
            </div>

            <Card className="p-4 bg-blue-50 border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Required columns:</strong> name, producer, region, category</p>
                <p><strong>Optional columns:</strong> vintage, description, tastingNotes, alcoholContent, bottleSize, sku, price, stock, imageUrl</p>
                <p><strong>Note:</strong> First row should contain column headers</p>
              </div>
            </Card>

            {showPreview && previewData.length > 0 && (
              <Card className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Preview (First 5 rows)</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        {Object.keys(previewData[0]).map(key => (
                          <th key={key} className="text-left py-2 px-3 font-medium text-gray-700">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.map((row, index) => (
                        <tr key={index} className="border-b">
                          {Object.values(row).map((value: any, cellIndex) => (
                            <td key={cellIndex} className="py-2 px-3 text-gray-600">
                              {value?.toString().substring(0, 30)}
                              {value?.toString().length > 30 ? '...' : ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {previewData.length} products will be imported
                </p>
              </Card>
            )}

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={!file || importing}>
                {importing ? 'Importing...' : 'Import Products'}
              </Button>
            </div>
          </form>
        )}

        {results && (
          <div className="space-y-4">
            <Card className="p-4">
              <h4 className="font-medium text-gray-900 mb-3">Import Results</h4>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{results.created}</div>
                  <div className="text-sm text-gray-600">Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{results.updated}</div>
                  <div className="text-sm text-gray-600">Updated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{results.errors.length}</div>
                  <div className="text-sm text-gray-600">Errors</div>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-900 mb-2">Errors:</h5>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {results.errors.map((error, index) => (
                      <div key={index} className="p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <p className="text-red-800">{error.error}</p>
                        {error.product.name && (
                          <p className="text-red-600">Product: {error.product.name}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setResults(null)
                  setFile(null)
                  setPreviewData([])
                  setShowPreview(false)
                }}
              >
                Import More
              </Button>
              <Button onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}