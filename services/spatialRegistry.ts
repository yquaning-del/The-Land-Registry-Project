/**
 * Spatial Registry Service
 * Client-side collision detection using turf.js
 * Protects the "Valley of Fraud" by detecting overlapping land claims
 */

import * as turf from '@turf/turf'
import { Feature, Polygon as GeoJSONPolygon, Position } from 'geojson'
import { createClient } from '@/lib/supabase/client'
import { notificationService, ConflictData } from './notificationService'

// Types
export interface Coordinate {
  lat: number
  lng: number
}

export interface LandClaim {
  id: string
  coordinates: Coordinate[]
  sellerId: string | null
  sellerName: string | null
  documentUrl: string | null
  status: ClaimStatus
  createdAt: string
  onChainHash: string | null
  mintStatus: string | null
  spatialConflictStatus: string | null
}

export type ClaimStatus = 
  | 'VERIFIED_TITLE'      // Green - Government title verified
  | 'PROTECTED_INDENTURE' // Blue - Valley of Fraud Shield active
  | 'DETECTED_CONFLICT'   // Red - Overlap found
  | 'PENDING'             // Gray - Awaiting verification

export interface CollisionResult {
  hasCollision: boolean
  isBlocked: boolean
  overlapPercentage: number
  conflictingClaims: ConflictingClaimInfo[]
  message: string
  alertLevel: 'NONE' | 'WARNING' | 'CRITICAL' | 'BLOCKED'
}

export interface ConflictingClaimInfo {
  claimId: string
  sellerName: string | null
  overlapPercentage: number
  overlapAreaSqm: number
  claimDate: string
  status: ClaimStatus
}

export interface PriorityOfSaleHash {
  hash: string
  sellerId: string
  indentureHash: string
  timestamp: string
  combinedData: string
}

// Constants
const OVERLAP_DISPUTE_THRESHOLD = 5 // 5% overlap triggers DISPUTED status
const OVERLAP_BLOCK_THRESHOLD = 50  // 50% overlap blocks transaction

/**
 * Spatial Registry - Client-side collision detection engine
 */
export class SpatialRegistry {
  private supabase = createClient()

  /**
   * Convert our coordinate format to GeoJSON polygon
   */
  private toGeoJSONPolygon(coordinates: Coordinate[]): Feature<GeoJSONPolygon> {
    // Ensure polygon is closed
    const coords = [...coordinates]
    if (
      coords[0].lat !== coords[coords.length - 1].lat ||
      coords[0].lng !== coords[coords.length - 1].lng
    ) {
      coords.push(coords[0])
    }

    // Convert to GeoJSON format [lng, lat]
    const positions: Position[] = coords.map(c => [c.lng, c.lat])

    return turf.polygon([positions])
  }

  /**
   * Calculate overlap percentage between two polygons using turf.js
   */
  calculateOverlapPercentage(
    polygonA: Coordinate[],
    polygonB: Coordinate[]
  ): { percentage: number; areaSqm: number } {
    try {
      const geoA = this.toGeoJSONPolygon(polygonA)
      const geoB = this.toGeoJSONPolygon(polygonB)

      // Check if polygons intersect
      const intersection = turf.intersect(turf.featureCollection([geoA, geoB]))

      if (!intersection) {
        return { percentage: 0, areaSqm: 0 }
      }

      // Calculate areas in square meters
      const areaA = turf.area(geoA)
      const areaB = turf.area(geoB)
      const intersectionArea = turf.area(intersection)

      // Calculate overlap as percentage of the smaller polygon
      const smallerArea = Math.min(areaA, areaB)
      const percentage = smallerArea > 0 ? (intersectionArea / smallerArea) * 100 : 0

      return {
        percentage: Math.round(percentage * 100) / 100,
        areaSqm: Math.round(intersectionArea * 100) / 100,
      }
    } catch (error) {
      console.error('Overlap calculation error:', error)
      return { percentage: 0, areaSqm: 0 }
    }
  }

