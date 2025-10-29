-- Property Master List Database Schema
-- Run this in your Supabase SQL Editor to create the database structure

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- MAIN TABLE: properties
-- Stores all 74 data points per property
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core Identity (5 fields)
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'TX',
  zip TEXT NOT NULL,
  county TEXT,

  -- Physical Characteristics (7 fields)
  property_type TEXT NOT NULL,
  bedrooms INTEGER NOT NULL,
  bathrooms NUMERIC(3,1) NOT NULL,
  square_footage INTEGER,
  lot_size INTEGER,
  year_built INTEGER,
  stories INTEGER,

  -- Acquisition & Financial (10 fields)
  purchase_date DATE NOT NULL,
  purchase_price NUMERIC(12,2) NOT NULL,
  acquisition_method TEXT,
  current_estimated_value NUMERIC(12,2),
  total_rehab_cost NUMERIC(12,2),
  current_monthly_rent NUMERIC(10,2),
  market_rent NUMERIC(10,2),
  mortgage_payment NUMERIC(10,2),
  property_tax_annual NUMERIC(10,2),
  insurance_annual NUMERIC(10,2),

  -- Occupancy & Tenant Info (8 fields)
  occupancy_status TEXT NOT NULL DEFAULT 'Vacant',
  current_tenant_name TEXT,
  tenant_move_in_date DATE,
  lease_end_date DATE,
  lease_type TEXT,
  days_vacant INTEGER, -- Auto-calculated
  last_rent_payment_date DATE,
  rent_payment_status TEXT,

  -- Property Condition (12 fields)
  last_inspection_date DATE,
  last_inspector TEXT,
  overall_condition_rating TEXT,
  last_hvac_service_date DATE,
  hvac_condition TEXT,
  last_roof_inspection_date DATE,
  roof_condition TEXT,
  foundation_issues TEXT,
  plumbing_issues TEXT,
  electrical_issues TEXT,
  pending_maintenance_requests TEXT,
  major_repairs_needed TEXT,

  -- Property Features (9 fields)
  has_garage BOOLEAN DEFAULT FALSE,
  has_driveway BOOLEAN DEFAULT FALSE,
  has_fence BOOLEAN DEFAULT FALSE,
  has_pool BOOLEAN DEFAULT FALSE,
  appliances_included TEXT[], -- Array of appliances
  central_heat_ac BOOLEAN DEFAULT FALSE,
  flooring_types TEXT,
  recent_upgrades TEXT,

  -- Property Management (7 fields)
  property_manager_assigned TEXT DEFAULT 'Kalen',
  managed_by TEXT DEFAULT 'In-house',
  has_hoa BOOLEAN DEFAULT FALSE,
  hoa_fee NUMERIC(8,2),
  pet_friendly BOOLEAN DEFAULT FALSE,
  utilities_included TEXT,
  neighborhood_area TEXT, -- A/B/C/D classification

  -- Historical Performance (9 fields)
  total_months_owned INTEGER, -- Auto-calculated
  total_months_occupied INTEGER,
  occupancy_rate_percent NUMERIC(5,2), -- Auto-calculated
  number_of_turnovers INTEGER,
  avg_tenant_length_of_stay NUMERIC(5,1),
  total_maintenance_costs NUMERIC(12,2),
  avg_monthly_maintenance_cost NUMERIC(10,2), -- Auto-calculated
  eviction_count INTEGER DEFAULT 0,
  last_eviction_date DATE,

  -- Operational Notes (6 fields)
  problem_property_flag BOOLEAN DEFAULT FALSE,
  preferred_contractor TEXT,
  access_notes TEXT,
  neighbor_issues TEXT,
  city_code_violations TEXT,
  special_notes TEXT,

  -- Metadata (4 fields)
  last_verified_date TIMESTAMP WITH TIME ZONE,
  verified_by TEXT,
  data_completeness_score INTEGER, -- Auto-calculated (0-100)
  missing_information TEXT,

  -- Audit fields
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABLE: dropdown_options
-- Stores dropdown values for form fields
-- ============================================================================

