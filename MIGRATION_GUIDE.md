# West African Legal Standards Migration Guide

## Quick Start

This guide helps you apply the West African legal standards migration to your Supabase database.

## Prerequisites

- Supabase project with the initial schema (`001_initial_schema.sql`) already applied
- PostgreSQL with PostGIS extension support
- Database backup completed

## Step 1: Backup Your Database

```bash
# Using Supabase CLI
supabase db dump -f backup_$(date +%Y%m%d).sql

# Or using pg_dump directly
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

## Step 2: Apply the Migration

### Option A: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `supabase/migrations/002_west_african_legal_standards.sql`
4. Paste and run the SQL

### Option B: Using Supabase CLI

```bash
# Make sure you're in the project directory
cd "Land Registry Platform"

# Apply the migration
supabase db push
```

### Option C: Manual SQL Execution

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/002_west_african_legal_standards.sql
```

## Step 3: Verify Migration

Run these verification queries:

```sql
-- Check new enum types exist
SELECT typname FROM pg_type 
WHERE typname IN ('title_type', 'grantor_type', 'mint_status');

-- Check new tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'verified_users',
  'land_litigation_history',
  'surveyor_verifications',
  'traditional_authority_approvals',
  'blockchain_minting_log'
);

-- Check new columns in land_claims
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'land_claims' 
AND column_name IN (
  'title_type',
  'parcel_id_barcode',
  'fraud_confidence_score',
  'on_chain_hash',
  'mint_status'
);

-- Verify PostGIS is enabled
SELECT PostGIS_Version();
```

Expected output:
- 3 enum types
- 5 new tables
- 18+ new columns in land_claims
- PostGIS version (e.g., "3.3.2")

## Step 4: Update Application Code

### Install Dependencies (if needed)

```bash
npm install
# or
yarn install
```

### TypeScript Types

The following files have been updated:
- `types/database.types.ts` - Database schema types
- `types/land-claim.types.ts` - Domain types and interfaces

No code changes needed - types are automatically updated!

## Step 5: Test the Migration

### Test 1: Create a Verified User

```sql
INSERT INTO public.verified_users (
  full_name,
  email,
  role,
  professional_license_number
) VALUES (
  'John Doe',
  'john@example.com',
  'VERIFIER',
  'GH-SURV-12345'
);
```

### Test 2: Create a Claim with West African Fields

```sql
INSERT INTO public.land_claims (
  claimant_id,
  original_document_url,
  gps_coordinates,
  latitude,
  longitude,
  country,
  title_type,
  duration_years,
  document_serial_number,
  parcel_id_barcode,
  grantor_type,
  mint_status
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'https://example.com/doc.pdf',
  POINT(-0.1870, 5.6037),
  5.6037,
  -0.1870,
  'Ghana',
  'CERTIFICATE_OF_OCCUPANCY',
  99,
  'GLC/2026/001234',
  'GH20260001234',
  'STATE',
  'PENDING'
);
```

### Test 3: Test PostGIS Functions

```sql
-- Test polygon area calculation
SELECT calculate_land_area_from_polygon(
  ST_GeomFromText('POLYGON((
    -0.1870 5.6037,
    -0.1860 5.6037,
    -0.1860 5.6047,
    -0.1870 5.6047,
    -0.1870 5.6037
  ))', 4326)
) as area_sqm;

-- Test Ghana barcode validation
SELECT validate_ghana_parcel_barcode('GH12345678') as valid;
SELECT validate_ghana_parcel_barcode('INVALID') as invalid;
```

## Step 6: Update Existing Claims (Optional)

If you have existing claims, you may want to add default values:

```sql
-- Set default title type for existing claims
UPDATE public.land_claims
SET 
  title_type = 'LEASEHOLD',
  duration_years = 99,
  mint_status = 'PENDING',
  legal_jurat_flag = false,
  is_litigation_flag = false
WHERE title_type IS NULL;
```

## Rollback Instructions

If you need to rollback the migration:

