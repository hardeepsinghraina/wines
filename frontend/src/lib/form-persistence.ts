/**
 * Form Persistence Utility
 * Handles saving and restoring form data between checkout steps
 */

export interface FormData {
  [key: string]: any;
}

export class FormPersistence {
  private static readonly STORAGE_PREFIX = 'checkout_form_';
  private static readonly STORAGE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Save form data to sessionStorage with expiry
   */
  static saveFormData(formId: string, data: FormData): void {
    if (typeof window === 'undefined') return;

    try {
      const storageData = {
        data,
        timestamp: Date.now(),
        expiry: Date.now() + this.STORAGE_EXPIRY
      };

      sessionStorage.setItem(
        `${this.STORAGE_PREFIX}${formId}`,
        JSON.stringify(storageData)
      );
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }

  /**
   * Load form data from sessionStorage
   */
  static loadFormData(formId: string): FormData | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = sessionStorage.getItem(`${this.STORAGE_PREFIX}${formId}`);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      
      // Check if data has expired
      if (Date.now() > storageData.expiry) {
        this.clearFormData(formId);
        return null;
      }

      return storageData.data;
    } catch (error) {
      console.warn('Failed to load form data:', error);
      return null;
    }
  }

  /**
   * Clear specific form data
   */
  static clearFormData(formId: string): void {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.removeItem(`${this.STORAGE_PREFIX}${formId}`);
    } catch (error) {
      console.warn('Failed to clear form data:', error);
    }
  }

  /**
   * Clear all checkout form data
   */
  static clearAllFormData(): void {
    if (typeof window === 'undefined') return;

    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.STORAGE_PREFIX)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to clear all form data:', error);
    }
  }

  /**
   * Auto-save form data with debouncing
   */
  static createAutoSaver(formId: string, debounceMs: number = 1000) {
    let timeoutId: NodeJS.Timeout;

    return (data: FormData) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        this.saveFormData(formId, data);
      }, debounceMs);
    };
  }

  /**
   * Restore form field values to form elements
   */
  static restoreFormFields(formElement: HTMLFormElement, data: FormData): void {
    if (!formElement || !data) return;

    Object.entries(data).forEach(([fieldName, value]) => {
      const field = formElement.elements.namedItem(fieldName) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      if (field) {
        if (field.type === 'checkbox' || field.type === 'radio') {
          (field as HTMLInputElement).checked = Boolean(value);
        } else {
          field.value = String(value || '');
        }
      }
    });
  }

  /**
   * Extract form data from form elements
   */
  static extractFormData(formElement: HTMLFormElement): FormData {
    const formData: FormData = {};
    const elements = formElement.elements;

    for (let i = 0; i < elements.length; i++) {
      const element = elements[i] as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
      
      if (element.name) {
        if (element.type === 'checkbox' || element.type === 'radio') {
          formData[element.name] = (element as HTMLInputElement).checked;
        } else if (element.type !== 'submit' && element.type !== 'button') {
          formData[element.name] = element.value;
        }
      }
    }

    return formData;
  }

  /**
   * Check if form data exists for a given form ID
   */
  static hasFormData(formId: string): boolean {
    return this.loadFormData(formId) !== null;
  }

  /**
   * Get form data age in milliseconds
   */
  static getFormDataAge(formId: string): number | null {
    if (typeof window === 'undefined') return null;

    try {
      const stored = sessionStorage.getItem(`${this.STORAGE_PREFIX}${formId}`);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      return Date.now() - storageData.timestamp;
    } catch (error) {
      return null;
    }
  }
}

/**
 * React hook for form persistence
 */
export function useFormPersistence(formId: string, debounceMs: number = 1000) {
  const autoSaver = FormPersistence.createAutoSaver(formId, debounceMs);

  const saveFormData = (data: FormData) => {
    FormPersistence.saveFormData(formId, data);
  };

  const loadFormData = () => {
    return FormPersistence.loadFormData(formId);
  };

  const clearFormData = () => {
    FormPersistence.clearFormData(formId);
  };

  const hasFormData = () => {
    return FormPersistence.hasFormData(formId);
  };

  return {
    saveFormData,
    loadFormData,
    clearFormData,
    hasFormData,
    autoSaveFormData: autoSaver
  };
}