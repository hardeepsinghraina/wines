'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  CreditCard,
  PieChart,
  BarChart3,
  Calendar,
  Download
} from 'lucide-react'
import { adminPanelApi, RevenueData } from '../../lib/admin-panel-api'

export function RevenueTracking() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [financialReports, setFinancialReports] = useState<any>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('monthly')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRevenueData()
  }, [timeRange, reportType])

  const fetchRevenueData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [revenueResponse, reportsResponse] = await Promise.all([
        adminPanelApi.getRevenueData(timeRange),
        adminPanelApi.getFinancialReports(reportType)
      ])
      setRevenueData(revenueResponse)
      setFinancialReports(reportsResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue data')
    } finally {
      setLoading(false)
    }
  }

  const exportRevenueData = async () => {
    try {
      const blob = await adminPanelApi.exportData('sales', 'xlsx')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `revenue-report-${timeRange}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Export failed:', err)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchRevenueData}>Retry</Button>
      </div>
    )
  }

  const cryptoPercentage = revenueData?.totalRevenue ? 
    (revenueData.cryptoRevenue / revenueData.totalRevenue) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Revenue Tracking</h2>
          <p className="text-muted-olive">Financial reports and revenue analysis</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as 'daily' | 'weekly' | 'monthly')}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="daily">Daily Reports</option>
            <option value="weekly">Weekly Reports</option>
            <option value="monthly">Monthly Reports</option>
          </select>
          <Button onClick={exportRevenueData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Total Revenue</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${revenueData?.totalRevenue?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600 ml-1">
                  +{financialReports?.revenueGrowth?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Crypto Revenue</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${revenueData?.cryptoRevenue?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-orange-600 mt-1">
                {cryptoPercentage.toFixed(1)}% of total
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Avg Order Value</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${financialReports?.averageOrderValue?.toFixed(2) || '0'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {financialReports?.totalOrders || '0'} orders
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Profit Margin</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {financialReports?.profitMargin?.toFixed(1) || '0'}%
              </p>
              <p className="text-sm text-purple-600 mt-1">Net margin</p>
            </div>
            <PieChart className="w-8 h-8 text-purple-600" />
          </div>
        </Card>
      </div>

      {/* Revenue Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Revenue Trend</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue trend chart</p>
              <p className="text-sm text-gray-400">Chart component integration needed</p>
            </div>
          </div>
          {revenueData?.revenueByMonth && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Peak Month</p>
                <p className="font-semibold">
                  ${Math.max(...revenueData.revenueByMonth.map(m => m.total)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="font-semibold">
                  ${(revenueData.revenueByMonth.reduce((sum, m) => sum + m.total, 0) / revenueData.revenueByMonth.length).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Growth</p>
                <p className="font-semibold text-green-600">
                  +{financialReports?.revenueGrowth?.toFixed(1) || '0'}%
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Payment Methods Distribution */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Payment Methods</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {revenueData?.paymentMethods?.map((method, index) => (
              <div key={method.method} className="flex items-center">
                <div className="w-24 text-sm font-medium">
                  {method.method}
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${
                        index === 0 ? 'bg-burgundy' :
                        index === 1 ? 'bg-orange-500' :
                        index === 2 ? 'bg-blue-500' :
                        'bg-gray-500'
                      }`}
                      style={{ width: `${method.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <div className="text-sm font-semibold">
                    ${method.revenue.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">
                    {method.percentage.toFixed(1)}%
                  </div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No payment method data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Top Products by Revenue */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Top Products by Revenue</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Orders</th>
                <th className="text-right py-3 px-4">Avg Order Value</th>
                <th className="text-right py-3 px-4">% of Total</th>
              </tr>
            </thead>
            <tbody>
              {revenueData?.revenueByProduct?.slice(0, 10).map((product, index) => (
                <tr key={product.productId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-charcoal-black">{product.productName}</p>
                      <p className="text-sm text-gray-500">ID: {product.productId}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    {product.orders}
                  </td>
                  <td className="text-right py-3 px-4">
                    ${(product.revenue / product.orders).toFixed(2)}
                  </td>
                  <td className="text-right py-3 px-4">
                    {revenueData?.totalRevenue ? 
                      ((product.revenue / revenueData.totalRevenue) * 100).toFixed(1) : '0'
                    }%
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No product revenue data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Financial Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Gross Revenue</span>
              <span className="font-semibold">${revenueData?.totalRevenue?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Crypto Revenue</span>
              <span className="font-semibold text-orange-600">
                ${revenueData?.cryptoRevenue?.toLocaleString() || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Fiat Revenue</span>
              <span className="font-semibold text-blue-600">
                ${revenueData?.fiatRevenue?.toLocaleString() || '0'}
              </span>
            </div>
            <hr />
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Orders</span>
              <span className="font-semibold">{financialReports?.totalOrders?.toLocaleString() || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">${financialReports?.averageOrderValue?.toFixed(2) || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Profit Margin</span>
              <span className="font-semibold text-green-600">
                {financialReports?.profitMargin?.toFixed(1) || '0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Growth Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Revenue Growth</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-semibold text-green-600">
                  +{financialReports?.revenueGrowth?.toFixed(1) || '0'}%
                </span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Order Growth</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-semibold text-green-600">+18.2%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Growth</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                <span className="font-semibold text-green-600">+25.7%</span>
              </div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Crypto Adoption</span>
              <div className="flex items-center">
                <TrendingUp className="w-4 h-4 text-orange-600 mr-1" />
                <span className="font-semibold text-orange-600">+42.1%</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}