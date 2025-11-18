import { Router } from 'express';
import { shippingController } from '../controllers/shipping.controller';
import { validateRequest } from '../middleware/joi-validation';
import { shippingValidation } from '../validation/shipping.validation';

const router = Router();

/**
 * @route POST /api/shipping/calculate
 * @desc Calculate shipping costs for items
 * @access Public
 */
router.post(
  '/calculate',
  validateRequest(shippingValidation.calculateShipping),
  shippingController.calculateShipping
);

/**
 * @route GET /api/shipping/methods
 * @desc Get available shipping methods for a country
 * @access Public
 */
router.get(
  '/methods',
  validateRequest(shippingValidation.getShippingMethods),
  shippingController.getShippingMethods
);

/**
 * @route GET /api/shipping/vip-options
 * @desc Get VIP delivery options based on order value
 * @access Public
 */
router.get(
  '/vip-options',
  validateRequest(shippingValidation.getVipOptions),
  shippingController.getVipOptions
);

/**
 * @route POST /api/shipping/insurance
 * @desc Calculate insurance costs
 * @access Public
 */
router.post(
  '/insurance',
  validateRequest(shippingValidation.calculateInsurance),
  shippingController.calculateInsurance
);

/**
 * @route GET /api/shipping/validate-address
 * @desc Validate shipping address and get restrictions
 * @access Public
 */
router.get(
  '/validate-address',
  validateRequest(shippingValidation.validateAddress),
  shippingController.validateAddress
);

/**
 * @route GET /api/shipping/zones
 * @desc Get available shipping zones
 * @access Public
 */
router.get('/zones', shippingController.getShippingZones);

export { router as shippingRoutes };