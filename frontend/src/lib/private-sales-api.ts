import { api } from './api';
import { PrivateSale, UserEligibilityStatus, PrivateSalePurchase } from '../types/private-sales';

export const privateSalesApi = {
  // Get private sales
  async getPrivateSales(): Promise<PrivateSale[]> {
    const response = await api.get('/private-sales') as any;
    return response.data.data;
  },

  async getPrivateSale(id: string): Promise<PrivateSale> {
    const response = await api.get(`/private-sales/${id}`) as any;
    return response.data.data;
  },

  // Check eligibility
  async checkEligibility(privateSaleId: string): Promise<UserEligibilityStatus> {
    const response = await api.get(`/private-sales/${privateSaleId}/eligibility`) as any;
    return response.data.data;
  },

  // Purchase from private sale
  async purchaseFromPrivateSale(privateSaleId: string, quantity: number): Promise<PrivateSalePurchase> {
    const response = await api.post(`/private-sales/${privateSaleId}/purchase`, { quantity }) as any;
    return response.data.data;
  },

  // Get user purchases
  async getUserPurchases(): Promise<PrivateSalePurchase[]> {
    const response = await api.get('/private-sales/user/purchases') as any;
    return response.data.data;
  }
};