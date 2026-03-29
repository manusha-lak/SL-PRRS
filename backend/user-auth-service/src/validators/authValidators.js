/**
 * Validate registration input.
 * Returns array of error strings. Empty array means valid.
 */
function validateRegister({ name, email, password, role }) {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('name is required and must be at least 2 characters.');
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length < 6) {
    errors.push('password must be at least 6 characters.');
  }

  if (role && !['citizen', 'officer'].includes(role)) {
    errors.push('role must be either "citizen" or "officer".');
  }

  return errors;
}

/**
 * Validate login input.
 */
function validateLogin({ email, password }) {
  const errors = [];

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('A valid email address is required.');
  }

  if (!password || password.length === 0) {
    errors.push('password is required.');
  }

  return errors;
}

module.exports = { validateRegister, validateLogin };
