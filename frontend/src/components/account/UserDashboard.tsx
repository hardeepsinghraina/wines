'use client'

import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { AvatarImage } from '@/components/ui/PlaceholderImage'

interface UserDashboardProps {
  className?: string
}

type DashboardTab = 'overview' | 'profile' | 'orders' | 'addresses' | 'security'

export function UserDashboard({ className = '' }: UserDashboardProps) {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview')

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-olive">Please log in to access your dashboard.</p>
      </div>
    )
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const tabs = [
    { id: 'overview' as const, label: 'Overview', icon: '📊' },
    { id: 'profile' as const, label: 'Profile', icon: '👤' },
    { id: 'orders' as const, label: 'Orders', icon: '📦' },
    { id: 'addresses' as const, label: 'Addresses', icon: '📍' },
    { id: 'security' as const, label: 'Security', icon: '🔒' },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-burgundy mb-2">0</div>
                  <div className="text-muted-olive">Total Orders</div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-burgundy mb-2">$0</div>
                  <div className="text-muted-olive">Total Spent</div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-burgundy mb-2">Bronze</div>
                  <div className="text-muted-olive">Loyalty Tier</div>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-xl font-semibold text-charcoal-black mb-4">Recent Activity</h3>
              <div className="text-center py-8">
                <p className="text-muted-olive">No recent activity to display.</p>
                <Button 
                  variant="primary" 
                  className="mt-4"
                  onClick={() => window.location.href = '/products'}
                >
                  Start Shopping
                </Button>
              </div>
            </Card>
          </div>
        )

      case 'profile':
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-charcoal-black mb-6">Profile Information</h3>
            
            {/* Avatar Section */}
            <div className="flex items-center space-x-6 mb-8 pb-6 border-b border-gray-200">
              <div className="relative">
                <AvatarImage
                  src={user.avatar}
                  alt={`${user.firstName} ${user.lastName}`}
                  size={80}
                  className="border-4 border-white shadow-lg"
                />
                <button className="absolute bottom-0 right-0 bg-burgundy text-white rounded-full p-2 hover:bg-burgundy-dark transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-charcoal-black">
                  {user.firstName} {user.lastName}
                </h4>
                <p className="text-muted-olive">{user.email}</p>
                <p className="text-sm text-muted-olive mt-1">Member since {new Date(user.createdAt).getFullYear()}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={user.firstName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
                    readOnly
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-charcoal-black mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={user.lastName}
                    className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-2">
                  Email Address
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="email"
                    value={user.email}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-burgundy focus:border-transparent"
                    readOnly
                  />
                  {user.emailVerified ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⚠ Unverified
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-charcoal-black mb-2">
                  Account Role
                </label>
                <input
                  type="text"
                  value={user.role}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button variant="primary">
                Edit Profile
              </Button>
            </div>
          </Card>
        )

      case 'orders':
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-charcoal-black mb-6">Order History</h3>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h4 className="text-lg font-medium text-charcoal-black mb-2">No Orders Yet</h4>
              <p className="text-muted-olive mb-6">
                You haven&apos;t placed any orders yet. Start exploring our wine collection!
              </p>
              <Button 
                variant="primary"
                onClick={() => window.location.href = '/products'}
              >
                Browse Wines
              </Button>
            </div>
          </Card>
        )

      case 'addresses':
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-charcoal-black mb-6">Saved Addresses</h3>
            
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📍</div>
              <h4 className="text-lg font-medium text-charcoal-black mb-2">No Addresses Saved</h4>
              <p className="text-muted-olive mb-6">
                Add your shipping and billing addresses for faster checkout.
              </p>
              <Button variant="primary">
                Add Address
              </Button>
            </div>
          </Card>
        )

      case 'security':
        return (
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-charcoal-black mb-6">Security Settings</h3>
            
            <div className="space-y-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-charcoal-black">Password</h4>
                    <p className="text-sm text-muted-olive">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline">
                    Change Password
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-charcoal-black">Two-Factor Authentication</h4>
                    <p className="text-sm text-muted-olive">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-charcoal-black">Login Sessions</h4>
                    <p className="text-sm text-muted-olive">Manage your active sessions</p>
                  </div>
                  <Button variant="outline">
                    View Sessions
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className={`max-w-6xl mx-auto ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <AvatarImage
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              size={60}
              className="border-2 border-gray-200"
            />
            <div>
              <h1 className="text-3xl font-bold text-charcoal-black">
                Welcome back, {user.firstName}!
              </h1>
              <p className="text-muted-olive mt-1">
                Manage your account and track your wine journey
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-md text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-burgundy text-white'
                      : 'text-charcoal-black hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderTabContent()}
        </div>
      </div>
    </div>
  )
}