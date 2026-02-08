'use client'

import { useRef } from 'react'
import { DocumentHighlighter, type DocumentHighlighterRef, type BoundingBox } from './DocumentHighlighter'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DocumentHighlighterExample() {
  const highlighterRef = useRef<DocumentHighlighterRef>(null)

  // Example bounding boxes with normalized coordinates (0-100)
  const exampleBoxes: BoundingBox[] = [
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
    {
      id: 'parcel-1',
      x0: 60,
      y0: 15,
      x1: 85,
      y1: 21,
      label: 'Parcel ID',
      confidence: 0.95,
      extractedText: 'GH20260001234',
      category: 'parcel',
    },
    {
      id: 'date-1',
      x0: 15,
      y0: 75,
      x1: 50,
      y1: 80,
      label: 'Document Date',
      confidence: 0.92,
      extractedText: '15th January 2026',
      category: 'date',
    },
    {
      id: 'gps-1',
      x0: 15,
      y0: 60,
      x1: 55,
      y1: 68,
      label: 'GPS Coordinates',
      confidence: 0.89,
      extractedText: '5.6037° N, 0.1870° W',
      category: 'gps',
    },
    {
      id: 'signature-1',
      x0: 50,
      y0: 85,
      x1: 70,
      y1: 95,
      label: 'Signature/Thumbprint',
      confidence: 0.75,
      extractedText: '[Thumbprint Image]',
      category: 'signature',
    },
  ]

  const handleBoxClick = (box: BoundingBox) => {
    console.log('Box clicked:', box)
  }

  const handleFocusElement = (boxId: string) => {
    highlighterRef.current?.focusElement(boxId)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Viewer - 2/3 width */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Land Document with AI Detections</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentHighlighter
                ref={highlighterRef}
                originalImageSrc="/path/to/your/land-document.jpg"
                boxes={exampleBoxes}
                onBoxClick={handleBoxClick}
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1/3 width */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Detections</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {exampleBoxes.map((box) => (
                <Button
                  key={box.id}
                  variant="outline"
                  className="w-full justify-start text-left"
                  onClick={() => handleFocusElement(box.id)}
                >
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{box.label}</div>
                    <div className="text-xs text-gray-500">
                      {(box.confidence * 100).toFixed(0)}% confidence
                    </div>
                  </div>
                </Button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-600 space-y-2">
              <p>• Click any detection in the sidebar to focus it on the document</p>
              <p>• Hover over boxes on the document to see details</p>
              <p>• Click boxes directly to trigger focus animation</p>
              <p>• Boxes will auto-unfocus after 2-3 seconds</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
