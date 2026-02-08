'use client'

import { useEffect, useState } from 'react'
import { FileText, Sparkles } from 'lucide-react'

export function ScanAnimation() {
  const [scanPosition, setScanPosition] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setScanPosition((prev) => (prev + 1) % 100)
    }, 50)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-8 shadow-xl">
      {/* Mock Document */}
      <div className="bg-white rounded-lg shadow-lg p-6 relative overflow-hidden">
        {/* Document Header */}
        <div className="text-center mb-4 pb-4 border-b-2 border-gray-800">
          <div className="text-xs font-bold text-gray-800 mb-1">LAND TITLE CERTIFICATE</div>
          <div className="text-sm text-gray-600">Lands Commission - Ghana</div>
        </div>

        {/* Document Content */}
        <div className="space-y-3 text-sm">
          <div>
            <div className="font-semibold text-gray-700">Title Number:</div>
            <div className="text-gray-900">GA/2024/0001234</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Owner:</div>
            <div className="text-gray-900">Kwame Mensah Enterprises Ltd.</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Location:</div>
            <div className="text-gray-900">Plot 45, East Legon, Accra</div>
          </div>
          <div>
            <div className="font-semibold text-gray-700">Date Issued:</div>
            <div className="text-gray-900">January 15, 2024</div>
          </div>
        </div>

        {/* Scanning Beam */}
        <div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-70"
          style={{ top: `${scanPosition}%`, transition: 'top 0.05s linear' }}
        />

        {/* AI Eye Icon */}
        <div className="absolute top-4 right-4 animate-pulse">
          <div className="p-2 bg-emerald-500 rounded-full">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-emerald-700">
        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        <span>AI Scanning Document...</span>
      </div>
    </div>
  )
}
