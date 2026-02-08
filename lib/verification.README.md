# Public Verification System Documentation

## Overview

The Public Verification System allows anyone to verify the authenticity of a land title NFT without needing a wallet connection or technical knowledge. This creates transparency and trust in the land registry system.

## Architecture

### Components

1. **Verification Page** (`/app/verify/[contractAddress]/[tokenId]/page.tsx`)
   - Public route accessible to anyone
   - No authentication required
   - Fetches NFT metadata from blockchain
   - Displays complete land title information

2. **QR Code Generator** (`/components/QRCodeGenerator.tsx`)
   - Generates QR codes for verification URLs
   - Allows download as PNG
   - Copy URL to clipboard
   - Preview verification page

3. **Admin Integration** (`/app/admin/claims/[id]/page.tsx`)
   - Shows QR code after successful minting
   - Provides mint button for approved claims

## User Flow

```
Land Title Minted
       ↓
Admin Dashboard generates QR Code
       ↓
QR Code printed on physical document
       ↓
User scans QR Code with phone
       ↓
Opens public verification page
       ↓
Displays blockchain-verified information
       ↓
User clicks "View on PolygonScan"
       ↓
Independent verification on blockchain explorer
```

## URL Structure

```
https://yourapp.com/verify/{contractAddress}/{tokenId}

Example:
https://landregistry.gov.gh/verify/0x1234...5678/42
```

### Parameters

- **contractAddress**: The deployed NFT contract address on Polygon
- **tokenId**: The unique token ID of the minted land title NFT

## Features

### 1. Blockchain Badge

```tsx
<div className="bg-gradient-to-r from-green-500 to-emerald-600">
  <CheckCircle />
  ✓ Verified by Blockchain
</div>
```

Shows prominent verification badge indicating blockchain authenticity.

### 2. Land Title Details

Displays:
- Title name
- Description
- Parcel ID
- Document type
- Owner information
- Location with coordinates
- Land size
- Duration

### 3. Chain of Custody

Shows complete audit trail:
- AI Verification timestamp
- Human Approval timestamp
- Blockchain Minting timestamp
- Auditor name and ID

### 4. Blockchain Proof

Provides:
- Contract address
- Token ID
- Network information
- Direct link to PolygonScan

### 5. Document Image

Displays the original land deed document from IPFS.

### 6. NFT Attributes

Shows all metadata attributes in a clean list format.

## QR Code Generation

### Usage in Admin Dashboard

```tsx
import { QRCodeGenerator } from '@/components/QRCodeGenerator'

<QRCodeGenerator
  contractAddress={process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS}
  tokenId={claim.token_id}
  parcelId={claim.parcel_id_barcode}
/>
```

### Features

- **High-quality QR codes** with error correction level H
- **Logo embedding** (optional) for branding
- **Download as PNG** for printing
- **Copy URL** to clipboard
- **Preview page** opens in new tab

### QR Code Settings

```typescript
<QRCodeSVG
  value={verificationUrl}
  size={200}
  level="H"              // High error correction
  includeMargin={true}   // White border
  imageSettings={{       // Optional logo
    src: '/logo.png',
    height: 40,
    width: 40,
    excavate: true
  }}
/>
```

## Security Considerations

### 1. Read-Only Access

- No wallet connection required
- No write operations possible
- Safe for public access

### 2. Data Integrity

- All data fetched directly from blockchain
- Cannot be tampered with
- IPFS ensures document permanence

### 3. Privacy

- Only public blockchain data displayed
- No personal information beyond what's in NFT metadata
- Auditor email is optional

### 4. Rate Limiting

Consider implementing rate limiting for production:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Rate limit verification page requests
  const ip = request.ip || 'unknown'
  // Implement rate limiting logic
}
```

## Implementation Examples

### Example 1: Basic Verification Page

```tsx
// app/verify/[contractAddress]/[tokenId]/page.tsx
import { VerificationPage } from '@/components/VerificationPage'

export default function VerifyPage({ params }) {
  return (
    <VerificationPage
      contractAddress={params.contractAddress}
      tokenId={params.tokenId}
    />
  )
}
```

### Example 2: QR Code in Admin Dashboard

```tsx
// After successful minting
{claim.mint_status === 'MINTED' && (
  <QRCodeGenerator
    contractAddress={NFT_CONTRACT_ADDRESS}
    tokenId={claim.token_id}
    parcelId={claim.parcel_id_barcode}
  />
)}
```

### Example 3: Print QR Code on Document

```tsx
// Generate printable version
const handlePrint = () => {
  const printWindow = window.open('', '', 'width=600,height=600')
  printWindow.document.write(`
    <html>
      <head><title>Land Title QR Code</title></head>
      <body>
        <h2>Scan to Verify</h2>
        <img src="${qrCodeDataUrl}" />
        <p>Parcel ID: ${parcelId}</p>
      </body>
    </html>
  `)
  printWindow.print()
}
```

## Testing

### Test Verification Page

1. Mint a test NFT on Polygon Amoy
2. Get contract address and token ID
3. Visit: `http://localhost:3000/verify/{contract}/{tokenId}`
4. Verify all information displays correctly

