-- Migration 003: Create property_taxes table
-- Purpose: Track property tax information for each property by year
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql

-- Create the property_taxes table
CREATE TABLE property_taxes (
  id SERIAL PRIMARY KEY,
  property_id INTEGER REFERENCES properties(id),
  tax_year INTEGER NOT NULL,
  tax_amount NUMERIC(10,2) NOT NULL,
  payment_status TEXT DEFAULT 'unpaid',
  payment_date DATE,
  payment_amount NUMERIC(10,2),
  escrow_monthly NUMERIC(10,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(property_id, tax_year)
);

-- Disable row level security (matches existing tables in this project)
ALTER TABLE property_taxes DISABLE ROW LEVEL SECURITY;

-- Add index for faster lookups by property
CREATE INDEX idx_property_taxes_property_id ON property_taxes(property_id);

-- Add index for faster lookups by year
CREATE INDEX idx_property_taxes_tax_year ON property_taxes(tax_year);
