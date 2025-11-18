import { Request, Response } from 'express';
import { cryptoPaymentService } from '../services/crypto-payment.service';
import { orderService } from '../services/order.service';
import { paymentSecurityService } from '../services/payment-security.service';
import { paymentNotificationService } from '../services/payment-notification.service';
import { logger } from '../utils/logger';
import { ResponseHelper } from '../utils/response';
import { CryptoPaymentRequest } from '../types/payment';

export class PaymentController {
  /**
   * Get current cryptocurrency rates
   */
  async getCryptoRates(req: Request, res: Response) {
    try {
      const rates = await cryptoPaymentService.getCryptoRates();
      return ResponseHelper.success(res, rates);
    } catch (error) {
      logger.error('Error fetching crypto rates:', error);
      return ResponseHelper.error(res, 'Failed to fetch cryptocurrency rates', 500);
    }
  }

  /**
   * Calculate crypto amount for given fiat amount
   */
  async calculateCryptoAmount(req: Request, res: Response) {
    try {
      const { amount, cryptoCurrency } = req.body;

      if (!amount || !cryptoCurrency) {
        return ResponseHelper.badRequest(res, 'Amount and crypto currency are required');
      }

      const cryptoAmount = await cryptoPaymentService.calculateCryptoAmount(amount, cryptoCurrency);
      
      return ResponseHelper.success(res, {
        fiatAmount: amount,
        cryptoAmount,
        cryptoCurrency
      });
    } catch (error) {
      logger.error('Error calculating crypto amount:', error);
      return ResponseHelper.error(res, 'Failed to calculate crypto amount', 500);
    }
  }

  /**
   * Initiate cryptocurrency payment with enhanced security
   */
  async initiateCryptoPayment(req: Request, res: Response) {
    try {
      const paymentRequest: CryptoPaymentRequest = req.body;
      const userIp = req.ip || req.connection.remoteAddress;

      // Validate order exists
      const order = await orderService.getOrderById(paymentRequest.orderId);
      if (!order) {
        return ResponseHelper.notFound(res, 'Order not found');
      }

      // Security validation
      const securityCheck = await paymentSecurityService.validatePaymentSecurity(
        paymentRequest, 
        userIp
      );

      if (!securityCheck.isValid) {
        logger.warn('Payment blocked due to security concerns', {
          orderId: paymentRequest.orderId,
          reason: securityCheck.reason,
          riskScore: securityCheck.riskScore
        });

        await paymentSecurityService.logSuspiciousActivity({
          type: 'payment_blocked',
          orderId: paymentRequest.orderId,
          ...(paymentRequest.customerEmail && { userEmail: paymentRequest.customerEmail }),
          ...(userIp && { userIp }),
          description: securityCheck.reason || 'Security validation failed',
          riskScore: securityCheck.riskScore
        });

        return ResponseHelper.error(res, 'Payment cannot be processed due to security concerns', 403);
      }

      // Create crypto payment
      const paymentResponse = await cryptoPaymentService.createCryptoPayment(paymentRequest);

      // Update order status
      await orderService.updateOrderStatus(paymentRequest.orderId, 'PENDING');

      // Schedule timeout warning notification
      await paymentNotificationService.scheduleTimeoutWarning(paymentResponse.paymentId);

      logger.info('Crypto payment initiated successfully', {
        paymentId: paymentResponse.paymentId,
        orderId: paymentRequest.orderId,
        riskScore: securityCheck.riskScore
      });

      return ResponseHelper.success(res, paymentResponse);
    } catch (error) {
      logger.error('Error initiating crypto payment:', error);
      return ResponseHelper.error(res, 'Failed to initiate crypto payment', 500);
    }
  }

  /**
   * Verify cryptocurrency payment status
   */
  async verifyCryptoPayment(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return ResponseHelper.badRequest(res, 'Payment ID is required');
      }

      const verification = await cryptoPaymentService.verifyPayment(paymentId);
      
