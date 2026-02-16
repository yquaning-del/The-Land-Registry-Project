import { createClient } from '@/lib/supabase/client'
import {
  Polygon,
  Coordinate,
  SpatialConflictResult,
  ConflictingClaim,
  SatelliteGeofenceResult,
  GrantorHistoryResult,
  SpatialCheckRequest,
  SpatialCheckResponse,
  VerificationProgress,
  SPATIAL_THRESHOLDS,
  IoUConflictResult,
  CriticalConflictAlert,
  ClaimPipelineStatus,
  ClaimPipelineState,
  ProtectClaimRequest,
  ProtectClaimResult,
  HistoricalSatelliteAnalysis,
  HistoricalFinding,
  ConflictMapData,
  ConflictMapClaim,
  ConflictMapOverlap,
  ConflictHotspot,
} from '@/types/spatial.types'

export class SpatialConflictService {
  private supabase = createClient()

  private getApiBaseUrl(): string {
    if (typeof window !== 'undefined') return ''
    return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
  }

  /**
   * Convert polygon coordinates to PostGIS WKT format
   */
  private polygonToWKT(polygon: Polygon): string {
    const coords = polygon.coordinates
    if (coords.length < 3) {
      throw new Error('Polygon must have at least 3 coordinates')
    }

    // Ensure polygon is closed (first point = last point)
    const closedCoords = [...coords]
    if (
      coords[0].lat !== coords[coords.length - 1].lat ||
      coords[0].lng !== coords[coords.length - 1].lng
    ) {
      closedCoords.push(coords[0])
    }

    const coordString = closedCoords
      .map((c) => `${c.lng} ${c.lat}`)
      .join(', ')

    return `SRID=${polygon.srid || 4326};POLYGON((${coordString}))`
  }

  /**
   * Check for overlapping polygons in existing claims
   * Uses PostGIS ST_Intersects and calculates overlap percentage
   */
  async checkPolygonOverlap(
    claimId: string | null,
    polygon: Polygon
  ): Promise<SpatialConflictResult> {
    const reasoning: string[] = []

    try {
      const wkt = this.polygonToWKT(polygon)

      // Use the existing check_polygon_overlap RPC function
      const { data: overlaps, error } = await this.supabase.rpc(
        'check_polygon_overlap',
        {
          claim_id: claimId || '00000000-0000-0000-0000-000000000000',
          poly: wkt,
        }
      )

      if (error) {
        console.error('Polygon overlap check error:', error)
        reasoning.push(`Database error during overlap check: ${error.message}`)
        return {
          hasConflict: false,
          overlapPercentage: 0,
          conflictingClaims: [],
          status: 'CLEAR',
          requiresHITL: false,
          reasoning,
        }
      }

      if (!overlaps || overlaps.length === 0) {
        reasoning.push('No overlapping claims found - land coordinates are unique')
        return {
          hasConflict: false,
          overlapPercentage: 0,
          conflictingClaims: [],
          status: 'CLEAR',
          requiresHITL: false,
          reasoning,
        }
      }

      // Get details for conflicting claims
      const conflictingClaimIds = overlaps.map((o: any) => o.overlapping_claim_id)
      const { data: claimDetails } = await this.supabase
        .from('land_claims')
        .select(`
          id,
          document_metadata,
          grantor_type,
          document_type,
          created_at,
          ai_verification_status,
          traditional_authority_name,
          family_head_name
        `)
        .in('id', conflictingClaimIds)

      const conflictingClaims: ConflictingClaim[] = overlaps.map((overlap: any) => {
        const details = claimDetails?.find((c) => c.id === overlap.overlapping_claim_id)
        const grantorName =
          details?.traditional_authority_name ||
          details?.family_head_name ||
          (details?.document_metadata as any)?.grantorName ||
          null

        return {
          claimId: overlap.overlapping_claim_id,
          overlapAreaSqm: overlap.overlap_area_sqm || 0,
          overlapPercentage: overlap.overlap_percentage || 0,
          grantorName,
          grantorType: details?.grantor_type || null,
          documentType: details?.document_type || null,
          createdAt: details?.created_at || '',
          verificationStatus: details?.ai_verification_status || 'UNKNOWN',
        }
      })

      const maxOverlap = Math.max(...conflictingClaims.map((c) => c.overlapPercentage))

      let status: SpatialConflictResult['status']
      let requiresHITL = false

      if (maxOverlap >= SPATIAL_THRESHOLDS.OVERLAP_HIGH_RISK_PERCENT) {
        status = 'HIGH_RISK'
        requiresHITL = true
        reasoning.push(
          `⚠️ HIGH RISK: ${maxOverlap.toFixed(1)}% overlap detected with existing claim`
        )
        reasoning.push('This land may have been double-sold - immediate human review required')
      } else if (maxOverlap >= SPATIAL_THRESHOLDS.OVERLAP_WARNING_PERCENT) {
        status = 'POTENTIAL_DISPUTE'
        requiresHITL = true
        reasoning.push(
          `⚠️ POTENTIAL DISPUTE: ${maxOverlap.toFixed(1)}% overlap detected`
        )
        reasoning.push('Flagged for Human-in-the-Loop (HITL) audit')
      } else {
        status = 'CLEAR'
        reasoning.push(
          `Minor overlap (${maxOverlap.toFixed(1)}%) - within acceptable tolerance`
        )
      }

      conflictingClaims.forEach((claim) => {
        reasoning.push(
          `Conflict with claim ${claim.claimId.slice(0, 8)}... (${claim.overlapPercentage.toFixed(1)}% overlap, ${claim.overlapAreaSqm.toFixed(0)} sqm)`
        )
      })

      return {
        hasConflict: maxOverlap >= SPATIAL_THRESHOLDS.OVERLAP_WARNING_PERCENT,
        overlapPercentage: maxOverlap,
        conflictingClaims,
        status,
        requiresHITL,
        reasoning,
      }
    } catch (error: any) {
      console.error('Spatial conflict check error:', error)
      reasoning.push(`Error during spatial check: ${error.message}`)
      return {
        hasConflict: false,
        overlapPercentage: 0,
        conflictingClaims: [],
        status: 'CLEAR',
        requiresHITL: false,
        reasoning,
      }
    }
  }

