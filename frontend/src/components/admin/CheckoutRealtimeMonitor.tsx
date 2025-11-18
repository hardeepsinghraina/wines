'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { checkoutAnalyticsAPI } from '@/lib/checkout-analytics-api';

interface RealtimeData {
  funnel: any;
  performance: any;
  errors: any;
  timestamp: number;
}

interface AlertConfig {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  isActive: boolean;
}

export function CheckoutRealtimeMonitor() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<string[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startMonitoring = () => {
    if (intervalRef.current) return;

    setIsConnected(true);
    
    const fetchRealtimeData = async () => {
      try {
        const [funnelData, performanceData, errorData] = await Promise.all([
          checkoutAnalyticsAPI.getRealtimeFunnel(),
          checkoutAnalyticsAPI.getRealtimePerformance(),
          checkoutAnalyticsAPI.getRealtimeErrors()
        ]);

        const newData: RealtimeData = {
          funnel: funnelData?.data,
          performance: performanceData?.data,
          errors: errorData?.data,
          timestamp: Date.now()
        };

        setData(newData);
        checkAlerts(newData);
      } catch (error) {
        console.error('Failed to fetch real-time data:', error);
      }
    };

    // Initial fetch
    fetchRealtimeData();
    
    // Set up interval for real-time updates
    intervalRef.current = setInterval(fetchRealtimeData, 5000); // Update every 5 seconds
  };

  const stopMonitoring = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsConnected(false);
  };

  const checkAlerts = (data: RealtimeData) => {
    const triggeredAlerts: string[] = [];

    alerts.forEach(alert => {
      if (!alert.isActive) return;

      let shouldTrigger = false;

      switch (alert.condition) {
        case 'error_rate_high':
          const errorRate = data.errors?.errorRates?.errorRate || 0;
          shouldTrigger = errorRate > alert.threshold;
          break;
        case 'conversion_rate_low':
          const conversionRate = data.funnel?.conversionRates?.checkout_start_to_order_complete || 0;
          shouldTrigger = conversionRate < alert.threshold;
          break;
        case 'performance_slow':
          const avgLoadTime = data.performance?.performancePercentiles?.step_load_time?.p95 || 0;
          shouldTrigger = avgLoadTime > alert.threshold;
          break;
        case 'high_abandonment':
          const abandonmentRate = data.funnel?.dropOffAnalysis?.checkout_start?.dropOffRate || 0;
          shouldTrigger = abandonmentRate > alert.threshold;
          break;
      }

      if (shouldTrigger) {
        triggeredAlerts.push(alert.id);
      }
    });

    setActiveAlerts(triggeredAlerts);
  };

  const loadAlerts = async () => {
    try {
      const response = await checkoutAnalyticsAPI.getAlerts();
      if (response?.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Failed to load alerts:', error);
    }
  };

  useEffect(() => {
    loadAlerts();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-green-600';
    if (value <= thresholds.warning) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-charcoal-black">
          Real-time Checkout Monitor
        </h1>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-sm text-muted-olive">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          {isConnected ? (
            <Button onClick={stopMonitoring} variant="outline">
              Stop Monitoring
            </Button>
          ) : (
            <Button onClick={startMonitoring}>
              Start Monitoring
            </Button>
          )}
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <Card className="p-4 border-red-200 bg-red-50">
          <h2 className="text-lg font-semibold text-red-800 mb-3">
            🚨 Active Alerts ({activeAlerts.length})
          </h2>
          <div className="space-y-2">
            {activeAlerts.map(alertId => {
              const alert = alerts.find(a => a.id === alertId);
              return alert ? (
                <div key={alertId} className="flex items-center justify-between p-2 bg-red-100 rounded">
                  <span className="font-medium text-red-800">{alert.name}</span>
                  <span className="text-sm text-red-600">{alert.condition}</span>
                </div>
              ) : null;
            })}
          </div>
        </Card>
      )}

      {data && (
        <>
          {/* Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Active Sessions
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {data.funnel?.totalSessions || 0}
              </p>
              <p className="text-sm text-muted-olive mt-1">
                Last 5 minutes
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Conversion Rate
              </h3>
              <p className={`text-3xl font-bold ${getStatusColor(
                data.funnel?.conversionRates?.checkout_start_to_order_complete || 0,
                { good: 15, warning: 10 }
              )}`}>
                {data.funnel?.conversionRates?.checkout_start_to_order_complete?.toFixed(2) || 0}%
              </p>
              <p className="text-sm text-muted-olive mt-1">
                Current rate
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Avg Load Time
              </h3>
              <p className={`text-3xl font-bold ${getStatusColor(
                data.performance?.performancePercentiles?.step_load_time?.p95 || 0,
                { good: 2000, warning: 5000 }
              )}`}>
                {data.performance?.performancePercentiles?.step_load_time?.p95?.toFixed(0) || 0}ms
              </p>
              <p className="text-sm text-muted-olive mt-1">
                P95 response time
              </p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-charcoal-black mb-2">
                Error Rate
              </h3>
              <p className={`text-3xl font-bold ${getStatusColor(
                data.errors?.errorRates?.errorRate || 0,
                { good: 1, warning: 5 }
              )}`}>
                {data.errors?.errorRates?.errorRate?.toFixed(2) || 0}%
              </p>
              <p className="text-sm text-muted-olive mt-1">
                Current error rate
              </p>
            </Card>
          </div>

          {/* Live Funnel */}
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-charcoal-black">
                Live Checkout Funnel
              </h2>
              <span className="text-sm text-muted-olive">
                Updated: {formatTimestamp(data.timestamp)}
              </span>
            </div>
            
            {data.funnel?.stageData && (
              <div className="space-y-4">
                {data.funnel.stageData.map((stage: any, index: number) => {
                  const percentage = (stage.uniqueSessions / (data.funnel.totalSessions || 1)) * 100;
                  return (
                    <div key={stage.stage} className="flex items-center space-x-4">
                      <div className="w-32 text-sm font-medium text-charcoal-black">
                        {stage.stage.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                        <div
                          className="bg-gradient-to-r from-burgundy to-red-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                          style={{ width: `${percentage}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                      <div className="w-20 text-sm text-muted-olive">
                        {stage.uniqueSessions} users
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-charcoal-black mb-4">
              Performance Metrics (Last 5 Minutes)
            </h2>
            
            {data.performance?.performancePercentiles && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(data.performance.performancePercentiles).map(([metric, stats]: [string, any]) => (
                  <div key={metric} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-charcoal-black mb-3">
                      {metric.replace('_', ' ').toUpperCase()}
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-olive">P50:</span>
                        <span className={`font-medium ${getStatusColor(stats.p50 || 0, { good: 1000, warning: 3000 })}`}>
                          {stats.p50?.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-olive">P95:</span>
                        <span className={`font-medium ${getStatusColor(stats.p95 || 0, { good: 2000, warning: 5000 })}`}>
                          {stats.p95?.toFixed(0)}ms
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-olive">P99:</span>
                        <span className={`font-medium ${getStatusColor(stats.p99 || 0, { good: 3000, warning: 8000 })}`}>
                          {stats.p99?.toFixed(0)}ms
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Errors */}
          {data.errors?.commonErrors && data.errors.commonErrors.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-charcoal-black mb-4">
                Recent Errors (Last 5 Minutes)
              </h2>
              
              <div className="space-y-3">
                {data.errors.commonErrors.slice(0, 5).map((error: any, index: number) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex-1">
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
            </Card>
          )}
        </>
      )}

      {!data && isConnected && (
        <Card className="p-6">
          <div className="text-center text-muted-olive">
            <p>Connecting to real-time data...</p>
          </div>
        </Card>
      )}

      {!isConnected && (
        <Card className="p-6">
          <div className="text-center text-muted-olive">
            <p>Click "Start Monitoring" to begin real-time tracking</p>
          </div>
        </Card>
      )}
    </div>
  );
}