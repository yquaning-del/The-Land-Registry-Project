'use client'

import Link from 'next/link'
import { useRef } from 'react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'
import {
  AlertTriangle,
  Brain,
  Download,
  FileText,
  Globe,
  Landmark,
  Link2,
  Satellite,
  Shield,
  Users,
} from 'lucide-react'

export default function OnePagerAssetPage() {
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
            font-size: 20pt;
          }
          h2 {
            font-size: 14pt;
          }
          h3 {
            font-size: 11pt;
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
        <div className="container mx-auto px-4 py-10 print:py-6">
          <div ref={contentRef} className="max-w-6xl mx-auto">
            <div className="flex items-start justify-between gap-6 print:hidden">
              <div className="text-sm text-slate-600">
                Marketing Assets
              </div>
              <div className="flex items-center gap-2">
                <Link href="/assets/pitch-deck">
                  <Button variant="outline">View Pitch Deck</Button>
                </Link>
                <a href="/api/exports/one-pager/pdf">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
                <a href="/api/exports/one-pager/word">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Word
                  </Button>
                </a>
              </div>
            </div>

            <div className="mt-8 print:mt-0">
              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <div className="bg-white">
                  <div className="px-8 py-8 border-b border-slate-200">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between gap-6">
                        <div className="inline-flex items-center gap-2">
                          <div className="h-9 w-9 rounded-lg bg-navy-900 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-emerald-400" />
                          </div>
                          <div className="text-sm font-semibold text-slate-700">
                            Executive One-Pager
                          </div>
                        </div>
                        <div className="text-xs text-slate-500 hidden sm:block">
                          Print-ready • Client-friendly
                        </div>
                      </div>

                      <div>
                        <h1 className="text-3xl sm:text-4xl font-bold text-navy-900 leading-tight">
                          [Company Name] — Solving the “Dead Capital” Crisis through Data Triangulation.
                        </h1>
                        <p className="mt-3 text-slate-700 max-w-4xl">
                          A digital trust layer that sits between fragmented paper records and modern financial institutions.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {[ 
                          { icon: <Brain className="h-4 w-4 text-emerald-700" />, label: 'AI Audit' },
                          { icon: <Satellite className="h-4 w-4 text-blue-700" />, label: 'Satellite History' },
                          { icon: <Link2 className="h-4 w-4 text-purple-700" />, label: 'Polygon Ledger' },
                          { icon: <Users className="h-4 w-4 text-navy-900" />, label: 'HITL Oversight' },
                        ].map((item) => (
                          <div key={item.label} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 flex items-center gap-2">
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-8 space-y-8">
                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <Globe className="h-5 w-5 text-emerald-700" />
                            Project Purpose
                          </h2>
                          <p className="mt-2 text-slate-700">
                            To unlock “Dead Capital” by providing a 360° verification layer for African real estate.
                          </p>
                          <p className="mt-3 text-slate-700">
                            We are a Digital Land Guard. Think of us as an “Anti-Virus” for your property. We scan the paper for fakes,
                            check the sky (satellites) for hidden owners, and lock the truth in a digital vault that nobody can break.
                          </p>
                        </section>

                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            The Problem: The “Trust Gap”
                          </h2>
                          <div className="mt-3 space-y-3">
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Informal Inefficiency</div>
                              <div className="text-slate-700">70% of land in Sub-Saharan Africa is unregistered or incorrectly documented.</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Double-Selling</div>
                              <div className="text-slate-700">Paper deeds are easily forged, leading to multi-decade legal battles.</div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Access to Credit</div>
                              <div className="text-slate-700">Without verified title, land cannot be used as collateral, stifling $1T in potential economic growth.</div>
                            </div>
                          </div>
                        </section>

                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <Landmark className="h-5 w-5 text-navy-900" />
                            The Solution: The Triangulation Engine
                          </h2>

                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Card className="border-slate-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Brain className="h-4 w-4 text-emerald-700" />
                                  AI Document Audit
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-slate-700">
                                Pattern-matching algorithms detect forgeries in stamps and registrar signatures.
                              </CardContent>
                            </Card>

                            <Card className="border-slate-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Satellite className="h-4 w-4 text-blue-700" />
                                  Satellite Historical Audit
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-slate-700">
                                10-year spatial history analysis to detect “ghost” claims or recent boundary shifts.
                              </CardContent>
                            </Card>

                            <Card className="border-slate-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Link2 className="h-4 w-4 text-purple-700" />
                                  Blockchain Digital Vault
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-slate-700">
                                A permanent, immutable record on the Polygon network that serves as a single source of truth.
                              </CardContent>
                            </Card>

                            <Card className="border-slate-200">
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base flex items-center gap-2">
                                  <Users className="h-4 w-4 text-navy-900" />
                                  Human-in-the-Loop (HITL)
                                </CardTitle>
                              </CardHeader>
                              <CardContent className="text-sm text-slate-700">
                                Professional oversight from vetted legal and survey partners.
                              </CardContent>
                            </Card>
                          </div>
                        </section>

                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <Users className="h-5 w-5 text-navy-900" />
                            Governance Framework
                          </h2>
                          <p className="mt-2 text-slate-700">
                            To ensure maximum integrity, [Company Name] follows a Three-Tier Verification Protocol.
                          </p>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Level 1 (Data)</div>
                              <div className="mt-2 text-sm text-slate-700">
                                AI heuristics and OCR scan for documentary forgery.
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Level 2 (Spatial)</div>
                              <div className="mt-2 text-sm text-slate-700">
                                Satellite-derived temporal analysis of the physical plot.
                              </div>
                            </div>
                            <div className="rounded-xl border border-slate-200 p-4">
                              <div className="font-semibold text-navy-900">Level 3 (Human)</div>
                              <div className="mt-2 text-sm text-slate-700">
                                Final sign-off by a vetted, PMP-governed Project Manager or Legal Notary.
                              </div>
                            </div>
                          </div>
                        </section>

                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-700" />
                            The Buyer’s “Safe Land” Checklist
                          </h2>
                          <p className="mt-2 text-slate-700">
                            To ensure a Trust Score of 90+, the following must be uploaded:
                          </p>

                          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                              {
                                title: 'High-Res Scan of the Indenture',
                                desc: 'Scanned in high-resolution for AI stamp analysis.',
                              },
                              {
                                title: 'Survey Plan',
                                desc: 'Must include coordinate beacons for the Geofence.',
                              },
                              {
                                title: 'Seller’s Biometric ID',
                                desc: 'Verified against the name on the deed.',
                              },
                              {
                                title: 'Timestamped, GPS-Tagged Site Video',
                                desc: 'A walkthrough of the “bush” or plot with GPS metadata.',
                              },
                              {
                                title: 'Current Tax Clearance Certificate',
                                desc: 'Latest clearance from local revenue authorities.',
                              },
                            ].map((item) => (
                              <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                                <div className="font-semibold text-navy-900">{item.title}</div>
                                <div className="mt-1 text-sm text-slate-700">{item.desc}</div>
                              </div>
                            ))}
                          </div>
                        </section>

                        <section className="avoid-break">
                          <h2 className="text-xl font-bold text-navy-900 flex items-center gap-2">
                            <FileText className="h-5 w-5 text-emerald-700" />
                            What This Enables
                          </h2>
                          <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[ 
                              { title: 'Individuals', desc: 'Buy land with 100% confidence.' },
                              { title: 'Banks', desc: 'Reduce mortgage risk with pre-verified titles.' },
                              { title: 'Diaspora', desc: 'Remote due diligence you can trust.' },
                            ].map((x) => (
                              <div key={x.title} className="rounded-xl border border-slate-200 p-4">
                                <div className="font-semibold text-navy-900">{x.title}</div>
                                <div className="mt-1 text-sm text-slate-700">{x.desc}</div>
                              </div>
                            ))}
                          </div>
                        </section>
                      </div>

                      <aside className="lg:col-span-4 space-y-4">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 avoid-break">
                          <div className="text-sm font-semibold text-navy-900">Key Metrics (MVP Targets)</div>
                          <div className="mt-4 space-y-3">
                            <div className="rounded-xl bg-white border border-slate-200 p-4">
                              <div className="text-2xl font-bold text-navy-900">95%</div>
                              <div className="text-sm text-slate-700">Forgery Detection Rate (AI Baseline)</div>
                            </div>
                            <div className="rounded-xl bg-white border border-slate-200 p-4">
                              <div className="text-2xl font-bold text-navy-900">80%</div>
                              <div className="text-sm text-slate-700">Reduction in due diligence time for mortgage lenders</div>
                            </div>
                            <div className="rounded-xl bg-white border border-slate-200 p-4">
                              <div className="text-2xl font-bold text-navy-900">100%</div>
                              <div className="text-sm text-slate-700">Immutable traceability for every transaction</div>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-slate-200 p-5 avoid-break print:hidden">
                          <div className="text-sm font-semibold text-navy-900">More Detail</div>
                          <div className="mt-3 text-sm text-slate-700">
                            For deeper technical governance and architecture, read the whitepaper.
                          </div>
                          <div className="mt-4">
                            <Link href="/whitepaper">
                              <Button variant="outline" className="w-full">
                                View Whitepaper
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </aside>
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-200 text-sm text-slate-600">
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="font-semibold text-navy-900">[Company Name]</div>
                        <div className="text-slate-600">AI + Satellite + Blockchain • Built for audit-grade trust</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-10">
                <LegalDisclaimer variant="light" />
              </div>

              <div className="hidden print:block mt-4 text-xs text-slate-500">
                Generated from /assets/one-pager
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
