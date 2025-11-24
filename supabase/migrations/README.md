# Database Migrations

This directory contains SQL migration files for updating the Supabase database schema.

## How to Run Migrations

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **kcxinxhxiwtccogsqsiy** (Property Master List)
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the contents of a migration file
6. Paste and click **Run**

## Migration Files

### 001_make_fields_nullable.sql
**Purpose**: Make most fields nullable to allow partial data entry

**Reason**: Users should be able to save incomplete property data and return later to fill in more details.

**Changes**:
- Makes `purchase_date` nullable
- Makes `purchase_price` nullable
- Makes `property_type` nullable
- Makes `bedrooms` nullable
- Makes `bathrooms` nullable
- Makes `zip` nullable

**Fields that remain required**:
- `address` - Core identifier
- `city` - Core identifier
- `state` - Core identifier (has default 'TX')
- `occupancy_status` - Has default 'Vacant'

**When to run**: If you get errors like "null value in column violates not-null constraint" when saving properties

### 002_fix_duplicate_dropdown_options.sql
**Purpose**: Remove duplicate dropdown options and prevent future duplicates

**Reason**: All dropdown fields showing each option twice (e.g., "Single Family", "Single Family"). This happens when schema.sql is run multiple times.

**Changes**:
- Deletes all rows from `dropdown_options` table
- Adds UNIQUE constraint on `(option_type, option_value)`
- Re-inserts dropdown options (clean data, no duplicates)
- Uses `ON CONFLICT` clause to prevent future duplicates

**Affected dropdowns**:
- Property Type
- Occupancy Status
- Lease Type
- Condition Rating
- Neighborhood Area
- Acquisition Method
- Rent Payment Status
- State

**When to run**: If dropdown fields show duplicate options (each choice appears twice)

### 003_create_property_taxes_table.sql
**Purpose**: Create a table to track property tax information by year

**Reason**: Need to track annual property taxes, payments, and escrow information for each property.

**Changes**:
- Creates new `property_taxes` table with columns:
  - `property_id` - Links to properties table
  - `tax_year` - The tax year
  - `tax_amount` - Annual tax amount
  - `payment_status` - Default 'unpaid'
  - `payment_date` - When payment was made
  - `payment_amount` - Amount paid
  - `escrow_monthly` - Monthly escrow amount
  - `notes` - Additional notes
- Adds UNIQUE constraint on `(property_id, tax_year)`
- Adds indexes for performance
- Disables row level security (matches existing tables)

**When to run**: When you need to track property tax information

## Verification

After running a migration, verify it worked:

### Check for NOT NULL constraints (Migration 001)
```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
AND is_nullable = 'NO'
ORDER BY column_name;
```

This shows all columns that still have NOT NULL constraints.

### Check for duplicate dropdown options (Migration 002)
```sql
SELECT option_type, option_value, COUNT(*) as count
FROM dropdown_options
GROUP BY option_type, option_value
HAVING COUNT(*) > 1;
```

Should return **0 rows** (no duplicates).

### View dropdown options by type
```sql
SELECT option_type, COUNT(*) as option_count
FROM dropdown_options
GROUP BY option_type
ORDER BY option_type;
```

### Check property_taxes table exists (Migration 003)
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'property_taxes'
ORDER BY ordinal_position;
```

Should return all columns of the property_taxes table.

## Rollback

If you need to revert a migration, you can add NOT NULL constraints back:

```sql
ALTER TABLE properties
ALTER COLUMN purchase_date SET NOT NULL;
```

**Warning**: This will fail if any existing rows have NULL values in that column.

