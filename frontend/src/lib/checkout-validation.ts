import { ShippingAddress, ShippingOption } from '@/types/shipping';
import { PaymentMethod } from '@/components/payment/PaymentSelector';

export interface ValidationError {
  field: string;
  message: string;
}

export interface CheckoutValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface RealTimeValidationResult {
  isValid: boolean;
  message?: string;
  suggestions?: string[];
}

export class CheckoutValidator {
  static validateShippingAddress(address: ShippingAddress | null): CheckoutValidationResult {
    const errors: ValidationError[] = [];

    if (!address) {
      errors.push({ field: 'shippingAddress', message: 'Shipping address is required' });
      return { isValid: false, errors };
    }

    if (!address.firstName?.trim()) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!address.lastName?.trim()) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (!address.street?.trim()) {
      errors.push({ field: 'street', message: 'Street address is required' });
    }

    if (!address.city?.trim()) {
      errors.push({ field: 'city', message: 'City is required' });
    }

    if (!address.state?.trim()) {
      errors.push({ field: 'state', message: 'State/Province is required' });
    }

    if (!address.postalCode?.trim()) {
      errors.push({ field: 'postalCode', message: 'Postal code is required' });
    }

    if (!address.country?.trim()) {
      errors.push({ field: 'country', message: 'Country is required' });
    }

    // Validate postal code format based on country
    if (address.postalCode && address.country) {
      const postalCodePatterns: Record<string, RegExp> = {
        US: /^\d{5}(-\d{4})?$/,
        GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
        DE: /^\d{5}$/,
        FR: /^\d{5}$/,
        IT: /^\d{5}$/,
        ES: /^\d{5}$/,
        NL: /^\d{4}\s?[A-Z]{2}$/i,
        CA: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
      };

      const pattern = postalCodePatterns[address.country];
      if (pattern && !pattern.test(address.postalCode)) {
        errors.push({ field: 'postalCode', message: 'Invalid postal code format for selected country' });
      }
    }

