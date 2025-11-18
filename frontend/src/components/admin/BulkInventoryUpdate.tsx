'use client'

import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface BulkInventoryUpdateProps {
  onUpdate: (updates: any[]) => void
  onCancel: () => void
}

export const BulkInventoryUpdate: React.FC<BulkInventoryUpdateProps> = ({
  onUpdate,
  onCancel
}) => {
  const [updateType, setUpdateType] = useState<'csv' | 'manual' | 'template'>('manual')
  const [csvData, setCsvData] = useState('')
  const [manualUpdates, setManualUpdates] = useState([
    { inventoryId: '', field: 'quantity', value: '', notes: '' }
  ])
  const [loading, setLoading] = useState(false)

  const addManualUpdate = () => {
    setManualUpdates([
      ...manualUpdates,
      { inventoryId: '', field: 'quantity', value: '', notes: '' }
    ])
  }

  const removeManualUpdate = (index: number) => {
    setManualUpdates(manualUpdates.filter((_, i) => i !== index))
  }

  const updateManualUpdate = (index: number, field: string, value: string) => {
    const updated = [...manualUpdates]
    updated[index] = { ...updated[index], [field]: value }
    setManualUpdates(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let updates: any[] = []

      if (updateType === 'manual') {
        updates = manualUpdates
          .filter(update => update.inventoryId && update.field && update.value)
          .map(update => ({
            inventoryId: update.inventoryId,
            data: {
              [update.field]: update.field.includes('Qty') || update.field === 'quantity' || update.field === 'lowStockThreshold' || update.field === 'reorderPoint' || update.field === 'maxStockLevel'
                ? parseInt(update.value)
                : update.field === 'unitCost' || update.field === 'temperature' || update.field === 'humidity'
                ? parseFloat(update.value)
                : update.value,
              notes: update.notes
            }
          }))
      } else if (updateType === 'csv') {
        // Parse CSV data
        const lines = csvData.trim().split('\n')
        const headers = lines[0].split(',').map(h => h.trim())
        
        updates = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim())
          const data: any = {}
          
          headers.forEach((header, index) => {
            if (header !== 'inventoryId' && values[index]) {
              if (['quantity', 'reservedQty', 'damagedQty', 'lowStockThreshold', 'reorderPoint', 'maxStockLevel'].includes(header)) {
                data[header] = parseInt(values[index])
              } else if (['unitCost', 'temperature', 'humidity'].includes(header)) {
                data[header] = parseFloat(values[index])
              } else {
                data[header] = values[index]
              }
            }
          })

          return {
            inventoryId: values[0], // Assuming first column is inventoryId
            data
          }
        }).filter(update => update.inventoryId)
      }

      await onUpdate(updates)
    } catch (error) {
      console.error('Failed to process bulk update:', error)
    } finally {
      setLoading(false)
    }
  }

  const downloadTemplate = () => {
    const csvContent = 'inventoryId,quantity,reservedQty,damagedQty,location,lowStockThreshold,reorderPoint,unitCost,notes\n'
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'inventory_bulk_update_template.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Update Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Update Method
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="manual"
              checked={updateType === 'manual'}
              onChange={(e) => setUpdateType(e.target.value as 'manual')}
              className="mr-2"
            />
            Manual Entry
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="csv"
              checked={updateType === 'csv'}
              onChange={(e) => setUpdateType(e.target.value as 'csv')}
              className="mr-2"
            />
            CSV Upload
          </label>
        </div>
      </div>

      {/* Manual Updates */}
      {updateType === 'manual' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Manual Updates</h3>
            <Button
              type="button"
              variant="outline"
              onClick={addManualUpdate}
            >
              Add Update
            </Button>
          </div>

          <div className="space-y-3">
            {manualUpdates.map((update, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 border border-gray-200 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Inventory ID
                  </label>
                  <input
                    type="text"
                    value={update.inventoryId}
                    onChange={(e) => updateManualUpdate(index, 'inventoryId', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="inv_123..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Field
                  </label>
                  <select
                    value={update.field}
                    onChange={(e) => updateManualUpdate(index, 'field', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="quantity">Quantity</option>
                    <option value="reservedQty">Reserved Qty</option>
                    <option value="damagedQty">Damaged Qty</option>
                    <option value="location">Location</option>
                    <option value="lowStockThreshold">Low Stock Threshold</option>
                    <option value="reorderPoint">Reorder Point</option>
                    <option value="maxStockLevel">Max Stock Level</option>
                    <option value="unitCost">Unit Cost</option>
                    <option value="temperature">Temperature</option>
                    <option value="humidity">Humidity</option>
                    <option value="batchNumber">Batch Number</option>
                    <option value="lotNumber">Lot Number</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Value
                  </label>
                  <input
                    type="text"
                    value={update.value}
                    onChange={(e) => updateManualUpdate(index, 'value', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="New value..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={update.notes}
                    onChange={(e) => updateManualUpdate(index, 'notes', e.target.value)}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeManualUpdate(index)}
                    disabled={manualUpdates.length === 1}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CSV Upload */}
      {updateType === 'csv' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">CSV Data</h3>
            <Button
              type="button"
              variant="outline"
              onClick={downloadTemplate}
            >
              Download Template
            </Button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste CSV Data
            </label>
            <textarea
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              rows={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="inventoryId,quantity,reservedQty,damagedQty,location,lowStockThreshold,reorderPoint,unitCost,notes
inv_123,100,5,2,main_warehouse,10,5,25.50,Restocked
inv_456,50,0,0,secondary_warehouse,5,3,30.00,New batch"
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 mb-2">CSV Format Requirements</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• First row must contain column headers</li>
              <li>• First column must be 'inventoryId'</li>
              <li>• Numeric fields: quantity, reservedQty, damagedQty, lowStockThreshold, reorderPoint, maxStockLevel, unitCost, temperature, humidity</li>
              <li>• Text fields: location, warehouse, zone, batchNumber, lotNumber, supplierRef, notes</li>
              <li>• Empty cells will be ignored (no update for that field)</li>
            </ul>
          </div>
        </div>
      )}

      {/* Preview */}
      {((updateType === 'manual' && manualUpdates.some(u => u.inventoryId && u.field && u.value)) ||
        (updateType === 'csv' && csvData.trim())) && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Update Preview</h4>
          <div className="text-sm text-gray-600">
            {updateType === 'manual' ? (
              <p>
                {manualUpdates.filter(u => u.inventoryId && u.field && u.value).length} manual updates ready
              </p>
            ) : (
              <p>
                {csvData.trim().split('\n').length - 1} CSV rows to process
              </p>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading || (updateType === 'manual' && !manualUpdates.some(u => u.inventoryId && u.field && u.value)) || (updateType === 'csv' && !csvData.trim())}
        >
          {loading ? 'Processing...' : 'Apply Updates'}
        </Button>
      </div>
    </form>
  )
}