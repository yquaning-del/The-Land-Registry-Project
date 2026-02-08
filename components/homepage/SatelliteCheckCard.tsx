'use client'

import { useState, useEffect } from 'react'
import { MapPin, Satellite, CheckCircle } from 'lucide-react'

export function SatelliteCheckCard() {
  const [activePin, setActivePin] = useState(0)
  const [verified, setVerified] = useState(false)

  const pins = [
    { id: 0, x: 35, y: 40, label: 'Claimed Location' },
    { id: 1, x: 65, y: 55, label: 'Verified Boundary' },
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
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="group relative h-full bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Satellite className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900">Satellite Cross-Check</h3>
        </div>
        <p className="text-gray-600">Geographic verification via satellite imagery</p>
      </div>

      {/* Mock Map */}
      <div className="p-6 relative">
        <div className="relative bg-gradient-to-br from-green-100 via-blue-100 to-gray-100 rounded-lg overflow-hidden aspect-square border-2 border-gray-300">
          {/* Grid Lines */}
          <svg className="absolute inset-0 w-full h-full opacity-20">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="gray" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>

          {/* Mock Roads */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-400 opacity-40" />
          <div className="absolute top-0 bottom-0 left-1/3 w-1 bg-gray-400 opacity-40" />

          {/* Mock Buildings */}
          <div className="absolute top-[30%] left-[25%] w-8 h-8 bg-gray-300 opacity-60 rounded" />
          <div className="absolute top-[50%] left-[70%] w-6 h-6 bg-gray-300 opacity-60 rounded" />
          <div className="absolute top-[65%] left-[40%] w-10 h-10 bg-gray-300 opacity-60 rounded" />

          {/* Location Pins */}
          {pins.map((pin, index) => (
            <div
              key={pin.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
            >
              {/* Pulsing Circle */}
              {activePin === index && (
                <div className="absolute inset-0 -m-8">
                  <div className="w-16 h-16 rounded-full bg-red-500 opacity-30 animate-ping" />
                </div>
              )}
              
              {/* Pin */}
              <div
                className={`relative z-10 transition-all duration-300 ${
                  activePin === index ? 'scale-125' : 'scale-100'
                }`}
              >
                <MapPin
                  className={`h-8 w-8 ${
                    index === 0 ? 'text-red-500' : 'text-emerald-500'
                  } drop-shadow-lg`}
                  fill="currentColor"
                />
              </div>

              {/* Label */}
              {activePin === index && (
                <div className="absolute top-10 left-1/2 -translate-x-1/2 whitespace-nowrap bg-white px-2 py-1 rounded shadow-lg text-xs font-semibold animate-fade-in">
                  {pin.label}
                </div>
              )}
            </div>
          ))}

          {/* Connection Line */}
          {activePin === pins.length - 1 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <line
                x1={`${pins[0].x}%`}
                y1={`${pins[0].y}%`}
                x2={`${pins[1].x}%`}
                y2={`${pins[1].y}%`}
                stroke="#10B981"
                strokeWidth="2"
                strokeDasharray="5,5"
                className="animate-fade-in"
              />
            </svg>
          )}

          {/* Verification Badge */}
          {verified && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald-500 text-white px-4 py-2 rounded-lg shadow-2xl flex items-center gap-2 animate-scale-in">
              <CheckCircle className="h-5 w-5" />
              <span className="font-bold">Location Verified</span>
            </div>
          )}

          {/* Coordinates Display */}
          <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur px-3 py-1 rounded text-xs font-mono">
            6.5244° N, 3.3792° E
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
        <div className="text-center">
          <div className="text-2xl font-bold text-navy-900">±5m</div>
          <div className="text-xs text-gray-600">GPS Accuracy</div>
        </div>
      </div>
    </div>
  )
}
