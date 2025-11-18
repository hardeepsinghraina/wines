'use client'

import { useState, useCallback } from 'react'

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

interface InventoryAlert {
  id: string
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT' | 'EXPIRY_WARNING' | 'DAMAGED_STOCK'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  wineId: string
  inventoryId: string
  message: string
  threshold?: number
  currentValue?: number
  isResolved: boolean
  resolvedAt?: Date
  createdAt: Date
}

interface InventoryReport {
  totalProducts: number
  totalValue: number
  lowStockItems: number
  outOfStockItems: number
  expiringItems: number
  damagedItems: number
  turnoverRate: number
  averageDaysInStock: number
  topMovingProducts: Array<{
    wineId: string
    name: string
    quantitySold: number
    revenue: number
  }>
  slowMovingProducts: Array<{
    wineId: string
    name: string
    daysInStock: number
    currentStock: number
  }>
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<{
    items: InventoryItem[]
    total: number
    page: number
    totalPages: number
  }>({
    items: [],
    total: 0,
    page: 1,
    totalPages: 0
  })

  const [alerts, setAlerts] = useState<{
    alerts: InventoryAlert[]
    total: number
    page: number
    totalPages: number
  }>({
    alerts: [],
    total: 0,
    page: 1,
    totalPages: 0
  })

