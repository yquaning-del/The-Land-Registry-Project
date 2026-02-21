'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/client'

const SingleClaimMap = dynamic(
  () => import('@/components/claims/SingleClaimMap'),
  { ssr: false, loading: () => <div className="h-[280px] bg-slate-800 rounded-lg animate-pulse" /> }
)
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
  ScrollText,
  Ruler,
  Sparkles,
} from 'lucide-react'

interface ClaimDetails {
  id: string
  claimant_id: string
  original_document_url: string
  document_type: string | null
  document_metadata: any
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
  stool_land_reference: string | null
  surveyor_license_number: string | null
  survey_date: string | null
  document_serial_number: string | null
  lands_commission_file_number: string | null
  duration_years: number | null
  polygon_coordinates: number[][] | null
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

function generateVerificationNarrative(claim: ClaimDetails, result: any): string {
  const location = [claim.address, claim.region, claim.country].filter(Boolean).join(', ')
  const titleType = claim.title_type?.replace(/_/g, ' ').toLowerCase() ?? null
  const pct = Math.round((result.confidence ?? 0) * 100)

  const opening = `Your${titleType ? ` ${titleType}` : ''} land claim${location ? ` at ${location}` : ''} was processed through our 5-stage AI verification pipeline.`

  const docScore: number | null = result.breakdown?.documentAnalysis ?? null
  const docSentence =
    docScore !== null && docScore >= 0.65
      ? `The document passed automated analysis with a ${Math.round(docScore * 100)}% authenticity score.`
      : 'The document image could not be retrieved for automated analysis — a specialist will review the original directly.'

  const fraudSentence =
    result.fraudDetection?.isFraudulent
      ? `Potential fraud indicators were flagged: ${(result.fraudDetection.indicators as string[]).join(', ')}.`
      : 'No fraud indicators or spatial conflicts were detected in the registry.'

  const nextStep: Record<string, string> = {
    AI_VERIFIED: `The claim has been AI-verified with ${pct}% confidence and is ready for minting on the blockchain.`,
    PENDING_HUMAN_REVIEW: `The claim has been queued for human review (${pct}% confidence). A verification specialist will assess it within 2–5 business days.`,
    REJECTED: `The claim could not be verified (${pct}% confidence). Please contact support or re-submit with clearer documentation.`,
  }
  const recommendation = nextStep[result.status as string] ?? `Verification complete (${pct}% confidence).`

  return [opening, docSentence, fraudSentence, recommendation].join(' ')
}

export default function ClaimDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [claim, setClaim] = useState<ClaimDetails | null>(null)
  const [verificationResults, setVerificationResults] = useState<VerificationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationResult, setVerificationResult] = useState<any>(null)
  const [stageIndex, setStageIndex] = useState(-1)
  const [conflictAlert, setConflictAlert] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadClaimDetails()
    }
  }, [params.id])

  // Poll for status updates every 5 seconds while verification is running (silent — no spinner)
  useEffect(() => {
    if (!verifying) return
    const interval = setInterval(() => loadClaimDetails(true), 5000)
    return () => clearInterval(interval)
  }, [verifying])

  const loadClaimDetails = async (silent = false) => {
    if (!silent) setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        router.push('/sign-in')
        return
      }

      // Get claim details — filter by claimant_id so users can only see their own claims
      const { data: claimData, error: claimError } = await supabase
        .from('land_claims')
        .select('*')
        .eq('id', params.id)
        .eq('claimant_id', user.id)
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

  // Advance the stage progress animation while the pipeline runs
  useEffect(() => {
    if (!verifying) return
    setStageIndex(0)
    const timers = [
      setTimeout(() => setStageIndex(1), 3000),
      setTimeout(() => setStageIndex(2), 7000),
      setTimeout(() => setStageIndex(3), 11000),
      setTimeout(() => setStageIndex(4), 15000),
    ]
    return () => timers.forEach(clearTimeout)
  }, [verifying])

  const startVerification = async () => {
    if (!claim) return
    setVerifying(true)
    setVerificationError(null)
    setVerificationResult(null)
    setConflictAlert(null)
    setStageIndex(-1)

    try {
      const response = await fetch('/api/verification/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId: claim.id }),
      })

      const data = await response.json()

      if (response.status === 409 && data.error === 'POTENTIAL_CONFLICT') {
        setConflictAlert(data.message)
        return
      }

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed')
      }

      // Show per-stage results from the API response before reloading
      setVerificationResult(data.result)
      setStageIndex(5) // all stages complete
      // Optimistically update status cards from the API response — robust to loadClaimDetails() timing
      setClaim(prev => prev ? {
        ...prev,
        ai_verification_status: data.result.status,
        ai_confidence_score: data.result.confidence,
        ai_confidence_level: data.result.confidenceLevel,
      } : prev)
      await loadClaimDetails() // then sync any other server-updated fields (title_type, etc.)
    } catch (error: any) {
      console.error('Verification error:', error)
      setVerificationError(error.message || 'Verification failed. Please try again.')
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
      case 'REJECTED':
        return <Badge className="bg-red-500"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>
      case 'DISPUTED':
        return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" /> Disputed</Badge>
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
    const barColors: Record<string, string> = {
      HIGH: 'bg-emerald-500',
      MEDIUM: 'bg-yellow-500',
      LOW: 'bg-red-500',
    }
    const pct = (score * 100).toFixed(1)

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge className={colors[level] || 'bg-gray-500'}>{level}</Badge>
          <span className="text-sm font-medium text-gray-700">{pct}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className={`${barColors[level] || 'bg-gray-500'} h-1.5 rounded-full transition-all`}
            style={{ width: `${Math.min(score * 100, 100)}%` }}
          />
        </div>
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
            <div className="flex gap-2 flex-wrap">
              {(claim.ai_verification_status === 'PENDING_VERIFICATION' || claim.ai_verification_status === 'REJECTED') && (
                <div className="flex flex-col items-end gap-1">
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
                  {verifying && (
                    <p className="text-xs text-gray-500">
                      AI pipeline running — this may take up to 60 seconds
                    </p>
                  )}
                </div>
              )}
              {(claim.ai_verification_status === 'AI_VERIFIED' || claim.ai_verification_status === 'APPROVED') && (
                <a
                  href={`/api/claims/${claim.id}/certificate`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                    <Download className="h-4 w-4 mr-2" />
                    Download Certificate
                  </Button>
                </a>
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

        {/* Conflict alert banner */}
        {conflictAlert && (
          <div className="mb-4 p-4 bg-orange-950 border border-orange-500 rounded-xl flex gap-3 items-start">
            <AlertTriangle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-orange-300">Potential Conflict Detected</p>
              <p className="text-sm text-orange-200 mt-1">{conflictAlert}</p>
            </div>
            <button onClick={() => setConflictAlert(null)} className="text-orange-400 hover:text-orange-200 text-lg leading-none">✕</button>
          </div>
        )}

        {/* Verification error banner */}
        {verificationError && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 font-medium">Verification failed</p>
              <p className="text-red-600 text-sm mt-0.5">{verificationError}</p>
            </div>
          </div>
        )}

        {/* Verification Progress Panel */}
        {(verifying || verificationResult) && (
          <div className="mb-6 bg-navy-900 border border-navy-700 rounded-xl overflow-hidden">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-navy-700">
              <div className="flex items-center gap-3">
                {verifying ? (
                  <RefreshCw className="h-5 w-5 text-emerald-400 animate-spin" />
                ) : verificationResult?.recommendation === 'AUTO_APPROVE' ? (
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                ) : verificationResult?.recommendation === 'REJECT' ? (
                  <XCircle className="h-5 w-5 text-red-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
                <span className="font-semibold text-white text-base">
                  {verifying ? 'AI Verification Pipeline Running…' : 'Verification Complete'}
                </span>
                {verificationResult?.aiPowered && (
                  <span className="text-xs bg-purple-900 text-purple-300 border border-purple-700 rounded px-2 py-0.5">
                    GPT-4 Vision
                  </span>
                )}
              </div>
              {!verifying && verificationResult && (
                <button
                  onClick={() => setVerificationResult(null)}
                  className="text-gray-400 hover:text-white text-xs underline"
                >
                  Dismiss
                </button>
              )}
            </div>

            {/* AI Summary — shown once pipeline has completed */}
            {verificationResult && !verifying && (
              <div className="px-5 pt-4">
                <div className="bg-slate-800/60 rounded-lg p-4 border border-blue-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-blue-400 flex-shrink-0" />
                    <span className="text-sm font-semibold text-blue-400">AI Summary</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {generateVerificationNarrative(claim!, verificationResult)}
                  </p>
                </div>
              </div>
            )}

            {/* Land Location Map — shown once pipeline has completed */}
            {verificationResult && !verifying && claim?.latitude && claim?.longitude && (
              <div className="px-5 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span className="text-sm font-semibold text-gray-400">Land Location</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-slate-700">
                  <SingleClaimMap
                    lat={claim.latitude}
                    lng={claim.longitude}
                    polygon={claim.polygon_coordinates as number[][] | null}
                    address={claim.address}
                  />
                </div>
              </div>
            )}

            {/* Stages */}
            <div className="px-5 py-4 space-y-3">
              {[
                { label: 'Document Analysis', key: 'documentAnalysis', description: 'GPT-4 Vision reads and authenticates the land document' },
                { label: 'Fraud Detection', key: 'fraudDetection', description: 'AI checks for identity and title fraud patterns' },
                { label: 'Tampering Detection', key: 'tamperingCheck', description: 'Forensic analysis for digital editing artifacts' },
                { label: 'GPS Validation', key: 'gpsValidation', description: 'Verifies coordinates within valid West Africa bounds' },
                { label: 'Spatial Conflict Check', key: 'spatialCheck', description: 'Scans registry for overlapping land claims' },
              ].map((stage, i) => {
                const score: number | undefined = verificationResult?.breakdown?.[stage.key]
                const isDone = stageIndex > i || (!verifying && verificationResult)
                const isRunning = verifying && stageIndex === i
                const isPending = !isDone && !isRunning

                return (
                  <div key={stage.key} className="flex items-center gap-4">
                    {/* Icon */}
                    <div className="w-7 h-7 flex-shrink-0 flex items-center justify-center rounded-full border">
                      {isRunning ? (
                        <RefreshCw className="h-3.5 w-3.5 text-emerald-400 animate-spin" />
                      ) : isDone ? (
                        score !== undefined && score < 0.5 ? (
                          <XCircle className="h-4 w-4 text-red-400" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        )
                      ) : (
                        <Clock className="h-3.5 w-3.5 text-gray-500" />
                      )}
                    </div>

                    {/* Label + description */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${isPending ? 'text-gray-500' : 'text-white'}`}>
                          {stage.label}
                        </span>
                        {isRunning && (
                          <span className="text-xs text-emerald-400 animate-pulse">Analyzing…</span>
                        )}
                        {isDone && score !== undefined && (
                          <span className={`text-xs font-mono ${score >= 0.7 ? 'text-emerald-400' : score >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {(score * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{stage.description}</p>
                      {/* Score bar */}
                      {isDone && score !== undefined && (
                        <div className="mt-1 h-1 w-full bg-gray-700 rounded-full">
                          <div
                            className={`h-1 rounded-full transition-all duration-700 ${score >= 0.7 ? 'bg-emerald-500' : score >= 0.5 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${Math.min(score * 100, 100)}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Results footer */}
            {verificationResult && !verifying && (
              <div className="px-5 pb-5 space-y-4 border-t border-navy-700 pt-4">
                {/* Overall result */}
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm text-gray-400">Overall Confidence:</span>
                  <span className="text-white font-semibold">
                    {(verificationResult.confidence * 100).toFixed(1)}%
                  </span>
                  <Badge className={
                    verificationResult.recommendation === 'AUTO_APPROVE' ? 'bg-emerald-600' :
                    verificationResult.recommendation === 'REJECT' ? 'bg-red-600' : 'bg-yellow-500'
                  }>
                    {verificationResult.recommendation === 'AUTO_APPROVE' ? '✓ Auto-Approved' :
                     verificationResult.recommendation === 'REJECT' ? '✗ Rejected' :
                     '⟳ Sent for Human Review'}
                  </Badge>
                </div>

                {/* AI Reasoning */}
                {Array.isArray(verificationResult.reasoning) && verificationResult.reasoning.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">AI Reasoning</p>
                    <ul className="space-y-1">
                      {verificationResult.reasoning.map((line: string, idx: number) => (
                        <li key={idx} className="text-sm text-gray-300">{line}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Fraud alerts */}
                {verificationResult.fraudDetection?.isFraudulent && (
                  <div className="bg-red-950 border border-red-700 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-medium mb-1">🚨 Fraud Indicators Detected</p>
                    <ul className="text-xs text-red-300 space-y-0.5">
                      {verificationResult.fraudDetection.indicators?.map((ind: string, i: number) => (
                        <li key={i}>• {ind}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {verifying && (
              <div className="px-5 pb-4 text-xs text-gray-500">
                Pipeline takes 25–60 seconds with GPT-4 Vision · Please keep this page open
              </div>
            )}
          </div>
        )}

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <div className="text-sm text-gray-600 mb-1">Verification Status</div>
              {getStatusBadge(verificationResult?.status ?? claim.ai_verification_status)}
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
              {getConfidenceBadge(
                verificationResult?.confidenceLevel ?? claim.ai_confidence_level,
                verificationResult?.confidence ?? claim.ai_confidence_score
              ) || (
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
                {claim.document_type === 'INDENTURE' ? <ScrollText className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                Document Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">Document Category</div>
                <div className="font-medium">
                  {claim.document_type === 'INDENTURE' ? 'Indenture' : claim.document_type === 'LAND_TITLE' ? 'Land Title / Certificate' : claim.document_type || 'Not specified'}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Title Type</div>
                <div className="font-medium">{claim.title_type?.replace(/_/g, ' ') || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Parcel ID</div>
                <div className="font-medium font-mono">{claim.parcel_id_barcode || claim.document_metadata?.parcelId || 'Not assigned'}</div>
              </div>
              {claim.document_metadata?.ownerName && (
                <div>
                  <div className="text-sm text-gray-600">Owner / Grantee</div>
                  <div className="font-medium">{claim.document_metadata.ownerName}</div>
                </div>
              )}
              {claim.document_serial_number && (
                <div>
                  <div className="text-sm text-gray-600">Document Serial No.</div>
                  <div className="font-medium font-mono">{claim.document_serial_number}</div>
                </div>
              )}
              {claim.lands_commission_file_number && (
                <div>
                  <div className="text-sm text-gray-600">Lands Commission File No.</div>
                  <div className="font-medium font-mono">{claim.lands_commission_file_number}</div>
                </div>
              )}
              {claim.duration_years && (
                <div>
                  <div className="text-sm text-gray-600">Duration</div>
                  <div className="font-medium">{claim.duration_years} years</div>
                </div>
              )}
              {claim.original_document_url && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Document</div>
                  <a
                    href={claim.original_document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 mb-3"
                  >
                    <Download className="h-4 w-4" />
                    Open in New Tab
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  {/* Inline document preview */}
                  {claim.original_document_url.match(/\.(jpe?g|png|webp)(\?|$)/i) ? (
                    <img
                      src={claim.original_document_url}
                      alt="Land document preview"
                      className="mt-2 w-full max-h-64 object-contain rounded border border-gray-200"
                    />
                  ) : (
                    <iframe
                      src={claim.original_document_url}
                      title="Land document preview"
                      className="mt-2 w-full h-64 rounded border border-gray-200"
                    />
                  )}
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

        {/* Grantor Info (Indenture) */}
        {(claim.grantor_type || claim.traditional_authority_name || claim.family_head_name || claim.stool_land_reference) && (
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
                {claim.stool_land_reference && (
                  <div>
                    <div className="text-sm text-gray-600">Stool Land Reference</div>
                    <div className="font-medium">{claim.stool_land_reference}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Survey Info (Indenture) */}
        {(claim.surveyor_license_number || claim.survey_date || claim.document_metadata?.surveyorName) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ruler className="h-5 w-5" />
                Survey Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {claim.document_metadata?.surveyorName && (
                  <div>
                    <div className="text-sm text-gray-600">Surveyor Name</div>
                    <div className="font-medium">{claim.document_metadata.surveyorName}</div>
                  </div>
                )}
                {claim.surveyor_license_number && (
                  <div>
                    <div className="text-sm text-gray-600">License Number</div>
                    <div className="font-medium font-mono">{claim.surveyor_license_number}</div>
                  </div>
                )}
                {claim.survey_date && (
                  <div>
                    <div className="text-sm text-gray-600">Survey Date</div>
                    <div className="font-medium">{new Date(claim.survey_date).toLocaleDateString()}</div>
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
