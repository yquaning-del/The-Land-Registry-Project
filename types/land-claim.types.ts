import { 
  ClaimStatus, 
  VerificationConfidence, 
  TitleType, 
  GrantorType, 
  MintStatus,
  WitnessSignature,
  EncumbranceDetail
} from './database.types'

export interface AIResult<T> {
  data: T
  confidenceScore: number
  reasoning?: string
  metadata?: Record<string, unknown>
}

export interface Agent<TInput, TOutput> {
  execute(input: TInput): Promise<AgentResult<TOutput>>
  confidenceScore: number
}

export interface AgentResult<T> {
  success: boolean
  data?: T
  confidenceScore: number
  error?: string
  executionTimeMs: number
}

export interface LandClaimFormData {
  documentFile: File
  documentType: string
  latitude: number
  longitude: number
  landSize?: number
  address?: string
  region?: string
  country: string
  titleType?: TitleType
  durationYears?: number
  documentSerialNumber?: string
  parcelIdBarcode?: string
  grantorType?: GrantorType
  witnessSignatures?: WitnessSignature[]
  legalJuratFlag?: boolean
  surveyPlanFile?: File
  polygonCoordinates?: Array<[number, number]>
  traditionalAuthorityName?: string
  stoolLandReference?: string
  familyHeadName?: string
  consentAuthority?: string
  landUseCategory?: string
  encumbrances?: EncumbranceDetail[]
  surveyorLicenseNumber?: string
  surveyDate?: string
  landsCommissionFileNumber?: string
}

export interface LandClaimWithDetails {
  id: string
  claimantId: string
  claimantName: string
  originalDocumentUrl: string
  documentType: string | null
  latitude: number
  longitude: number
  landSize: number | null
  address: string | null
  region: string | null
  country: string
  status: ClaimStatus
  confidenceScore: number | null
  confidenceLevel: VerificationConfidence | null
  humanApproverId: string | null
  humanApproverName: string | null
  titleType: TitleType | null
  durationYears: number | null
  documentSerialNumber: string | null
  parcelIdBarcode: string | null
  grantorType: GrantorType | null
  witnessSignatures: WitnessSignature[] | null
  legalJuratFlag: boolean
  surveyPlanUrl: string | null
  polygonCoordinates: string | null
  isLitigationFlag: boolean
  fraudConfidenceScore: number | null
  onChainHash: string | null
  mintStatus: MintStatus
  traditionalAuthorityName: string | null
  stoolLandReference: string | null
  familyHeadName: string | null
  consentAuthority: string | null
  landUseCategory: string | null
  encumbrances: EncumbranceDetail[] | null
  surveyorLicenseNumber: string | null
  surveyDate: string | null
  landsCommissionFileNumber: string | null
  createdAt: string
  updatedAt: string
}

export interface VerificationPipelineInput {
  claimId: string
  documentUrl: string
  latitude: number
  longitude: number
}

export interface DocumentAnalysisResult {
  extractedText: string
  documentType: string
  ownerName?: string
  plotNumber?: string
  issueDate?: string
  confidenceScore: number
}

export interface GPSValidationResult {
  isValid: boolean
  satelliteImageUrl?: string
  landCoverType?: string
  nearbyLandmarks?: string[]
  confidenceScore: number
}

export interface CrossReferenceResult {
  hasConflicts: boolean
  conflictingClaims: string[]
  proximityWarnings: string[]
  confidenceScore: number
}

export interface FinalVerificationScore {
  overallConfidence: number
  confidenceLevel: VerificationConfidence
  recommendation: 'AUTO_APPROVE' | 'HUMAN_REVIEW' | 'REJECT'
  breakdown: {
    documentAnalysis: number
    gpsValidation: number
    crossReference: number
    fraudDetection?: number
  }
}

export interface WestAfricanLegalValidation {
  titleTypeValid: boolean
  durationYearsValid: boolean
  serialNumberValid: boolean
  parcelBarcodeValid: boolean
  grantorTypeValid: boolean
  witnessRequirementsMet: boolean
  surveyorLicenseValid: boolean
  traditionalAuthorityApproved: boolean
  landsCommissionVerified: boolean
  confidenceScore: number
  validationErrors: string[]
}

export interface BlockchainMintingRequest {
  claimId: string
  documentHash: string
  metadata: {
    titleType: TitleType
    location: {
      latitude: number
      longitude: number
      address: string
    }
    legalDetails: {
      serialNumber: string
      parcelBarcode: string
      durationYears: number
    }
    verificationScore: number
  }
}

export interface SurveyorVerification {
  surveyorName: string
  licenseNumber: string
  surveyFirm?: string
  surveyDate: string
  coordinatesVerified: boolean
  areaCalculated: number
  beaconCoordinates?: Array<{ lat: number; lng: number; beaconId: string }>
  notes?: string
}

export interface TraditionalAuthorityApproval {
  authorityType: 'STOOL' | 'FAMILY' | 'PARAMOUNT_CHIEF' | 'TRADITIONAL_COUNCIL'
  authorityName: string
  stoolName?: string
  paramountChiefName?: string
  approvalDate: string
  approvalDocumentUrl?: string
  witnessNames: string[]
  sealVerified: boolean
  notes?: string
}
