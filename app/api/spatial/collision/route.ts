import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SpatialRegistry } from '@/services/spatialRegistry'

/**
 * POST /api/spatial/collision
 * Check for coordinate collision against existing claims
 * Returns collision status and blocks transaction if overlap > 50%
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const spatialRegistry = new SpatialRegistry()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { coordinates, excludeClaimId, sellerId, indentureUrl } = body

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length < 3) {
      return NextResponse.json(
        { error: 'Valid coordinates array with at least 3 points is required' },
        { status: 400 }
      )
    }

    // Validate coordinate format
    for (const coord of coordinates) {
      if (typeof coord.lat !== 'number' || typeof coord.lng !== 'number') {
        return NextResponse.json(
          { error: 'Each coordinate must have lat and lng as numbers' },
          { status: 400 }
        )
      }
    }

    // Check for collisions
    const collisionResult = await spatialRegistry.checkCoordinateCollision(
      coordinates,
      excludeClaimId
    )

    // If collision detected and has conflicting claims, flag them
    if (collisionResult.hasCollision && collisionResult.conflictingClaims.length > 0) {
      const topConflict = collisionResult.conflictingClaims[0]
      
      // If this is a new claim submission (no excludeClaimId), we need to handle it
      if (!excludeClaimId && collisionResult.alertLevel === 'CRITICAL') {
        // Create admin alert for potential double-sale
        await supabase.from('verification_logs').insert({
          claim_id: topConflict.claimId,
          agent_name: 'CollisionDetectionAPI',
          agent_version: '1.0',
          input_data: {
            newCoordinates: coordinates,
            sellerId,
            userId: user.id,
          },
          output_data: {
            alertType: 'POTENTIAL_DOUBLE_SALE',
            overlapPercentage: collisionResult.overlapPercentage,
            conflictingClaims: collisionResult.conflictingClaims.map(c => c.claimId),
          },
          confidence_score: 1 - (collisionResult.overlapPercentage / 100),
          execution_time_ms: 0,
        })
      }
    }

    // If seller ID and indenture URL provided, create priority hash
    let priorityHash = null
    if (sellerId && indentureUrl && !collisionResult.isBlocked) {
      priorityHash = await spatialRegistry.createPriorityOfSaleHash(
        sellerId,
        indentureUrl
      )
    }

    return NextResponse.json({
      ...collisionResult,
      priorityHash,
      checkedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Collision check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check for collisions' },
      { status: 500 }
    )
  }
}

/**
 * GET /api/spatial/collision
 * Get collision status for an existing claim
 */
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

    // Get claim coordinates
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .select('polygon_coordinates, spatial_conflict_status')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const claimData = claim as any

    if (!claimData.polygon_coordinates) {
      return NextResponse.json({
        hasCollision: false,
        isBlocked: false,
        overlapPercentage: 0,
        conflictingClaims: [],
        message: 'No coordinates found for this claim',
        alertLevel: 'NONE',
      })
    }

    // Parse coordinates and check for collisions
    const coordinates = parsePostGISPolygon(claimData.polygon_coordinates)
    
    if (!coordinates) {
      return NextResponse.json({
        hasCollision: false,
        isBlocked: false,
        overlapPercentage: 0,
        conflictingClaims: [],
        message: 'Unable to parse claim coordinates',
        alertLevel: 'NONE',
      })
    }

    const collisionResult = await spatialRegistry.checkCoordinateCollision(
      coordinates,
      claimId
    )

    return NextResponse.json({
      ...collisionResult,
      currentStatus: claimData.spatial_conflict_status,
      checkedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error('Get collision status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get collision status' },
      { status: 500 }
    )
  }
}

// Helper to parse PostGIS polygon
function parsePostGISPolygon(polygonData: any): { lat: number; lng: number }[] | null {
  if (!polygonData) return null

  try {
    if (polygonData.type === 'Polygon' && polygonData.coordinates) {
      return polygonData.coordinates[0].map((coord: number[]) => ({
        lng: coord[0],
        lat: coord[1],
      }))
    }

    if (typeof polygonData === 'string') {
      const match = polygonData.match(/POLYGON\(\(([^)]+)\)\)/)
      if (match) {
        return match[1].split(',').map(pair => {
          const [lng, lat] = pair.trim().split(' ').map(Number)
          return { lat, lng }
        })
      }
    }

    return null
  } catch (error) {
    return null
  }
}
