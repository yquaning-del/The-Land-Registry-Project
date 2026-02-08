'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { BentoGrid } from '@/components/homepage/BentoGrid'
import { TrustMarquee } from '@/components/homepage/TrustMarquee'
import { VerificationFlow } from '@/components/homepage/VerificationFlow'
import { VerificationDemo } from '@/components/homepage/VerificationDemo'
import { TrustScoreCalculator } from '@/components/home/TrustScoreCalculator'
import { TrustFAQ } from '@/components/home/TrustFAQ'
import { Shield, CheckCircle, ArrowRight, Mail, Phone, MapPinIcon, Sparkles } from 'lucide-react'

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <main className="min-h-screen">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-5xl mx-auto text-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold">AI-Powered • Blockchain-Secured</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
                The Gold Standard for <span className="text-emerald-400">Land Title Integrity</span> in Africa
              </h1>
              <p className="text-xl lg:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
                AI-driven verification meets Blockchain immutability. Built for Law Firms, Banks, and Developers.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white text-lg px-8 py-6">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button size="lg" className="text-lg px-8 py-6 bg-[#4B9CD3] hover:bg-[#3A8BC2] text-white border-0">
                    View Pricing
                  </Button>
                </Link>
              </div>
              <div className="flex items-center justify-center gap-6 mt-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>5 Free Credits</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-emerald-400" />
                  <span>Enterprise-Grade Security</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Marquee */}
      <TrustMarquee />

      {/* Verification Flow - 4 Step Guide */}
      <VerificationFlow onTryDemo={() => setShowDemo(true)} />

      {/* Verification Demo Modal */}
      <VerificationDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />

      <TrustScoreCalculator />

      <TrustFAQ />

      {/* Bento Grid Features */}
      <BentoGrid />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-emerald-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Secure Your Land Titles?
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Join 1,200+ users who trust our platform for land title verification. Start with 5 free credits—no credit card required.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button size="lg" className="bg-white text-navy-900 hover:bg-gray-100 text-lg px-8 py-6">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" className="text-lg px-8 py-6 bg-[#4B9CD3] hover:bg-[#3A8BC2] text-white border-0">
                  View Pricing Plans
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span>ISO 27001 Certified</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>SOC 2 Compliant</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-gray-400 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="h-6 w-6 text-emerald-500" />
                <span className="text-white font-bold text-lg">Land Registry</span>
              </div>
              <p className="text-sm mb-4">
                The immutable source of truth for African land titles.
              </p>
              <div className="flex gap-4">
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/products/verification" className="hover:text-white transition-colors">Verification Agent</Link></li>
                <li><Link href="/products/satellite" className="hover:text-white transition-colors">Satellite Sync</Link></li>
                <li><Link href="/products/registry" className="hover:text-white transition-colors">On-Chain Registry</Link></li>
                <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link href="/whitepaper" className="hover:text-white transition-colors">Whitepaper</Link></li>
              </ul>
            </div>

            {/* Legal Compliance */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal Compliance</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">GDPR Compliance</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Data Protection Act</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">NDPR Compliance</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>

            {/* Security Standards */}
            <div>
              <h3 className="text-white font-semibold mb-4">Security Standards</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-white transition-colors">ISO 27001 Certified</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">SOC 2 Type II</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Blockchain Security</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Penetration Testing</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Security Whitepaper</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold mb-4">Contact Us</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:contact@landregistry.africa" className="hover:text-white transition-colors">
                    contact@landregistry.africa
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>+234 XXX XXX XXXX</span>
                </li>
                <li className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Lagos, Nigeria</span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:support@landregistry.africa" className="hover:text-white transition-colors">
                    support@landregistry.africa
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-navy-800 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
              <p>&copy; 2026 Land Registry Platform. All rights reserved.</p>
              <div className="flex gap-6">
                <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
                <Link href="#" className="hover:text-white transition-colors">Terms</Link>
                <Link href="#" className="hover:text-white transition-colors">Cookies</Link>
                <Link href="#" className="hover:text-white transition-colors">Sitemap</Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
