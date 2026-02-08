'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Satellite, CheckCircle, ArrowRight, MapPin, Zap } from 'lucide-react'

export default function SatelliteSyncPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
              <Satellite className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-blue-400 font-semibold">GPS Verification</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Satellite Sync
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              GPS verification with satellite imagery cross-check ensures ±5m precision for boundary validation.
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
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">GPS Coordinates</h3>
                <p className="text-gray-600">
                  Extract or input GPS coordinates from your land title document
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Satellite className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Satellite Cross-Check</h3>
                <p className="text-gray-600">
                  Compare coordinates with satellite imagery and government databases
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Boundary Validation</h3>
                <p className="text-gray-600">
                  Detect overlapping claims and verify boundary accuracy
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
                <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">±5m Precision</h3>
                  <p className="text-gray-600">
                    High-resolution satellite imagery provides accurate boundary verification
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <Zap className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Overlap Detection</h3>
                  <p className="text-gray-600">
                    Automatically identify conflicting claims on the same land parcel
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <CheckCircle className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Historical Tracking</h3>
                  <p className="text-gray-600">
                    Track land use changes over time with historical satellite data
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Verify Your Land Boundaries?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start with 5 free credits. No credit card required.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-blue-900 hover:bg-gray-100 text-lg px-8 py-6">
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
