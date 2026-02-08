# AI Verification Agent Service

## Overview

The Deep Match Verification Agent performs comprehensive document verification using OCR extraction, fuzzy matching, and forgery detection heuristics.

## Features

### 1. OCR Extraction
Extracts key information from uploaded land documents:
- **Grantor/Vendor Name** - Owner or granting authority
- **Parcel ID** - Ghana Land Act 2020 compliant barcode
- **Document Date** - Issue date for age verification

### 2. Fuzzy Matching
Uses Fuse.js to match extracted names against database records:
- **Exact Match** - 100% similarity (e.g., "Kofi Mensah" = "Kofi Mensah")
- **Partial Match** - 60-99% similarity (e.g., "Kofi Mensah" ≈ "Kofi A. Mensah")
- **No Match** - <60% similarity

### 3. Forgery Heuristics

#### Name Mismatch Detection
- Compares extracted name with database records
- **50% penalty** for significant name differences
- Flags partial matches for human review

#### Date Anomaly Detection
- **Future Date**: Document dated after current date → HIGH RISK
- **Too Old**: Document >99 years old (exceeds max lease) → REJECT
- **Valid**: Within 0-99 year range → PASS

#### Formatting Pattern Analysis
- **Uniform Font**: Unnaturally consistent fonts on "aged" documents
- **Perfect Alignment**: Suspiciously straight text lines
- **Inconsistent Aging**: Modern terms on old documents
- **Digital Artifacts**: Evidence of digital manipulation
- **Fraud Keywords**: Detection of words like "fraud", "fake", "forged"

## Usage

### Basic Implementation

```typescript
import { verificationAgent } from '@/services/verificationAgent'

// Perform deep match verification
const result = await verificationAgent.performDeepMatch(file)

console.log('Status:', result.status) // 'CLEAR' | 'NEEDS_REVIEW' | 'REJECTED'
console.log('Confidence:', result.confidenceScore) // 0.0 - 1.0
console.log('Fraud Score:', result.fraudConfidenceScore) // 0.0 - 1.0
```

### Integration with Claim Intake Form

The verification agent is automatically triggered when a user uploads a document:

```typescript
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files[0]
  
  // Trigger AI verification immediately
  const result = await verificationAgent.performDeepMatch(file)
  
  // Display results in real-time
  setVerificationResult(result)
}
```

## Verification Result Structure

```typescript
interface VerificationResult {
  status: 'CLEAR' | 'NEEDS_REVIEW' | 'REJECTED'
  confidenceScore: number              // Overall confidence (0-1)
  fraudConfidenceScore: number         // Fraud risk (0-1)
  reasoning: string[]                  // Human-readable explanations
  ocrResult: OCRExtractionResult
  fuzzyMatch: FuzzyMatchResult
  forgeryHeuristics: ForgeryHeuristics
  recommendation: string               // Action recommendation
  timestamp: string                    // ISO 8601 timestamp
}
```

## Confidence Score Calculation

The agent calculates confidence based on multiple factors:

```typescript
Base Score: 1.0

Penalties:
- Low OCR confidence (<50%): × 0.7
- Name mismatch: × 0.5 (50% penalty)
- Date anomaly: × 0.3 (70% penalty)
- Formatting issues: × 0.5 (50% penalty)
- No database match: × 0.6 (40% penalty)

Final Score = Base × All Penalties
```

### Score Thresholds

| Score Range | Status | Action |
|-------------|--------|--------|
| ≥85% | CLEAR | Auto-approve with notification |
| 60-84% | NEEDS_REVIEW | Queue for human verifier |
| <60% | REJECTED | Require manual approval or reject |

## OCR Extraction Details

### Mock Implementation

Currently uses mock OCR extraction with pattern matching:

```typescript
// Example extracted text
const mockText = `
  REPUBLIC OF GHANA
  LANDS COMMISSION
  
  CERTIFICATE OF OCCUPANCY
  
  Serial Number: GLC/2026/001234
  Parcel ID: GH20260001234
  
  This is to certify that KOFI MENSAH
  Vendor/Grantor: GHANA LANDS COMMISSION
  Date of Issue: 15th January 2026
`
```

### Production Integration

For production, integrate with:
- **Tesseract.js** - Open-source OCR library
- **Google Cloud Vision API** - High-accuracy OCR
- **AWS Textract** - Document analysis
- **Azure Computer Vision** - OCR and document understanding

```typescript
// Example Tesseract.js integration
import Tesseract from 'tesseract.js'

async extractTextFromImage(file: File): Promise<string> {
  const { data: { text } } = await Tesseract.recognize(file, 'eng')
  return text
}
```

## Fuzzy Matching Algorithm

Uses Fuse.js with optimized settings:

```typescript
const fuse = new Fuse(records, {
  keys: ['ownerName'],
  threshold: 0.4,        // Max distance (lower = stricter)
  includeScore: true,
})

// Search returns scored results
const results = fuse.search('Kofi Mensah')
// [{ item: {...}, score: 0.1 }] // score: 0 = perfect, 1 = no match
```

### Match Score Conversion

```typescript
matchScore = 1 - fuseScore

Examples:
- Fuse score 0.0 → Match score 1.0 (100% - EXACT)
- Fuse score 0.1 → Match score 0.9 (90% - EXACT)
- Fuse score 0.3 → Match score 0.7 (70% - PARTIAL)
- Fuse score 0.5 → Match score 0.5 (50% - NO_MATCH)
```

