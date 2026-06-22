const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const POSITIVE_INTEGER_PATTERN = /^[1-9]\d*$/;

function normalizeEmail(email) {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function isValidEmail(email) {
  return EMAIL_PATTERN.test(email);
}

function isValidPassword(password) {
  return typeof password === 'string' && password.length >= 8;
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

module.exports = {
  normalizeEmail,
  isValidEmail,
  isValidPassword,
  isPositiveIntegerId,
  parseBooleanQuery
};