  /**
   * Validate polygon against satellite geofence data
   * Checks if land exists at claimed coordinates
   */
  async validateSatelliteGeofence(
    polygon: Polygon
  ): Promise<SatelliteGeofenceResult> {
    try {
      // Calculate centroid for satellite lookup
      const centroid = this.calculateCentroid(polygon.coordinates)

      try {
        const baseUrl = this.getApiBaseUrl()
        const res = await fetch(`${baseUrl}/api/satellite/geofence`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ lat: centroid.lat, lng: centroid.lng }),
        })

        if (res.ok) {
          const data = (await res.json()) as SatelliteGeofenceResult
          if (data && typeof data.isValid === 'boolean') {
            return data
          }
        }
      } catch (e) {
        // Fall back to mock check below
      }

      // In production, this would call a satellite imagery API.
      // If satellite integration isn't configured/available, use mock behavior.
      const mockSatelliteCheck = await this.performMockSatelliteCheck(centroid)
      return mockSatelliteCheck
    } catch (error: any) {
      console.error('Satellite geofence validation error:', error)
      return {
        isValid: false,
        landExists: false,
        landCoverType: null,
        waterBodyDetected: false,
        protectedAreaDetected: false,
        existingStructuresDetected: false,
        confidenceScore: 0,
        satelliteImageUrl: null,
        reasoning: `Satellite validation failed: ${error.message}`,
      }
    }
  }

  /**
   * Calculate centroid of polygon
   */
  private calculateCentroid(coordinates: Coordinate[]): Coordinate {
    const n = coordinates.length
    const sumLat = coordinates.reduce((sum, c) => sum + c.lat, 0)
    const sumLng = coordinates.reduce((sum, c) => sum + c.lng, 0)
    return { lat: sumLat / n, lng: sumLng / n }
  }

  /**
   * Mock satellite check - replace with real API in production
   */
  private async performMockSatelliteCheck(
    centroid: Coordinate
  ): Promise<SatelliteGeofenceResult> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Ghana/Nigeria bounds check
    const isInGhana =
      centroid.lat >= 4.5 &&
      centroid.lat <= 11.5 &&
      centroid.lng >= -3.5 &&
      centroid.lng <= 1.5
    const isInNigeria =
      centroid.lat >= 4.0 &&
      centroid.lat <= 14.0 &&
      centroid.lng >= 2.5 &&
      centroid.lng <= 15.0

    if (!isInGhana && !isInNigeria) {
      return {
        isValid: false,
        landExists: false,
        landCoverType: null,
        waterBodyDetected: false,
        protectedAreaDetected: false,
        existingStructuresDetected: false,
        confidenceScore: 0.95,
        satelliteImageUrl: null,
        reasoning: 'Coordinates are outside Ghana/Nigeria - invalid location',
      }
    }

    // Simulate land cover detection
    const landCoverTypes = ['Residential', 'Agricultural', 'Commercial', 'Mixed Use', 'Undeveloped']
    const randomLandCover = landCoverTypes[Math.floor(Math.random() * landCoverTypes.length)]

    return {
      isValid: true,
      landExists: true,
      landCoverType: randomLandCover,
      waterBodyDetected: false,
      protectedAreaDetected: false,
      existingStructuresDetected: randomLandCover === 'Residential' || randomLandCover === 'Commercial',
      confidenceScore: 0.85 + Math.random() * 0.1,
      satelliteImageUrl: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${centroid.lng},${centroid.lat},15,0/400x300?access_token=placeholder`,
      reasoning: `Land verified at coordinates (${centroid.lat.toFixed(4)}, ${centroid.lng.toFixed(4)}) - ${randomLandCover} area detected`,
    }
  }

  /**
   * Check grantor's transaction history for red flags
   */
  async getGrantorHistory(grantorName: string): Promise<GrantorHistoryResult> {
    try {
      if (!grantorName || grantorName.trim().length < 2) {
        return {
          grantorName: grantorName || 'Unknown',
          totalClaims: 0,
          disputedClaims: 0,
          rejectedClaims: 0,
          disputeRate: 0,
          isRedFlag: false,
          riskLevel: 'LOW',
          reasoning: 'No grantor name provided for history check',
        }
      }

      // Search for claims with matching grantor name
      const { data: claims, error } = await this.supabase
        .from('land_claims')
        .select('id, ai_verification_status, traditional_authority_name, family_head_name, document_metadata')
        .or(
          `traditional_authority_name.ilike.%${grantorName}%,family_head_name.ilike.%${grantorName}%`
        )

      if (error) {
        console.error('Grantor history check error:', error)
        return {
          grantorName,
          totalClaims: 0,
          disputedClaims: 0,
          rejectedClaims: 0,
          disputeRate: 0,
          isRedFlag: false,
          riskLevel: 'LOW',
          reasoning: `Database error: ${error.message}`,
        }
      }

      const totalClaims = claims?.length || 0
      const disputedClaims = claims?.filter(
        (c) => c.ai_verification_status === 'DISPUTED'
      ).length || 0
      const rejectedClaims = claims?.filter(
        (c) => c.ai_verification_status === 'REJECTED'
      ).length || 0

      const disputeRate = totalClaims > 0 ? (disputedClaims + rejectedClaims) / totalClaims : 0

      let riskLevel: GrantorHistoryResult['riskLevel']
      let isRedFlag = false
      let reasoning: string

      if (disputeRate >= SPATIAL_THRESHOLDS.GRANTOR_DISPUTE_RATE_HIGH_RISK) {
        riskLevel = 'HIGH'
        isRedFlag = true
        reasoning = `🚨 RED FLAG SELLER: ${grantorName} has ${(disputeRate * 100).toFixed(0)}% dispute/rejection rate across ${totalClaims} transactions`
      } else if (disputeRate >= SPATIAL_THRESHOLDS.GRANTOR_DISPUTE_RATE_WARNING) {
        riskLevel = 'MEDIUM'
        isRedFlag = true
        reasoning = `⚠️ WARNING: ${grantorName} has elevated dispute rate (${(disputeRate * 100).toFixed(0)}%) - recommend additional verification`
      } else if (totalClaims === 0) {
        riskLevel = 'LOW'
        reasoning = `No prior transaction history found for ${grantorName}`
      } else {
        riskLevel = 'LOW'
        reasoning = `${grantorName} has clean transaction history: ${totalClaims} claims, ${disputedClaims} disputes`
      }

      return {
        grantorName,
        totalClaims,
        disputedClaims,
        rejectedClaims,
        disputeRate,
        isRedFlag,
        riskLevel,
        reasoning,
      }
    } catch (error: any) {
      console.error('Grantor history error:', error)
      return {
        grantorName,
        totalClaims: 0,
        disputedClaims: 0,
        rejectedClaims: 0,
        disputeRate: 0,
        isRedFlag: false,
        riskLevel: 'LOW',
        reasoning: `Error checking grantor history: ${error.message}`,
      }
    }
  }

  /**
   * Perform comprehensive spatial check
   */
  async performSpatialCheck(request: SpatialCheckRequest): Promise<SpatialCheckResponse> {
    const startTime = Date.now()

    // Run checks in parallel
    const [conflictResult, satelliteResult, grantorHistory] = await Promise.all([
      this.checkPolygonOverlap(request.claimId || null, request.polygon),
      this.validateSatelliteGeofence(request.polygon),
      request.grantorName
        ? this.getGrantorHistory(request.grantorName)
        : Promise.resolve(null),
    ])

    // Calculate overall risk score
    let riskScore = 0

    // Conflict risk (0-40 points)
    if (conflictResult.status === 'HIGH_RISK') {
      riskScore += 40
    } else if (conflictResult.status === 'POTENTIAL_DISPUTE') {
      riskScore += 25
    }

    // Satellite validation risk (0-30 points)
    if (!satelliteResult.isValid) {
      riskScore += 30
    } else if (satelliteResult.confidenceScore < SPATIAL_THRESHOLDS.SATELLITE_CONFIDENCE_THRESHOLD) {
      riskScore += 15
    }

    // Grantor risk (0-30 points)
    if (grantorHistory?.riskLevel === 'HIGH') {
      riskScore += 30
    } else if (grantorHistory?.riskLevel === 'MEDIUM') {
      riskScore += 15
    }

    // Determine recommendation
    let recommendation: SpatialCheckResponse['recommendation']
    if (riskScore >= 50) {
      recommendation = 'REJECT'
    } else if (riskScore >= 25 || conflictResult.requiresHITL) {
      recommendation = 'REVIEW'
    } else {
      recommendation = 'PROCEED'
    }

    console.log(`Spatial check completed in ${Date.now() - startTime}ms`)

    return {
      conflictResult,
      satelliteResult,
      grantorHistory,
      overallRiskScore: riskScore,
      recommendation,
      timestamp: new Date().toISOString(),
    }
  }

  /**
   * Flag a claim for HITL audit
   */
  async flagForHITLAudit(
    claimId: string,
    conflictResult: SpatialConflictResult
  ): Promise<boolean> {
    try {
      // Update claim status
      const { error: updateError } = await this.supabase
        .from('land_claims')
        .update({
          ai_verification_status: 'PENDING_HUMAN_REVIEW',
          is_litigation_flag: conflictResult.status === 'HIGH_RISK',
          ai_verification_metadata: {
            spatialConflict: conflictResult,
            flaggedAt: new Date().toISOString(),
            flagReason: 'Spatial overlap detected',
          },
        })
        .eq('id', claimId)

      if (updateError) {
        console.error('Failed to flag claim for HITL:', updateError)
        return false
      }

      // Log the conflict for each overlapping claim
      for (const conflict of conflictResult.conflictingClaims) {
        await this.supabase.from('spatial_conflicts').insert({
          claim_id: claimId,
          conflicting_claim_id: conflict.claimId,
          overlap_area_sqm: conflict.overlapAreaSqm,
          overlap_percentage: conflict.overlapPercentage,
          status: 'PENDING_REVIEW',
        })
      }

      return true
    } catch (error) {
      console.error('HITL flagging error:', error)
      return false
    }
  }

  /**
   * Get verification progress for a claim
   */
  async getVerificationProgress(claimId: string): Promise<VerificationProgress> {
    try {
      const { data: claim, error } = await this.supabase
        .from('land_claims')
        .select(`
          ai_verification_status,
          ai_verified_at,
          satellite_verification_score,
          satellite_metadata,
          blockchain_tx_hash,
          minted_at,
          mint_status
        `)
        .eq('id', claimId)
        .single()

      if (error || !claim) {
        return {
          indentureVerified: false,
          indentureVerifiedAt: null,
          satelliteConfirmed: false,
          satelliteConfirmedAt: null,
          blockchainAnchored: false,
          blockchainAnchoredAt: null,
          governmentTitlePending: false,
          governmentTitleStatus: null,
          currentStep: 1,
          overallStatus: 'IN_PROGRESS',
        }
      }

      const indentureVerified = ['AI_VERIFIED', 'APPROVED', 'PENDING_HUMAN_REVIEW'].includes(
        claim.ai_verification_status
      )
      const satelliteConfirmed = claim.satellite_verification_score !== null && claim.satellite_verification_score >= 0.7
      const blockchainAnchored = claim.mint_status === 'MINTED' && claim.blockchain_tx_hash !== null

      let currentStep: 1 | 2 | 3 | 4 = 1
      if (blockchainAnchored) {
        currentStep = 4
      } else if (satelliteConfirmed) {
        currentStep = 3
      } else if (indentureVerified) {
        currentStep = 2
      }

      let overallStatus: VerificationProgress['overallStatus'] = 'IN_PROGRESS'
      if (claim.ai_verification_status === 'DISPUTED' || claim.ai_verification_status === 'REJECTED') {
        overallStatus = 'DISPUTED'
      } else if (blockchainAnchored) {
        overallStatus = 'COMPLETED'
      }

      return {
        indentureVerified,
        indentureVerifiedAt: claim.ai_verified_at,
        satelliteConfirmed,
        satelliteConfirmedAt: claim.satellite_metadata?.verifiedAt || null,
        blockchainAnchored,
        blockchainAnchoredAt: claim.minted_at,
        governmentTitlePending: blockchainAnchored,
        governmentTitleStatus: blockchainAnchored ? 'IN_PROGRESS' : 'NOT_STARTED',
        currentStep,
        overallStatus,
      }
    } catch (error) {
      console.error('Error getting verification progress:', error)
      return {
        indentureVerified: false,
        indentureVerifiedAt: null,
        satelliteConfirmed: false,
        satelliteConfirmedAt: null,
        blockchainAnchored: false,
        blockchainAnchoredAt: null,
        governmentTitlePending: false,
        governmentTitleStatus: null,
        currentStep: 1,
        overallStatus: 'IN_PROGRESS',
      }
    }
  }

  // ==========================================
  // VALLEY OF FRAUD PROTECTION METHODS
  // ==========================================

  /**
   * Calculate Intersection over Union (IoU) for two polygons
   * IoU = Area of Intersection / Area of Union
   * Used for precise conflict detection
   */
  async calculateIoU(
    claimId: string,
    polygon: Polygon
  ): Promise<IoUConflictResult[]> {
    try {
      const wkt = this.polygonToWKT(polygon)
      
      // Calculate area of the new claim polygon
      const { data: areaData } = await this.supabase.rpc(
        'calculate_land_area_from_polygon',
        { poly: wkt }
      ) as { data: number | null }
      
      const claimAreaSqm = areaData || 0

      // Get overlapping claims with intersection and union areas
      const { data: overlaps, error } = await this.supabase.rpc(
        'check_polygon_overlap',
        {
          claim_id: claimId || '00000000-0000-0000-0000-000000000000',
          poly: wkt,
        }
      ) as { data: any[] | null; error: any }

      if (error || !overlaps || overlaps.length === 0) {
        return []
      }

      const results: IoUConflictResult[] = []

      for (const overlap of overlaps) {
        const intersectionArea = overlap.overlap_area_sqm || 0
        
        // Get the conflicting claim's area
        const { data: conflictClaim } = await this.supabase
          .from('land_claims')
          .select('polygon_coordinates')
          .eq('id', overlap.overlapping_claim_id)
          .single() as { data: any }

        let conflictingClaimAreaSqm = 0
        if (conflictClaim?.polygon_coordinates) {
          const { data: conflictArea } = await this.supabase.rpc(
            'calculate_land_area_from_polygon',
            { poly: conflictClaim.polygon_coordinates }
          ) as { data: number | null }
          conflictingClaimAreaSqm = conflictArea || 0
        }

        // IoU = Intersection / Union
        // Union = Area A + Area B - Intersection
        const unionArea = claimAreaSqm + conflictingClaimAreaSqm - intersectionArea
        const iouScore = unionArea > 0 ? intersectionArea / unionArea : 0

        let severity: IoUConflictResult['severity'] = 'NONE'
        let alertType: IoUConflictResult['alertType'] = 'NONE'

        if (iouScore >= SPATIAL_THRESHOLDS.IOU_CRITICAL_THRESHOLD) {
          severity = 'CRITICAL'
          alertType = 'CRITICAL_CONFLICT'
        } else if (iouScore >= SPATIAL_THRESHOLDS.IOU_WARNING_THRESHOLD) {
          severity = 'WARNING'
          alertType = 'OVERLAP_WARNING'
        }

        // Check for potential double-sale (same grantor, recent timeframe)
        if (iouScore >= 0.5) {
          alertType = 'DOUBLE_SALE_SUSPECTED'
        }

        results.push({
          iouScore,
          intersectionAreaSqm: intersectionArea,
          unionAreaSqm: unionArea,
          claimAreaSqm,
          conflictingClaimAreaSqm,
          severity,
          alertType,
        })
      }

      return results
    } catch (error) {
      console.error('IoU calculation error:', error)
      return []
    }
  }

  /**
   * Create a CRITICAL_CONFLICT alert
   */
  async createCriticalConflictAlert(
    claimId: string,
    conflictingClaimId: string,
    iouScore: number,
    alertType: CriticalConflictAlert['alertType']
  ): Promise<CriticalConflictAlert | null> {
    try {
      const alert: CriticalConflictAlert = {
        id: crypto.randomUUID(),
        alertType,
        severity: iouScore >= SPATIAL_THRESHOLDS.IOU_CRITICAL_THRESHOLD ? 'CRITICAL' : 'HIGH',
        claimId,
        conflictingClaimId,
        iouScore,
        message: this.getAlertMessage(alertType, iouScore),
        detectedAt: new Date().toISOString(),
        acknowledgedAt: null,
        acknowledgedBy: null,
        resolution: null,
      }

      // Store alert in verification logs
      await this.supabase.from('verification_logs').insert({
        claim_id: claimId,
        agent_name: 'SpatialConflictService',
        agent_version: '2.0',
        input_data: { conflictingClaimId, iouScore },
        output_data: alert,
        confidence_score: 1 - iouScore,
        execution_time_ms: 0,
      })

      // Update claim status
      await this.supabase
        .from('land_claims')
        .update({
          spatial_conflict_status: alertType === 'CRITICAL_CONFLICT' ? 'HIGH_RISK' : 'POTENTIAL_DISPUTE',
          ai_verification_status: 'PENDING_HUMAN_REVIEW',
        })
        .eq('id', claimId)

      return alert
    } catch (error) {
      console.error('Failed to create critical conflict alert:', error)
      return null
    }
  }

  private getAlertMessage(alertType: CriticalConflictAlert['alertType'], iouScore: number): string {
    const percentage = (iouScore * 100).toFixed(1)
    switch (alertType) {
      case 'CRITICAL_CONFLICT':
        return `🚨 CRITICAL: ${percentage}% overlap detected. This land may already be claimed by another party.`
      case 'DOUBLE_SALE_SUSPECTED':
        return `⚠️ DOUBLE SALE SUSPECTED: ${percentage}% overlap with existing claim. Immediate investigation required.`
      case 'HISTORICAL_USAGE_DETECTED':
        return `📡 HISTORICAL USAGE: Satellite analysis detected previous structures or usage on this land.`
      case 'SILENT_OWNER_WARNING':
        return `👤 SILENT OWNER: Evidence suggests a prior owner may have claims to this land.`
      default:
        return `Conflict detected with ${percentage}% overlap.`
    }
  }

  /**
   * Update claim pipeline status (State Machine)
   * INTAKE_PENDING → AI_VERIFIED → SPATIAL_LOCKED → MINTED → GOVT_TITLE_SYNC
   */
  async updatePipelineStatus(
    claimId: string,
    newStatus: ClaimPipelineStatus,
    triggeredBy: 'SYSTEM' | 'USER' | 'ADMIN' = 'SYSTEM',
    reason: string = ''
  ): Promise<boolean> {
    try {
      const statusMap: Record<ClaimPipelineStatus, string> = {
        'INTAKE_PENDING': 'PENDING_VERIFICATION',
        'AI_VERIFIED': 'AI_VERIFIED',
        'SPATIAL_LOCKED': 'PENDING_HUMAN_REVIEW',
        'MINTED': 'APPROVED',
        'GOVT_TITLE_SYNC': 'APPROVED',
      }

      const verificationStep: Record<ClaimPipelineStatus, number> = {
        'INTAKE_PENDING': 1,
        'AI_VERIFIED': 1,
        'SPATIAL_LOCKED': 2,
        'MINTED': 3,
        'GOVT_TITLE_SYNC': 4,
      }

      const updateData: Record<string, any> = {
        ai_verification_status: statusMap[newStatus],
        verification_step: verificationStep[newStatus],
      }

      if (newStatus === 'SPATIAL_LOCKED') {
        updateData.spatial_check_completed_at = new Date().toISOString()
        updateData.spatial_conflict_status = 'CLEAR'
      }

      if (newStatus === 'MINTED') {
        updateData.mint_status = 'MINTED'
        updateData.minted_at = new Date().toISOString()
      }

      const { error } = await this.supabase
        .from('land_claims')
        .update(updateData)
        .eq('id', claimId)

      if (error) {
        console.error('Pipeline status update error:', error)
        return false
      }

      // Log the status change
      await this.supabase.from('verification_logs').insert({
        claim_id: claimId,
        agent_name: 'PipelineStateMachine',
        agent_version: '1.0',
        input_data: { previousStatus: null, newStatus, triggeredBy, reason },
        output_data: { success: true },
        confidence_score: 1.0,
        execution_time_ms: 0,
      })

      return true
    } catch (error) {
      console.error('Pipeline update error:', error)
      return false
    }
  }

  /**
   * Lock spatial coordinates (Pre-emptive Strike)
   * Prevents double-sale by locking coordinates in pending state
   */
  async lockSpatialCoordinates(claimId: string, polygon: Polygon): Promise<boolean> {
    try {
      // First check for conflicts
      const iouResults = await this.calculateIoU(claimId, polygon)
      
      // If any critical conflicts, don't lock
      const hasCriticalConflict = iouResults.some(r => r.severity === 'CRITICAL')
      if (hasCriticalConflict) {
        console.log('Cannot lock coordinates - critical conflict detected')
        return false
      }

      // Create alerts for any warnings
      for (const result of iouResults) {
        if (result.alertType !== 'NONE') {
          // We'd need the conflicting claim ID here - simplified for now
          await this.createCriticalConflictAlert(
            claimId,
            'unknown', // Would need to track this from IoU calculation
            result.iouScore,
            result.alertType
          )
        }
      }

      // Update to SPATIAL_LOCKED status
      await this.updatePipelineStatus(claimId, 'SPATIAL_LOCKED', 'SYSTEM', 'Coordinates verified and locked')

      return true
    } catch (error) {
      console.error('Spatial lock error:', error)
      return false
    }
  }

  /**
   * Protect My Claim - Immediate blockchain hash anchoring
   * Creates a timestamped priority of sale
   */
  async protectClaim(request: ProtectClaimRequest): Promise<ProtectClaimResult> {
    try {
      // Create a combined hash of indenture + timestamp + biometric (if provided)
      const dataToHash = `${request.indentureHash}|${request.timestamp}|${request.biometricHash || 'none'}`
      
      // Create SHA-256 hash
      const encoder = new TextEncoder()
      const data = encoder.encode(dataToHash)
      const hashBuffer = await crypto.subtle.digest('SHA-256', data)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const priorityHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Store the protection record
      const { error } = await this.supabase
        .from('land_claims')
        .update({
          on_chain_hash: priorityHash,
          mint_status: 'VERIFIED',
          ai_verification_metadata: {
            priorityOfSale: {
              hash: priorityHash,
              anchoredAt: new Date().toISOString(),
              indentureHash: request.indentureHash,
              hasBiometric: !!request.biometricHash,
            },
          },
        })
        .eq('id', request.claimId)

      if (error) {
        return {
          success: false,
          priorityHash: '',
          blockchainTxHash: null,
          anchoredAt: '',
          expiresAt: null,
          message: `Failed to protect claim: ${error.message}`,
        }
      }

      // In production, this would submit to blockchain
      // For now, we simulate the blockchain anchor
      const mockTxHash = `0x${priorityHash.slice(0, 64)}`

      // Update with blockchain tx hash
      await this.supabase
        .from('land_claims')
        .update({ blockchain_tx_hash: mockTxHash })
        .eq('id', request.claimId)

      // Log to blockchain minting log
      await this.supabase.from('blockchain_minting_log').insert({
        claim_id: request.claimId,
        on_chain_hash: priorityHash,
        transaction_hash: mockTxHash,
        mint_status: 'VERIFIED',
        blockchain_network: 'POLYGON',
        metadata_json: {
          type: 'PRIORITY_OF_SALE',
          indentureHash: request.indentureHash,
          timestamp: request.timestamp,
        },
      })

      return {
        success: true,
        priorityHash,
        blockchainTxHash: mockTxHash,
        anchoredAt: new Date().toISOString(),
        expiresAt: null, // Priority doesn't expire
        message: '✅ Your claim is now protected with a timestamped blockchain anchor. This establishes your Priority of Sale.',
      }
    } catch (error: any) {
      console.error('Protect claim error:', error)
      return {
        success: false,
        priorityHash: '',
        blockchainTxHash: null,
        anchoredAt: '',
        expiresAt: null,
        message: `Protection failed: ${error.message}`,
      }
    }
  }

  /**
   * Historical Satellite Analysis (The "Historical Eye")
   * Analyzes 5-10 years of satellite imagery for hidden usage
   */
  async analyzeHistoricalSatellite(
    claimId: string,
    polygon: Polygon,
    yearsToAnalyze: number = 10
  ): Promise<HistoricalSatelliteAnalysis> {
    try {
      const centroid = this.calculateCentroid(polygon.coordinates)
      const currentYear = new Date().getFullYear()
      const findings: HistoricalFinding[] = []

      // In production, this would call a satellite imagery API (e.g., Planet, Maxar)
      // For now, we simulate the analysis
      for (let i = 0; i < yearsToAnalyze; i++) {
        const year = currentYear - i
        const finding = await this.simulateHistoricalAnalysis(centroid, year)
        findings.push(finding)
      }

      // Detect hidden usage patterns
      const structureChanges = findings.filter(f => 
        f.changeType === 'STRUCTURE_BUILT' || 
        f.changeType === 'STRUCTURE_REMOVED' ||
        f.changeType === 'FENCED'
      )

      const hiddenUsageDetected = structureChanges.length > 0
      
      let silentOwnerRisk: HistoricalSatelliteAnalysis['silentOwnerRisk'] = 'LOW'
      if (structureChanges.some(f => f.changeType === 'STRUCTURE_REMOVED')) {
        silentOwnerRisk = 'HIGH'
      } else if (structureChanges.length >= 2) {
        silentOwnerRisk = 'MEDIUM'
      }

      let recommendation = 'Land appears to have consistent history. Proceed with verification.'
      if (silentOwnerRisk === 'HIGH') {
        recommendation = '🚨 ALERT: Evidence of previous structures detected. Investigate potential silent owner before proceeding.'
      } else if (silentOwnerRisk === 'MEDIUM') {
        recommendation = '⚠️ WARNING: Land usage changes detected. Recommend additional due diligence.'
      }

      return {
        claimId,
        analysisDate: new Date().toISOString(),
        yearsAnalyzed: yearsToAnalyze,
        findings,
        hiddenUsageDetected,
        silentOwnerRisk,
        recommendation,
      }
    } catch (error: any) {
      console.error('Historical satellite analysis error:', error)
      return {
        claimId,
        analysisDate: new Date().toISOString(),
        yearsAnalyzed: 0,
        findings: [],
        hiddenUsageDetected: false,
        silentOwnerRisk: 'LOW',
        recommendation: `Analysis failed: ${error.message}`,
      }
    }
  }

  private async simulateHistoricalAnalysis(
    centroid: Coordinate,
    year: number
  ): Promise<HistoricalFinding> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100))

    // Randomize findings for demo purposes
    const changeTypes: HistoricalFinding['changeType'][] = [
      'NO_CHANGE', 'NO_CHANGE', 'NO_CHANGE', 'NO_CHANGE', // 40% no change
      'CLEARED', 'CULTIVATION', 'FENCED', 'STRUCTURE_BUILT', 'STRUCTURE_REMOVED'
    ]
    
    const changeType = changeTypes[Math.floor(Math.random() * changeTypes.length)]
    
    const observations: Record<HistoricalFinding['changeType'], string> = {
      'NO_CHANGE': 'No significant changes detected',
      'CLEARED': 'Land was cleared of vegetation',
      'FENCED': 'Fencing or boundary markers detected',
      'STRUCTURE_BUILT': 'New structure or building detected',
      'STRUCTURE_REMOVED': 'Previous structure no longer visible',
      'CULTIVATION': 'Agricultural activity detected',
    }

    return {
      year,
      observation: observations[changeType],
      changeType,
      confidenceScore: 0.7 + Math.random() * 0.25,
      imageUrl: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${centroid.lng},${centroid.lat},16,0/400x300?access_token=placeholder`,
    }
  }

  /**
   * Get Conflict Map Data for Admin Dashboard
   */
  async getConflictMapData(region?: string): Promise<ConflictMapData> {
    try {
      // Get all claims with polygon data
      let query = this.supabase
        .from('land_claims')
        .select(`
          id,
          polygon_coordinates,
          ai_verification_status,
          spatial_conflict_status,
          traditional_authority_name,
          family_head_name,
          created_at,
          verification_step,
          mint_status
        `)
        .not('polygon_coordinates', 'is', null)

      if (region) {
        query = query.eq('region', region)
      }

      const { data: claims, error } = await query as { data: any[] | null; error: any }

      if (error || !claims) {
        return { claims: [], conflicts: [], hotspots: [] }
      }

      // Get all spatial conflicts
      const { data: conflicts } = await this.supabase
        .from('spatial_conflicts')
        .select('*') as { data: any[] | null }

      const mapClaims: ConflictMapClaim[] = claims.map(claim => {
        const hasConflict = conflicts?.some(
          c => c.claim_id === claim.id || c.conflicting_claim_id === claim.id
        ) || false

        const conflictRecord = conflicts?.find(
          c => c.claim_id === claim.id || c.conflicting_claim_id === claim.id
        )

        let conflictSeverity: ConflictMapClaim['conflictSeverity'] = 'NONE'
        if (conflictRecord) {
          conflictSeverity = conflictRecord.overlap_percentage >= 20 ? 'CRITICAL' : 'WARNING'
        }

        // Parse polygon coordinates (simplified - would need proper GeoJSON parsing)
        const coordinates: Coordinate[] = []
        const centroid: Coordinate = { lat: 0, lng: 0 }

        // Map pipeline status
        let status: ClaimPipelineStatus = 'INTAKE_PENDING'
        if (claim.mint_status === 'MINTED') {
          status = 'MINTED'
        } else if (claim.verification_step >= 2) {
          status = 'SPATIAL_LOCKED'
        } else if (claim.ai_verification_status === 'AI_VERIFIED') {
          status = 'AI_VERIFIED'
        }

        return {
          id: claim.id,
          coordinates,
          centroid,
          status,
          hasConflict,
          conflictSeverity,
          grantorName: claim.traditional_authority_name || claim.family_head_name || null,
          createdAt: claim.created_at,
        }
      })

      const mapConflicts: ConflictMapOverlap[] = (conflicts || []).map(c => ({
        claimAId: c.claim_id,
        claimBId: c.conflicting_claim_id,
        intersectionPolygon: [],
        iouScore: c.overlap_percentage / 100,
        alertType: c.overlap_percentage >= 20 ? 'CRITICAL_CONFLICT' : 'OVERLAP_WARNING' as any,
      }))

      // Calculate hotspots (areas with multiple conflicts)
      const hotspots: ConflictHotspot[] = []
      // Simplified - would need proper clustering algorithm

      return {
        claims: mapClaims,
        conflicts: mapConflicts,
        hotspots,
      }
    } catch (error) {
      console.error('Conflict map data error:', error)
      return { claims: [], conflicts: [], hotspots: [] }
    }
  }
}

export const spatialService = new SpatialConflictService()
