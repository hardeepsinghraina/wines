'use client'

import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  PieChart
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PromotionalAnalytics } from '@shared/types/promotional-pricing'
import { PromotionalPricingAPI } from '@/lib/promotional-pricing-api'

interface PromotionalAnalyticsDashboardProps {
  promotionId: string
  className?: string
}

export function PromotionalAnalyticsDashboard({
  promotionId,
  className = ''
}: PromotionalAnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<PromotionalAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await PromotionalPricingAPI.getPromotionalAnalytics(promotionId)
        setAnalytics(data)
      } catch (error) {
        console.error('Failed to fetch promotional analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [promotionId])

  if (isLoading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
        <div className="h-64 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Promotional Analytics
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" size="sm">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Impressions"
          value={analytics.impressions.toLocaleString()}
          icon={Eye}
          trend={12.5}
          color="blue"
        />
        <MetricCard
          title="Clicks"
          value={analytics.clicks.toLocaleString()}
          icon={MousePointer}
          trend={8.3}
          color="green"
        />
        <MetricCard
          title="Conversions"
          value={analytics.conversions.toLocaleString()}
          icon={ShoppingCart}
          trend={15.7}
          color="purple"
        />
        <MetricCard
          title="Revenue"
          value={`$${analytics.revenue.toLocaleString()}`}
          icon={DollarSign}
          trend={22.1}
          color="emerald"
        />
      </div>

      {/* Conversion Funnel */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Conversion Funnel
        </h3>
        <ConversionFunnel analytics={analytics} />
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Breakdown */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customer Breakdown
          </h3>
          <CustomerBreakdown analytics={analytics} />
        </div>

        {/* Revenue Metrics */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Revenue Metrics
          </h3>
          <RevenueMetrics analytics={analytics} />
        </div>
      </div>

      {/* Top Performing Products */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Products
        </h3>
        <TopPerformingProducts products={analytics.topPerformingProducts} />
      </div>
    </div>
  )
}

// Metric card component
interface MetricCardProps {
  title: string
  value: string
  icon: React.ComponentType<any>
  trend?: number
  color: 'blue' | 'green' | 'purple' | 'emerald'
}

function MetricCard({ title, value, icon: Icon, trend, color }: MetricCardProps) {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    purple: 'text-purple-600 bg-purple-50',
    emerald: 'text-emerald-600 bg-emerald-50'
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend !== undefined && (
        <div className="flex items-center mt-3">
          {trend > 0 ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-sm text-gray-500 ml-1">vs last period</span>
        </div>
      )}
    </div>
  )
}

// Conversion funnel component
function ConversionFunnel({ analytics }: { analytics: PromotionalAnalytics }) {
  const steps = [
    { name: 'Impressions', value: analytics.impressions, percentage: 100 },
    { name: 'Clicks', value: analytics.clicks, percentage: analytics.viewToClick },
    { name: 'Conversions', value: analytics.conversions, percentage: analytics.clickToConversion }
  ]

  return (
    <div className="space-y-4">
      {steps.map((step, index) => (
        <div key={step.name} className="relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{step.name}</span>
            <span className="text-sm text-gray-500">
              {step.value.toLocaleString()} ({step.percentage.toFixed(1)}%)
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-burgundy to-red-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${step.percentage}%` }}
            />
          </div>
          {index < steps.length - 1 && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
              <div className="w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-400" />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// Customer breakdown component
function CustomerBreakdown({ analytics }: { analytics: PromotionalAnalytics }) {
  const total = analytics.newCustomers + analytics.returningCustomers
  const newPercentage = (analytics.newCustomers / total) * 100
  const returningPercentage = (analytics.returningCustomers / total) * 100

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span className="text-sm text-gray-600">New Customers</span>
        </div>
        <span className="text-sm font-medium">
          {analytics.newCustomers} ({newPercentage.toFixed(1)}%)
        </span>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Returning Customers</span>
        </div>
        <span className="text-sm font-medium">
          {analytics.returningCustomers} ({returningPercentage.toFixed(1)}%)
        </span>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Average Order Value</span>
          <span className="text-lg font-bold text-burgundy">
            ${analytics.averageOrderValue.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Revenue metrics component
function RevenueMetrics({ analytics }: { analytics: PromotionalAnalytics }) {
  const conversionValue = analytics.revenue / analytics.conversions
  const clickValue = analytics.revenue / analytics.clicks
  const impressionValue = analytics.revenue / analytics.impressions

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Revenue per Conversion</span>
        <span className="text-sm font-medium">${conversionValue.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Revenue per Click</span>
        <span className="text-sm font-medium">${clickValue.toFixed(2)}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Revenue per Impression</span>
        <span className="text-sm font-medium">${impressionValue.toFixed(2)}</span>
      </div>

      <div className="pt-4 border-t">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Total Revenue</span>
          <span className="text-xl font-bold text-green-600">
            ${analytics.revenue.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  )
}

// Top performing products component
function TopPerformingProducts({ products }: { products: any[] }) {
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No product performance data available
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-medium text-gray-700">Product</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Impressions</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Clicks</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Conversions</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Revenue</th>
            <th className="text-right py-3 px-4 font-medium text-gray-700">Conv. Rate</th>
          </tr>
        </thead>
        <tbody>
          {products.slice(0, 10).map((product, index) => (
            <tr key={product.productId} className="border-b border-gray-100">
              <td className="py-3 px-4">
                <div className="font-medium text-gray-900 truncate max-w-xs">
                  {product.productName}
                </div>
              </td>
              <td className="text-right py-3 px-4 text-gray-600">
                {product.impressions.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-gray-600">
                {product.clicks.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 text-gray-600">
                {product.conversions.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 font-medium text-green-600">
                ${product.revenue.toLocaleString()}
              </td>
              <td className="text-right py-3 px-4 font-medium text-burgundy">
                {product.conversionRate.toFixed(1)}%
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}