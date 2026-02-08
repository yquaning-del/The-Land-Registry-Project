'use client'

import { useState, useEffect } from 'react'
import { FileText, Sparkles } from 'lucide-react'

export function InstantOCRCard() {
  const [activeHighlight, setActiveHighlight] = useState(0)

  const highlights = [
    { id: 0, label: 'Parcel ID', color: 'bg-emerald-500/20 border-emerald-500', top: '25%', left: '15%', width: '70%', height: '8%' },
    { id: 1, label: 'Owner Name', color: 'bg-blue-500/20 border-blue-500', top: '40%', left: '15%', width: '60%', height: '8%' },
    { id: 2, label: 'Location', color: 'bg-purple-500/20 border-purple-500', top: '55%', left: '15%', width: '65%', height: '8%' },
    { id: 3, label: 'Date', color: 'bg-orange-500/20 border-orange-500', top: '70%', left: '15%', width: '40%', height: '8%' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlight((prev) => (prev + 1) % highlights.length)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="group relative h-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <FileText className="h-6 w-6 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900">Instant OCR</h3>
        </div>
        <p className="text-gray-600">Extract and verify land title data in seconds</p>
      </div>

      {/* Mock Document with Highlights */}
      <div className="p-6 relative">
        <div className="relative bg-white border-2 border-gray-300 rounded-lg shadow-lg p-6 aspect-[3/4]">
          {/* Document Header */}
          <div className="text-center mb-4 pb-4 border-b-2 border-gray-800">
            <div className="text-xs font-bold text-gray-800 mb-1">FEDERAL REPUBLIC OF NIGERIA</div>
            <div className="text-lg font-bold text-gray-900">CERTIFICATE OF OCCUPANCY</div>
            <div className="text-xs text-gray-600">Lagos State Government</div>
          </div>

          {/* Document Content Lines */}
          <div className="space-y-4 text-sm">
            <div className="relative">
              <div className="font-semibold text-gray-700">Title Number:</div>
              <div className="text-gray-900">LG/2024/0001234</div>
            </div>
            <div className="relative">
              <div className="font-semibold text-gray-700">Owner:</div>
              <div className="text-gray-900">John Doe Enterprises Ltd.</div>
            </div>
            <div className="relative">
              <div className="font-semibold text-gray-700">Location:</div>
              <div className="text-gray-900">Plot 45, Victoria Island, Lagos</div>
            </div>
            <div className="relative">
              <div className="font-semibold text-gray-700">Date Issued:</div>
              <div className="text-gray-900">January 15, 2024</div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-300">
              <div className="text-xs text-gray-600 leading-relaxed">
                This is to certify that the land described above has been allocated to the holder under the provisions of the Land Use Act...
              </div>
            </div>
          </div>

          {/* Animated Highlights */}
          {highlights.map((highlight, index) => (
            <div
              key={highlight.id}
              className={`absolute border-2 rounded transition-all duration-500 ${highlight.color} ${
                activeHighlight === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
              style={{
                top: highlight.top,
                left: highlight.left,
                width: highlight.width,
                height: highlight.height,
              }}
            >
              {activeHighlight === index && (
                <div className="absolute -top-6 left-0 text-xs font-semibold px-2 py-1 bg-white rounded shadow-lg animate-fade-in">
                  {highlight.label}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Processing Indicator */}
        <div className="mt-4 flex items-center justify-center gap-2 text-sm">
          <Sparkles className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span className="text-gray-600 font-medium">AI Processing...</span>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
        <div className="flex items-center justify-around text-center">
          <div>
            <div className="text-2xl font-bold text-navy-900">98%</div>
            <div className="text-xs text-gray-600">Accuracy</div>
          </div>
          <div className="h-8 w-px bg-gray-300" />
          <div>
            <div className="text-2xl font-bold text-navy-900">&lt;2s</div>
            <div className="text-xs text-gray-600">Processing</div>
          </div>
        </div>
      </div>
    </div>
  )
}
