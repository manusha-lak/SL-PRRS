const authService = require('../services/authService');
const { validateRegister, validateLogin } = require('../validators/authValidators');

/**
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    const errors = validateRegister({ name, email, password, role });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    const { user, token } = await authService.register({ name, email, password, role });

    return res.status(201).json({
      success: true,
      message: 'Account created successfully.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const errors = validateLogin({ email, password });
    if (errors.length > 0) {
      return res.status(400).json({ success: false, message: 'Validation failed.', errors });
    }

    const { user, token } = await authService.login({ email, password });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: { user, token },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/profile
 * Requires Authorization: Bearer <token>
 */
async function getProfile(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);

    return res.status(200).json({
      success: true,
      message: 'Profile retrieved.',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/auth/verify
 * Used internally by other services to validate a token.
 */
function verify(req, res) {
  // If requireAuth middleware passed, token is valid
  return res.status(200).json({
    success: true,
    message: 'Token is valid.',
    data: { user: req.user },
  });
}

/**
 * GET /api/auth/health
 */
function health(req, res) {
  return res.status(200).json({
    success: true,
    message: 'Auth Service is running.',
    data: {
      service: 'auth-service',
      port: process.env.PORT || 3001,
      timestamp: new Date().toISOString(),
    },
  });
}

module.exports = { register, login, getProfile, verify, health };
