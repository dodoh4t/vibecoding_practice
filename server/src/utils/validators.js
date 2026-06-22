const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;
const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

function isValidPassword(password) {
  if (typeof password !== 'string' || password.length < 12) {
    return false;
  }

  return /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password)
    && !isCommonPassword(password);
}

function isCommonPassword(password) {
  return new Set([
    '12345678',
    '123456789',
    'password123',
    'Password123!',
    'qwerty123',
    'admin123456',
    'letmein123'
  ]).has(password);
}

function isPositiveIntegerId(value) {
  return typeof value === 'string' && POSITIVE_INTEGER_PATTERN.test(value);
}

function parseBooleanQuery(value) {
  if (value === undefined) return undefined;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return null;
}

function isValidDateOnly(value) {
  if (typeof value !== 'string' || !DATE_ONLY_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

module.exports = {
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  isPositiveIntegerId,
  parseBooleanQuery,
  isValidDateOnly
};
