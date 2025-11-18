import { Request, Response } from 'express';
import { checkoutAnalyticsService } from '@/services/checkout-analytics.service';
import { logger } from '@/utils/logger';
import { ApiResponseHelper } from '@/utils/api-response';

class CheckoutAnalyticsController {
  // Track funnel progression
  async trackFunnel(req: Request, res: Response): Promise<Response> {
    try {
      const { stage, sessionId, properties = {} } = req.body;
      const userId = req.user?.id;

      checkoutAnalyticsService.trackFunnelStage({
        stage,
        userId: userId || '',
        sessionId,
        timestamp: new Date(),
        properties
      });

      return ApiResponseHelper.success(res, null, 'Funnel stage tracked successfully');
    } catch (error) {
      logger.error('Error tracking funnel stage:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to track funnel stage');
    }
  }

  // Track performance metrics
  async trackPerformance(req: Request, res: Response): Promise<Response> {
    try {
      const { metric, value, stage, sessionId, properties = {} } = req.body;
      const userId = req.user?.id;

      checkoutAnalyticsService.trackPerformance({
        metric,
        value,
        stage,
        userId: userId || '',
        sessionId,
        timestamp: new Date(),
        properties
      });

      return ApiResponseHelper.success(res, null, 'Performance metric tracked successfully');
    } catch (error) {
      logger.error('Error tracking performance:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to track performance');
    }
  }

  // Track checkout errors
  async trackError(req: Request, res: Response): Promise<Response> {
    try {
      const { errorType, stage, error, sessionId, properties = {} } = req.body;
      const userId = req.user?.id;

      checkoutAnalyticsService.trackError({
        errorType,
        stage,
        error,
        userId: userId || '',
        sessionId,
        timestamp: new Date(),
        properties
      });

      return ApiResponseHelper.success(res, null, 'Error tracked successfully');
    } catch (error) {
      logger.error('Error tracking checkout error:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to track error');
    }
  }

  // Track user feedback
  async trackFeedback(req: Request, res: Response): Promise<Response> {
    try {
      const { rating, comment, step, issues, suggestions, sessionId } = req.body;
      const userId = req.user?.id;

      checkoutAnalyticsService.trackFeedback({
        rating,
        comment,
        step,
        issues,
        suggestions,
        userId: userId || '',
        sessionId,
        timestamp: new Date()
      });

      return ApiResponseHelper.success(res, null, 'Feedback tracked successfully');
    } catch (error) {
      logger.error('Error tracking feedback:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to track feedback');
    }
  }

  // Track A/B test events
  async trackABTest(req: Request, res: Response): Promise<Response> {
    try {
      const { testId, variantId, event, sessionId, properties = {} } = req.body;
      const userId = req.user?.id;

      checkoutAnalyticsService.trackABTest({
        testId,
        variantId,
        event,
        userId: userId || '',
        sessionId,
        timestamp: new Date(),
        properties
      });

      return ApiResponseHelper.success(res, null, 'A/B test event tracked successfully');
    } catch (error) {
      logger.error('Error tracking A/B test:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to track A/B test');
    }
  }

