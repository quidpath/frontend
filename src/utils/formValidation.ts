/**
 * Form Validation Utilities
 * Provides consistent validation across all modals
 */

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  email?: boolean;
  url?: boolean;
  phone?: boolean;
  custom?: (value: any) => string | null;
  message?: string;
}

export interface ValidationSchema {
  [field: string]: ValidationRule;
}

export interface ValidationErrors {
  [field: string]: string;
}

export class FormValidator {
  private schema: ValidationSchema;
  private errors: ValidationErrors = {};

  constructor(schema: ValidationSchema) {
    this.schema = schema;
  }

  /**
   * Validate a single field
   */
  validateField(field: string, value: any): string | null {
    const rule = this.schema[field];
    if (!rule) return null;

    // Required check
    if (rule.required && (value === '' || value === null || value === undefined)) {
      return rule.message || `${this.formatFieldName(field)} is required`;
    }

    // Skip other validations if value is empty and not required
    if (!rule.required && (value === '' || value === null || value === undefined)) {
      return null;
    }

    // Email validation
    if (rule.email && !this.isValidEmail(value)) {
      return rule.message || 'Invalid email address';
    }

    // URL validation
    if (rule.url && !this.isValidURL(value)) {
      return rule.message || 'Invalid URL';
    }

    // Phone validation
    if (rule.phone && !this.isValidPhone(value)) {
      return rule.message || 'Invalid phone number';
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message || `Invalid format for ${this.formatFieldName(field)}`;
    }

    // Min/Max for numbers
    if (typeof value === 'number') {
      if (rule.min !== undefined && value < rule.min) {
        return rule.message || `Must be at least ${rule.min}`;
      }
      if (rule.max !== undefined && value > rule.max) {
        return rule.message || `Must be at most ${rule.max}`;
      }
    }

    // MinLength/MaxLength for strings
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        return rule.message || `Must be at least ${rule.minLength} characters`;
      }
      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        return rule.message || `Must be at most ${rule.maxLength} characters`;
      }
    }

    // Custom validation
    if (rule.custom) {
      return rule.custom(value);
    }

    return null;
  }

  /**
   * Validate all fields in the form data
   */
  validate(formData: Record<string, any>): ValidationErrors {
    this.errors = {};

    Object.keys(this.schema).forEach((field) => {
      const error = this.validateField(field, formData[field]);
      if (error) {
        this.errors[field] = error;
      }
    });

    return this.errors;
  }

  /**
   * Check if form is valid
   */
  isValid(formData: Record<string, any>): boolean {
    const errors = this.validate(formData);
    return Object.keys(errors).length === 0;
  }

  /**
   * Get errors
   */
  getErrors(): ValidationErrors {
    return this.errors;
  }

  /**
   * Clear errors
   */
  clearErrors(): void {
    this.errors = {};
  }

  /**
   * Clear error for a specific field
   */
  clearFieldError(field: string): void {
    delete this.errors[field];
  }

  // Helper methods
  private formatFieldName(field: string): string {
    return field
      .replace(/_/g, ' ')
      .replace(/([A-Z])/g, ' $1')
      .trim()
      .replace(/^\w/, (c) => c.toUpperCase());
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidURL(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidPhone(phone: string): boolean {
    // Basic phone validation - adjust based on requirements
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
  }
}

/**
 * Common validation rules
 */
export const commonRules = {
  required: { required: true },
  email: { required: true, email: true },
  phone: { phone: true },
  url: { url: true },
  positiveNumber: {
    required: true,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num) || num <= 0) {
        return 'Must be a positive number';
      }
      return null;
    },
  },
  nonNegativeNumber: {
    required: true,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num) || num < 0) {
        return 'Must be a non-negative number';
      }
      return null;
    },
  },
  percentage: {
    required: true,
    custom: (value: any) => {
      const num = Number(value);
      if (isNaN(num) || num < 0 || num > 100) {
        return 'Must be between 0 and 100';
      }
      return null;
    },
  },
  date: {
    required: true,
    custom: (value: any) => {
      if (!value) return 'Date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return null;
    },
  },
  futureDate: {
    required: true,
    custom: (value: any) => {
      if (!value) return 'Date is required';
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      if (date < new Date()) {
        return 'Date must be in the future';
      }
      return null;
    },
  },
};

/**
 * Create a validator instance
 */
export function createValidator(schema: ValidationSchema): FormValidator {
  return new FormValidator(schema);
}
