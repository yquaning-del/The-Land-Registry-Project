'use client'

import { useEffect, useState } from 'react'
import { getContract } from 'thirdweb'
import { useReadContract } from 'thirdweb/react'
import { client } from '@/components/ThirdwebProvider'
import { polygonAmoy } from '@/lib/blockchain'
import { 
  Shield, 
  CheckCircle, 
  MapPin, 
  User, 
  FileText, 
  Calendar,
  ExternalLink,
  Loader2,
  AlertCircle,
  Globe,
  Ruler,
  Award,
  Clock
} from 'lucide-react'

interface VerificationPageProps {
  contractAddress: string
  tokenId: string
}

interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
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

export function VerificationPage({ contractAddress, tokenId }: VerificationPageProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const contract = getContract({
    client,
    chain: polygonAmoy,
    address: contractAddress,
  })

  const { data: tokenURI, isLoading: isLoadingURI } = useReadContract({
    contract,
    method: 'function tokenURI(uint256 tokenId) view returns (string)',
    params: [BigInt(tokenId)],
  })

  useEffect(() => {
    async function fetchMetadata() {
      if (!tokenURI) return

      try {
        setLoading(true)
        setError(null)

        let metadataUrl = tokenURI as string
        
        if (metadataUrl.startsWith('ipfs://')) {
          metadataUrl = metadataUrl.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')
        }

        const response = await fetch(metadataUrl)
        if (!response.ok) {
          throw new Error('Failed to fetch metadata')
        }

        const data = await response.json()
        setMetadata(data)
      } catch (err) {
        console.error('Error fetching metadata:', err)
        setError(err instanceof Error ? err.message : 'Failed to load NFT metadata')
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [tokenURI])

  if (isLoadingURI || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading blockchain verification...</p>
        </div>
      </div>
    )
  }

  if (error || !metadata) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h1>
          <p className="text-gray-600 mb-4">
            {error || 'Unable to load NFT metadata. Please check the contract address and token ID.'}
          </p>
          <div className="bg-gray-50 rounded p-3 text-sm text-left">
            <p className="text-gray-700"><strong>Contract:</strong> {contractAddress}</p>
            <p className="text-gray-700"><strong>Token ID:</strong> {tokenId}</p>
          </div>
        </div>
      </div>
    )
  }

  const { properties, attributes } = metadata
  const { chainOfCustody } = properties

  const polygonscanUrl = `https://amoy.polygonscan.com/token/${contractAddress}?a=${tokenId}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-3">
            <Shield className="h-10 w-10 text-green-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Land Title Verification</h1>
              <p className="text-gray-600">Blockchain-Verified Land Registry</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Verification Badge */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg shadow-lg p-6 mb-8 text-white">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 rounded-full p-4">
              <CheckCircle className="h-12 w-12" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">✓ Verified by Blockchain</h2>
              <p className="text-green-50">
                This land title is permanently recorded on the Polygon blockchain and verified by AI and human auditors.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Land Title Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                Land Title Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Title Name</label>
                  <p className="text-lg font-semibold text-gray-900">{metadata.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Description</label>
                  <p className="text-gray-700">{metadata.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Parcel ID</label>
                    <p className="text-gray-900 font-mono">{properties.parcelId}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Document Type</label>
                    <p className="text-gray-900">{properties.documentType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Owner Information */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <User className="h-6 w-6 text-blue-600" />
                Owner Information
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Claimant Name</label>
                  <p className="text-lg font-semibold text-gray-900">{properties.claimantName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    Location
                  </label>
                  <p className="text-gray-900">{properties.location}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Coordinates: {properties.coordinates.latitude.toFixed(6)}, {properties.coordinates.longitude.toFixed(6)}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Ruler className="h-4 w-4" />
                    Land Size
                  </label>
                  <p className="text-gray-900">{properties.landSize.toLocaleString()} sqm</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500 flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Duration
                  </label>
                  <p className="text-gray-900">{properties.durationYears} years</p>
                </div>
              </div>
            </div>

            {/* Auditor Notes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-6 w-6 text-blue-600" />
                Human Auditor Verification
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Verified By</label>
                  <p className="text-lg font-semibold text-gray-900">{chainOfCustody.auditorName}</p>
                  {chainOfCustody.auditorEmail && (
                    <p className="text-sm text-gray-600">{chainOfCustody.auditorEmail}</p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Auditor Notes</label>
                  <div className="bg-gray-50 rounded p-4 mt-2">
                    <p className="text-gray-700 whitespace-pre-wrap">{properties.humanAuditorNotes}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">AI Confidence</label>
                    <p className="text-2xl font-bold text-green-600">
                      {(properties.aiConfidenceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Fraud Risk</label>
                    <p className="text-2xl font-bold text-red-600">
                      {(properties.fraudConfidenceScore * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chain of Custody */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-6 w-6 text-blue-600" />
                Chain of Custody
              </h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">AI Verification</p>
                    <p className="text-sm text-gray-600">
                      {new Date(chainOfCustody.verificationTimestamp).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-green-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Human Approval</p>
                    <p className="text-sm text-gray-600">
                      {new Date(chainOfCustody.approvalTimestamp).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500">by {chainOfCustody.auditorName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 rounded-full p-2 mt-1">
                    <CheckCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Blockchain Minting</p>
                    <p className="text-sm text-gray-600">
                      {new Date(chainOfCustody.mintingTimestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Document Image */}
            {metadata.image && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Document Image</h3>
                <img
                  src={metadata.image.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                  alt="Land Deed"
                  className="w-full rounded border border-gray-200"
                />
              </div>
            )}

            {/* Blockchain Proof */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Globe className="h-5 w-5 text-blue-600" />
                Blockchain Proof
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Contract Address</label>
                  <p className="text-xs font-mono text-gray-900 break-all">{contractAddress}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Token ID</label>
                  <p className="text-lg font-bold text-gray-900">{tokenId}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Network</label>
                  <p className="text-gray-900">Polygon Amoy Testnet</p>
                </div>

                <a
                  href={polygonscanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  <ExternalLink className="h-5 w-5" />
                  View on PolygonScan
                </a>

                <p className="text-xs text-gray-500 text-center">
                  Verify the mint transaction independently on the blockchain explorer
                </p>
              </div>
            </div>

            {/* Attributes */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Attributes</h3>
              <div className="space-y-2">
                {attributes.map((attr, index) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <span className="text-sm text-gray-600">{attr.trait_type}</span>
                    <span className="text-sm font-medium text-gray-900">{attr.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-600">
          <p className="text-sm">
            This land title is permanently recorded on the blockchain and cannot be altered or deleted.
          </p>
          <p className="text-xs mt-2">
            Powered by Thirdweb, IPFS, and Polygon Network
          </p>
        </div>
      </div>
    </div>
  )
}
