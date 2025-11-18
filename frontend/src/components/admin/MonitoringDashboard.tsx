'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';

interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: {
    memory: {
      heapUsed: number;
      heapTotal: number;
      external: number;
    };
    uptime: number;
    errorRate: number;
    avgResponseTime: number;
    totalErrors: number;
    totalMetrics: number;
  };
  timestamp: string;
}

interface PerformanceStats {
  [key: string]: {
    count: number;
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
}

interface AnalyticsDashboard {
  overview: {
    totalEvents: number;
    uniqueUsers: number;
    pageViews: number;
    totalRevenue: number;
    cryptoRevenue: number;
  };
  funnel: Array<{
    stage: string;
    count: number;
  }>;
  topProducts: Array<{
    item: string;
    count: number;
  }>;
  topSearches: Array<{
    item: string;
    count: number;
  }>;
  cryptoPayments: {
    count: number;
    revenue: number;
    byCurrency: Record<string, number>;
  };
}

export function MonitoringDashboard() {
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [performanceStats, setPerformanceStats] = useState<PerformanceStats | null>(null);
  const [analyticsDashboard, setAnalyticsDashboard] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState(3600000); // 1 hour

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { getApiUrl } = await import('@/config/api');
      const [healthRes, metricsRes, analyticsRes] = await Promise.all([
        fetch(getApiUrl('/api/monitoring/health')),
        fetch(getApiUrl(`/api/monitoring/metrics?timeRange=${timeRange}`)),
        fetch(getApiUrl(`/api/monitoring/analytics/dashboard?timeRange=${timeRange}`)),
      ]);

      if (!healthRes.ok || !metricsRes.ok || !analyticsRes.ok) {
        throw new Error('Failed to fetch monitoring data');
      }

      const [healthData, metricsData, analyticsData] = await Promise.all([
        healthRes.json(),
        metricsRes.json(),
        analyticsRes.json(),
      ]);

      setSystemHealth(healthData.data);
      setPerformanceStats(metricsData.data.stats);
      setAnalyticsDashboard(analyticsData.data.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [fetchData]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number): string => {
    return `${bytes}MB`;
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'degraded': return 'text-yellow-600 bg-yellow-100';
      case 'unhealthy': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading && !systemHealth) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-600 mb-4">Error loading monitoring data: {error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Monitoring Dashboard</h1>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(parseInt(e.target.value))}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value={3600000}>Last Hour</option>
            <option value={86400000}>Last 24 Hours</option>
            <option value={604800000}>Last Week</option>
          </select>
          <Button onClick={fetchData} disabled={loading}>
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* System Health */}
      {systemHealth && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">System Health</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(systemHealth.status)}`}>
              {systemHealth.status.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600">Uptime</p>
              <p className="text-lg font-semibold">{formatUptime(systemHealth.metrics.uptime)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Memory Usage</p>
              <p className="text-lg font-semibold">
                {formatBytes(systemHealth.metrics.memory.heapUsed)} / {formatBytes(systemHealth.metrics.memory.heapTotal)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Error Rate</p>
              <p className="text-lg font-semibold">{systemHealth.metrics.errorRate.toFixed(2)}/min</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-lg font-semibold">{systemHealth.metrics.avgResponseTime.toFixed(0)}ms</p>
            </div>
          </div>
        </Card>
      )}

      {/* Performance Metrics */}
      {performanceStats && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4">Performance Metrics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Metric</th>
                  <th className="text-right py-2">Count</th>
                  <th className="text-right py-2">Avg</th>
                  <th className="text-right py-2">P95</th>
                  <th className="text-right py-2">P99</th>
                  <th className="text-right py-2">Max</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(performanceStats).map(([metric, stats]) => (
                  <tr key={metric} className="border-b">
                    <td className="py-2 font-medium">{metric}</td>
                    <td className="text-right py-2">{stats.count}</td>
                    <td className="text-right py-2">{stats.avg.toFixed(1)}</td>
                    <td className="text-right py-2">{stats.p95.toFixed(1)}</td>
                    <td className="text-right py-2">{stats.p99.toFixed(1)}</td>
                    <td className="text-right py-2">{stats.max.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Analytics Overview */}
      {analyticsDashboard && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overview Stats */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Events</span>
                <span className="font-semibold">{analyticsDashboard.overview.totalEvents.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Unique Users</span>
                <span className="font-semibold">{analyticsDashboard.overview.uniqueUsers.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Page Views</span>
                <span className="font-semibold">{analyticsDashboard.overview.pageViews.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Revenue</span>
                <span className="font-semibold">${analyticsDashboard.overview.totalRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Crypto Revenue</span>
                <span className="font-semibold">${analyticsDashboard.overview.cryptoRevenue.toLocaleString()}</span>
              </div>
            </div>
          </Card>

          {/* Conversion Funnel */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Conversion Funnel</h3>
            <div className="space-y-2">
              {analyticsDashboard.funnel.map((stage, index) => (
                <div key={stage.stage} className="flex items-center">
                  <div className="w-24 text-sm text-gray-600 capitalize">
                    {stage.stage.replace('_', ' ')}
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-burgundy h-2 rounded-full"
                        style={{
                          width: `${index === 0 ? 100 : (stage.count / analyticsDashboard.funnel[0].count) * 100}%`
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-right text-sm font-medium">
                    {stage.count.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Products */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Products</h3>
            <div className="space-y-2">
              {analyticsDashboard.topProducts.slice(0, 5).map((product, index) => (
                <div key={product.item} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">
                    #{index + 1} {product.item}
                  </span>
                  <span className="text-sm font-medium">{product.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Searches */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Top Searches</h3>
            <div className="space-y-2">
              {analyticsDashboard.topSearches.slice(0, 5).map((search, index) => (
                <div key={search.item} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 truncate">
                    #{index + 1} &quot;{search.item}&quot;
                  </span>
                  <span className="text-sm font-medium">{search.count}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Crypto Payments */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Crypto Payments</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Payments</span>
                <span className="font-semibold">{analyticsDashboard.cryptoPayments.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold">${analyticsDashboard.cryptoPayments.revenue.toLocaleString()}</span>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">By Currency</p>
                {Object.entries(analyticsDashboard.cryptoPayments.byCurrency).map(([currency, count]) => (
                  <div key={currency} className="flex justify-between text-sm">
                    <span>{currency}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}