const { supabase } = require('../db/supabase');

/**
 * Find a user by their email address.
 * @param {string} email
 * @returns {object|null} user row or null
 */
async function findByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error && error.code === 'PGRST116') return null; // not found
  if (error) throw error;
  return data;
}

/**
 * Find a user by their UUID.
 * @param {string} id
 * @returns {object|null} user row or null
 */
async function findById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('id, name, email, role, created_at')
    .eq('id', id)
    .single();

  if (error && error.code === 'PGRST116') return null;
  if (error) throw error;
  return data;
}

/**
 * Insert a new user row.
 * @param {object} params - { name, email, passwordHash, role }
 * @returns {object} newly created user (without password_hash)
 */
async function createUser({ name, email, passwordHash, role }) {
  const { data, error } = await supabase
    .from('users')
    .insert([
      {
        name,
        email,
        password_hash: passwordHash,
        role: role || 'citizen',
      },
    ])
    .select('id, name, email, role, created_at')
    .single();

  if (error) throw error;
  return data;
}

module.exports = { findByEmail, findById, createUser };