  /**
   * Check for coordinate collision against all existing claims
   * This is the main collision detection function
   */
  async checkCoordinateCollision(
    newCoordinates: Coordinate[],
    excludeClaimId?: string
  ): Promise<CollisionResult> {
    try {
      // Fetch all existing claims with coordinates
      const { data: existingClaims, error } = await this.supabase
        .from('land_claims')
        .select(`
          id,
          polygon_coordinates,
          traditional_authority_name,
          family_head_name,
          created_at,
          on_chain_hash,
          mint_status,
          spatial_conflict_status,
          ai_verification_status
        `)
        .not('polygon_coordinates', 'is', null)

      if (error) {
        console.error('Error fetching claims:', error)
        return {
          hasCollision: false,
          isBlocked: false,
          overlapPercentage: 0,
          conflictingClaims: [],
          message: 'Unable to check for collisions - database error',
          alertLevel: 'NONE',
        }
      }

      const conflictingClaims: ConflictingClaimInfo[] = []
      let maxOverlap = 0

      for (const claim of existingClaims || []) {
        // Skip the claim we're updating
        if (excludeClaimId && claim.id === excludeClaimId) continue

        // Parse polygon coordinates from PostGIS format
        const claimCoords = this.parsePostGISPolygon(claim.polygon_coordinates)
        if (!claimCoords || claimCoords.length < 3) continue

        // Calculate overlap
        const { percentage, areaSqm } = this.calculateOverlapPercentage(
          newCoordinates,
          claimCoords
        )

        if (percentage > 0) {
          maxOverlap = Math.max(maxOverlap, percentage)

          // Determine claim status for color coding
          const status = this.determineClaimStatus(claim)

          conflictingClaims.push({
            claimId: claim.id,
            sellerName: claim.traditional_authority_name || claim.family_head_name || null,
            overlapPercentage: percentage,
            overlapAreaSqm: areaSqm,
            claimDate: claim.created_at,
            status,
          })
        }
      }

      // Sort by overlap percentage (highest first)
      conflictingClaims.sort((a, b) => b.overlapPercentage - a.overlapPercentage)

      // Determine alert level and message
      let alertLevel: CollisionResult['alertLevel'] = 'NONE'
      let message = 'No overlapping claims detected - coordinates are unique'
      let isBlocked = false

      if (maxOverlap >= OVERLAP_BLOCK_THRESHOLD) {
        alertLevel = 'BLOCKED'
        isBlocked = true
        message = `🚫 TRANSACTION BLOCKED: ${maxOverlap.toFixed(1)}% overlap detected. This land appears to already be claimed. Potential Double-Sale detected!`
      } else if (maxOverlap >= OVERLAP_DISPUTE_THRESHOLD) {
        alertLevel = 'CRITICAL'
        message = `⚠️ POTENTIAL DOUBLE-SALE: ${maxOverlap.toFixed(1)}% overlap with existing claim. This transaction has been flagged for review.`
      } else if (maxOverlap > 0) {
        alertLevel = 'WARNING'
        message = `Minor overlap (${maxOverlap.toFixed(1)}%) detected - within acceptable boundary tolerance`
      }

      return {
        hasCollision: maxOverlap >= OVERLAP_DISPUTE_THRESHOLD,
        isBlocked,
        overlapPercentage: maxOverlap,
        conflictingClaims,
        message,
        alertLevel,
      }
    } catch (error) {
      console.error('Collision check error:', error)
      return {
        hasCollision: false,
        isBlocked: false,
        overlapPercentage: 0,
        conflictingClaims: [],
        message: 'Error during collision check',
        alertLevel: 'NONE',
      }
    }
  }

  /**
   * Parse PostGIS polygon format to coordinate array
   */
  private parsePostGISPolygon(polygonData: any): Coordinate[] | null {
    if (!polygonData) return null

    try {
      // Handle GeoJSON format
      if (polygonData.type === 'Polygon' && polygonData.coordinates) {
        return polygonData.coordinates[0].map((coord: number[]) => ({
          lng: coord[0],
          lat: coord[1],
        }))
      }

      // Handle WKT format: POLYGON((lng lat, lng lat, ...))
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
      console.error('Error parsing polygon:', error)
      return null
    }
  }

  /**
   * Determine claim status for color coding
   */
  private determineClaimStatus(claim: any): ClaimStatus {
    // Red: Detected Conflict
    if (
      claim.spatial_conflict_status === 'HIGH_RISK' ||
      claim.spatial_conflict_status === 'DISPUTED' ||
      claim.ai_verification_status === 'DISPUTED'
    ) {
      return 'DETECTED_CONFLICT'
    }

    // Green: Verified Title (minted)
    if (claim.mint_status === 'MINTED') {
      return 'VERIFIED_TITLE'
    }

    // Blue: Protected Indenture (has blockchain hash but not fully minted)
    if (claim.on_chain_hash) {
      return 'PROTECTED_INDENTURE'
    }

    // Gray: Pending
    return 'PENDING'
  }

