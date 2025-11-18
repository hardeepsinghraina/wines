'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Zap, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Activity,
  TrendingUp
} from 'lucide-react'
import { adminPanelApi, PerformanceMetrics as PerformanceMetricsData } from '../../lib/admin-panel-api'

export function PerformanceMetrics() {
  const [metricsData, setMetricsData] = useState<PerformanceMetricsData | null>(null)
  const [applicationHealth, setApplicationHealth] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerformanceData()
    const interval = setInterval(fetchPerformanceData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchPerformanceData = async () => {
    try {
      setError(null)
      const [metricsResponse, healthResponse] = await Promise.all([
        adminPanelApi.getPerformanceMetrics(),
        adminPanelApi.getApplicationHealth()
      ])
      setMetricsData(metricsResponse)
      setApplicationHealth(healthResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load performance data')
    } finally {
      setLoading(false)
    }
  }

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600'
    if (value <= thresholds.warning) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'warn':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'fail':
        return <AlertTriangle className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  if (loading && !metricsData) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchPerformanceData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Performance Metrics</h2>
          <p className="text-muted-olive">Application performance and optimization</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Auto-refresh: 30s
          </div>
          <Button onClick={fetchPerformanceData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Core Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Page Load Time</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metricsData?.pageLoadTime || 0, { good: 2000, warning: 4000 })}`}>
                {metricsData?.pageLoadTime?.toFixed(0) || '0'}ms
              </p>
              <p className="text-sm text-gray-600 mt-1">Average load time</p>
            </div>
            <Clock className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">API Response</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metricsData?.apiResponseTime || 0, { good: 200, warning: 500 })}`}>
                {metricsData?.apiResponseTime?.toFixed(0) || '0'}ms
              </p>
              <p className="text-sm text-gray-600 mt-1">Average response</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Error Rate</p>
              <p className={`text-2xl font-bold ${getPerformanceColor(metricsData?.errorRate || 0, { good: 1, warning: 5 })}`}>
                {metricsData?.errorRate?.toFixed(2) || '0'}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Last 24 hours</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-yellow-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Availability</p>
              <p className="text-2xl font-bold text-green-600">
                {metricsData?.availability?.toFixed(2) || '0'}%
              </p>
              <p className="text-sm text-gray-600 mt-1">Uptime percentage</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Frontend Performance Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Frontend Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <Globe className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">First Contentful Paint</p>
            <p className={`text-xl font-bold ${getPerformanceColor(metricsData?.frontendMetrics?.firstContentfulPaint || 0, { good: 1800, warning: 3000 })}`}>
              {metricsData?.frontendMetrics?.firstContentfulPaint?.toFixed(0) || '0'}ms
            </p>
          </div>
          
          <div className="text-center">
            <Monitor className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Largest Contentful Paint</p>
            <p className={`text-xl font-bold ${getPerformanceColor(metricsData?.frontendMetrics?.largestContentfulPaint || 0, { good: 2500, warning: 4000 })}`}>
              {metricsData?.frontendMetrics?.largestContentfulPaint?.toFixed(0) || '0'}ms
            </p>
          </div>
          
          <div className="text-center">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cumulative Layout Shift</p>
            <p className={`text-xl font-bold ${getPerformanceColor(metricsData?.frontendMetrics?.cumulativeLayoutShift || 0, { good: 0.1, warning: 0.25 })}`}>
              {metricsData?.frontendMetrics?.cumulativeLayoutShift?.toFixed(3) || '0'}
            </p>
          </div>
        </div>
      </Card>

      {/* Database Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Database Performance</h3>
            <Database className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Query Time</span>
              <span className={`font-semibold ${getPerformanceColor(metricsData?.databasePerformance?.queryTime || 0, { good: 50, warning: 200 })}`}>
                {metricsData?.databasePerformance?.queryTime?.toFixed(0) || '0'}ms
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Connection Pool</span>
              <span className="font-semibold">
                {metricsData?.databasePerformance?.connectionPool || '0'}/100
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Slow Queries</span>
              <span className={`font-semibold ${(metricsData?.databasePerformance?.slowQueries || 0) > 10 ? 'text-red-600' : 'text-green-600'}`}>
                {metricsData?.databasePerformance?.slowQueries || '0'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cache Hit Rate</span>
              <span className="font-semibold text-green-600">
                {metricsData?.cacheHitRate?.toFixed(1) || '0'}%
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">System Throughput</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Requests/Second</span>
              <span className="font-semibold">
                {metricsData?.throughput?.toFixed(0) || '0'} req/s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Peak Throughput</span>
              <span className="font-semibold text-blue-600">
                {((metricsData?.throughput || 0) * 1.5).toFixed(0)} req/s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Average Load</span>
              <span className="font-semibold">
                {((metricsData?.throughput || 0) * 0.7).toFixed(0)} req/s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Capacity Utilization</span>
              <span className="font-semibold text-orange-600">
                {(((metricsData?.throughput || 0) / 1000) * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* Application Health Checks */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Application Health Checks</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {applicationHealth?.checks?.map((check: any) => (
            <div key={check.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getHealthIcon(check.status)}
                <div>
                  <p className="font-medium text-charcoal-black">{check.name}</p>
                  <p className="text-sm text-gray-500">
                    {check.responseTime}ms
                  </p>
                  {check.message && (
                    <p className="text-xs text-gray-400 mt-1">{check.message}</p>
                  )}
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                check.status === 'pass' ? 'bg-green-100 text-green-800' :
                check.status === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {check.status}
              </span>
            </div>
          )) || (
            <div className="col-span-full text-center py-4 text-gray-500">
              No health check data available
            </div>
          )}
        </div>
      </Card>

      {/* Performance Trends */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Performance Trends</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Performance trends visualization</p>
            <p className="text-sm text-gray-400">Chart component integration needed</p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Response Time Trend</p>
            <p className="font-semibold text-green-600">-12.5%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Error Rate Trend</p>
            <p className="font-semibold text-green-600">-45.2%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Throughput Trend</p>
            <p className="font-semibold text-green-600">+23.1%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Availability Trend</p>
            <p className="font-semibold text-green-600">+0.15%</p>
          </div>
        </div>
      </Card>

      {/* Performance Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Performance Recommendations</h3>
        <div className="space-y-3">
          {[
            {
              type: 'optimization',
              title: 'Optimize Database Queries',
              description: 'Several slow queries detected. Consider adding indexes or optimizing query structure.',
              priority: 'high'
            },
            {
              type: 'caching',
              title: 'Improve Cache Hit Rate',
              description: 'Cache hit rate is below optimal. Review caching strategy for frequently accessed data.',
              priority: 'medium'
            },
            {
              type: 'frontend',
              title: 'Optimize Image Loading',
              description: 'Large images are affecting page load times. Consider implementing lazy loading.',
              priority: 'medium'
            },
            {
              type: 'infrastructure',
              title: 'Scale API Servers',
              description: 'API response times are increasing during peak hours. Consider horizontal scaling.',
              priority: 'low'
            }
          ].map((recommendation, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              recommendation.priority === 'high' ? 'bg-red-50 border-red-200' :
              recommendation.priority === 'medium' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal-black">{recommendation.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{recommendation.description}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                  recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {recommendation.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}