import { Request, Response } from 'express';
import { shippingService } from '../services/shipping.service';
import { ResponseHelper } from '../utils/response';
import { logger } from '../utils/logger';
import { ShippingCalculationRequest } from '../types/shipping';

export class ShippingController {
  async calculateShipping(req: Request, res: Response): Promise<void> {
    try {
      const calculationRequest: ShippingCalculationRequest = req.body;
      
      // Validate required fields
      if (!calculationRequest.items || calculationRequest.items.length === 0) {
        ResponseHelper.badRequest(res, 'Items are required for shipping calculation');
        return;
      }

      if (!calculationRequest.destinationCountry) {
        ResponseHelper.badRequest(res, 'Destination country is required');
        return;
      }

      const result = await shippingService.calculateShipping(calculationRequest);
      
      logger.info('Shipping calculation completed', { 
        destinationCountry: calculationRequest.destinationCountry,
        itemCount: calculationRequest.items.length,
        totalCost: result.totalCost
      });

      ResponseHelper.success(res, result);
    } catch (error) {
      logger.error('Shipping calculation failed', { error, body: req.body });
      
      if (error instanceof Error) {
        ResponseHelper.badRequest(res, error.message);
      } else {
        ResponseHelper.internalServerError(res, 'Failed to calculate shipping');
      }
    }
  }

  async getShippingMethods(req: Request, res: Response): Promise<void> {
    try {
      const { country, weight, value } = req.query;

      if (!country) {
        ResponseHelper.badRequest(res, 'Country parameter is required');
        return;
      }

      // Create a mock request to get available methods
      const mockRequest: ShippingCalculationRequest = {
        items: [{
          wineId: 'mock',
          quantity: 1,
          weight: Number(weight) || 1.5,
          value: Number(value) || 100
        }],
        destinationCountry: country as string
      };

      const result = await shippingService.calculateShipping(mockRequest);
      
      ResponseHelper.success(res, {
        availableMethods: result.availableMethods,
        restrictions: result.restrictions
      });
    } catch (error) {
      logger.error('Failed to get shipping methods', { error, query: req.query });
      ResponseHelper.internalServerError(res, 'Failed to retrieve shipping methods');
    }
  }

  async getVipOptions(req: Request, res: Response): Promise<void> {
    try {
      const { value } = req.query;
      
      if (!value) {
        ResponseHelper.badRequest(res, 'Order value is required');
        return;
      }

      const vipOptions = await shippingService.getVipDeliveryOptions(Number(value));
      
      ResponseHelper.success(res, vipOptions);
    } catch (error) {
      logger.error('Failed to get VIP options', { error, query: req.query });
      ResponseHelper.internalServerError(res, 'Failed to retrieve VIP options');
    }
  }

  async calculateInsurance(req: Request, res: Response): Promise<void> {
    try {
      const { value, shippingType } = req.body;
      
      if (!value) {
        ResponseHelper.badRequest(res, 'Order value is required');
        return;
      }

      const insurance = await shippingService.calculateInsurance(
        Number(value), 
        shippingType || 'STANDARD'
      );
      
      ResponseHelper.success(res, insurance);
    } catch (error) {
      logger.error('Insurance calculation failed', { error, body: req.body });
      ResponseHelper.internalServerError(res, 'Failed to calculate insurance');
    }
  }

  async validateAddress(req: Request, res: Response): Promise<void> {
    try {
      const { country, state } = req.query;
      
      if (!country) {
        ResponseHelper.badRequest(res, 'Country parameter is required');
        return;
      }

      const validation = await shippingService.validateShippingAddress(
        country as string,
        state as string
      );
      
      ResponseHelper.success(res, validation);
    } catch (error) {
      logger.error('Address validation failed', { error, query: req.query });
      ResponseHelper.internalServerError(res, 'Failed to validate address');
    }
  }

  async getShippingZones(req: Request, res: Response): Promise<void> {
    try {
      // Return available shipping zones and their basic info
      const zones = [
        {
          id: 'domestic-us',
          name: 'United States',
          countries: ['US'],
          estimatedDays: { standard: 5, express: 2, vip: 1 },
          isVipAvailable: true
        },
        {
          id: 'europe',
          name: 'European Union',
          countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'LU'],
          estimatedDays: { standard: 7, express: 3, vip: 2 },
          isVipAvailable: true
        },
        {
          id: 'uk',
          name: 'United Kingdom',
          countries: ['GB'],
          estimatedDays: { standard: 8, express: 4, vip: 2 },
          isVipAvailable: true
        },
        {
          id: 'international',
          name: 'International',
          estimatedDays: { standard: 14, express: 7 },
          isVipAvailable: false
        }
      ];

      ResponseHelper.success(res, zones);
    } catch (error) {
      logger.error('Failed to get shipping zones', { error });
      ResponseHelper.internalServerError(res, 'Failed to retrieve shipping zones');
    }
  }
}

export const shippingController = new ShippingController();