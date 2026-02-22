'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { BentoGrid } from '@/components/homepage/BentoGrid'
import { TrustMarquee } from '@/components/homepage/TrustMarquee'
import { VerificationFlow } from '@/components/homepage/VerificationFlow'
import { VerificationDemo } from '@/components/homepage/VerificationDemo'
import { TrustScoreCalculator } from '@/components/home/TrustScoreCalculator'
import { TrustFAQ } from '@/components/home/TrustFAQ'
import { BlockchainNetworkBg } from '@/components/homepage/BlockchainNetworkBg'
import { StatsSection } from '@/components/homepage/StatsSection'
import { Shield, CheckCircle, ArrowRight, Mail, Phone, MapPinIcon, Sparkles, ChevronDown } from 'lucide-react'

const heroContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13, delayChildren: 0.2 } },
}
const heroItem = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
}

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)

  return (
    <main className="min-h-screen">
      <Navbar />

      {/* ── Hero Section ── */}
      <section className="relative min-h-[92vh] flex items-center bg-[#060d18] overflow-hidden">

        {/* Layer 1: Aerial satellite land photo */}
        <Image
          src="https://images.unsplash.com/photo-1446941611757-91d2c3bd3d45?w=1920&q=80"
          alt="Aerial view of land"
          fill
          priority
          className="object-cover"
          style={{ opacity: 0.22 }}
        />

        {/* Layer 2: Deep gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060d18]/97 via-[#0a1628]/88 to-[#071a14]/80" />

        {/* Radial emerald glow centre */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 65%)' }}
          />
        </div>

        {/* Layer 3: Animated blockchain network */}
        <BlockchainNetworkBg />

        {/* Content */}
        <div className="relative z-10 w-full container mx-auto px-4 py-28 text-center">
          <motion.div
            className="max-w-5xl mx-auto"
            variants={heroContainer}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={heroItem} className="flex justify-center mb-7">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/8 backdrop-blur-sm">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-emerald-400 font-semibold tracking-wide">AI-Powered • Blockchain-Secured</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={heroItem}
              className="text-5xl lg:text-7xl font-bold mb-6 leading-[1.08] tracking-tight text-white"
            >
              The Gold Standard for{' '}
              <span
                className="inline-block"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #34d399 45%, #6ee7b7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                Land Title Integrity
              </span>{' '}
              in Africa
            </motion.h1>

            {/* Subtext */}
            <motion.p
              variants={heroItem}
              className="text-xl lg:text-2xl text-gray-300/90 mb-10 max-w-3xl mx-auto leading-relaxed"
            >
              AI-driven verification meets Blockchain immutability. Built for Law Firms, Banks, and Developers.
            </motion.p>

            {/* CTA buttons */}
            <motion.div
              variants={heroItem}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="text-lg px-9 py-6 font-semibold shadow-lg shadow-emerald-500/25"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none', color: '#fff' }}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="text-lg px-9 py-6 font-semibold border border-white/20 bg-white/8 text-white backdrop-blur-sm hover:bg-white/14 transition-colors"
                >
                  View Pricing
                </Button>
              </Link>
            </motion.div>

            {/* Trust checkmarks */}
            <motion.div
              variants={heroItem}
              className="flex flex-wrap items-center justify-center gap-5 mt-8 text-sm text-gray-400"
            >
              {['5 Free Credits', 'No Credit Card Required', 'Enterprise-Grade Security'].map(t => (
                <span key={t} className="flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  {t}
                </span>
              ))}
            </motion.div>

            {/* Stat chips */}
            <motion.div
              variants={heroItem}
              className="flex flex-wrap justify-center gap-3 mt-10"
            >
              {[
                { value: '1,200+', label: 'Users' },
                { value: '50K+',   label: 'Verifications' },
                { value: '99.8%',  label: 'AI Accuracy' },
              ].map(s => (
                <div
                  key={s.label}
                  className="flex items-center gap-2 px-4 py-2 rounded-full backdrop-blur-sm border border-white/10 text-sm"
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                >
                  <span className="font-bold text-emerald-400">{s.value}</span>
                  <span className="text-gray-400">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
        >
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
          >
            <ChevronDown className="h-5 w-5" />
          </motion.div>
        </motion.div>
      </section>

      {/* Trust Marquee */}
      <TrustMarquee />

      {/* Animated stats bar */}
      <StatsSection />

      {/* Verification Flow - 4 Step Guide */}
      <VerificationFlow onTryDemo={() => setShowDemo(true)} />

      {/* Verification Demo Modal */}
      <VerificationDemo isOpen={showDemo} onClose={() => setShowDemo(false)} />

      <TrustScoreCalculator />

      <TrustFAQ />

      {/* Bento Grid Features */}
      <BentoGrid />

      {/* ── CTA Section ── */}
      <section className="relative py-24 overflow-hidden text-white">

        {/* Background: circuit board / tech macro */}
        <Image
          src="https://images.unsplash.com/photo-1518770660439-4636190af475?w=1920&q=80"
          alt="Technology background"
          fill
          className="object-cover"
          style={{ opacity: 0.18 }}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#060d18]/96 via-[#052e1c]/90 to-[#060d18]/96" />

        {/* Subtle emerald radial glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(16,185,129,0.08) 0%, transparent 70%)' }}
        />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <div
            className="max-w-3xl mx-auto rounded-3xl p-10 border border-white/10 backdrop-blur-sm"
            style={{ background: 'rgba(255,255,255,0.04)' }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/8 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-semibold tracking-wide uppercase">Start Today</span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold mb-5 leading-tight">
              Ready to Secure Your Land Titles?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Join 1,200+ users who trust our platform for land title verification. Start with 5 free credits — no credit card required.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/sign-up">
                <Button
                  size="lg"
                  className="text-lg px-9 py-6 font-semibold shadow-lg shadow-emerald-500/20"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)', border: 'none', color: '#fff' }}
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button
                  size="lg"
                  className="text-lg px-9 py-6 font-semibold bg-white/10 border border-white/20 text-white hover:bg-white/15 transition-colors"
                >
                  View Pricing Plans
                </Button>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-400">
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
