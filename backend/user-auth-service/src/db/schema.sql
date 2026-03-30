-- SL-PRRS Auth Service - Supabase Schema
-- Run this entire script in the Supabase Dashboard → SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT        NOT NULL,
  email       TEXT        UNIQUE NOT NULL,
  password_hash TEXT      NOT NULL,
  role        TEXT        NOT NULL DEFAULT 'citizen'
                          CHECK (role IN ('citizen', 'officer')),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Index on email for fast login lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- Seed demo data (optional - useful for assignment demo)
-- Password for both seed users is: Demo@1234
INSERT INTO users (name, email, password_hash, role) VALUES
  (
    'Demo Citizen',
    'citizen@slprs.lk',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lbu2',
    'citizen'
  ),
  (
    'Demo Officer',
    'officer@slprs.lk',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lbu2',
    'officer'
  )
ON CONFLICT (email) DO NOTHING;
