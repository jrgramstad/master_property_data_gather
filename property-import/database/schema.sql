-- Property Master Data Import - Database Schema Expansion
-- Run this in your Supabase SQL Editor BEFORE using the import tool
-- Supabase Project: gcuunlxfgtnppnqkikaz (AJ Real Estate System)

-- ============================================================================
-- EXPAND EXISTING PROPERTIES TABLE
-- Adds columns for ClickUp property data migration
-- ============================================================================

-- Address & Location Fields
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS full_address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT DEFAULT 'TX',
ADD COLUMN IF NOT EXISTS zip_code TEXT,
ADD COLUMN IF NOT EXISTS county TEXT;

-- Property Physical Characteristics
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS bedrooms INTEGER,
ADD COLUMN IF NOT EXISTS bathrooms NUMERIC(3,1),
ADD COLUMN IF NOT EXISTS square_footage INTEGER,
ADD COLUMN IF NOT EXISTS year_built TEXT,
ADD COLUMN IF NOT EXISTS stories INTEGER;

-- Financial - Acquisition
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS purchase_price NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS acquisition_method TEXT,
ADD COLUMN IF NOT EXISTS purchase_date DATE,
ADD COLUMN IF NOT EXISTS total_rehab_cost NUMERIC(12,2);

-- Financial - Current Value & Equity
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS current_value NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS equity NUMERIC(12,2);

-- Financial - Rental Income
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS market_rent NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS monthly_rent NUMERIC(8,2);

-- Financial - Mortgage
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS mortgage_payment NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS mortgage_balance NUMERIC(12,2),
ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS mortgage_lender TEXT,
ADD COLUMN IF NOT EXISTS loan_number TEXT;

-- Financial - Operating Expenses
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_tax_annual NUMERIC(8,2),
ADD COLUMN IF NOT EXISTS insurance_annual NUMERIC(8,2);

-- Occupancy & Tenant Info
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS occupancy_status TEXT,
ADD COLUMN IF NOT EXISTS current_tenant_name TEXT,
ADD COLUMN IF NOT EXISTS tenant_move_in_date DATE,
ADD COLUMN IF NOT EXISTS lease_end_date DATE,
ADD COLUMN IF NOT EXISTS lease_type TEXT,
ADD COLUMN IF NOT EXISTS days_vacant INTEGER,
ADD COLUMN IF NOT EXISTS last_rent_payment_date DATE,
ADD COLUMN IF NOT EXISTS payment_status TEXT;

-- Property Condition & Inspections
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS last_inspection_date DATE,
ADD COLUMN IF NOT EXISTS inspector_name TEXT,
ADD COLUMN IF NOT EXISTS overall_condition TEXT,
ADD COLUMN IF NOT EXISTS hvac_last_service DATE,
ADD COLUMN IF NOT EXISTS hvac_condition TEXT,
ADD COLUMN IF NOT EXISTS roof_last_inspection DATE,
ADD COLUMN IF NOT EXISTS roof_condition TEXT;

-- Structural Issues
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS foundation_type TEXT,
ADD COLUMN IF NOT EXISTS foundation_issues TEXT,
ADD COLUMN IF NOT EXISTS plumbing_issues TEXT,
ADD COLUMN IF NOT EXISTS electrical_issues TEXT;

-- Maintenance
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS pending_maintenance TEXT,
ADD COLUMN IF NOT EXISTS major_repairs_needed TEXT;

-- Property Features - Garage & Parking
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS garage_spaces TEXT,
ADD COLUMN IF NOT EXISTS has_driveway BOOLEAN DEFAULT FALSE;

-- Property Features - Outdoor
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS has_fence BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_pool BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_deck_porch BOOLEAN DEFAULT FALSE;

-- Property Features - Indoor Rooms
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS has_dining_room BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_family_room BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_laundry_room BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_living_room BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_office BOOLEAN DEFAULT FALSE;

-- Utilities & Services
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS gas_service TEXT,
ADD COLUMN IF NOT EXISTS water_service TEXT,
ADD COLUMN IF NOT EXISTS stove_type TEXT;

-- Management
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS property_manager TEXT,
ADD COLUMN IF NOT EXISTS lockbox_code TEXT;

-- Import Metadata
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS import_status TEXT,
ADD COLUMN IF NOT EXISTS imported_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS data_source TEXT DEFAULT 'ClickUp Migration',
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();

