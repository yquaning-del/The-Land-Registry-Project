'use client'

import { useState, useEffect } from 'react'
import { Link2, CheckCircle, Copy } from 'lucide-react'
import Image from 'next/image'

export function OnChainLedgerCard() {
  const [stage, setStage] = useState(0)
  const [hashVisible, setHashVisible] = useState('')
  const fullHash = '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385'

  useEffect(() => {
    const stageInterval = setInterval(() => {
      setStage((prev) => (prev + 1) % 4)
    }, 3000)

    return () => clearInterval(stageInterval)
  }, [])

  useEffect(() => {
    if (stage === 1) {
      let index = 0
      const typingInterval = setInterval(() => {
        if (index <= fullHash.length) {
          setHashVisible(fullHash.slice(0, index))
          index++
        } else {
          clearInterval(typingInterval)
        }
      }, 30)
      return () => clearInterval(typingInterval)
    } else if (stage === 0) {
      setHashVisible('')
    }
  }, [stage])

  return (
    <div className="group relative h-full bg-gradient-to-br from-purple-50 to-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Link2 className="h-6 w-6 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900">On-Chain Ledger</h3>
        </div>
        <p className="text-gray-600">Immutable blockchain verification</p>
      </div>

      {/* Blockchain Visualization */}
      <div className="p-6 space-y-4">
        {/* Network Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="currentColor">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
            </div>
            <div>
              <div className="text-sm font-bold text-navy-900">Polygon Network</div>
              <div className="text-xs text-gray-600">Amoy Testnet</div>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold transition-all duration-500 ${
            stage >= 2 ? 'bg-emerald-500 text-white' : 'bg-amber-100 text-amber-800'
          }`}>
            {stage >= 2 ? 'Confirmed' : 'Pending'}
          </div>
        </div>

        {/* Transaction Hash */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="text-xs font-semibold text-gray-600 mb-2">Transaction Hash</div>
          <div className="font-mono text-xs break-all text-navy-900 min-h-[40px] flex items-center">
            {stage === 0 && (
              <span className="text-gray-400 animate-pulse">Generating transaction...</span>
            )}
            {stage >= 1 && (
              <span className={stage === 1 ? 'animate-fade-in' : ''}>
                {hashVisible || fullHash}
              </span>
            )}
          </div>
        </div>

        {/* Block Details */}
        {stage >= 2 && (
          <div className="space-y-2 animate-fade-in">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Block Number:</span>
              <span className="font-mono font-semibold text-navy-900">12,847,392</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Timestamp:</span>
              <span className="font-semibold text-navy-900">2 mins ago</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Gas Used:</span>
              <span className="font-semibold text-navy-900">0.0021 MATIC</span>
            </div>
          </div>
        )}

        {/* Confirmation Animation */}
        {stage === 2 && (
          <div className="flex items-center justify-center gap-2 p-4 bg-emerald-50 rounded-lg animate-scale-in">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
            <span className="font-bold text-emerald-900">Transaction Confirmed!</span>
          </div>
        )}

        {/* View on Explorer */}
        {stage >= 3 && (
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors animate-fade-in">
            <span className="text-sm font-semibold">View on PolygonScan</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
        )}
      </div>

      {/* Network Indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full ${stage >= 2 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
      </div>
    </div>
  )
}
