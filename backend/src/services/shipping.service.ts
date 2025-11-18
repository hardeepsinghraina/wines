import {
  ShippingCalculationRequest,
  ShippingCalculationResult,
  ShippingOption,
  ShippingType,
  ShippingZone,
  ShippingMethod,
  CustomsInfo,
  VipDeliveryOptions,
  InsuranceCalculation,
  CountryShippingRules,
  WineShippingData,
  ShippingRestriction
} from '../types/shipping';
import { logger } from '../utils/logger';

export class ShippingService {
  private shippingZones: ShippingZone[] = [
    {
      id: 'domestic-us',
      name: 'United States',
      countries: ['US'],
      baseRate: 15.00,
      weightMultiplier: 2.50,
      isVipAvailable: true,
      estimatedDays: { standard: 5, express: 2, vip: 1 }
    },
    {
      id: 'europe',
      name: 'European Union',
      countries: ['DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'PT', 'IE', 'LU'],
      baseRate: 25.00,
      weightMultiplier: 3.00,
      isVipAvailable: true,
      estimatedDays: { standard: 7, express: 3, vip: 2 }
    },
    {
      id: 'uk',
      name: 'United Kingdom',
      countries: ['GB'],
      baseRate: 30.00,
      weightMultiplier: 3.50,
      isVipAvailable: true,
      estimatedDays: { standard: 8, express: 4, vip: 2 }
    },
    {
      id: 'international',
      name: 'International',
      countries: ['*'], // Fallback for all other countries
      baseRate: 45.00,
      weightMultiplier: 4.00,
      isVipAvailable: false,
      estimatedDays: { standard: 14, express: 7 }
    }
  ];

  private countryRules: CountryShippingRules[] = [
    {
      countryCode: 'US',
      countryName: 'United States',
      isShippingAllowed: true,
      alcoholLimits: {
        maxBottlesPerShipment: 12,
        maxAlcoholContent: 20,
        requiresLicense: false
      },
      customsRules: {
        dutyRate: 0,
        taxRate: 0,
        exemptionThreshold: 0
      },
      restrictions: [ShippingRestriction.AGE_VERIFICATION_REQUIRED],
      estimatedTransitDays: { standard: 5, express: 2 }
    },
    {
      countryCode: 'DE',
      countryName: 'Germany',
      isShippingAllowed: true,
      alcoholLimits: {
        maxBottlesPerShipment: 24,
        maxAlcoholContent: 22,
        requiresLicense: false
      },
      customsRules: {
        dutyRate: 0, // EU member
        taxRate: 19,
        exemptionThreshold: 22
      },
      restrictions: [ShippingRestriction.AGE_VERIFICATION_REQUIRED],
      estimatedTransitDays: { standard: 7, express: 3 }
    },
    {
      countryCode: 'GB',
      countryName: 'United Kingdom',
      isShippingAllowed: true,
      alcoholLimits: {
        maxBottlesPerShipment: 12,
        maxAlcoholContent: 22,
        requiresLicense: false
      },
      customsRules: {
        dutyRate: 15.5,
        taxRate: 20,
        exemptionThreshold: 135
      },
      restrictions: [
        ShippingRestriction.AGE_VERIFICATION_REQUIRED,
        ShippingRestriction.CUSTOMS_DECLARATION_REQUIRED
      ],
      estimatedTransitDays: { standard: 8, express: 4 }
    }
  ];

  private wineShippingData: Map<string, WineShippingData> = new Map();

  async calculateShipping(request: ShippingCalculationRequest): Promise<ShippingCalculationResult> {
    try {
      logger.info('Calculating shipping', { request });

      // Validate destination
      const countryRules = this.getCountryRules(request.destinationCountry);
      if (!countryRules.isShippingAllowed) {
        throw new Error(`Shipping not available to ${request.destinationCountry}`);
      }

      // Get shipping zone
      const zone = this.getShippingZone(request.destinationCountry);
      
      // Calculate total weight and value
      const { totalWeight, totalValue } = await this.calculateTotals(request.items);
      
      // Validate shipping restrictions
      const restrictions = this.validateShippingRestrictions(request, countryRules, totalValue);
      
      // Calculate available shipping options
      const availableMethods = this.getAvailableShippingMethods(zone, totalWeight, totalValue);
      
      // Calculate costs for each method
      const shippingOptions = await Promise.all(
        availableMethods.map(method => this.calculateMethodCost(method, zone, totalWeight, totalValue, request))
      );

      // Get default method or requested method
      const selectedMethod = request.shippingMethod 
        ? shippingOptions.find(opt => opt.method === request.shippingMethod)
        : shippingOptions[0]; // Default to first (usually cheapest)

      if (!selectedMethod) {
        throw new Error('No suitable shipping method available');
      }

      // Calculate customs info for international shipments
      const customsInfo = this.isInternationalShipment(request.destinationCountry) 
        ? this.calculateCustomsInfo(totalValue, countryRules)
        : undefined;

      return {
        shippingCost: selectedMethod.cost,
        insuranceCost: selectedMethod.insuranceCost,
        totalCost: selectedMethod.totalCost,
        currency: 'USD',
        estimatedDeliveryDays: selectedMethod.estimatedDays,
        availableMethods: shippingOptions,
        customsInfo,
        restrictions
      };

    } catch (error) {
      logger.error('Shipping calculation failed', { error, request });
      throw error;
    }
  }

  private getCountryRules(countryCode: string): CountryShippingRules {
    return this.countryRules.find(rule => rule.countryCode === countryCode) || {
      countryCode,
      countryName: countryCode,
      isShippingAllowed: false,
      alcoholLimits: { maxBottlesPerShipment: 0, maxAlcoholContent: 0, requiresLicense: true },
      customsRules: { dutyRate: 25, taxRate: 20, exemptionThreshold: 0 },
      restrictions: [ShippingRestriction.ALCOHOL_PROHIBITED],
      estimatedTransitDays: { standard: 21, express: 14 }
    };
  }

  private getShippingZone(countryCode: string): ShippingZone {
    const zone = this.shippingZones.find(zone => 
      zone.countries.includes(countryCode) || zone.countries.includes('*')
    );
    
    if (!zone) {
      // Return international zone as fallback
      const fallbackZone = this.shippingZones[this.shippingZones.length - 1];
      if (!fallbackZone) {
        throw new Error('No shipping zones configured');
      }
      return fallbackZone;
    }
    
    return zone;
  }

  private async calculateTotals(items: ShippingCalculationRequest['items']): Promise<{
    totalWeight: number;
    totalValue: number;
  }> {
    let totalWeight = 0;
    let totalValue = 0;

    for (const item of items) {
      const weight = item.weight || await this.getWineWeight(item.wineId);
      totalWeight += weight * item.quantity;
      totalValue += item.value * item.quantity;
    }

    return { totalWeight, totalValue };
  }

  private async getWineWeight(wineId: string): Promise<number> {
    // In a real implementation, this would fetch from database
    // For now, return standard wine bottle weight (1.5kg including packaging)
    const wineData = this.wineShippingData.get(wineId);
    return wineData?.weight || 1.5;
  }

  private validateShippingRestrictions(
    request: ShippingCalculationRequest,
    countryRules: CountryShippingRules,
    totalValue: number
  ): string[] {
    const restrictions: string[] = [];

    // Check bottle limits
    const totalBottles = request.items.reduce((sum, item) => sum + item.quantity, 0);
    if (totalBottles > countryRules.alcoholLimits.maxBottlesPerShipment) {
      restrictions.push(`Maximum ${countryRules.alcoholLimits.maxBottlesPerShipment} bottles per shipment`);
    }

    // Check value limits
    if (totalValue > 10000) {
      restrictions.push('High-value shipments require additional documentation');
    }

    // Add country-specific restrictions
    countryRules.restrictions.forEach(restriction => {
      switch (restriction) {
        case ShippingRestriction.AGE_VERIFICATION_REQUIRED:
          restrictions.push('Age verification required upon delivery');
          break;
        case ShippingRestriction.CUSTOMS_DECLARATION_REQUIRED:
          restrictions.push('Customs declaration required');
          break;
        case ShippingRestriction.LICENSE_REQUIRED:
          restrictions.push('Import license may be required');
          break;
      }
    });

    return restrictions;
  }

  private getAvailableShippingMethods(zone: ShippingZone, weight: number, value: number): ShippingMethod[] {
    const methods: ShippingMethod[] = [
      {
        id: 'standard',
        name: 'Standard Shipping',
        description: 'Reliable delivery with tracking',
        type: ShippingType.STANDARD,
        isInsuranceIncluded: false,
        maxWeight: 50,
        maxValue: 5000
      },
      {
        id: 'express',
        name: 'Express Shipping',
        description: 'Faster delivery with priority handling',
        type: ShippingType.EXPRESS,
        isInsuranceIncluded: true,
        maxWeight: 30,
        maxValue: 10000
      }
    ];

    if (zone.isVipAvailable) {
      methods.push({
        id: 'vip',
        name: 'VIP Delivery',
        description: 'White-glove service with temperature control',
        type: ShippingType.VIP,
        isInsuranceIncluded: true,
        maxWeight: 25,
        maxValue: 50000
      });
    }

    // Filter methods based on weight and value limits
    return methods.filter(method => weight <= method.maxWeight && value <= method.maxValue);
  }

  private async calculateMethodCost(
    method: ShippingMethod,
    zone: ShippingZone,
    weight: number,
    value: number,
    request: ShippingCalculationRequest
  ): Promise<ShippingOption> {
    let baseCost = zone.baseRate;
    let weightCost = weight * zone.weightMultiplier;
    let serviceCost = 0;
    let insuranceCost = 0;

    // Apply method-specific multipliers
    switch (method.type) {
      case ShippingType.EXPRESS:
        baseCost *= 1.8;
        weightCost *= 1.5;
        break;
      case ShippingType.VIP:
        baseCost *= 3.0;
        weightCost *= 2.0;
        serviceCost = this.calculateVipServiceCost(value);
        break;
    }

    // Calculate insurance
    if (request.insuranceRequested || method.isInsuranceIncluded || value > 1000) {
      insuranceCost = this.calculateInsuranceCost(value, method.type);
    }

    const shippingCost = Math.round((baseCost + weightCost + serviceCost) * 100) / 100;
    const totalCost = shippingCost + insuranceCost;

    const estimatedDays = method.type === ShippingType.VIP 
      ? zone.estimatedDays.vip || zone.estimatedDays.express
      : method.type === ShippingType.EXPRESS 
        ? zone.estimatedDays.express 
        : zone.estimatedDays.standard;

    return {
      method: method.type,
      name: method.name,
      description: method.description,
      cost: shippingCost,
      insuranceCost,
      totalCost,
      estimatedDays,
      isVipService: method.type === ShippingType.VIP,
      features: this.getMethodFeatures(method.type)
    };
  }

  private calculateVipServiceCost(value: number): number {
    // VIP service cost based on order value
    if (value > 5000) return 150;
    if (value > 2000) return 100;
    if (value > 1000) return 75;
    return 50;
  }

  private calculateInsuranceCost(value: number, shippingType: ShippingType): number {
    const rate = shippingType === ShippingType.VIP ? 0.015 : 0.02; // 1.5% for VIP, 2% for others
    const minCost = 5;
    const maxCost = 200;
    
    return Math.min(Math.max(value * rate, minCost), maxCost);
  }

  private getMethodFeatures(type: ShippingType): string[] {
    switch (type) {
      case ShippingType.STANDARD:
        return ['Tracking included', 'Signature on delivery'];
      case ShippingType.EXPRESS:
        return ['Priority handling', 'Tracking included', 'Insurance included', 'Signature required'];
      case ShippingType.VIP:
        return [
          'White-glove delivery',
          'Temperature controlled',
          'Appointment scheduling',
          'Unpacking service',
          'Full insurance coverage',
          'Dedicated support'
        ];
      default:
        return [];
    }
  }

  private isInternationalShipment(countryCode: string): boolean {
    return countryCode !== 'US'; // Assuming US is domestic
  }

  private calculateCustomsInfo(value: number, countryRules: CountryShippingRules): CustomsInfo {
    const dutyAmount = value * (countryRules.customsRules.dutyRate / 100);
    const taxAmount = (value + dutyAmount) * (countryRules.customsRules.taxRate / 100);
    
    return {
      isDutyRequired: value > countryRules.customsRules.exemptionThreshold,
      estimatedDuty: Math.round(dutyAmount * 100) / 100,
      estimatedTax: Math.round(taxAmount * 100) / 100,
      customsValue: value,
      hsCode: '2204.21.00', // Wine HS code
      restrictions: countryRules.restrictions.map(r => r.toString())
    };
  }

  // Method to get VIP delivery options
  async getVipDeliveryOptions(value: number): Promise<VipDeliveryOptions> {
    return {
      whiteGloveService: true,
      temperatureControlled: true,
      signatureRequired: true,
      appointmentDelivery: true,
      unpackingService: value > 2000,
      additionalCost: this.calculateVipServiceCost(value)
    };
  }

  // Method to calculate detailed insurance
  async calculateInsurance(value: number, shippingType: ShippingType): Promise<InsuranceCalculation> {
    const cost = this.calculateInsuranceCost(value, shippingType);
    
    return {
      isRequired: value > 1000,
      isRecommended: value > 500,
      cost,
      coverage: value,
      provider: 'Wine Shipping Insurance Co.',
      terms: [
        'Covers damage during transit',
        'Covers theft',
        'Temperature damage coverage',
        'Full replacement value'
      ]
    };
  }

  // Method to validate shipping address
  async validateShippingAddress(countryCode: string, state?: string): Promise<{
    isValid: boolean;
    restrictions: string[];
    requiresLicense: boolean;
  }> {
    const countryRules = this.getCountryRules(countryCode);
    
    return {
      isValid: countryRules.isShippingAllowed,
      restrictions: countryRules.restrictions.map(r => r.toString()),
      requiresLicense: countryRules.alcoholLimits.requiresLicense
    };
  }
}

export const shippingService = new ShippingService();