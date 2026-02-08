# DocumentHighlighter Component

## Overview

A robust React component that overlays AI-detected bounding boxes on land deed images with smooth animations, interactive tooltips, and responsive behavior.

## Features

### ✨ Core Capabilities

- **Normalized Coordinates**: Uses `{x0, y0, x1, y1}` format (0-100 scale)
- **Responsive Canvas**: Automatically scales with image size
- **Framer Motion Animations**: Smooth transitions and focus effects
- **Interactive Tooltips**: Show confidence scores and extracted text
- **Sidebar Sync**: `focusElement()` function for external control
- **Category Colors**: Different colors for different detection types
- **Window Resize Handling**: Maintains correct positioning on resize

## Installation

```bash
npm install framer-motion
```

Already included in `package.json`:
```json
{
  "dependencies": {
    "framer-motion": "^11.0.0"
  }
}
```

## Data Structure

### BoundingBox Interface

```typescript
interface BoundingBox {
  id: string                    // Unique identifier
  x0: number                    // Left edge (0-100)
  y0: number                    // Top edge (0-100)
  x1: number                    // Right edge (0-100)
  y1: number                    // Bottom edge (0-100)
  label: string                 // Display name
  confidence: number            // AI confidence (0-1)
  extractedText?: string        // Optional extracted text
  category?: 'name' | 'parcel' | 'date' | 'gps' | 'signature' | 'other'
}
```

### Coordinate System

```
(0,0) ────────────────────── (100,0)
  │                              │
  │     ┌──────────┐            │
  │     │  Box     │            │
  │     │ (x0,y0)  │            │
  │     │    to    │            │
  │     │ (x1,y1)  │            │
  │     └──────────┘            │
  │                              │
(0,100) ──────────────────── (100,100)
```

Example:
```typescript
{
  x0: 15,   // 15% from left
  y0: 25,   // 25% from top
  x1: 45,   // 45% from left (width = 30%)
  y1: 33    // 33% from top (height = 8%)
}
```

## Basic Usage

```typescript
import { DocumentHighlighter, type BoundingBox } from '@/components/DocumentHighlighter'

function MyComponent() {
  const boxes: BoundingBox[] = [
    {
      id: 'name-1',
      x0: 15,
      y0: 25,
      x1: 45,
      y1: 33,
      label: 'Grantor Name',
      confidence: 0.88,
      extractedText: 'KOFI A. MENSAH',
      category: 'name',
    },
  ]

  return (
    <DocumentHighlighter
      originalImageSrc="/path/to/document.jpg"
      boxes={boxes}
      onBoxClick={(box) => console.log('Clicked:', box)}
    />
  )
}
```

## Advanced Usage with Ref

```typescript
import { useRef } from 'react'
import { DocumentHighlighter, type DocumentHighlighterRef } from '@/components/DocumentHighlighter'

function AdvancedComponent() {
  const highlighterRef = useRef<DocumentHighlighterRef>(null)

  const handleSidebarClick = (boxId: string) => {
    // Focus the element on the document
    highlighterRef.current?.focusElement(boxId)
  }

  const handleClearFocus = () => {
    highlighterRef.current?.clearFocus()
  }

  return (
    <div>
      {/* Sidebar */}
      <aside>
        <button onClick={() => handleSidebarClick('name-1')}>
          Focus Name Detection
        </button>
      </aside>

      {/* Document */}
      <DocumentHighlighter
        ref={highlighterRef}
        originalImageSrc="/document.jpg"
        boxes={boxes}
      />
    </div>
  )
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `originalImageSrc` | `string` | ✅ | URL or path to the document image |
| `boxes` | `BoundingBox[]` | ✅ | Array of bounding boxes to display |
| `onBoxClick` | `(box: BoundingBox) => void` | ❌ | Callback when a box is clicked |
| `className` | `string` | ❌ | Additional CSS classes |

## Ref Methods

| Method | Parameters | Description |
|--------|------------|-------------|
| `focusElement` | `elementId: string` | Focuses and scrolls to a specific box |
| `clearFocus` | - | Clears the current focus |

## Category Colors

The component automatically applies colors based on the `category` field:

| Category | Border Color | Background |
|----------|--------------|------------|
| `name` | Blue (`border-blue-500`) | `bg-blue-500/10` |
| `parcel` | Purple (`border-purple-500`) | `bg-purple-500/10` |
| `date` | Green (`border-green-500`) | `bg-green-500/10` |
| `gps` | Yellow (`border-yellow-500`) | `bg-yellow-500/10` |
| `signature` | Pink (`border-pink-500`) | `bg-pink-500/10` |
| `other` | Red (`border-red-500`) | `bg-red-500/10` |

## Confidence Score Colors

Confidence scores are color-coded in tooltips:

| Confidence | Color | Badge Style |
|------------|-------|-------------|
| ≥85% | Green | `bg-green-100 text-green-600` |
| 60-84% | Yellow | `bg-yellow-100 text-yellow-600` |
| <60% | Red | `bg-red-100 text-red-600` |

## Animations

### Focus Animation
- **Trigger**: Click box or call `focusElement()`
- **Effect**: Pulsing border, scale increase, ping effect
- **Duration**: 2-3 seconds auto-clear

### Hover Animation
- **Trigger**: Mouse over box
- **Effect**: Tooltip appears, shadow increases
- **Duration**: Instant on/off

### Tooltip Animation
- **Entry**: Fade in + slide up + scale
- **Exit**: Fade out + slide down + scale
- **Duration**: 200ms

## Responsive Behavior

### Desktop (>1024px)
- Full-size tooltips
- Hover interactions enabled
- Smooth animations

### Tablet (768px-1024px)
- Touch-friendly hit areas
- Larger tooltips
- Optimized for field use

### Mobile (<768px)
- Click-only interactions
- Full-width tooltips
- Simplified animations

## Window Resize Handling

The component automatically handles window resizing:

1. **Percentage-based positioning**: Boxes use `%` units
2. **Image maintains aspect ratio**: `w-full h-auto`
3. **Absolute overlay**: Matches image dimensions exactly
4. **No manual recalculation needed**: CSS handles everything

## Integration with Admin Dashboard

### Example: Sync with Evidence Cards

```typescript
import { DocumentHighlighter } from '@/components/DocumentHighlighter'
import { EvidenceCard } from '@/components/admin/EvidenceCard'

