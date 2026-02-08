'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, Eye, Satellite, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ProductsDropdown() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors py-2">
        Products
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Invisible bridge to prevent hover gap */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 h-2" />
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-[600px]">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-6 animate-fade-in">
            <div className="grid grid-cols-3 gap-4">
              {/* Verification Agent */}
              <Link
                href="/products/verification"
                className="group p-4 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-emerald-100 rounded-lg mb-3 group-hover:bg-emerald-200 transition-colors">
                    <Eye className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">Verification Agent</h3>
                  <p className="text-sm text-gray-600">AI-powered OCR extracts data with 98% accuracy</p>
                </div>
              </Link>

              {/* Satellite Sync */}
              <Link
                href="/products/satellite"
                className="group p-4 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-blue-100 rounded-lg mb-3 group-hover:bg-blue-200 transition-colors">
                    <Satellite className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">Satellite Sync</h3>
                  <p className="text-sm text-gray-600">GPS verification with ±5m precision</p>
                </div>
              </Link>

              {/* On-Chain Registry */}
              <Link
                href="/products/registry"
                className="group p-4 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-3 bg-purple-100 rounded-lg mb-3 group-hover:bg-purple-200 transition-colors">
                    <Lock className="h-6 w-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-navy-900 mb-1">On-Chain Registry</h3>
                  <p className="text-sm text-gray-600">Permanent blockchain records</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
