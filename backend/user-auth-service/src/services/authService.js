const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Register a new user (citizen or officer).
 */
async function register({ name, email, password, role }) {
  // Check for existing account
  const existing = await userRepository.findByEmail(email);
  if (existing) {
    const err = new Error('An account with this email already exists.');
    err.status = 409;
    throw err;
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Persist
  const user = await userRepository.createUser({ name, email, passwordHash, role });

  // Issue token
  const token = signToken(user);

  return { user, token };
}

/**
 * Login an existing user.
 */
async function login({ email, password }) {
  const user = await userRepository.findByEmail(email);
  if (!user) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  // Return safe user (no password hash)
  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
  };

  const token = signToken(safeUser);

  return { user: safeUser, token };
}

/**
 * Get profile for an authenticated user by id.
 */
async function getProfile(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    const err = new Error('User not found.');
    err.status = 404;
    throw err;
  }
  return user;
}

/**
 * Verify a JWT and return the decoded payload.
 * Used by other services to validate tokens.
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    const err = new Error('Invalid or expired token.');
    err.status = 401;
    throw err;
  }
}

// Internal helper
function signToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

module.exports = { register, login, getProfile, verifyToken };
