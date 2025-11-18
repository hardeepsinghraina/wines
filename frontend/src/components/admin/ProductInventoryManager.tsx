'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

interface ProductInventory {
  id?: string
  quantity: number
  reservedQty: number
  location: string
  lastRestocked?: string
  lowStockThreshold?: number
}

interface ProductInventoryManagerProps {
  inventory: ProductInventory[]
  onInventoryChange: (inventory: ProductInventory[]) => void
}

const WAREHOUSE_LOCATIONS = [
  { code: 'main_warehouse', name: 'Main Warehouse' },
  { code: 'bordeaux_cellar', name: 'Bordeaux Cellar' },
  { code: 'burgundy_storage', name: 'Burgundy Storage' },
  { code: 'champagne_vault', name: 'Champagne Vault' },
  { code: 'retail_store', name: 'Retail Store' },
  { code: 'temperature_controlled', name: 'Temperature Controlled' },
  { code: 'bonded_warehouse', name: 'Bonded Warehouse' }
]

export function ProductInventoryManager({ 
  inventory, 
  onInventoryChange 
}: ProductInventoryManagerProps) {
  const [showAddLocation, setShowAddLocation] = useState(false)
  const [newInventory, setNewInventory] = useState<Partial<ProductInventory>>({
    location: 'main_warehouse',
    quantity: 0,
    reservedQty: 0,
    lowStockThreshold: 10
  })

  const handleAddInventory = () => {
    if (!newInventory.location) return

    const inventoryItem: ProductInventory = {
      location: newInventory.location,
      quantity: newInventory.quantity || 0,
      reservedQty: newInventory.reservedQty || 0,
      lowStockThreshold: newInventory.lowStockThreshold || 10,
      lastRestocked: new Date().toISOString().split('T')[0]
    }

    onInventoryChange([...inventory, inventoryItem])
    setNewInventory({
      location: 'main_warehouse',
      quantity: 0,
      reservedQty: 0,
      lowStockThreshold: 10
    })
    setShowAddLocation(false)
  }

  const handleUpdateInventory = (index: number, updates: Partial<ProductInventory>) => {
    const newInventory = [...inventory]
    newInventory[index] = { ...newInventory[index], ...updates }
    onInventoryChange(newInventory)
  }

  const handleRemoveInventory = (index: number) => {
    const newInventory = inventory.filter((_, i) => i !== index)
    onInventoryChange(newInventory)
  }

  const handleQuickRestock = (index: number, additionalQuantity: number) => {
    const newInventory = [...inventory]
    newInventory[index] = {
      ...newInventory[index],
      quantity: newInventory[index].quantity + additionalQuantity,
      lastRestocked: new Date().toISOString().split('T')[0]
    }
    onInventoryChange(newInventory)
  }

  const getAvailableStock = (item: ProductInventory) => {
    return Math.max(0, item.quantity - item.reservedQty)
  }

  const isLowStock = (item: ProductInventory) => {
    const threshold = item.lowStockThreshold || 10
    return getAvailableStock(item) <= threshold
  }

  const getTotalStock = () => {
    return inventory.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalAvailable = () => {
    return inventory.reduce((total, item) => total + getAvailableStock(item), 0)
  }

  const getTotalReserved = () => {
    return inventory.reduce((total, item) => total + item.reservedQty, 0)
  }

  const getLocationName = (locationCode: string) => {
    return WAREHOUSE_LOCATIONS.find(loc => loc.code === locationCode)?.name || locationCode
  }

  const getAvailableLocations = () => {
    const usedLocations = inventory.map(inv => inv.location)
    return WAREHOUSE_LOCATIONS.filter(loc => !usedLocations.includes(loc.code))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">Inventory Management</h3>
        <Button
          type="button"
          variant="outline"
          onClick={() => setShowAddLocation(true)}
          disabled={getAvailableLocations().length === 0}
        >
          Add Location
        </Button>
      </div>

      {/* Inventory Summary */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{getTotalStock()}</div>
            <div className="text-sm text-gray-600">Total Stock</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getTotalAvailable()}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{getTotalReserved()}</div>
            <div className="text-sm text-gray-600">Reserved</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{inventory.length}</div>
            <div className="text-sm text-gray-600">Locations</div>
          </div>
        </div>
      </Card>

      {inventory.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">No inventory locations configured</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAddLocation(true)}
            className="mt-2"
          >
            Add First Location
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {inventory.map((item, index) => (
            <Card 
              key={index} 
              className={`p-4 ${isLowStock(item) ? 'border-red-300 bg-red-50' : ''}`}
            >
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Location</label>
                  <select
                    value={item.location}
                    onChange={(e) => handleUpdateInventory(index, { location: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value={item.location}>
                      {getLocationName(item.location)}
                    </option>
                    {getAvailableLocations().map(location => (
                      <option key={location.code} value={location.code}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={item.quantity}
                    onChange={(e) => handleUpdateInventory(index, { quantity: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reserved</label>
                  <input
                    type="number"
                    min="0"
                    max={item.quantity}
                    value={item.reservedQty}
                    onChange={(e) => handleUpdateInventory(index, { reservedQty: parseInt(e.target.value) || 0 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Available</label>
                  <div className={`mt-1 p-2 rounded-md ${
                    isLowStock(item) ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    <span className="font-medium">{getAvailableStock(item)}</span>
                    {isLowStock(item) && (
                      <span className="ml-1 text-xs">(Low Stock)</span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Low Stock Alert</label>
                  <input
                    type="number"
                    min="0"
                    value={item.lowStockThreshold || 10}
                    onChange={(e) => handleUpdateInventory(index, { lowStockThreshold: parseInt(e.target.value) || 10 })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Restocked</label>
                  <input
                    type="date"
                    value={item.lastRestocked || ''}
                    onChange={(e) => handleUpdateInventory(index, { lastRestocked: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const quantity = prompt('Enter quantity to add:')
                      if (quantity && !isNaN(parseInt(quantity))) {
                        handleQuickRestock(index, parseInt(quantity))
                      }
                    }}
                  >
                    Quick Restock
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="danger"
                    onClick={() => handleRemoveInventory(index)}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Location Form */}
      {showAddLocation && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Add Inventory Location</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Location</label>
              <select
                value={newInventory.location || ''}
                onChange={(e) => setNewInventory({ ...newInventory, location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              >
                <option value="">Select Location</option>
                {getAvailableLocations().map(location => (
                  <option key={location.code} value={location.code}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Initial Quantity</label>
              <input
                type="number"
                min="0"
                value={newInventory.quantity || ''}
                onChange={(e) => setNewInventory({ ...newInventory, quantity: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Reserved Quantity</label>
              <input
                type="number"
                min="0"
                max={newInventory.quantity || 0}
                value={newInventory.reservedQty || ''}
                onChange={(e) => setNewInventory({ ...newInventory, reservedQty: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Low Stock Threshold</label>
              <input
                type="number"
                min="0"
                value={newInventory.lowStockThreshold || ''}
                onChange={(e) => setNewInventory({ ...newInventory, lowStockThreshold: parseInt(e.target.value) || 10 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                placeholder="10"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setShowAddLocation(false)
                setNewInventory({
                  location: 'main_warehouse',
                  quantity: 0,
                  reservedQty: 0,
                  lowStockThreshold: 10
                })
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAddInventory}
              disabled={!newInventory.location}
            >
              Add Location
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}