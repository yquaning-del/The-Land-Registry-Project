import { 
  Agent, 
  AgentResult, 
  DocumentAnalysisResult, 
  GPSValidationResult,
  CrossReferenceResult,
  FinalVerificationScore,
  VerificationPipelineInput 
} from '@/types/land-claim.types'
import { VerificationConfidence } from '@/types/database.types'
import { SpatialConflictResult, Polygon, SPATIAL_THRESHOLDS } from '@/types/spatial.types'
import { SpatialConflictService } from '@/services/spatialService'

export class DocumentAnalysisAgent implements Agent<string, DocumentAnalysisResult> {
  confidenceScore: number = 0

  async execute(documentUrl: string): Promise<AgentResult<DocumentAnalysisResult>> {
    const startTime = Date.now()
    
    try {
      const result: DocumentAnalysisResult = {
        extractedText: '',
        documentType: 'Land Title',
        ownerName: 'Sample Owner',
        plotNumber: 'PLT-001',
        issueDate: new Date().toISOString(),
        confidenceScore: 0.75,
      }
      
      this.confidenceScore = result.confidenceScore
      
      return {
        success: true,
        data: result,
        confidenceScore: result.confidenceScore,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }
}

export class GPSValidationAgent implements Agent<{ lat: number; lng: number }, GPSValidationResult> {
  confidenceScore: number = 0

  async execute(coords: { lat: number; lng: number }): Promise<AgentResult<GPSValidationResult>> {
    const startTime = Date.now()
    
    try {
      const result: GPSValidationResult = {
        isValid: true,
        satelliteImageUrl: 'https://example.com/satellite.jpg',
        landCoverType: 'Residential',
        nearbyLandmarks: ['Main Road', 'School'],
        confidenceScore: 0.82,
      }
      
      this.confidenceScore = result.confidenceScore
      
      return {
        success: true,
        data: result,
        confidenceScore: result.confidenceScore,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }
}

export class CrossReferenceAgent implements Agent<string, CrossReferenceResult> {
  confidenceScore: number = 0

  async execute(claimId: string): Promise<AgentResult<CrossReferenceResult>> {
    const startTime = Date.now()
    
    try {
      const result: CrossReferenceResult = {
        hasConflicts: false,
        conflictingClaims: [],
        proximityWarnings: [],
        confidenceScore: 0.90,
      }
      
      this.confidenceScore = result.confidenceScore
      
      return {
        success: true,
        data: result,
        confidenceScore: result.confidenceScore,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }
}

export interface SpatialConflictInput {
  claimId: string
  polygon: Polygon
  grantorName?: string
}

export interface SpatialConflictAgentResult {
  conflictResult: SpatialConflictResult
  grantorRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  requiresHITL: boolean
  confidenceScore: number
}

export class SpatialConflictAgent implements Agent<SpatialConflictInput, SpatialConflictAgentResult> {
  confidenceScore: number = 0
  private spatialService: SpatialConflictService

  constructor() {
    this.spatialService = new SpatialConflictService()
  }

  async execute(input: SpatialConflictInput): Promise<AgentResult<SpatialConflictAgentResult>> {
    const startTime = Date.now()
    
    try {
      // Check for polygon overlaps
      const conflictResult = await this.spatialService.checkPolygonOverlap(
        input.claimId,
        input.polygon
      )

      // Check grantor history if name provided
      let grantorRiskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW'
      if (input.grantorName) {
        const grantorHistory = await this.spatialService.getGrantorHistory(input.grantorName)
        grantorRiskLevel = grantorHistory.riskLevel
      }

      // Calculate confidence score based on conflict status
      let confidenceScore = 1.0
      if (conflictResult.status === 'HIGH_RISK') {
        confidenceScore = 0.2
      } else if (conflictResult.status === 'POTENTIAL_DISPUTE') {
        confidenceScore = 0.5
      } else {
        confidenceScore = 0.95
      }

      // Reduce confidence if grantor is risky
      if (grantorRiskLevel === 'HIGH') {
        confidenceScore *= 0.5
      } else if (grantorRiskLevel === 'MEDIUM') {
        confidenceScore *= 0.75
      }

      this.confidenceScore = confidenceScore

      const result: SpatialConflictAgentResult = {
        conflictResult,
        grantorRiskLevel,
        requiresHITL: conflictResult.requiresHITL || grantorRiskLevel !== 'LOW',
        confidenceScore,
      }

      return {
        success: true,
        data: result,
        confidenceScore,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }
}

export interface MockVerificationInput {
  documentText: string
  documentUrl: string
  latitude: number
  longitude: number
}

export interface MockVerificationResult {
  ocrExtractedText: string
  satelliteCheckPassed: boolean
  fraudDetected: boolean
  confidenceScore: number
  reasoning: string
}

export class MockVerificationAgent implements Agent<MockVerificationInput, MockVerificationResult> {
  confidenceScore: number = 0

  async execute(input: MockVerificationInput): Promise<AgentResult<MockVerificationResult>> {
    const startTime = Date.now()
    
    try {
      const fraudDetected = input.documentText.toLowerCase().includes('fraud')
      const confidence = fraudDetected ? 0.20 : 0.95
      
      const result: MockVerificationResult = {
        ocrExtractedText: input.documentText,
        satelliteCheckPassed: !fraudDetected,
        fraudDetected,
        confidenceScore: confidence,
        reasoning: fraudDetected 
          ? 'Fraud keyword detected in document - flagged for manual review'
          : 'Document passed OCR and satellite verification checks',
      }
      
      this.confidenceScore = result.confidenceScore
      
      return {
        success: true,
        data: result,
        confidenceScore: result.confidenceScore,
        executionTimeMs: Date.now() - startTime,
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTimeMs: Date.now() - startTime,
      }
    }
  }
}

export interface ExtendedVerificationPipelineInput extends VerificationPipelineInput {
  polygon?: Polygon
  grantorName?: string
}

export interface ExtendedFinalVerificationScore extends FinalVerificationScore {
  spatialConflict?: {
    hasConflict: boolean
    status: string
    overlapPercentage: number
    requiresHITL: boolean
    grantorRiskLevel: string
  }
}

export class VerificationPipeline {
  private documentAgent: DocumentAnalysisAgent
  private gpsAgent: GPSValidationAgent
  private crossRefAgent: CrossReferenceAgent
  private spatialAgent: SpatialConflictAgent

  constructor() {
    this.documentAgent = new DocumentAnalysisAgent()
    this.gpsAgent = new GPSValidationAgent()
    this.crossRefAgent = new CrossReferenceAgent()
    this.spatialAgent = new SpatialConflictAgent()
  }

  async execute(input: ExtendedVerificationPipelineInput): Promise<ExtendedFinalVerificationScore> {
    // Run document, GPS, and cross-reference checks in parallel
    const [docResult, gpsResult, crossRefResult] = await Promise.all([
      this.documentAgent.execute(input.documentUrl),
      this.gpsAgent.execute({ lat: input.latitude, lng: input.longitude }),
      this.crossRefAgent.execute(input.claimId),
    ])

    const docScore = docResult.data?.confidenceScore || 0
    const gpsScore = gpsResult.data?.confidenceScore || 0
    const crossRefScore = crossRefResult.data?.confidenceScore || 0

    // Run spatial conflict check if polygon provided
    let spatialScore = 1.0
    let spatialResult: SpatialConflictAgentResult | null = null
    
    if (input.polygon && input.polygon.coordinates.length >= 3) {
      const spatialCheck = await this.spatialAgent.execute({
        claimId: input.claimId,
        polygon: input.polygon,
        grantorName: input.grantorName,
      })
      
      if (spatialCheck.success && spatialCheck.data) {
        spatialResult = spatialCheck.data
        spatialScore = spatialCheck.data.confidenceScore
      }
    }

    // Calculate overall confidence with spatial check weighted
    const hasPolygon = input.polygon && input.polygon.coordinates.length >= 3
    const weights = hasPolygon 
      ? { doc: 0.25, gps: 0.25, crossRef: 0.20, spatial: 0.30 }
      : { doc: 0.35, gps: 0.35, crossRef: 0.30, spatial: 0 }

    const overallConfidence = hasPolygon
      ? (docScore * weights.doc) + (gpsScore * weights.gps) + (crossRefScore * weights.crossRef) + (spatialScore * weights.spatial)
      : (docScore * weights.doc) + (gpsScore * weights.gps) + (crossRefScore * weights.crossRef)

    let confidenceLevel: VerificationConfidence
    let recommendation: 'AUTO_APPROVE' | 'HUMAN_REVIEW' | 'REJECT'

    // Force HUMAN_REVIEW if spatial conflict requires HITL
    if (spatialResult?.requiresHITL) {
      confidenceLevel = 'MEDIUM'
      recommendation = 'HUMAN_REVIEW'
    } else if (overallConfidence >= 0.85) {
      confidenceLevel = 'HIGH'
      recommendation = 'AUTO_APPROVE'
    } else if (overallConfidence >= 0.60) {
      confidenceLevel = 'MEDIUM'
      recommendation = 'HUMAN_REVIEW'
    } else {
      confidenceLevel = 'LOW'
      recommendation = 'REJECT'
    }

    const result: ExtendedFinalVerificationScore = {
      overallConfidence,
      confidenceLevel,
      recommendation,
      breakdown: {
        documentAnalysis: docScore,
        gpsValidation: gpsScore,
        crossReference: crossRefScore,
      },
    }

    // Add spatial conflict info if available
    if (spatialResult) {
      result.spatialConflict = {
        hasConflict: spatialResult.conflictResult.hasConflict,
        status: spatialResult.conflictResult.status,
        overlapPercentage: spatialResult.conflictResult.overlapPercentage,
        requiresHITL: spatialResult.requiresHITL,
        grantorRiskLevel: spatialResult.grantorRiskLevel,
      }
    }

    return result
  }
}
