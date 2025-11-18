'use client'

import React, { useState } from 'react'
import { Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'

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

interface InventoryAlertsProps {
  alerts: {
    alerts: InventoryAlert[]
    total: number
    page: number
    totalPages: number
  }
  onRefresh: () => void
  loading: boolean
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  alerts,
  onRefresh,
  loading
}) => {
  const [filter, setFilter] = useState<{
    type: string
    severity: string
    resolved: boolean | null
  }>({
    type: '',
    severity: '',
    resolved: null
  })

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return '🚫'
      case 'LOW_STOCK':
        return '⚠️'
      case 'REORDER_POINT':
        return '📦'
      case 'EXPIRY_WARNING':
        return '⏰'
      case 'DAMAGED_STOCK':
        return '💔'
      default:
        return '🔔'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'text-red-600 bg-red-100 border-red-200'
      case 'HIGH':
        return 'text-orange-600 bg-orange-100 border-orange-200'
      case 'MEDIUM':
        return 'text-yellow-600 bg-yellow-100 border-yellow-200'
      case 'LOW':
        return 'text-blue-600 bg-blue-100 border-blue-200'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-200'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'OUT_OF_STOCK':
        return 'Out of Stock'
      case 'LOW_STOCK':
        return 'Low Stock'
      case 'REORDER_POINT':
        return 'Reorder Point'
      case 'EXPIRY_WARNING':
        return 'Expiry Warning'
      case 'DAMAGED_STOCK':
        return 'Damaged Stock'
      default:
        return type
    }
  }

  const filteredAlerts = alerts.alerts.filter(alert => {
    if (filter.type && alert.type !== filter.type) return false
    if (filter.severity && alert.severity !== filter.severity) return false
    if (filter.resolved !== null && alert.isResolved !== filter.resolved) return false
    return true
  })

  const groupedAlerts = filteredAlerts.reduce((groups, alert) => {
    const key = alert.severity
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(alert)
    return groups
  }, {} as Record<string, InventoryAlert[]>)

  const severityOrder = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {severityOrder.map(severity => {
          const count = alerts.alerts.filter(alert => alert.severity === severity && !alert.isResolved).length
          const color = getSeverityColor(severity)
          
          return (
            <Card key={severity} className={`p-4 border-l-4 ${color}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium capitalize">{severity.toLowerCase()} Alerts</p>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
                <div className="text-2xl">
                  {severity === 'CRITICAL' && '🚨'}
                  {severity === 'HIGH' && '⚠️'}
                  {severity === 'MEDIUM' && '🔶'}
                  {severity === 'LOW' && 'ℹ️'}
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Types</option>
              <option value="OUT_OF_STOCK">Out of Stock</option>
              <option value="LOW_STOCK">Low Stock</option>
              <option value="REORDER_POINT">Reorder Point</option>
              <option value="EXPIRY_WARNING">Expiry Warning</option>
              <option value="DAMAGED_STOCK">Damaged Stock</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Severity
            </label>
            <select
              value={filter.severity}
              onChange={(e) => setFilter({ ...filter, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filter.resolved === null ? '' : filter.resolved.toString()}
              onChange={(e) => setFilter({ 
                ...filter, 
                resolved: e.target.value === '' ? null : e.target.value === 'true'
              })}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Alerts</option>
              <option value="false">Active</option>
              <option value="true">Resolved</option>
            </select>
          </div>

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={onRefresh}
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Alerts List */}
      <div className="space-y-4">
        {loading ? (
          <Card className="p-8">
            <Loading />
          </Card>
        ) : filteredAlerts.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-4">🎉</div>
              <h3 className="text-lg font-medium mb-2">No alerts found</h3>
              <p>All inventory levels are within normal ranges.</p>
            </div>
          </Card>
        ) : (
          severityOrder.map(severity => {
            const severityAlerts = groupedAlerts[severity] || []
            if (severityAlerts.length === 0) return null

            return (
              <Card key={severity} className="overflow-hidden">
                <div className={`px-4 py-3 border-b ${getSeverityColor(severity)}`}>
                  <h3 className="text-lg font-medium capitalize">
                    {severity.toLowerCase()} Priority Alerts ({severityAlerts.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {severityAlerts.map((alert) => (
                    <div key={alert.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl">
                            {getAlertIcon(alert.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                                {getTypeLabel(alert.type)}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(alert.severity)}`}>
                                {alert.severity}
                              </span>
                              {alert.isResolved && (
                                <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full text-green-600 bg-green-100">
                                  Resolved
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-900 mb-2">
                              {alert.message}
                            </p>
                            {alert.threshold && alert.currentValue !== undefined && (
                              <div className="text-xs text-gray-500">
                                Current: {alert.currentValue} | Threshold: {alert.threshold}
                              </div>
                            )}
                            <div className="text-xs text-gray-400 mt-2">
                              Created: {new Date(alert.createdAt).toLocaleString()}
                              {alert.resolvedAt && (
                                <span className="ml-2">
                                  • Resolved: {new Date(alert.resolvedAt).toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Navigate to inventory item
                              console.log('Navigate to inventory item:', alert.inventoryId)
                            }}
                          >
                            View Item
                          </Button>
                          {!alert.isResolved && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Mark as resolved
                                console.log('Mark alert as resolved:', alert.id)
                              }}
                            >
                              Resolve
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => {
              // Generate reorder report
              console.log('Generate reorder report')
            }}
          >
            <span>📋</span>
            <span>Generate Reorder Report</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => {
              // Export alerts
              console.log('Export alerts')
            }}
          >
            <span>📤</span>
            <span>Export Alerts</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex items-center justify-center space-x-2"
            onClick={() => {
              // Configure alert settings
              console.log('Configure alert settings')
            }}
          >
            <span>⚙️</span>
            <span>Alert Settings</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}