import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get verification status for a claim
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const claimId = params.id

    // Get claim with verification status
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .select(`
        id,
        ai_verification_status,
        ai_confidence_score,
        ai_confidence_level,
        ai_verification_metadata,
        ai_verified_at,
        claimant_id
      `)
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Check if user owns this claim or is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const isAdmin = userData && ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(userData.role)
    const isOwner = claim.claimant_id === user.id

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get verification results
    const { data: results } = await supabase
      .from('verification_results')
      .select('*')
      .eq('claim_id', claimId)
      .order('created_at', { ascending: false })
      .limit(1)

    const latestResult = results?.[0] || null

    return NextResponse.json({
      claimId: claim.id,
      status: claim.ai_verification_status,
      confidence: {
        score: claim.ai_confidence_score,
        level: claim.ai_confidence_level,
      },
      verifiedAt: claim.ai_verified_at,
      latestResult: latestResult ? {
        overallConfidence: latestResult.overall_confidence,
        confidenceLevel: latestResult.confidence_level,
        recommendation: latestResult.recommendation,
        breakdown: {
          documentAnalysis: latestResult.document_analysis_score,
          gpsValidation: latestResult.gps_validation_score,
          crossReference: latestResult.cross_reference_score,
        },
        createdAt: latestResult.created_at,
      } : null,
    })
  } catch (error: any) {
    console.error('Error fetching verification status:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}
