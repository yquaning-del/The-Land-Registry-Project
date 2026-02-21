import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EnhancedVerificationPipeline } from '@/lib/ai/enhanced-verification'
import { isOpenAIConfigured } from '@/lib/ai/openai'
import { rateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'
import { sendVerificationCompleteEmail } from '@/lib/email/sender'

// Allow up to 60 seconds for the GPT-4 Vision pipeline on Vercel
export const maxDuration = 60

type LandClaim = {
  id: string
  ai_verification_status?: string
  original_document_url?: string | null
  latitude?: number | null
  longitude?: number | null
  claimant_name?: string | null
  grantor_name?: string | null
  polygon_coordinates?: any
  title_type?: string | null
  document_type?: string | null
  [key: string]: any
}

function mapAIDocTypeToTitleType(aiDocType: string): string | null {
  const n = aiDocType.toLowerCase().trim()
  // Check more specific patterns first to avoid overlap
  if (/stool\s*indenture/.test(n)) return 'STOOL_INDENTURE'
  if (/family\s*indenture/.test(n)) return 'FAMILY_INDENTURE'
  if (/customary\s*freehold/.test(n)) return 'CUSTOMARY_FREEHOLD'
  if (/certificate\s*of\s*occupancy/.test(n)) return 'CERTIFICATE_OF_OCCUPANCY'
  if (/governor.?s?\s*consent/.test(n)) return 'GOVERNOR_CONSENT'
  if (/deed\s*of\s*assignment/.test(n)) return 'DEED_OF_ASSIGNMENT'
  if (/leasehold|lease/.test(n)) return 'LEASEHOLD'
  if (/freehold/.test(n)) return 'FREEHOLD'
  // Generic indenture fallback after specific checks
  if (/indenture|plan\s*of\s*land/.test(n)) return 'STOOL_INDENTURE'
  if (/land\s*title|land\s*certificate/.test(n)) return 'FREEHOLD'
  console.warn(`[verification] Unrecognized AI document type: "${aiDocType}" — could not map to title_type`)
  return null
}

function mapAIDocTypeToCategory(aiDocType: string): string | null {
  const n = aiDocType.toLowerCase().trim()
  if (/indenture|plan\s*of\s*land|customary\s*freehold/.test(n)) return 'INDENTURE'
  if (/certificate|deed|consent|freehold|leasehold|land\s*title/.test(n)) return 'LAND_TITLE'
  return null
}

// POST - Start verification for a claim
export async function POST(request: NextRequest) {
  // Rate limiting: 10 verification starts per minute per user/IP
  const rlResult = rateLimit(getClientIdentifier(request), { maxRequests: 10, windowMs: 60000 })
  if (!rlResult.success) return rateLimitResponse(rlResult) as unknown as NextResponse

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { claimId } = await request.json()

    if (!claimId) {
      return NextResponse.json({ error: 'Claim ID is required' }, { status: 400 })
    }

    // Get the claim
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .select('*')
      .eq('id', claimId)
      .eq('claimant_id', user.id)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const claimData = claim as LandClaim

    // Check if already verified
    if (claimData.ai_verification_status === 'AI_VERIFIED' || claimData.ai_verification_status === 'APPROVED') {
      return NextResponse.json({ error: 'Claim is already verified' }, { status: 400 })
    }

    // Note: 'PROCESSING' is not in the claim_status enum (migration 010 targeted wrong type).
    // The button's loading state provides sufficient in-progress feedback to the user.
    // A future migration can add PROCESSING to claim_status if a persistent status is needed.

    // Pre-flight: block if an approved/verified claim already exists within ~111 m (±0.001°)
    if (claimData.latitude && claimData.longitude) {
      const delta = 0.001
      const { data: nearby } = await supabase
        .from('land_claims')
        .select('id')
        .neq('id', claimId)
        .in('ai_verification_status', ['APPROVED', 'AI_VERIFIED'])
        .gte('latitude', claimData.latitude - delta)
        .lte('latitude', claimData.latitude + delta)
        .gte('longitude', claimData.longitude - delta)
        .lte('longitude', claimData.longitude + delta)
        .limit(1)

      if (nearby && nearby.length > 0) {
        return NextResponse.json({
          error: 'POTENTIAL_CONFLICT',
          message: 'A verified claim already exists for these coordinates. Please contact the Registry for dispute resolution.',
        }, { status: 409 })
      }
    }

    let result: Awaited<ReturnType<EnhancedVerificationPipeline['execute']>>
    try {
      // Run enhanced AI verification pipeline, injecting the server Supabase client
      // so SpatialConflictService uses authenticated DB queries instead of browser anon client
      const pipeline = new EnhancedVerificationPipeline(supabase)
      result = await pipeline.execute({
        claimId: claimData.id,
        documentUrl: claimData.original_document_url || undefined,
        latitude: claimData.latitude || 0,
        longitude: claimData.longitude || 0,
        claimantName: claimData.claimant_name || undefined,
        grantorName: claimData.grantor_name || undefined,
        polygon: claimData.polygon_coordinates ? {
          coordinates: claimData.polygon_coordinates
        } : undefined,
      })
    } catch (pipelineError) {
      // Revert PROCESSING status so the claim can be retried
      await supabase
        .from('land_claims')
        .update({ ai_verification_status: 'PENDING_VERIFICATION' } as any)
        .eq('id', claimId)
      throw pipelineError
    }

    // Determine final status based on result
    let newStatus: string
    if (result.recommendation === 'AUTO_APPROVE') {
      newStatus = 'AI_VERIFIED'
    } else if (result.recommendation === 'REJECT') {
      newStatus = 'REJECTED'
    } else {
      newStatus = 'PENDING_HUMAN_REVIEW'
    }

    // Map AI-detected document type to title_type enum if not already set
    const aiDetectedType = result.documentAnalysis?.documentType
    const updatePayload: Record<string, any> = {
      ai_verification_status: newStatus,
      ai_confidence_score: result.overallConfidence,
      ai_confidence_level: result.confidenceLevel,
      ai_verification_metadata: {
        ...result,
        aiPowered: result.aiPowered,
        reasoning: result.reasoning,
        fraudDetection: result.fraudDetection,
        tamperingAnalysis: result.tamperingAnalysis,
      },
      ai_verified_at: newStatus === 'AI_VERIFIED' ? new Date().toISOString() : null,
    }

    if (aiDetectedType) {
      if (!claimData.title_type) {
        const mappedTitleType = mapAIDocTypeToTitleType(aiDetectedType)
        if (mappedTitleType) updatePayload.title_type = mappedTitleType
      }
      if (!claimData.document_type) {
        const mappedCategory = mapAIDocTypeToCategory(aiDetectedType)
        if (mappedCategory) updatePayload.document_type = mappedCategory
      }
    }

    // Update claim with verification results
    const { error: updateError } = await supabase
      .from('land_claims')
      .update(updatePayload as any)
      .eq('id', claimId)

    if (updateError) {
      // Revert to PENDING so user can retry rather than leave claim stuck in PROCESSING
      await supabase
        .from('land_claims')
        .update({ ai_verification_status: 'PENDING_VERIFICATION' } as any)
        .eq('id', claimId)
      console.error('Error updating claim with results, reverted to PENDING:', updateError)
      return NextResponse.json({ error: 'Failed to save verification results' }, { status: 500 })
    }

    // Create verification record
    const { error: insertError } = await supabase
      .from('verification_results')
      .insert({
        claim_id: claimId,
        overall_confidence: result.overallConfidence,
        confidence_level: result.confidenceLevel,
        recommendation: result.recommendation,
        document_analysis_score: result.breakdown.documentAnalysis,
        gps_validation_score: result.breakdown.gpsValidation,
        cross_reference_score: result.breakdown.spatialCheck,
        fraud_detection_score: result.breakdown.fraudDetection,
        tampering_check_score: result.breakdown.tamperingCheck,
        reasoning: Array.isArray(result.reasoning) ? result.reasoning : [result.reasoning].filter(Boolean),
        fraud_indicators: result.fraudDetection?.fraudIndicators || [],
      } as any)

    if (insertError) {
      console.error('Failed to insert verification_results record:', insertError)
      // Non-fatal: claim status was already updated successfully
    }

    // Send email notification (non-blocking — don't fail request if email fails)
    if (user.email) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      sendVerificationCompleteEmail(user.email, {
        userName: profile?.full_name || user.email,
        claimId,
        verificationStatus: newStatus,
        confidenceScore: result.overallConfidence,
      }).catch((err: unknown) => console.error('Email notification error:', err))
    }

    return NextResponse.json({
      success: true,
      result: {
        status: newStatus,
        confidence: result.overallConfidence,
        confidenceLevel: result.confidenceLevel,
        recommendation: result.recommendation,
        breakdown: result.breakdown,
        aiPowered: result.aiPowered,
        reasoning: result.reasoning,
        fraudDetection: result.fraudDetection ? {
          isFraudulent: result.fraudDetection.isFraudulent,
          indicators: result.fraudDetection.fraudIndicators,
        } : null,
        executionTimeMs: result.executionTimeMs,
      },
    })
  } catch (error: any) {
    console.error('Verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Verification failed' },
      { status: 500 }
    )
  }
}

// GET - Check if AI is configured
export async function GET() {
  return NextResponse.json({
    aiConfigured: isOpenAIConfigured(),
    features: {
      documentAnalysis: true,
      fraudDetection: isOpenAIConfigured(),
      tamperingDetection: isOpenAIConfigured(),
      gpsValidation: true,
      spatialConflictCheck: true,
    }
  })
}
