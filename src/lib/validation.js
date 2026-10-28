export const isRequired = (value) => String(value ?? '').trim().length > 0;

export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value).trim());

/** Indian mobile numbers: 10 digits starting 6-9, optional +91 / 0 prefix. */
export const isPhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  const local = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits.replace(/^0/, '');
  return /^[6-9]\d{9}$/.test(local);
};

export const normalizePhone = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
  return digits.replace(/^0/, '');
};

export const isPincode = (value) => /^[1-9]\d{5}$/.test(String(value ?? '').trim());

export const minLength = (value, length) => String(value ?? '').trim().length >= length;

export const isStrongEnough = (value) => String(value ?? '').length >= 8;

/**
 * Small declarative form validator.
 * rules: { field: [(value, values) => errorMessage | null] }
 * returns { field: message } for every failure
 */
export const validateForm = (values, rules) => {
  const errors = {};
  Object.entries(rules).forEach(([field, validators]) => {
    for (const validate of validators) {
      const message = validate(values[field], values);
      if (message) {
        errors[field] = message;
        break;
      }
    }
  });
  return errors;
};

export const required = (label) => (value) => (isRequired(value) ? null : `${label} is required`);
export const email = (value) => (isEmail(value) ? null : 'Enter a valid email address');
export const phone = (value) => (isPhone(value) ? null : 'Enter a valid 10 digit mobile number');
export const pincode = (value) => (isPincode(value) ? null : 'Enter a valid 6 digit pincode');
export const password = (value) =>
  isStrongEnough(value) ? null : 'Password must be at least 8 characters';
