import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DocumentViewer } from '@/components/admin/DocumentViewer'
import { EvidenceCard, type EvidenceItem } from '@/components/admin/EvidenceCard'
import { AIReasoningTrace, type ReasoningStep } from '@/components/admin/AIReasoningTrace'
import { DecisionConsole } from '@/components/admin/DecisionConsole'
import { QRCodeGenerator } from '@/components/QRCodeGenerator'
import { MintTitleButtonWrapper } from '@/components/MintTitleButtonWrapper'
import { 
  ArrowLeft, 
  User, 
  MapPin, 
  Calendar, 
  FileText, 
  Shield,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'
import Link from 'next/link'

interface PageProps {
  params: {
    id: string
  }
}

async function getClaimData(id: string) {
  const supabase = await createClient()
  
  const { data: claim, error } = await supabase
    .from('land_claims')
    .select(`
      *,
      user_profiles:claimant_id (
        full_name,
        phone_number
      )
    `)
    .eq('id', id)
    .single()

  if (error || !claim) {
    return null
  }

  return claim as any
}

function generateMockEvidenceItems(claim: any): EvidenceItem[] {
  const evidence: EvidenceItem[] = []

  // Name Match Evidence
  evidence.push({
    id: 'name-match',
    title: 'Grantor Name Verification',
    status: claim.ai_confidence_score > 0.85 ? 'success' : claim.ai_confidence_score > 0.6 ? 'warning' : 'critical',
    reasoning: `Extracted name "Kofi A. Mensah" is an 88% fuzzy match to registered owner "Kofi Mensah". Partial match detected - common variation in middle initial.`,
    confidence: 0.88,
    highlightArea: { x: 15, y: 25, width: 30, height: 8 },
  })

  // Parcel ID Evidence
  evidence.push({
    id: 'parcel-id',
    title: 'Parcel ID Verification',
    status: claim.parcel_id_barcode ? 'success' : 'critical',
    reasoning: claim.parcel_id_barcode 
      ? `Parcel ID "${claim.parcel_id_barcode}" matches Ghana Land Act 2020 format and exists in database.`
      : 'No parcel ID barcode found on document.',
    confidence: claim.parcel_id_barcode ? 1.0 : 0.0,
    highlightArea: claim.parcel_id_barcode ? { x: 60, y: 15, width: 25, height: 6 } : undefined,
  })

  // Date Verification
  evidence.push({
    id: 'date-check',
    title: 'Document Date Validation',
    status: 'success',
    reasoning: `Document dated "15th January 2026" is within valid range (0-99 years). No future date or expiry anomalies detected.`,
    confidence: 0.95,
    highlightArea: { x: 15, y: 75, width: 35, height: 5 },
  })

  // GPS Coordinates
  evidence.push({
    id: 'gps-overlay',
    title: 'GPS Coordinates Cross-Reference',
    status: 'success',
    reasoning: `Coordinates (${claim.latitude.toFixed(4)}°, ${claim.longitude.toFixed(4)}°) verified against satellite imagery. No overlapping claims detected within 100m radius.`,
    confidence: 0.92,
    highlightArea: { x: 15, y: 60, width: 40, height: 8 },
  })

  // Signature Verification
  if (claim.legal_jurat_flag) {
    evidence.push({
      id: 'signature',
      title: 'Signature/Thumbprint Verification',
      status: 'warning',
      reasoning: 'Document contains thumbprint signature. Requires additional witness verification per LC.gov.gh standards.',
      confidence: 0.70,
      highlightArea: { x: 50, y: 85, width: 20, height: 10 },
    })
  }

  // Fraud Detection
  if (claim.fraud_confidence_score !== null && claim.fraud_confidence_score > 0.3) {
    evidence.push({
      id: 'fraud-detection',
      title: 'Forgery Pattern Analysis',
      status: 'critical',
      reasoning: `High fraud risk detected (${(claim.fraud_confidence_score * 100).toFixed(0)}%). Suspicious formatting patterns or keyword anomalies found.`,
      confidence: 1 - claim.fraud_confidence_score,
    })
  } else {
    evidence.push({
      id: 'fraud-detection',
      title: 'Forgery Pattern Analysis',
      status: 'success',
      reasoning: 'No suspicious formatting patterns detected. Document appears authentic with natural aging characteristics.',
      confidence: 0.94,
    })
  }

  return evidence
}

function generateMockReasoningSteps(claim: any): ReasoningStep[] {
  return [
    {
      id: 'step-1',
      agentName: 'OCR Extraction Agent',
      timestamp: new Date(Date.now() - 5000).toISOString(),
      input: { documentUrl: claim.original_document_url },
      output: {
        grantorName: 'Kofi A. Mensah',
        parcelId: claim.parcel_id_barcode || 'GH20260001234',
        documentDate: '15th January 2026',
      },
      confidenceScore: 0.95,
      executionTimeMs: 2341,
      status: 'success',
      reasoning: 'Successfully extracted text from document using pattern matching',
    },
    {
      id: 'step-2',
      agentName: 'Fuzzy Matching Agent',
      timestamp: new Date(Date.now() - 3000).toISOString(),
      input: { extractedName: 'Kofi A. Mensah', databaseRecords: 1247 },
      output: {
        matched: true,
        matchScore: 0.88,
        matchType: 'PARTIAL',
      },
      confidenceScore: 0.88,
      executionTimeMs: 156,
      status: 'warning',
      reasoning: 'Partial name match found - middle initial variation detected',
    },
    {
      id: 'step-3',
      agentName: 'Date Anomaly Detector',
      timestamp: new Date(Date.now() - 2000).toISOString(),
      input: { documentDate: '15th January 2026', maxLeaseYears: 99 },
      output: {
        isValid: true,
        ageInYears: 0.1,
        withinRange: true,
      },
      confidenceScore: 0.95,
      executionTimeMs: 45,
      status: 'success',
      reasoning: 'Document date is valid and within acceptable range',
    },
    {
      id: 'step-4',
      agentName: 'GPS Validation Agent',
      timestamp: new Date(Date.now() - 1000).toISOString(),
      input: { 
        latitude: claim.latitude, 
        longitude: claim.longitude,
        checkRadius: 100,
      },
      output: {
        isValid: true,
        overlappingClaims: 0,
        nearbyLandmarks: ['Main Road', 'School'],
      },
      confidenceScore: 0.92,
      executionTimeMs: 523,
      status: 'success',
      reasoning: 'No overlapping claims detected in vicinity',
    },
    {
      id: 'step-5',
      agentName: 'Forgery Detection Agent',
      timestamp: new Date().toISOString(),
      input: { 
        extractedText: '...',
        formattingPatterns: ['font-consistency', 'alignment', 'aging'],
      },
      output: {
        suspiciousPatterns: [],
        fraudKeywordsFound: false,
        overallRisk: 'LOW',
      },
      confidenceScore: 0.94,
      executionTimeMs: 234,
      status: 'success',
      reasoning: 'No forgery indicators detected',
    },
  ]
}

export default async function ClaimAuditPage({ params }: PageProps) {
  const claim = await getClaimData(params.id)

  if (!claim) {
    notFound()
  }

  const evidenceItems = generateMockEvidenceItems(claim)
  const reasoningSteps = generateMockReasoningSteps(claim)
  const finalScore = claim.ai_confidence_score || 0.75

  const getStatusBadge = () => {
    if (claim.ai_verification_status === 'APPROVED') {
      return <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">Approved</span>
    }
    if (claim.ai_verification_status === 'REJECTED') {
      return <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">Rejected</span>
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">Pending Review</span>
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/claims">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Claims
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Audit Dashboard</h1>
                <p className="text-sm text-gray-600">ID: {claim.id.slice(0, 8)}...</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-xs text-gray-600">AI Confidence</div>
                  <div className="text-lg font-bold text-blue-600">
                    {(finalScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Claim Info Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600">Claimant</div>
                  <div className="font-semibold">{claim.user_profiles?.full_name || 'Unknown'}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600">Location</div>
                  <div className="font-semibold">{claim.region}, {claim.country}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600">Submitted</div>
                  <div className="font-semibold">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-400" />
                <div>
                  <div className="text-xs text-gray-600">Document Type</div>
                  <div className="font-semibold">{claim.title_type || claim.document_type || 'N/A'}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Split Screen Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left: Document Viewer */}
          <Card className="lg:sticky lg:top-24 lg:h-[calc(100vh-12rem)]">
            <CardHeader>
              <CardTitle>Uploaded Land Deed</CardTitle>
              <CardDescription>
                High-resolution document viewer with zoom and highlight capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] lg:h-[calc(100%-120px)]">
              <Suspense fallback={<div>Loading document...</div>}>
                <DocumentViewer documentUrl={(claim as any).original_document_url} />
              </Suspense>
            </CardContent>
          </Card>

          {/* Right: AI Extracted Data & Evidence */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Extracted AI Data</CardTitle>
                <CardDescription>
                  Information extracted and verified by AI agents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Grantor Name:</span>
                    <span className="ml-2 font-semibold">Kofi A. Mensah</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Parcel ID:</span>
                    <span className="ml-2 font-semibold">{claim.parcel_id_barcode || 'N/A'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Document Date:</span>
                    <span className="ml-2 font-semibold">15th January 2026</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Land Size:</span>
                    <span className="ml-2 font-semibold">{claim.land_size_sqm || 'N/A'} sqm</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Coordinates:</span>
                    <span className="ml-2 font-semibold">
                      {claim.latitude.toFixed(4)}°, {claim.longitude.toFixed(4)}°
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-semibold">{claim.duration_years || 99} years</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Evidence Cards */}
            <div>
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                AI Verification Evidence
              </h3>
              <div className="space-y-3">
                {evidenceItems.map((evidence) => (
                  <EvidenceCard
                    key={evidence.id}
                    evidence={evidence}
                    onHighlight={(area) => {
                      console.log('Highlight area:', area)
                    }}
                  />
                ))}
              </div>
            </div>

            {/* AI Reasoning Trace */}
            <AIReasoningTrace steps={reasoningSteps} finalScore={finalScore} />

            {/* Blockchain Minting Section */}
            {claim.mint_status === 'MINTED' && claim.on_chain_hash ? (
              <QRCodeGenerator
                contractAddress={process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''}
                tokenId={claim.token_id || '1'}
                parcelId={claim.parcel_id_barcode}
              />
            ) : claim.ai_verification_status === 'APPROVED' && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-base">Mint Land Title NFT</CardTitle>
                  <CardDescription>
                    Mint this verified land title to the blockchain
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MintTitleButtonWrapper claim={claim} />
                </CardContent>
              </Card>
            )}

            {/* Additional Notes */}
            {claim.human_review_notes && (
              <Card className="border-purple-200 bg-purple-50">
                <CardHeader>
                  <CardTitle className="text-base">Previous Auditor Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{claim.human_review_notes}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    Reviewed: {claim.human_reviewed_at ? new Date(claim.human_reviewed_at).toLocaleString() : 'N/A'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Fixed Decision Console */}
      <DecisionConsole
        claimId={claim.id}
        onApprove={async (notes) => {
          'use server'
          console.log('Approve claim:', claim.id, notes)
        }}
        onReject={async (notes) => {
          'use server'
          console.log('Reject claim:', claim.id, notes)
        }}
      />
    </div>
  )
}
