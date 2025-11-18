import { logger } from '@/utils/logger';
import { analyticsService } from './analytics.service';
import { monitoringService } from './monitoring.service';

// Checkout analytics interfaces
interface CheckoutFunnelData {
  stage: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

interface CheckoutPerformanceData {
  metric: string;
  value: number;
  stage: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

interface CheckoutErrorData {
  errorType: string;
  stage: string;
  error: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

interface CheckoutFeedbackData {
  rating: number;
  comment?: string;
  step: string;
  issues: string[];
  suggestions?: string;
  userId?: string;
  sessionId: string;
  timestamp: Date;
}

interface ABTestData {
  testId: string;
  variantId: string;
  event: 'assignment' | 'conversion';
  userId?: string;
  sessionId: string;
  timestamp: Date;
  properties: Record<string, any>;
}

// Checkout conversion funnel stages
enum CheckoutStage {
  CHECKOUT_START = 'checkout_start',
  SHIPPING_ADDRESS = 'shipping_address',
  SHIPPING_METHOD = 'shipping_method',
  PAYMENT_METHOD = 'payment_method',
  ORDER_REVIEW = 'order_review',
  ORDER_COMPLETE = 'order_complete',
  CHECKOUT_ABANDON = 'checkout_abandon'
}

class CheckoutAnalyticsService {
  private funnelData: CheckoutFunnelData[] = [];
  private performanceData: CheckoutPerformanceData[] = [];
  private errorData: CheckoutErrorData[] = [];
  private feedbackData: CheckoutFeedbackData[] = [];
  private abTestData: ABTestData[] = [];
  private maxStoredRecords = 50000;

  // Track checkout funnel progression
  trackFunnelStage(data: CheckoutFunnelData): void {
    this.funnelData.push(data);
    this.trimData('funnel');

    // Send to main analytics service
    analyticsService.trackFunnelStage(data.stage as any, data.userId, {
      sessionId: data.sessionId,
      ...data.properties
    });

    // Track specific checkout metrics
    monitoringService.recordMetric('checkout_funnel_progression', 1, {
      stage: data.stage,
      sessionId: data.sessionId
    });

    logger.info('Checkout funnel stage tracked', {
      stage: data.stage,
      userId: data.userId,
      sessionId: data.sessionId
    });
  }

  // Track checkout performance metrics
  trackPerformance(data: CheckoutPerformanceData): void {
    this.performanceData.push(data);
    this.trimData('performance');

    // Send to monitoring service
    monitoringService.recordMetric(`checkout_${data.metric}`, data.value, {
      stage: data.stage,
      sessionId: data.sessionId
    });

    // Track performance alerts
    this.checkPerformanceAlerts(data);

    logger.info('Checkout performance tracked', {
      metric: data.metric,
      value: data.value,
      stage: data.stage
    });
  }

  // Track checkout errors
  trackError(data: CheckoutErrorData): void {
    this.errorData.push(data);
    this.trimData('error');

    // Send to main analytics service
    analyticsService.trackError(data.error, data.userId, {
      errorType: data.errorType,
      stage: data.stage,
      sessionId: data.sessionId,
      ...data.properties
    });

    // Track error metrics
    monitoringService.recordMetric('checkout_errors', 1, {
      errorType: data.errorType,
      stage: data.stage
    });

    // Send alerts for critical errors
    this.checkErrorAlerts(data);

    logger.error('Checkout error tracked', {
      errorType: data.errorType,
      stage: data.stage,
      error: data.error,
      userId: data.userId
    });
  }

  // Track checkout feedback
  trackFeedback(data: CheckoutFeedbackData): void {
    this.feedbackData.push(data);
    this.trimData('feedback');

    // Send to main analytics service
    analyticsService.trackEvent('checkout_feedback', data.userId, {
      rating: data.rating,
      step: data.step,
      issues: data.issues,
      sessionId: data.sessionId
    });

    // Track feedback metrics
    monitoringService.recordMetric('checkout_feedback_rating', data.rating, {
      step: data.step
    });

    logger.info('Checkout feedback tracked', {
      rating: data.rating,
      step: data.step,
      userId: data.userId
    });
  }

  // Track A/B test events
  trackABTest(data: ABTestData): void {
    this.abTestData.push(data);
    this.trimData('abtest');

    // Send to main analytics service
    analyticsService.trackEvent(`ab_test_${data.event}`, data.userId, {
      testId: data.testId,
      variantId: data.variantId,
      sessionId: data.sessionId,
      ...data.properties
    });

    logger.info('A/B test event tracked', {
      testId: data.testId,
      variantId: data.variantId,
      event: data.event
    });
  }

