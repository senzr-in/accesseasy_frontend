// Helper function to check if value is a valid string or can be converted to one
function isValidString(value) {
  return value != null && value !== undefined;
}

// Helper function to safely convert value to string
function toSafeString(value) {
  if (typeof value === 'string') return value;
  if (typeof value === 'number') return value.toString();
  if (value == null || value === undefined) return '';
  return String(value);
}

// Format text with capitalized words
export function getFormattedText(form, key) {
  if (!form || !key) return '';
  
  const fieldValue = form[key];
  if (!isValidString(fieldValue)) return '';

  const safeStr = toSafeString(fieldValue);
  
  if (key === 'email') {
    return safeStr.toLowerCase();
  }
  // Handle empty string case
  if (!safeStr.trim()) return '';

  return safeStr
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(word => word) 
    .join(' ');
}

// Set formatted text in form
export function setFormattedText(form, key, value) {
  if (!form || !key || !isValidString(value)) return;

  const safeStr = toSafeString(value);

  if (key === 'email') {
    form[key] = safeStr.toLowerCase();
    return;
  }
  
  form[key] = safeStr
    .split(' ')
    .map(word => {
      if (!word) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .filter(word => word) 
    .join(' ');
}

// Additional validation helpers
export const textValidation = {
  // Check if text contains only letters and spaces
  isAlphaOnly(text) {
    if (!isValidString(text)) return false;
    return /^[A-Za-z\s]*$/.test(toSafeString(text));
  },

  // Check if text contains only alphanumeric characters and spaces
  isAlphanumeric(text) {
    if (!isValidString(text)) return false;
    return /^[A-Za-z0-9\s]*$/.test(toSafeString(text));
  },

  // Check if text meets minimum length requirement
  meetsMinLength(text, minLength) {
    if (!isValidString(text)) return false;
    return toSafeString(text).trim().length >= minLength;
  },

  // Check if text meets maximum length requirement
  meetsMaxLength(text, maxLength) {
    if (!isValidString(text)) return false;
    return toSafeString(text).trim().length <= maxLength;
  },

  // Sanitize text by removing special characters
  sanitize(text) {
    if (!isValidString(text)) return '';
    return toSafeString(text).replace(/[^A-Za-z0-9\s]/g, '');
  },
  isValidEmail(email) {
    if (!isValidString(email)) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(toSafeString(email).toLowerCase());
  }
};
