// utils/validate.js  –  Central validation helpers

// ── primitive checkers ────────────────────────────────────────────────────────

function isNonEmptyString(val) {
  return typeof val === 'string' && val.trim().length > 0;
}

// must contain @ AND end with .com (case-insensitive)
function isEmail(val) {
  return (
    typeof val === 'string' &&
    val.includes('@') &&
    val.toLowerCase().endsWith('.com')
  );
}

// exactly 11 numeric digits
function isPhone(val) {
  return typeof val === 'string' && /^\d{11}$/.test(val);
}

function isPositiveInt(val) {
  const n = Number(val);
  return Number.isInteger(n) && n > 0;
}

function isPositiveNumber(val) {
  const n = Number(val);
  return !isNaN(n) && n > 0;
}

function isDatetime(val) {
  return typeof val === 'string' && !isNaN(Date.parse(val));
}

// ── check factories ───────────────────────────────────────────────────────────
// Each factory returns a function(value, field) → error-string | null

const required = (value, field) =>
  value === undefined || value === null || value === ''
    ? `${field} is required`
    : null;

const mustBeString = (value, field) =>
  value !== undefined && !isNonEmptyString(value)
    ? `${field} must be a non-empty string`
    : null;

// letters and spaces only — no digits or special characters
const mustBeName = (value, field) =>
  value !== undefined && (typeof value !== 'string' || !/^[A-Za-z\s]+$/.test(value.trim()))
    ? `${field} must contain letters only (no numbers or special characters)`
    : null;

const mustBeEmail = (value, field) =>
  value !== undefined && !isEmail(value)
    ? `${field} must be a valid email address containing "@" and ending with ".com"`
    : null;

// phone is optional — only validated when present and non-empty
const mustBePhone = (value, field) =>
  value !== undefined && value !== null && value !== '' && !isPhone(value)
    ? `${field} must be exactly 11 digits`
    : null;

const mustBePositiveInt = (value, field) =>
  value !== undefined && !isPositiveInt(value)
    ? `${field} must be a positive integer`
    : null;

const mustBePositiveNumber = (value, field) =>
  value !== undefined && !isPositiveNumber(value)
    ? `${field} must be a positive number greater than 0`
    : null;

const mustBeDatetime = (value, field) =>
  value !== undefined && !isDatetime(value)
    ? `${field} must be a valid datetime string`
    : null;

const mustBeOneOf = (allowed) => (value, field) =>
  value !== undefined && !allowed.includes(value)
    ? `${field} must be one of: ${allowed.join(', ')}`
    : null;

const mustBeBinary = (value, field) =>
  value !== undefined &&
  value !== 0 &&
  value !== 1 &&
  value !== '0' &&
  value !== '1'
    ? `${field} must be 0 or 1`
    : null;

// ── main runner ───────────────────────────────────────────────────────────────
// Usage:
//   const errors = runValidation([
//     { field: 'email', value: req.body.email, checks: [required, mustBeEmail] },
//     ...
//   ]);
//   if (errors.length) return res.status(400).json({ status:'error', errors });

function runValidation(rules) {
  const errors = [];
  for (const { field, value, checks } of rules) {
    for (const check of checks) {
      const msg = check(value, field);
      if (msg) errors.push(msg);
    }
  }
  return errors;
}

module.exports = {
  runValidation,
  required,
  mustBeString,
  mustBeName,
  mustBeEmail,
  mustBePhone,
  mustBePositiveInt,
  mustBePositiveNumber,
  mustBeDatetime,
  mustBeOneOf,
  mustBeBinary,
};