```sql
-- Drop new tables
DROP TABLE IF EXISTS public.blockchain_minting_log CASCADE;
DROP TABLE IF EXISTS public.traditional_authority_approvals CASCADE;
DROP TABLE IF EXISTS public.surveyor_verifications CASCADE;
DROP TABLE IF EXISTS public.land_litigation_history CASCADE;
DROP TABLE IF EXISTS public.verified_users CASCADE;

-- Drop new columns from land_claims
ALTER TABLE public.land_claims
  DROP COLUMN IF EXISTS title_type,
  DROP COLUMN IF EXISTS duration_years,
  DROP COLUMN IF EXISTS document_serial_number,
  DROP COLUMN IF EXISTS parcel_id_barcode,
  DROP COLUMN IF EXISTS grantor_type,
  DROP COLUMN IF EXISTS witness_signatures_json,
  DROP COLUMN IF EXISTS legal_jurat_flag,
  DROP COLUMN IF EXISTS survey_plan_url,
  DROP COLUMN IF EXISTS polygon_coordinates,
  DROP COLUMN IF EXISTS is_litigation_flag,
  DROP COLUMN IF EXISTS fraud_confidence_score,
  DROP COLUMN IF EXISTS on_chain_hash,
  DROP COLUMN IF EXISTS mint_status,
  DROP COLUMN IF EXISTS traditional_authority_name,
  DROP COLUMN IF EXISTS stool_land_reference,
  DROP COLUMN IF EXISTS family_head_name,
  DROP COLUMN IF EXISTS consent_authority,
  DROP COLUMN IF EXISTS land_use_category,
  DROP COLUMN IF EXISTS encumbrance_details,
  DROP COLUMN IF EXISTS surveyor_license_number,
  DROP COLUMN IF EXISTS survey_date,
  DROP COLUMN IF EXISTS lands_commission_file_number;

-- Drop enum types
DROP TYPE IF EXISTS mint_status CASCADE;
DROP TYPE IF EXISTS grantor_type CASCADE;
DROP TYPE IF EXISTS title_type CASCADE;

-- Drop functions
DROP FUNCTION IF EXISTS validate_ghana_parcel_barcode;
DROP FUNCTION IF EXISTS calculate_land_area_from_polygon;
DROP FUNCTION IF EXISTS check_polygon_overlap;

-- Drop view
DROP VIEW IF EXISTS public.land_claims_detailed;

-- Restore from backup
-- psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

## Common Issues

### Issue 1: PostGIS Extension Not Available

**Error**: `ERROR: type "geometry" does not exist`

**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

If PostGIS is not available in your Supabase project, contact Supabase support or use JSONB for polygon storage:

```sql
-- Alternative without PostGIS
ALTER TABLE public.land_claims
  ALTER COLUMN polygon_coordinates TYPE JSONB USING polygon_coordinates::jsonb;
```

### Issue 2: Foreign Key Constraint Violation

**Error**: `ERROR: foreign key constraint fails`

**Solution**: Ensure `verified_users` table is created before updating `land_claims` foreign keys.

### Issue 3: Enum Type Already Exists

**Error**: `ERROR: type "title_type" already exists`

**Solution**: The migration uses `IF NOT EXISTS` - if you see this error, the migration may have been partially applied. Check which objects exist and apply only the missing parts.

## Performance Considerations

### Indexes

All necessary indexes are created by the migration:
- `idx_land_claims_title_type`
- `idx_land_claims_parcel_barcode`
- `idx_land_claims_fraud_score`
- `idx_land_claims_polygon_geom` (spatial index)

### Query Optimization

For large datasets, consider:

```sql
-- Analyze tables after migration
ANALYZE public.land_claims;
ANALYZE public.verified_users;
ANALYZE public.land_litigation_history;
```

## Next Steps

1. ✅ Review the comprehensive documentation in `docs/WEST_AFRICAN_LEGAL_STANDARDS.md`
2. ✅ Update your claim intake forms to include new fields
3. ✅ Implement West African legal validation logic
4. ✅ Set up blockchain minting workflow
5. ✅ Configure traditional authority approval process

## Support

For issues or questions:
- Check `docs/WEST_AFRICAN_LEGAL_STANDARDS.md` for detailed documentation
- Review `.windsurf/rules/project-standards.md` for coding standards
- Consult the Ghana Lands Commission (LC.gov.gh) for legal requirements

---

**Migration Version**: 002  
**Created**: February 2026  
**Compatibility**: Supabase PostgreSQL 15+, PostGIS 3.3+
