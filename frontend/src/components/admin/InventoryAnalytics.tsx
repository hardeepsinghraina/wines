'use client'

import React from 'react'
import { Card } from '../ui/Card'
import { Loading } from '../ui/Loading'

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

interface InventoryAnalyticsProps {
  report: InventoryReport | null
  loading: boolean
}

export const InventoryAnalytics: React.FC<InventoryAnalyticsProps> = ({
  report,
  loading
}) => {
  if (loading || !report) {
    return <Loading />
  }

  const stockHealthScore = Math.max(0, 100 - (
    (report.outOfStockItems * 10) + 
    (report.lowStockItems * 5) + 
    (report.expiringItems * 3) + 
    (report.damagedItems * 2)
  ))

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Stock Health Score</p>
              <p className="text-2xl font-bold text-gray-900">{stockHealthScore.toFixed(0)}%</p>
              <p className="text-xs text-gray-500">
                {stockHealthScore >= 90 ? 'Excellent' : 
                 stockHealthScore >= 75 ? 'Good' : 
                 stockHealthScore >= 60 ? 'Fair' : 'Needs Attention'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Turnover Rate</p>
              <p className="text-2xl font-bold text-gray-900">{report.turnoverRate.toFixed(1)}x</p>
              <p className="text-xs text-gray-500">Annual inventory turns</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg. Days in Stock</p>
              <p className="text-2xl font-bold text-gray-900">{report.averageDaysInStock}</p>
              <p className="text-xs text-gray-500">Days on average</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Items Needing Attention</p>
              <p className="text-2xl font-bold text-gray-900">
                {report.outOfStockItems + report.lowStockItems + report.expiringItems}
              </p>
              <p className="text-xs text-gray-500">Require immediate action</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Stock Distribution */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Distribution</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">In Stock</span>
            <span className="text-sm font-medium text-gray-900">
              {report.totalProducts - report.outOfStockItems} products
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full" 
              style={{ 
                width: `${((report.totalProducts - report.outOfStockItems - report.lowStockItems) / report.totalProducts) * 100}%` 
              }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Low Stock</span>
            <span className="text-sm font-medium text-gray-900">{report.lowStockItems} products</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-yellow-500 h-2 rounded-full" 
              style={{ width: `${(report.lowStockItems / report.totalProducts) * 100}%` }}
            ></div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Out of Stock</span>
            <span className="text-sm font-medium text-gray-900">{report.outOfStockItems} products</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full" 
              style={{ width: `${(report.outOfStockItems / report.totalProducts) * 100}%` }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Top and Slow Moving Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Moving Products */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Moving Products (30 days)</h3>
          {report.topMovingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No sales data available</p>
          ) : (
            <div className="space-y-4">
              {report.topMovingProducts.slice(0, 5).map((product, index) => (
                <div key={product.wineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.quantitySold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      €{product.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500">Revenue</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Slow Moving Products */}
        <Card className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Slow Moving Products</h3>
          {report.slowMovingProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">All products are moving well</p>
          ) : (
            <div className="space-y-4">
              {report.slowMovingProducts.slice(0, 5).map((product, index) => (
                <div key={product.wineId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-yellow-600">⚠️</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.daysInStock} days in stock</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {product.currentStock} units
                    </p>
                    <p className="text-xs text-gray-500">Current stock</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Inventory Issues Summary */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Inventory Issues Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{report.outOfStockItems}</div>
            <div className="text-sm text-red-700">Out of Stock</div>
            <div className="text-xs text-red-500 mt-1">Immediate action required</div>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{report.lowStockItems}</div>
            <div className="text-sm text-yellow-700">Low Stock</div>
            <div className="text-xs text-yellow-500 mt-1">Consider reordering</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{report.expiringItems}</div>
            <div className="text-sm text-orange-700">Expiring Soon</div>
            <div className="text-xs text-orange-500 mt-1">Within 30 days</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{report.damagedItems}</div>
            <div className="text-sm text-purple-700">Damaged Items</div>
            <div className="text-xs text-purple-500 mt-1">Need disposition</div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Recommendations</h3>
        <div className="space-y-3">
          {report.outOfStockItems > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
              <div className="text-red-500">🚨</div>
              <div>
                <p className="text-sm font-medium text-red-800">
                  Urgent: {report.outOfStockItems} products are out of stock
                </p>
                <p className="text-xs text-red-600">
                  Review and reorder immediately to avoid lost sales
                </p>
              </div>
            </div>
          )}
          
          {report.lowStockItems > 5 && (
            <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
              <div className="text-yellow-500">⚠️</div>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  {report.lowStockItems} products are running low
                </p>
                <p className="text-xs text-yellow-600">
                  Consider bulk reordering to optimize costs
                </p>
              </div>
            </div>
          )}
          
          {report.slowMovingProducts.length > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
              <div className="text-blue-500">💡</div>
              <div>
                <p className="text-sm font-medium text-blue-800">
                  {report.slowMovingProducts.length} slow-moving products identified
                </p>
                <p className="text-xs text-blue-600">
                  Consider promotional pricing or bundling strategies
                </p>
              </div>
            </div>
          )}
          
          {stockHealthScore >= 90 && (
            <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
              <div className="text-green-500">✅</div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Excellent inventory health score!
                </p>
                <p className="text-xs text-green-600">
                  Your inventory management is performing well
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}