import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { EnhancedVerificationPipeline } from '@/lib/ai/enhanced-verification'
import { isOpenAIConfigured } from '@/lib/ai/openai'

type LandClaim = {
  id: string
  ai_verification_status?: string
  original_document_url?: string | null
  latitude?: number | null
  longitude?: number | null
  claimant_name?: string | null
  grantor_name?: string | null
  polygon_coordinates?: any
  [key: string]: any
}

// POST - Start verification for a claim
export async function POST(request: NextRequest) {
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

    // Update status to processing
    await supabase
      .from('land_claims')
      .update({ ai_verification_status: 'PROCESSING' } as any)
      .eq('id', claimId)

    // Run enhanced AI verification pipeline
    const pipeline = new EnhancedVerificationPipeline()
    const result = await pipeline.execute({
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

    // Determine final status based on result
    let newStatus: string
    if (result.recommendation === 'AUTO_APPROVE') {
      newStatus = 'AI_VERIFIED'
    } else if (result.recommendation === 'REJECT') {
      newStatus = 'REJECTED'
    } else {
      newStatus = 'PENDING_HUMAN_REVIEW'
    }

    // Update claim with verification results
    const { error: updateError } = await supabase
      .from('land_claims')
      .update({
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
      } as any)
      .eq('id', claimId)

    if (updateError) {
      console.error('Error updating claim:', updateError)
    }

    // Create verification record
    await supabase
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
        ai_powered: result.aiPowered,
        reasoning: result.reasoning,
      } as any)

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
