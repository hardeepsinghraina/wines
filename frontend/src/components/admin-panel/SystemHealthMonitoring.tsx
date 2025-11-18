'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Server, 
  Activity, 
  Cpu, 
  HardDrive,
  Wifi,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap
} from 'lucide-react'
import { adminPanelApi, SystemHealth } from '../../lib/admin-panel-api'

export function SystemHealthMonitoring() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null)
  const [systemMetrics, setSystemMetrics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSystemData()
    const interval = setInterval(fetchSystemData, 30000) // Update every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchSystemData = async () => {
    try {
      setError(null)
      const [healthData, metricsData] = await Promise.all([
        adminPanelApi.getSystemHealth(),
        adminPanelApi.getSystemMetrics()
      ])
      setSystemHealth(healthData)
      setSystemMetrics(metricsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system data')
    } finally {
      setLoading(false)
    }
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />
      case 'offline':
      case 'unhealthy':
        return <XCircle className="w-5 h-5 text-red-500" />
      default:
        return <Activity className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
      case 'healthy':
        return 'text-green-600 bg-green-100'
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100'
      case 'offline':
      case 'unhealthy':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getMetricColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600'
    if (value >= thresholds.warning) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (loading && !systemHealth) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchSystemData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">System Health Monitoring</h2>
          <p className="text-muted-olive">System monitoring and health checks</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            Auto-refresh: 30s
          </div>
          <Button onClick={fetchSystemData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-charcoal-black">System Status</h3>
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(systemHealth?.status || 'unknown')}`}>
            {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Uptime</p>
            <p className="text-lg font-semibold">
              {systemHealth?.uptime ? formatUptime(systemHealth.uptime) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <Zap className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Response Time</p>
            <p className="text-lg font-semibold">
              {systemHealth?.responseTime ? `${systemHealth.responseTime}ms` : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Error Rate</p>
            <p className="text-lg font-semibold">
              {systemHealth?.errorRate ? `${systemHealth.errorRate.toFixed(2)}%` : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <Activity className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Memory Usage</p>
            <p className="text-lg font-semibold">
              {systemHealth?.memoryUsage ? `${systemHealth.memoryUsage.toFixed(1)}%` : 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* System Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">CPU Usage</p>
              <p className={`text-2xl font-bold ${getMetricColor(systemMetrics?.cpu || 0, { warning: 70, critical: 90 })}`}>
                {systemMetrics?.cpu?.toFixed(1) || '0'}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    (systemMetrics?.cpu || 0) >= 90 ? 'bg-red-500' :
                    (systemMetrics?.cpu || 0) >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(systemMetrics?.cpu || 0, 100)}%` }}
                />
              </div>
            </div>
            <Cpu className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Memory Usage</p>
              <p className={`text-2xl font-bold ${getMetricColor(systemMetrics?.memory || 0, { warning: 80, critical: 95 })}`}>
                {systemMetrics?.memory?.toFixed(1) || '0'}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    (systemMetrics?.memory || 0) >= 95 ? 'bg-red-500' :
                    (systemMetrics?.memory || 0) >= 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(systemMetrics?.memory || 0, 100)}%` }}
                />
              </div>
            </div>
            <Activity className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Disk Usage</p>
              <p className={`text-2xl font-bold ${getMetricColor(systemMetrics?.disk || 0, { warning: 85, critical: 95 })}`}>
                {systemMetrics?.disk?.toFixed(1) || '0'}%
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${
                    (systemMetrics?.disk || 0) >= 95 ? 'bg-red-500' :
                    (systemMetrics?.disk || 0) >= 85 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(systemMetrics?.disk || 0, 100)}%` }}
                />
              </div>
            </div>
            <HardDrive className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Network I/O</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {systemMetrics?.network?.toFixed(1) || '0'} MB/s
              </p>
              <p className="text-sm text-muted-olive mt-1">Throughput</p>
            </div>
            <Wifi className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Services Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Services Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {systemHealth?.services?.map((service) => (
            <div key={service.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {getStatusIcon(service.status)}
                <div>
                  <p className="font-medium text-charcoal-black">{service.name}</p>
                  <p className="text-sm text-gray-500">
                    Response: {service.responseTime}ms
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(service.status)}`}>
                {service.status}
              </span>
            </div>
          )) || (
            <div className="col-span-full text-center py-4 text-gray-500">
              No service data available
            </div>
          )}
        </div>
      </Card>

      {/* System Alerts */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">System Alerts</h3>
        <div className="space-y-3">
          {[
            {
              type: 'warning',
              message: 'High CPU usage detected on server-01',
              timestamp: new Date(Date.now() - 300000), // 5 minutes ago
              severity: 'medium'
            },
            {
              type: 'info',
              message: 'Database backup completed successfully',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              severity: 'low'
            },
            {
              type: 'error',
              message: 'Failed to connect to external payment service',
              timestamp: new Date(Date.now() - 7200000), // 2 hours ago
              severity: 'high'
            }
          ].map((alert, index) => (
            <div key={index} className={`p-3 rounded-lg border ${
              alert.type === 'error' ? 'bg-red-50 border-red-200' :
              alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  {alert.type === 'error' ? (
                    <XCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-charcoal-black">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {alert.timestamp.toLocaleString()}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  alert.severity === 'high' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}