    // Validate phone number if provided
    if (address.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(address.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateBillingAddress(
    billingAddress: ShippingAddress | null, 
    useSameAddress: boolean, 
    shippingAddress: ShippingAddress | null
  ): CheckoutValidationResult {
    if (useSameAddress) {
      return { isValid: true, errors: [] };
    }

    return this.validateShippingAddress(billingAddress);
  }

  static validateShippingMethod(shippingMethod: ShippingOption | null): CheckoutValidationResult {
    const errors: ValidationError[] = [];

    if (!shippingMethod) {
      errors.push({ field: 'shippingMethod', message: 'Please select a shipping method' });
    }

    return { isValid: errors.length === 0, errors };
  }

  static validatePaymentMethod(paymentMethod: PaymentMethod | null): CheckoutValidationResult {
    const errors: ValidationError[] = [];

    if (!paymentMethod) {
      errors.push({ field: 'paymentMethod', message: 'Please select a payment method' });
      return { isValid: false, errors };
    }

    if (paymentMethod.type === 'crypto') {
      if (!paymentMethod.currency) {
        errors.push({ field: 'cryptoCurrency', message: 'Please select a cryptocurrency' });
      }

      if (!paymentMethod.walletAddress) {
        errors.push({ field: 'walletAddress', message: 'Wallet address is required' });
      }

      if (!paymentMethod.amount || paymentMethod.amount <= 0) {
        errors.push({ field: 'cryptoAmount', message: 'Invalid payment amount' });
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  static validateCompleteCheckout(
    shippingAddress: ShippingAddress | null,
    billingAddress: ShippingAddress | null,
    useSameAddress: boolean,
    shippingMethod: ShippingOption | null,
    paymentMethod: PaymentMethod | null,
    cartItems: any[]
  ): CheckoutValidationResult {
    const allErrors: ValidationError[] = [];

    // Validate cart has items
    if (!cartItems || cartItems.length === 0) {
      allErrors.push({ field: 'cart', message: 'Cart is empty' });
    }

    // Validate shipping address
    const shippingValidation = this.validateShippingAddress(shippingAddress);
    allErrors.push(...shippingValidation.errors);

    // Validate billing address
    const billingValidation = this.validateBillingAddress(billingAddress, useSameAddress, shippingAddress);
    allErrors.push(...billingValidation.errors);

    // Validate shipping method
    const shippingMethodValidation = this.validateShippingMethod(shippingMethod);
    allErrors.push(...shippingMethodValidation.errors);

    // Validate payment method
    const paymentValidation = this.validatePaymentMethod(paymentMethod);
    allErrors.push(...paymentValidation.errors);

    return { isValid: allErrors.length === 0, errors: allErrors };
  }

  static formatValidationErrors(errors: ValidationError[]): Record<string, string> {
    const formattedErrors: Record<string, string> = {};
    
    errors.forEach(error => {
      formattedErrors[error.field] = error.message;
    });

    return formattedErrors;
  }
}

// Utility function to check if an email is valid
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Utility function to check if a phone number is valid
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

// Utility function to format postal code based on country
export function formatPostalCode(postalCode: string, country: string): string {
  if (!postalCode || !country) return postalCode;

  switch (country) {
    case 'CA':
      // Canadian postal code: A1A 1A1
      return postalCode.replace(/^([A-Z]\d[A-Z])(\d[A-Z]\d)$/, '$1 $2').toUpperCase();
    case 'GB':
      // UK postal code: SW1A 1AA
      return postalCode.replace(/^([A-Z]{1,2}\d[A-Z\d]?)(\d[A-Z]{2})$/, '$1 $2').toUpperCase();
    case 'NL':
      // Dutch postal code: 1234 AB
      return postalCode.replace(/^(\d{4})([A-Z]{2})$/, '$1 $2').toUpperCase();
    default:
      return postalCode.toUpperCase();
  }
}

// Real-time validation functions
export class RealTimeValidator {
  static validateFieldRealTime(field: string, value: string, context?: any): RealTimeValidationResult {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return this.validateName(value);
      case 'email':
        return this.validateEmailRealTime(value);
      case 'phone':
        return this.validatePhoneRealTime(value);
      case 'postalCode':
        return this.validatePostalCodeRealTime(value, context?.country);
      case 'street':
        return this.validateStreetAddress(value);
      case 'city':
        return this.validateCity(value);
      default:
        return { isValid: true };
    }
  }

  private static validateName(name: string): RealTimeValidationResult {
    if (!name.trim()) {
      return { isValid: false, message: 'This field is required' };
    }
    if (name.length < 2) {
      return { isValid: false, message: 'Name must be at least 2 characters' };
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(name)) {
      return { isValid: false, message: 'Name contains invalid characters' };
    }
    return { isValid: true };
  }

  private static validateEmailRealTime(email: string): RealTimeValidationResult {
    if (!email.trim()) {
      return { isValid: false, message: 'Email is required' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (!email.includes('@')) {
        return { isValid: false, message: 'Email must contain @' };
      }
      if (!email.includes('.')) {
        return { isValid: false, message: 'Email must contain a domain' };
      }
      return { isValid: false, message: 'Please enter a valid email address' };
    }
    
    return { isValid: true };
  }

  private static validatePhoneRealTime(phone: string): RealTimeValidationResult {
    if (!phone.trim()) {
      return { isValid: true }; // Phone is optional
    }
    
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    if (!/^[\+]?\d{10,}$/.test(cleanPhone)) {
      return { 
        isValid: false, 
        message: 'Phone number must be at least 10 digits',
        suggestions: ['Format: +1 (555) 123-4567', 'Format: 555-123-4567']
      };
    }
    
    return { isValid: true };
  }

  private static validatePostalCodeRealTime(postalCode: string, country?: string): RealTimeValidationResult {
    if (!postalCode.trim()) {
      return { isValid: false, message: 'Postal code is required' };
    }

    if (!country) {
      return { isValid: true }; // Can't validate without country
    }

    const patterns: Record<string, { regex: RegExp; format: string }> = {
      US: { regex: /^\d{5}(-\d{4})?$/, format: '12345 or 12345-6789' },
      GB: { regex: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i, format: 'SW1A 1AA' },
      DE: { regex: /^\d{5}$/, format: '12345' },
      FR: { regex: /^\d{5}$/, format: '12345' },
      IT: { regex: /^\d{5}$/, format: '12345' },
      ES: { regex: /^\d{5}$/, format: '12345' },
      NL: { regex: /^\d{4}\s?[A-Z]{2}$/i, format: '1234 AB' },
      CA: { regex: /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i, format: 'A1A 1A1' },
    };

    const pattern = patterns[country];
    if (pattern && !pattern.regex.test(postalCode)) {
      return { 
        isValid: false, 
        message: `Invalid format for ${country}`,
        suggestions: [`Expected format: ${pattern.format}`]
      };
    }

    return { isValid: true };
  }

  private static validateStreetAddress(street: string): RealTimeValidationResult {
    if (!street.trim()) {
      return { isValid: false, message: 'Street address is required' };
    }
    if (street.length < 5) {
      return { isValid: false, message: 'Please enter a complete street address' };
    }
    return { isValid: true };
  }

  private static validateCity(city: string): RealTimeValidationResult {
    if (!city.trim()) {
      return { isValid: false, message: 'City is required' };
    }
    if (city.length < 2) {
      return { isValid: false, message: 'City name must be at least 2 characters' };
    }
    if (!/^[a-zA-Z\s\-'\.]+$/.test(city)) {
      return { isValid: false, message: 'City name contains invalid characters' };
    }
    return { isValid: true };
  }
}

// Auto-complete suggestions
export class AddressAutoComplete {
  static getCountrySuggestions(query: string): Array<{code: string, name: string}> {
    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'IT', name: 'Italy' },
      { code: 'ES', name: 'Spain' },
      { code: 'NL', name: 'Netherlands' },
      { code: 'BE', name: 'Belgium' },
      { code: 'AT', name: 'Austria' },
      { code: 'PT', name: 'Portugal' },
      { code: 'IE', name: 'Ireland' },
      { code: 'LU', name: 'Luxembourg' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'JP', name: 'Japan' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'NO', name: 'Norway' },
      { code: 'SE', name: 'Sweden' },
      { code: 'DK', name: 'Denmark' },
      { code: 'FI', name: 'Finland' },
    ];

    if (!query) return countries;

    return countries.filter(country => 
      country.name.toLowerCase().includes(query.toLowerCase()) ||
      country.code.toLowerCase().includes(query.toLowerCase())
    );
  }

  static getStateSuggestions(country: string, query: string): string[] {
    const states: Record<string, string[]> = {
      US: [
        'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
        'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
        'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
        'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
        'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio',
        'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
        'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia',
        'Wisconsin', 'Wyoming'
      ],
      CA: [
        'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
        'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
        'Quebec', 'Saskatchewan', 'Yukon'
      ],
      DE: [
        'Baden-Württemberg', 'Bayern', 'Berlin', 'Brandenburg', 'Bremen', 'Hamburg',
        'Hessen', 'Mecklenburg-Vorpommern', 'Niedersachsen', 'Nordrhein-Westfalen',
        'Rheinland-Pfalz', 'Saarland', 'Sachsen', 'Sachsen-Anhalt', 'Schleswig-Holstein',
        'Thüringen'
      ]
    };

    const countryStates = states[country] || [];
    if (!query) return countryStates;

    return countryStates.filter(state => 
      state.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Form accessibility helpers
export class AccessibilityHelper {
  static generateFieldId(fieldName: string, formId?: string): string {
    return formId ? `${formId}-${fieldName}` : fieldName;
  }

  static generateAriaDescribedBy(fieldName: string, hasError: boolean, hasHelp: boolean): string | undefined {
    const ids = [];
    if (hasError) ids.push(`${fieldName}-error`);
    if (hasHelp) ids.push(`${fieldName}-help`);
    return ids.length > 0 ? ids.join(' ') : undefined;
  }

  static getAriaInvalid(hasError: boolean): boolean | undefined {
    return hasError ? true : undefined;
  }
}