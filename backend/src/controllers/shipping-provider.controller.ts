import { Request, Response } from 'express';
import { shippingProviderService } from '../services/shipping-provider.service';
import { ResponseHelper } from '../utils/response';
import { logger } from '../utils/logger';

export class ShippingProviderController {
  async createShippingLabel(req: Request, res: Response): Promise<void> {
    try {
      const { shipmentRequest, carrier = 'fedex' } = req.body;
      
      if (!shipmentRequest) {
        ResponseHelper.badRequest(res, 'Shipment request is required');
        return;
      }

      const label = await shippingProviderService.createShippingLabel(shipmentRequest, carrier);
      
      logger.info('Shipping label created', { 
        orderId: shipmentRequest.orderId,
        trackingNumber: label.trackingNumber,
        carrier: label.carrier
      });

      ResponseHelper.success(res, label);
    } catch (error) {
      logger.error('Failed to create shipping label', { error, body: req.body });
      
      if (error instanceof Error) {
        ResponseHelper.badRequest(res, error.message);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to create shipping label');
      }
    }
  }

  async getTrackingInfo(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber, carrier } = req.params;
      
      if (!trackingNumber || !carrier) {
        ResponseHelper.badRequest(res, 'Tracking number and carrier are required');
        return;
      }

      const trackingInfo = await shippingProviderService.getTrackingInfo(trackingNumber, carrier);
      
      ResponseHelper.success(res, trackingInfo);
    } catch (error) {
      logger.error('Failed to get tracking info', { error, params: req.params });
      
      if (error instanceof Error) {
        ResponseHelper.badRequest(res, error.message);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to retrieve tracking information');
      }
    }
  }

  async updateTrackingStatus(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumber, carrier } = req.params;
      
      if (!trackingNumber || !carrier) {
        ResponseHelper.badRequest(res, 'Tracking number and carrier are required');
        return;
      }

      const trackingInfo = await shippingProviderService.updateTrackingStatus(trackingNumber, carrier);
      
      logger.info('Tracking status updated', { 
        trackingNumber,
        carrier,
        status: trackingInfo.status
      });

      ResponseHelper.success(res, trackingInfo);
    } catch (error) {
      logger.error('Failed to update tracking status', { error, params: req.params });
      
      if (error instanceof Error) {
        ResponseHelper.badRequest(res, error.message);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to update tracking status');
      }
    }
  }

  async handleCarrierWebhook(req: Request, res: Response): Promise<void> {
    try {
      const { carrier } = req.params;
      const payload = req.body;
      
      if (!carrier) {
        ResponseHelper.badRequest(res, 'Carrier parameter is required');
        return;
      }

      await shippingProviderService.handleCarrierWebhook(carrier, payload);
      
      logger.info('Carrier webhook processed', { carrier, payload });

      ResponseHelper.success(res, null);
    } catch (error) {
      logger.error('Failed to process carrier webhook', { error, params: req.params, body: req.body });
      
      if (error instanceof Error) {
        ResponseHelper.badRequest(res, error.message);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to process webhook');
      }
    }
  }

  async batchUpdateTracking(req: Request, res: Response): Promise<void> {
    try {
      const { trackingNumbers } = req.body;
      
      if (!trackingNumbers || !Array.isArray(trackingNumbers)) {
        ResponseHelper.badRequest(res, 'Tracking numbers array is required');
        return;
      }

      const updates = await shippingProviderService.batchUpdateTracking(trackingNumbers);
      
      logger.info('Batch tracking update completed', { 
        requestCount: trackingNumbers.length,
        successCount: updates.length
      });

      ResponseHelper.success(res, updates);
    } catch (error) {
      logger.error('Failed to batch update tracking', { error, body: req.body });
      ResponseHelper.internalServerError(res, 'Failed to batch update tracking');
    }
  }

  async getAvailableServices(req: Request, res: Response): Promise<void> {
    try {
      const { carrier } = req.params;
      const { international = 'false' } = req.query;
      
      if (!carrier) {
        ResponseHelper.badRequest(res, 'Carrier parameter is required');
        return;
      }

      const isInternational = international === 'true';
      const services = shippingProviderService.getAvailableServices(carrier, isInternational);
      
      ResponseHelper.success(res, {
        carrier,
        international: isInternational,
        services
      });
    } catch (error) {
      logger.error('Failed to get available services', { error, params: req.params, query: req.query });
      ResponseHelper.internalServerError(res, 'Failed to retrieve available services');
    }
  }

  async getCarrierRates(req: Request, res: Response): Promise<void> {
    try {
      const { fromAddress, toAddress, packages } = req.body;
      
      if (!fromAddress || !toAddress || !packages) {
        ResponseHelper.badRequest(res, 'From address, to address, and packages are required');
        return;
      }

      // Mock rate calculation - in real implementation, you'd call carrier APIs
      const mockRates = [
        {
          carrier: 'FedEx',
          service: 'GROUND',
          cost: 15.99,
          estimatedDays: 5,
          currency: 'USD'
        },
        {
          carrier: 'FedEx',
          service: 'EXPRESS_SAVER',
          cost: 25.99,
          estimatedDays: 3,
          currency: 'USD'
        },
        {
          carrier: 'UPS',
          service: 'GROUND',
          cost: 17.99,
          estimatedDays: 5,
          currency: 'USD'
        },
        {
          carrier: 'UPS',
          service: '2ND_DAY_AIR',
          cost: 29.99,
          estimatedDays: 2,
          currency: 'USD'
        }
      ];

      ResponseHelper.success(res, mockRates);
    } catch (error) {
      logger.error('Failed to get carrier rates', { error, body: req.body });
      ResponseHelper.internalServerError(res, 'Failed to retrieve carrier rates');
    }
  }
}

export const shippingProviderController = new ShippingProviderController();