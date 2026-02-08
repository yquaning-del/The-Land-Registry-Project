'use client'

import { useState } from 'react'
import { AlertTriangle, Shield, CheckCircle } from 'lucide-react'

export function InteractiveFraudDemo() {
  const [isHovering, setIsHovering] = useState(false)
  const [confidence, setConfidence] = useState(0)

  const handleMouseEnter = () => {
    setIsHovering(true)
    // Animate confidence score
    let current = 0
    const target = 98.7
    const increment = target / 30
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setConfidence(target)
        clearInterval(timer)
      } else {
        setConfidence(current)
      }
    }, 30)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setConfidence(0)
  }

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-4">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-semibold">AI-Powered Fraud Detection</span>
          </div>
          <h2 className="text-4xl font-bold text-navy-900 mb-4">
            See Our AI in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Hover over the document to see how our AI instantly detects fraudulent land titles
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div
            className="relative bg-white rounded-2xl shadow-2xl overflow-hidden cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Mock Document */}
            <div className="relative aspect-[3/4] max-h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 p-8">
              {/* Document Header */}
              <div className="text-center mb-8">
                <div className="inline-block border-4 border-navy-900 px-6 py-3 mb-4">
                  <h3 className="text-2xl font-bold text-navy-900">CERTIFICATE OF OCCUPANCY</h3>
                </div>
                <p className="text-sm text-gray-700">Federal Republic of Nigeria</p>
                <p className="text-sm text-gray-700">Lagos State Government</p>
              </div>

              {/* Document Content */}
              <div className="space-y-4 text-sm text-gray-800">
                <div className="border-b border-gray-400 pb-2">
                  <p className="font-semibold">Title Number: <span className="font-normal">LG/2024/0001234</span></p>
                </div>
                <div className="border-b border-gray-400 pb-2">
                  <p className="font-semibold">Parcel ID: <span className="font-normal">VI-BLK-45-PLT-12</span></p>
                </div>
                <div className="border-b border-gray-400 pb-2">
                  <p className="font-semibold">Location: <span className="font-normal">Victoria Island, Lagos</span></p>
                </div>
                <div className="border-b border-gray-400 pb-2">
                  <p className="font-semibold">Land Size: <span className="font-normal">1,200 sqm</span></p>
                </div>
                <div className="mt-6 p-4 bg-white/50 rounded">
                  <p className="text-xs leading-relaxed">
                    This is to certify that the land described above has been allocated to the holder
                    of this certificate under the provisions of the Land Use Act...
                  </p>
                </div>
              </div>

              {/* Fraud Detection Overlay */}
              {isHovering && (
                <>
                  {/* Pulsing Red Box */}
                  <div className="absolute inset-0 border-8 border-red-500 animate-pulse pointer-events-none" />
                  
                  {/* Fraud Alert Badge */}
                  <div className="absolute top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl animate-scale-in">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-6 w-6" />
                      <span className="font-bold text-lg">FRAUD DETECTED</span>
                    </div>
                    <div className="text-sm">
                      <p className="font-semibold">Confidence: {confidence.toFixed(1)}%</p>
                      <p className="text-xs mt-1 opacity-90">Document signature mismatch</p>
                    </div>
                  </div>

                  {/* Detection Points */}
                  <div className="absolute top-1/3 left-8 bg-red-500/90 text-white px-3 py-1 rounded text-xs font-semibold animate-fade-in">
                    Forged Signature
                  </div>
                  <div className="absolute top-1/2 right-8 bg-red-500/90 text-white px-3 py-1 rounded text-xs font-semibold animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    Invalid Seal
                  </div>
                  <div className="absolute bottom-1/4 left-1/4 bg-red-500/90 text-white px-3 py-1 rounded text-xs font-semibold animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    Altered Date
                  </div>
                </>
              )}

              {/* Watermark */}
              <div className="absolute bottom-4 right-4 opacity-20 text-6xl font-bold text-gray-400 rotate-[-15deg]">
                SAMPLE
              </div>
            </div>

            {/* Status Bar */}
            <div className={`p-4 transition-all duration-300 ${
              isHovering 
                ? 'bg-red-50 border-t-4 border-red-500' 
                : 'bg-emerald-50 border-t-4 border-emerald-500'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isHovering ? (
                    <>
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="font-semibold text-red-900">Fraudulent Document Detected</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 text-emerald-600" />
                      <span className="font-semibold text-emerald-900">Hover to Analyze Document</span>
                    </>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  {isHovering ? 'AI Analysis Complete' : 'AI Ready'}
                </div>
              </div>
            </div>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-navy-900 mb-2">98.7%</div>
              <p className="text-sm text-gray-600">Detection Accuracy</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-navy-900 mb-2">&lt;2s</div>
              <p className="text-sm text-gray-600">Analysis Time</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-gray-200">
              <div className="text-3xl font-bold text-navy-900 mb-2">24/7</div>
              <p className="text-sm text-gray-600">Automated Monitoring</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
