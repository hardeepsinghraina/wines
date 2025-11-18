'use client';

import { api } from '@/lib/api';

// API client for checkout analytics
export class CheckoutAnalyticsAPI {
  private baseUrl = '/api/checkout-analytics';

  // Track funnel stage
  async trackFunnel(data: {
    stage: string;
    sessionId: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/track/funnel`, data);
    } catch (error) {
      console.error('Failed to track funnel stage:', error);
    }
  }

  // Track performance metric
  async trackPerformance(data: {
    metric: string;
    value: number;
    stage: string;
    sessionId: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/track/performance`, data);
    } catch (error) {
      console.error('Failed to track performance:', error);
    }
  }

  // Track error
  async trackError(data: {
    errorType: string;
    stage: string;
    error: string;
    sessionId: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/track/error`, data);
    } catch (error) {
      console.error('Failed to track error:', error);
    }
  }

  // Track feedback
  async trackFeedback(data: {
    rating: number;
    comment?: string;
    step: string;
    issues: string[];
    suggestions?: string;
    sessionId: string;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/track/feedback`, data);
    } catch (error) {
      console.error('Failed to track feedback:', error);
    }
  }

  // Track A/B test event
  async trackABTest(data: {
    testId: string;
    variantId: string;
    event: 'assignment' | 'conversion';
    sessionId: string;
    properties?: Record<string, any>;
  }): Promise<void> {
    try {
      await api.post(`${this.baseUrl}/track/ab-test`, data);
    } catch (error) {
      console.error('Failed to track A/B test:', error);
    }
  }

  // Get user session data
  async getUserSession(sessionId: string): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/my-session?sessionId=${encodeURIComponent(sessionId)}`);
      return response;
    } catch (error) {
      console.error('Failed to get user session:', error);
      return null;
    }
  }

  // Admin endpoints
  async getFunnelAnalysis(timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/funnel-analysis?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get funnel analysis:', error);
      return null;
    }
  }

  async getPerformanceAnalysis(timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/performance-analysis?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get performance analysis:', error);
      return null;
    }
  }

  async getErrorAnalysis(timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/error-analysis?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get error analysis:', error);
      return null;
    }
  }

  async getFeedbackAnalysis(timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/feedback-analysis?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get feedback analysis:', error);
      return null;
    }
  }

  async getABTestAnalysis(testId?: string, timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/ab-test-analysis?testId=${encodeURIComponent(testId || '')}&timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get A/B test analysis:', error);
      return null;
    }
  }

  async getDashboard(timeRange?: number): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/dashboard?timeRange=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to get dashboard data:', error);
      return null;
    }
  }

  // Real-time data endpoints
  async getRealtimeFunnel(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/realtime/funnel`);
      return response;
    } catch (error) {
      console.error('Failed to get real-time funnel data:', error);
      return null;
    }
  }

  async getRealtimePerformance(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/realtime/performance`);
      return response;
    } catch (error) {
      console.error('Failed to get real-time performance data:', error);
      return null;
    }
  }

  async getRealtimeErrors(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/realtime/errors`);
      return response;
    } catch (error) {
      console.error('Failed to get real-time error data:', error);
      return null;
    }
  }

  // Export data
  async exportFunnelData(timeRange?: number, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/export/funnel?timeRange=${timeRange}&format=${encodeURIComponent(format)}`);
      return response;
    } catch (error) {
      console.error('Failed to export funnel data:', error);
      return null;
    }
  }

  async exportPerformanceData(timeRange?: number, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/export/performance?timeRange=${timeRange}&format=${encodeURIComponent(format)}`);
      return response;
    } catch (error) {
      console.error('Failed to export performance data:', error);
      return null;
    }
  }

  async exportFeedbackData(timeRange?: number, format: 'json' | 'csv' = 'json'): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/export/feedback?timeRange=${timeRange}&format=${encodeURIComponent(format)}`);
      return response;
    } catch (error) {
      console.error('Failed to export feedback data:', error);
      return null;
    }
  }

  // A/B test management
  async getABTests(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/ab-tests`);
      return response;
    } catch (error) {
      console.error('Failed to get A/B tests:', error);
      return null;
    }
  }

  async createABTest(testData: any): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/ab-tests`, testData);
      return response;
    } catch (error) {
      console.error('Failed to create A/B test:', error);
      return null;
    }
  }

  async updateABTest(testId: string, updateData: any): Promise<any> {
    try {
      const response = await api.put(`${this.baseUrl}/ab-tests/${testId}`, updateData);
      return response;
    } catch (error) {
      console.error('Failed to update A/B test:', error);
      return null;
    }
  }

  async deleteABTest(testId: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/ab-tests/${testId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete A/B test:', error);
      return false;
    }
  }

  // Alert management
  async getAlerts(): Promise<any> {
    try {
      const response = await api.get(`${this.baseUrl}/alerts`);
      return response;
    } catch (error) {
      console.error('Failed to get alerts:', error);
      return null;
    }
  }

  async createAlert(alertData: any): Promise<any> {
    try {
      const response = await api.post(`${this.baseUrl}/alerts`, alertData);
      return response;
    } catch (error) {
      console.error('Failed to create alert:', error);
      return null;
    }
  }

  async updateAlert(alertId: string, updateData: any): Promise<any> {
    try {
      const response = await api.put(`${this.baseUrl}/alerts/${alertId}`, updateData);
      return response;
    } catch (error) {
      console.error('Failed to update alert:', error);
      return null;
    }
  }

  async deleteAlert(alertId: string): Promise<boolean> {
    try {
      await api.delete(`${this.baseUrl}/alerts/${alertId}`);
      return true;
    } catch (error) {
      console.error('Failed to delete alert:', error);
      return false;
    }
  }
}

// Singleton instance
export const checkoutAnalyticsAPI = new CheckoutAnalyticsAPI();