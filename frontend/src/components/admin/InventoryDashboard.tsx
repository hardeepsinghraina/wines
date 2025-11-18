'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { Modal } from '../ui/Modal'
import { InventoryTable } from './InventoryTable'
import { InventoryAlerts } from './InventoryAlerts'
import { InventoryAnalytics } from './InventoryAnalytics'
import { InventoryForecast } from './InventoryForecast'
import { BulkInventoryUpdate } from './BulkInventoryUpdate'
import { useInventory } from '../../hooks/useInventory'

interface InventoryDashboardProps {
  className?: string
}

export const InventoryDashboard: React.FC<InventoryDashboardProps> = ({
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts' | 'analytics' | 'forecast'>('overview')
  const [showBulkUpdate, setShowBulkUpdate] = useState(false)
  const [filters, setFilters] = useState({
    location: '',
    lowStock: false,
    outOfStock: false,
    expiringSoon: false
  })

  const {
    inventory,
    alerts,
    report,
    loading,
    error,
    fetchInventory,
    fetchAlerts,
    fetchReport,
    updateInventory,
    bulkUpdateInventory
  } = useInventory()

  useEffect(() => {
    fetchInventory(filters)
    fetchAlerts()
    fetchReport()
  }, [filters])

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters)
  }

  const handleInventoryUpdate = async (inventoryId: string, data: any) => {
    try {
      await updateInventory(inventoryId, data)
      fetchInventory(filters)
      fetchReport()
    } catch (error) {
      console.error('Failed to update inventory:', error)
    }
  }

  const handleBulkUpdate = async (updates: any[]) => {
    try {
      await bulkUpdateInventory(updates)
      setShowBulkUpdate(false)
      fetchInventory(filters)
      fetchReport()
    } catch (error) {
      console.error('Failed to bulk update inventory:', error)
    }
  }

  if (loading && !inventory.items.length) {
    return <Loading />
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">
            Manage stock levels, track movements, and monitor alerts
          </p>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={() => setShowBulkUpdate(true)}
          >
            Bulk Update
          </Button>
          <Button
            onClick={() => {
              fetchInventory(filters)
              fetchAlerts()
              fetchReport()
            }}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      {report && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Products</p>
                <p className="text-2xl font-bold text-gray-900">{report.totalProducts}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-900">
                  €{report.totalValue.toLocaleString()}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900">{report.lowStockItems}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">{report.outOfStockItems}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: '📊' },
            { key: 'alerts', label: 'Alerts', icon: '🚨', badge: alerts.alerts.length },
            { key: 'analytics', label: 'Analytics', icon: '📈' },
            { key: 'forecast', label: 'Forecast', icon: '🔮' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && tab.badge > 0 && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'overview' && (
          <InventoryTable
            inventory={inventory}
            filters={filters}
            onFilterChange={handleFilterChange}
            onInventoryUpdate={handleInventoryUpdate}
            loading={loading}
          />
        )}

        {activeTab === 'alerts' && (
          <InventoryAlerts
            alerts={alerts}
            onRefresh={() => fetchAlerts()}
            loading={loading}
          />
        )}

        {activeTab === 'analytics' && (
          <InventoryAnalytics
            report={report}
            loading={loading}
          />
        )}

        {activeTab === 'forecast' && (
          <InventoryForecast
            loading={loading}
          />
        )}
      </div>

      {/* Bulk Update Modal */}
      <Modal
        isOpen={showBulkUpdate}
        onClose={() => setShowBulkUpdate(false)}
        title="Bulk Inventory Update"
        size="lg"
      >
        <BulkInventoryUpdate
          onUpdate={handleBulkUpdate}
          onCancel={() => setShowBulkUpdate(false)}
        />
      </Modal>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
    </div>
  )
}