### Test QR Code

1. Generate QR code in admin dashboard
2. Download PNG
3. Scan with phone camera
4. Verify it opens correct verification page

### Test Blockchain Link

1. Click "View on PolygonScan"
2. Verify it opens correct transaction
3. Check token details match

## Mobile Optimization

### Responsive Design

```css
/* Verification page is fully responsive */
- Desktop: 3-column layout
- Tablet: 2-column layout
- Mobile: Single column stack
```

### QR Code Scanning

- Works with native camera apps (iOS, Android)
- No special app required
- Instant redirect to verification page

## Error Handling

### Invalid Contract/Token

```tsx
if (error || !metadata) {
  return (
    <div>
      <AlertCircle />
      <h1>Verification Failed</h1>
      <p>Unable to load NFT metadata</p>
    </div>
  )
}
```

### Network Issues

```tsx
if (isLoadingURI || loading) {
  return (
    <div>
      <Loader2 className="animate-spin" />
      <p>Loading blockchain verification...</p>
    </div>
  )
}
```

### IPFS Gateway Fallback

```typescript
let metadataUrl = tokenURI
if (metadataUrl.startsWith('ipfs://')) {
  metadataUrl = metadataUrl.replace(
    'ipfs://',
    'https://gateway.pinata.cloud/ipfs/'
  )
}
```

## Use Cases

### 1. Land Buyer Verification

Buyer scans QR code on physical document to verify:
- Ownership is legitimate
- Document matches blockchain record
- No tampering has occurred

### 2. Government Audits

Officials can quickly verify land titles without:
- Accessing admin systems
- Requiring special permissions
- Needing technical expertise

### 3. Legal Proceedings

Courts can verify land title authenticity:
- Independent verification
- Immutable proof
- Complete audit trail

### 4. Public Records

Citizens can verify land ownership:
- Transparent system
- No intermediaries needed
- Instant verification

## Customization

### Branding

```tsx
// Add your logo to QR code
imageSettings={{
  src: '/your-logo.png',
  height: 40,
  width: 40,
  excavate: true
}}
```

### Color Scheme

```tsx
// Customize verification badge
className="bg-gradient-to-r from-green-500 to-emerald-600"
// Change to your brand colors
```

### Additional Information

```tsx
// Add custom fields to verification page
<div>
  <label>Registration Number</label>
  <p>{properties.customField}</p>
</div>
```

## Analytics

### Track Verification Views

```typescript
// Add analytics to verification page
useEffect(() => {
  // Track page view
  analytics.track('verification_viewed', {
    contractAddress,
    tokenId,
    timestamp: new Date().toISOString()
  })
}, [])
```

### QR Code Scans

```typescript
// Track QR code scans
const handleQRScan = () => {
  analytics.track('qr_code_scanned', {
    parcelId,
    source: 'admin_dashboard'
  })
}
```

## Production Checklist

- [ ] Deploy to production domain
- [ ] Update QR code URLs to production
- [ ] Test on multiple devices
- [ ] Verify IPFS gateway reliability
- [ ] Set up monitoring for verification page
- [ ] Add rate limiting
- [ ] Configure CDN for fast loading
- [ ] Test QR code scanning on iOS/Android
- [ ] Print test QR codes
- [ ] Train staff on QR code usage

## Troubleshooting

### QR Code Not Scanning

**Cause**: Low quality print or damaged code

**Solution**: 
- Increase QR code size
- Use higher DPI for printing
- Ensure good contrast

### Verification Page Slow

**Cause**: IPFS gateway latency

**Solution**:
- Use multiple IPFS gateways
- Implement caching
- Consider Pinata dedicated gateway

### Metadata Not Loading

**Cause**: Invalid token URI or network issues

**Solution**:
- Verify contract address is correct
- Check token ID exists
- Test IPFS gateway directly

## Future Enhancements

### 1. Offline Verification

- Generate signed verification certificates
- Allow offline QR code validation
- Store verification data locally

### 2. Multi-Language Support

- Translate verification page
- Support local languages (Twi, Yoruba, etc.)
- RTL language support

### 3. Advanced Features

- Historical ownership transfer view
- Dispute resolution status
- Property tax payment integration
- Boundary map overlay

### 4. Mobile App

- Dedicated mobile app for scanning
- Push notifications for ownership changes
- Offline verification mode

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Network**: Polygon Amoy Testnet (Chain ID: 80002)
