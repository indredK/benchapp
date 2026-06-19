// ============================================================
// Form Validation — shared validation rules & helpers
// ============================================================

export interface ValidationRule<T = string> {
  validate: (value: T) => boolean;
  message: string;
}

export interface FieldValidation<T = string> {
  value: T;
  rules: ValidationRule<T>[];
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Required field */
export function required(message = 'Required'): ValidationRule {
  return {
    validate: (v) => v.trim().length > 0,
    message,
  };
}

/** Phone (simplified CN pattern) */
export function isPhone(message = 'Invalid phone number'): ValidationRule {
  return {
    validate: (v) => /^1[3-9]\d{9}$/.test(v.trim()),
    message,
  };
}

/** Email */
export function isEmail(message = 'Invalid email'): ValidationRule {
  return {
    validate: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()),
    message,
  };
}

/** Min length */
export function minLength(n: number, message?: string): ValidationRule {
  return {
    validate: (v) => v.trim().length >= n,
    message: message ?? `Min ${n} characters`,
  };
}

/** Max length */
export function maxLength(n: number, message?: string): ValidationRule {
  return {
    validate: (v) => v.trim().length <= n,
    message: message ?? `Max ${n} characters`,
  };
}

/** Custom pattern */
export function pattern(regex: RegExp, message: string): ValidationRule {
  return { validate: (v) => regex.test(v), message };
}

/** Run all validations on a set of fields */
export function validate(fields: Record<string, FieldValidation>): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [name, field] of Object.entries(fields)) {
    for (const rule of field.rules) {
      if (!rule.validate(field.value)) {
        errors[name] = rule.message;
        break; // first error only per field
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors };
}

/** Submit guard — debounce / prevent double submit */
export function createSubmitGuard() {
  let submitting = false;

  return {
    get isSubmitting() {
      return submitting;
    },
    async guard<T>(fn: () => Promise<T>): Promise<T | undefined> {
      if (submitting) return undefined;
      submitting = true;
      try {
        return await fn();
      } finally {
        submitting = false;
      }
    },
  };
}
