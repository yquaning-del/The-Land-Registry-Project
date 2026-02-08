// Pinata IPFS integration using REST API (browser-compatible)
// Note: The @pinata/sdk package uses Node.js 'fs' module which doesn't work in browser/edge

const PINATA_API_URL = 'https://api.pinata.cloud'
const pinataJWT = process.env.PINATA_JWT
const pinataApiKey = process.env.PINATA_API_KEY
const pinataSecretApiKey = process.env.PINATA_API_SECRET

if (!pinataJWT && (!pinataApiKey || !pinataSecretApiKey)) {
  console.warn('Pinata credentials not configured. IPFS uploads will fail.')
}

function getAuthHeaders(): HeadersInit {
  if (pinataJWT) {
    return { Authorization: `Bearer ${pinataJWT}` }
  }
  return {
    pinata_api_key: pinataApiKey || '',
    pinata_secret_api_key: pinataSecretApiKey || '',
  }
}

export interface LandDeedMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string | number
  }[]
  properties: {
    claimId: string
    claimantName: string
    location: string
    coordinates: {
      latitude: number
      longitude: number
    }
    landSize: number
    parcelId: string
    aiConfidenceScore: number
    fraudConfidenceScore: number
    humanAuditorNotes: string
    verificationDate: string
    documentType: string
    durationYears: number
    chainOfCustody: {
      auditorId: string
      auditorName: string
      auditorEmail?: string
      verificationTimestamp: string
      approvalTimestamp: string
      mintingTimestamp: string
    }
  }
}

export interface UploadResult {
  ipfsHash: string
  ipfsUrl: string
  pinataUrl: string
}

export async function uploadFileToIPFS(file: File): Promise<UploadResult> {
  try {
    const formData = new FormData()
    formData.append('file', file)
    
    // Add pinata metadata
    const metadata = JSON.stringify({
      name: file.name,
    })
    formData.append('pinataMetadata', metadata)
    
    // Add pinata options
    const options = JSON.stringify({
      cidVersion: 1,
    })
    formData.append('pinataOptions', options)

    const response = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload to Pinata')
    }

    const result = await response.json()

    return {
      ipfsHash: result.IpfsHash,
      ipfsUrl: `ipfs://${result.IpfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    }
  } catch (error) {
    console.error('Error uploading file to IPFS:', error)
    throw new Error('Failed to upload file to IPFS')
  }
}

export async function uploadJSONToIPFS(metadata: LandDeedMetadata): Promise<UploadResult> {
  try {
    const body = {
      pinataContent: metadata,
      pinataMetadata: {
        name: `${metadata.name} - Metadata`,
      },
      pinataOptions: {
        cidVersion: 1,
      },
    }

    const response = await fetch(`${PINATA_API_URL}/pinning/pinJSONToIPFS`, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to upload JSON to Pinata')
    }

    const result = await response.json()

    return {
      ipfsHash: result.IpfsHash,
      ipfsUrl: `ipfs://${result.IpfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`,
    }
  } catch (error) {
    console.error('Error uploading JSON to IPFS:', error)
    throw new Error('Failed to upload metadata to IPFS')
  }
}

export async function uploadLandDeedToIPFS(
  documentFile: File,
  claimData: {
    id: string
    claimantName: string
    location: string
    region: string
    country: string
    latitude: number
    longitude: number
    landSize: number
    parcelId: string
    aiConfidenceScore: number
    fraudConfidenceScore: number
    humanAuditorNotes: string
    documentType: string
    durationYears: number
    auditorId: string
    auditorName: string
    auditorEmail?: string
    verificationTimestamp: string
    approvalTimestamp: string
  }
): Promise<{ documentHash: string; metadataHash: string; metadataUrl: string }> {
  const documentUpload = await uploadFileToIPFS(documentFile)

  const mintingTimestamp = new Date().toISOString()

  const metadata: LandDeedMetadata = {
    name: `Land Title - ${claimData.parcelId}`,
    description: `Official land title deed for parcel ${claimData.parcelId} in ${claimData.location}, ${claimData.region}, ${claimData.country}. Verified by AI and human auditor ${claimData.auditorName} with ${(claimData.aiConfidenceScore * 100).toFixed(1)}% confidence.`,
    image: documentUpload.ipfsUrl,
    attributes: [
      {
        trait_type: 'Parcel ID',
        value: claimData.parcelId,
      },
      {
        trait_type: 'Location',
        value: `${claimData.location}, ${claimData.region}`,
      },
      {
        trait_type: 'Country',
        value: claimData.country,
      },
      {
        trait_type: 'Land Size (sqm)',
        value: claimData.landSize,
      },
      {
        trait_type: 'AI Confidence Score',
        value: `${(claimData.aiConfidenceScore * 100).toFixed(1)}%`,
      },
      {
        trait_type: 'Fraud Risk Score',
        value: `${(claimData.fraudConfidenceScore * 100).toFixed(1)}%`,
      },
      {
        trait_type: 'Document Type',
        value: claimData.documentType,
      },
      {
        trait_type: 'Duration (Years)',
        value: claimData.durationYears,
      },
      {
        trait_type: 'Verification Status',
        value: 'Human Verified',
      },
      {
        trait_type: 'Verified By',
        value: claimData.auditorName,
      },
      {
        trait_type: 'Auditor ID',
        value: claimData.auditorId,
      },
    ],
    properties: {
      claimId: claimData.id,
      claimantName: claimData.claimantName,
      location: `${claimData.location}, ${claimData.region}, ${claimData.country}`,
      coordinates: {
        latitude: claimData.latitude,
        longitude: claimData.longitude,
      },
      landSize: claimData.landSize,
      parcelId: claimData.parcelId,
      aiConfidenceScore: claimData.aiConfidenceScore,
      fraudConfidenceScore: claimData.fraudConfidenceScore,
      humanAuditorNotes: claimData.humanAuditorNotes,
      verificationDate: new Date().toISOString(),
      documentType: claimData.documentType,
      durationYears: claimData.durationYears,
      chainOfCustody: {
        auditorId: claimData.auditorId,
        auditorName: claimData.auditorName,
        auditorEmail: claimData.auditorEmail,
        verificationTimestamp: claimData.verificationTimestamp,
        approvalTimestamp: claimData.approvalTimestamp,
        mintingTimestamp: mintingTimestamp,
      },
    },
  }

  const metadataUpload = await uploadJSONToIPFS(metadata)

  return {
    documentHash: documentUpload.ipfsHash,
    metadataHash: metadataUpload.ipfsHash,
    metadataUrl: metadataUpload.ipfsUrl,
  }
}

export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch(`${PINATA_API_URL}/data/testAuthentication`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })
    return response.ok
  } catch (error) {
    console.error('Pinata authentication failed:', error)
    return false
  }
}