  // Get checkout funnel analysis
  getFunnelAnalysis(timeRange: number = 86400000): Record<string, any> {
    const cutoff = Date.now() - timeRange;
    const recentData = this.funnelData.filter(d => d.timestamp.getTime() > cutoff);

    // Calculate funnel metrics
    const stageData = Object.values(CheckoutStage).map(stage => {
      const stageEvents = recentData.filter(d => d.stage === stage);
      const uniqueSessions = new Set(stageEvents.map(d => d.sessionId)).size;
      
      return {
        stage,
        events: stageEvents.length,
        uniqueSessions,
        avgTimeOnStage: this.calculateAvgTimeOnStage(stage, recentData)
      };
    });

    // Calculate conversion rates
    const conversionRates = this.calculateConversionRates(stageData);
    
    // Calculate drop-off points
    const dropOffAnalysis = this.calculateDropOffAnalysis(stageData);

    return {
      timeRange: timeRange / (1000 * 60 * 60), // Convert to hours
      totalSessions: new Set(recentData.map(d => d.sessionId)).size,
      stageData,
      conversionRates,
      dropOffAnalysis,
      topDropOffReasons: this.getTopDropOffReasons(timeRange)
    };
  }

  // Get performance analysis
  getPerformanceAnalysis(timeRange: number = 86400000): Record<string, any> {
    const cutoff = Date.now() - timeRange;
    const recentData = this.performanceData.filter(d => d.timestamp.getTime() > cutoff);

    // Group by metric and stage
    const metricsByStage = this.groupPerformanceByStage(recentData);
    
    // Calculate performance percentiles
    const performancePercentiles = this.calculatePerformancePercentiles(recentData);
    
    // Identify slow stages
    const slowStages = this.identifySlowStages(metricsByStage);

    return {
      timeRange: timeRange / (1000 * 60 * 60),
      totalMeasurements: recentData.length,
      metricsByStage,
      performancePercentiles,
      slowStages,
      performanceAlerts: this.getPerformanceAlerts(timeRange)
    };
  }

  // Get error analysis
  getErrorAnalysis(timeRange: number = 86400000): Record<string, any> {
    const cutoff = Date.now() - timeRange;
    const recentData = this.errorData.filter(d => d.timestamp.getTime() > cutoff);

    // Group errors by type and stage
    const errorsByType = this.groupBy(recentData, 'errorType');
    const errorsByStage = this.groupBy(recentData, 'stage');
    
    // Calculate error rates
    const errorRates = this.calculateErrorRates(recentData, timeRange);
    
    // Get most common errors
    const commonErrors = this.getCommonErrors(recentData);

    return {
      timeRange: timeRange / (1000 * 60 * 60),
      totalErrors: recentData.length,
      errorsByType,
      errorsByStage,
      errorRates,
      commonErrors,
      criticalErrors: recentData.filter(d => d.errorType === 'payment_error' || d.errorType === 'server_error')
    };
  }

  // Get feedback analysis
  getFeedbackAnalysis(timeRange: number = 86400000): Record<string, any> {
    const cutoff = Date.now() - timeRange;
    const recentData = this.feedbackData.filter(d => d.timestamp.getTime() > cutoff);

    // Calculate average ratings by step
    const ratingsByStep = this.calculateRatingsByStep(recentData);
    
    // Get common issues
    const commonIssues = this.getCommonIssues(recentData);
    
    // Analyze feedback trends
    const feedbackTrends = this.analyzeFeedbackTrends(recentData);

    return {
      timeRange: timeRange / (1000 * 60 * 60),
      totalFeedback: recentData.length,
      averageRating: recentData.reduce((sum, d) => sum + d.rating, 0) / recentData.length,
      ratingsByStep,
      commonIssues,
      feedbackTrends,
      suggestions: recentData.filter(d => d.suggestions).map(d => ({
        step: d.step,
        suggestion: d.suggestions,
        rating: d.rating
      }))
    };
  }

