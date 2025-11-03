-- Migration: Make most fields nullable to allow partial data entry
-- Date: 2025-11-03
-- Reason: Users should be able to save partial property data and return later
-- Only core identity fields (address, city, state) remain required

-- ============================================================================
-- ACQUISITION & FINANCIAL FIELDS
-- ============================================================================
ALTER TABLE properties
ALTER COLUMN purchase_date DROP NOT NULL;

ALTER TABLE properties
ALTER COLUMN purchase_price DROP NOT NULL;

-- acquisition_method is already nullable

-- ============================================================================
-- PHYSICAL CHARACTERISTICS
-- ============================================================================
ALTER TABLE properties
ALTER COLUMN property_type DROP NOT NULL;

ALTER TABLE properties
ALTER COLUMN bedrooms DROP NOT NULL;

ALTER TABLE properties
ALTER COLUMN bathrooms DROP NOT NULL;

-- ============================================================================
-- CORE IDENTITY FIELDS
-- ============================================================================
-- Make zip nullable (some properties might not have zip initially)
ALTER TABLE properties
ALTER COLUMN zip DROP NOT NULL;

-- Keep these as NOT NULL (minimum required for property identity):
-- - address
-- - city
-- - state (has default 'TX')

-- ============================================================================
-- OCCUPANCY STATUS
-- ============================================================================
-- Keep occupancy_status as NOT NULL since it has a default value of 'Vacant'
-- This is fine because there's always a default

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to verify which columns still have NOT NULL constraints:
--
-- SELECT column_name, is_nullable, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- AND is_nullable = 'NO'
-- ORDER BY column_name;
