// Demo verification fallback for when OpenAI is not configured
export interface DemoVerificationResult {
  documentType: string
  confidence: number
  isAuthentic: boolean
  fraudIndicators: string[]
  reasoning: string
  extractedText: string
  grantorName?: string | null
  granteeName?: string | null
  parcelId?: string | null
  location?: string | null
}

export function runDemoVerification(documentText: string): DemoVerificationResult {
  const lowerText = documentText.toLowerCase()
  
  // Simple pattern matching for demo purposes
  const isIndenture = /indenture|plan\s*of\s*land|stool|family/.test(lowerText)
  const isCertificate = /certificate\s*of\s*occupancy|certificate|occupancy/.test(lowerText)
  const isDeed = /deed\s*of\s*assignment|deed|assignment/.test(lowerText)
  
  let documentType = 'Unknown'
  if (isIndenture) documentType = 'Indenture'
  else if (isCertificate) documentType = 'Certificate of Occupancy'
  else if (isDeed) documentType = 'Deed of Assignment'
  
  // Extract basic info with simple regex
  const parcelMatch = documentText.match(/(?:parcel|plot)\s*(?:id|no)?\.?\s*([A-Z0-9\/\-]{3,})/i)
  const ownerMatch = documentText.match(/(?:for|owner|grantee|name)[:\s]+([A-Z][a-z\s]+)/i)
  const locationMatch = documentText.match(/(?:location|address|situated)[:\s]+([A-Z][a-z\s,]+)/i)
  
  const fraudIndicators: string[] = []
  let confidence = 0.7 // Base confidence for demo
  
  // Simple fraud detection
  if (documentText.length < 100) {
    fraudIndicators.push('Document text seems too short')
    confidence -= 0.2
  }
  
  if (!/[0-9]{4}/.test(documentText)) {
    fraudIndicators.push('No year/date detected')
    confidence -= 0.1
  }
  
  if (!parcelMatch) {
    fraudIndicators.push('No parcel ID detected')
    confidence -= 0.1
  }
  
  const isAuthentic = confidence > 0.5
  
  return {
    documentType,
    confidence: Math.max(0.1, Math.min(0.95, confidence)),
    isAuthentic,
    fraudIndicators,
    reasoning: `Demo analysis detected this as a ${documentType}. ${isAuthentic ? 'Document appears authentic based on structure.' : 'Document has some suspicious elements.'}`,
    extractedText: documentText.substring(0, 500) + (documentText.length > 500 ? '...' : ''),
    grantorName: ownerMatch?.[1]?.trim() || null,
    granteeName: ownerMatch?.[1]?.trim() || null,
    parcelId: parcelMatch?.[1]?.trim() || null,
    location: locationMatch?.[1]?.trim() || null,
  }
}
