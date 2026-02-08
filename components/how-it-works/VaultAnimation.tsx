'use client'

import { useEffect, useState } from 'react'
import { Lock, Shield, CheckCircle } from 'lucide-react'

export function VaultAnimation() {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setStage((prev) => (prev + 1) % 3)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative bg-gradient-to-br from-purple-50 to-white rounded-2xl border-2 border-purple-200 p-8 shadow-xl">
      {/* Glass Vault */}
      <div className="relative bg-gradient-to-br from-purple-100/50 to-blue-100/50 rounded-lg p-8 border-4 border-purple-300/50 backdrop-blur">
        {/* Vault Door Frame */}
        <div className="absolute inset-0 rounded-lg border-8 border-gray-300 opacity-50" />
        
        {/* Document Inside Vault */}
        <div className="relative bg-white rounded-lg shadow-2xl p-6 transform transition-all duration-500" style={{
          transform: stage === 0 ? 'scale(0.9) translateY(10px)' : 'scale(1) translateY(0)',
          opacity: stage === 0 ? 0.5 : 1
        }}>
          <div className="text-center mb-3">
            <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-sm font-bold text-gray-800">LAND TITLE</div>
            <div className="text-xs text-gray-600">Digital Certificate</div>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Parcel ID:</span>
              <span className="font-mono font-semibold">GA/2024/0001234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Owner:</span>
              <span className="font-semibold">Kwame Mensah</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="text-emerald-600 font-semibold">Verified</span>
            </div>
          </div>

          {/* Lock Icon */}
          {stage >= 1 && (
            <div className="absolute -top-3 -right-3 animate-scale-in">
              <div className="p-2 bg-purple-600 rounded-full shadow-lg">
                <Lock className="h-4 w-4 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Glass Reflection Effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent rounded-lg pointer-events-none" />
        
        {/* Verification Checkmark */}
        {stage === 2 && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in">
            <div className="p-4 bg-emerald-500 rounded-full shadow-2xl">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-purple-700">
        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        <span>
          {stage === 0 && 'Securing Record...'}
          {stage === 1 && 'Locked in Digital Vault'}
          {stage === 2 && 'Permanently Secured'}
        </span>
      </div>
    </div>
  )
}
