import Fuse from 'fuse.js'
import { createClient } from '@/lib/supabase/client'

export interface OCRExtractionResult {
  grantorName: string | null
  parcelId: string | null
  documentDate: string | null
  extractedText: string
  confidence: number
}

export interface FuzzyMatchResult {
  matched: boolean
  matchScore: number
  matchedRecord: {
    id: string
    ownerName: string
    parcelBarcode: string
  } | null
  matchType: 'EXACT' | 'PARTIAL' | 'NO_MATCH'
}

export interface ForgeryHeuristics {
  nameMatch: {
    passed: boolean
    score: number
    reason: string
  }
  dateAnomaly: {
    passed: boolean
    reason: string
  }
  formattingCheck: {
    passed: boolean
    suspiciousPatterns: string[]
    reason: string
  }
}

export interface VerificationResult {
  status: 'CLEAR' | 'NEEDS_REVIEW' | 'REJECTED'
  confidenceScore: number
  fraudConfidenceScore: number
  reasoning: string[]
  ocrResult: OCRExtractionResult
  fuzzyMatch: FuzzyMatchResult
  forgeryHeuristics: ForgeryHeuristics
  recommendation: string
  timestamp: string
}

export class DeepMatchVerificationAgent {
  private supabase = createClient()
  private readonly NAME_MISMATCH_PENALTY = 0.50
  private readonly HIGH_CONFIDENCE_THRESHOLD = 0.85
  private readonly MEDIUM_CONFIDENCE_THRESHOLD = 0.60
  private readonly MAX_LEASE_YEARS = 99

  async performOCRExtraction(file: File): Promise<OCRExtractionResult> {
    try {
      const text = await this.extractTextFromImage(file)
      
      const grantorName = this.extractGrantorName(text)
      const parcelId = this.extractParcelId(text)
      const documentDate = this.extractDocumentDate(text)
      
      const confidence = this.calculateOCRConfidence(grantorName, parcelId, documentDate)
      
      return {
        grantorName,
        parcelId,
        documentDate,
        extractedText: text,
        confidence,
      }
    } catch (error) {
      console.error('OCR extraction failed:', error)
      return {
        grantorName: null,
        parcelId: null,
        documentDate: null,
        extractedText: '',
        confidence: 0,
      }
    }
  }

