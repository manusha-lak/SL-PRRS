const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('[AUTH-DB] ERROR: SUPABASE_URL and SUPABASE_ANON_KEY must be set in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Creates the users table in Supabase if it does not already exist.
 * Supabase uses PostgreSQL so we use the REST API to check.
 * In practice, run the SQL below in your Supabase SQL editor once.
 *
 * SQL to run in Supabase dashboard → SQL Editor:
 *
 *   CREATE TABLE IF NOT EXISTS users (
 *     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 *     name TEXT NOT NULL,
 *     email TEXT UNIQUE NOT NULL,
 *     password_hash TEXT NOT NULL,
 *     role TEXT NOT NULL DEFAULT 'citizen',
 *     created_at TIMESTAMPTZ DEFAULT now()
 *   );
 */
async function initDb() {
  try {
    // Verify connection by doing a lightweight query
    const { error } = await supabase.from('users').select('id').limit(1);

    if (error && error.code === '42P01') {
      // Table does not exist - remind developer to run the SQL
      console.error('[AUTH-DB] Table "users" not found.');
      console.error('[AUTH-DB] Please run the SQL in src/db/schema.sql in your Supabase SQL Editor.');
      process.exit(1);
    }

    if (error) {
      throw error;
    }

    console.log('[AUTH-DB] Connected to Supabase successfully.');
  } catch (err) {
    console.error('[AUTH-DB] Database connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = { supabase, initDb };
