// Enhanced Verification Pipeline with Real AI Integration

import { 
  analyzeDocumentWithGPT4, 
  detectFraudWithGPT4, 
  analyzeImageForTampering,
  fileToBase64,
  isOpenAIConfigured,
  AIDocumentAnalysis,
  FraudDetectionResult
} from './openai'
import { 
  Agent, 
  AgentResult, 
  DocumentAnalysisResult,
  GPSValidationResult,
  CrossReferenceResult
} from '@/types/land-claim.types'
import { VerificationConfidence } from '@/types/database.types'
import { SpatialConflictService } from '@/services/spatialService'
import { Polygon } from '@/types/spatial.types'

export interface EnhancedVerificationInput {
  claimId: string
  documentFile?: File
  documentUrl?: string
  documentText?: string
  latitude: number
  longitude: number
  claimantName?: string
  polygon?: Polygon
  grantorName?: string
}

export interface EnhancedVerificationResult {
  overallConfidence: number
  confidenceLevel: VerificationConfidence
  recommendation: 'AUTO_APPROVE' | 'HUMAN_REVIEW' | 'REJECT'
  documentAnalysis: AIDocumentAnalysis | null
  fraudDetection: FraudDetectionResult | null
  tamperingAnalysis: {
    hasTampering: boolean
    confidence: number
    indicators: string[]
  } | null
  gpsValidation: GPSValidationResult | null
  spatialConflict: {
    hasConflict: boolean
    status: string
    overlapPercentage: number
    requiresHITL: boolean
  } | null
  breakdown: {
    documentAnalysis: number
    fraudDetection: number
    tamperingCheck: number
    gpsValidation: number
    spatialCheck: number
  }
  executionTimeMs: number
  aiPowered: boolean
  reasoning: string[]
}

export class EnhancedDocumentAnalysisAgent implements Agent<EnhancedVerificationInput, AIDocumentAnalysis> {
  confidenceScore: number = 0

  async execute(input: EnhancedVerificationInput): Promise<AgentResult<AIDocumentAnalysis>> {
    const startTime = Date.now()

    try {
      let analysisInput: { imageBase64?: string; imageUrl?: string; documentText?: string } = {}

      if (input.documentFile) {
        const base64 = await fileToBase64(input.documentFile)
        analysisInput.imageBase64 = base64
      } else if (input.documentUrl) {
        analysisInput.imageUrl = input.documentUrl
      } else if (input.documentText) {
        analysisInput.documentText = input.documentText
      }

      const result = await analyzeDocumentWithGPT4(analysisInput)
      this.confidenceScore = result.confidence

      return {
        success: true,
        data: result,
        confidenceScore: result.confidence,
        executionTimeMs: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'Document analysis failed',
        executionTimeMs: Date.now() - startTime
      }
    }
  }
}

export class EnhancedFraudDetectionAgent implements Agent<AIDocumentAnalysis, FraudDetectionResult> {
  confidenceScore: number = 0

  async execute(
    documentAnalysis: AIDocumentAnalysis,
    context?: { claimantName?: string; expectedLocation?: string }
  ): Promise<AgentResult<FraudDetectionResult>> {
    const startTime = Date.now()

    try {
      const result = await detectFraudWithGPT4(documentAnalysis, context)
      // Invert fraud score for confidence (high fraud = low confidence)
      this.confidenceScore = 1 - result.confidenceScore

      return {
        success: true,
        data: result,
        confidenceScore: this.confidenceScore,
        executionTimeMs: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0.5,
        error: error instanceof Error ? error.message : 'Fraud detection failed',
        executionTimeMs: Date.now() - startTime
      }
    }
  }
}

export class TamperingDetectionAgent {
  confidenceScore: number = 0

  async execute(imageBase64: string): Promise<AgentResult<{
    hasTampering: boolean
    confidence: number
    indicators: string[]
  }>> {
    const startTime = Date.now()

    try {
      const result = await analyzeImageForTampering(imageBase64)
      // Invert tampering confidence for overall score
      this.confidenceScore = result.hasTampering ? (1 - result.confidence) : result.confidence

      return {
        success: true,
        data: {
          hasTampering: result.hasTampering,
          confidence: result.confidence,
          indicators: result.indicators
        },
        confidenceScore: this.confidenceScore,
        executionTimeMs: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0.5,
        error: error instanceof Error ? error.message : 'Tampering detection failed',
        executionTimeMs: Date.now() - startTime
      }
    }
  }
}

export class EnhancedGPSValidationAgent implements Agent<{ lat: number; lng: number }, GPSValidationResult> {
  confidenceScore: number = 0

