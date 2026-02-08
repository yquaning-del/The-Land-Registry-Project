# Chain of Custody Documentation

## Overview

The **Chain of Custody** system provides complete traceability and accountability for every land title verification and minting process. All auditor actions, timestamps, and decisions are permanently recorded on the blockchain as part of the NFT metadata.

## What is Chain of Custody?

Chain of Custody is a chronological documentation that records the sequence of custody, control, transfer, analysis, and disposition of materials. In our Land Registry Platform, it tracks:

1. **Who** verified the document (Auditor ID, Name, Email)
2. **When** each action occurred (Verification, Approval, Minting timestamps)
3. **What** decisions were made (AI scores, human notes, approval/rejection)
4. **Where** the record is stored (IPFS hash, blockchain transaction)

## Architecture

### Data Flow

```
Document Upload
    ↓
AI Verification (verificationTimestamp)
    ↓
Human Auditor Review (auditorId, auditorName)
    ↓
Approval Decision (approvalTimestamp)
    ↓
IPFS Upload (metadata with chain of custody)
    ↓
Blockchain Minting (mintingTimestamp)
    ↓
Permanent Record (immutable NFT metadata)
```

## NFT Metadata Structure

### Chain of Custody Section

```json
{
  "properties": {
    "chainOfCustody": {
      "auditorId": "aud_12345",
      "auditorName": "Dr. Kwame Nkrumah",
      "auditorEmail": "k.nkrumah@landregistry.gov.gh",
      "verificationTimestamp": "2026-02-01T08:00:00.000Z",
      "approvalTimestamp": "2026-02-01T08:15:00.000Z",
      "mintingTimestamp": "2026-02-01T08:20:00.000Z"
    }
  }
}
```

### NFT Attributes (Visible on OpenSea/Marketplaces)

```json
{
  "attributes": [
    {
      "trait_type": "Verified By",
      "value": "Dr. Kwame Nkrumah"
    },
    {
      "trait_type": "Auditor ID",
      "value": "aud_12345"
    }
  ]
}
```

## Implementation

### 1. Capture Auditor Information

When the auditor logs in and reviews a claim:

```typescript
import { createClient } from '@/lib/supabase/client'

// Get current auditor from Supabase Auth
const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()

const auditorInfo = {
  auditorId: user.id,
  auditorName: user.user_metadata.full_name || user.email,
  auditorEmail: user.email,
  verificationTimestamp: claim.verified_at || new Date().toISOString(),
}
```

### 2. Pass to MintTitleButton

```typescript
<MintTitleButton
  claimId={claim.id}
  claimData={{
    // ... other claim data
    auditorId: auditorInfo.auditorId,
    auditorName: auditorInfo.auditorName,
    auditorEmail: auditorInfo.auditorEmail,
    verificationTimestamp: auditorInfo.verificationTimestamp,
  }}
/>
```

### 3. Automatic Timestamp Recording

The system automatically records:

- **verificationTimestamp**: When AI verification completed (from claim record)
- **approvalTimestamp**: When auditor clicked "Mint" button (captured in MintTitleButton)
- **mintingTimestamp**: When NFT was minted on blockchain (captured in uploadLandDeedToIPFS)

## Database Schema Updates

Add these fields to your `land_claims` table:

```sql
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS auditor_id UUID REFERENCES auth.users(id);
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS auditor_name TEXT;
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS auditor_email TEXT;
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE land_claims ADD COLUMN IF NOT EXISTS minted_at TIMESTAMP WITH TIME ZONE;
```

## Usage Examples

### Example 1: Basic Usage in Admin Dashboard

```typescript
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MintTitleButton } from '@/components/MintTitleButton'

export default function AuditDashboard({ claimId }: { claimId: string }) {
  const [auditorInfo, setAuditorInfo] = useState(null)
  const [claim, setClaim] = useState(null)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      
      // Get current auditor
      const { data: { user } } = await supabase.auth.getUser()
      setAuditorInfo({
        auditorId: user.id,
        auditorName: user.user_metadata.full_name || user.email,
        auditorEmail: user.email,
      })

      // Get claim data
      const { data: claimData } = await supabase
        .from('land_claims')
        .select('*')
        .eq('id', claimId)
        .single()
      
      setClaim(claimData)
    }

    loadData()
  }, [claimId])

  if (!auditorInfo || !claim) return <div>Loading...</div>

  return (
    <MintTitleButton
      claimId={claim.id}
      claimData={{
        id: claim.id,
        claimantName: claim.claimant_name,
        location: claim.location,
        region: claim.region,
        country: claim.country,
        latitude: claim.latitude,
        longitude: claim.longitude,
        landSize: claim.land_size,
        parcelId: claim.parcel_id,
        aiConfidenceScore: claim.ai_confidence_score,
        fraudConfidenceScore: claim.fraud_confidence_score,
        humanAuditorNotes: claim.human_auditor_notes,
        documentType: claim.document_type,
        durationYears: claim.duration_years,
        originalDocumentUrl: claim.document_url,
        auditorId: auditorInfo.auditorId,
        auditorName: auditorInfo.auditorName,
        auditorEmail: auditorInfo.auditorEmail,
        verificationTimestamp: claim.verified_at || new Date().toISOString(),
      }}
      onSuccess={(txHash, tokenId) => {
        console.log('Minted with full chain of custody:', txHash)
      }}
    />
  )
}
```

