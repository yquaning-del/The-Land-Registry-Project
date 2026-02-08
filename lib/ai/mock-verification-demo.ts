import { MockVerificationAgent, MockVerificationInput } from './verification'

export async function runMockVerificationDemo() {
  const agent = new MockVerificationAgent()

  console.log('=== Mock Verification Agent Demo ===\n')

  const testCase1: MockVerificationInput = {
    documentText: 'This is a legitimate land title certificate for Plot 123',
    documentUrl: 'https://example.com/doc1.pdf',
    latitude: 5.6037,
    longitude: -0.1870,
  }

  console.log('Test Case 1: Legitimate Document')
  console.log('Document Text:', testCase1.documentText)
  const result1 = await agent.execute(testCase1)
  console.log('Result:', {
    success: result1.success,
    confidenceScore: result1.confidenceScore,
    fraudDetected: result1.data?.fraudDetected,
    reasoning: result1.data?.reasoning,
    executionTime: `${result1.executionTimeMs}ms`,
  })
  console.log('\n---\n')

  const testCase2: MockVerificationInput = {
    documentText: 'This document contains evidence of Fraud and should be rejected',
    documentUrl: 'https://example.com/doc2.pdf',
    latitude: 5.6037,
    longitude: -0.1870,
  }

  console.log('Test Case 2: Fraudulent Document')
  console.log('Document Text:', testCase2.documentText)
  const result2 = await agent.execute(testCase2)
  console.log('Result:', {
    success: result2.success,
    confidenceScore: result2.confidenceScore,
    fraudDetected: result2.data?.fraudDetected,
    reasoning: result2.data?.reasoning,
    executionTime: `${result2.executionTimeMs}ms`,
  })
  console.log('\n---\n')

  const testCase3: MockVerificationInput = {
    documentText: 'Land Certificate - Owner: John Doe, Plot: ABC-456, No issues detected',
    documentUrl: 'https://example.com/doc3.pdf',
    latitude: 6.6745,
    longitude: -1.5716,
  }

  console.log('Test Case 3: Another Legitimate Document')
  console.log('Document Text:', testCase3.documentText)
  const result3 = await agent.execute(testCase3)
  console.log('Result:', {
    success: result3.success,
    confidenceScore: result3.confidenceScore,
    fraudDetected: result3.data?.fraudDetected,
    reasoning: result3.data?.reasoning,
    executionTime: `${result3.executionTimeMs}ms`,
  })

  console.log('\n=== Demo Complete ===')
}