CREATE TABLE IF NOT EXISTS dropdown_options (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  option_type TEXT NOT NULL,
  option_value TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on option_type for faster lookups
CREATE INDEX IF NOT EXISTS idx_dropdown_options_type ON dropdown_options(option_type);

-- ============================================================================
-- FUNCTIONS: Auto-calculations
-- ============================================================================

-- Function to calculate days vacant
CREATE OR REPLACE FUNCTION calculate_days_vacant(
  p_occupancy_status TEXT,
  p_lease_end_date DATE
)
RETURNS INTEGER AS $$
BEGIN
  IF p_occupancy_status = 'Vacant' AND p_lease_end_date IS NOT NULL THEN
    RETURN GREATEST(0, CURRENT_DATE - p_lease_end_date);
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate months owned
CREATE OR REPLACE FUNCTION calculate_months_owned(
  p_purchase_date DATE
)
RETURNS INTEGER AS $$
BEGIN
  IF p_purchase_date IS NOT NULL THEN
    RETURN GREATEST(0,
      (EXTRACT(YEAR FROM AGE(CURRENT_DATE, p_purchase_date)) * 12) +
      EXTRACT(MONTH FROM AGE(CURRENT_DATE, p_purchase_date))
    );
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate occupancy rate
CREATE OR REPLACE FUNCTION calculate_occupancy_rate(
  p_total_months_occupied INTEGER,
  p_total_months_owned INTEGER
)
RETURNS NUMERIC(5,2) AS $$
BEGIN
  IF p_total_months_owned IS NOT NULL AND p_total_months_owned > 0 THEN
    RETURN ROUND((p_total_months_occupied::NUMERIC / p_total_months_owned::NUMERIC) * 100, 2);
  END IF;
  RETURN 0;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to calculate data completeness score
CREATE OR REPLACE FUNCTION calculate_completeness_score(property_row properties)
RETURNS INTEGER AS $$
DECLARE
  total_fields INTEGER := 74;
  filled_fields INTEGER := 0;
BEGIN
  -- Count non-null, non-empty fields (excluding auto-calculated and metadata)
  filled_fields := (
    SELECT COUNT(*) FROM (
      SELECT
        CASE WHEN property_row.address IS NOT NULL AND property_row.address != '' THEN 1 END,
        CASE WHEN property_row.city IS NOT NULL AND property_row.city != '' THEN 1 END,
        CASE WHEN property_row.state IS NOT NULL AND property_row.state != '' THEN 1 END,
        CASE WHEN property_row.zip IS NOT NULL AND property_row.zip != '' THEN 1 END,
        CASE WHEN property_row.county IS NOT NULL AND property_row.county != '' THEN 1 END,
        CASE WHEN property_row.property_type IS NOT NULL THEN 1 END,
        CASE WHEN property_row.bedrooms IS NOT NULL THEN 1 END,
        CASE WHEN property_row.bathrooms IS NOT NULL THEN 1 END,
        CASE WHEN property_row.square_footage IS NOT NULL THEN 1 END,
        CASE WHEN property_row.lot_size IS NOT NULL THEN 1 END,
        CASE WHEN property_row.year_built IS NOT NULL THEN 1 END,
        CASE WHEN property_row.stories IS NOT NULL THEN 1 END,
        CASE WHEN property_row.purchase_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.purchase_price IS NOT NULL THEN 1 END,
        CASE WHEN property_row.acquisition_method IS NOT NULL THEN 1 END,
        CASE WHEN property_row.current_estimated_value IS NOT NULL THEN 1 END,
        CASE WHEN property_row.total_rehab_cost IS NOT NULL THEN 1 END,
        CASE WHEN property_row.current_monthly_rent IS NOT NULL THEN 1 END,
        CASE WHEN property_row.market_rent IS NOT NULL THEN 1 END,
        CASE WHEN property_row.mortgage_payment IS NOT NULL THEN 1 END,
        CASE WHEN property_row.property_tax_annual IS NOT NULL THEN 1 END,
        CASE WHEN property_row.insurance_annual IS NOT NULL THEN 1 END,
        CASE WHEN property_row.occupancy_status IS NOT NULL THEN 1 END,
        CASE WHEN property_row.current_tenant_name IS NOT NULL THEN 1 END,
        CASE WHEN property_row.tenant_move_in_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.lease_end_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.lease_type IS NOT NULL THEN 1 END,
        CASE WHEN property_row.last_rent_payment_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.rent_payment_status IS NOT NULL THEN 1 END,
        CASE WHEN property_row.last_inspection_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.last_inspector IS NOT NULL THEN 1 END,
        CASE WHEN property_row.overall_condition_rating IS NOT NULL THEN 1 END,
        CASE WHEN property_row.last_hvac_service_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.hvac_condition IS NOT NULL THEN 1 END,
        CASE WHEN property_row.last_roof_inspection_date IS NOT NULL THEN 1 END,
        CASE WHEN property_row.roof_condition IS NOT NULL THEN 1 END,
        CASE WHEN property_row.foundation_issues IS NOT NULL THEN 1 END,
        CASE WHEN property_row.plumbing_issues IS NOT NULL THEN 1 END,
        CASE WHEN property_row.electrical_issues IS NOT NULL THEN 1 END,
        CASE WHEN property_row.pending_maintenance_requests IS NOT NULL THEN 1 END,
        CASE WHEN property_row.major_repairs_needed IS NOT NULL THEN 1 END
        -- Add more fields as needed
    ) AS field_counts
  );

  RETURN ROUND((filled_fields::NUMERIC / total_fields::NUMERIC) * 100);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- TRIGGER: Auto-update calculated fields
-- ============================================================================

CREATE OR REPLACE FUNCTION update_property_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate days vacant
  NEW.days_vacant := calculate_days_vacant(NEW.occupancy_status, NEW.lease_end_date);

  -- Calculate months owned
  NEW.total_months_owned := calculate_months_owned(NEW.purchase_date);

  -- Calculate occupancy rate
  NEW.occupancy_rate_percent := calculate_occupancy_rate(
    NEW.total_months_occupied,
    NEW.total_months_owned
  );

  -- Calculate avg monthly maintenance cost
  IF NEW.total_maintenance_costs IS NOT NULL AND NEW.total_months_owned > 0 THEN
    NEW.avg_monthly_maintenance_cost := ROUND(NEW.total_maintenance_costs / NEW.total_months_owned, 2);
  END IF;

  -- Calculate data completeness score
  NEW.data_completeness_score := calculate_completeness_score(NEW);

  -- Update timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_update_property_calculations ON properties;
CREATE TRIGGER trigger_update_property_calculations
  BEFORE INSERT OR UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_property_calculations();

-- ============================================================================
-- SEED DATA: Dropdown options
-- ============================================================================

INSERT INTO dropdown_options (option_type, option_value, sort_order) VALUES
-- Property Types
('PropertyType', 'Single Family', 1),
('PropertyType', 'Multi-Family', 2),
('PropertyType', 'Duplex', 3),
('PropertyType', 'Triplex', 4),
('PropertyType', 'Fourplex', 5),
('PropertyType', 'Condo', 6),
('PropertyType', 'Townhouse', 7),
('PropertyType', 'Mobile Home', 8),

-- Occupancy Status
('OccupancyStatus', 'Occupied', 1),
('OccupancyStatus', 'Vacant', 2),
('OccupancyStatus', 'Turnover in Progress', 3),
('OccupancyStatus', 'Rehab in Progress', 4),

-- Lease Types
('LeaseType', 'Month-to-Month', 1),
('LeaseType', '6-Month Lease', 2),
('LeaseType', '12-Month Lease', 3),
('LeaseType', '24-Month Lease', 4),
('LeaseType', 'Section 8', 5),

-- Condition Ratings
('ConditionRating', 'Excellent', 1),
('ConditionRating', 'Good', 2),
('ConditionRating', 'Fair', 3),
('ConditionRating', 'Needs Work', 4),
('ConditionRating', 'Poor', 5),

-- Neighborhood Areas
('NeighborhoodArea', 'A - Premium', 1),
('NeighborhoodArea', 'B - Good', 2),
('NeighborhoodArea', 'C - Average', 3),
('NeighborhoodArea', 'D - Needs Improvement', 4),

-- Acquisition Methods
('AcquisitionMethod', 'Purchase', 1),
('AcquisitionMethod', 'Foreclosure', 2),
('AcquisitionMethod', 'Tax Sale', 3),
('AcquisitionMethod', 'Inherited', 4),
('AcquisitionMethod', 'Wholesaler', 5),
('AcquisitionMethod', 'FSBO', 6),
('AcquisitionMethod', 'MLS', 7),

-- Rent Payment Status
('RentPaymentStatus', 'Current', 1),
('RentPaymentStatus', 'Late (1-5 days)', 2),
('RentPaymentStatus', 'Late (6-15 days)', 3),
('RentPaymentStatus', 'Late (16+ days)', 4),
('RentPaymentStatus', 'Partial Payment', 5),
('RentPaymentStatus', 'Non-Payment', 6),

-- States
('State', 'TX', 1),
('State', 'AL', 2),
('State', 'AR', 3),
('State', 'AZ', 4),
('State', 'CA', 5),
('State', 'CO', 6),
('State', 'FL', 7),
('State', 'GA', 8),
('State', 'LA', 9),
('State', 'MS', 10),
('State', 'NM', 11),
('State', 'OK', 12),
('State', 'TN', 13)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROW LEVEL SECURITY (Optional - enable if you want user-level access control)
-- ============================================================================

-- Enable RLS
-- ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE dropdown_options ENABLE ROW LEVEL SECURITY;

-- Create policies (example - allow all for now)
-- CREATE POLICY "Enable all access for authenticated users" ON properties
--   FOR ALL USING (auth.role() = 'authenticated');

-- CREATE POLICY "Enable read access for dropdown_options" ON dropdown_options
--   FOR SELECT USING (true);

-- ============================================================================
-- INDEXES for better performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_properties_address ON properties(address);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_occupancy_status ON properties(occupancy_status);
CREATE INDEX IF NOT EXISTS idx_properties_completeness ON properties(data_completeness_score);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON properties(created_at DESC);

-- ============================================================================
-- VIEWS for common queries
-- ============================================================================

-- Dashboard summary view
CREATE OR REPLACE VIEW dashboard_summary AS
SELECT
  id,
  address,
  city,
  state,
  property_type,
  occupancy_status,
  data_completeness_score,
  last_verified_date,
  created_at,
  updated_at
FROM properties
ORDER BY created_at DESC;

-- Statistics view
CREATE OR REPLACE VIEW property_statistics AS
SELECT
  COUNT(*) as total_properties,
  COUNT(*) FILTER (WHERE data_completeness_score = 100) as completed,
  COUNT(*) FILTER (WHERE data_completeness_score > 0 AND data_completeness_score < 100) as in_progress,
  COUNT(*) FILTER (WHERE data_completeness_score = 0 OR data_completeness_score IS NULL) as not_started,
  ROUND(AVG(data_completeness_score), 2) as avg_completeness
FROM properties;

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant access to tables
GRANT ALL ON properties TO authenticated;
GRANT ALL ON dropdown_options TO authenticated;
GRANT SELECT ON properties TO anon;
GRANT SELECT ON dropdown_options TO anon;

-- Grant access to views
GRANT SELECT ON dashboard_summary TO anon, authenticated;
GRANT SELECT ON property_statistics TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