  // Get user session data
  async getUserSession(req: Request, res: Response): Promise<Response> {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.query;

      // This would typically fetch session data from database
      const sessionData = {
        userId,
        sessionId,
        currentStage: 'checkout_start',
        startTime: new Date(),
        lastActivity: new Date()
      };

      return ApiResponseHelper.success(res, sessionData, 'Session data retrieved');
    } catch (error) {
      logger.error('Error getting user session:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get session data');
    }
  }

  // Get funnel analysis
  async getFunnelAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = 86400000 } = req.query; // Default 24 hours
      const analysis = checkoutAnalyticsService.getFunnelAnalysis(Number(timeRange));

      return ApiResponseHelper.success(res, analysis, 'Funnel analysis retrieved');
    } catch (error) {
      logger.error('Error getting funnel analysis:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get funnel analysis');
    }
  }

  // Get performance analysis
  async getPerformanceAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = 86400000 } = req.query;
      const analysis = checkoutAnalyticsService.getPerformanceAnalysis(Number(timeRange));

      return ApiResponseHelper.success(res, analysis, 'Performance analysis retrieved');
    } catch (error) {
      logger.error('Error getting performance analysis:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get performance analysis');
    }
  }

  // Get error analysis
  async getErrorAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = 86400000 } = req.query;
      const analysis = checkoutAnalyticsService.getErrorAnalysis(Number(timeRange));

      return ApiResponseHelper.success(res, analysis, 'Error analysis retrieved');
    } catch (error) {
      logger.error('Error getting error analysis:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get error analysis');
    }
  }

  // Get feedback analysis
  async getFeedbackAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = 86400000 } = req.query;
      const analysis = checkoutAnalyticsService.getFeedbackAnalysis(Number(timeRange));

      return ApiResponseHelper.success(res, analysis, 'Feedback analysis retrieved');
    } catch (error) {
      logger.error('Error getting feedback analysis:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get feedback analysis');
    }
  }

  // Get A/B test analysis
  async getABTestAnalysis(req: Request, res: Response): Promise<Response> {
    try {
      const { testId, timeRange = 86400000 } = req.query;
      const analysis = checkoutAnalyticsService.getABTestAnalysis(
        testId as string, 
        Number(timeRange)
      );

      return ApiResponseHelper.success(res, analysis, 'A/B test analysis retrieved');
    } catch (error) {
      logger.error('Error getting A/B test analysis:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get A/B test analysis');
    }
  }

  // Get comprehensive dashboard data
  async getDashboard(req: Request, res: Response): Promise<Response> {
    try {
      const { timeRange = 86400000 } = req.query;
      const timeRangeMs = Number(timeRange);

      const dashboard = {
        funnel: checkoutAnalyticsService.getFunnelAnalysis(timeRangeMs),
        performance: checkoutAnalyticsService.getPerformanceAnalysis(timeRangeMs),
        errors: checkoutAnalyticsService.getErrorAnalysis(timeRangeMs),
        feedback: checkoutAnalyticsService.getFeedbackAnalysis(timeRangeMs),
        abTests: checkoutAnalyticsService.getABTestAnalysis(undefined, timeRangeMs),
        summary: {
          timeRange: timeRangeMs / (1000 * 60 * 60), // Convert to hours
          generatedAt: new Date()
        }
      };

      return ApiResponseHelper.success(res, dashboard, 'Dashboard data retrieved');
    } catch (error) {
      logger.error('Error getting dashboard data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get dashboard data');
    }
  }

  // Real-time funnel data
  async getRealtimeFunnel(req: Request, res: Response): Promise<Response> {
    try {
      const realtimeData = checkoutAnalyticsService.getFunnelAnalysis(300000); // Last 5 minutes

      return ApiResponseHelper.success(res, realtimeData, 'Real-time funnel data retrieved');
    } catch (error) {
      logger.error('Error getting real-time funnel data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get real-time data');
    }
  }

  // Real-time performance data
  async getRealtimePerformance(req: Request, res: Response): Promise<Response> {
    try {
      const realtimeData = checkoutAnalyticsService.getPerformanceAnalysis(300000); // Last 5 minutes

      return ApiResponseHelper.success(res, realtimeData, 'Real-time performance data retrieved');
    } catch (error) {
      logger.error('Error getting real-time performance data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get real-time data');
    }
  }

  // Real-time error data
  async getRealtimeErrors(req: Request, res: Response): Promise<Response> {
    try {
      const realtimeData = checkoutAnalyticsService.getErrorAnalysis(300000); // Last 5 minutes

      return ApiResponseHelper.success(res, realtimeData, 'Real-time error data retrieved');
    } catch (error) {
      logger.error('Error getting real-time error data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get real-time data');
    }
  }

  // Export funnel data
  async exportFunnelData(req: Request, res: Response): Promise<Response | void> {
    try {
      const { timeRange = 86400000, format = 'json' } = req.query;
      const data = checkoutAnalyticsService.getFunnelAnalysis(Number(timeRange));

      if (format === 'csv') {
        // Convert to CSV format
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=funnel-data.csv');
        res.send(csv);
      } else {
        return ApiResponseHelper.success(res, data, 'Funnel data exported');
      }
    } catch (error) {
      logger.error('Error exporting funnel data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to export data');
    }
  }

  // Export performance data
  async exportPerformanceData(req: Request, res: Response): Promise<Response | void> {
    try {
      const { timeRange = 86400000, format = 'json' } = req.query;
      const data = checkoutAnalyticsService.getPerformanceAnalysis(Number(timeRange));

      if (format === 'csv') {
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=performance-data.csv');
        res.send(csv);
      } else {
        return ApiResponseHelper.success(res, data, 'Performance data exported');
      }
    } catch (error) {
      logger.error('Error exporting performance data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to export data');
    }
  }

  // Export feedback data
  async exportFeedbackData(req: Request, res: Response): Promise<Response | void> {
    try {
      const { timeRange = 86400000, format = 'json' } = req.query;
      const data = checkoutAnalyticsService.getFeedbackAnalysis(Number(timeRange));

      if (format === 'csv') {
        const csv = this.convertToCSV(data);
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=feedback-data.csv');
        res.send(csv);
      } else {
        return ApiResponseHelper.success(res, data, 'Feedback data exported');
      }
    } catch (error) {
      logger.error('Error exporting feedback data:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to export data');
    }
  }

  // A/B test management
  async getABTests(req: Request, res: Response): Promise<Response> {
    try {
      // Mock A/B tests data - in production, this would come from database
      const tests = [
        {
          id: 'checkout_layout_test',
          name: 'Checkout Layout Optimization',
          status: 'active',
          variants: [
            { id: 'control', name: 'Original Layout', traffic: 50 },
            { id: 'simplified', name: 'Simplified Layout', traffic: 50 }
          ],
          startDate: new Date('2024-01-01'),
          endDate: null,
          metrics: {
            participants: 1250,
            conversions: 156,
            conversionRate: 12.48
          }
        }
      ];

      return ApiResponseHelper.success(res, tests, 'A/B tests retrieved');
    } catch (error) {
      logger.error('Error getting A/B tests:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get A/B tests');
    }
  }

  async createABTest(req: Request, res: Response): Promise<Response> {
    try {
      const testData = req.body;
      
      // Mock creation - in production, save to database
      const newTest = {
        id: `test_${Date.now()}`,
        ...testData,
        status: 'draft',
        createdAt: new Date(),
        createdBy: req.user?.id
      };

      return ApiResponseHelper.created(res, newTest, 'A/B test created');
    } catch (error) {
      logger.error('Error creating A/B test:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to create A/B test');
    }
  }

  async updateABTest(req: Request, res: Response): Promise<Response> {
    try {
      const { testId } = req.params;
      const updateData = req.body;

      // Mock update - in production, update in database
      const updatedTest = {
        id: testId,
        ...updateData,
        updatedAt: new Date(),
        updatedBy: req.user?.id
      };

      return ApiResponseHelper.success(res, updatedTest, 'A/B test updated');
    } catch (error) {
      logger.error('Error updating A/B test:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to update A/B test');
    }
  }

  async deleteABTest(req: Request, res: Response): Promise<Response> {
    try {
      const { testId } = req.params;

      // Mock deletion - in production, delete from database
      return ApiResponseHelper.success(res, null, 'A/B test deleted');
    } catch (error) {
      logger.error('Error deleting A/B test:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to delete A/B test');
    }
  }

  // Performance alerts management
  async getAlerts(req: Request, res: Response): Promise<Response> {
    try {
      // Mock alerts data
      const alerts = [
        {
          id: 'alert_1',
          name: 'High Checkout Drop-off',
          condition: 'drop_off_rate > 30%',
          status: 'active',
          lastTriggered: new Date(),
          severity: 'warning'
        }
      ];

      return ApiResponseHelper.success(res, alerts, 'Alerts retrieved');
    } catch (error) {
      logger.error('Error getting alerts:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to get alerts');
    }
  }

  async createAlert(req: Request, res: Response): Promise<Response> {
    try {
      const alertData = req.body;
      
      const newAlert = {
        id: `alert_${Date.now()}`,
        ...alertData,
        status: 'active',
        createdAt: new Date(),
        createdBy: req.user?.id
      };

      return ApiResponseHelper.created(res, newAlert, 'Alert created');
    } catch (error) {
      logger.error('Error creating alert:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to create alert');
    }
  }

  async updateAlert(req: Request, res: Response): Promise<Response> {
    try {
      const { alertId } = req.params;
      const updateData = req.body;

      const updatedAlert = {
        id: alertId,
        ...updateData,
        updatedAt: new Date(),
        updatedBy: req.user?.id
      };

      return ApiResponseHelper.success(res, updatedAlert, 'Alert updated');
    } catch (error) {
      logger.error('Error updating alert:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to update alert');
    }
  }

  async deleteAlert(req: Request, res: Response): Promise<Response> {
    try {
      const { alertId } = req.params;

      return ApiResponseHelper.success(res, null, 'Alert deleted');
    } catch (error) {
      logger.error('Error deleting alert:', error);
      return ApiResponseHelper.internalServerError(res, 'Failed to delete alert');
    }
  }

  // Utility method to convert data to CSV
  private convertToCSV(data: any): string {
    if (!data || typeof data !== 'object') {
      return '';
    }

    // Simple CSV conversion - in production, use a proper CSV library
    const headers = Object.keys(data);
    const csvHeaders = headers.join(',');
    const csvData = headers.map(header => JSON.stringify(data[header])).join(',');
    
    return `${csvHeaders}\n${csvData}`;
  }
}

export const checkoutAnalyticsController = new CheckoutAnalyticsController();