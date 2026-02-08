'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Lock, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react'

export default function OnChainRegistryPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Lock className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-purple-400 font-semibold">Blockchain Security</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              On-Chain Registry
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              Permanent, tamper-proof records stored on the Polygon blockchain for ultimate security.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-bold text-navy-900 text-center mb-16">
              How It Works
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Verified Data</h3>
                <p className="text-gray-600">
                  Only verified land titles pass through AI and satellite checks
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Blockchain Mint</h3>
                <p className="text-gray-600">
                  Create an immutable NFT certificate on Polygon blockchain
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Permanent Record</h3>
                <p className="text-gray-600">
                  Your land title is now permanently secured and publicly verifiable
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-navy-900 text-center mb-12">
              Key Benefits
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Immutable Records</h3>
                  <p className="text-gray-600">
                    Once recorded on the blockchain, your land title cannot be altered or deleted by anyone
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <Zap className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Public Verification</h3>
                  <p className="text-gray-600">
                    Anyone can verify ownership without compromising privacy or security
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <CheckCircle className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Low-Cost Transactions</h3>
                  <p className="text-gray-600">
                    Polygon blockchain ensures fast, affordable transactions compared to Ethereum
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Secure Your Land on the Blockchain?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start with 5 free credits. No credit card required.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-100 text-lg px-8 py-6">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
