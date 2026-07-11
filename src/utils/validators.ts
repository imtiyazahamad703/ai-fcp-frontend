/**
 * Validate email format.
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength.
 * At least 8 characters, 1 uppercase, 1 lowercase, 1 number.
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

/**
 * Validate that a string is not empty or whitespace only.
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Validate minimum length.
 */
export const hasMinLength = (value: string, min: number): boolean => {
  return value.length >= min;
};

/**
 * Get password validation errors as an array of messages.
 */
export const getPasswordErrors = (password: string): string[] => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least 1 uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least 1 lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least 1 number');
  }

  return errors;
};

/**
 * Validate form fields and return error map.
 */
export const validateLoginForm = (
  email: string,
  password: string,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  }

  return errors;
};

/**
 * Validate registration form fields.
 */
export const validateRegisterForm = (
  name: string,
  email: string,
  password: string,
): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (!isNotEmpty(name)) {
    errors.name = 'Name is required';
  } else if (!hasMinLength(name, 2)) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!isNotEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(email)) {
    errors.email = 'Invalid email format';
  }

  if (!isNotEmpty(password)) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(password)) {
    const passwordErrors = getPasswordErrors(password);
    errors.password = passwordErrors[0];
  }

  return errors;
};
