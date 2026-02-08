# Admin Audit Dashboard

## Overview

The Human-in-the-Loop Audit Dashboard provides a comprehensive interface for verifiers to review AI-verified land claims and make final approval/rejection decisions.

## Features

### 1. Split-Screen Layout

**Left Panel**: High-resolution document viewer
- Zoom controls (50% - 300%)
- Rotation support (90° increments)
- Fullscreen mode
- Highlight overlay for AI-detected areas

**Right Panel**: AI extracted data and evidence
- Extracted information display
- Evidence cards with confidence scores
- AI reasoning trace
- Previous auditor notes

### 2. Evidence Cards

Each verification finding is displayed as a card with:

- **Status Badge**: Success (green), Warning (yellow), Critical (red)
- **Reasoning String**: Detailed explanation of the finding
- **Confidence Score**: Visual progress bar (0-100%)
- **Highlight Button**: Draws red box on document at detected location

Example Evidence Items:
- Grantor Name Verification
- Parcel ID Verification
- Document Date Validation
- GPS Coordinates Cross-Reference
- Signature/Thumbprint Verification
- Forgery Pattern Analysis

### 3. Document Viewer with Highlighting

**Toolbar Controls**:
- Zoom In/Out
- Rotation
- Reset View
- Fullscreen Toggle

**Highlight Feature**:
- Click "Highlight on Document" button on any evidence card
- Red animated box appears on document
- Label shows "AI Detected Area"
- Clear button to remove highlight

**Mobile Support**:
- Touch-friendly controls
- Responsive layout for tablets
- Optimized for field use

### 4. AI Reasoning Trace

Collapsible timeline showing step-by-step AI decision process:

**Each Step Shows**:
- Agent name (e.g., "OCR Extraction Agent")
- Execution time in milliseconds
- Confidence score
- Status (success/warning/error)
- Input/output data (expandable)
- Reasoning explanation

**Summary**:
- Total execution time
- Final confidence score
- Overall assessment

### 5. Decision Console

Fixed bottom bar with:

**Auditor Notes** (Required):
- Text area for documentation
- Character counter (500 max)
- Required for audit trail

**Action Buttons**:
- **Reject & Log Dispute** (Red)
  - Flags claim for investigation
  - Creates dispute record
  
- **Approve & Mint to Blockchain** (Green)
  - Initiates NFT minting
  - Permanent blockchain record

**Warning**: Decisions are immutable once recorded on blockchain

## Usage

### Accessing the Dashboard

```
/admin/claims/[claim-id]
```

Example:
```
/admin/claims/123e4567-e89b-12d3-a456-426614174000
```

### Workflow

1. **Review Claim Information**
   - Claimant details
   - Location and coordinates
   - Submission date
   - Document type

2. **Examine Document**
   - Use zoom to inspect details
   - Rotate if needed
   - Enter fullscreen for better view

3. **Review Evidence Cards**
   - Check each verification finding
   - Click "Highlight" to see location on document
   - Review confidence scores

4. **Inspect AI Reasoning**
   - Expand reasoning trace
   - Review each agent's decision
   - Check input/output data

5. **Make Decision**
   - Add detailed auditor notes
   - Click Approve or Reject
   - Confirm action

### Evidence Status Meanings

| Status | Color | Meaning |
|--------|-------|---------|
| Success | Green | Verification passed |
| Warning | Yellow | Needs attention but not critical |
| Critical | Red | Verification failed |

### Confidence Score Thresholds

| Score | Level | Recommendation |
|-------|-------|----------------|
| ≥85% | High | Auto-approve candidate |
| 60-84% | Medium | Human review required |
| <60% | Low | Likely rejection |

## Components

### EvidenceCard

```typescript
<EvidenceCard
  evidence={{
    id: 'name-match',
    title: 'Grantor Name Verification',
    status: 'warning',
    reasoning: 'Partial match detected...',
    confidence: 0.88,
    highlightArea: { x: 15, y: 25, width: 30, height: 8 }
  }}
  onHighlight={(area) => {
    // Show highlight on document
  }}
/>
```

### DocumentViewer

```typescript
<DocumentViewer
  documentUrl="https://example.com/doc.pdf"
  highlightArea={{ x: 15, y: 25, width: 30, height: 8 }}
  onClearHighlight={() => {
    // Clear highlight
  }}
/>
```

### AIReasoningTrace

```typescript
<AIReasoningTrace
  steps={[
    {
      id: 'step-1',
      agentName: 'OCR Extraction Agent',
      timestamp: '2026-02-01T03:30:00Z',
      confidenceScore: 0.95,
      executionTimeMs: 2341,
      status: 'success',
      reasoning: 'Successfully extracted text...'
    }
  ]}
  finalScore={0.88}
/>
```

### DecisionConsole

```typescript
<DecisionConsole
  claimId="claim-123"
  onApprove={async (notes) => {
    // Handle approval
  }}
  onReject={async (notes) => {
    // Handle rejection
  }}
/>
```

## Mobile Responsiveness

### Tablet Optimization (768px - 1024px)

- Split-screen becomes stacked layout
- Document viewer maintains aspect ratio
- Evidence cards stack vertically
- Decision console remains fixed at bottom
- Touch-friendly button sizes (min 44x44px)

### Phone Optimization (<768px)

- Single column layout
- Document viewer full width
- Collapsible sections
- Sticky header with key info
- Bottom sheet for decision console

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `+` | Zoom in |
| `-` | Zoom out |
| `R` | Rotate document |
| `F` | Toggle fullscreen |
| `ESC` | Exit fullscreen |
| `H` | Clear highlight |

## Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Screen reader friendly
- High contrast mode compatible
- Focus indicators visible

## Security

- Role-based access (VERIFIER, ADMIN only)
- Audit trail for all decisions
- Immutable blockchain records
- Encrypted notes storage
- Session timeout after inactivity

## Performance

- Lazy loading for document images
- Virtualized evidence list for large datasets
- Debounced zoom/pan operations
- Optimized re-renders with React.memo
- Progressive image loading

## Testing

### Manual Testing Checklist

- [ ] Document loads and displays correctly
- [ ] Zoom controls work smoothly
- [ ] Rotation maintains image quality
- [ ] Fullscreen mode functions
- [ ] Highlight appears at correct location
- [ ] Evidence cards show proper status
- [ ] Reasoning trace expands/collapses
- [ ] Notes are required before decision
- [ ] Approve button triggers confirmation
- [ ] Reject button triggers confirmation
- [ ] Mobile layout is usable
- [ ] Tablet layout is optimized

### Test Data

Use the mock data generators in the page component:
- `generateMockEvidenceItems()`
- `generateMockReasoningSteps()`

## Troubleshooting

### Document Not Loading

- Check `original_document_url` in database
- Verify CORS settings on storage
- Check browser console for errors

### Highlight Not Appearing

- Verify `highlightArea` coordinates (0-100%)
- Check if document image has loaded
- Ensure coordinates are within bounds

### Decision Buttons Disabled

- Verify auditor notes are not empty
- Check user role permissions
- Ensure claim status allows decisions

## Future Enhancements

- [ ] Side-by-side document comparison
- [ ] Annotation tools (draw, text, arrows)
- [ ] Voice notes recording
- [ ] Batch approval workflow
- [ ] Real-time collaboration
- [ ] Document version history
- [ ] Export audit report as PDF
- [ ] Integration with blockchain explorer

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Maintained By**: Admin Dashboard Team
