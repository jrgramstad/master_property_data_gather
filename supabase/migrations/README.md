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

## Verification

After running a migration, verify it worked:

```sql
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'properties'
AND is_nullable = 'NO'
ORDER BY column_name;
```

This shows all columns that still have NOT NULL constraints.

## Rollback

If you need to revert a migration, you can add NOT NULL constraints back:

```sql
ALTER TABLE properties
ALTER COLUMN purchase_date SET NOT NULL;
```

**Warning**: This will fail if any existing rows have NULL values in that column.
