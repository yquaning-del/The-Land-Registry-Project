'use client'

import { AlertTriangle, TrendingDown, FileX } from 'lucide-react'

export function ProblemSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
          The Problem We're Solving
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          Land fraud and unclear ownership are holding back Africa's economic potential
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">70%</h3>
          <p className="text-gray-600 mb-2 font-semibold">Land Disputes</p>
          <p className="text-sm text-gray-500">
            Over 70% of court cases in Ghana involve land disputes, costing billions annually
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <TrendingDown className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">$1 Trillion</h3>
          <p className="text-gray-600 mb-2 font-semibold">Dead Capital</p>
          <p className="text-sm text-gray-500">
            Trillions in African property value locked due to unclear land titles
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-yellow-100">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <FileX className="h-8 w-8 text-yellow-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">90%</h3>
          <p className="text-gray-600 mb-2 font-semibold">Unregistered Land</p>
          <p className="text-sm text-gray-500">
            Most African land remains unregistered or poorly documented
          </p>
        </div>
      </div>

      <div className="mt-12 max-w-3xl mx-auto bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-8 text-white">
        <p className="text-xl leading-relaxed text-center">
          "Without clear property rights, people cannot use their land as collateral for loans, cannot sell with confidence, and cannot build generational wealth."
        </p>
        <p className="text-center mt-4 text-gray-400">— Hernando de Soto, The Mystery of Capital</p>
      </div>
    </div>
  )
}