-- ============================================================================
-- CREATE INDEXES FOR BETTER QUERY PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_full_address ON properties(full_address);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_occupancy_status ON properties(occupancy_status);
CREATE INDEX IF NOT EXISTS idx_properties_import_status ON properties(import_status);
CREATE INDEX IF NOT EXISTS idx_properties_property_manager ON properties(property_manager);

-- ============================================================================
-- CREATE UPDATE TRIGGER
-- ============================================================================

-- Function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_properties_updated_at ON properties;

-- Create trigger
CREATE TRIGGER trigger_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_properties_updated_at();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Run these to verify the schema was updated correctly:

-- 1. Check all columns exist
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'properties'
-- ORDER BY ordinal_position;

-- 2. Count total columns
-- SELECT COUNT(*) as total_columns
-- FROM information_schema.columns
-- WHERE table_name = 'properties';

-- Expected: Should have 80+ columns after this migration

-- ============================================================================
-- ROLLBACK (if needed)
-- ============================================================================

-- If you need to rollback these changes, uncomment and run:
/*
ALTER TABLE properties
DROP COLUMN IF EXISTS full_address,
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS state,
DROP COLUMN IF EXISTS zip_code,
DROP COLUMN IF EXISTS county,
DROP COLUMN IF EXISTS bedrooms,
DROP COLUMN IF EXISTS bathrooms,
DROP COLUMN IF EXISTS square_footage,
DROP COLUMN IF EXISTS year_built,
DROP COLUMN IF EXISTS stories,
DROP COLUMN IF EXISTS purchase_price,
DROP COLUMN IF EXISTS acquisition_method,
DROP COLUMN IF EXISTS purchase_date,
DROP COLUMN IF EXISTS total_rehab_cost,
DROP COLUMN IF EXISTS current_value,
DROP COLUMN IF EXISTS equity,
DROP COLUMN IF EXISTS market_rent,
DROP COLUMN IF EXISTS monthly_rent,
DROP COLUMN IF EXISTS mortgage_payment,
DROP COLUMN IF EXISTS mortgage_balance,
DROP COLUMN IF EXISTS interest_rate,
DROP COLUMN IF EXISTS mortgage_lender,
DROP COLUMN IF EXISTS loan_number,
DROP COLUMN IF EXISTS property_tax_annual,
DROP COLUMN IF EXISTS insurance_annual,
DROP COLUMN IF EXISTS occupancy_status,
DROP COLUMN IF EXISTS current_tenant_name,
DROP COLUMN IF EXISTS tenant_move_in_date,
DROP COLUMN IF EXISTS lease_end_date,
DROP COLUMN IF EXISTS lease_type,
DROP COLUMN IF EXISTS days_vacant,
DROP COLUMN IF EXISTS last_rent_payment_date,
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS last_inspection_date,
DROP COLUMN IF EXISTS inspector_name,
DROP COLUMN IF EXISTS overall_condition,
DROP COLUMN IF EXISTS hvac_last_service,
DROP COLUMN IF EXISTS hvac_condition,
DROP COLUMN IF EXISTS roof_last_inspection,
DROP COLUMN IF EXISTS roof_condition,
DROP COLUMN IF EXISTS foundation_type,
DROP COLUMN IF EXISTS foundation_issues,
DROP COLUMN IF EXISTS plumbing_issues,
DROP COLUMN IF EXISTS electrical_issues,
DROP COLUMN IF EXISTS pending_maintenance,
DROP COLUMN IF EXISTS major_repairs_needed,
DROP COLUMN IF EXISTS garage_spaces,
DROP COLUMN IF EXISTS has_driveway,
DROP COLUMN IF EXISTS has_fence,
DROP COLUMN IF EXISTS has_pool,
DROP COLUMN IF EXISTS has_deck_porch,
DROP COLUMN IF EXISTS has_dining_room,
DROP COLUMN IF EXISTS has_family_room,
DROP COLUMN IF EXISTS has_laundry_room,
DROP COLUMN IF EXISTS has_living_room,
DROP COLUMN IF EXISTS has_office,
DROP COLUMN IF EXISTS gas_service,
DROP COLUMN IF EXISTS water_service,
DROP COLUMN IF EXISTS stove_type,
DROP COLUMN IF EXISTS property_manager,
DROP COLUMN IF EXISTS lockbox_code,
DROP COLUMN IF EXISTS import_status,
DROP COLUMN IF EXISTS imported_at,
DROP COLUMN IF EXISTS data_source,
DROP COLUMN IF EXISTS updated_at;
*/