## Forgery Detection Examples

### Example 1: Future Date Detection

```typescript
Document Date: "15th March 2027"
Current Date: "1st February 2026"

Result:
✗ Date anomaly: Future date detected
Status: REJECTED
Confidence: 30%
```

### Example 2: Name Mismatch

```typescript
Extracted: "John Doe"
Database: "Kofi Mensah"

Result:
✗ Name mismatch: No matching record found
Status: REJECTED
Confidence: 40%
```

### Example 3: Partial Match Success

```typescript
Extracted: "Kofi Mensah"
Database: "Kofi A. Mensah"

Result:
✓ Partial match: 85% similarity
Status: NEEDS_REVIEW
Confidence: 75%
```

### Example 4: Perfect Verification

```typescript
Extracted: "Kofi Mensah"
Database: "Kofi Mensah"
Parcel ID: "GH20260001234" (exact match)
Date: "15th January 2026" (valid)
Formatting: No suspicious patterns

Result:
✓ All checks passed
Status: CLEAR
Confidence: 95%
```

## Real-Time UI Integration

The ClaimIntakeForm displays verification results in real-time:

### Loading State
```
🔄 Running AI Deep Match Verification...
Extracting text, matching records, and checking for forgery patterns
```

### Success State (CLEAR)
```
✓ Document Verified  [Shield Icon] 95%

✓ OCR extraction successful (100% confidence)
✓ Name match: Exact match found
✓ Date valid: Document is 0.1 years old
✓ Formatting check passed
✓ Exact database match found (Parcel: GH20260001234)

Extracted Information:
Grantor: KOFI MENSAH
Parcel ID: GH20260001234
Date: 15th January 2026
Match: EXACT (100%)

Recommendation: Document appears legitimate. Proceed with automated approval.
```

### Warning State (NEEDS_REVIEW)
```
⚠ Review Required  [Shield Icon] 72%

✓ OCR extraction successful (80% confidence)
⚠ Partial match: "Kofi Mensah" ≈ "Kofi A. Mensah" (85% similarity)
✓ Date valid: Document is 2.3 years old
✓ Formatting check passed

Recommendation: Document requires human verification.
```

### Error State (REJECTED)
```
✗ High Risk Detected  [Shield Icon] 25%

⚠ Low OCR confidence (40%)
✗ Name verification failed: No matching record found
✗ Date anomaly: Future date detected - HIGH RISK
⚠ Formatting issues: 2 red flag(s) found

Recommendation: High fraud risk detected. Document should be rejected.
```

## Testing

### Test Case 1: Legitimate Document

```typescript
const file = new File(['...'], 'legitimate.pdf')
const result = await verificationAgent.performDeepMatch(file)

expect(result.status).toBe('CLEAR')
expect(result.confidenceScore).toBeGreaterThan(0.85)
```

### Test Case 2: Fraudulent Document

```typescript
// Document with "fraud" keyword
const file = new File(['This document contains fraud'], 'fraud.pdf')
const result = await verificationAgent.performDeepMatch(file)

expect(result.status).toBe('REJECTED')
expect(result.forgeryHeuristics.formattingCheck.passed).toBe(false)
```

### Test Case 3: Partial Name Match

```typescript
// Database has "Kofi A. Mensah"
// Document has "Kofi Mensah"
const result = await verificationAgent.performDeepMatch(file)

expect(result.status).toBe('NEEDS_REVIEW')
expect(result.fuzzyMatch.matchType).toBe('PARTIAL')
```

## Performance Considerations

- **OCR Processing**: ~2-5 seconds per document
- **Database Query**: ~100-500ms
- **Fuzzy Matching**: ~50-200ms for 1000 records
- **Total Time**: ~3-6 seconds per verification

### Optimization Tips

1. **Cache Database Records**: Load once, reuse for multiple verifications
2. **Parallel Processing**: Run OCR and database query simultaneously
3. **Index Optimization**: Ensure `parcel_id_barcode` is indexed
4. **Batch Verification**: Process multiple documents in parallel

## Error Handling

The agent gracefully handles errors:

```typescript
try {
  const result = await verificationAgent.performDeepMatch(file)
} catch (error) {
  // Returns fallback result with NEEDS_REVIEW status
  // Ensures system never blocks user flow
}
```

## Future Enhancements

- [ ] Real Tesseract.js integration
- [ ] LLM Vision API integration (GPT-4 Vision, Claude Vision)
- [ ] Blockchain hash verification
- [ ] Satellite imagery cross-reference
- [ ] Multi-language OCR support (Twi, Yoruba, Igbo)
- [ ] Handwriting recognition for signatures
- [ ] Stamp/seal verification
- [ ] QR code scanning for digital certificates

## Dependencies

```json
{
  "fuse.js": "^7.0.0",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0"
}
```

## Related Files

- `@/services/verificationAgent.ts` - Main service implementation
- `@/components/ClaimIntakeForm.tsx` - UI integration
- `@/lib/ai/verification.ts` - AI agent base classes
- `@/types/database.types.ts` - Database type definitions

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintained By**: AI Verification Team
