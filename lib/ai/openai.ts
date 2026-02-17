// OpenAI Integration for Document Analysis and Fraud Detection

import { runDemoVerification } from './demo-verification'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY not configured. AI document analysis will use fallback mode.')
}

export interface DocumentAnalysisInput {
  imageBase64?: string
  imageUrl?: string
  documentText?: string
}

export interface AIDocumentAnalysis {
  documentType: string
  grantorName: string | null
  granteeName: string | null
  parcelId: string | null
  plotNumber: string | null
  location: string | null
  issueDate: string | null
  expiryDate: string | null
  durationYears: number | null
  extractedText: string
  confidence: number
  isAuthentic: boolean
  fraudIndicators: string[]
  reasoning: string
}

export interface FraudDetectionResult {
  isFraudulent: boolean
  confidenceScore: number
  fraudIndicators: string[]
  authenticityMarkers: string[]
  reasoning: string
  recommendation: 'APPROVE' | 'REVIEW' | 'REJECT'
}

export async function analyzeDocumentWithGPT4(
  input: DocumentAnalysisInput
): Promise<AIDocumentAnalysis> {
  if (!OPENAI_API_KEY) {
    return getFallbackAnalysis(input.documentText || '')
  }

  try {
    const messages: any[] = [
      {
        role: 'system',
        content: `You are an expert document analyst specializing in West African land documents, particularly from Ghana, Nigeria, and other ECOWAS countries. Your task is to:

1. Identify the document type — distinguish clearly between:
   - **Indentures** (Stool Indenture, Family Indenture): private conveyance documents with survey plans, grantor/grantee details, witness signatures, and traditional authority consent. Often include a "PLAN OF LAND" with locality, district, region, surveyor certification, area, and grid coordinates.
   - **Land Titles / Certificates** (Certificate of Occupancy, Freehold, Leasehold, Deed of Assignment): government-issued documents with official seals, serial numbers, Lands Commission references, and registration stamps.
2. Extract key information: grantor/grantee names, parcel IDs, plot numbers, locations, dates, surveyor details
3. Assess document authenticity based on formatting, language, and official markers:
   - For **Indentures**: verify presence of surveyor certification and license number, witness signatures, traditional authority stamps/seals, proper "PLAN OF LAND" format with locality/district/region, area calculation, and grid coordinates
   - For **Land Titles**: verify government seals, serial numbers, Lands Commission file references, registration stamps, and proper legal language
4. Flag any potential fraud indicators

For documentType, use one of these exact values when possible:
- "Stool Indenture", "Family Indenture", "Certificate of Occupancy", "Freehold", "Leasehold", "Governor's Consent", "Deed of Assignment", "Customary Freehold"

Respond in JSON format with the following structure:
{
  "documentType": "string (use exact values listed above)",
  "grantorName": "string or null",
  "granteeName": "string or null", 
  "parcelId": "string or null",
  "plotNumber": "string or null",
  "location": "string or null",
  "issueDate": "string (ISO format) or null",
  "expiryDate": "string (ISO format) or null",
  "durationYears": "number or null",
  "extractedText": "string (key text from document)",
  "confidence": "number 0-1",
  "isAuthentic": "boolean",
  "fraudIndicators": ["array of suspicious elements"],
  "reasoning": "string explaining your analysis"
}`
      }
    ]

    if (input.imageBase64) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this land document image. Extract all relevant information and assess its authenticity.'
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${input.imageBase64}`,
              detail: 'high'
            }
          }
        ]
      })
    } else if (input.imageUrl) {
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Analyze this land document image. Extract all relevant information and assess its authenticity.'
          },
          {
            type: 'image_url',
            image_url: {
              url: input.imageUrl,
              detail: 'high'
            }
          }
        ]
      })
    } else if (input.documentText) {
      messages.push({
        role: 'user',
        content: `Analyze this land document text. Extract all relevant information and assess its authenticity:\n\n${input.documentText}`
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages,
        max_tokens: 2000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('OpenAI API error:', error)
      return getFallbackAnalysis(input.documentText || '')
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return getFallbackAnalysis(input.documentText || '')
    }

    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        documentType: parsed.documentType || 'Unknown',
        grantorName: parsed.grantorName,
        granteeName: parsed.granteeName,
        parcelId: parsed.parcelId,
        plotNumber: parsed.plotNumber,
        location: parsed.location,
        issueDate: parsed.issueDate,
        expiryDate: parsed.expiryDate,
        durationYears: parsed.durationYears,
        extractedText: parsed.extractedText || '',
        confidence: parsed.confidence || 0.5,
        isAuthentic: parsed.isAuthentic ?? true,
        fraudIndicators: parsed.fraudIndicators || [],
        reasoning: parsed.reasoning || ''
      }
    }

    return getFallbackAnalysis(input.documentText || '')
  } catch (error) {
    console.error('GPT-4 document analysis failed:', error)
    return getFallbackAnalysis(input.documentText || '')
  }
}

export async function detectFraudWithGPT4(
  documentAnalysis: AIDocumentAnalysis,
  additionalContext?: {
    claimantName?: string
    expectedLocation?: string
    previousClaims?: number
  }
): Promise<FraudDetectionResult> {
  if (!OPENAI_API_KEY) {
    return getFallbackFraudDetection(documentAnalysis)
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a fraud detection expert specializing in land document verification in West Africa. Analyze the provided document analysis and context to determine fraud risk.

Consider these fraud indicators:
1. Name mismatches between claimant and document
2. Suspicious formatting or modern fonts on "old" documents
3. Inconsistent dates (future dates, impossible timelines)
4. Missing official seals or signatures
5. Duplicate parcel IDs
6. Location inconsistencies
7. Unusual document language or terminology
8. Digital editing artifacts

Respond in JSON format:
{
  "isFraudulent": "boolean",
  "confidenceScore": "number 0-1 (1 = definitely fraudulent, 0 = definitely authentic)",
  "fraudIndicators": ["array of detected issues"],
  "authenticityMarkers": ["array of positive authenticity signs"],
  "reasoning": "detailed explanation",
  "recommendation": "APPROVE | REVIEW | REJECT"
}`
          },
          {
            role: 'user',
            content: `Analyze this document for fraud:

Document Analysis:
${JSON.stringify(documentAnalysis, null, 2)}

Additional Context:
${additionalContext ? JSON.stringify(additionalContext, null, 2) : 'None provided'}

Provide your fraud assessment.`
          }
        ],
        max_tokens: 1500,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      return getFallbackFraudDetection(documentAnalysis)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      return getFallbackFraudDetection(documentAnalysis)
    }

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        isFraudulent: parsed.isFraudulent ?? false,
        confidenceScore: parsed.confidenceScore ?? 0.5,
        fraudIndicators: parsed.fraudIndicators || [],
        authenticityMarkers: parsed.authenticityMarkers || [],
        reasoning: parsed.reasoning || '',
        recommendation: parsed.recommendation || 'REVIEW'
      }
    }

    return getFallbackFraudDetection(documentAnalysis)
  } catch (error) {
    console.error('GPT-4 fraud detection failed:', error)
    return getFallbackFraudDetection(documentAnalysis)
  }
}

