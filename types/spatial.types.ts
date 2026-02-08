// Spatial Conflict Detection Types
// Used for geofencing, polygon overlap detection, and fraud prevention

export interface Coordinate {
  lat: number
  lng: number
}

export interface Polygon {
  coordinates: Coordinate[]
  srid?: number // Default 4326 (WGS84)
}

export interface ConflictingClaim {
  claimId: string
  overlapAreaSqm: number
  overlapPercentage: number
  grantorName: string | null
  grantorType: string | null
  documentType: string | null
  createdAt: string
  verificationStatus: string
}

export interface SpatialConflictResult {
  hasConflict: boolean
  overlapPercentage: number
  conflictingClaims: ConflictingClaim[]
  status: 'CLEAR' | 'POTENTIAL_DISPUTE' | 'HIGH_RISK'
  requiresHITL: boolean
  reasoning: string[]
}

export interface SatelliteGeofenceResult {
  isValid: boolean
  landExists: boolean
  landCoverType: string | null
  waterBodyDetected: boolean
  protectedAreaDetected: boolean
  existingStructuresDetected: boolean
  confidenceScore: number
  satelliteImageUrl: string | null
  reasoning: string
}

export interface GrantorHistoryResult {
  grantorName: string
  totalClaims: number
  disputedClaims: number
  rejectedClaims: number
  disputeRate: number
  isRedFlag: boolean
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  reasoning: string
}

export interface VerificationProgress {
  indentureVerified: boolean
  indentureVerifiedAt: string | null
  satelliteConfirmed: boolean
  satelliteConfirmedAt: string | null
  blockchainAnchored: boolean
  blockchainAnchoredAt: string | null
  governmentTitlePending: boolean
  governmentTitleStatus: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | null
  currentStep: 1 | 2 | 3 | 4
  overallStatus: 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED' | 'DISPUTED'
}

export interface SpatialCheckRequest {
  claimId?: string
  polygon: Polygon
  grantorName?: string
  documentUrl?: string
}

export interface SpatialCheckResponse {
  conflictResult: SpatialConflictResult
  satelliteResult: SatelliteGeofenceResult | null
  grantorHistory: GrantorHistoryResult | null
  overallRiskScore: number
  recommendation: 'PROCEED' | 'REVIEW' | 'REJECT'
  timestamp: string
}

export interface SpatialConflictRecord {
  id: string
  claimId: string
  conflictingClaimId: string
  overlapAreaSqm: number
  overlapPercentage: number
  status: 'PENDING_REVIEW' | 'RESOLVED' | 'DISPUTED'
  resolvedBy: string | null
  resolutionNotes: string | null
  createdAt: string
  resolvedAt: string | null
}

export interface GrantorDisputeRecord {
  id: string
  grantorName: string
  grantorType: string | null
  totalTransactions: number
  disputeCount: number
  rejectionCount: number
  lastActivityAt: string
  riskScore: number
  isBlacklisted: boolean
  notes: string | null
  createdAt: string
  updatedAt: string
}

// Verification step statuses for UI
export type VerificationStepStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'blocked'

export interface VerificationStep {
  id: number
  name: string
  description: string
  status: VerificationStepStatus
  completedAt: string | null
  details: string | null
}

// Constants for thresholds
export const SPATIAL_THRESHOLDS = {
  OVERLAP_WARNING_PERCENT: 5,
  OVERLAP_HIGH_RISK_PERCENT: 20,
  GRANTOR_DISPUTE_RATE_WARNING: 0.2,
  GRANTOR_DISPUTE_RATE_HIGH_RISK: 0.4,
  SATELLITE_CONFIDENCE_THRESHOLD: 0.7,
  IOU_CRITICAL_THRESHOLD: 0.3, // 30% IoU triggers critical conflict
  IOU_WARNING_THRESHOLD: 0.1,  // 10% IoU triggers warning
} as const