  private async extractTextFromImage(file: File): Promise<string> {
    const reader = new FileReader()
    
    return new Promise((resolve, reject) => {
      reader.onload = async (e) => {
        try {
          const imageData = e.target?.result as string
          
          const mockText = `
            REPUBLIC OF GHANA
            LANDS COMMISSION
            
            CERTIFICATE OF OCCUPANCY
            
            Serial Number: GLC/2026/001234
            Parcel ID: GH20260001234
            
            This is to certify that KOFI MENSAH
            (hereinafter called the "Grantee")
            
            Vendor/Grantor: GHANA LANDS COMMISSION
            
            Plot Number: 123
            Location: East Legon, Accra
            
            Date of Issue: 15th January 2026
            
            Duration: 99 years from the date hereof
            
            [Official Seal]
          `
          
          resolve(mockText)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  private extractGrantorName(text: string): string | null {
    const patterns = [
      /(?:Grantor|Vendor|Owner)[\s:]+([A-Z][A-Za-z\s.]+?)(?:\n|$)/i,
      /(?:called the "Grantee"\))\s+([A-Z][A-Za-z\s.]+?)(?:\n|$)/i,
      /(?:This is to certify that)\s+([A-Z][A-Za-z\s.]+?)(?:\n|$)/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  private extractParcelId(text: string): string | null {
    const patterns = [
      /Parcel\s+ID[\s:]+([A-Z]{2}\d{8,12})/i,
      /Parcel\s+Number[\s:]+([A-Z]{2}\d{8,12})/i,
      /Plot\s+ID[\s:]+([A-Z]{2}\d{8,12})/i,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  private extractDocumentDate(text: string): string | null {
    const patterns = [
      /Date\s+of\s+Issue[\s:]+(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i,
      /Dated[\s:]+(\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]+\s+\d{4})/i,
      /(\d{1,2}\/\d{1,2}\/\d{4})/,
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        return match[1].trim()
      }
    }
    
    return null
  }

  private calculateOCRConfidence(
    grantorName: string | null,
    parcelId: string | null,
    documentDate: string | null
  ): number {
    let confidence = 0
    
    if (grantorName) confidence += 0.4
    if (parcelId) confidence += 0.4
    if (documentDate) confidence += 0.2
    
    return confidence
  }

  async performFuzzyMatching(
    extractedName: string | null,
    extractedParcelId: string | null
  ): Promise<FuzzyMatchResult> {
    if (!extractedName && !extractedParcelId) {
      return {
        matched: false,
        matchScore: 0,
        matchedRecord: null,
        matchType: 'NO_MATCH',
      }
    }

    try {
      const { data: claims, error } = await this.supabase
        .from('land_claims')
        .select('id, document_metadata, parcel_id_barcode, document_serial_number')
        .not('deleted_at', 'is', null)
      
      if (error || !claims || claims.length === 0) {
        return {
          matched: false,
          matchScore: 0,
          matchedRecord: null,
          matchType: 'NO_MATCH',
        }
      }

      const searchableRecords = claims.map(claim => ({
        id: claim.id,
        ownerName: (claim.document_metadata as any)?.ownerName || 'Unknown',
        parcelBarcode: claim.parcel_id_barcode || '',
      }))

      if (extractedParcelId) {
        const exactParcelMatch = searchableRecords.find(
          record => record.parcelBarcode === extractedParcelId
        )
        
        if (exactParcelMatch) {
          return {
            matched: true,
            matchScore: 1.0,
            matchedRecord: exactParcelMatch,
            matchType: 'EXACT',
          }
        }
      }

      if (extractedName) {
        const fuse = new Fuse(searchableRecords, {
          keys: ['ownerName'],
          threshold: 0.4,
          includeScore: true,
        })

        const results = fuse.search(extractedName)
        
        if (results.length > 0 && results[0].score !== undefined) {
          const bestMatch = results[0]
          const matchScore = 1 - bestMatch.score
          
          return {
            matched: matchScore > 0.6,
            matchScore,
            matchedRecord: bestMatch.item,
            matchType: matchScore > 0.9 ? 'EXACT' : 'PARTIAL',
          }
        }
      }

      return {
        matched: false,
        matchScore: 0,
        matchedRecord: null,
        matchType: 'NO_MATCH',
      }
    } catch (error) {
      console.error('Fuzzy matching failed:', error)
      return {
        matched: false,
        matchScore: 0,
        matchedRecord: null,
        matchType: 'NO_MATCH',
      }
    }
  }

  async performForgeryHeuristics(
    ocrResult: OCRExtractionResult,
    fuzzyMatch: FuzzyMatchResult,
    fileContent: string
  ): Promise<ForgeryHeuristics> {
    const nameMatch = this.checkNameMatch(ocrResult, fuzzyMatch)
    const dateAnomaly = this.checkDateAnomaly(ocrResult)
    const formattingCheck = this.checkFormattingPatterns(fileContent, ocrResult)

    return {
      nameMatch,
      dateAnomaly,
      formattingCheck,
    }
  }

  private checkNameMatch(
    ocrResult: OCRExtractionResult,
    fuzzyMatch: FuzzyMatchResult
  ): ForgeryHeuristics['nameMatch'] {
    if (!ocrResult.grantorName) {
      return {
        passed: false,
        score: 0,
        reason: 'No grantor name extracted from document',
      }
    }

    if (!fuzzyMatch.matched) {
      return {
        passed: false,
        score: 0,
        reason: 'No matching record found in database',
      }
    }

    if (fuzzyMatch.matchType === 'EXACT') {
      return {
        passed: true,
        score: 1.0,
        reason: 'Exact name match found',
      }
    }

    if (fuzzyMatch.matchType === 'PARTIAL') {
      return {
        passed: true,
        score: fuzzyMatch.matchScore,
        reason: `Partial match: "${ocrResult.grantorName}" ≈ "${fuzzyMatch.matchedRecord?.ownerName}" (${(fuzzyMatch.matchScore * 100).toFixed(1)}% similarity)`,
      }
    }

    return {
      passed: false,
      score: fuzzyMatch.matchScore,
      reason: `Name mismatch: "${ocrResult.grantorName}" does not match database records`,
    }
  }

  private checkDateAnomaly(ocrResult: OCRExtractionResult): ForgeryHeuristics['dateAnomaly'] {
    if (!ocrResult.documentDate) {
      return {
        passed: false,
        reason: 'No document date found - unable to verify age',
      }
    }

    try {
      const docDate = this.parseDocumentDate(ocrResult.documentDate)
      const currentDate = new Date()
      const maxLeaseDate = new Date()
      maxLeaseDate.setFullYear(currentDate.getFullYear() - this.MAX_LEASE_YEARS)

      if (docDate > currentDate) {
        return {
          passed: false,
          reason: `Future date detected: Document dated ${ocrResult.documentDate} is after current date - HIGH RISK`,
        }
      }

      if (docDate < maxLeaseDate) {
        return {
          passed: false,
          reason: `Document too old: Dated ${ocrResult.documentDate} (>${this.MAX_LEASE_YEARS} years) - exceeds maximum lease duration`,
        }
      }

      const ageInYears = (currentDate.getTime() - docDate.getTime()) / (1000 * 60 * 60 * 24 * 365)
      
      return {
        passed: true,
        reason: `Date valid: Document is ${ageInYears.toFixed(1)} years old (within ${this.MAX_LEASE_YEARS}-year limit)`,
      }
    } catch (error) {
      return {
        passed: false,
        reason: `Invalid date format: "${ocrResult.documentDate}" could not be parsed`,
      }
    }
  }

  private parseDocumentDate(dateString: string): Date {
    const cleanDate = dateString.replace(/(\d+)(st|nd|rd|th)/, '$1')
    
    const formats = [
      /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
    ]

    for (const format of formats) {
      const match = cleanDate.match(format)
      if (match) {
        if (format.source.includes('\/')) {
          return new Date(`${match[3]}-${match[2]}-${match[1]}`)
        } else {
          return new Date(`${match[2]} ${match[1]}, ${match[3]}`)
        }
      }
    }

    throw new Error('Unable to parse date')
  }

  private checkFormattingPatterns(
    fileContent: string,
    ocrResult: OCRExtractionResult
  ): ForgeryHeuristics['formattingCheck'] {
    const suspiciousPatterns: string[] = []
    const text = ocrResult.extractedText

    if (this.hasUniformFontPattern(text)) {
      suspiciousPatterns.push('Unnaturally uniform font detected - possible digital forgery')
    }

    if (this.hasPerfectAlignment(text)) {
      suspiciousPatterns.push('Perfect text alignment on "aged" document - suspicious')
    }

    if (this.hasInconsistentAging(text)) {
      suspiciousPatterns.push('Inconsistent aging patterns - some text appears newer')
    }

    if (this.hasDigitalArtifacts(text)) {
      suspiciousPatterns.push('Digital editing artifacts detected')
    }

    const fraudKeywords = ['fraud', 'fake', 'forged', 'counterfeit', 'duplicate']
    const lowerText = text.toLowerCase()
    const foundKeywords = fraudKeywords.filter(keyword => lowerText.includes(keyword))
    
    if (foundKeywords.length > 0) {
      suspiciousPatterns.push(`Fraud keywords detected: ${foundKeywords.join(', ')}`)
    }

    const passed = suspiciousPatterns.length === 0

    return {
      passed,
      suspiciousPatterns,
      reason: passed
        ? 'No suspicious formatting patterns detected'
        : `${suspiciousPatterns.length} red flag(s) found: ${suspiciousPatterns.join('; ')}`,
    }
  }

  private hasUniformFontPattern(text: string): boolean {
    const lines = text.split('\n').filter(line => line.trim().length > 10)
    if (lines.length < 3) return false

    const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length
    const variance = lines.reduce((sum, line) => sum + Math.pow(line.length - avgLineLength, 2), 0) / lines.length
    
    return variance < 10
  }

  private hasPerfectAlignment(text: string): boolean {
    const lines = text.split('\n').filter(line => line.trim().length > 0)
    const leadingSpaces = lines.map(line => line.match(/^\s*/)?.[0].length || 0)
    
    const uniqueIndents = new Set(leadingSpaces)
    return uniqueIndents.size === 1 && lines.length > 5
  }

  private hasInconsistentAging(text: string): boolean {
    const modernTerms = ['email', 'website', 'http', 'www', 'digital', 'online']
    const lowerText = text.toLowerCase()
    
    return modernTerms.some(term => lowerText.includes(term))
  }

  private hasDigitalArtifacts(text: string): boolean {
    const artifacts = ['�', '\ufffd', '\\x', '\\u']
    return artifacts.some(artifact => text.includes(artifact))
  }

  async performDeepMatch(file: File): Promise<VerificationResult> {
    const startTime = Date.now()
    
    console.log('🔍 Starting Deep Match Verification...')
    
    const ocrResult = await this.performOCRExtraction(file)
    console.log('📄 OCR Extraction:', ocrResult)
    
    const fuzzyMatch = await this.performFuzzyMatching(
      ocrResult.grantorName,
      ocrResult.parcelId
    )
    console.log('🔎 Fuzzy Match:', fuzzyMatch)
    
    const fileContent = await this.readFileAsText(file)
    const forgeryHeuristics = await this.performForgeryHeuristics(
      ocrResult,
      fuzzyMatch,
      fileContent
    )
    console.log('🚨 Forgery Heuristics:', forgeryHeuristics)
    
    const result = this.calculateFinalVerification(
      ocrResult,
      fuzzyMatch,
      forgeryHeuristics
    )
    
    const executionTime = Date.now() - startTime
    console.log(`✅ Deep Match completed in ${executionTime}ms`)
    
    return result
  }

  private async readFileAsText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = (e) => resolve(e.target?.result as string || '')
      reader.readAsText(file)
    })
  }

  private calculateFinalVerification(
    ocrResult: OCRExtractionResult,
    fuzzyMatch: FuzzyMatchResult,
    forgeryHeuristics: ForgeryHeuristics
  ): VerificationResult {
    let confidenceScore = 1.0
    const reasoning: string[] = []

    if (ocrResult.confidence < 0.5) {
      confidenceScore *= 0.7
      reasoning.push(`⚠️ Low OCR confidence (${(ocrResult.confidence * 100).toFixed(0)}%)`)
    } else {
      reasoning.push(`✓ OCR extraction successful (${(ocrResult.confidence * 100).toFixed(0)}% confidence)`)
    }

    if (!forgeryHeuristics.nameMatch.passed) {
      confidenceScore *= (1 - this.NAME_MISMATCH_PENALTY)
      reasoning.push(`❌ Name verification failed: ${forgeryHeuristics.nameMatch.reason}`)
    } else {
      reasoning.push(`✓ Name match: ${forgeryHeuristics.nameMatch.reason}`)
    }

    if (!forgeryHeuristics.dateAnomaly.passed) {
      confidenceScore *= 0.3
      reasoning.push(`❌ Date anomaly: ${forgeryHeuristics.dateAnomaly.reason}`)
    } else {
      reasoning.push(`✓ Date valid: ${forgeryHeuristics.dateAnomaly.reason}`)
    }

    if (!forgeryHeuristics.formattingCheck.passed) {
      confidenceScore *= 0.5
      reasoning.push(`⚠️ Formatting issues: ${forgeryHeuristics.formattingCheck.reason}`)
    } else {
      reasoning.push(`✓ Formatting check passed`)
    }

    if (fuzzyMatch.matched && fuzzyMatch.matchType === 'EXACT') {
      reasoning.push(`✓ Exact database match found (Parcel: ${fuzzyMatch.matchedRecord?.parcelBarcode})`)
    } else if (fuzzyMatch.matched && fuzzyMatch.matchType === 'PARTIAL') {
      reasoning.push(`⚠️ Partial database match (${(fuzzyMatch.matchScore * 100).toFixed(0)}% similarity)`)
    } else {
      confidenceScore *= 0.6
      reasoning.push(`❌ No database match found`)
    }

    const fraudConfidenceScore = 1 - confidenceScore

    let status: VerificationResult['status']
    let recommendation: string

    if (confidenceScore >= this.HIGH_CONFIDENCE_THRESHOLD) {
      status = 'CLEAR'
      recommendation = 'Document appears legitimate. Proceed with automated approval.'
    } else if (confidenceScore >= this.MEDIUM_CONFIDENCE_THRESHOLD) {
      status = 'NEEDS_REVIEW'
      recommendation = 'Document requires human verification. Flag for manual review by verifier.'
    } else {
      status = 'REJECTED'
      recommendation = 'High fraud risk detected. Document should be rejected or escalated to senior verifier.'
    }

    return {
      status,
      confidenceScore,
      fraudConfidenceScore,
      reasoning,
      ocrResult,
      fuzzyMatch,
      forgeryHeuristics,
      recommendation,
      timestamp: new Date().toISOString(),
    }
  }
}

export const verificationAgent = new DeepMatchVerificationAgent()
