'use client'

import React, { useState } from 'react'
import { Button } from '../ui/Button'

interface InventoryItem {
  id: string
  wineId: string
  quantity: number
  reservedQty: number
  availableQty: number
  damagedQty: number
  location: string
  warehouse?: string
  zone?: string
  temperature?: number
  humidity?: number
  lowStockThreshold: number
  reorderPoint: number
  maxStockLevel?: number
  batchNumber?: string
  lotNumber?: string
  supplierRef?: string
  unitCost?: number
  wine?: {
    name: string
    producer: string
    sku: string
  }
}

interface InventoryEditModalProps {
  item: InventoryItem
  onUpdate: (data: any) => void
  onCancel: () => void
}

export const InventoryEditModal: React.FC<InventoryEditModalProps> = ({
  item,
  onUpdate,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    quantity: item.quantity,
    reservedQty: item.reservedQty,
    damagedQty: item.damagedQty,
    location: item.location,
    warehouse: item.warehouse || '',
    zone: item.zone || '',
    temperature: item.temperature || '',
    humidity: item.humidity || '',
    lowStockThreshold: item.lowStockThreshold,
    reorderPoint: item.reorderPoint,
    maxStockLevel: item.maxStockLevel || '',
    batchNumber: item.batchNumber || '',
    lotNumber: item.lotNumber || '',
    supplierRef: item.supplierRef || '',
    unitCost: item.unitCost || '',
    notes: ''
  })

  const [loading, setLoading] = useState(false)

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Clean up empty values and convert strings to numbers where needed
      const updateData: any = {}
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          if (['quantity', 'reservedQty', 'damagedQty', 'lowStockThreshold', 'reorderPoint', 'maxStockLevel', 'temperature', 'humidity', 'unitCost'].includes(key)) {
            updateData[key] = Number(value)
          } else {
            updateData[key] = value
          }
        }
      })

      await onUpdate(updateData)
    } catch (error) {
      console.error('Failed to update inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Product Info */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Product Information</h3>
        <div className="text-sm text-gray-600">
          <p><strong>Name:</strong> {item.wine?.name}</p>
          <p><strong>Producer:</strong> {item.wine?.producer}</p>
          <p><strong>SKU:</strong> {item.wine?.sku}</p>
        </div>
      </div>

      {/* Quantity Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Quantity *
          </label>
          <input
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => handleChange('quantity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reserved Quantity
          </label>
          <input
            type="number"
            min="0"
            value={formData.reservedQty}
            onChange={(e) => handleChange('reservedQty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Damaged Quantity
          </label>
          <input
            type="number"
            min="0"
            value={formData.damagedQty}
            onChange={(e) => handleChange('damagedQty', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location *
          </label>
          <select
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="main_warehouse">Main Warehouse</option>
            <option value="secondary_warehouse">Secondary Warehouse</option>
            <option value="retail_store">Retail Store</option>
            <option value="cold_storage">Cold Storage</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Warehouse
          </label>
          <input
            type="text"
            value={formData.warehouse}
            onChange={(e) => handleChange('warehouse', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Warehouse A"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zone
          </label>
          <input
            type="text"
            value={formData.zone}
            onChange={(e) => handleChange('zone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., A1, B2"
          />
        </div>
      </div>

      {/* Storage Conditions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Temperature (°C)
          </label>
          <input
            type="number"
            step="0.1"
            value={formData.temperature}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 12.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Humidity (%)
          </label>
          <input
            type="number"
            min="0"
            max="100"
            value={formData.humidity}
            onChange={(e) => handleChange('humidity', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 65"
          />
        </div>
      </div>

      {/* Stock Management */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Low Stock Threshold *
          </label>
          <input
            type="number"
            min="0"
            value={formData.lowStockThreshold}
            onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reorder Point *
          </label>
          <input
            type="number"
            min="0"
            value={formData.reorderPoint}
            onChange={(e) => handleChange('reorderPoint', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Max Stock Level
          </label>
          <input
            type="number"
            min="0"
            value={formData.maxStockLevel}
            onChange={(e) => handleChange('maxStockLevel', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tracking Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Batch Number
          </label>
          <input
            type="text"
            value={formData.batchNumber}
            onChange={(e) => handleChange('batchNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lot Number
          </label>
          <input
            type="text"
            value={formData.lotNumber}
            onChange={(e) => handleChange('lotNumber', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier Reference
          </label>
          <input
            type="text"
            value={formData.supplierRef}
            onChange={(e) => handleChange('supplierRef', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Cost Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unit Cost (€)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={formData.unitCost}
            onChange={(e) => handleChange('unitCost', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Value (Calculated)
          </label>
          <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700">
            €{((Number(formData.unitCost) || 0) * (Number(formData.quantity) || 0)).toFixed(2)}
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Update Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Add notes about this inventory update..."
        />
      </div>

      {/* Available Quantity Preview */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Available Quantity Preview</h4>
        <p className="text-sm text-blue-700">
          Available: {Math.max(0, (formData.quantity || 0) - (formData.reservedQty || 0) - (formData.damagedQty || 0))} units
        </p>
        <p className="text-xs text-blue-600 mt-1">
          (Total - Reserved - Damaged = Available)
        </p>
      </div>

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
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Update Inventory'}
        </Button>
      </div>
    </form>
  )
}