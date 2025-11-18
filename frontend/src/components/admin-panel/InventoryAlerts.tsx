'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Package, 
  AlertTriangle, 
  AlertCircle, 
  CheckCircle,
  TrendingDown,
  TrendingUp,
  Bell,
  Search,
  Filter
} from 'lucide-react'
import { adminPanelApi, InventoryAlert } from '../../lib/admin-panel-api'

type AlertFilter = 'all' | 'low' | 'out_of_stock' | 'overstocked'

export function InventoryAlerts() {
  const [alerts, setAlerts] = useState<InventoryAlert[]>([])
  const [stockLevels, setStockLevels] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<AlertFilter>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchInventoryData()
  }, [])

  const fetchInventoryData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [alertsData, levelsData] = await Promise.all([
        adminPanelApi.getInventoryAlerts(),
        adminPanelApi.getStockLevels()
      ])
      setAlerts(alertsData)
      setStockLevels(levelsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load inventory data')
    } finally {
      setLoading(false)
    }
  }

  const filteredAlerts = alerts.filter(alert => {
    const matchesFilter = filter === 'all' || alert.status === filter
    const matchesSearch = alert.productName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'low':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'out_of_stock':
        return <AlertCircle className="w-5 h-5 text-red-500" />
      case 'overstocked':
        return <TrendingUp className="w-5 h-5 text-blue-500" />
      default:
        return <CheckCircle className="w-5 h-5 text-green-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'overstocked':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'text-green-600'
      case 'low_stock':
        return 'text-yellow-600'
      case 'out_of_stock':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchInventoryData}>Retry</Button>
      </div>
    )
  }

  const alertCounts = {
    total: alerts.length,
    low: alerts.filter(a => a.status === 'low').length,
    out_of_stock: alerts.filter(a => a.status === 'out_of_stock').length,
    overstocked: alerts.filter(a => a.status === 'overstocked').length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Inventory Alerts</h2>
          <p className="text-muted-olive">Stock levels and inventory notifications</p>
        </div>
        <Button onClick={fetchInventoryData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Total Alerts</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {alertCounts.total}
              </p>
              <p className="text-sm text-gray-600 mt-1">Active notifications</p>
            </div>
            <Bell className="w-8 h-8 text-gray-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Low Stock</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {alertCounts.low}
              </p>
              <p className="text-sm text-yellow-600 mt-1">Needs restocking</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Out of Stock</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {alertCounts.out_of_stock}
              </p>
              <p className="text-sm text-red-600 mt-1">Urgent action needed</p>
            </div>
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Overstocked</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {alertCounts.overstocked}
              </p>
              <p className="text-sm text-blue-600 mt-1">Consider promotion</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as AlertFilter)}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              <option value="all">All Alerts ({alertCounts.total})</option>
              <option value="low">Low Stock ({alertCounts.low})</option>
              <option value="out_of_stock">Out of Stock ({alertCounts.out_of_stock})</option>
              <option value="overstocked">Overstocked ({alertCounts.overstocked})</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Active Alerts</h3>
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${getStatusColor(alert.status)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    {getStatusIcon(alert.status)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.productName}</h4>
                      <div className="mt-1 text-sm">
                        <p>Current Stock: <span className="font-semibold">{alert.currentStock}</span></p>
                        <p>Minimum Stock: <span className="font-semibold">{alert.minimumStock}</span></p>
                        <p className="text-xs text-gray-500 mt-1">
                          Last updated: {new Date(alert.lastUpdated).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      View Product
                    </Button>
                    <Button size="sm">
                      Restock
                    </Button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No alerts match your search criteria' : 'No alerts found'}
            </div>
          )}
        </div>
      </Card>

      {/* Stock Levels Overview */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Stock Levels Overview</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-right py-3 px-4">Current Stock</th>
                <th className="text-right py-3 px-4">Reserved</th>
                <th className="text-right py-3 px-4">Available</th>
                <th className="text-right py-3 px-4">Reorder Point</th>
                <th className="text-center py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {stockLevels.slice(0, 10).map((item) => (
                <tr key={item.productId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-charcoal-black">{item.productName}</p>
                      <p className="text-sm text-gray-500">ID: {item.productId}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {item.currentStock}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {item.reservedStock}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {item.availableStock}
                  </td>
                  <td className="text-right py-3 px-4 text-gray-600">
                    {item.reorderPoint}
                  </td>
                  <td className="text-center py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.status === 'in_stock' ? 'bg-green-100 text-green-800' :
                      item.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {stockLevels.length > 10 && (
          <div className="mt-4 text-center">
            <Button variant="outline">View All Stock Levels</Button>
          </div>
        )}
      </Card>
    </div>
  )
}