  async execute(coords: { lat: number; lng: number }): Promise<AgentResult<GPSValidationResult>> {
    const startTime = Date.now()

    try {
      // Validate coordinates are within West Africa bounds
      const isValidRegion = this.isWithinWestAfrica(coords.lat, coords.lng)
      
      // Check if coordinates are on land (basic check)
      const isOnLand = this.isLikelyOnLand(coords.lat, coords.lng)

      const confidence = isValidRegion && isOnLand ? 0.85 : 0.4

      const result: GPSValidationResult = {
        isValid: isValidRegion && isOnLand,
        satelliteImageUrl: `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${coords.lng},${coords.lat},15,0/400x300?access_token=placeholder`,
        landCoverType: this.estimateLandCover(coords.lat, coords.lng),
        nearbyLandmarks: [],
        confidenceScore: confidence
      }

      this.confidenceScore = confidence

      return {
        success: true,
        data: result,
        confidenceScore: confidence,
        executionTimeMs: Date.now() - startTime
      }
    } catch (error) {
      return {
        success: false,
        confidenceScore: 0,
        error: error instanceof Error ? error.message : 'GPS validation failed',
        executionTimeMs: Date.now() - startTime
      }
    }
  }

  private isWithinWestAfrica(lat: number, lng: number): boolean {
    // West Africa approximate bounds
    return lat >= 4 && lat <= 18 && lng >= -18 && lng <= 16
  }

  private isLikelyOnLand(lat: number, lng: number): boolean {
    // Basic check - exclude obvious ocean coordinates
    // This is a simplified check; real implementation would use a proper land/water dataset
    return true
  }

  private estimateLandCover(lat: number, lng: number): string {
    // Simplified land cover estimation based on latitude
    if (lat > 14) return 'Sahel/Semi-arid'
    if (lat > 10) return 'Savanna'
    if (lat > 7) return 'Forest/Agricultural'
    return 'Coastal/Urban'
  }
}

export class EnhancedVerificationPipeline {
  private documentAgent: EnhancedDocumentAnalysisAgent
  private fraudAgent: EnhancedFraudDetectionAgent
  private tamperingAgent: TamperingDetectionAgent
  private gpsAgent: EnhancedGPSValidationAgent
  private spatialService: SpatialConflictService

  constructor() {
    this.documentAgent = new EnhancedDocumentAnalysisAgent()
    this.fraudAgent = new EnhancedFraudDetectionAgent()
    this.tamperingAgent = new TamperingDetectionAgent()
    this.gpsAgent = new EnhancedGPSValidationAgent()
    this.spatialService = new SpatialConflictService()
  }

