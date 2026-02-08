'use client'

import { useEffect, useState } from 'react'
import { MapPin, CheckCircle } from 'lucide-react'

export function MapAnimation() {
  const [activePin, setActivePin] = useState(0)
  const [verified, setVerified] = useState(false)

  const pins = [
    { x: 35, y: 40, label: 'Claimed Location' },
    { x: 65, y: 55, label: 'Verified Boundary' },
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setActivePin((prev) => {
        const next = (prev + 1) % (pins.length + 1)
        if (next === pins.length) {
          setVerified(true)
          setTimeout(() => setVerified(false), 1500)
          return 0
        }
        return next
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-blue-50 to-white rounded-2xl border-2 border-blue-200 p-8 shadow-xl">
      {/* Mock Map */}
      <div className="relative bg-gradient-to-br from-green-100 via-blue-100 to-gray-100 rounded-lg overflow-hidden aspect-square border-2 border-gray-300">
        {/* Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid-how" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-how)" />
        </svg>

        {/* Mock Roads */}
        <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400 opacity-40" />
        <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gray-400 opacity-40" />

        {/* Mock Buildings */}
        <div className="absolute top-[30%] left-[25%] w-8 h-8 bg-gray-300 opacity-60 rounded" />
        <div className="absolute top-[50%] left-[70%] w-6 h-6 bg-gray-300 opacity-60 rounded" />

        {/* Location Pins */}
        {pins.map((pin, index) => (
          <div
            key={index}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
          >
            {activePin === index && (
              <div className="absolute inset-0 -m-8">
                <div className="w-16 h-16 rounded-full bg-blue-500 opacity-30 animate-ping" />
              </div>
            )}
            
            <MapPin
              className={`h-8 w-8 ${
                index === 0 ? 'text-red-500' : 'text-emerald-500'
              } drop-shadow-lg transition-transform ${
                activePin === index ? 'scale-125' : 'scale-100'
              }`}
              fill="currentColor"
            />
          </div>
        ))}

        {/* Verification Badge */}
        {verified && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-scale-in">
            <CheckCircle className="h-5 w-5" />
            <span className="font-bold">Location Verified</span>
          </div>
        )}

        {/* Coordinates */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-mono">
          5.6037° N, 0.1870° W
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-700">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        <span>Satellite Cross-Checking...</span>
      </div>
    </div>
  )
}
