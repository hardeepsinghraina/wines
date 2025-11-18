'use client'

import React, { useState, useEffect } from 'react'
import { 
  Bell, 
  BellRing, 
  Mail, 
  Smartphone, 
  Clock, 
  Package, 
  DollarSign, 
  Star, 
  Check, 
  X, 
  Settings,
  Volume2,
  VolumeX,
  Calendar,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { WineImage } from '@/components/ui/PlaceholderImage'
import { Wine } from '@/types/wine'

interface NotificationPreferences {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
  frequency: 'immediate' | 'daily' | 'weekly'
  quietHours: {
    enabled: boolean
    start: string
    end: string
  }
}

interface AvailabilityAlert {
  id: string
  wineId: string
  wine: Wine
  type: 'stock' | 'price' | 'vintage' | 'promotion'
  targetValue?: number
  currentValue?: number
  isActive: boolean
  createdAt: Date
  triggeredAt?: Date
  notificationsSent: number
}

interface NotificationHistory {
  id: string
  alertId: string
  type: 'stock_available' | 'price_drop' | 'price_target' | 'new_vintage' | 'promotion'
  title: string
  message: string
  wine: Wine
  sentAt: Date
  isRead: boolean
  channels: ('email' | 'sms' | 'push' | 'in_app')[]
}

interface PremiumAvailabilityNotificationsProps {
  alerts: AvailabilityAlert[]
  notifications: NotificationHistory[]
  preferences: NotificationPreferences
  onCreateAlert: (wineId: string, type: string, targetValue?: number) => void
  onUpdateAlert: (alertId: string, updates: Partial<AvailabilityAlert>) => void
  onDeleteAlert: (alertId: string) => void
  onUpdatePreferences: (preferences: NotificationPreferences) => void
  onMarkAsRead: (notificationId: string) => void
  onMarkAllAsRead: () => void
  className?: string
}

export function PremiumAvailabilityNotifications({
  alerts,
  notifications,
  preferences,
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert,
  onUpdatePreferences,
  onMarkAsRead,
  onMarkAllAsRead,
  className = ''
}: PremiumAvailabilityNotificationsProps) {
  const [activeTab, setActiveTab] = useState<'alerts' | 'notifications' | 'settings'>('alerts')
  const [showCreateAlert, setShowCreateAlert] = useState(false)
  const [newAlertType, setNewAlertType] = useState<string>('stock')
  const [newAlertWineId, setNewAlertWineId] = useState<string>('')
  const [newAlertTargetValue, setNewAlertTargetValue] = useState<number>(0)
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'wine'>('date')

  const unreadCount = notifications.filter(n => !n.isRead).length
  const activeAlertsCount = alerts.filter(a => a.isActive).length

  const filteredAlerts = alerts.filter(alert => 
    filterType === 'all' || alert.type === filterType
  )

  const filteredNotifications = notifications
    .filter(notification => 
      filterType === 'all' || notification.type.includes(filterType)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
        case 'priority':
          return (b.isRead ? 0 : 1) - (a.isRead ? 0 : 1)
        case 'wine':
          return a.wine.name.localeCompare(b.wine.name)
        default:
          return 0
      }
    })

  const handleCreateAlert = () => {
    if (newAlertWineId && newAlertType) {
      onCreateAlert(
        newAlertWineId, 
        newAlertType, 
        newAlertType === 'price' ? newAlertTargetValue : undefined
      )
      setShowCreateAlert(false)
      setNewAlertWineId('')
      setNewAlertTargetValue(0)
    }
  }

  const getAlertTypeIcon = (type: string) => {
    switch (type) {
      case 'stock': return Package
      case 'price': return DollarSign
      case 'vintage': return Calendar
      case 'promotion': return Star
      default: return Bell
    }
  }

  const getAlertTypeColor = (type: string) => {
    switch (type) {
      case 'stock': return 'text-blue-600 bg-blue-50'
      case 'price': return 'text-green-600 bg-green-50'
      case 'vintage': return 'text-purple-600 bg-purple-50'
      case 'promotion': return 'text-yellow-600 bg-yellow-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'stock_available': return CheckCircle
      case 'price_drop': return TrendingDown
      case 'price_target': return DollarSign
      case 'new_vintage': return Calendar
      case 'promotion': return Star
      default: return Info
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date))
  }

  return (
    <div className={`premium-availability-notifications ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black flex items-center gap-2">
            <BellRing className="w-6 h-6 text-burgundy" />
            Wine Alerts & Notifications
          </h2>
          <p className="text-muted-olive">
            {activeAlertsCount} active alerts • {unreadCount} unread notifications
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateAlert(true)}
          className="bg-burgundy hover:bg-burgundy/90"
        >
          <Bell className="w-4 h-4 mr-2" />
          Create Alert
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        {[
          { id: 'alerts', label: 'Active Alerts', count: activeAlertsCount },
          { id: 'notifications', label: 'Notifications', count: unreadCount },
          { id: 'settings', label: 'Settings', count: 0 }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-burgundy text-burgundy'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="ml-2 bg-burgundy text-white px-2 py-1 rounded-full text-xs">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Active Alerts Tab */}
      {activeTab === 'alerts' && (
        <div>
          {/* Filter Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-charcoal-black">Filter:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-burgundy focus:border-burgundy"
              >
                <option value="all">All Types</option>
                <option value="stock">Stock Alerts</option>
                <option value="price">Price Alerts</option>
                <option value="vintage">Vintage Alerts</option>
                <option value="promotion">Promotion Alerts</option>
              </select>
            </div>
            
            {filteredAlerts.length > 0 && (
              <span className="text-sm text-muted-olive">
                {filteredAlerts.length} alerts
              </span>
            )}
          </div>

          {/* Alerts List */}
          {filteredAlerts.length === 0 ? (
            <Card className="p-8 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No alerts found
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first alert to get notified about wine availability and price changes
              </p>
              <Button
                onClick={() => setShowCreateAlert(true)}
                className="bg-burgundy hover:bg-burgundy/90"
              >
                Create Alert
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => {
                const AlertIcon = getAlertTypeIcon(alert.type)
                
                return (
                  <Card key={alert.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Wine Image */}
                        <div className="w-16 h-20 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                          <WineImage
                            src={alert.wine.images?.find(img => img.isPrimary)?.url || alert.wine.imageUrl}
                            alt={alert.wine.name}
                            width={64}
                            height={80}
                            className="object-contain w-full h-full"
                          />
                        </div>

                        {/* Alert Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-charcoal-black mb-1">
                                {alert.wine.name}
                              </h3>
                              <p className="text-sm text-muted-olive mb-2">
                                {alert.wine.producer} • {alert.wine.vintage}
                              </p>
                              
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getAlertTypeColor(alert.type)}`}>
                                  <AlertIcon className="w-3 h-3" />
                                  {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                                </span>
                                
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  alert.isActive 
                                    ? 'text-green-600 bg-green-50' 
                                    : 'text-gray-600 bg-gray-50'
                                }`}>
                                  {alert.isActive ? 'Active' : 'Paused'}
                                </span>
                              </div>

                              {/* Alert Conditions */}
                              <div className="text-sm text-gray-600">
                                {alert.type === 'stock' && (
                                  <p>Notify when back in stock</p>
                                )}
                                {alert.type === 'price' && alert.targetValue && (
                                  <p>
                                    Notify when price drops below {formatPrice(alert.targetValue)}
                                    {alert.currentValue && (
                                      <span className="ml-2 text-muted-olive">
                                        (Current: {formatPrice(alert.currentValue)})
                                      </span>
                                    )}
                                  </p>
                                )}
                                {alert.type === 'vintage' && (
                                  <p>Notify when new vintage is available</p>
                                )}
                                {alert.type === 'promotion' && (
                                  <p>Notify about special promotions and discounts</p>
                                )}
                              </div>

                              <p className="text-xs text-gray-500 mt-1">
                                Created {formatDate(alert.createdAt)} • {alert.notificationsSent} notifications sent
                              </p>
                            </div>

                            {/* Alert Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onUpdateAlert(alert.id, { isActive: !alert.isActive })}
                                className={alert.isActive ? 'text-orange-600 hover:bg-orange-50' : 'text-green-600 hover:bg-green-50'}
                              >
                                {alert.isActive ? (
                                  <>
                                    <VolumeX className="w-4 h-4 mr-1" />
                                    Pause
                                  </>
                                ) : (
                                  <>
                                    <Volume2 className="w-4 h-4 mr-1" />
                                    Resume
                                  </>
                                )}
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteAlert(alert.id)}
                                className="text-red-600 hover:bg-red-50"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div>
          {/* Notification Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-charcoal-black">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="border border-gray-300 rounded px-3 py-1 text-sm focus:ring-2 focus:ring-burgundy focus:border-burgundy"
              >
                <option value="date">Date</option>
                <option value="priority">Priority</option>
                <option value="wine">Wine Name</option>
              </select>
            </div>
            
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMarkAllAsRead}
                className="border-burgundy text-burgundy hover:bg-burgundy hover:text-white"
              >
                <Check className="w-4 h-4 mr-1" />
                Mark All Read
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {filteredNotifications.length === 0 ? (
            <Card className="p-8 text-center">
              <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-600">
                You'll see notifications here when your alerts are triggered
              </p>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => {
                const NotificationIcon = getNotificationIcon(notification.type)
                
                return (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      notification.isRead 
                        ? 'bg-white hover:bg-gray-50' 
                        : 'bg-burgundy/5 border-burgundy/20 hover:bg-burgundy/10'
                    }`}
                    onClick={() => !notification.isRead && onMarkAsRead(notification.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Notification Icon */}
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          notification.isRead ? 'bg-gray-100' : 'bg-burgundy/10'
                        }`}>
                          <NotificationIcon className={`w-5 h-5 ${
                            notification.isRead ? 'text-gray-500' : 'text-burgundy'
                          }`} />
                        </div>

                        {/* Notification Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className={`font-medium mb-1 ${
                                notification.isRead ? 'text-gray-900' : 'text-charcoal-black'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mb-2 ${
                                notification.isRead ? 'text-gray-600' : 'text-muted-olive'
                              }`}>
                                {notification.message}
                              </p>
                              
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                <span>{formatDate(notification.sentAt)}</span>
                                <span>•</span>
                                <span>{notification.wine.name}</span>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                  {notification.channels.includes('email') && <Mail className="w-3 h-3" />}
                                  {notification.channels.includes('sms') && <Smartphone className="w-3 h-3" />}
                                  {notification.channels.includes('push') && <Bell className="w-3 h-3" />}
                                </div>
                              </div>
                            </div>

                            {/* Wine Image */}
                            <div className="w-12 h-15 bg-gray-50 rounded overflow-hidden flex-shrink-0">
                              <WineImage
                                src={notification.wine.images?.find(img => img.isPrimary)?.url || notification.wine.imageUrl}
                                alt={notification.wine.name}
                                width={48}
                                height={60}
                                className="object-contain w-full h-full"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Read Status */}
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-burgundy rounded-full flex-shrink-0 mt-2"></div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          {/* Notification Channels */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-burgundy" />
                Notification Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'email', label: 'Email Notifications', icon: Mail, description: 'Receive alerts via email' },
                { key: 'sms', label: 'SMS Notifications', icon: Smartphone, description: 'Receive alerts via text message' },
                { key: 'push', label: 'Push Notifications', icon: Bell, description: 'Receive browser push notifications' },
                { key: 'inApp', label: 'In-App Notifications', icon: BellRing, description: 'Show notifications in the app' }
              ].map((channel) => (
                <div key={channel.key} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <channel.icon className="w-5 h-5 text-burgundy" />
                    <div>
                      <h4 className="font-medium text-charcoal-black">{channel.label}</h4>
                      <p className="text-sm text-muted-olive">{channel.description}</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences[channel.key as keyof NotificationPreferences] as boolean}
                      onChange={(e) => onUpdatePreferences({
                        ...preferences,
                        [channel.key]: e.target.checked
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-burgundy/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-burgundy"></div>
                  </label>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Frequency Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Notification Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { value: 'immediate', label: 'Immediate', description: 'Send notifications as soon as alerts are triggered' },
                  { value: 'daily', label: 'Daily Digest', description: 'Send a daily summary of all triggered alerts' },
                  { value: 'weekly', label: 'Weekly Summary', description: 'Send a weekly summary of all activity' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="frequency"
                      value={option.value}
                      checked={preferences.frequency === option.value}
                      onChange={(e) => onUpdatePreferences({
                        ...preferences,
                        frequency: e.target.value as any
                      })}
                      className="text-burgundy focus:ring-burgundy"
                    />
                    <div>
                      <h4 className="font-medium text-charcoal-black">{option.label}</h4>
                      <p className="text-sm text-muted-olive">{option.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quiet Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Quiet Hours</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.quietHours.enabled}
                    onChange={(e) => onUpdatePreferences({
                      ...preferences,
                      quietHours: {
                        ...preferences.quietHours,
                        enabled: e.target.checked
                      }
                    })}
                    className="text-burgundy focus:ring-burgundy rounded"
                  />
                  <span className="font-medium text-charcoal-black">Enable quiet hours</span>
                </label>
                
                {preferences.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.start}
                        onChange={(e) => onUpdatePreferences({
                          ...preferences,
                          quietHours: {
                            ...preferences.quietHours,
                            start: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={preferences.quietHours.end}
                        onChange={(e) => onUpdatePreferences({
                          ...preferences,
                          quietHours: {
                            ...preferences.quietHours,
                            end: e.target.value
                          }
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="text-center mb-4">
              <Bell className="w-12 h-12 text-burgundy mx-auto mb-2" />
              <h3 className="text-lg font-semibold">Create New Alert</h3>
              <p className="text-sm text-gray-600">
                Get notified about wine availability and price changes
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Type
                </label>
                <select
                  value={newAlertType}
                  onChange={(e) => setNewAlertType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                >
                  <option value="stock">Stock Alert</option>
                  <option value="price">Price Alert</option>
                  <option value="vintage">New Vintage Alert</option>
                  <option value="promotion">Promotion Alert</option>
                </select>
              </div>

              {newAlertType === 'price' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Price (USD)
                  </label>
                  <input
                    type="number"
                    value={newAlertTargetValue}
                    onChange={(e) => setNewAlertTargetValue(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-burgundy focus:border-burgundy"
                    placeholder="Enter target price"
                  />
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowCreateAlert(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAlert}
                className="flex-1 bg-burgundy hover:bg-burgundy/90"
                disabled={!newAlertWineId}
              >
                Create Alert
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}