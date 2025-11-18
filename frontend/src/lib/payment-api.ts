import { api } from './api';
import { 
  CryptoRates, 
  CryptoPaymentRequest, 
  CryptoPaymentResponse, 
  PaymentStatus 
} from '@/types/payment';

export const paymentApi = {
  /**
   * Get current cryptocurrency rates
   */
  async getCryptoRates(): Promise<CryptoRates> {
    const response = await api.get<{
      success: boolean;
      data: CryptoRates;
    }>('/payments/crypto/rates');
    return response.data;
  },

  /**
   * Calculate crypto amount for given fiat amount
   */
  async calculateCryptoAmount(amount: number, cryptoCurrency: string): Promise<{
    fiatAmount: number;
    cryptoAmount: number;
    cryptoCurrency: string;
  }> {
    const response = await api.post<{
      success: boolean;
      data: {
        fiatAmount: number;
        cryptoAmount: number;
        cryptoCurrency: string;
      };
    }>('/payments/crypto/calculate', {
      amount,
      cryptoCurrency
    });
    return response.data;
  },

  /**
   * Initiate cryptocurrency payment
   */
  async initiateCryptoPayment(request: CryptoPaymentRequest): Promise<CryptoPaymentResponse> {
    const response = await api.post<{
      success: boolean;
      data: CryptoPaymentResponse;
    }>('/payments/crypto/initiate', request);
    return response.data;
  },

  /**
   * Verify cryptocurrency payment status
   */
  async verifyCryptoPayment(paymentId: string): Promise<{
    status: string;
    transactionHash?: string;
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        status: string;
        transactionHash?: string;
      };
    }>(`/payments/crypto/verify/${paymentId}`);
    return response.data;
  },



  /**
   * Get payment status for an order
   */
  async getPaymentStatus(orderId: string): Promise<{
    orderId: string;
    paymentStatus: PaymentStatus;
    paymentMethod: string;
    transactionId?: string;
    transactionHash?: string;
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        orderId: string;
        paymentStatus: PaymentStatus;
        paymentMethod: string;
        transactionId?: string;
        transactionHash?: string;
      };
    }>(`/payments/status/${orderId}`);
    return response.data;
  },

  /**
   * Get detailed payment information
   */
  async getPaymentDetails(paymentId: string): Promise<any> {
    const response = await api.get<{
      success: boolean;
      data: any;
    }>(`/payments/details/${paymentId}`);
    return response.data;
  },

  /**
   * Generate payment receipt
   */
  async generateReceipt(paymentId: string): Promise<any> {
    const response = await api.get<{
      success: boolean;
      data: any;
    }>(`/payments/receipt/${paymentId}`);
    return response.data;
  },

  /**
   * Update payment status (admin only)
   */
  async updatePaymentStatus(paymentId: string, status: PaymentStatus, transactionHash?: string): Promise<void> {
    await api.put(`/payments/status/${paymentId}`, {
      status,
      transactionHash
    });
  },

  /**
   * Get all wallet addresses
   */
  async getAllWalletAddresses(): Promise<{
    BTC: { address: string; network: any };
    ETH: { address: string; network: any };
    USDT_TRC20: { address: string; network: any };
  }> {
    const response = await api.get<{
      success: boolean;
      data: {
        BTC: { address: string; network: any };
        ETH: { address: string; network: any };
        USDT_TRC20: { address: string; network: any };
      };
    }>('/payments/crypto/wallets');
    return response.data;
  }
};