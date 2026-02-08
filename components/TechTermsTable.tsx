'use client'

import { ArrowRight, X, CheckCircle } from 'lucide-react'

interface TechTerm {
  technical: string
  simple: string
  description: string
}

const techTerms: TechTerm[] = [
  {
    technical: 'Blockchain',
    simple: 'Digital Notary / Glass Vault',
    description: 'A permanent record book that everyone can see but no one can change'
  },
  {
    technical: 'Immutable',
    simple: 'Unbreakable / Permanent',
    description: 'Once recorded, it cannot be altered or deleted by anyone'
  },
  {
    technical: 'Decentralization',
    simple: 'No Single Point of Control',
    description: 'No single person or organization controls the records'
  },
  {
    technical: 'NFT',
    simple: 'Digital Certificate',
    description: 'A unique digital proof of ownership that cannot be duplicated'
  },
  {
    technical: 'Hashing',
    simple: 'Digital Fingerprint',
    description: 'A unique code that identifies your document, like a fingerprint'
  },
  {
    technical: 'Smart Contract',
    simple: 'Automated Agreement',
    description: 'Rules that execute automatically when conditions are met'
  },
  {
    technical: 'Consensus',
    simple: 'Agreement System',
    description: 'Multiple parties verify and agree on the truth of a record'
  },
  {
    technical: 'Distributed Ledger',
    simple: 'Shared Record Book',
    description: 'A record book that is copied and synchronized across many locations'
  }
]

export function TechTermsTable() {
  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="mb-8 text-center">
        <h3 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-3">
          Understanding the Technology
        </h3>
        <p className="text-lg text-gray-600">
          We use simple language to explain complex concepts
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-navy-900 to-navy-800 text-white">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <X className="h-4 w-4 text-red-400" />
                  <span>Technical Term</span>
                </div>
              </th>
              <th className="px-6 py-4 text-center w-16">
                <ArrowRight className="h-5 w-5 mx-auto text-emerald-400" />
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-emerald-400" />
                  <span>Simple Explanation</span>
                </div>
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold">
                What It Means
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {techTerms.map((term, index) => (
              <tr key={index} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-red-400 rounded-full" />
                    <span className="font-mono text-sm text-gray-700 line-through decoration-red-400">
                      {term.technical}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  <ArrowRight className="h-4 w-4 mx-auto text-gray-400" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                    <span className="font-semibold text-emerald-700">
                      {term.simple}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {term.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {techTerms.map((term, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-red-600 font-semibold uppercase mb-1">
                  Technical Term
                </div>
                <div className="font-mono text-sm text-gray-700 line-through decoration-red-400">
                  {term.technical}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center my-3">
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>

            <div className="flex items-start gap-4 mb-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
              <div className="flex-1">
                <div className="text-xs text-emerald-600 font-semibold uppercase mb-1">
                  Simple Explanation
                </div>
                <div className="font-semibold text-emerald-700 mb-2">
                  {term.simple}
                </div>
                <div className="text-sm text-gray-600">
                  {term.description}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-gradient-to-br from-emerald-50 to-blue-50 rounded-xl p-6 border border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div>
            <h4 className="font-bold text-navy-900 mb-2">Why We Use Simple Language</h4>
            <p className="text-gray-700 leading-relaxed">
              Land ownership should be accessible to everyone, not just tech experts. We use everyday analogies to explain how our system works, so you can understand exactly how your property is being protected—without needing a computer science degree.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
