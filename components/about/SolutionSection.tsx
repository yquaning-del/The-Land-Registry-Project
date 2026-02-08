'use client'

import { Eye, Satellite, Lock, CheckCircle } from 'lucide-react'

export function SolutionSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
          Our Solution
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          A three-layer verification system that combines AI, satellite technology, and blockchain immutability
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-12">
        <div className="bg-gradient-to-br from-emerald-50 to-white rounded-xl shadow-lg p-8 border border-emerald-200">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
            <Eye className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">AI Verification</h3>
          <p className="text-gray-600 mb-4">
            Advanced OCR and machine learning extract and verify document data with 98% accuracy
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Instant document processing</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Fraud detection algorithms</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              <span>Database cross-referencing</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl shadow-lg p-8 border border-blue-200">
          <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-4">
            <Satellite className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Satellite Verification</h3>
          <p className="text-gray-600 mb-4">
            GPS and satellite imagery confirm boundaries and detect overlapping claims
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>±5m GPS precision</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Boundary validation</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <span>Overlap detection</span>
            </li>
          </ul>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-white rounded-xl shadow-lg p-8 border border-purple-200">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Blockchain Security</h3>
          <p className="text-gray-600 mb-4">
            Permanent, tamper-proof records stored on the Polygon blockchain
          </p>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Immutable records</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Public verification</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="h-4 w-4 text-purple-600 mt-0.5 flex-shrink-0" />
              <span>Low-cost transactions</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <h3 className="text-2xl font-bold text-navy-900 mb-4">Accessible to Everyone</h3>
          <p className="text-lg text-gray-600 mb-6">
            Our platform serves banks verifying collateral, law firms conducting due diligence, developers acquiring land, and individual landowners protecting their rights.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-navy-900">Banks</div>
              <div className="text-gray-600">Collateral verification</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-navy-900">Law Firms</div>
              <div className="text-gray-600">Due diligence</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-navy-900">Developers</div>
              <div className="text-gray-600">Land acquisition</div>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="font-bold text-navy-900">Individuals</div>
              <div className="text-gray-600">Property protection</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
