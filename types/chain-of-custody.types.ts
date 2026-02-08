export interface ChainOfCustody {
  auditorId: string
  auditorName: string
  auditorEmail?: string
  verificationTimestamp: string
  approvalTimestamp: string
  mintingTimestamp: string
}

export interface AuditorInfo {
  id: string
  name: string
  email?: string
  role: 'ADMIN' | 'AUDITOR' | 'SUPERVISOR'
  department?: string
  licenseNumber?: string
}

export interface VerificationEvent {
  eventType: 'AI_VERIFICATION' | 'HUMAN_REVIEW' | 'APPROVAL' | 'MINTING' | 'REJECTION'
  timestamp: string
  performedBy: string
  performedById: string
  notes?: string
  metadata?: Record<string, any>
}

export interface FullChainOfCustody {
  claimId: string
  parcelId: string
  events: VerificationEvent[]
  currentStatus: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'MINTED' | 'REJECTED'
  finalAuditor: AuditorInfo
  blockchainRecord?: {
    transactionHash: string
    tokenId: string
    ipfsMetadataHash: string
    mintedAt: string
    network: string
  }
}