  // Get A/B test analysis
  getABTestAnalysis(testId?: string, timeRange: number = 86400000): Record<string, any> {
    const cutoff = Date.now() - timeRange;
    let recentData = this.abTestData.filter(d => d.timestamp.getTime() > cutoff);
    
    if (testId) {
      recentData = recentData.filter(d => d.testId === testId);
    }

    // Group by test and variant
    const testResults = this.groupABTestResults(recentData);
    
    // Calculate conversion rates by variant
    const conversionRates = this.calculateABTestConversions(recentData);
    
    // Statistical significance testing
    const significanceTests = this.calculateStatisticalSignificance(recentData);

    return {
      timeRange: timeRange / (1000 * 60 * 60),
      totalEvents: recentData.length,
      testResults,
      conversionRates,
      significanceTests,
      recommendations: this.generateABTestRecommendations(testResults, conversionRates)
    };
  }

  // Private helper methods
  private trimData(type: 'funnel' | 'performance' | 'error' | 'feedback' | 'abtest'): void {
    const arrays = {
      funnel: this.funnelData,
      performance: this.performanceData,
      error: this.errorData,
      feedback: this.feedbackData,
      abtest: this.abTestData
    };

    const array = arrays[type];
    if (array.length > this.maxStoredRecords) {
      array.splice(0, array.length - this.maxStoredRecords);
    }
  }

  private calculateAvgTimeOnStage(stage: string, data: CheckoutFunnelData[]): number {
    const stageEvents = data.filter(d => d.stage === stage);
    const times = stageEvents
      .map(d => d.properties.timeOnStage)
      .filter(t => typeof t === 'number');
    
    return times.length > 0 ? times.reduce((sum, t) => sum + t, 0) / times.length : 0;
  }

  private calculateConversionRates(stageData: any[]): Record<string, number> {
    const rates: Record<string, number> = {};
    
    for (let i = 0; i < stageData.length - 1; i++) {
      const current = stageData[i];
      const next = stageData[i + 1];
      
      if (current.uniqueSessions > 0) {
        rates[`${current.stage}_to_${next.stage}`] = 
          (next.uniqueSessions / current.uniqueSessions) * 100;
      }
    }
    
    return rates;
  }

  private calculateDropOffAnalysis(stageData: any[]): Record<string, any> {
    const dropOffs: Record<string, any> = {};
    
    for (let i = 0; i < stageData.length - 1; i++) {
      const current = stageData[i];
      const next = stageData[i + 1];
      
      const dropOffCount = current.uniqueSessions - next.uniqueSessions;
      const dropOffRate = current.uniqueSessions > 0 ? 
        (dropOffCount / current.uniqueSessions) * 100 : 0;
      
      dropOffs[current.stage] = {
        dropOffCount,
        dropOffRate,
        remainingSessions: next.uniqueSessions
      };
    }
    
    return dropOffs;
  }

