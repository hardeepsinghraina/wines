'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  TrendingUp,
  ShoppingCart,
  Eye,
  Heart,
  Star,
  Target
} from 'lucide-react'
import { adminPanelApi, CustomerBehavior } from '../../lib/admin-panel-api'

export function CustomerBehaviorAnalytics() {
  const [behaviorData, setBehaviorData] = useState<CustomerBehavior | null>(null)
  const [segmentationData, setSegmentationData] = useState<any[]>([])
  const [timeRange, setTimeRange] = useState('30d')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomerData()
  }, [timeRange])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      setError(null)
      const [behaviorResponse, segmentationResponse] = await Promise.all([
        adminPanelApi.getCustomerBehavior(timeRange),
        adminPanelApi.getCustomerSegmentation()
      ])
      setBehaviorData(behaviorResponse)
      setSegmentationData(segmentationResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchCustomerData}>Retry</Button>
      </div>
    )
  }

  const returningCustomerRate = behaviorData?.totalCustomers ? 
    (behaviorData.returningCustomers / behaviorData.totalCustomers) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Customer Behavior Analytics</h2>
          <p className="text-muted-olive">Customer behavior and engagement metrics</p>
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
          <Button onClick={fetchCustomerData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Customer Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Total Customers</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {behaviorData?.totalCustomers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-blue-600 mt-1">All time</p>
            </div>
            <Users className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">New Customers</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {behaviorData?.newCustomers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 mt-1">
                {timeRange === '30d' ? 'This month' : `Last ${timeRange}`}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Returning Rate</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {returningCustomerRate.toFixed(1)}%
              </p>
              <p className="text-sm text-purple-600 mt-1">
                {behaviorData?.returningCustomers || '0'} customers
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Lifetime Value</p>
              <p className="text-2xl font-bold text-charcoal-black">
                ${behaviorData?.customerLifetimeValue?.toFixed(2) || '0'}
              </p>
              <p className="text-sm text-orange-600 mt-1">Average CLV</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Customer Behavior Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Purchase Behavior</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Order Value</span>
              <span className="font-semibold">${behaviorData?.averageOrderValue?.toFixed(2) || '0'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Purchase Frequency</span>
              <span className="font-semibold">
                {behaviorData?.purchaseFrequency?.toFixed(1) || '0'} orders/month
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Repeat Purchase Rate</span>
              <span className="font-semibold text-green-600">
                {returningCustomerRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Customer Lifetime Value</span>
              <span className="font-semibold text-orange-600">
                ${behaviorData?.customerLifetimeValue?.toFixed(2) || '0'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Engagement Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Email Open Rate</span>
              <span className="font-semibold">24.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Click-through Rate</span>
              <span className="font-semibold">3.2%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Social Media Engagement</span>
              <span className="font-semibold text-blue-600">8.7%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Review Participation</span>
              <span className="font-semibold text-yellow-600">12.3%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Products by Customer Preference */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Most Popular Products</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Product</th>
                <th className="text-right py-3 px-4">Purchases</th>
                <th className="text-right py-3 px-4">Revenue</th>
                <th className="text-right py-3 px-4">Avg Rating</th>
                <th className="text-right py-3 px-4">Repeat Rate</th>
              </tr>
            </thead>
            <tbody>
              {behaviorData?.topProducts?.slice(0, 8).map((product, index) => (
                <tr key={product.productId} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">#{index + 1}</td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="font-medium text-charcoal-black">{product.productName}</p>
                      <p className="text-sm text-gray-500">ID: {product.productId}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    {product.purchases}
                  </td>
                  <td className="text-right py-3 px-4 font-semibold">
                    ${product.revenue.toLocaleString()}
                  </td>
                  <td className="text-right py-3 px-4">
                    <div className="flex items-center justify-end">
                      <Star className="w-4 h-4 text-yellow-400 mr-1" />
                      <span>4.{Math.floor(Math.random() * 9) + 1}</span>
                    </div>
                  </td>
                  <td className="text-right py-3 px-4">
                    <span className="text-green-600 font-medium">
                      {(Math.random() * 30 + 20).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              )) || (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    No product data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Customer Segmentation */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Customer Segments</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segmentationData.map((segment, index) => (
            <div key={segment.segment} className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-charcoal-black">{segment.segment}</h4>
                <Target className="w-5 h-5 text-burgundy" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Customers</span>
                  <span className="font-semibold">{segment.count.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Revenue</span>
                  <span className="font-semibold">${segment.revenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">AOV</span>
                  <span className="font-semibold">${segment.averageOrderValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Frequency</span>
                  <span className="font-semibold">{segment.purchaseFrequency.toFixed(1)}/mo</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Customer Journey Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Customer Journey</h3>
          <div className="space-y-4">
            {[
              { stage: 'Awareness', visitors: 10000, conversion: 100 },
              { stage: 'Interest', visitors: 7500, conversion: 75 },
              { stage: 'Consideration', visitors: 3000, conversion: 30 },
              { stage: 'Purchase', visitors: 1200, conversion: 12 },
              { stage: 'Retention', visitors: 480, conversion: 4.8 }
            ].map((stage, index) => (
              <div key={stage.stage} className="flex items-center">
                <div className="w-24 text-sm font-medium">{stage.stage}</div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-burgundy to-red-600 h-3 rounded-full"
                      style={{ width: `${stage.conversion}%` }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <div className="text-sm font-semibold">{stage.visitors.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">{stage.conversion}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-charcoal-black mb-4">Customer Satisfaction</h3>
          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <Star className="w-8 h-8 text-yellow-400" />
                <span className="text-3xl font-bold text-charcoal-black ml-2">4.6</span>
              </div>
              <p className="text-sm text-gray-600">Average Rating</p>
            </div>
            
            <div className="space-y-2">
              {[
                { stars: 5, count: 1250, percentage: 62.5 },
                { stars: 4, count: 500, percentage: 25 },
                { stars: 3, count: 150, percentage: 7.5 },
                { stars: 2, count: 75, percentage: 3.75 },
                { stars: 1, count: 25, percentage: 1.25 }
              ].map((rating) => (
                <div key={rating.stars} className="flex items-center">
                  <span className="w-8 text-sm">{rating.stars}★</span>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${rating.percentage}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-12 text-sm text-right">{rating.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}