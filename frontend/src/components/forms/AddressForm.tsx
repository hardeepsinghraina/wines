'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { shippingApi } from '@/lib/shipping-api';
import { ShippingAddress, AddressValidation } from '@/types/shipping';
import { 
  RealTimeValidator, 
  AddressAutoComplete, 
  AccessibilityHelper,
  formatPostalCode,
  type RealTimeValidationResult 
} from '@/lib/checkout-validation';
import { useFormPersistence } from '@/lib/form-persistence';

interface AddressFormProps {
  address?: Partial<ShippingAddress>;
  onSubmit: (address: ShippingAddress) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  title?: string;
  showGuestEmail?: boolean;
  guestEmail?: string;
  onGuestEmailChange?: (email: string) => void;
  savedAddresses?: ShippingAddress[];
  onSelectSavedAddress?: (address: ShippingAddress) => void;
  formId?: string;
}

const COUNTRIES = [
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
];

export function AddressForm({ 
  address, 
  onSubmit, 
  onCancel, 
  isLoading = false, 
  title = 'Shipping Address',
  showGuestEmail = false,
  guestEmail = '',
  onGuestEmailChange,
  savedAddresses = [],
  onSelectSavedAddress,
  formId = 'address-form'
}: AddressFormProps) {
  const [formData, setFormData] = useState<ShippingAddress>({
    firstName: address?.firstName || '',
    lastName: address?.lastName || '',
    company: address?.company || '',
    street: address?.street || '',
    city: address?.city || '',
    state: address?.state || '',
    postalCode: address?.postalCode || '',
    country: address?.country || 'US',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false,
  });

  const [validation, setValidation] = useState<AddressValidation | null>(null);
  const [validationLoading, setValidationLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [realTimeValidation, setRealTimeValidation] = useState<Record<string, RealTimeValidationResult>>({});
  const [showSuggestions, setShowSuggestions] = useState<Record<string, boolean>>({});
  const [suggestions, setSuggestions] = useState<Record<string, any[]>>({});
  const [focusedField, setFocusedField] = useState<string | null>(null);
  
  // Refs for managing focus
  const formRef = useRef<HTMLFormElement>(null);
  
  // Form persistence
  const { autoSaveFormData, loadFormData, clearFormData } = useFormPersistence(formId);

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData();
    if (savedData && !address) {
      setFormData(prev => ({ ...prev, ...savedData }));
    }
  }, [loadFormData, address]);

  // Auto-save form data when it changes
  useEffect(() => {
    autoSaveFormData(formData);
  }, [formData, autoSaveFormData]);

  // Validate address when country changes
  useEffect(() => {
    if (formData.country) {
      validateAddress();
    }
  }, [formData.country, formData.state]);

  const validateAddress = async () => {
    try {
      setValidationLoading(true);
      const result = await shippingApi.validateAddress(formData.country, formData.state);
      setValidation(result);
    } catch (error) {
      console.error('Address validation failed:', error);
    } finally {
      setValidationLoading(false);
    }
  };

  // Real-time validation with debouncing
  const validateFieldRealTime = useCallback((fieldName: string, value: string) => {
    const result = RealTimeValidator.validateFieldRealTime(fieldName, value, { country: formData.country });
    setRealTimeValidation(prev => ({ ...prev, [fieldName]: result }));
    
    // Clear form-level error if real-time validation passes
    if (result.isValid && errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  }, [formData.country, errors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));

    // Real-time validation for text inputs
    if (type !== 'checkbox' && typeof newValue === 'string') {
      validateFieldRealTime(name, newValue);
      
      // Handle auto-complete suggestions
      if (name === 'country') {
        const countrySuggestions = AddressAutoComplete.getCountrySuggestions(newValue);
        setSuggestions(prev => ({ ...prev, country: countrySuggestions }));
        setShowSuggestions(prev => ({ ...prev, country: newValue.length > 0 && countrySuggestions.length > 0 }));
      } else if (name === 'state') {
        const stateSuggestions = AddressAutoComplete.getStateSuggestions(formData.country, newValue);
        setSuggestions(prev => ({ ...prev, state: stateSuggestions }));
        setShowSuggestions(prev => ({ ...prev, state: newValue.length > 0 && stateSuggestions.length > 0 }));
      }
      
      // Format postal code automatically
      if (name === 'postalCode') {
        const formatted = formatPostalCode(newValue, formData.country);
        if (formatted !== newValue) {
          setFormData(prev => ({ ...prev, postalCode: formatted }));
        }
      }
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleGuestEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    onGuestEmailChange?.(email);
    validateFieldRealTime('email', email);
  };

  const handleSuggestionSelect = (fieldName: string, suggestion: any) => {
    if (fieldName === 'country') {
      setFormData(prev => ({ ...prev, country: suggestion.code }));
      validateFieldRealTime('country', suggestion.code);
    } else if (fieldName === 'state') {
      setFormData(prev => ({ ...prev, state: suggestion }));
      validateFieldRealTime('state', suggestion);
    }
    
    setShowSuggestions(prev => ({ ...prev, [fieldName]: false }));
  };

  const handleSavedAddressSelect = (address: ShippingAddress) => {
    setFormData(address);
    onSelectSavedAddress?.(address);
    
    // Validate all fields
    Object.keys(address).forEach(key => {
      if (typeof address[key as keyof ShippingAddress] === 'string') {
        validateFieldRealTime(key, address[key as keyof ShippingAddress] as string);
      }
    });
  };

  const handleFieldFocus = (fieldName: string) => {
    setFocusedField(fieldName);
  };

  const handleFieldBlur = (fieldName: string) => {
    setFocusedField(null);
    // Hide suggestions after a delay to allow for clicks
    setTimeout(() => {
      setShowSuggestions(prev => ({ ...prev, [fieldName]: false }));
    }, 200);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent, fieldName: string) => {
    if (!showSuggestions[fieldName]) return;
    
    const suggestionList = suggestions[fieldName] || [];
    if (suggestionList.length === 0) return;

    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      // Handle arrow key navigation through suggestions
      // Implementation would focus on suggestion items
    } else if (e.key === 'Enter') {
      e.preventDefault();
      // Select first suggestion if available
      if (suggestionList.length > 0) {
        handleSuggestionSelect(fieldName, suggestionList[0]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(prev => ({ ...prev, [fieldName]: false }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.street.trim()) {
      newErrors.street = 'Street address is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    }

    if (!formData.country) {
      newErrors.country = 'Country is required';
    }

    // Validate postal code format based on country
    if (formData.postalCode && formData.country) {
      const postalCodePatterns: Record<string, RegExp> = {
        US: /^\d{5}(-\d{4})?$/,
        GB: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
        DE: /^\d{5}$/,
        FR: /^\d{5}$/,
        IT: /^\d{5}$/,
        ES: /^\d{5}$/,
        NL: /^\d{4}\s?[A-Z]{2}$/i,
      };

      const pattern = postalCodePatterns[formData.country];
      if (pattern && !pattern.test(formData.postalCode)) {
        newErrors.postalCode = 'Invalid postal code format';
      }
    }

    // Validate phone number if provided
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (validation && !validation.isValid) {
      setErrors({ country: 'Shipping not available to this location' });
      return;
    }

    onSubmit(formData);
    
    // Clear saved form data after successful submission
    clearFormData();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">{title}</h3>
      
      {/* Saved Addresses Selection */}
      {savedAddresses.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Use a saved address</h4>
          <div className="space-y-2">
            {savedAddresses.map((savedAddress, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSavedAddressSelect(savedAddress)}
                className="w-full text-left p-3 border border-gray-200 rounded-md hover:border-burgundy hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-burgundy focus:border-transparent transition-colors"
              >
                <div className="text-sm">
                  <div className="font-medium text-gray-900">
                    {savedAddress.firstName} {savedAddress.lastName}
                  </div>
                  <div className="text-gray-600">
                    {savedAddress.street}, {savedAddress.city}, {savedAddress.state} {savedAddress.postalCode}
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="mt-3 text-center">
            <span className="text-sm text-gray-500">or enter a new address below</span>
          </div>
        </div>
      )}
      
      {validation && !validation.isValid && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 font-medium">Shipping Restrictions</p>
          <ul className="mt-2 text-sm text-red-700">
            {validation.restrictions.map((restriction, index) => (
              <li key={index}>• {restriction}</li>
            ))}
          </ul>
        </div>
      )}

      {validation && validation.isValid && validation.restrictions.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-yellow-800 font-medium">Important Information</p>
          <ul className="mt-2 text-sm text-yellow-700">
            {validation.restrictions.map((restriction, index) => (
              <li key={index}>• {restriction}</li>
            ))}
          </ul>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-4" id={formId} noValidate>
        {/* Guest Email Field */}
        {showGuestEmail && (
          <div>
            <label htmlFor={`${formId}-guestEmail`} className="block text-sm font-medium text-gray-700 mb-1">
              Email Address *
            </label>
            <input
              type="email"
              id={`${formId}-guestEmail`}
              name="guestEmail"
              value={guestEmail}
              onChange={handleGuestEmailChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                realTimeValidation.email && !realTimeValidation.email.isValid ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="email"
              required
            />
            {realTimeValidation.email && !realTimeValidation.email.isValid && (
              <p className="mt-1 text-sm text-red-600">
                {realTimeValidation.email.message}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor={`${formId}-firstName`} className="block text-sm font-medium text-gray-700 mb-1">
              First Name *
            </label>
            <input
              type="text"
              id={`${formId}-firstName`}
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                (errors.firstName || (realTimeValidation.firstName && !realTimeValidation.firstName.isValid)) ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="given-name"
              required
            />
            {(errors.firstName || (realTimeValidation.firstName && !realTimeValidation.firstName.isValid)) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.firstName || realTimeValidation.firstName?.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-lastName`} className="block text-sm font-medium text-gray-700 mb-1">
              Last Name *
            </label>
            <input
              type="text"
              id={`${formId}-lastName`}
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                (errors.lastName || (realTimeValidation.lastName && !realTimeValidation.lastName.isValid)) ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="family-name"
              required
            />
            {(errors.lastName || (realTimeValidation.lastName && !realTimeValidation.lastName.isValid)) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.lastName || realTimeValidation.lastName?.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-company`} className="block text-sm font-medium text-gray-700 mb-1">
            Company (Optional)
          </label>
          <input
            type="text"
            id={`${formId}-company`}
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors"
            autoComplete="organization"
          />
        </div>

        <div>
          <label htmlFor={`${formId}-street`} className="block text-sm font-medium text-gray-700 mb-1">
            Street Address *
          </label>
          <input
            type="text"
            id={`${formId}-street`}
            name="street"
            value={formData.street}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
              (errors.street || (realTimeValidation.street && !realTimeValidation.street.isValid)) ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="street-address"
            required
          />
          {(errors.street || (realTimeValidation.street && !realTimeValidation.street.isValid)) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.street || realTimeValidation.street?.message}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor={`${formId}-city`} className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <input
              type="text"
              id={`${formId}-city`}
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                (errors.city || (realTimeValidation.city && !realTimeValidation.city.isValid)) ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="address-level2"
              required
            />
            {(errors.city || (realTimeValidation.city && !realTimeValidation.city.isValid)) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.city || realTimeValidation.city?.message}
              </p>
            )}
          </div>

          <div className="relative">
            <label htmlFor={`${formId}-state`} className="block text-sm font-medium text-gray-700 mb-1">
              State/Province *
            </label>
            <input
              type="text"
              id={`${formId}-state`}
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              onFocus={() => handleFieldFocus('state')}
              onBlur={() => handleFieldBlur('state')}
              onKeyDown={(e) => handleKeyDown(e, 'state')}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                (errors.state || (realTimeValidation.state && !realTimeValidation.state.isValid)) ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="address-level1"
              required
            />
            
            {/* State Suggestions */}
            {showSuggestions.state && suggestions.state && suggestions.state.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
                {suggestions.state.slice(0, 5).map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleSuggestionSelect('state', suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
            
            {(errors.state || (realTimeValidation.state && !realTimeValidation.state.isValid)) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.state || realTimeValidation.state?.message}
              </p>
            )}
          </div>

          <div>
            <label htmlFor={`${formId}-postalCode`} className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <input
              type="text"
              id={`${formId}-postalCode`}
              name="postalCode"
              value={formData.postalCode}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
                (errors.postalCode || (realTimeValidation.postalCode && !realTimeValidation.postalCode.isValid)) ? 'border-red-500' : 'border-gray-300'
              }`}
              autoComplete="postal-code"
              required
            />
            {realTimeValidation.postalCode && realTimeValidation.postalCode.suggestions && realTimeValidation.postalCode.suggestions.length > 0 && (
              <p className="mt-1 text-xs text-gray-500">
                {realTimeValidation.postalCode.suggestions[0]}
              </p>
            )}
            {(errors.postalCode || (realTimeValidation.postalCode && !realTimeValidation.postalCode.isValid)) && (
              <p className="mt-1 text-sm text-red-600">
                {errors.postalCode || realTimeValidation.postalCode?.message}
              </p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor={`${formId}-country`} className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            id={`${formId}-country`}
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
              errors.country ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="country"
            required
          >
            <option value="">Select a country</option>
            {COUNTRIES.map(country => (
              <option key={country.code} value={country.code}>
                {country.name}
              </option>
            ))}
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country}</p>
          )}
          {validationLoading && (
            <p className="mt-1 text-sm text-gray-500">
              Validating address...
            </p>
          )}
        </div>

        <div>
          <label htmlFor={`${formId}-phone`} className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number (Optional)
          </label>
          <input
            type="tel"
            id={`${formId}-phone`}
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-burgundy transition-colors ${
              (errors.phone || (realTimeValidation.phone && !realTimeValidation.phone.isValid)) ? 'border-red-500' : 'border-gray-300'
            }`}
            autoComplete="tel"
          />
          {realTimeValidation.phone && realTimeValidation.phone.suggestions && realTimeValidation.phone.suggestions.length > 0 && (
            <div className="mt-1 text-xs text-gray-500">
              {realTimeValidation.phone.suggestions.map((suggestion, index) => (
                <div key={index}>{suggestion}</div>
              ))}
            </div>
          )}
          {(errors.phone || (realTimeValidation.phone && !realTimeValidation.phone.isValid)) && (
            <p className="mt-1 text-sm text-red-600">
              {errors.phone || realTimeValidation.phone?.message}
            </p>
          )}
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id={`${formId}-isDefault`}
            name="isDefault"
            checked={formData.isDefault}
            onChange={handleInputChange}
            className="h-4 w-4 text-burgundy focus:ring-burgundy border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-offset-2"
          />
          <label htmlFor={`${formId}-isDefault`} className="ml-2 block text-sm text-gray-700 cursor-pointer">
            Set as default address
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isLoading || (validation ? !validation.isValid : false)}
            className="flex-1"
          >
            {isLoading ? 'Saving...' : 'Save Address'}
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}