  private getTopDropOffReasons(timeRange: number): Array<{reason: string, count: number}> {
    const cutoff = Date.now() - timeRange;
    const abandonEvents = this.funnelData.filter(d => 
      d.stage === CheckoutStage.CHECKOUT_ABANDON && 
      d.timestamp.getTime() > cutoff
    );

    const reasons: Record<string, number> = {};
    abandonEvents.forEach(event => {
      const reason = event.properties.reason || 'unknown';
      reasons[reason] = (reasons[reason] || 0) + 1;
    });

    return Object.entries(reasons)
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private groupPerformanceByStage(data: CheckoutPerformanceData[]): Record<string, any> {
    const grouped: Record<string, Record<string, number[]>> = {};
    
    data.forEach(d => {
      if (d.stage && d.metric) {
        if (!grouped[d.stage]) grouped[d.stage] = {};
        if (!grouped[d.stage]![d.metric]) grouped[d.stage]![d.metric] = [];
        grouped[d.stage]![d.metric]!.push(d.value);
      }
    });

    // Calculate statistics for each metric
    const result: Record<string, any> = {};
    Object.entries(grouped).forEach(([stage, metrics]) => {
      result[stage] = {};
      Object.entries(metrics).forEach(([metric, values]) => {
        result[stage][metric] = {
          count: values.length,
          avg: values.reduce((sum, v) => sum + v, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          p50: this.percentile(values, 50),
          p95: this.percentile(values, 95),
          p99: this.percentile(values, 99)
        };
      });
    });

    return result;
  }

  private calculatePerformancePercentiles(data: CheckoutPerformanceData[]): Record<string, any> {
    const metricGroups: Record<string, number[]> = {};
    
    data.forEach(d => {
      if (d.metric) {
        if (!metricGroups[d.metric]) metricGroups[d.metric] = [];
        metricGroups[d.metric]!.push(d.value);
      }
    });

    const result: Record<string, any> = {};
    Object.entries(metricGroups).forEach(([metric, values]) => {
      result[metric] = {
        p50: this.percentile(values, 50),
        p75: this.percentile(values, 75),
        p90: this.percentile(values, 90),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99)
      };
    });

    return result;
  }

  private identifySlowStages(metricsByStage: Record<string, any>): Array<{stage: string, metric: string, value: number}> {
    const slowStages: Array<{stage: string, metric: string, value: number}> = [];
    
    // Define performance thresholds (in milliseconds)
    const thresholds = {
      step_load_time: 3000,
      form_validation_time: 500,
      api_response_time: 2000,
      page_transition_time: 1000
    };

    Object.entries(metricsByStage).forEach(([stage, metrics]) => {
      Object.entries(metrics).forEach(([metric, stats]: [string, any]) => {
        const threshold = thresholds[metric as keyof typeof thresholds];
        if (threshold && (stats as any).p95 > threshold) {
          slowStages.push({
            stage,
            metric,
            value: (stats as any).p95
          });
        }
      });
    });

    return slowStages.sort((a, b) => b.value - a.value);
  }

  private getPerformanceAlerts(timeRange: number): Array<{type: string, message: string, severity: string}> {
    // This would typically check against predefined alert rules
    return [];
  }

  private calculateErrorRates(data: CheckoutErrorData[], timeRange: number): Record<string, number> {
    const totalSessions = new Set(this.funnelData
      .filter(d => d.timestamp.getTime() > Date.now() - timeRange)
      .map(d => d.sessionId)
    ).size;

    const errorSessions = new Set(data.map(d => d.sessionId)).size;
    
    return {
      errorRate: totalSessions > 0 ? (errorSessions / totalSessions) * 100 : 0,
      errorsPerSession: totalSessions > 0 ? data.length / totalSessions : 0
    };
  }

  private getCommonErrors(data: CheckoutErrorData[]): Array<{error: string, count: number, stages: string[]}> {
    const errorCounts: Record<string, {count: number, stages: Set<string>}> = {};
    
    data.forEach(d => {
      if (d.error && d.stage) {
        if (!errorCounts[d.error]) {
          errorCounts[d.error] = { count: 0, stages: new Set() };
        }
        errorCounts[d.error]!.count++;
        errorCounts[d.error]!.stages.add(d.stage);
      }
    });

    return Object.entries(errorCounts)
      .map(([error, data]) => ({
        error,
        count: data.count,
        stages: Array.from(data.stages)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);
  }

  private calculateRatingsByStep(data: CheckoutFeedbackData[]): Record<string, any> {
    const stepRatings: Record<string, number[]> = {};
    
    data.forEach(d => {
      if (d.step) {
        if (!stepRatings[d.step]) stepRatings[d.step] = [];
        stepRatings[d.step]!.push(d.rating);
      }
    });

    const result: Record<string, any> = {};
    Object.entries(stepRatings).forEach(([step, ratings]) => {
      result[step] = {
        count: ratings.length,
        average: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
        distribution: this.getRatingDistribution(ratings)
      };
    });

    return result;
  }

  private getCommonIssues(data: CheckoutFeedbackData[]): Array<{issue: string, count: number, avgRating: number}> {
    const issueCounts: Record<string, {count: number, ratings: number[]}> = {};
    
    data.forEach(d => {
      d.issues.forEach(issue => {
        if (!issueCounts[issue]) {
          issueCounts[issue] = { count: 0, ratings: [] };
        }
        issueCounts[issue].count++;
        issueCounts[issue].ratings.push(d.rating);
      });
    });

    return Object.entries(issueCounts)
      .map(([issue, data]) => ({
        issue,
        count: data.count,
        avgRating: data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);
  }

  private analyzeFeedbackTrends(data: CheckoutFeedbackData[]): Record<string, any> {
    // Group by time periods (daily)
    const dailyRatings: Record<string, number[]> = {};
    
    data.forEach(d => {
      if (d.timestamp) {
        const day = d.timestamp.toISOString().split('T')[0];
        if (day && !dailyRatings[day]) dailyRatings[day] = [];
        if (day) dailyRatings[day]!.push(d.rating);
      }
    });

    const trends = Object.entries(dailyRatings).map(([day, ratings]) => ({
      date: day,
      avgRating: ratings.reduce((sum, r) => sum + r, 0) / ratings.length,
      count: ratings.length
    })).sort((a, b) => a.date.localeCompare(b.date));

    return {
      dailyTrends: trends,
      overallTrend: this.calculateTrend(trends.map(t => t.avgRating))
    };
  }

  private groupABTestResults(data: ABTestData[]): Record<string, any> {
    const results: Record<string, Record<string, {assignments: number, conversions: number}>> = {};
    
    data.forEach(d => {
      if (d.testId && d.variantId) {
        if (!results[d.testId]) results[d.testId] = {};
        if (!results[d.testId]![d.variantId]) {
          results[d.testId]![d.variantId] = { assignments: 0, conversions: 0 };
        }
        
        if (d.event === 'assignment') {
          results[d.testId]![d.variantId]!.assignments++;
        } else if (d.event === 'conversion') {
          results[d.testId]![d.variantId]!.conversions++;
        }
      }
    });

    return results;
  }

  private calculateABTestConversions(data: ABTestData[]): Record<string, any> {
    const results = this.groupABTestResults(data);
    const conversionRates: Record<string, Record<string, number>> = {};
    
    Object.entries(results).forEach(([testId, variants]) => {
      conversionRates[testId] = {};
      Object.entries(variants).forEach(([variantId, stats]) => {
        const typedStats = stats as { assignments: number; conversions: number };
        conversionRates[testId]![variantId] = typedStats.assignments > 0 ? 
          (typedStats.conversions / typedStats.assignments) * 100 : 0;
      });
    });

    return conversionRates;
  }

  private calculateStatisticalSignificance(data: ABTestData[]): Record<string, any> {
    // Simplified statistical significance calculation
    // In production, you'd use proper statistical tests
    return {};
  }

  private generateABTestRecommendations(testResults: any, conversionRates: any): string[] {
    const recommendations: string[] = [];
    
    Object.entries(conversionRates).forEach(([testId, variants]: [string, any]) => {
      const variantRates = Object.entries(variants) as [string, number][];
      const bestVariant = variantRates.reduce((best, current) => 
        current[1] > best[1] ? current : best
      );
      
      if (bestVariant[1] > 0) {
        recommendations.push(
          `Test ${testId}: Variant ${bestVariant[0]} shows highest conversion rate at ${bestVariant[1].toFixed(2)}%`
        );
      }
    });

    return recommendations;
  }

  // Utility methods
  private groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce((groups, item) => {
      const group = String(item[key]);
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  }

  private percentile(values: number[], p: number): number {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index % 1;
    
    if (upper >= sorted.length) return sorted[sorted.length - 1] || 0;
    return (sorted[lower] || 0) * (1 - weight) + (sorted[upper] || 0) * weight;
  }

  private getRatingDistribution(ratings: number[]): Record<number, number> {
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ratings.forEach(rating => {
      distribution[rating] = (distribution[rating] || 0) + 1;
    });
    return distribution;
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    
    const firstAvg = first.reduce((sum, v) => sum + v, 0) / first.length;
    const secondAvg = second.reduce((sum, v) => sum + v, 0) / second.length;
    
    const diff = secondAvg - firstAvg;
    if (Math.abs(diff) < 0.1) return 'stable';
    return diff > 0 ? 'increasing' : 'decreasing';
  }

  private checkPerformanceAlerts(data: CheckoutPerformanceData): void {
    // Define alert thresholds
    const alertThresholds = {
      step_load_time: 5000, // 5 seconds
      form_validation_time: 1000, // 1 second
      api_response_time: 3000, // 3 seconds
    };

    const threshold = alertThresholds[data.metric as keyof typeof alertThresholds];
    if (threshold && data.value > threshold) {
      logger.warn('Checkout performance alert', {
        metric: data.metric,
        value: data.value,
        threshold,
        stage: data.stage,
        severity: 'warning'
      });
    }
  }

  private checkErrorAlerts(data: CheckoutErrorData): void {
    // Log alerts for critical errors
    const criticalErrors = ['payment_error', 'server_error'];
    if (criticalErrors.includes(data.errorType)) {
      logger.error('Checkout critical error alert', {
        errorType: data.errorType,
        stage: data.stage,
        error: data.error,
        severity: 'critical'
      });
    }
  }
}

export const checkoutAnalyticsService = new CheckoutAnalyticsService();
export { CheckoutStage };