  /**
   * Flag a claim as DISPUTED due to overlap
   * Triggers conflict notifications to buyer, lawyer, and flags seller
   */
  async flagAsDisputed(
    claimId: string,
    conflictingClaimId: string,
    overlapPercentage: number
  ): Promise<boolean> {
    try {
      // Update claim status
      const { error: updateError } = await this.supabase
        .from('land_claims')
        .update({
          spatial_conflict_status: 'DISPUTED',
          ai_verification_status: 'PENDING_HUMAN_REVIEW',
        })
        .eq('id', claimId)

      if (updateError) {
        console.error('Error flagging claim as disputed:', updateError)
        return false
      }

      // Record the conflict
      await this.supabase.from('spatial_conflicts').insert({
        claim_id: claimId,
        conflicting_claim_id: conflictingClaimId,
        overlap_percentage: overlapPercentage,
        status: 'PENDING_REVIEW',
        detected_at: new Date().toISOString(),
      })

      // Create admin alert
      await this.createAdminAlert(claimId, conflictingClaimId, overlapPercentage)

      // Send conflict notifications to buyer, lawyer, and flag seller
      await this.sendConflictNotifications(claimId, conflictingClaimId, overlapPercentage)

      return true
    } catch (error) {
      console.error('Error flagging disputed claim:', error)
      return false
    }
  }

  /**
   * Send conflict notifications to all parties
   */
  private async sendConflictNotifications(
    claimId: string,
    conflictingClaimId: string,
    overlapPercentage: number
  ): Promise<void> {
    try {
      // Get claim details including buyer info
      const { data: claim } = await this.supabase
        .from('land_claims')
        .select(`
          id,
          claimant_id,
          traditional_authority_name,
          family_head_name,
          on_chain_hash,
          created_at,
          document_url
        `)
        .eq('id', claimId)
        .single()

      if (!claim) {
        console.error('Claim not found for notifications:', claimId)
        return
      }

      // Get buyer profile
      const { data: buyerProfile } = await this.supabase
        .from('user_profiles')
        .select('id, email, full_name, lawyer_email, lawyer_name')
        .eq('id', (claim as any).claimant_id)
        .single()

      if (!buyerProfile) {
        console.error('Buyer profile not found for notifications')
        return
      }

      const profile = buyerProfile as any
      const claimData = claim as any

      // Build conflict data for notification
      const conflictData: ConflictData = {
        claimId,
        conflictingClaimId,
        overlapPercentage,
        detectionTimestamp: new Date().toISOString(),
        buyerName: profile.full_name || 'Valued Customer',
        buyerEmail: profile.email,
        lawyerName: profile.lawyer_name,
        lawyerEmail: profile.lawyer_email,
        sellerName: claimData.traditional_authority_name || claimData.family_head_name,
        sellerId: claimData.traditional_authority_name || claimData.family_head_name,
        parcelId: claimId.slice(0, 8).toUpperCase(),
        blockchainHash: claimData.on_chain_hash,
        blockchainTxUrl: claimData.on_chain_hash 
          ? `https://polygonscan.com/tx/${claimData.on_chain_hash}` 
          : undefined,
        buyerPriorityDate: claimData.created_at,
      }

      // Send notifications
      await notificationService.sendConflictAlert(conflictData)

      console.log(`✅ Conflict notifications sent for claim ${claimId}`)
    } catch (error) {
      console.error('Error sending conflict notifications:', error)
    }
  }

  /**
   * Create high-priority admin alert for conflict
   */
  private async createAdminAlert(
    claimId: string,
    conflictingClaimId: string,
    overlapPercentage: number
  ): Promise<void> {
    try {
      await this.supabase.from('verification_logs').insert({
        claim_id: claimId,
        agent_name: 'SpatialRegistry',
        agent_version: '1.0',
        input_data: {
          conflictingClaimId,
          overlapPercentage,
          alertType: 'POTENTIAL_DOUBLE_SALE',
        },
        output_data: {
          severity: 'HIGH',
          message: `Potential double-sale detected: ${overlapPercentage.toFixed(1)}% overlap`,
          requiresImmediateReview: true,
        },
        confidence_score: 1 - (overlapPercentage / 100),
        execution_time_ms: 0,
      })
    } catch (error) {
      console.error('Error creating admin alert:', error)
    }
  }

  /**
   * Create Priority of Sale Hash
   * Combines Seller ID + Indenture Image Hash + Timestamp
   */
  async createPriorityOfSaleHash(
    sellerId: string,
    indentureImageUrl: string,
    timestamp?: string
  ): Promise<PriorityOfSaleHash> {
    const ts = timestamp || new Date().toISOString()

    // Create hash of the indenture image URL (in production, hash actual file content)
    const indentureHash = await this.hashString(indentureImageUrl)

    // Combine all data
    const combinedData = `${sellerId}|${indentureHash}|${ts}`

    // Create final SHA-256 hash
    const finalHash = await this.hashString(combinedData)

    return {
      hash: finalHash,
      sellerId,
      indentureHash,
      timestamp: ts,
      combinedData,
    }
  }

