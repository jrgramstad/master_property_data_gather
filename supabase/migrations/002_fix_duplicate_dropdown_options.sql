-- Migration: Remove duplicate dropdown options and add unique constraint
-- Date: 2025-11-03
-- Reason: Dropdown fields showing duplicate options due to schema being run multiple times

-- ============================================================================
-- STEP 1: Delete ALL existing dropdown options
-- ============================================================================
-- This clears the table completely so we can re-seed with clean data
DELETE FROM dropdown_options;

-- ============================================================================
-- STEP 2: Add UNIQUE constraint to prevent duplicates
-- ============================================================================
-- This ensures (option_type, option_value) pairs are unique
ALTER TABLE dropdown_options
ADD CONSTRAINT unique_option_type_value UNIQUE (option_type, option_value);

-- ============================================================================
-- STEP 3: Re-insert dropdown options (only once per unique pair)
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
ON CONFLICT (option_type, option_value) DO NOTHING;

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- Run this to confirm no duplicates remain:
--
-- SELECT option_type, option_value, COUNT(*) as count
-- FROM dropdown_options
-- GROUP BY option_type, option_value
-- HAVING COUNT(*) > 1;
--
-- Should return 0 rows (no duplicates)

-- To see all options by type:
--
-- SELECT option_type, COUNT(*) as option_count
-- FROM dropdown_options
-- GROUP BY option_type
-- ORDER BY option_type;