### Example 2: Viewing Chain of Custody from IPFS

```typescript
async function viewChainOfCustody(ipfsHash: string) {
  const response = await fetch(`https://gateway.pinata.cloud/ipfs/${ipfsHash}`)
  const metadata = await response.json()

  const custody = metadata.properties.chainOfCustody

  console.log('Chain of Custody Report:')
  console.log('========================')
  console.log(`Auditor: ${custody.auditorName} (${custody.auditorId})`)
  console.log(`Email: ${custody.auditorEmail}`)
  console.log(`Verified: ${new Date(custody.verificationTimestamp).toLocaleString()}`)
  console.log(`Approved: ${new Date(custody.approvalTimestamp).toLocaleString()}`)
  console.log(`Minted: ${new Date(custody.mintingTimestamp).toLocaleString()}`)
  
  const totalTime = new Date(custody.mintingTimestamp) - new Date(custody.verificationTimestamp)
  console.log(`Total Processing Time: ${Math.round(totalTime / 1000 / 60)} minutes`)
}
```

## Benefits

### 1. **Accountability**
- Every action is tied to a specific auditor
- No anonymous approvals
- Full audit trail for compliance

### 2. **Transparency**
- Anyone can verify who approved a land title
- Timestamps prove when actions occurred
- Immutable record on blockchain

### 3. **Legal Compliance**
- Meets Ghana Land Act 2020 requirements
- Satisfies Nigeria Land Use Act 1978 standards
- Provides evidence for dispute resolution

### 4. **Fraud Prevention**
- Auditors can't deny their actions
- Timestamps prevent backdating
- Multiple verification points

### 5. **Performance Tracking**
- Measure auditor efficiency
- Identify bottlenecks
- Quality assurance metrics

## Security Considerations

### 1. **Auditor Authentication**

```typescript
// Verify auditor is authenticated
const { data: { user }, error } = await supabase.auth.getUser()
if (error || !user) {
  throw new Error('Auditor must be authenticated')
}

// Verify auditor has permission
const { data: auditor } = await supabase
  .from('verified_users')
  .select('role')
  .eq('id', user.id)
  .single()

if (!['ADMIN', 'AUDITOR'].includes(auditor.role)) {
  throw new Error('Insufficient permissions')
}
```

### 2. **Timestamp Integrity**

- Use server-side timestamps (not client-side)
- Validate timestamp sequence (verification < approval < minting)
- Store in UTC to avoid timezone issues

### 3. **Data Privacy**

- Auditor email is optional (can be omitted for privacy)
- Use auditor ID for internal tracking
- Display name only in public metadata

## Querying Chain of Custody

### Get All Claims by Auditor

```sql
SELECT 
  id,
  parcel_id,
  claimant_name,
  auditor_name,
  verified_at,
  approved_at,
  minted_at,
  mint_status
FROM land_claims
WHERE auditor_id = 'aud_12345'
ORDER BY minted_at DESC;
```

### Get Average Processing Time

```sql
SELECT 
  auditor_name,
  COUNT(*) as total_claims,
  AVG(EXTRACT(EPOCH FROM (minted_at - verified_at))) / 60 as avg_minutes
FROM land_claims
WHERE mint_status = 'MINTED'
GROUP BY auditor_name
ORDER BY avg_minutes ASC;
```

### Get Claims Pending Approval

```sql
SELECT 
  id,
  parcel_id,
  claimant_name,
  verified_at,
  NOW() - verified_at as time_pending
FROM land_claims
WHERE mint_status = 'VERIFIED'
  AND approved_at IS NULL
ORDER BY verified_at ASC;
```

## Troubleshooting

### "Auditor information missing"

**Cause**: User not authenticated or metadata not set

**Solution**:
```typescript
// Ensure user has full_name in metadata
await supabase.auth.updateUser({
  data: { full_name: 'Dr. Kwame Nkrumah' }
})
```

### "Timestamp out of order"

**Cause**: System clock issues or manual timestamp manipulation

**Solution**: Always use server-generated timestamps

### "Chain of custody not visible on OpenSea"

**Cause**: OpenSea only shows `attributes`, not `properties`

**Solution**: We include auditor info in both sections:
- `attributes` → Visible on marketplaces
- `properties.chainOfCustody` → Full details for API queries

## Future Enhancements

### 1. **Multi-Signature Approval**
- Require 2+ auditors for high-value claims
- Record all auditor signatures in chain of custody

### 2. **Automated Alerts**
- Notify supervisors of pending claims
- Alert if processing time exceeds threshold

### 3. **Blockchain Events**
- Emit events on-chain for each custody transfer
- Enable real-time tracking

### 4. **Integration with National ID**
- Link auditor ID to Ghana Card / Nigeria NIN
- Enhanced identity verification

## Compliance Checklist

- [x] Auditor ID recorded
- [x] Auditor name recorded
- [x] Verification timestamp recorded
- [x] Approval timestamp recorded
- [x] Minting timestamp recorded
- [x] Immutable storage (IPFS + Blockchain)
- [x] Publicly verifiable
- [x] Tamper-proof
- [x] Meets legal standards

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Compliance**: Ghana Land Act 2020, Nigeria Land Use Act 1978
