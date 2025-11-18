'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { Modal } from '../ui/Modal'
import { InventoryEditModal } from './InventoryEditModal'

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
  lastRestocked?: Date
  lastSold?: Date
  lastInventoryCheck?: Date
  expiryDate?: Date
  batchNumber?: string
  lotNumber?: string
  supplierRef?: string
  unitCost?: number
  totalValue?: number
  createdAt: Date
  updatedAt: Date
  wine?: {
    id: string
    name: string
    producer: string
    sku: string
    category: string
    currentPrice: number
  }
}

interface InventoryTableProps {
  inventory: {
    items: InventoryItem[]
    total: number
    page: number
    totalPages: number
  }
  filters: {
    location: string
    lowStock: boolean
    outOfStock: boolean
    expiringSoon: boolean
  }
  onFilterChange: (filters: any) => void
  onInventoryUpdate: (inventoryId: string, data: any) => void
  loading: boolean
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventory,
  filters,
  onFilterChange,
  onInventoryUpdate,
  loading
}) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [sortBy, setSortBy] = useState('updatedAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
  }

  const handleEditItem = (item: InventoryItem) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleUpdateItem = async (data: any) => {
    if (selectedItem) {
      await onInventoryUpdate(selectedItem.id, data)
      setShowEditModal(false)
      setSelectedItem(null)
    }
  }

  const getStockStatus = (item: InventoryItem) => {
    if (item.availableQty <= 0) {
      return { status: 'Out of Stock', color: 'text-red-600 bg-red-100' }
    } else if (item.availableQty <= item.lowStockThreshold) {
      return { status: 'Low Stock', color: 'text-yellow-600 bg-yellow-100' }
    } else if (item.availableQty <= item.reorderPoint) {
      return { status: 'Reorder Point', color: 'text-orange-600 bg-orange-100' }
    } else {
      return { status: 'In Stock', color: 'text-green-600 bg-green-100' }
    }
  }

  const isExpiringSoon = (expiryDate?: Date) => {
    if (!expiryDate) return false
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
    return expiryDate <= thirtyDaysFromNow
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <select
              value={filters.location}
              onChange={(e) => onFilterChange({ ...filters, location: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Locations</option>
              <option value="main_warehouse">Main Warehouse</option>
              <option value="secondary_warehouse">Secondary Warehouse</option>
              <option value="retail_store">Retail Store</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.lowStock}
                onChange={(e) => onFilterChange({ ...filters, lowStock: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Low Stock</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.outOfStock}
                onChange={(e) => onFilterChange({ ...filters, outOfStock: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Out of Stock</span>
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.expiringSoon}
                onChange={(e) => onFilterChange({ ...filters, expiringSoon: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Expiring Soon</span>
            </label>
          </div>
        </div>
      </Card>

      {/* Inventory Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('wine.name')}
                >
                  Product
                  {sortBy === 'wine.name' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('location')}
                >
                  Location
                  {sortBy === 'location' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('availableQty')}
                >
                  Available
                  {sortBy === 'availableQty' && (
                    <span className="ml-1">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reserved
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center">
                    <Loading />
                  </td>
                </tr>
              ) : inventory.items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                inventory.items.map((item) => {
                  const stockStatus = getStockStatus(item)
                  const expiringSoon = isExpiringSoon(item.expiryDate)
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.wine?.name || 'Unknown Product'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {item.wine?.producer} • {item.wine?.sku}
                          </div>
                          {expiringSoon && (
                            <div className="text-xs text-red-600 font-medium">
                              ⚠️ Expires: {item.expiryDate?.toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.location}</div>
                        {item.warehouse && (
                          <div className="text-sm text-gray-500">{item.warehouse}</div>
                        )}
                        {item.zone && (
                          <div className="text-xs text-gray-400">Zone: {item.zone}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.availableQty}
                        </div>
                        <div className="text-xs text-gray-500">
                          Total: {item.quantity}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{item.reservedQty}</div>
                        {item.damagedQty > 0 && (
                          <div className="text-xs text-red-600">
                            Damaged: {item.damagedQty}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}>
                          {stockStatus.status}
                        </span>
                        {item.availableQty <= item.reorderPoint && (
                          <div className="text-xs text-orange-600 mt-1">
                            Reorder needed
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          €{(item.totalValue || 0).toLocaleString()}
                        </div>
                        {item.unitCost && (
                          <div className="text-xs text-gray-500">
                            €{item.unitCost}/unit
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'N/A'}
                        {item.lastInventoryCheck && (
                          <div className="text-xs">
                            Checked: {new Date(item.lastInventoryCheck).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                        >
                          Edit
                        </Button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {inventory.totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {inventory.items.length} of {inventory.total} items
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                disabled={inventory.page <= 1}
              >
                Previous
              </Button>
              <span className="px-3 py-1 text-sm text-gray-700">
                Page {inventory.page} of {inventory.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={inventory.page >= inventory.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedItem(null)
        }}
        title="Edit Inventory Item"
        size="lg"
      >
        {selectedItem && (
          <InventoryEditModal
            item={selectedItem}
            onUpdate={handleUpdateItem}
            onCancel={() => {
              setShowEditModal(false)
              setSelectedItem(null)
            }}
          />
        )}
      </Modal>
    </div>
  )
}