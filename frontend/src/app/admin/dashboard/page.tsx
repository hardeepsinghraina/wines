'use client'

import React from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { MonitoringDashboard } from '@/components/admin/MonitoringDashboard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AvatarImage } from '@/components/ui/PlaceholderImage'
import Link from 'next/link'
import { 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  AlertCircle
} from 'lucide-react'

export default function AdminDashboardPage() {
  const { user, hasPermission } = useAdminAuth()

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-charcoal-black mb-4">Access Denied</h1>
          <p className="text-muted-olive">Please log in to access the admin dashboard.</p>
        </div>
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Products',
      value: '1,234',
      change: '+12%',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Active Users',
      value: '5,678',
      change: '+8%',
      icon: Users,
      color: 'text-green-600'
    },
    {
      title: 'Orders Today',
      value: '89',
      change: '+23%',
      icon: ShoppingCart,
      color: 'text-purple-600'
    },
    {
      title: 'Revenue',
      value: '$45,678',
      change: '+15%',
      icon: DollarSign,
      color: 'text-yellow-600'
    }
  ]

  const quickActions = [
    {
      title: 'Product Management',
      description: 'Add, edit, and manage wine products',
      href: '/admin/products',
      icon: Package,
      permission: 'PRODUCTS_VIEW'
    },
    {
      title: 'Order Management',
      description: 'View and process customer orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      permission: 'ORDERS_VIEW'
    },
    {
      title: 'Customer Management',
      description: 'Manage customer accounts and data',
      href: '/admin/customers',
      icon: Users,
      permission: 'CUSTOMERS_VIEW'
    },
    {
      title: 'Analytics',
      description: 'View sales and performance analytics',
      href: '/admin/analytics',
      icon: TrendingUp,
      permission: 'ANALYTICS_VIEW'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center space-x-4">
          <AvatarImage
            src={user.avatar}
            alt={`${user.firstName} ${user.lastName}`}
            size={60}
            className="border-2 border-burgundy"
          />
          <div>
            <h1 className="text-3xl font-bold text-charcoal-black">Admin Dashboard</h1>
            <p className="text-muted-olive">Welcome back, {user.firstName} {user.lastName}</p>
            <p className="text-sm text-burgundy font-medium">{user.role} Access</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <Card key={stat.title} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-olive">{stat.title}</p>
                  <p className="text-2xl font-bold text-charcoal-black">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change} from last month</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-charcoal-black mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link key={action.title} href={action.href}>
                <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
                  <action.icon className="w-8 h-8 text-burgundy mb-3" />
                  <h3 className="font-semibold text-charcoal-black mb-2">{action.title}</h3>
                  <p className="text-sm text-muted-olive">{action.description}</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="mb-8">
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-5 h-5 text-yellow-500 mr-2" />
              <h2 className="text-xl font-semibold text-charcoal-black">Recent Alerts</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium text-charcoal-black">Low Stock Alert</p>
                  <p className="text-sm text-muted-olive">5 products are running low on inventory</p>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium text-charcoal-black">New Orders</p>
                  <p className="text-sm text-muted-olive">12 new orders require processing</p>
                </div>
                <Button variant="outline" size="sm">Process</Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Monitoring Dashboard */}
        <MonitoringDashboard />
      </div>
    </div>
  )
}