      return ResponseHelper.success(res, verification);
    } catch (error) {
      logger.error('Error verifying crypto payment:', error);
      return ResponseHelper.error(res, 'Failed to verify payment', 500);
    }
  }

  /**
   * Handle crypto payment callback/webhook with enhanced processing
   */
  async handleCryptoCallback(req: Request, res: Response) {
    try {
      const signature = req.headers['x-payment-signature'] as string;
      const payload = req.body;

      // Validate callback signature
      if (!cryptoPaymentService.validateCallback(payload, signature)) {
        return ResponseHelper.unauthorized(res, 'Invalid callback signature');
      }

      // Process the callback
      await cryptoPaymentService.processPaymentCallback(payload);

      logger.info(`Payment callback processed successfully`, { 
        orderId: payload.orderId, 
        status: payload.status 
      });
      
      return ResponseHelper.success(res, { received: true });
    } catch (error) {
      logger.error('Error processing crypto callback:', error);
      return ResponseHelper.error(res, 'Failed to process callback', 500);
    }
  }

  /**
   * Update payment status manually (admin endpoint)
   */
  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;
      const { status, transactionHash } = req.body;

      if (!paymentId) {
        return ResponseHelper.badRequest(res, 'Payment ID is required');
      }

      await cryptoPaymentService.updatePaymentStatus(paymentId, status, transactionHash);

      return ResponseHelper.success(res, { 
        message: 'Payment status updated successfully',
        paymentId,
        status 
      });
    } catch (error) {
      logger.error('Error updating payment status:', error);
      return ResponseHelper.error(res, 'Failed to update payment status', 500);
    }
  }

  /**
   * Generate payment receipt
   */
  async generateReceipt(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return ResponseHelper.badRequest(res, 'Payment ID is required');
      }

      const receipt = await cryptoPaymentService.generatePaymentReceipt(paymentId);

      return ResponseHelper.success(res, receipt);
    } catch (error) {
      logger.error('Error generating receipt:', error);
      return ResponseHelper.error(res, 'Failed to generate receipt', 500);
    }
  }

  /**
   * Get payment details
   */
  async getPaymentDetails(req: Request, res: Response) {
    try {
      const { paymentId } = req.params;

      if (!paymentId) {
        return ResponseHelper.badRequest(res, 'Payment ID is required');
      }

      const payment = await cryptoPaymentService.getPaymentDetails(paymentId);

      return ResponseHelper.success(res, payment);
    } catch (error) {
      logger.error('Error getting payment details:', error);
      return ResponseHelper.error(res, 'Failed to get payment details', 500);
    }
  }



  /**
   * Get wallet address for a specific cryptocurrency
   */
  async getWalletAddress(req: Request, res: Response) {
    try {
      const { currency } = req.params;

      if (!currency) {
        return ResponseHelper.badRequest(res, 'Currency is required');
      }

      const walletAddress = cryptoPaymentService.getWalletAddress(currency as any);
      const networkInfo = cryptoPaymentService.getNetworkInfo(currency as any);

      return ResponseHelper.success(res, {
        currency,
        walletAddress,
        networkInfo
      });
    } catch (error) {
      logger.error('Error getting wallet address:', error);
      return ResponseHelper.error(res, 'Failed to get wallet address', 500);
    }
  }

  /**
   * Get all supported wallet addresses
   */
  async getAllWalletAddresses(req: Request, res: Response) {
    try {
      const wallets = {
        BTC: {
          address: cryptoPaymentService.getWalletAddress('BTC'),
          network: cryptoPaymentService.getNetworkInfo('BTC')
        },
        ETH: {
          address: cryptoPaymentService.getWalletAddress('ETH'),
          network: cryptoPaymentService.getNetworkInfo('ETH')
        },
        USDT_TRC20: {
          address: cryptoPaymentService.getWalletAddress('USDT_TRC20'),
          network: cryptoPaymentService.getNetworkInfo('USDT_TRC20')
        }
      };

      return ResponseHelper.success(res, wallets);
    } catch (error) {
      logger.error('Error getting wallet addresses:', error);
      return ResponseHelper.error(res, 'Failed to get wallet addresses', 500);
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(req: Request, res: Response) {
    try {
      const { orderId } = req.params;

      if (!orderId) {
        return ResponseHelper.badRequest(res, 'Order ID is required');
      }

      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return ResponseHelper.notFound(res, 'Order not found');
      }

      const payment = order.payment;

      return ResponseHelper.success(res, {
        orderId,
        paymentStatus: Array.isArray(payment) ? 'pending' : (payment as any)?.status,
        paymentMethod: Array.isArray(payment) ? 'unknown' : (payment as any)?.method,
        transactionId: Array.isArray(payment) ? '' : (payment as any)?.transactionHash,
        transactionHash: Array.isArray(payment) ? '' : (payment as any)?.transactionHash
      });
    } catch (error) {
      logger.error('Error getting payment status:', error);
      return ResponseHelper.error(res, 'Failed to get payment status', 500);
    }
  }
}

export const paymentController = new PaymentController();