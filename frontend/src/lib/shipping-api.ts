import { api } from './api';
import {
  ShippingCalculationRequest,
  ShippingCalculationResult,
  ShippingOption,
  VipDeliveryOptions,
  InsuranceCalculation,
  AddressValidation,
  ShippingZone
} from '@/types/shipping';

export const shippingApi = {
  // Calculate shipping costs for items
  async calculateShipping(request: ShippingCalculationRequest): Promise<ShippingCalculationResult> {
    const response = await api.post('/shipping/calculate', request);
    return (response as any).data.data;
  },

  // Get available shipping methods for a country
  async getShippingMethods(country: string, weight?: number, value?: number): Promise<{
    availableMethods: ShippingOption[];
    restrictions: string[];
  }> {
    const params = new URLSearchParams({ country });
    if (weight) params.append('weight', weight.toString());
    if (value) params.append('value', value.toString());
    
    const response = await api.get(`/shipping/methods?${params}`);
    return (response as any).data.data;
  },

  // Get VIP delivery options based on order value
  async getVipOptions(value: number): Promise<VipDeliveryOptions> {
    const response = await api.get(`/shipping/vip-options?value=${value}`);
    return (response as any).data.data;
  },

  // Calculate insurance costs
  async calculateInsurance(value: number, shippingType?: string): Promise<InsuranceCalculation> {
    const response = await api.post('/shipping/insurance', { value, shippingType });
    return (response as any).data.data;
  },

  // Validate shipping address and get restrictions
  async validateAddress(country: string, state?: string): Promise<AddressValidation> {
    const params = new URLSearchParams({ country });
    if (state) params.append('state', state);
    
    const response = await api.get(`/shipping/validate-address?${params}`);
    return (response as any).data.data;
  },

  // Get available shipping zones
  async getShippingZones(): Promise<ShippingZone[]> {
    const response = await api.get('/shipping/zones');
    return (response as any).data.data;
  }
};