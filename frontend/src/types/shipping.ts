export interface ShippingAddress {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

export interface ShippingCalculationRequest {
  items: Array<{
    wineId: string;
    quantity: number;
    weight?: number;
    value: number;
  }>;
  destinationCountry: string;
  destinationState?: string;
  destinationPostalCode?: string;
  shippingMethod?: ShippingType;
  isVipDelivery?: boolean;
  insuranceRequested?: boolean;
}

export interface ShippingCalculationResult {
  shippingCost: number;
  insuranceCost: number;
  totalCost: number;
  currency: string;
  estimatedDeliveryDays: number;
  availableMethods: ShippingOption[];
  customsInfo?: CustomsInfo;
  restrictions?: string[];
}

export interface ShippingOption {
  method: ShippingType;
  name: string;
  description: string;
  cost: number;
  insuranceCost: number;
  totalCost: number;
  estimatedDays: number;
  isVipService: boolean;
  features: string[];
}

export interface CustomsInfo {
  isDutyRequired: boolean;
  estimatedDuty: number;
  estimatedTax: number;
  customsValue: number;
  hsCode: string;
  restrictions: string[];
}

export interface VipDeliveryOptions {
  whiteGloveService: boolean;
  temperatureControlled: boolean;
  signatureRequired: boolean;
  appointmentDelivery: boolean;
  unpackingService: boolean;
  additionalCost: number;
}

export interface InsuranceCalculation {
  isRequired: boolean;
  isRecommended: boolean;
  cost: number;
  coverage: number;
  provider: string;
  terms: string[];
}

export interface ShippingZone {
  id: string;
  name: string;
  countries?: string[];
  estimatedDays: {
    standard: number;
    express: number;
    vip?: number;
  };
  isVipAvailable: boolean;
}

export interface AddressValidation {
  isValid: boolean;
  restrictions: string[];
  requiresLicense: boolean;
}

export enum ShippingType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  VIP = 'VIP',
  OVERNIGHT = 'OVERNIGHT',
  INTERNATIONAL_STANDARD = 'INTERNATIONAL_STANDARD',
  INTERNATIONAL_EXPRESS = 'INTERNATIONAL_EXPRESS'
}

export interface DeliveryEstimate {
  method: ShippingType;
  estimatedDays: number;
  deliveryDate: string;
  isBusinessDays: boolean;
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  type: ShippingType;
  cost: number;
  estimatedDays: number;
  isVipService: boolean;
  features: string[];
}