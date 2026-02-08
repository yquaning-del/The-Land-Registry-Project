'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCw, Maximize2, X } from 'lucide-react'

interface HighlightBox {
  x: number
  y: number
  width: number
  height: number
}

interface DocumentViewerProps {
  documentUrl: string
  highlightArea?: HighlightBox | null
  onClearHighlight?: () => void
}

export function DocumentViewer({ documentUrl, highlightArea, onClearHighlight }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  return (
    <div ref={containerRef} className="relative h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-lg p-2 flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={handleZoomOut} title="Zoom Out">
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium px-2 min-w-[60px] text-center">
          {(zoom * 100).toFixed(0)}%
        </span>
        <Button variant="ghost" size="sm" onClick={handleZoomIn} title="Zoom In">
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" onClick={handleRotate} title="Rotate">
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleReset} title="Reset View">
          Reset
        </Button>
        <div className="w-px h-6 bg-gray-300 mx-1" />
        <Button variant="ghost" size="sm" onClick={toggleFullscreen} title="Fullscreen">
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Highlight Clear Button */}
      {highlightArea && onClearHighlight && (
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={onClearHighlight}
            className="shadow-lg"
          >
            <X className="h-4 w-4 mr-2" />
            Clear Highlight
          </Button>
        </div>
      )}

      {/* Document Image Container */}
      <div className="h-full overflow-auto flex items-center justify-center p-8">
        <div className="relative inline-block">
          <img
            ref={imageRef}
            src={documentUrl}
            alt="Land Document"
            className="max-w-full h-auto shadow-2xl transition-transform duration-300"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
            }}
          />

          {/* Highlight Overlay */}
          {highlightArea && imageRef.current && (
            <div
              className="absolute border-4 border-red-500 bg-red-500 bg-opacity-20 animate-pulse"
              style={{
                left: `${highlightArea.x}%`,
                top: `${highlightArea.y}%`,
                width: `${highlightArea.width}%`,
                height: `${highlightArea.height}%`,
                pointerEvents: 'none',
              }}
            >
              <div className="absolute -top-8 left-0 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold whitespace-nowrap">
                AI Detected Area
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Instructions */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-sm">
          Press ESC to exit fullscreen
        </div>
      )}
    </div>
  )
}
