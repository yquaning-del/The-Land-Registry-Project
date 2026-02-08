'use client'

import { useRef } from 'react'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'
import {
  Download,
  Shield,
  AlertTriangle,
  Brain,
  Satellite,
  Link2,
  Users,
  CheckCircle,
  FileText,
  Globe,
  Landmark,
} from 'lucide-react'

export default function OverviewPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>

      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          body {
            font-size: 11pt;
            line-height: 1.45;
            color: #0f172a;
          }
          h1 {
            font-size: 22pt;
          }
          h2 {
            font-size: 16pt;
          }
          h3 {
            font-size: 12pt;
          }
          a {
            color: #0f172a;
            text-decoration: none;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>

      <main className="min-h-screen bg-white">
        <header className="bg-navy-900 text-white py-12 border-b-4 border-amber-500 print:bg-white print:text-navy-900 print:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-2 mb-4 print:hidden">
                    <Shield className="h-4 w-4 text-amber-300" />
                    <span className="text-sm text-emerald-300 font-semibold">
                      Executive One-Pager
                    </span>
                  </div>

                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    [Company Name] — <span className="text-amber-300 print:text-amber-600">Bridging the African Land Trust Gap.</span>
                  </h1>

                  <p className="mt-4 text-base sm:text-lg text-slate-200 max-w-3xl print:text-slate-700">
                    <span className="font-semibold">Mission:</span> To unlock “Dead Capital” by providing the first 360° verification layer for African real estate.
                  </p>

                  <p className="mt-3 text-base sm:text-lg text-slate-200 max-w-3xl print:text-slate-700">
                    We are a Digital Land Guard — an “Anti-Virus” for property.
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-3 text-sm text-slate-300 print:text-slate-600">
                    <span className="inline-flex items-center gap-2">
                      <Brain className="h-4 w-4" /> AI Document Audit
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-2">
                      <Satellite className="h-4 w-4" /> Spatial Historical Timeline
                    </span>
                    <span className="hidden sm:inline">•</span>
                    <span className="inline-flex items-center gap-2">
                      <Link2 className="h-4 w-4" /> Blockchain Digital Twin
                    </span>
                  </div>
                </div>

                <div className="print:hidden flex items-start justify-start lg:justify-end">
                  <div className="flex items-center gap-2">
                    <a href="/api/exports/overview/pdf">
                      <Button className="bg-amber-500 text-navy-900 hover:bg-amber-600 font-semibold">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                    </a>
                    <a href="/api/exports/overview/word">
                      <Button variant="outline" className="border-amber-500/40 text-amber-100 hover:bg-white/10">
                        <Download className="h-4 w-4 mr-2" />
                        Download Word
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 print:py-6">
          <div ref={contentRef} className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <section className="avoid-break">
                  <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-red-500" />
                    The Problem
                  </h2>
                  <p className="mt-3 text-slate-700 leading-relaxed">
                    Land is Africa’s primary asset, but lack of title certainty prevents it from being used for wealth creation.
                    Sophisticated paper forgeries and “Double-Selling” have created a multi-billion dollar litigation backlog.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-600">$1 Trillion Crisis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-navy-900">$1T</div>
                        <div className="mt-1 text-sm text-slate-600">Dead capital locked behind missing trust</div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-600">The Forgery Loop</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-navy-900">Double-Selling</div>
                        <div className="mt-1 text-sm text-slate-600">Forged paper → disputes → lost time & money</div>
                      </CardContent>
                    </Card>
                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base text-slate-600">Access to Credit</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-navy-900">Blocked</div>
                        <div className="mt-1 text-sm text-slate-600">No verified title → no collateral</div>
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-3">
                    <Shield className="h-6 w-6 text-amber-600" />
                    The Solution: Data Triangulation
                  </h2>
                  <p className="mt-3 text-slate-700 leading-relaxed">
                    Our platform acts as a Digital Notary by verifying three independent anchors — Paper, Sky, and Ledger —
                    to produce a Trust Score and an audit-grade evidence trail.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4 text-amber-600" /> AI Document Audit
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-700">
                        Pattern-matching algorithms detect anomalies in official stamps, fonts, and signatures.
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Satellite className="h-4 w-4 text-blue-600" /> Spatial Historical Timeline
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-700">
                        10+ years of satellite history to verify the physical truth of land usage.
                      </CardContent>
                    </Card>

                    <Card className="border-slate-200 avoid-break">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Link2 className="h-4 w-4 text-purple-600" /> Blockchain Ledger
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="text-sm text-slate-700">
                        An immutable digital twin on Polygon — a single, unchangeable source of truth.
                      </CardContent>
                    </Card>
                  </div>
                </section>

                <section className="avoid-break">
                  <Card className="border-slate-200">
                    <CardHeader>
                      <CardTitle className="text-xl text-navy-900 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        The “Safe Land” Checklist (Buyer’s Guide)
                      </CardTitle>
                      <p className="text-sm text-slate-600">
                        We verify five critical artifacts to generate a Trust Score.
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          'High-res scan of the Indenture',
                          'Certified Survey Plan with coordinate beacons',
                          'Seller’s Biometric ID',
                          'Timestamped, GPS-tagged Site Visit Video',
                          'Current Tax Clearance certificate',
                        ].map((item) => (
                          <div
                            key={item}
                            className="flex items-start gap-3 rounded-lg border border-slate-200 p-3"
                          >
                            <div className="mt-0.5">
                              <CheckCircle className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <div className="font-semibold text-navy-900">{item}</div>
                              <div className="text-sm text-slate-600">
                                Required signal for verification and audit confidence.
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>

                <section className="avoid-break">
                  <h2 className="text-2xl font-bold text-navy-900 flex items-center gap-3">
                    <Landmark className="h-6 w-6 text-navy-900" />
                    The PMP Approach to Integrity
                  </h2>
                  <p className="mt-3 text-slate-700 leading-relaxed">
                    We apply a project controls mindset to land integrity — treating verification as a governed system,
                    not a one-off upload. Each claim produces an evidence-backed audit trail designed for lawyers,
                    banks, and institutions.
                  </p>

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: 'Requirements Baseline',
                        desc: 'We standardize the minimum dataset required to establish trust and reduce ambiguity.',
                      },
                      {
                        title: 'Triangulation Workflow',
                        desc: 'Cross-validate paper, coordinates, satellite history, and seller signals for consistency.',
                      },
                      {
                        title: 'Risk Scoring & Escalation',
                        desc: 'Automated confidence scoring with clear escalation thresholds into HITL review.',
                      },
                      {
                        title: 'Audit-Grade Outputs',
                        desc: 'Time-stamped proofs, conflict evidence packets, and blockchain-anchored priority trails.',
                      },
                    ].map((step) => (
                      <Card key={step.title} className="border-slate-200 avoid-break">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-base text-navy-900">{step.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-700">{step.desc}</CardContent>
                      </Card>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="lg:col-span-4 space-y-6">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 avoid-break">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-amber-600" />
                    <h3 className="font-semibold text-navy-900">At-a-Glance</h3>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">
                    Designed to be read in 60 seconds.
                  </p>

                  <div className="mt-4 grid grid-cols-1 gap-3">
                    {[ 
                      { label: 'Unregistered/Disputed Land', value: '70%', color: 'text-red-600' },
                      { label: 'Dead Capital Opportunity', value: '$1T', color: 'text-navy-900' },
                      { label: 'Satellite Timeline', value: '10+ Years', color: 'text-blue-600' },
                      { label: 'Blockchain Network', value: 'Polygon', color: 'text-purple-600' },
                    ].map((s) => (
                      <div key={s.label} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3">
                        <div className="text-sm text-slate-600">{s.label}</div>
                        <div className={`text-sm font-bold ${s.color}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <Card className="border-slate-200 avoid-break">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-navy-900">Who It’s For</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[ 
                      { title: 'Banks', desc: 'Faster due diligence and lower mortgage risk.' },
                      { title: 'Diaspora', desc: 'Remote verification you can trust, without flying home.' },
                      { title: 'B2B Partners', desc: 'Law firms, developers, and survey professionals.' },
                    ].map((item) => (
                      <div key={item.title} className="rounded-lg border border-slate-200 p-3">
                        <div className="font-semibold text-navy-900">{item.title}</div>
                        <div className="text-sm text-slate-600">{item.desc}</div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <div className="print:hidden rounded-xl border border-slate-200 p-5 avoid-break">
                  <div className="text-sm text-slate-600">Next Step</div>
                  <div className="mt-1 font-semibold text-navy-900">
                    View the technical framework
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <Link href="/pitch">
                      <Button className="w-full justify-center bg-navy-900 hover:bg-navy-800 text-white">
                        View Pitch Deck
                      </Button>
                    </Link>
                    <Link href="/whitepaper">
                      <Button variant="outline" className="w-full justify-center">
                        Read Whitepaper
                      </Button>
                    </Link>
                  </div>
                </div>
              </aside>
            </div>

            <footer className="mt-10 border-t border-slate-200 pt-6 text-sm text-slate-600">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-semibold text-navy-900">[Company Name]</div>
                <div className="text-slate-600">A verification trust layer for African land integrity.</div>
              </div>
            </footer>
          </div>
        </div>

        <LegalDisclaimer variant="light" />
      </main>
    </>
  )
}
