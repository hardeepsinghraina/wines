'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  CreditCard,
  Eye,
  Clock
} from 'lucide-react'
import { adminPanelApi } from '../../lib/admin-panel-api'

interface DashboardStats {
  totalProducts: number
  activeUsers: number
  ordersToday: number
  revenue: number
  cryptoRevenue: number
  conversionRate: number
  avgOrderValue: number
  customerSatisfaction: number
  systemUptime: number
  responseTime: number
}

interface RecentActivity {
  id: string
  type: 'order' | 'user' | 'product' | 'payment'
  message: string
  timestamp: Date
  status: 'success' | 'warning' | 'error'
}

interface Alert {
  id: string
  type: 'inventory' | 'system' | 'payment' | 'security'
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: Date
}

export function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setError(null)
      const [statsData, activityData, alertsData] = await Promise.all([
        adminPanelApi.getDashboardStats(),
        adminPanelApi.getRecentActivity(),
        adminPanelApi.getAlerts()
      ])

      setStats(statsData)
      setRecentActivity(activityData)
      setAlerts(alertsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading && !stats) {
    return <Loading />
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={fetchDashboardData}>Retry</Button>
      </div>
    )
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts?.toLocaleString() || '0',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: stats?.activeUsers?.toLocaleString() || '0',
      change: '+8%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Orders Today',
      value: stats?.ordersToday?.toLocaleString() || '0',
      change: '+23%',
      changeType: 'positive' as const,
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      title: 'Total Revenue',
      value: `$${stats?.revenue?.toLocaleString() || '0'}`,
      change: '+15%',
      changeType: 'positive' as const,
      icon: DollarSign,
      color: 'text-yellow-600'
    },
    {
      title: 'Crypto Revenue',
      value: `$${stats?.cryptoRevenue?.toLocaleString() || '0'}`,
      change: '+28%',
      changeType: 'positive' as const,
      icon: CreditCard,
      color: 'text-orange-600'
    },
    {
      title: 'Conversion Rate',
      value: `${stats?.conversionRate?.toFixed(1) || '0'}%`,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'text-indigo-600'
    },
    {
      title: 'Avg Order Value',
      value: `$${stats?.avgOrderValue?.toFixed(2) || '0'}`,
      change: '+5.2%',
      changeType: 'positive' as const,
      icon: Eye,
      color: 'text-pink-600'
    },
    {
      title: 'System Uptime',
      value: `${stats?.systemUptime?.toFixed(1) || '0'}%`,
      change: stats?.systemUptime && stats.systemUptime > 99 ? '+0.1%' : '-0.2%',
      changeType: stats?.systemUptime && stats.systemUptime > 99 ? 'positive' as const : 'negative' as const,
      icon: Activity,
      color: 'text-teal-600'
    }
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order': return ShoppingCart
      case 'user': return Users
      case 'product': return Package
      case 'payment': return CreditCard
      default: return Activity
    }
  }

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-yellow-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">Dashboard Overview</h2>
          <p className="text-muted-olive">Key metrics and system status</p>
        </div>
        <Button onClick={fetchDashboardData} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-olive">{stat.title}</p>
                <p className="text-2xl font-bold text-charcoal-black">{stat.value}</p>
                <div className="flex items-center mt-1">
                  {stat.changeType === 'positive' ? (
                    <ArrowUpRight className="w-4 h-4 text-green-600" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-600" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change} from last month
                  </span>
                </div>
              </div>
              <stat.icon className={`w-8 h-8 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Recent Activity</h3>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {recentActivity.slice(0, 5).map((activity) => {
              const ActivityIcon = getActivityIcon(activity.type)
              return (
                <div key={activity.id} className="flex items-start space-x-3">
                  <div className={`p-2 rounded-full ${getActivityColor(activity.status)} bg-opacity-10`}>
                    <ActivityIcon className={`w-4 h-4 ${getActivityColor(activity.status)}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-charcoal-black">{activity.message}</p>
                    <div className="flex items-center mt-1">
                      <Clock className="w-3 h-3 text-gray-400 mr-1" />
                      <p className="text-xs text-gray-500">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">System Alerts</h3>
            <Button variant="outline" size="sm">Manage Alerts</Button>
          </div>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium">{alert.title}</h4>
                    <p className="text-sm mt-1">{alert.message}</p>
                    <div className="flex items-center mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      <span className="text-xs">
                        {new Date(alert.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-medium uppercase px-2 py-1 rounded">
                    {alert.severity}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button className="h-20 flex-col space-y-2">
            <Package className="w-6 h-6" />
            <span>Add Product</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Users className="w-6 h-6" />
            <span>Manage Users</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <ShoppingCart className="w-6 h-6" />
            <span>View Orders</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <TrendingUp className="w-6 h-6" />
            <span>Analytics</span>
          </Button>
        </div>
      </Card>
    </div>
  )
}