function AuditDashboard() {
  const highlighterRef = useRef<DocumentHighlighterRef>(null)

  const evidenceItems = [
    {
      id: 'name-1',
      title: 'Grantor Name',
      // ... other fields
    },
  ]

  const boxes = evidenceItems.map(item => ({
    id: item.id,
    x0: 15,
    y0: 25,
    x1: 45,
    y1: 33,
    label: item.title,
    confidence: item.confidence,
    extractedText: item.extractedText,
  }))

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Document */}
      <DocumentHighlighter
        ref={highlighterRef}
        originalImageSrc="/document.jpg"
        boxes={boxes}
      />

      {/* Evidence Cards */}
      <div>
        {evidenceItems.map(item => (
          <EvidenceCard
            key={item.id}
            evidence={item}
            onHighlight={() => highlighterRef.current?.focusElement(item.id)}
          />
        ))}
      </div>
    </div>
  )
}
```

## Styling Customization

### Custom Border Colors

```typescript
// Modify getCategoryColor() in the component
const getCategoryColor = (category?: BoundingBox['category']) => {
  switch (category) {
    case 'custom':
      return 'border-orange-500 bg-orange-500/10'
    default:
      return 'border-red-500 bg-red-500/10'
  }
}
```

### Custom Tooltip Styles

```typescript
// Modify the tooltip div classes
<div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3">
  {/* Your custom tooltip content */}
</div>
```

## Performance Optimization

### Large Number of Boxes

For documents with many detections (>20 boxes):

```typescript
// Use React.memo for box rendering
const MemoizedBox = React.memo(({ box }) => (
  <motion.div>{/* box content */}</motion.div>
))

// Virtualize boxes if needed
import { useVirtualizer } from '@tanstack/react-virtual'
```

### Image Loading

```typescript
// Add loading state
const [imageLoaded, setImageLoaded] = useState(false)

<img
  src={originalImageSrc}
  onLoad={() => setImageLoaded(true)}
  onError={() => setImageLoaded(false)}
/>

{imageLoaded && <div>{/* Render boxes */}</div>}
```

## Accessibility

- **Keyboard Navigation**: Boxes are focusable with Tab
- **ARIA Labels**: Tooltips have proper ARIA attributes
- **Screen Reader Support**: Box labels are announced
- **High Contrast Mode**: Works with system preferences

## Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ⚠️ IE 11 (requires polyfills)

## Troubleshooting

### Boxes Not Appearing

**Issue**: Boxes don't show on the document

**Solutions**:
1. Check if image has loaded: `onLoad` event fired?
2. Verify coordinates are 0-100 range
3. Ensure `imageLoaded` state is true
4. Check z-index of overlay container

### Incorrect Positioning

**Issue**: Boxes appear in wrong locations

**Solutions**:
1. Verify coordinate system (0-100, not pixels)
2. Check if image has `w-full h-auto` classes
3. Ensure container has `relative` positioning
4. Test with known coordinates (e.g., 0,0 to 100,100)

### Tooltip Not Showing

**Issue**: Hover doesn't trigger tooltip

**Solutions**:
1. Check `isHovered` state updates
2. Verify `AnimatePresence` is wrapping tooltip
3. Ensure `pointer-events-auto` on box div
4. Check z-index of tooltip

### Performance Issues

**Issue**: Slow rendering with many boxes

**Solutions**:
1. Memoize box components
2. Reduce animation complexity
3. Use `will-change` CSS property
4. Virtualize boxes if >50 detections

## Examples

### Example 1: Simple Document

```typescript
const boxes = [
  {
    id: '1',
    x0: 10,
    y0: 10,
    x1: 90,
    y1: 20,
    label: 'Document Title',
    confidence: 0.95,
  },
]

<DocumentHighlighter
  originalImageSrc="/doc.jpg"
  boxes={boxes}
/>
```

### Example 2: With Sidebar Sync

See `DocumentHighlighter.example.tsx` for full implementation.

### Example 3: Dynamic Boxes

```typescript
const [boxes, setBoxes] = useState<BoundingBox[]>([])

useEffect(() => {
  // Fetch AI detections from API
  fetchDetections().then(setBoxes)
}, [])

<DocumentHighlighter
  originalImageSrc="/doc.jpg"
  boxes={boxes}
  onBoxClick={(box) => {
    // Handle click
  }}
/>
```

## Future Enhancements

- [ ] Multi-select boxes
- [ ] Draw new boxes manually
- [ ] Edit existing boxes
- [ ] Export annotations as JSON
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts
- [ ] Touch gestures (pinch to zoom)
- [ ] Compare multiple documents

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Dependencies**: `framer-motion@^11.0.0`, `lucide-react@^0.312.0`
