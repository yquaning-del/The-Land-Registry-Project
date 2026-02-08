'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Eye, CheckCircle, ArrowRight, Sparkles, Zap } from 'lucide-react'

export default function VerificationAgentPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Eye className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-semibold">AI-Powered OCR</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Verification Agent
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              AI-powered OCR extracts and verifies document data with 98% accuracy in seconds.
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
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Upload Document</h3>
                <p className="text-gray-600">
                  Upload your land title certificate or deed in PDF, JPG, or PNG format
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">AI Analysis</h3>
                <p className="text-gray-600">
                  Our AI reads and extracts key information: owner, location, boundaries, dates
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3">Instant Results</h3>
                <p className="text-gray-600">
                  Get structured, verified data ready for satellite cross-check and blockchain storage
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
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">98% Accuracy</h3>
                  <p className="text-gray-600">
                    Advanced machine learning models trained on thousands of African land documents
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <Zap className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Instant Processing</h3>
                  <p className="text-gray-600">
                    What takes hours manually is done in seconds with our AI agent
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white rounded-lg p-6 shadow-md">
                <CheckCircle className="h-6 w-6 text-emerald-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-xl font-bold text-navy-900 mb-2">Fraud Detection</h3>
                  <p className="text-gray-600">
                    Built-in algorithms detect common forgery patterns and inconsistencies
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Verify Your Documents?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start with 5 free credits. No credit card required.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-white text-emerald-900 hover:bg-gray-100 text-lg px-8 py-6">
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
