'use client'

import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, Sparkles } from 'lucide-react'

export interface BoundingBox {
  id: string
  x0: number
  y0: number
  x1: number
  y1: number
  label: string
  confidence: number
  extractedText?: string
  category?: 'name' | 'parcel' | 'date' | 'gps' | 'signature' | 'other'
}

interface DocumentHighlighterProps {
  originalImageSrc: string
  boxes: BoundingBox[]
  onBoxClick?: (box: BoundingBox) => void
  className?: string
}

export interface DocumentHighlighterRef {
  focusElement: (elementId: string) => void
  clearFocus: () => void
}

const DocumentHighlighterComponent = forwardRef<DocumentHighlighterRef, DocumentHighlighterProps>(
  ({ originalImageSrc, boxes, onBoxClick, className = '' }, ref) => {
    const [focusedBoxId, setFocusedBoxId] = useState<string | null>(null)
    const [hoveredBoxId, setHoveredBoxId] = useState<string | null>(null)
    const [imageLoaded, setImageLoaded] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const boxRefs = useRef<Map<string, HTMLDivElement>>(new Map())

    useImperativeHandle(ref, () => ({
      focusElement: (elementId: string) => {
        setFocusedBoxId(elementId)
        
        const boxElement = boxRefs.current.get(elementId)
        if (boxElement && containerRef.current) {
          boxElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          })
          
          setTimeout(() => {
            setFocusedBoxId(null)
          }, 3000)
        }
      },
      clearFocus: () => {
        setFocusedBoxId(null)
      },
    }))

    const getCategoryColor = (category?: BoundingBox['category']) => {
      switch (category) {
        case 'name':
          return 'border-blue-500 bg-blue-500/10'
        case 'parcel':
          return 'border-purple-500 bg-purple-500/10'
        case 'date':
          return 'border-green-500 bg-green-500/10'
        case 'gps':
          return 'border-yellow-500 bg-yellow-500/10'
        case 'signature':
          return 'border-pink-500 bg-pink-500/10'
        default:
          return 'border-red-500 bg-red-500/10'
      }
    }

    const getConfidenceColor = (confidence: number) => {
      if (confidence >= 0.85) return 'text-green-600 bg-green-100'
      if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100'
      return 'text-red-600 bg-red-100'
    }

    const handleBoxClick = (box: BoundingBox) => {
      setFocusedBoxId(box.id)
      onBoxClick?.(box)
      
      setTimeout(() => {
        setFocusedBoxId(null)
      }, 2000)
    }

    return (
      <div
        ref={containerRef}
        className={`relative w-full h-auto overflow-hidden rounded-lg bg-gray-100 ${className}`}
      >
        {/* Document Image */}
        <img
          src={originalImageSrc}
          alt="Land Document"
          className="w-full h-auto block"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(false)}
        />

        {/* Overlay Container */}
        {imageLoaded && (
          <div className="absolute inset-0 pointer-events-none">
            <AnimatePresence>
              {boxes.map((box) => {
                const isFocused = focusedBoxId === box.id
                const isHovered = hoveredBoxId === box.id
                const width = box.x1 - box.x0
                const height = box.y1 - box.y0

                return (
                  <motion.div
                    key={box.id}
                    ref={(el) => {
                      if (el) boxRefs.current.set(box.id, el)
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      scale: isFocused ? 1.02 : 1,
                    }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{
                      duration: 0.3,
                      ease: 'easeInOut',
                    }}
                    className="absolute pointer-events-auto cursor-pointer"
                    style={{
                      left: `${box.x0}%`,
                      top: `${box.y0}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                    }}
                    onClick={() => handleBoxClick(box)}
                    onMouseEnter={() => setHoveredBoxId(box.id)}
                    onMouseLeave={() => setHoveredBoxId(null)}
                  >
                    {/* Bounding Box */}
                    <motion.div
                      className={`
                        w-full h-full border-2 rounded-sm
                        ${getCategoryColor(box.category)}
                        ${isFocused ? 'animate-pulse shadow-lg' : ''}
                        ${isHovered ? 'shadow-md' : ''}
                        transition-shadow duration-200
                      `}
                      animate={{
                        borderWidth: isFocused ? '3px' : '2px',
                      }}
                      transition={{ duration: 0.2 }}
                    />

                    {/* Tooltip */}
                    <AnimatePresence>
                      {(isHovered || isFocused) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.9 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-2 left-0 transform -translate-y-full z-10 min-w-max"
                        >
                          <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-3 space-y-2">
                            {/* Header */}
                            <div className="flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-blue-500" />
                              <span className="font-semibold text-sm text-gray-900">
                                {box.label}
                              </span>
                            </div>

                            {/* Confidence Score */}
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-xs text-gray-600">Confidence:</span>
                              <span
                                className={`
                                  px-2 py-0.5 rounded-full text-xs font-bold
                                  ${getConfidenceColor(box.confidence)}
                                `}
                              >
                                {(box.confidence * 100).toFixed(0)}%
                              </span>
                            </div>

                            {/* Extracted Text */}
                            {box.extractedText && (
                              <div className="pt-2 border-t border-gray-200">
                                <div className="flex items-start gap-2">
                                  <Eye className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                  <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">AI Detected:</div>
                                    <div className="text-xs font-mono text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                      "{box.extractedText}"
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Arrow Pointer */}
                            <div className="absolute -bottom-2 left-4 w-4 h-4 bg-white border-b border-r border-gray-200 transform rotate-45" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Focus Indicator */}
                    {isFocused && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        <div className="absolute inset-0 border-4 border-white rounded-sm animate-pulse" />
                        <div className="absolute -inset-1 border-2 border-blue-400 rounded-sm animate-ping" />
                      </motion.div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Loading State */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-gray-600">Loading document...</p>
            </div>
          </div>
        )}

        {/* Legend (Optional) */}
        {imageLoaded && boxes.length > 0 && (
          <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 space-y-2 max-w-xs">
            <div className="text-xs font-semibold text-gray-700 flex items-center gap-2">
              <Sparkles className="h-3 w-3" />
              AI Detections ({boxes.length})
            </div>
            <div className="text-xs text-gray-600">
              Hover or click boxes to view details
            </div>
          </div>
        )}
      </div>
    )
  }
)

DocumentHighlighterComponent.displayName = 'DocumentHighlighter'

export const DocumentHighlighter = DocumentHighlighterComponent
