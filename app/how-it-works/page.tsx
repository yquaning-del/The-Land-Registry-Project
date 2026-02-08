'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { StepCard } from '@/components/how-it-works/StepCard'
import { ScanAnimation } from '@/components/how-it-works/ScanAnimation'
import { MapAnimation } from '@/components/how-it-works/MapAnimation'
import { VaultAnimation } from '@/components/how-it-works/VaultAnimation'
import { GlassVaultIllustration } from '@/components/how-it-works/GlassVaultIllustration'
import { TechTermsTable } from '@/components/TechTermsTable'
import { TrustScoreCalculator } from '@/components/home/TrustScoreCalculator'
import { TrustFAQ } from '@/components/home/TrustFAQ'
import { Eye, MapPin, Lock, ArrowRight, Shield, CheckCircle } from 'lucide-react'

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-navy-900 via-navy-800 to-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-semibold">Simple & Secure</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              How It Works
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-2xl mx-auto">
              Three steps to unbreakable land security. No technical knowledge required.
            </p>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            {/* Step 1: The Scan */}
            <StepCard
              number={1}
              title="The Scan"
              description="AI reads your paper deed like a digital eye, extracting every detail with 98% accuracy. Upload your document and watch as our system identifies ownership, boundaries, and legal details in seconds."
              icon={<Eye className="h-6 w-6 text-emerald-600" />}
              visual={<ScanAnimation />}
            />

            {/* Step 2: The Proof */}
            <StepCard
              number={2}
              title="The Proof"
              description="Satellite and database checks confirm the land's 'health'—verifying boundaries, ownership history, and legal status. We cross-reference your claim with GPS coordinates and government records to ensure everything matches."
              icon={<MapPin className="h-6 w-6 text-blue-600" />}
              visual={<MapAnimation />}
              reverse
            />

            {/* Step 3: The Vault */}
            <StepCard
              number={3}
              title="The Vault"
              description="The title is locked in a 'Digital Notary' where it can never be deleted or altered. Like a glass safety deposit box—visible to all, changeable by none. Your land record becomes permanent and tamper-proof."
              icon={<Lock className="h-6 w-6 text-purple-600" />}
              visual={<VaultAnimation />}
            />
          </div>
        </div>
      </section>

      <TrustScoreCalculator />

      <TrustFAQ />

      {/* Glass Vault Analogy Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
                The Glass Vault Analogy
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 leading-relaxed">
                Think of it like this...
              </p>
            </div>

            {/* The Analogy */}
            <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-200 mb-12">
              <p className="text-2xl lg:text-3xl text-gray-800 leading-relaxed text-center font-light mb-8">
                "Imagine a bank with thousands of <span className="font-semibold text-purple-600">glass safety deposit boxes</span>. Anyone can walk in and see what's inside, but only the owner has the key to move things. Once a record is put into a box, the glass is <span className="font-semibold text-purple-600">unbreakable</span>—no one, not even the bank manager, can change it."
              </p>
              <p className="text-xl text-center text-gray-600">
                That is how we secure your land.
              </p>
            </div>

            {/* Illustration */}
            <GlassVaultIllustration />

            {/* Key Points */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Eye className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Transparent</h3>
                <p className="text-gray-600">Anyone can verify ownership, just like looking through glass</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Secure</h3>
                <p className="text-gray-600">Only you control your record with your unique digital key</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Permanent</h3>
                <p className="text-gray-600">Unbreakable glass means your record can never be changed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Terms Explanation Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <TechTermsTable />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-emerald-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Secure Your Land?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Start with 5 free credits. No credit card required. Join 1,200+ users protecting their property rights.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-navy-900 hover:bg-gray-100 text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
                  View Pricing
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>5 Free Credits</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>No Credit Card</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-emerald-500" />
                <span className="text-xl font-bold text-white">LandRegistry</span>
              </div>
              <p className="text-sm">
                Securing land rights across Africa with AI and blockchain technology.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/how-it-works" className="hover:text-emerald-400 transition-colors">How it Works</Link></li>
                <li><Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-sm">
                <li>support@landregistry.com</li>
                <li>Accra, Ghana</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm">
            <p>&copy; 2024 LandRegistry. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
