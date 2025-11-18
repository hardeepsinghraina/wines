import { Router } from 'express';
import { shippingProviderController } from '../controllers/shipping-provider.controller';
import { validateRequest } from '../middleware/joi-validation';
import { shippingProviderValidation } from '../validation/shipping-provider.validation';
import { authenticateToken } from '../middleware/auth';

const router = Router();

/**
 * @route POST /api/shipping-provider/labels
 * @desc Create shipping label
 * @access Private (Admin)
 */
router.post(
  '/labels',
  authenticateToken,
  validateRequest(shippingProviderValidation.createShippingLabel),
  shippingProviderController.createShippingLabel
);

/**
 * @route GET /api/shipping-provider/tracking/:carrier/:trackingNumber
 * @desc Get tracking information
 * @access Public
 */
router.get(
  '/tracking/:carrier/:trackingNumber',
  validateRequest(shippingProviderValidation.getTrackingInfo),
  shippingProviderController.getTrackingInfo
);

/**
 * @route PUT /api/shipping-provider/tracking/:carrier/:trackingNumber
 * @desc Update tracking status
 * @access Private (Admin)
 */
router.put(
  '/tracking/:carrier/:trackingNumber',
  authenticateToken,
  validateRequest(shippingProviderValidation.updateTrackingStatus),
  shippingProviderController.updateTrackingStatus
);

/**
 * @route POST /api/shipping-provider/webhooks/:carrier
 * @desc Handle carrier webhook notifications
 * @access Public (Webhook)
 */
router.post(
  '/webhooks/:carrier',
  validateRequest(shippingProviderValidation.handleCarrierWebhook),
  shippingProviderController.handleCarrierWebhook
);

/**
 * @route POST /api/shipping-provider/tracking/batch
 * @desc Batch update tracking information
 * @access Private (Admin)
 */
router.post(
  '/tracking/batch',
  authenticateToken,
  validateRequest(shippingProviderValidation.batchUpdateTracking),
  shippingProviderController.batchUpdateTracking
);

/**
 * @route GET /api/shipping-provider/services/:carrier
 * @desc Get available services for a carrier
 * @access Public
 */
router.get(
  '/services/:carrier',
  validateRequest(shippingProviderValidation.getAvailableServices),
  shippingProviderController.getAvailableServices
);

/**
 * @route POST /api/shipping-provider/rates
 * @desc Get shipping rates from carriers
 * @access Public
 */
router.post(
  '/rates',
  validateRequest(shippingProviderValidation.getCarrierRates),
  shippingProviderController.getCarrierRates
);

export { router as shippingProviderRoutes };