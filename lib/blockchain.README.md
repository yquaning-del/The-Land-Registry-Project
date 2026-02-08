# Blockchain Integration Guide

## Overview

This Land Registry Platform uses **Thirdweb SDK v5** and **Pinata IPFS** to mint land title deeds as NFTs on the **Polygon Amoy Testnet**.

## Architecture

### Flow Diagram

```
User Approves Claim
       ↓
Upload Document to IPFS (Pinata)
       ↓
Create NFT Metadata (JSON)
       ↓
Upload Metadata to IPFS
       ↓
Mint NFT on Polygon Amoy
       ↓
Update Supabase Database
       ↓
NFT Minted Successfully
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install thirdweb @pinata/sdk
```

### 2. Get Thirdweb Client ID

1. Go to [https://thirdweb.com/dashboard](https://thirdweb.com/dashboard)
2. Create a new project or select existing
3. Copy your **Client ID**
4. Add to `.env.local`:

```bash
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_client_id_here
```

### 3. Get Pinata API Keys

1. Go to [https://pinata.cloud](https://pinata.cloud)
2. Sign up for free account
3. Navigate to **API Keys** section
4. Create new API key with permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
5. Copy **JWT Token** (recommended) or **API Key + Secret**
6. Add to `.env.local`:

```bash
PINATA_JWT=your_jwt_token_here
# OR
PINATA_API_KEY=your_api_key_here
PINATA_API_SECRET=your_api_secret_here
```

### 4. Deploy Smart Contract

#### Option A: Use Thirdweb Deploy (Recommended)

```bash
npx thirdweb deploy
```

This will:
- Compile your contract
- Open dashboard to deploy
- Guide you through deployment to Polygon Amoy

#### Option B: Use Pre-deployed Contract

If you already have an NFT contract on Polygon Amoy:

```bash
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...your_contract_address
NEXT_PUBLIC_CHAIN_ID=80002
```

### 5. Get Test MATIC

1. Go to [Polygon Faucet](https://faucet.polygon.technology/)
2. Select **Amoy Testnet**
3. Enter your wallet address
4. Receive test MATIC for gas fees

## Smart Contract Requirements

Your NFT contract must implement the following function:

```solidity
function mintTo(address to, string memory uri) public returns (uint256)
```

### Example Contract (ERC-721)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract LandTitleNFT is ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor() ERC721("Land Title Deed", "LAND") {}

    function mintTo(address to, string memory uri) public onlyOwner returns (uint256) {
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        
        return newTokenId;
    }
}
```

## Environment Variables

Create `.env.local` file:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Thirdweb
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id

# Pinata IPFS
PINATA_JWT=your_pinata_jwt_token

# Smart Contract
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0x...your_contract_address
NEXT_PUBLIC_CHAIN_ID=80002
```

## Usage

### 1. Connect Wallet

```typescript
import { ConnectWalletButton } from '@/components/ConnectWalletButton'

<ConnectWalletButton />
```

### 2. Mint NFT

```typescript
import { MintTitleButton } from '@/components/MintTitleButton'

<MintTitleButton
  claimId={claim.id}
  claimData={{
    id: claim.id,
    claimantName: 'Kofi Mensah',
    location: 'Accra',
    region: 'Greater Accra',
    country: 'Ghana',
    latitude: 5.6037,
    longitude: -0.1870,
    landSize: 5000,
    parcelId: 'GH20260001234',
    aiConfidenceScore: 0.95,
    fraudConfidenceScore: 0.05,
    humanAuditorNotes: 'Verified by auditor',
    documentType: 'Certificate of Occupancy',
    durationYears: 99,
    originalDocumentUrl: '/path/to/document.pdf',
  }}
  onSuccess={(txHash, tokenId) => {
    console.log('Minted!', txHash, tokenId)
  }}
  onError={(error) => {
    console.error('Mint failed:', error)
  }}
/>
```

## NFT Metadata Structure

The minted NFT includes comprehensive metadata:

```json
{
  "name": "Land Title - GH20260001234",
  "description": "Official land title deed for parcel GH20260001234...",
  "image": "ipfs://Qm...document_hash",
  "attributes": [
    {
      "trait_type": "Parcel ID",
      "value": "GH20260001234"
    },
    {
      "trait_type": "Location",
      "value": "Accra, Greater Accra"
    },
    {
      "trait_type": "AI Confidence Score",
      "value": "95.0%"
    }
  ],
  "properties": {
    "claimId": "uuid",
    "claimantName": "Kofi Mensah",
    "coordinates": {
      "latitude": 5.6037,
      "longitude": -0.1870
    },
    "aiConfidenceScore": 0.95,
    "humanAuditorNotes": "Verified by auditor",
    "verificationDate": "2026-02-01T08:00:00Z"
  }
}
```

## Database Updates

After successful minting, the `land_claims` table is updated:

```sql
UPDATE land_claims SET
  on_chain_hash = 'transaction_hash',
  mint_status = 'MINTED',
  ipfs_metadata_hash = 'metadata_cid',
  ipfs_metadata_url = 'ipfs://Qm...',
  minted_at = NOW(),
  minted_by = 'wallet_address'
WHERE id = 'claim_id';
```

## Testing

### 1. Test Pinata Connection

```typescript
import { testPinataConnection } from '@/lib/pinata'

const isConnected = await testPinataConnection()
console.log('Pinata connected:', isConnected)
```

### 2. Test IPFS Upload

```typescript
import { uploadFileToIPFS } from '@/lib/pinata'

const file = new File(['test'], 'test.txt')
const result = await uploadFileToIPFS(file)
console.log('IPFS Hash:', result.ipfsHash)
```

### 3. Test Minting

1. Connect wallet with test MATIC
2. Click "Mint Land Title NFT"
3. Approve transaction in wallet
4. Wait for confirmation
5. Check transaction on [Amoy PolygonScan](https://amoy.polygonscan.com)

## Troubleshooting

### "Pinata credentials not configured"

**Solution**: Add `PINATA_JWT` to `.env.local`

### "NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set"

**Solution**: Add Thirdweb client ID to `.env.local`

### "Failed to upload to IPFS"

**Possible causes**:
- Invalid Pinata credentials
- Network connectivity issues
- File too large (>100MB)

**Solution**: Check Pinata dashboard for API usage and errors

### "Transaction failed"

**Possible causes**:
- Insufficient MATIC for gas
- Contract address incorrect
- Wallet not connected
- Contract function signature mismatch

**Solution**: 
1. Check wallet has test MATIC
2. Verify contract address in `.env.local`
3. Ensure contract has `mintTo` function

### "Database update failed"

**Possible causes**:
- Supabase credentials incorrect
- RLS policies blocking update
- Network issues

**Solution**: Check Supabase logs and RLS policies

## Security Considerations

### Environment Variables

- ✅ **Never commit** `.env.local` to git
- ✅ Use `.env.example` for documentation
- ✅ Rotate API keys regularly
- ✅ Use different keys for dev/prod

### Smart Contract

- ✅ Implement access control (only admin can mint)
- ✅ Add pausable functionality
- ✅ Audit contract before mainnet deployment
- ✅ Use upgradeable contracts for flexibility

### IPFS

- ✅ Pin important files permanently
- ✅ Use multiple IPFS gateways
- ✅ Consider backup to Arweave for permanence
- ✅ Validate file hashes before minting

## Cost Estimates

### Polygon Amoy Testnet (Free)

- Gas fees: **Free** (test MATIC)
- IPFS uploads: **Free** (Pinata free tier: 1GB)

### Polygon Mainnet (Production)

- Gas per mint: ~0.001-0.01 MATIC (~$0.001-$0.01)
- IPFS: Pinata paid plans start at $20/month
- Total per NFT: **~$0.01-$0.05**

## Production Checklist

- [ ] Deploy contract to Polygon Mainnet
- [ ] Update contract address in `.env`
- [ ] Upgrade Pinata to paid plan
- [ ] Set up monitoring and alerts
- [ ] Implement rate limiting
- [ ] Add transaction retry logic
- [ ] Set up backup IPFS gateway
- [ ] Audit smart contract
- [ ] Test with real MATIC
- [ ] Document emergency procedures

## Resources

- [Thirdweb Docs](https://portal.thirdweb.com/)
- [Pinata Docs](https://docs.pinata.cloud/)
- [Polygon Docs](https://docs.polygon.technology/)
- [IPFS Docs](https://docs.ipfs.tech/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Network**: Polygon Amoy Testnet (Chain ID: 80002)
