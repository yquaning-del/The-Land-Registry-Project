'use client'

import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { MissionStatement } from '@/components/about/MissionStatement'
import { ProblemSection } from '@/components/about/ProblemSection'
import { SolutionSection } from '@/components/about/SolutionSection'
import { LeadershipSection } from '@/components/about/LeadershipSection'
import { VisionSection } from '@/components/about/VisionSection'
import { Shield, ArrowRight, CheckCircle } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 bg-gradient-to-br from-navy-900 via-emerald-900 to-navy-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span className="text-sm text-emerald-400 font-semibold">Our Story</span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              About Us
            </h1>
            <p className="text-xl lg:text-2xl text-gray-300 max-w-3xl mx-auto">
              Eliminating land disputes across Africa and unlocking billions in "Dead Capital" for economic growth.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 lg:py-32">
        <MissionStatement />
      </section>

      {/* The Problem */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <ProblemSection />
      </section>

      {/* Our Solution */}
      <section className="py-20 lg:py-32">
        <SolutionSection />
      </section>

      {/* Leadership */}
      <section className="py-20 lg:py-32 bg-gray-50">
        <LeadershipSection />
      </section>

      {/* Vision */}
      <section className="py-20 lg:py-32">
        <VisionSection />
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-navy-900 via-emerald-900 to-navy-900 text-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Join Our Mission
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              Be part of the solution. Start securing land titles today with 5 free credits.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-navy-900 hover:bg-gray-100 text-lg px-8 py-6">
                  Get Started Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-white hover:bg-white/10">
                  Learn How It Works
                </Button>
              </Link>
            </div>
            <div className="mt-8 flex items-center justify-center gap-8 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-400" />
                <span>Start in Minutes</span>
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