  const [report, setReport] = useState<InventoryReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInventory = useCallback(async (filters: any = {}) => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call - replace with actual API
      const mockInventory: InventoryItem[] = [
        {
          id: 'inv_1',
          wineId: 'wine_1',
          quantity: 50,
          reservedQty: 5,
          availableQty: 45,
          damagedQty: 0,
          location: 'main_warehouse',
          warehouse: 'Warehouse A',
          zone: 'A1',
          temperature: 12.5,
          humidity: 65,
          lowStockThreshold: 10,
          reorderPoint: 5,
          maxStockLevel: 100,
          batchNumber: 'B2024001',
          lotNumber: 'L001',
          unitCost: 25.50,
          totalValue: 1275,
          createdAt: new Date(),
          updatedAt: new Date(),
          wine: {
            id: 'wine_1',
            name: 'Château Margaux 2015',
            producer: 'Château Margaux',
            sku: 'CM2015',
            category: 'Red Wine',
            currentPrice: 899.99
          }
        },
        {
          id: 'inv_2',
          wineId: 'wine_2',
          quantity: 3,
          reservedQty: 0,
          availableQty: 3,
          damagedQty: 0,
          location: 'main_warehouse',
          warehouse: 'Warehouse A',
          zone: 'A2',
          temperature: 12.0,
          humidity: 68,
          lowStockThreshold: 10,
          reorderPoint: 5,
          maxStockLevel: 50,
          batchNumber: 'B2024002',
          lotNumber: 'L002',
          unitCost: 150.00,
          totalValue: 450,
          createdAt: new Date(),
          updatedAt: new Date(),
          wine: {
            id: 'wine_2',
            name: 'Dom Pérignon 2012',
            producer: 'Dom Pérignon',
            sku: 'DP2012',
            category: 'Champagne',
            currentPrice: 299.99
          }
        }
      ]

      // Apply filters
      let filteredItems = mockInventory
      if (filters.lowStock) {
        filteredItems = filteredItems.filter(item => item.availableQty <= item.lowStockThreshold)
      }
      if (filters.outOfStock) {
        filteredItems = filteredItems.filter(item => item.availableQty <= 0)
      }
      if (filters.location) {
        filteredItems = filteredItems.filter(item => item.location === filters.location)
      }

      setInventory({
        items: filteredItems,
        total: filteredItems.length,
        page: 1,
        totalPages: 1
      })
    } catch (err) {
      setError('Failed to fetch inventory')
      console.error('Error fetching inventory:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchAlerts = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Mock alerts based on inventory
      const mockAlerts: InventoryAlert[] = [
        {
          id: 'alert_1',
          type: 'LOW_STOCK',
          severity: 'HIGH',
          wineId: 'wine_2',
          inventoryId: 'inv_2',
          message: 'Dom Pérignon 2012 is below low stock threshold (3/10)',
          threshold: 10,
          currentValue: 3,
          isResolved: false,
          createdAt: new Date()
        }
      ]

      setAlerts({
        alerts: mockAlerts,
        total: mockAlerts.length,
        page: 1,
        totalPages: 1
      })
    } catch (err) {
      setError('Failed to fetch alerts')
      console.error('Error fetching alerts:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchReport = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const mockReport: InventoryReport = {
        totalProducts: 2,
        totalValue: 1725,
        lowStockItems: 1,
        outOfStockItems: 0,
        expiringItems: 0,
        damagedItems: 0,
        turnoverRate: 2.5,
        averageDaysInStock: 45,
        topMovingProducts: [
          {
            wineId: 'wine_1',
            name: 'Château Margaux 2015',
            quantitySold: 25,
            revenue: 22499.75
          }
        ],
        slowMovingProducts: [
          {
            wineId: 'wine_2',
            name: 'Dom Pérignon 2012',
            daysInStock: 120,
            currentStock: 3
          }
        ]
      }

      setReport(mockReport)
    } catch (err) {
      setError('Failed to fetch report')
      console.error('Error fetching report:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  const updateInventory = useCallback(async (inventoryId: string, data: any) => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call
      console.log('Updating inventory:', inventoryId, data)
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === inventoryId 
            ? { 
                ...item, 
                ...data,
                availableQty: Math.max(0, (data.quantity || item.quantity) - (data.reservedQty || item.reservedQty) - (data.damagedQty || item.damagedQty)),
                totalValue: data.unitCost ? (data.quantity || item.quantity) * data.unitCost : item.totalValue,
                updatedAt: new Date()
              }
            : item
        )
      }))
    } catch (err) {
      setError('Failed to update inventory')
      console.error('Error updating inventory:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const bulkUpdateInventory = useCallback(async (updates: any[]) => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call
      console.log('Bulk updating inventory:', updates)
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        items: prev.items.map(item => {
          const update = updates.find(u => u.inventoryId === item.id)
          if (update) {
            const newData = { ...item, ...update.data, updatedAt: new Date() }
            newData.availableQty = Math.max(0, (newData.quantity || item.quantity) - (newData.reservedQty || item.reservedQty) - (newData.damagedQty || item.damagedQty))
            if (newData.unitCost) {
              newData.totalValue = (newData.quantity || item.quantity) * newData.unitCost
            }
            return newData
          }
          return item
        })
      }))
    } catch (err) {
      setError('Failed to bulk update inventory')
      console.error('Error bulk updating inventory:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const reserveInventory = useCallback(async (wineId: string, quantity: number, location: string = 'main_warehouse') => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call
      console.log('Reserving inventory:', wineId, quantity, location)
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.wineId === wineId && item.location === location
            ? { 
                ...item, 
                reservedQty: item.reservedQty + quantity,
                availableQty: Math.max(0, item.availableQty - quantity),
                updatedAt: new Date()
              }
            : item
        )
      }))

      return true
    } catch (err) {
      setError('Failed to reserve inventory')
      console.error('Error reserving inventory:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const releaseReservedInventory = useCallback(async (wineId: string, quantity: number, location: string = 'main_warehouse') => {
    setLoading(true)
    setError(null)

    try {
      // Mock API call
      console.log('Releasing reserved inventory:', wineId, quantity, location)
      
      // Update local state
      setInventory(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.wineId === wineId && item.location === location
            ? { 
                ...item, 
                reservedQty: Math.max(0, item.reservedQty - quantity),
                availableQty: item.availableQty + quantity,
                updatedAt: new Date()
              }
            : item
        )
      }))
    } catch (err) {
      setError('Failed to release reserved inventory')
      console.error('Error releasing reserved inventory:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    inventory,
    alerts,
    report,
    loading,
    error,
    fetchInventory,
    fetchAlerts,
    fetchReport,
    updateInventory,
    bulkUpdateInventory,
    reserveInventory,
    releaseReservedInventory
  }
}