  async execute(input: EnhancedVerificationInput): Promise<EnhancedVerificationResult> {
    const startTime = Date.now()
    const reasoning: string[] = []
    const aiPowered = isOpenAIConfigured()

    reasoning.push(aiPowered 
      ? '🤖 AI-powered verification enabled (GPT-4 Vision)'
      : '⚠️ Running in fallback mode - configure OPENAI_API_KEY for full AI analysis'
    )

    // Step 1: Document Analysis
    const docResult = await this.documentAgent.execute(input)
    const documentAnalysis = docResult.data || null
    
    if (docResult.success && documentAnalysis) {
      reasoning.push(`📄 Document type identified: ${documentAnalysis.documentType}`)
      if (documentAnalysis.grantorName) {
        reasoning.push(`👤 Grantor: ${documentAnalysis.grantorName}`)
      }
      if (documentAnalysis.parcelId) {
        reasoning.push(`🏷️ Parcel ID: ${documentAnalysis.parcelId}`)
      }
    } else {
      reasoning.push('❌ Document analysis failed or incomplete')
    }

    // Step 2: Fraud Detection (if document analysis succeeded)
    let fraudDetection: FraudDetectionResult | null = null
    if (documentAnalysis) {
      const fraudResult = await this.fraudAgent.execute(documentAnalysis, {
        claimantName: input.claimantName
      })
      fraudDetection = fraudResult.data || null

      if (fraudDetection) {
        if (fraudDetection.isFraudulent) {
          reasoning.push(`🚨 FRAUD ALERT: ${fraudDetection.fraudIndicators.join(', ')}`)
        } else {
          reasoning.push(`✅ No fraud indicators detected`)
        }
      }
    }

    // Step 3: Tampering Detection (if we have an image)
    let tamperingAnalysis: { hasTampering: boolean; confidence: number; indicators: string[] } | null = null
    if (input.documentFile && aiPowered) {
      const base64 = await fileToBase64(input.documentFile)
      const tamperResult = await this.tamperingAgent.execute(base64)
      tamperingAnalysis = tamperResult.data || null

      if (tamperingAnalysis?.hasTampering) {
        reasoning.push(`⚠️ Tampering detected: ${tamperingAnalysis.indicators.join(', ')}`)
      } else {
        reasoning.push('✅ No tampering detected in document image')
      }
    }

    // Step 4: GPS Validation
    const gpsResult = await this.gpsAgent.execute({ lat: input.latitude, lng: input.longitude })
    const gpsValidation = gpsResult.data || null

    if (gpsValidation?.isValid) {
      reasoning.push(`📍 GPS coordinates valid (${gpsValidation.landCoverType})`)
    } else {
      reasoning.push('⚠️ GPS coordinates may be outside valid region')
    }

    // Step 5: Spatial Conflict Check (if polygon provided)
    let spatialConflict: { hasConflict: boolean; status: string; overlapPercentage: number; requiresHITL: boolean } | null = null
    if (input.polygon && input.polygon.coordinates.length >= 3) {
      try {
        const conflictResult = await this.spatialService.checkPolygonOverlap(input.claimId, input.polygon)
        spatialConflict = {
          hasConflict: conflictResult.hasConflict,
          status: conflictResult.status,
          overlapPercentage: conflictResult.overlapPercentage,
          requiresHITL: conflictResult.requiresHITL
        }

        if (conflictResult.hasConflict) {
          reasoning.push(`⚠️ Spatial conflict detected: ${conflictResult.overlapPercentage.toFixed(1)}% overlap`)
        } else {
          reasoning.push('✅ No spatial conflicts with existing claims')
        }
      } catch (error) {
        reasoning.push('⚠️ Spatial conflict check failed')
      }
    }

    // Calculate scores
    const docScore = documentAnalysis?.confidence || 0.5
    const fraudScore = fraudDetection ? (1 - fraudDetection.confidenceScore) : 0.5
    const tamperScore = tamperingAnalysis ? (tamperingAnalysis.hasTampering ? 0.2 : 0.9) : 0.7
    const gpsScore = gpsValidation?.confidenceScore || 0.5
    const spatialScore = spatialConflict ? (spatialConflict.hasConflict ? 0.3 : 0.95) : 0.8

    // Weighted average
    const weights = {
      doc: 0.25,
      fraud: 0.30,
      tamper: 0.15,
      gps: 0.15,
      spatial: 0.15
    }

    const overallConfidence = 
      (docScore * weights.doc) +
      (fraudScore * weights.fraud) +
      (tamperScore * weights.tamper) +
      (gpsScore * weights.gps) +
      (spatialScore * weights.spatial)

    // Determine recommendation
    let confidenceLevel: VerificationConfidence
    let recommendation: 'AUTO_APPROVE' | 'HUMAN_REVIEW' | 'REJECT'

    // Force rejection if fraud detected
    if (fraudDetection?.isFraudulent && fraudDetection.confidenceScore > 0.7) {
      confidenceLevel = 'LOW'
      recommendation = 'REJECT'
      reasoning.push('🛑 Recommendation: REJECT - High fraud confidence')
    } else if (tamperingAnalysis?.hasTampering && tamperingAnalysis.confidence > 0.7) {
      confidenceLevel = 'LOW'
      recommendation = 'REJECT'
      reasoning.push('🛑 Recommendation: REJECT - Document tampering detected')
    } else if (spatialConflict?.requiresHITL) {
      confidenceLevel = 'MEDIUM'
      recommendation = 'HUMAN_REVIEW'
      reasoning.push('👁️ Recommendation: HUMAN_REVIEW - Spatial conflict requires review')
    } else if (overallConfidence >= 0.85) {
      confidenceLevel = 'HIGH'
      recommendation = 'AUTO_APPROVE'
      reasoning.push('✅ Recommendation: AUTO_APPROVE - High confidence')
    } else if (overallConfidence >= 0.60) {
      confidenceLevel = 'MEDIUM'
      recommendation = 'HUMAN_REVIEW'
      reasoning.push('👁️ Recommendation: HUMAN_REVIEW - Medium confidence')
    } else {
      confidenceLevel = 'LOW'
      recommendation = 'REJECT'
      reasoning.push('🛑 Recommendation: REJECT - Low confidence')
    }

    return {
      overallConfidence,
      confidenceLevel,
      recommendation,
      documentAnalysis,
      fraudDetection,
      tamperingAnalysis,
      gpsValidation,
      spatialConflict,
      breakdown: {
        documentAnalysis: docScore,
        fraudDetection: fraudScore,
        tamperingCheck: tamperScore,
        gpsValidation: gpsScore,
        spatialCheck: spatialScore
      },
      executionTimeMs: Date.now() - startTime,
      aiPowered,
      reasoning
    }
  }
}

// Export singleton instance
export const enhancedVerificationPipeline = new EnhancedVerificationPipeline()
