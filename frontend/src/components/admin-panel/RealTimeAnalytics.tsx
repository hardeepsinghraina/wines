'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Activity, 
  Users, 
  Eye, 
  MousePointer, 
  Clock,
  TrendingUp,
  Globe,
  Smartphone,
  Monitor,
  RefreshCw
} from 'lucide-react'
import { adminPanelApi, RealTimeAnalytics as RealTimeAnalyticsData } from '../../lib/admin-panel-api'

export function RealTimeAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<RealTimeAnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  useEffect(() => {
    fetchAnalyticsData()
    const interval = setInterval(() => {
      fetchAnalyticsData()
      setLastUpdated(new Date())
    }, 10000) // Update every 10 seconds for real-time data

    return () => clearInterval(interval)
  }, [])

  const fetchAnalyticsData = async () => {
    try {
      setError(null)
      const data = await adminPanelApi.getRealTimeAnalytics()
      setAnalyticsData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !analyticsData) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchAnalyticsData}>Retry</Button>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Real-time Analytics</h2>
          <p className="text-muted-olive">Live analytics and reporting</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 mr-1" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
          <Button onClick={fetchAnalyticsData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Current Visitors</p>
              <p className="text-3xl font-bold text-charcoal-black">
                {analyticsData?.currentVisitors?.toLocaleString() || '0'}
              </p>
              <div className="flex items-center mt-1">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                <span className="text-sm text-green-600">Live</span>
              </div>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Page Views</p>
              <p className="text-3xl font-bold text-charcoal-black">
                {analyticsData?.pageViews?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-muted-olive mt-1">Today</p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Bounce Rate</p>
              <p className="text-3xl font-bold text-charcoal-black">
                {analyticsData?.bounceRate?.toFixed(1) || '0'}%
              </p>
              <p className="text-sm text-muted-olive mt-1">Current session</p>
            </div>
            <MousePointer className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Avg Session</p>
              <p className="text-3xl font-bold text-charcoal-black">
                {analyticsData?.averageSessionDuration ? 
                  formatDuration(analyticsData.averageSessionDuration) : '0m 0s'}
              </p>
              <p className="text-sm text-muted-olive mt-1">Duration</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Top Pages</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {analyticsData?.topPages?.slice(0, 8).map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal-black truncate max-w-xs">
                      {page.page}
                    </p>
                    <p className="text-xs text-gray-500">
                      {page.uniqueViews} unique views
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{page.views}</p>
                  <p className="text-xs text-gray-500">views</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No page data available
              </div>
            )}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Traffic Sources</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analyticsData?.trafficSources?.map((source, index) => (
              <div key={source.source} className="flex items-center">
                <div className="w-24 text-sm font-medium truncate">
                  {source.source}
                </div>
                <div className="flex-1 mx-3">
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-burgundy to-red-600 h-2 rounded-full"
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <div className="text-sm font-semibold">{source.visitors}</div>
                  <div className="text-xs text-gray-500">{source.percentage.toFixed(1)}%</div>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No traffic source data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Conversions and Device Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversions */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Conversions</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-3xl font-bold text-charcoal-black">
                {analyticsData?.conversions?.rate?.toFixed(1) || '0'}%
              </p>
              <p className="text-sm text-muted-olive">Conversion Rate</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-lg font-semibold text-charcoal-black">
                  {analyticsData?.conversions?.total?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500">Total Conversions</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-charcoal-black">
                  ${analyticsData?.conversions?.value?.toLocaleString() || '0'}
                </p>
                <p className="text-xs text-gray-500">Conversion Value</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Device Types */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Device Types</h3>
            <Monitor className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {[
              { device: 'Desktop', percentage: 65, icon: Monitor },
              { device: 'Mobile', percentage: 30, icon: Smartphone },
              { device: 'Tablet', percentage: 5, icon: Monitor }
            ].map((item) => (
              <div key={item.device} className="flex items-center">
                <item.icon className="w-4 h-4 text-gray-400 mr-3" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{item.device}</span>
                    <span className="text-sm text-gray-500">{item.percentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-burgundy h-2 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Real-time Activity Feed */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Live Activity</h3>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </div>
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {[
              { action: 'New visitor from United States', time: '2s ago' },
              { action: 'Purchase completed - $299', time: '15s ago' },
              { action: 'User added item to cart', time: '32s ago' },
              { action: 'New visitor from Canada', time: '45s ago' },
              { action: 'User viewed product page', time: '1m ago' },
              { action: 'Newsletter signup', time: '2m ago' }
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-charcoal-black">{activity.action}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}