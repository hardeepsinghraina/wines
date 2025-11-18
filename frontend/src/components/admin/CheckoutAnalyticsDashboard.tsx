'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { checkoutAnalyticsAPI } from '@/lib/checkout-analytics-api';

interface DashboardData {
  funnel: any;
  performance: any;
  errors: any;
  feedback: any;
  abTests: any;
  summary: {
    timeRange: number;
    generatedAt: string;
  };
}

interface TimeRangeOption {
  label: string;
  value: number;
}

const TIME_RANGES: TimeRangeOption[] = [
  { label: 'Last Hour', value: 3600000 },
  { label: 'Last 24 Hours', value: 86400000 },
  { label: 'Last 7 Days', value: 604800000 },
  { label: 'Last 30 Days', value: 2592000000 }
];

export function CheckoutAnalyticsDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState(86400000); // 24 hours
  const [autoRefresh, setAutoRefresh] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await checkoutAnalyticsAPI.getDashboard(selectedTimeRange);
      if (response?.success) {
        setData(response.data);
        setError(null);
      } else {
        setError('Failed to load dashboard data');
      }
    } catch (err) {
      setError('Error loading dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedTimeRange]);

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh, selectedTimeRange]);

  const handleTimeRangeChange = (timeRange: number) => {
    setSelectedTimeRange(timeRange);
  };

  const handleExportData = async (type: 'funnel' | 'performance' | 'feedback') => {
    try {
      let exportData;
      switch (type) {
        case 'funnel':
          exportData = await checkoutAnalyticsAPI.exportFunnelData(selectedTimeRange, 'csv');
          break;
        case 'performance':
          exportData = await checkoutAnalyticsAPI.exportPerformanceData(selectedTimeRange, 'csv');
          break;
        case 'feedback':
          exportData = await checkoutAnalyticsAPI.exportFeedbackData(selectedTimeRange, 'csv');
          break;
      }
      
      if (exportData) {
        // Create and download CSV file
        const blob = new Blob([exportData], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `checkout-${type}-data.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={fetchData} className="mt-4">
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-charcoal-black">
          Checkout Analytics Dashboard
        </h1>
        <div className="flex items-center space-x-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="rounded border-gray-300 text-burgundy focus:ring-burgundy"
            />
            <span className="text-sm text-muted-olive">Auto-refresh</span>
          </label>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Time Range Selector */}
      <Card className="p-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-charcoal-black">Time Range:</span>
          <div className="flex space-x-2">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={selectedTimeRange === range.value ? 'primary' : 'outline'}
                size="sm"
                onClick={() => handleTimeRangeChange(range.value)}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Total Sessions
              </h3>
              <p className="text-3xl font-bold text-burgundy">
                {data.funnel?.totalSessions || 0}
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Conversion Rate
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {data.funnel?.conversionRates?.checkout_start_to_order_complete?.toFixed(2) || 0}%
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Avg. Feedback Rating
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {data.feedback?.averageRating?.toFixed(1) || 'N/A'}
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Total Errors
              </h3>
              <p className="text-3xl font-bold text-red-600">
                {data.errors?.totalErrors || 0}
              </p>
            </Card>
          </div>

          {/* Funnel Analysis */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-charcoal-black">
                Checkout Funnel Analysis
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('funnel')}
              >
                Export CSV
              </Button>
            </div>
            
            {data.funnel?.stageData && (
              <div className="space-y-4">
                {data.funnel.stageData.map((stage: any, index: number) => (
                  <div key={stage.stage} className="flex items-center space-x-4">
                    <div className="w-32 text-sm font-medium text-charcoal-black">
                      {stage.stage.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="flex-1 bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-burgundy h-4 rounded-full transition-all duration-300"
                        style={{
                          width: `${(stage.uniqueSessions / (data.funnel.totalSessions || 1)) * 100}%`
                        }}
                      />
                    </div>
                    <div className="w-20 text-sm text-muted-olive">
                      {stage.uniqueSessions} sessions
                    </div>
                    <div className="w-16 text-sm text-muted-olive">
                      {((stage.uniqueSessions / (data.funnel.totalSessions || 1)) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-charcoal-black">
                Performance Metrics
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('performance')}
              >
                Export CSV
              </Button>
            </div>
            
            {data.performance?.performancePercentiles && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(data.performance.performancePercentiles).map(([metric, stats]: [string, any]) => (
                  <div key={metric} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-charcoal-black mb-2">
                      {metric.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>P50:</span>
                        <span>{stats.p50?.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P95:</span>
                        <span>{stats.p95?.toFixed(0)}ms</span>
                      </div>
                      <div className="flex justify-between">
                        <span>P99:</span>
                        <span>{stats.p99?.toFixed(0)}ms</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Error Analysis */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Error Analysis
            </h2>
            
            {data.errors?.commonErrors && (
              <div className="space-y-3">
                {data.errors.commonErrors.slice(0, 10).map((error: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="font-medium text-red-800">{error.error}</p>
                      <p className="text-sm text-red-600">
                        Stages: {error.stages.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-800">{error.count}</p>
                      <p className="text-sm text-red-600">occurrences</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Feedback Analysis */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-charcoal-black">
                Customer Feedback
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExportData('feedback')}
              >
                Export CSV
              </Button>
            </div>
            
            {data.feedback?.ratingsByStep && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-charcoal-black mb-3">Ratings by Step</h4>
                  <div className="space-y-2">
                    {Object.entries(data.feedback.ratingsByStep).map(([step, rating]: [string, any]) => (
                      <div key={step} className="flex items-center justify-between">
                        <span className="text-sm text-muted-olive">
                          {step.replace('_', ' ').toUpperCase()}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="flex">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span
                                key={star}
                                className={`text-sm ${
                                  star <= rating.average ? 'text-yellow-400' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-sm font-medium">
                            {rating.average?.toFixed(1)} ({rating.count})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-charcoal-black mb-3">Common Issues</h4>
                  <div className="space-y-2">
                    {data.feedback?.commonIssues?.slice(0, 5).map((issue: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm text-muted-olive">{issue.issue}</span>
                        <div className="text-right">
                          <span className="text-sm font-medium">{issue.count}</span>
                          <span className="text-xs text-muted-olive ml-1">
                            (avg: {issue.avgRating?.toFixed(1)})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* A/B Tests */}
          {data.abTests?.testResults && Object.keys(data.abTests.testResults).length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-charcoal-black mb-4">
                A/B Test Results
              </h2>
              
              <div className="space-y-4">
                {Object.entries(data.abTests.testResults).map(([testId, results]: [string, any]) => (
                  <div key={testId} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="font-medium text-charcoal-black mb-3">{testId}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(results).map(([variantId, stats]: [string, any]) => (
                        <div key={variantId} className="bg-gray-50 p-3 rounded">
                          <h5 className="font-medium text-sm text-charcoal-black">{variantId}</h5>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Assignments:</span>
                              <span>{stats.assignments}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Conversions:</span>
                              <span>{stats.conversions}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Rate:</span>
                              <span>
                                {stats.assignments > 0 
                                  ? ((stats.conversions / stats.assignments) * 100).toFixed(2)
                                  : 0}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}