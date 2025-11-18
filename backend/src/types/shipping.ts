export interface ShippingZone {
  id: string;
  name: string;
  countries: string[];
  baseRate: number;
  weightMultiplier: number;
  isVipAvailable: boolean;
  estimatedDays: {
    standard: number;
    express: number;
    vip?: number;
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  description: string;
  type: ShippingType;
  isInsuranceIncluded: boolean;
  maxWeight: number; // in kg
  maxValue: number; // in USD
}

export interface ShippingCalculationRequest {
  items: Array<{
    wineId: string;
    quantity: number;
    weight?: number; // in kg
    value: number; // in USD
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
  customsInfo?: CustomsInfo | undefined;
  restrictions: string[];
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

export enum ShippingType {
  STANDARD = 'STANDARD',
  EXPRESS = 'EXPRESS',
  VIP = 'VIP',
  OVERNIGHT = 'OVERNIGHT',
  INTERNATIONAL_STANDARD = 'INTERNATIONAL_STANDARD',
  INTERNATIONAL_EXPRESS = 'INTERNATIONAL_EXPRESS'
}

export enum ShippingRestriction {
  ALCOHOL_PROHIBITED = 'ALCOHOL_PROHIBITED',
  LICENSE_REQUIRED = 'LICENSE_REQUIRED',
  AGE_VERIFICATION_REQUIRED = 'AGE_VERIFICATION_REQUIRED',
  CUSTOMS_DECLARATION_REQUIRED = 'CUSTOMS_DECLARATION_REQUIRED',
  TEMPERATURE_SENSITIVE = 'TEMPERATURE_SENSITIVE'
}

// Wine-specific shipping data
export interface WineShippingData {
  wineId: string;
  weight: number; // in kg
  dimensions: {
    length: number; // in cm
    width: number;
    height: number;
  };
  isFragile: boolean;
  requiresTemperatureControl: boolean;
  alcoholContent: number;
  hsCode: string; // Harmonized System code for customs
}

// Country-specific shipping rules
export interface CountryShippingRules {
  countryCode: string;
  countryName: string;
  isShippingAllowed: boolean;
  alcoholLimits: {
    maxBottlesPerShipment: number;
    maxAlcoholContent: number;
    requiresLicense: boolean;
  };
  customsRules: {
    dutyRate: number; // percentage
    taxRate: number; // percentage
    exemptionThreshold: number; // in USD
  };
  restrictions: ShippingRestriction[];
  estimatedTransitDays: {
    standard: number;
    express: number;
  };
}