'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  ArrowLeft,
  FileText,
  MapPin,
  Calendar,
  Shield,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Coins,
  Map,
  User,
  Hash,
  Building,
} from 'lucide-react'

interface ClaimDetails {
  id: string
  claimant_id: string
  original_document_url: string
  document_type: string | null
  gps_coordinates: string
  latitude: number
  longitude: number
  land_size_sqm: number | null
  address: string | null
  region: string | null
  country: string
  ai_verification_status: string
  ai_confidence_score: number | null
  ai_confidence_level: string | null
  blockchain_tx_hash: string | null
  nft_token_id: string | null
  minted_at: string | null
  mint_status: string
  title_type: string | null
  parcel_id_barcode: string | null
  grantor_type: string | null
  traditional_authority_name: string | null
  family_head_name: string | null
  created_at: string
  updated_at: string
  verification_result?: any
}

interface VerificationResult {
  id: string
  overall_confidence: number
  confidence_level: string
  recommendation: string
  document_analysis_score: number | null
  gps_validation_score: number | null
  cross_reference_score: number | null
  fraud_detection_score: number | null
  tampering_check_score: number | null
  ai_powered: boolean | null
  reasoning: string[] | null
  created_at: string
}

export default function ClaimDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)

  useEffect(() => {
    if (params.id) {
      loadClaimDetails()
    }
  }, [params.id])

  const loadClaimDetails = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Get claim details
      const { data: claimData, error: claimError } = await supabase
        .from('land_claims')
        .select('*')
        .eq('id', params.id)
        .single()

      if (claimError) throw claimError
      setClaim(claimData)

      // Get verification results
      const { data: resultsData } = await supabase
        .from('verification_results')
        .select('*')
        .eq('claim_id', params.id)
        .order('created_at', { ascending: false })

      setVerificationResults(resultsData || [])
    } catch (error) {
      console.error('Error loading claim:', error)
    } finally {
      setLoading(false)
    }
  }

  const startVerification = async () => {
    if (!claim) return
    setVerifying(true)

    try {
      const response = await fetch('/api/verification/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      // Reload claim details
      await loadClaimDetails()
    } catch (error: any) {
      console.error('Verification error:', error)
      alert(error.message || 'Verification failed')
    } finally {
      setVerifying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_VERIFIED':
      case 'APPROVED':
        return <Badge className="bg-emerald-500"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>
      case 'PENDING_VERIFICATION':
      case 'PENDING':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'PENDING_HUMAN_REVIEW':
        return <Badge className="bg-blue-500"><User className="h-3 w-3 mr-1" /> Human Review</Badge>
      case 'DISPUTED':
      case 'REJECTED':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Disputed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getMintStatusBadge = (status: string) => {
    switch (status) {
      case 'MINTED':
        return <Badge className="bg-purple-500"><Coins className="h-3 w-3 mr-1" /> Minted</Badge>
      case 'VERIFIED':
        return <Badge className="bg-emerald-500"><CheckCircle className="h-3 w-3 mr-1" /> Ready to Mint</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>
      case 'FAILED':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getConfidenceBadge = (level: string | null, score: number | null) => {
    if (!level || score === null) return null
    
    const colors: Record<string, string> = {
      HIGH: 'bg-emerald-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-red-500',
    }

    return (
      <div className="flex items-center gap-2">
        <Badge className={colors[level] || 'bg-gray-500'}>{level}</Badge>
        <span className="text-sm text-gray-600">{(score * 100).toFixed(1)}%</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading claim details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!claim) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-navy-900 mb-2">Claim Not Found</h2>
            <p className="text-gray-600 mb-4">The claim you're looking for doesn't exist or you don't have access.</p>
            <Link href="/claims">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Claims
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/claims" className="text-gray-600 hover:text-navy-900 flex items-center gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Claims
          </Link>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 mb-2">Claim Details</h1>
              <p className="text-gray-600 font-mono text-sm">{claim.id}</p>
            </div>
            <div className="flex gap-2">
              {claim.ai_verification_status === 'PENDING_VERIFICATION' && (
                <Button 
                  onClick={startVerification} 
                  disabled={verifying}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  {verifying ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Start Verification
                    </>
                  )}
                </Button>
              )}
              {claim.mint_status === 'VERIFIED' && (
                <Link href={`/blockchain-ledger/mint?claimId=${claim.id}`}>
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    <Coins className="h-4 w-4 mr-2" />
                    Mint NFT
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-600 mb-1">Verification Status</div>
              {getStatusBadge(claim.ai_verification_status)}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-600 mb-1">Mint Status</div>
              {getMintStatusBadge(claim.mint_status)}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-600 mb-1">AI Confidence</div>
              {getConfidenceBadge(claim.ai_confidence_level, claim.ai_confidence_score) || (
                <span className="text-gray-400">Not verified yet</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Document Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Document Type</div>
                <div className="font-medium">{claim.document_type || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Title Type</div>
                <div className="font-medium">{claim.title_type?.replace(/_/g, ' ') || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Parcel ID</div>
                <div className="font-medium font-mono">{claim.parcel_id_barcode || 'Not assigned'}</div>
              </div>
              {claim.original_document_url && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Document</div>
                  <a 
                    href={claim.original_document_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
                  >
                    <Download className="h-4 w-4" />
                    View Document
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Location Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Address</div>
                <div className="font-medium">{claim.address || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Region</div>
                <div className="font-medium">{claim.region || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Country</div>
                <div className="font-medium">{claim.country}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">GPS Coordinates</div>
                <div className="font-medium font-mono text-sm">
                  {claim.latitude.toFixed(6)}, {claim.longitude.toFixed(6)}
                </div>
              </div>
              {claim.land_size_sqm && (
                <div>
                  <div className="text-sm text-gray-600">Land Size</div>
                  <div className="font-medium">{claim.land_size_sqm.toLocaleString()} sqm</div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grantor Info */}
        {(claim.grantor_type || claim.traditional_authority_name || claim.family_head_name) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Grantor Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {claim.grantor_type && (
                  <div>
                    <div className="text-sm text-gray-600">Grantor Type</div>
                    <div className="font-medium">{claim.grantor_type.replace(/_/g, ' ')}</div>
                  </div>
                )}
                {claim.traditional_authority_name && (
                  <div>
                    <div className="text-sm text-gray-600">Traditional Authority</div>
                    <div className="font-medium">{claim.traditional_authority_name}</div>
                  </div>
                )}
                {claim.family_head_name && (
                  <div>
                    <div className="text-sm text-gray-600">Family Head</div>
                    <div className="font-medium">{claim.family_head_name}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Blockchain Info */}
        {claim.blockchain_tx_hash && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Blockchain Record
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Transaction Hash</div>
                  <a 
                    href={`https://amoy.polygonscan.com/tx/${claim.blockchain_tx_hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
                  >
                    {claim.blockchain_tx_hash.slice(0, 20)}...
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                {claim.nft_token_id && (
                  <div>
                    <div className="text-sm text-gray-600">NFT Token ID</div>
                    <div className="font-mono text-sm">{claim.nft_token_id}</div>
                  </div>
                )}
                {claim.minted_at && (
                  <div>
                    <div className="text-sm text-gray-600">Minted At</div>
                    <div className="font-medium">{new Date(claim.minted_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Verification History */}
        {verificationResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verification History
              </CardTitle>
              <CardDescription>AI verification results for this claim</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationResults.map((result) => (
                  <div key={result.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <Badge className={
                          result.recommendation === 'AUTO_APPROVE' ? 'bg-emerald-500' :
                          result.recommendation === 'HUMAN_REVIEW' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }>
                          {result.recommendation.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(result.created_at).toLocaleString()}
                      </div>
                    </div>
                    {result.ai_powered && (
                      <div className="mb-3">
                        <Badge className="bg-purple-100 text-purple-700 border border-purple-200">
                          🤖 AI-Powered (GPT-4 Vision)
                        </Badge>
                      </div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Overall</div>
                        <div className="font-semibold">{(result.overall_confidence * 100).toFixed(1)}%</div>
                      </div>
                      {result.document_analysis_score !== null && (
                        <div>
                          <div className="text-xs text-gray-500">Document</div>
                          <div className="font-semibold">{(result.document_analysis_score * 100).toFixed(1)}%</div>
                        </div>
                      )}
                      {result.fraud_detection_score !== null && (
                        <div>
                          <div className="text-xs text-gray-500">Fraud Check</div>
                          <div className={`font-semibold ${result.fraud_detection_score < 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {(result.fraud_detection_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {result.tampering_check_score !== null && (
                        <div>
                          <div className="text-xs text-gray-500">Tampering</div>
                          <div className={`font-semibold ${result.tampering_check_score < 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                            {(result.tampering_check_score * 100).toFixed(1)}%
                          </div>
                        </div>
                      )}
                      {result.gps_validation_score !== null && (
                        <div>
                          <div className="text-xs text-gray-500">GPS</div>
                          <div className="font-semibold">{(result.gps_validation_score * 100).toFixed(1)}%</div>
                        </div>
                      )}
                      {result.cross_reference_score !== null && (
                        <div>
                          <div className="text-xs text-gray-500">Spatial</div>
                          <div className="font-semibold">{(result.cross_reference_score * 100).toFixed(1)}%</div>
                        </div>
                      )}
                    </div>
                    {result.reasoning && result.reasoning.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-xs text-gray-500 mb-2">AI Reasoning</div>
                        <ul className="text-sm space-y-1">
                          {result.reasoning.map((reason, idx) => (
                            <li key={idx} className="text-gray-700">{reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timestamps */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Created: {new Date(claim.created_at).toLocaleString()}
              </div>
              <div>
                Updated: {new Date(claim.updated_at).toLocaleString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
