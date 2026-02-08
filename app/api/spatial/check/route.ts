import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SpatialConflictService } from '@/services/spatialService'
import { Polygon, SpatialCheckRequest } from '@/types/spatial.types'

const spatialService = new SpatialConflictService()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { claimId, polygon, grantorName, documentUrl } = body as SpatialCheckRequest

    // Validate polygon
    if (!polygon || !polygon.coordinates || polygon.coordinates.length < 3) {
      return NextResponse.json(
        { error: 'Invalid polygon: must have at least 3 coordinates' },
        { status: 400 }
      )
    }

    // Validate coordinates format
    for (const coord of polygon.coordinates) {
      if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat and lng must be numbers' },
          { status: 400 }
        )
      }
      if (coord.lat < -90 || coord.lat > 90 || coord.lng < -180 || coord.lng > 180) {
        return NextResponse.json(
          { error: 'Invalid coordinates: lat must be -90 to 90, lng must be -180 to 180' },
          { status: 400 }
        )
      }
    }

    // If claimId provided, verify ownership
    if (claimId) {
      const { data: claim, error: claimError } = await supabase
        .from('land_claims')
        .select('claimant_id')
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
    }

    // Perform comprehensive spatial check
    const result = await spatialService.performSpatialCheck({
      claimId,
      polygon,
      grantorName,
      documentUrl,
    })

    // If HITL required and claimId provided, flag the claim
    if (result.conflictResult.requiresHITL && claimId) {
      await spatialService.flagForHITLAudit(claimId, result.conflictResult)
    }

    // Update claim with spatial check results if claimId provided
    if (claimId) {
      await supabase
        .from('land_claims')
        .update({
          spatial_conflict_status: result.conflictResult.status,
          spatial_check_completed_at: new Date().toISOString(),
          satellite_verification_score: result.satelliteResult?.confidenceScore || null,
          satellite_verified_at: result.satelliteResult?.isValid ? new Date().toISOString() : null,
          satellite_metadata: result.satelliteResult,
        })
        .eq('id', claimId)
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Spatial check error:', error)
    return NextResponse.json(
      { error: error.message || 'Spatial check failed' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get('claimId')

    if (!claimId) {
      return NextResponse.json(
        { error: 'claimId is required' },
        { status: 400 }
      )
    }

    // Get verification progress
    const progress = await spatialService.getVerificationProgress(claimId)

    // Get any existing conflicts
    const { data: conflicts } = await supabase
      .from('spatial_conflicts')
      .select(`
        id,
        conflicting_claim_id,
        overlap_area_sqm,
        overlap_percentage,
        status,
        detected_at
      `)
      .eq('claim_id', claimId)

    return NextResponse.json({
      progress,
      conflicts: conflicts || [],
    })
  } catch (error: any) {
    console.error('Spatial status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get spatial status' },
      { status: 500 }
    )
  }
}