// Claim Status Pipeline - Valley of Fraud Protection
export type ClaimPipelineStatus = 
  | 'INTAKE_PENDING'      // Initial upload, awaiting processing
  | 'AI_VERIFIED'         // Document audit complete
  | 'SPATIAL_LOCKED'      // Geofence/satellite check passed, coordinates locked
  | 'MINTED'              // Blockchain anchor complete
  | 'GOVT_TITLE_SYNC'     // Ready for government registration

export interface ClaimPipelineState {
  status: ClaimPipelineStatus
  statusHistory: PipelineStatusChange[]
  spatialLockTimestamp: string | null
  blockchainAnchorHash: string | null
  priorityOfSaleHash: string | null
  isProtected: boolean
}

export interface PipelineStatusChange {
  fromStatus: ClaimPipelineStatus | null
  toStatus: ClaimPipelineStatus
  timestamp: string
  triggeredBy: 'SYSTEM' | 'USER' | 'ADMIN'
  reason: string
}

// IoU (Intersection over Union) Conflict Detection
export interface IoUConflictResult {
  iouScore: number // 0-1, where 1 = complete overlap
  intersectionAreaSqm: number
  unionAreaSqm: number
  claimAreaSqm: number
  conflictingClaimAreaSqm: number
  severity: 'NONE' | 'WARNING' | 'CRITICAL'
  alertType: 'NONE' | 'OVERLAP_WARNING' | 'CRITICAL_CONFLICT' | 'DOUBLE_SALE_SUSPECTED'
}

export interface CriticalConflictAlert {
  id: string
  alertType: 'CRITICAL_CONFLICT' | 'DOUBLE_SALE_SUSPECTED' | 'HISTORICAL_USAGE_DETECTED' | 'SILENT_OWNER_WARNING'
  severity: 'HIGH' | 'CRITICAL'
  claimId: string
  conflictingClaimId: string | null
  iouScore: number
  message: string
  detectedAt: string
  acknowledgedAt: string | null
  acknowledgedBy: string | null
  resolution: string | null
}

// Historical Satellite Analysis (The "Historical Eye")
export interface HistoricalSatelliteAnalysis {
  claimId: string
  analysisDate: string
  yearsAnalyzed: number
  findings: HistoricalFinding[]
  hiddenUsageDetected: boolean
  silentOwnerRisk: 'LOW' | 'MEDIUM' | 'HIGH'
  recommendation: string
}

export interface HistoricalFinding {
  year: number
  observation: string
  changeType: 'CLEARED' | 'FENCED' | 'STRUCTURE_BUILT' | 'STRUCTURE_REMOVED' | 'CULTIVATION' | 'NO_CHANGE'
  confidenceScore: number
  imageUrl: string | null
}

// Protect My Claim - Priority of Sale
export interface ProtectClaimRequest {
  claimId: string
  indentureHash: string
  biometricHash?: string
  timestamp: string
}

export interface ProtectClaimResult {
  success: boolean
  priorityHash: string
  blockchainTxHash: string | null
  anchoredAt: string
  expiresAt: string | null
  message: string
}

// Conflict Map for Admin Dashboard
export interface ConflictMapData {
  claims: ConflictMapClaim[]
  conflicts: ConflictMapOverlap[]
  hotspots: ConflictHotspot[]
}

export interface ConflictMapClaim {
  id: string
  coordinates: Coordinate[]
  centroid: Coordinate
  status: ClaimPipelineStatus
  hasConflict: boolean
  conflictSeverity: 'NONE' | 'WARNING' | 'CRITICAL'
  grantorName: string | null
  createdAt: string
}

export interface ConflictMapOverlap {
  claimAId: string
  claimBId: string
  intersectionPolygon: Coordinate[]
  iouScore: number
  alertType: CriticalConflictAlert['alertType']
}

export interface ConflictHotspot {
  centroid: Coordinate
  radius: number // meters
  conflictCount: number
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL'
}
