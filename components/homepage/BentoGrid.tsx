'use client'

import { InstantOCRCard } from './InstantOCRCard'
import { SatelliteCheckCard } from './SatelliteCheckCard'
import { OnChainLedgerCard } from './OnChainLedgerCard'

export function BentoGrid() {
  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-4">
            <span className="text-sm text-emerald-700 font-semibold">Powered by AI & Blockchain</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-4">
            Three-Layer Verification System
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Every land title goes through our comprehensive verification process combining OCR, satellite imagery, and blockchain immutability.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
          {/* Card 1: Instant OCR - Tall (spans 2 rows on desktop) */}
          <div className="lg:row-span-2">
            <InstantOCRCard />
          </div>

          {/* Card 2: Satellite Check - Square */}
          <div className="lg:row-span-1">
            <SatelliteCheckCard />
          </div>

          {/* Card 3: On-Chain Ledger - Square */}
          <div className="lg:row-span-1">
            <OnChainLedgerCard />
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-navy-900 mb-1">98%</div>
            <div className="text-sm text-gray-600">OCR Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-navy-900 mb-1">±5m</div>
            <div className="text-sm text-gray-600">GPS Precision</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-navy-900 mb-1">100%</div>
            <div className="text-sm text-gray-600">Immutable</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-navy-900 mb-1">&lt;3min</div>
            <div className="text-sm text-gray-600">Total Time</div>
          </div>
        </div>
      </div>
    </section>
  )
}
