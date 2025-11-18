'use client'

import React, { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { 
  Users, 
  UserPlus, 
  UserCheck, 
  Clock, 
  Globe,
  TrendingUp,
  Eye,
  MousePointer,
  Activity
} from 'lucide-react'
import { adminPanelApi, UserActivityData } from '../../lib/admin-panel-api'

export function UserActivityMonitoring() {
  const [activityData, setActivityData] = useState<UserActivityData | null>(null)
  const [timeRange, setTimeRange] = useState('24h')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchUserActivityData()
  }, [timeRange])

  const fetchUserActivityData = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await adminPanelApi.getUserActivityData(timeRange)
      setActivityData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user activity data')
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
        <Button onClick={fetchUserActivityData}>Retry</Button>
      </div>
    )
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`
    }
    return `${minutes}m ${seconds % 60}s`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-black">User Activity Monitoring</h2>
          <p className="text-muted-olive">User monitoring and activity tracking</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={fetchUserActivityData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Active Users</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {activityData?.activeUsers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-green-600 mt-1">Currently online</p>
            </div>
            <Users className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">New Users</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {activityData?.newUsers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-blue-600 mt-1">
                {timeRange === '24h' ? 'Today' : `Last ${timeRange}`}
              </p>
            </div>
            <UserPlus className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Returning Users</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {activityData?.returningUsers?.toLocaleString() || '0'}
              </p>
              <p className="text-sm text-purple-600 mt-1">
                {activityData?.activeUsers ? 
                  `${((activityData.returningUsers / activityData.activeUsers) * 100).toFixed(1)}% of active` : 
                  '0% of active'
                }
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-olive">Avg Session</p>
              <p className="text-2xl font-bold text-charcoal-black">
                {activityData?.sessionDuration ? 
                  formatDuration(activityData.sessionDuration) : '0m'}
              </p>
              <p className="text-sm text-orange-600 mt-1">Duration</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Most Visited Pages</h3>
            <Eye className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {activityData?.topPages?.map((page, index) => (
              <div key={page.page} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal-black truncate max-w-xs">
                      {page.page}
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

        {/* Users by Country */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Users by Country</h3>
            <Globe className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {activityData?.usersByCountry?.map((country, index) => (
              <div key={country.country} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-500 w-6">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-charcoal-black">
                      {country.country}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{country.users}</p>
                  <p className="text-xs text-gray-500">users</p>
                </div>
              </div>
            )) || (
              <div className="text-center py-4 text-gray-500">
                No country data available
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* User Engagement Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Bounce Rate</h3>
            <MousePointer className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-charcoal-black">
              {activityData?.bounceRate?.toFixed(1) || '0'}%
            </p>
            <p className="text-sm text-muted-olive mt-2">
              Users who left after viewing one page
            </p>
            <div className="mt-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${
                    (activityData?.bounceRate || 0) > 70 ? 'bg-red-500' :
                    (activityData?.bounceRate || 0) > 50 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(activityData?.bounceRate || 0, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Good (0-40%)</span>
                <span>Average (40-70%)</span>
                <span>Poor (70%+)</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">User Engagement</h3>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pages per Session</span>
              <span className="font-semibold">3.2</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time on Site</span>
              <span className="font-semibold">
                {activityData?.sessionDuration ? 
                  formatDuration(activityData.sessionDuration) : '0m'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Return Visitor Rate</span>
              <span className="font-semibold">
                {activityData?.activeUsers && activityData?.returningUsers ? 
                  `${((activityData.returningUsers / activityData.activeUsers) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-charcoal-black">Growth Trends</h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">New Users Growth</span>
              <span className="font-semibold text-green-600">+12.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Session Duration</span>
              <span className="font-semibold text-green-600">+8.3%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Page Views</span>
              <span className="font-semibold text-green-600">+15.7%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* User Activity Timeline */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-charcoal-black mb-4">Activity Timeline</h3>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">User activity timeline visualization</p>
            <p className="text-sm text-gray-400">Chart component integration needed</p>
          </div>
        </div>
      </Card>
    </div>
  )
}