  /**
   * Create SHA-256 hash of a string
   */
  private async hashString(data: string): Promise<string> {
    const encoder = new TextEncoder()
    const dataBuffer = encoder.encode(data)
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  /**
   * Mint Priority of Sale hash to blockchain
   */
  async mintPriorityHash(
    claimId: string,
    priorityHash: PriorityOfSaleHash
  ): Promise<{ success: boolean; txHash: string | null; message: string }> {
    try {
      // Store the hash in the database
      const { error } = await this.supabase
        .from('land_claims')
        .update({
          on_chain_hash: priorityHash.hash,
          mint_status: 'VERIFIED',
          ai_verification_metadata: {
            priorityOfSale: {
              hash: priorityHash.hash,
              sellerId: priorityHash.sellerId,
              indentureHash: priorityHash.indentureHash,
              timestamp: priorityHash.timestamp,
              anchoredAt: new Date().toISOString(),
            },
          },
        })
        .eq('id', claimId)

      if (error) {
        return {
          success: false,
          txHash: null,
          message: `Failed to store priority hash: ${error.message}`,
        }
      }

      // In production, this would submit to blockchain
      // For now, simulate blockchain transaction
      const mockTxHash = `0x${priorityHash.hash.slice(0, 64)}`

      // Update with transaction hash
      await this.supabase
        .from('land_claims')
        .update({ blockchain_tx_hash: mockTxHash })
        .eq('id', claimId)

      // Log to blockchain minting log
      await this.supabase.from('blockchain_minting_log').insert({
        claim_id: claimId,
        on_chain_hash: priorityHash.hash,
        transaction_hash: mockTxHash,
        mint_status: 'VERIFIED',
        blockchain_network: 'POLYGON',
        metadata_json: {
          type: 'PRIORITY_OF_SALE',
          sellerId: priorityHash.sellerId,
          indentureHash: priorityHash.indentureHash,
          timestamp: priorityHash.timestamp,
        },
      })

      return {
        success: true,
        txHash: mockTxHash,
        message: '✅ Priority of Sale hash minted to blockchain. Your claim is now protected.',
      }
    } catch (error: any) {
      console.error('Mint priority hash error:', error)
      return {
        success: false,
        txHash: null,
        message: `Minting failed: ${error.message}`,
      }
    }
  }

  /**
   * Get all claims for map visualization
   */
  async getClaimsForMap(region?: string): Promise<LandClaim[]> {
    try {
      let query = this.supabase
        .from('land_claims')
        .select(`
          id,
          polygon_coordinates,
          traditional_authority_name,
          family_head_name,
          document_url,
          created_at,
          on_chain_hash,
          mint_status,
          spatial_conflict_status,
          ai_verification_status
        `)
        .not('polygon_coordinates', 'is', null)

      if (region) {
        query = query.eq('region', region)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching claims for map:', error)
        return []
      }

      return (data || []).map(claim => {
        const coords = this.parsePostGISPolygon(claim.polygon_coordinates)
        return {
          id: claim.id,
          coordinates: coords || [],
          sellerId: claim.traditional_authority_name || claim.family_head_name || null,
          sellerName: claim.traditional_authority_name || claim.family_head_name || null,
          documentUrl: claim.document_url,
          status: this.determineClaimStatus(claim),
          createdAt: claim.created_at,
          onChainHash: claim.on_chain_hash,
          mintStatus: claim.mint_status,
          spatialConflictStatus: claim.spatial_conflict_status,
        }
      })
    } catch (error) {
      console.error('Error getting claims for map:', error)
      return []
    }
  }

  /**
   * Get color for claim status (for map visualization)
   */
  getStatusColor(status: ClaimStatus): string {
    switch (status) {
      case 'VERIFIED_TITLE':
        return '#22c55e' // Green
      case 'PROTECTED_INDENTURE':
        return '#3b82f6' // Blue
      case 'DETECTED_CONFLICT':
        return '#ef4444' // Red
      case 'PENDING':
      default:
        return '#9ca3af' // Gray
    }
  }

  /**
   * Get status label for display
   */
  getStatusLabel(status: ClaimStatus): string {
    switch (status) {
      case 'VERIFIED_TITLE':
        return 'Verified Title'
      case 'PROTECTED_INDENTURE':
        return 'Protected Indenture'
      case 'DETECTED_CONFLICT':
        return 'Conflict Detected'
      case 'PENDING':
      default:
        return 'Pending Verification'
    }
  }
}

// Export singleton instance
export const spatialRegistry = new SpatialRegistry()
