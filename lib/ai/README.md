# AI Verification Agents

This directory contains the modular AI agent architecture for land claim verification.

## Available Agents

### 1. DocumentAnalysisAgent
Extracts and validates information from land documents.

**Input**: `string` (document URL)  
**Output**: `DocumentAnalysisResult`  
**Confidence Score**: 0.75 (placeholder)

### 2. GPSValidationAgent
Validates GPS coordinates against satellite imagery.

**Input**: `{ lat: number; lng: number }`  
**Output**: `GPSValidationResult`  
**Confidence Score**: 0.82 (placeholder)

### 3. CrossReferenceAgent
Checks for conflicting claims in the database.

**Input**: `string` (claim ID)  
**Output**: `CrossReferenceResult`  
**Confidence Score**: 0.90 (placeholder)

### 4. MockVerificationAgent ⭐
**NEW**: Simulates OCR and satellite verification with fraud detection.

**Input**: `MockVerificationInput`
```typescript
{
  documentText: string
  documentUrl: string
  latitude: number
  longitude: number
}
```

**Output**: `MockVerificationResult`
```typescript
{
  ocrExtractedText: string
  satelliteCheckPassed: boolean
  fraudDetected: boolean
  confidenceScore: number  // 0.20 if fraud detected, 0.95 otherwise
  reasoning: string
}
```

**Logic**:
- If the word "fraud" (case-insensitive) is found in `documentText`:
  - `confidenceScore` = **0.20** (LOW)
  - `fraudDetected` = true
  - `satelliteCheckPassed` = false
- Otherwise:
  - `confidenceScore` = **0.95** (HIGH)
  - `fraudDetected` = false
  - `satelliteCheckPassed` = true

## Usage Example

### Basic Usage

```typescript
import { MockVerificationAgent } from '@/lib/ai/verification'

const agent = new MockVerificationAgent()

const input = {
  documentText: 'Land Title Certificate for Plot 123',
  documentUrl: 'https://example.com/doc.pdf',
  latitude: 5.6037,
  longitude: -0.1870,
}

const result = await agent.execute(input)

console.log('Confidence Score:', result.confidenceScore) // 0.95
console.log('Fraud Detected:', result.data?.fraudDetected) // false
console.log('Reasoning:', result.data?.reasoning)
```

### Testing Fraud Detection

```typescript
const fraudInput = {
  documentText: 'This document contains Fraud',
  documentUrl: 'https://example.com/fraud-doc.pdf',
  latitude: 5.6037,
  longitude: -0.1870,
}

const fraudResult = await agent.execute(fraudInput)

console.log('Confidence Score:', fraudResult.confidenceScore) // 0.20
console.log('Fraud Detected:', fraudResult.data?.fraudDetected) // true
```

### Running the Demo

```typescript
import { runMockVerificationDemo } from '@/lib/ai/mock-verification-demo'

// Run all test cases
await runMockVerificationDemo()
```

## Verification Pipeline

The `VerificationPipeline` class orchestrates multiple agents:

```typescript
import { VerificationPipeline } from '@/lib/ai/verification'

const pipeline = new VerificationPipeline()

const result = await pipeline.execute({
  claimId: 'claim-123',
  documentUrl: 'https://example.com/doc.pdf',
  latitude: 5.6037,
  longitude: -0.1870,
})

console.log('Overall Confidence:', result.overallConfidence)
console.log('Recommendation:', result.recommendation)
// AUTO_APPROVE | HUMAN_REVIEW | REJECT
```

## Confidence Score Standards

All agents follow the project's "Vibe Coding" standards:

- **HIGH (≥0.85)**: Auto-approve with notification
- **MEDIUM (0.60-0.84)**: Queue for human review  
- **LOW (<0.60)**: Require manual approval

## Adding New Agents

1. Implement the `Agent<TInput, TOutput>` interface
2. Include a `confidenceScore` property
3. Return `AgentResult<T>` from `execute()` method
4. Document confidence calculation methodology
5. Add tests for the new agent

## Notes

- All agents are **async** to support future API integrations
- Execution time is tracked automatically
- Errors are caught and returned in the result object
- The MockVerificationAgent is for **demo purposes** - replace with real OCR/satellite APIs in production
