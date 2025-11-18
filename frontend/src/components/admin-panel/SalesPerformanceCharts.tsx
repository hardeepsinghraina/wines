'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Users,
  CreditCard,
  Calendar,
  Download
} from 'lucide-react'
import { adminPanelApi, SalesData } from '../../lib/admin-panel-api'

interface ChartData {
  revenue: SalesData[]
  orders: SalesData[]
  conversion: SalesData[]
}

export function SalesPerformanceCharts() {
  const [chartData, setChartData] = useState<ChartData | null>(null)
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSalesData()
  }, [timeRange])

  const fetchSalesData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminPanelApi.getSalesChartData(timeRange)
      setChartData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales data')
    } finally {
      setLoading(false)
    }
  }

  const calculateGrowth = (data: SalesData[], metric: keyof SalesData) => {
    if (!data || data.length < 2) return 0
    const current = data[data.length - 1][metric] as number
    const previous = data[data.length - 2][metric] as number
    return previous > 0 ? ((current - previous) / previous) * 100 : 0
  }

  const getTotalRevenue = () => {
    if (!chartData?.revenue) return 0
    return chartData.revenue.reduce((sum, item) => sum + item.revenue, 0)
  }

  const getTotalOrders = () => {
    if (!chartData?.orders) return 0
    return chartData.orders.reduce((sum, item) => sum + item.orders, 0)
  }

  const getAverageConversion = () => {
    if (!chartData?.conversion) return 0
    const total = chartData.conversion.reduce((sum, item) => sum + item.conversionRate, 0)
    return total / chartData.conversion.length
  }

  const getCryptoRevenue = () => {
    if (!chartData?.revenue) return 0
    return chartData.revenue.reduce((sum, item) => sum + item.cryptoRevenue, 0)
  }

  const exportData = async () => {
    try {
      const blob = await adminPanelApi.exportData('sales', 'csv')
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `sales-data-${timeRange}.csv`
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
        <Button onClick={fetchSalesData}>Retry</Button>
      </div>
    )
  }

  const revenueGrowth = calculateGrowth(chartData?.revenue || [], 'revenue')
  const ordersGrowth = calculateGrowth(chartData?.orders || [], 'orders')
  const conversionGrowth = calculateGrowth(chartData?.conversion || [], 'conversionRate')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Sales Performance</h2>
          <p className="text-muted-olive">Charts and performance metrics</p>
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
          <Button onClick={exportData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Total Revenue</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${getTotalRevenue().toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {revenueGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ml-1 ${
                  revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {revenueGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Total Orders</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {getTotalOrders().toLocaleString()}
              </p>
              <div className="flex items-center mt-1">
                {ordersGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ml-1 ${
                  ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {ordersGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <ShoppingCart className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Conversion Rate</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {getAverageConversion().toFixed(1)}%
              </p>
              <div className="flex items-center mt-1">
                {conversionGrowth >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-green-600" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-sm ml-1 ${
                  conversionGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {conversionGrowth.toFixed(1)}%
                </span>
              </div>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Crypto Revenue</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${getCryptoRevenue().toLocaleString()}
              </p>
              <p className="text-sm text-muted-olive mt-1">
                {getTotalRevenue() > 0 ? ((getCryptoRevenue() / getTotalRevenue()) * 100).toFixed(1) : 0}% of total
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Revenue Trend</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Revenue chart visualization</p>
              <p className="text-sm text-gray-400">Chart component integration needed</p>
            </div>
          </div>
          {chartData?.revenue && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Peak Day</p>
                <p className="font-semibold">
                  ${Math.max(...chartData.revenue.map(d => d.revenue)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="font-semibold">
                  ${(getTotalRevenue() / chartData.revenue.length).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Growth</p>
                <p className={`font-semibold ${revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {revenueGrowth.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Orders Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Orders Trend</h3>
            <ShoppingCart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Orders chart visualization</p>
              <p className="text-sm text-gray-400">Chart component integration needed</p>
            </div>
          </div>
          {chartData?.orders && (
            <div className="mt-4 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-500">Peak Day</p>
                <p className="font-semibold">
                  {Math.max(...chartData.orders.map(d => d.orders)).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Average</p>
                <p className="font-semibold">
                  {(getTotalOrders() / chartData.orders.length).toFixed(0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Growth</p>
                <p className={`font-semibold ${ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {ordersGrowth.toFixed(1)}%
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Conversion Funnel</h3>
        <div className="space-y-4">
          {[
            { stage: 'Visitors', value: 10000, percentage: 100 },
            { stage: 'Product Views', value: 7500, percentage: 75 },
            { stage: 'Add to Cart', value: 2500, percentage: 25 },
            { stage: 'Checkout', value: 1500, percentage: 15 },
            { stage: 'Purchase', value: 750, percentage: 7.5 }
          ].map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <div className="w-32 text-sm font-medium">{stage.stage}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-gradient-to-r from-burgundy to-red-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
              <div className="w-20 text-right">
                <div className="font-semibold">{stage.value.toLocaleString()}</div>
                <div className="text-sm text-gray-500">{stage.percentage}%</div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}