export async function analyzeImageForTampering(
  imageBase64: string
): Promise<{
  hasTampering: boolean
  confidence: number
  indicators: string[]
  reasoning: string
}> {
  if (!OPENAI_API_KEY) {
    return {
      hasTampering: false,
      confidence: 0.5,
      indicators: [],
      reasoning: 'AI analysis unavailable - using fallback mode'
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are an expert in digital forensics and document tampering detection. Analyze images for signs of:
1. Digital editing (Photoshop, etc.)
2. Cut-and-paste artifacts
3. Inconsistent lighting/shadows
4. Font inconsistencies
5. Resolution mismatches
6. JPEG compression artifacts around edited areas
7. Cloning or healing brush marks

Respond in JSON:
{
  "hasTampering": "boolean",
  "confidence": "number 0-1",
  "indicators": ["array of detected tampering signs"],
  "reasoning": "explanation"
}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this document image for signs of digital tampering or editing.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: 'high'
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.1
      })
    })

    if (!response.ok) {
      return {
        hasTampering: false,
        confidence: 0.5,
        indicators: [],
        reasoning: 'Analysis failed - using fallback'
      }
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    const jsonMatch = content?.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return {
        hasTampering: parsed.hasTampering ?? false,
        confidence: parsed.confidence ?? 0.5,
        indicators: parsed.indicators || [],
        reasoning: parsed.reasoning || ''
      }
    }

    return {
      hasTampering: false,
      confidence: 0.5,
      indicators: [],
      reasoning: 'Could not parse analysis result'
    }
  } catch (error) {
    console.error('Tampering analysis failed:', error)
    return {
      hasTampering: false,
      confidence: 0.5,
      indicators: [],
      reasoning: 'Analysis error - using fallback'
    }
  }
}

// Fallback functions when OpenAI is not available
function getFallbackAnalysis(text: string): AIDocumentAnalysis {
  const demoResult = runDemoVerification(text)
  
  return {
    documentType: demoResult.documentType,
    grantorName: demoResult.grantorName,
    granteeName: demoResult.granteeName,
    parcelId: demoResult.parcelId,
    plotNumber: demoResult.parcelId,
    location: demoResult.location,
    issueDate: null,
    expiryDate: null,
    durationYears: null,
    extractedText: demoResult.extractedText,
    confidence: demoResult.confidence,
    isAuthentic: demoResult.isAuthentic,
    fraudIndicators: demoResult.fraudIndicators,
    reasoning: demoResult.reasoning
  }
}

function getFallbackFraudDetection(analysis: AIDocumentAnalysis): FraudDetectionResult {
  const indicators: string[] = []
  let fraudScore = 0

  // Basic heuristic checks
  if (!analysis.grantorName) {
    indicators.push('Missing grantor name')
    fraudScore += 0.2
  }

  if (!analysis.parcelId && !analysis.plotNumber) {
    indicators.push('Missing parcel/plot identification')
    fraudScore += 0.2
  }

  if (!analysis.issueDate) {
    indicators.push('Missing issue date')
    fraudScore += 0.1
  }

  if (analysis.fraudIndicators.length > 0) {
    indicators.push(...analysis.fraudIndicators)
    fraudScore += analysis.fraudIndicators.length * 0.15
  }

  fraudScore = Math.min(fraudScore, 1)

  return {
    isFraudulent: fraudScore > 0.5,
    confidenceScore: fraudScore,
    fraudIndicators: indicators,
    authenticityMarkers: analysis.isAuthentic ? ['Document structure appears valid'] : [],
    reasoning: 'Fallback fraud detection - basic heuristics applied',
    recommendation: fraudScore > 0.6 ? 'REJECT' : fraudScore > 0.3 ? 'REVIEW' : 'APPROVE'
  }
}

// Utility to convert File to base64
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Remove data URL prefix
      const base64 = result.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// Check if OpenAI is configured
export function isOpenAIConfigured(): boolean {
  return !!OPENAI_API_KEY
}
