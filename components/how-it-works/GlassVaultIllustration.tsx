'use client'

import { Lock, Eye, Shield } from 'lucide-react'

export function GlassVaultIllustration() {
  return (
    <div className="relative max-w-2xl mx-auto my-12">
      {/* Bank Building Outline */}
      <div className="relative">
        {/* Main Vault Structure */}
        <div className="grid grid-cols-3 gap-4 p-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl border-4 border-gray-300 shadow-2xl">
          {/* Glass Safety Deposit Boxes */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((box) => (
            <div
              key={box}
              className="relative aspect-square bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-lg border-2 border-purple-300/50 backdrop-blur p-3 hover:scale-105 transition-transform"
            >
              {/* Glass Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent rounded-lg" />
              
              {/* Document Inside */}
              <div className="relative h-full flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-600 opacity-60" />
              </div>

              {/* Lock on Box */}
              <div className="absolute -bottom-1 -right-1">
                <div className="p-1 bg-purple-600 rounded-full shadow-lg">
                  <Lock className="h-3 w-3 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Observers (People Looking) */}
        <div className="absolute -left-12 top-1/2 -translate-y-1/2">
          <div className="p-3 bg-emerald-100 rounded-full border-2 border-emerald-300">
            <Eye className="h-6 w-6 text-emerald-600" />
          </div>
          <div className="text-xs text-center mt-1 font-medium text-gray-600">Anyone<br/>can see</div>
        </div>

        <div className="absolute -right-12 top-1/2 -translate-y-1/2">
          <div className="p-3 bg-red-100 rounded-full border-2 border-red-300">
            <Lock className="h-6 w-6 text-red-600" />
          </div>
          <div className="text-xs text-center mt-1 font-medium text-gray-600">Only owner<br/>can move</div>
        </div>

        {/* Unbreakable Label */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-purple-600 text-white px-4 py-2 rounded-full shadow-lg">
          <span className="text-sm font-bold">Unbreakable Glass</span>
        </div>
      </div>
    </div>
  )
}
