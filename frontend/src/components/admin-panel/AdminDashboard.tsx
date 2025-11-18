'use client'

import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  BarChart3, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  AlertTriangle,
  Activity,
  Server,
  Eye,
  Bell,
  Zap
} from 'lucide-react'
import { DashboardOverview } from './DashboardOverview'
import { SalesPerformanceCharts } from './SalesPerformanceCharts'
import { UserActivityMonitoring } from './UserActivityMonitoring'
import { InventoryAlerts } from './InventoryAlerts'
import { SystemHealthMonitoring } from './SystemHealthMonitoring'
import { RevenueTracking } from './RevenueTracking'
import { CustomerBehaviorAnalytics } from './CustomerBehaviorAnalytics'
import { PerformanceMetrics } from './PerformanceMetrics'
import { RealTimeAnalytics } from './RealTimeAnalytics'

type DashboardView = 
  | 'overview' 
  | 'sales' 
  | 'users' 
  | 'inventory' 
  | 'system' 
  | 'revenue' 
  | 'behavior' 
  | 'performance'
  | 'analytics'

export function AdminDashboard() {
  const { user } = useAdminAuth()
  const [activeView, setActiveView] = useState<DashboardView>('overview')
  const [loading, setLoading] = useState(false)

  const navigationItems = [
    {
      id: 'overview' as DashboardView,
      label: 'Dashboard Overview',
      icon: BarChart3,
      description: 'Key metrics and system overview'
    },
    {
      id: 'analytics' as DashboardView,
      label: 'Real-time Analytics',
      icon: Activity,
      description: 'Live analytics and reporting'
    },
    {
      id: 'sales' as DashboardView,
      label: 'Sales Performance',
      icon: TrendingUp,
      description: 'Sales charts and performance metrics'
    },
    {
      id: 'users' as DashboardView,
      label: 'User Activity',
      icon: Users,
      description: 'User monitoring and activity tracking'
    },
    {
      id: 'inventory' as DashboardView,
      label: 'Inventory Alerts',
      icon: Bell,
      description: 'Stock levels and inventory notifications'
    },
    {
      id: 'system' as DashboardView,
      label: 'System Health',
      icon: Server,
      description: 'System monitoring and health checks'
    },
    {
      id: 'revenue' as DashboardView,
      label: 'Revenue Tracking',
      icon: DollarSign,
      description: 'Financial reports and revenue analysis'
    },
    {
      id: 'behavior' as DashboardView,
      label: 'Customer Analytics',
      icon: Eye,
      description: 'Customer behavior and engagement metrics'
    },
    {
      id: 'performance' as DashboardView,
      label: 'Performance Metrics',
      icon: Zap,
      description: 'Application performance and optimization'
    }
  ]

  const handleViewChange = (view: DashboardView) => {
    setLoading(true)
    setActiveView(view)
    // Simulate loading time for better UX
    setTimeout(() => setLoading(false), 300)
  }

  const renderActiveView = () => {
    if (loading) {
      return <Loading />
    }

    switch (activeView) {
      case 'overview':
        return <DashboardOverview />
      case 'analytics':
        return <RealTimeAnalytics />
      case 'sales':
        return <SalesPerformanceCharts />
      case 'users':
        return <UserActivityMonitoring />
      case 'inventory':
        return <InventoryAlerts />
      case 'system':
        return <SystemHealthMonitoring />
      case 'revenue':
        return <RevenueTracking />
      case 'behavior':
        return <CustomerBehaviorAnalytics />
      case 'performance':
        return <PerformanceMetrics />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-charcoal-black">Admin Panel</h1>
              <p className="text-muted-olive mt-1">
                Welcome back, {user?.firstName} {user?.lastName} • {user?.role}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <div className="w-80 flex-shrink-0">
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-charcoal-black mb-4">Dashboard Sections</h2>
              <nav className="space-y-2">
                {navigationItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleViewChange(item.id)}
                    className={`w-full text-left p-3 rounded-lg transition-colors ${
                      activeView === item.id
                        ? 'bg-burgundy text-white'
                        : 'hover:bg-gray-100 text-charcoal-black'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <item.icon className="w-5 h-5" />
                      <div>
                        <div className="font-medium">{item.label}</div>
                        <div className={`text-xs ${
                          activeView === item.id ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderActiveView()}
          </div>
        </div>
      </div>
    </div>
  )
}