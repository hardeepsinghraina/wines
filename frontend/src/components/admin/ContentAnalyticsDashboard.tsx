'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Loading } from '../ui/Loading';
import { contentManagementAPI } from '../../lib/content-management-api';
import { ContentPerformanceMetrics } from '../../../../shared/types/content-management';

interface ContentAnalyticsDashboardProps {
  className?: string;
}

export const ContentAnalyticsDashboard: React.FC<ContentAnalyticsDashboardProps> = ({
  className = ''
}) => {
  const [metrics, setMetrics] = useState<ContentPerformanceMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedContentId, setSelectedContentId] = useState<string>('');

  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedContentId]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      if (selectedContentId) {
        const contentMetrics = await contentManagementAPI.getContentPerformance(selectedContentId, selectedPeriod);
        setMetrics([contentMetrics]);
      } else {
        // Load overview metrics for all content
        setMetrics([]);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatPercentage = (num: number) => {
    return (num * 100).toFixed(1) + '%';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className={`content-analytics-dashboard ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Analytics</h2>
          <p className="text-gray-600">Track content performance and engagement metrics</p>
        </div>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
          <input
            type="text"
            placeholder="Content ID (optional)"
            value={selectedContentId}
            onChange={(e) => setSelectedContentId(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
          />
        </div>
      </div>

      {metrics.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
          <p className="text-gray-500 mb-4">
            {selectedContentId 
              ? 'No data available for the specified content ID' 
              : 'Enter a content ID to view detailed analytics'
            }
          </p>
          <Button
            onClick={loadAnalytics}
            className="bg-amber-600 hover:bg-amber-700"
          >
            Refresh Data
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {metrics.map((metric) => (
            <div key={metric.contentId} className="space-y-6">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Page Views</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(metric.metrics.pageViews)}</p>
                    </div>
                    <div className="text-3xl">👁️</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {formatNumber(metric.metrics.uniqueViews)} unique views
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Avg. Time on Page</p>
                      <p className="text-2xl font-bold text-gray-900">{formatTime(metric.metrics.averageTimeOnPage)}</p>
                    </div>
                    <div className="text-3xl">⏱️</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    Bounce rate: {formatPercentage(metric.metrics.bounceRate)}
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPercentage(metric.metrics.conversionRate)}</p>
                    </div>
                    <div className="text-3xl">🎯</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {metric.metrics.searchClicks} search clicks
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Search Position</p>
                      <p className="text-2xl font-bold text-gray-900">{metric.metrics.averagePosition.toFixed(1)}</p>
                    </div>
                    <div className="text-3xl">🔍</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-500">
                    {formatNumber(metric.metrics.searchImpressions)} impressions
                  </div>
                </Card>
              </div>

              {/* Engagement Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Engagement</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Social Shares</span>
                      <span className="font-semibold">{metric.metrics.socialShares}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Backlinks</span>
                      <span className="font-semibold">{metric.metrics.backlinks}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${Math.min((metric.metrics.socialShares / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Keywords</h3>
                  <div className="space-y-3">
                    {metric.topKeywords.slice(0, 5).map((keyword, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{keyword}</span>
                        <span className="text-sm bg-gray-100 px-2 py-1 rounded">#{index + 1}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Traffic Sources and Device Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Referrers</h3>
                  <div className="space-y-3">
                    {metric.topReferrers.map((referrer, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-600">{referrer}</span>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Device Breakdown</h3>
                  <div className="space-y-4">
                    {Object.entries(metric.deviceBreakdown).map(([device, percentage]) => (
                      <div key={device} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 capitalize">{device}</span>
                          <span className="font-semibold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Geographic Distribution */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Geographic Distribution</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(metric.locationBreakdown).map(([location, percentage]) => (
                    <div key={location} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                      <div className="text-sm text-gray-600">{location}</div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Performance Summary */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">📈</div>
                    <div className="text-lg font-semibold text-gray-900">Growth Trend</div>
                    <div className="text-sm text-gray-600">
                      Based on {selectedPeriod} data
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎯</div>
                    <div className="text-lg font-semibold text-gray-900">Engagement Score</div>
                    <div className="text-sm text-gray-600">
                      Above average performance
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl mb-2">🔍</div>
                    <div className="text-lg font-semibold text-gray-900">SEO Health</div>
                    <div className="text-sm text-gray-600">
                      Good search visibility
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentAnalyticsDashboard;