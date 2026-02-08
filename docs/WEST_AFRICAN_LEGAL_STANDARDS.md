# West African Legal Standards Implementation

## Overview

This document outlines the implementation of Ghana and Nigeria-specific legal requirements for the Land Registry Platform, compliant with:

- **Ghana Land Act 2020**
- **Nigerian Land Use Act 1978**
- **Ghana Lands Commission (LC.gov.gh) Standards**
- **Traditional Land Tenure Systems**

## Database Schema Changes

### Migration: `002_west_african_legal_standards.sql`

#### New Enum Types

```sql
-- Title types recognized in Ghana and Nigeria
CREATE TYPE title_type AS ENUM (
  'CERTIFICATE_OF_OCCUPANCY',      -- Nigeria C of O
  'GOVERNOR_CONSENT',               -- Required for land transfers in Nigeria
  'DEED_OF_ASSIGNMENT',             -- Common transfer document
  'STOOL_INDENTURE',                -- Ghana stool land allocation
  'FAMILY_INDENTURE',               -- Family land allocation
  'FREEHOLD',                       -- Rare in West Africa
  'CUSTOMARY_FREEHOLD',             -- Customary ownership
  'LEASEHOLD'                       -- 99-year leases
);

-- Grantor entity types
CREATE TYPE grantor_type AS ENUM (
  'INDIVIDUAL',
  'STOOL',                          -- Traditional authority (Ghana)
  'FAMILY',                         -- Family head
  'STATE',                          -- Government
  'CORPORATE',
  'TRADITIONAL_AUTHORITY'
);

-- Blockchain minting status
CREATE TYPE mint_status AS ENUM (
  'PENDING',
  'VERIFIED',
  'MINTED',
  'FAILED'
);
```

#### New Tables

##### 1. `verified_users`
Human-in-the-loop audit trail for all verifiers and approvers.

**Key Fields:**
- `professional_license_number` - Surveyor/Legal practitioner license
- `verification_level` - BASIC, ADVANCED, EXPERT
- `verified_by` - Self-referencing for verification chain

##### 2. `land_litigation_history`
Tracks all legal disputes and court cases.

**Key Fields:**
- `case_number` - Court case reference
- `court_name` - Which court is handling the case
- `litigation_type` - Boundary dispute, ownership challenge, etc.
- `judgment_details` - Final court decision (JSONB)

##### 3. `surveyor_verifications`
Licensed surveyor attestations.

**Key Fields:**
- `surveyor_license_number` - Must be valid Ghana/Nigeria license
- `beacon_coordinates` - Physical boundary markers (JSONB)
- `area_calculated_sqm` - Surveyor's measured area

##### 4. `traditional_authority_approvals`
Stool/Family/Chief approvals for customary lands.

**Key Fields:**
- `stool_name` - Name of the stool (e.g., "Ga Mantse Stool")
- `paramount_chief_name` - Chief who approved
- `seal_verified` - Traditional seal/stamp verified

##### 5. `blockchain_minting_log`
Complete audit trail of NFT minting.

**Key Fields:**
- `ipfs_hash` - Document stored on IPFS
- `blockchain_network` - POLYGON, ETHEREUM, etc.
- `transaction_hash` - On-chain transaction ID
- `gas_fee_paid` - Cost of minting

#### Enhanced `land_claims` Table

##### Title Metadata Fields

| Field | Type | Description | Ghana/Nigeria Requirement |
|-------|------|-------------|---------------------------|
| `title_type` | title_type | Type of land title | Required for legal classification |
| `duration_years` | INTEGER | Lease duration (default 99) | Standard in both countries |
| `document_serial_number` | TEXT | Government stamp ID | Physical document verification |
| `parcel_id_barcode` | TEXT | Ghana Land Act 2020 barcode | **Ghana specific** - mandatory for new titles |

##### Stakeholder Verification Fields

| Field | Type | Description |
|-------|------|-------------|
| `grantor_type` | grantor_type | Who is granting the land |
| `witness_signatures_json` | JSONB | Family/stool witnesses metadata |
| `legal_jurat_flag` | BOOLEAN | Thumb-printed document indicator |

**Witness Signatures JSON Structure:**
```json
{
  "witnesses": [
    {
      "name": "Kwame Mensah",
      "id_type": "GHANA_CARD",
      "id_number": "GHA-123456789-0",
      "signature_type": "THUMBPRINT",
      "witness_role": "FAMILY_HEAD",
      "signed_at": "2026-01-15T10:30:00Z"
    }
  ]
}
```

##### Spatial & Fraud Intelligence Fields

| Field | Type | Description |
|-------|------|-------------|
| `survey_plan_url` | TEXT | Licensed surveyor's plan |
| `polygon_coordinates` | GEOMETRY(POLYGON, 4326) | PostGIS polygon (WGS84) |
| `is_litigation_flag` | BOOLEAN | Land under dispute |
| `fraud_confidence_score` | DECIMAL(5,4) | AI fraud detection (0-1) |

**PostGIS Polygon Example:**
```sql
-- Store land parcel as polygon
UPDATE land_claims 
SET polygon_coordinates = ST_GeomFromText(
  'POLYGON((
    -0.1870 5.6037,
    -0.1860 5.6037,
    -0.1860 5.6047,
    -0.1870 5.6047,
    -0.1870 5.6037
  ))', 4326
)
WHERE id = 'claim-uuid';
```

##### Blockchain Integrity Fields

| Field | Type | Description |
|-------|------|-------------|
| `on_chain_hash` | TEXT | IPFS hash for immutable storage |
| `mint_status` | mint_status | NFT minting progress |

##### Additional West African Fields

| Field | Type | Description |
|-------|------|-------------|
| `traditional_authority_name` | TEXT | Chief/Stool name |
| `stool_land_reference` | TEXT | Stool land registry number |
| `family_head_name` | TEXT | Head of family for family lands |
| `consent_authority` | TEXT | Authority that gave consent |
| `land_use_category` | TEXT | Residential, Commercial, Agricultural |
| `encumbrance_details` | JSONB | Mortgages, liens, easements |
| `surveyor_license_number` | TEXT | Licensed surveyor ID |
| `survey_date` | DATE | When survey was conducted |
| `lands_commission_file_number` | TEXT | Ghana Lands Commission reference |

## TypeScript Interfaces

### Core Types

```typescript
// Title types
export type TitleType =
  | 'CERTIFICATE_OF_OCCUPANCY'
  | 'GOVERNOR_CONSENT'
  | 'DEED_OF_ASSIGNMENT'
  | 'STOOL_INDENTURE'
  | 'FAMILY_INDENTURE'
  | 'FREEHOLD'
  | 'CUSTOMARY_FREEHOLD'
  | 'LEASEHOLD'

// Grantor types
export type GrantorType =
  | 'INDIVIDUAL'
  | 'STOOL'
  | 'FAMILY'
  | 'STATE'
  | 'CORPORATE'
  | 'TRADITIONAL_AUTHORITY'

// Minting status
export type MintStatus = 'PENDING' | 'VERIFIED' | 'MINTED' | 'FAILED'
```

### Witness Signature Interface

```typescript
export interface WitnessSignature {
  name: string
  id_type?: string
  id_number?: string
  signature_type: 'DIGITAL' | 'THUMBPRINT' | 'SIGNATURE'
  witness_role: 'FAMILY_HEAD' | 'STOOL_REPRESENTATIVE' | 'LEGAL_WITNESS' | 'OTHER'
  signed_at?: string
}
```

### Encumbrance Interface

```typescript
export interface EncumbranceDetail {
  type: 'MORTGAGE' | 'LIEN' | 'EASEMENT' | 'COVENANT' | 'OTHER'
  description: string
  beneficiary?: string
  amount?: number
  registration_date?: string
  expiry_date?: string
}
```

## Legal Compliance Requirements

### Ghana Land Act 2020 Compliance

1. **Parcel ID Barcode** - All new land registrations must have a unique barcode
2. **Survey Plan** - Must be from a licensed surveyor
3. **Lands Commission File Number** - Official LC.gov.gh reference
4. **Stool Land Approval** - For stool lands, traditional authority approval required
5. **Witness Requirements** - Minimum 2 witnesses for family/stool lands

### Nigeria Land Use Act 1978 Compliance

1. **Certificate of Occupancy** - Primary title document
2. **Governor's Consent** - Required for all land transfers
3. **99-Year Lease** - Standard lease duration
4. **Survey Plan** - Must be approved by Surveyor General
5. **Consent Authority** - State government approval documented

### Thumb-Printed Documents (LC.gov.gh Standards)

When `legal_jurat_flag = true`:
- Document was thumb-printed (common in rural areas)
- Requires additional witness verification
- Legal jurat statement must be present
- Notary public attestation required

## Validation Functions

### Ghana Parcel Barcode Validation

```sql
CREATE FUNCTION validate_ghana_parcel_barcode(barcode TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- Format: 2 letters + 6-10 digits (e.g., "GH12345678")
  RETURN barcode ~ '^[A-Z]{2}[0-9]{6,10}$';
END;
$$ LANGUAGE plpgsql;
```

### Polygon Area Calculation

```sql
CREATE FUNCTION calculate_land_area_from_polygon(poly GEOMETRY)
RETURNS DECIMAL AS $$
BEGIN
  -- Returns area in square meters
  RETURN ST_Area(poly::geography);
END;
$$ LANGUAGE plpgsql;
```

### Overlap Detection

```sql
CREATE FUNCTION check_polygon_overlap(claim_id UUID, poly GEOMETRY)
RETURNS TABLE (
  overlapping_claim_id UUID,
  overlap_area_sqm DECIMAL,
  overlap_percentage DECIMAL
);
```

## AI Verification Enhancements

### Fraud Detection Score

The `fraud_confidence_score` field stores the AI's assessment of potential fraud:

- **0.00 - 0.30**: High fraud risk - Reject
- **0.31 - 0.70**: Medium fraud risk - Human review required
- **0.71 - 1.00**: Low fraud risk - Proceed with verification

### West African Legal Validation Agent

```typescript
export interface WestAfricanLegalValidation {
  titleTypeValid: boolean
  durationYearsValid: boolean
  serialNumberValid: boolean
  parcelBarcodeValid: boolean
  grantorTypeValid: boolean
  witnessRequirementsMet: boolean
  surveyorLicenseValid: boolean
  traditionalAuthorityApproved: boolean
  landsCommissionVerified: boolean
  confidenceScore: number
  validationErrors: string[]
}
```

## Blockchain Integration

### IPFS Document Storage

1. Upload original document to IPFS
2. Store IPFS hash in `on_chain_hash`
3. Include hash in NFT metadata

### NFT Minting Process

1. **Verification Complete** - All checks passed
2. **Prepare Metadata** - Title type, location, legal details
3. **Mint NFT** - Create on-chain token
4. **Update Status** - Set `mint_status = 'MINTED'`
5. **Log Transaction** - Record in `blockchain_minting_log`

### Metadata Structure

```json
{
  "name": "Ghana Land Title - GH12345678",
  "description": "Certificate of Occupancy for Plot 123, Accra",
  "image": "ipfs://QmXxx...",
  "attributes": [
    {
      "trait_type": "Title Type",
      "value": "CERTIFICATE_OF_OCCUPANCY"
    },
    {
      "trait_type": "Country",
      "value": "Ghana"
    },
    {
      "trait_type": "Duration",
      "value": "99 years"
    },
    {
      "trait_type": "Verification Score",
      "value": "0.95"
    }
  ]
}
```

## Usage Examples

### Creating a Claim with West African Fields

```typescript
const claimData = {
  // Basic fields
  documentFile: file,
  latitude: 5.6037,
  longitude: -0.1870,
  country: 'Ghana',
  
  // West African specific
  titleType: 'STOOL_INDENTURE',
  durationYears: 99,
  documentSerialNumber: 'GLC/2026/001234',
  parcelIdBarcode: 'GH20260001234',
  grantorType: 'STOOL',
  
  // Witnesses
  witnessSignatures: [
    {
      name: 'Nana Kwame Osei',
      signature_type: 'THUMBPRINT',
      witness_role: 'STOOL_REPRESENTATIVE',
    }
  ],
  
  // Traditional authority
  traditionalAuthorityName: 'Ga Mantse Stool',
  stoolLandReference: 'GMS-2026-456',
  
  // Survey
  surveyorLicenseNumber: 'GH-SURV-12345',
  surveyDate: '2026-01-15',
  landsCommissionFileNumber: 'LC/ACC/2026/789'
}
```

## Migration Instructions

1. **Backup Database**
   ```bash
   pg_dump -U postgres land_registry > backup.sql
   ```

2. **Run Migration**
   ```sql
   \i supabase/migrations/002_west_african_legal_standards.sql
   ```

3. **Verify Tables Created**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('verified_users', 'land_litigation_history', 
                      'surveyor_verifications', 'traditional_authority_approvals',
                      'blockchain_minting_log');
   ```

4. **Test PostGIS**
   ```sql
   SELECT PostGIS_Version();
   ```

## Security Considerations

- All new tables have Row Level Security (RLS) enabled
- Foreign keys reference `verified_users` for audit trail
- Sensitive fields (witness signatures, encumbrances) stored as JSONB
- Polygon coordinates use PostGIS for spatial queries
- Blockchain hashes are immutable once set

## Future Enhancements

- [ ] Integration with Ghana Lands Commission API
- [ ] Nigeria Surveyor General database sync
- [ ] Automated traditional authority verification
- [ ] Mobile app for field surveyors
- [ ] Satellite imagery overlay on polygons
- [ ] Multi-language support (Twi, Yoruba, Igbo)

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Compliance**: Ghana Land Act 2020, Nigeria Land Use Act 1978
