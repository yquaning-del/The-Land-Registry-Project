'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'
import { RiskSlide } from '@/components/slides/RiskSlide'
import { IndentureBridgeSlide } from '@/components/slides/IndentureBridgeSlide'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  FileText,
  Globe,
  Link2,
  Map,
  Shield,
  Satellite,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lock,
  Building2,
  Users,
  ExternalLink,
  Download,
} from 'lucide-react'

type SlideId =
  | 'mission'
  | 'problem'
  | 'tech'
  | 'checklist'
  | 'indenture-gap'
  | 'indenture-bridge'
  | 'command-center'
  | 'risks'
  | 'business'
  | 'roadmap'
  | 'cta'

export default function PitchDeckAssetPage() {
  const [index, setIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement>(null)
  const isProgrammaticScrollRef = useRef(false)

  const searchParams = useSearchParams()
  const exportMode = searchParams.get('export') === '1'

  const slides = useMemo(
    () =>
      [
        { id: 'mission' as SlideId, label: 'Mission', display: '1' },
        { id: 'problem' as SlideId, label: 'Problem', display: '2' },
        { id: 'tech' as SlideId, label: 'Triangulation', display: '3' },
        { id: 'checklist' as SlideId, label: 'Safe Land Checklist', display: '4' },
        { id: 'indenture-gap' as SlideId, label: 'Indenture vs. Title', display: '5' },
        { id: 'indenture-bridge' as SlideId, label: 'Indenture-to-Title Bridge', display: '5b' },
        { id: 'command-center' as SlideId, label: 'Command Center', display: '6' },
        { id: 'risks' as SlideId, label: 'Risk & Mitigation', display: '7' },
        { id: 'business' as SlideId, label: 'Business Model', display: '8' },
        { id: 'roadmap' as SlideId, label: 'Roadmap', display: '9' },
        { id: 'cta' as SlideId, label: 'CTA', display: '10' },
      ] as const,
    []
  )

  const active = slides[index]

  const contractAddress =
    typeof process !== 'undefined' && process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
      ? process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS
      : ''

  const canonicalTokenId = '1'
  const verificationPath = contractAddress
    ? `/verify/${contractAddress}/${canonicalTokenId}`
    : `/verify/[contractAddress]/${canonicalTokenId}`

  useEffect(() => {
    if (exportMode) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIndex((i) => Math.min(i + 1, slides.length - 1))
      }
      if (e.key === 'ArrowLeft') {
        setIndex((i) => Math.max(i - 1, 0))
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [exportMode, slides.length])

  useEffect(() => {
    if (exportMode) return
    const el = viewportRef.current
    if (!el) return

    isProgrammaticScrollRef.current = true
    el.scrollTo({ left: el.clientWidth * index, behavior: 'smooth' })

    const t = window.setTimeout(() => {
      isProgrammaticScrollRef.current = false
    }, 450)

    return () => window.clearTimeout(t)
  }, [exportMode, index])

  const goPrev = () => setIndex((i) => Math.max(i - 1, 0))
  const goNext = () => setIndex((i) => Math.min(i + 1, slides.length - 1))

  const SlideShell = ({
    children,
    eyebrow,
    title,
    subtitle,
  }: {
    children: ReactNode
    eyebrow?: string
    title: string
    subtitle?: string
  }) => {
    return (
      <div className="min-h-[520px] rounded-2xl border border-white/10 bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900 text-white shadow-2xl overflow-hidden">
        <div className="p-8 sm:p-10">
          <div className="flex items-start justify-between gap-6">
            <div>
              {eyebrow && (
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-sm text-emerald-200 font-semibold">
                  <Sparkles className="h-4 w-4" />
                  {eyebrow}
                </div>
              )}
              <h1 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-slate-200 text-base sm:text-lg max-w-3xl">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                Slide {active.display}/{slides.length}
              </span>
              <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
                {active.label}
              </span>
            </div>
          </div>

          <div className="mt-8">{children}</div>
        </div>
      </div>
    )
  }

  const renderSlide = (id: SlideId) => {
    switch (id) {
      case 'mission':
        return (
          <SlideShell
            eyebrow="Mission"
            title="[Company Name]: Bridging the African Land Trust Gap."
            subtitle="To unlock “Dead Capital” by providing the first 360° verification layer for African real estate."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Shield className="h-5 w-5" />
                  Digital Land Guard
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  An “Anti-Virus” for property — scan paper, check the sky, lock truth in a digital vault.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Brain className="h-5 w-5" />
                  Triangulation
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Paper + Sky + Ledger → a single integrity outcome.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Users className="h-5 w-5" />
                  HITL Governance
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Vetted legal and survey partners provide final verification stamps.
                </p>
              </div>
            </div>
          </SlideShell>
        )

      case 'problem':
        return (
          <SlideShell
            eyebrow="Problem"
            title="The Trillion-Dollar Trust Gap"
            subtitle="Land fraud isn’t just a legal issue; it’s an economic ceiling."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Map className="h-5 w-5" />
                  The crisis
                </div>
                <ul className="mt-4 space-y-3 text-slate-200">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      <strong>70%</strong> of land is unregistered or incorrectly documented.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      Double-selling and forged deeds lead to multi-decade litigation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      Without verified title, land cannot be used as collateral — stifling <strong>$1T</strong> in potential growth.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm text-slate-300">Impact</div>
                  <div className="mt-2 text-4xl font-bold">$1T</div>
                  <div className="mt-2 text-slate-200 text-sm">
                    Dead capital locked by missing trust infrastructure.
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm text-slate-300">Root Cause</div>
                  <div className="mt-2 text-xl font-semibold">Paper is no longer enough</div>
                  <div className="mt-2 text-slate-200 text-sm">
                    The market needs audit-grade verification and immutable proofs.
                  </div>
                </div>
              </div>
            </div>
          </SlideShell>
        )

      case 'tech':
        return (
          <SlideShell
            eyebrow="Triangulation Engine"
            title="Triangulation: Paper + Sky + Ledger"
            subtitle="Three independent anchors produce a single integrity outcome."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <FileText className="h-5 w-5" />
                  Paper
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  AI audits the deed for forgery indicators and inconsistencies.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Satellite className="h-5 w-5" />
                  Sky
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Spatial history checks for boundary shifts, disputes, and hidden usage signals.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Link2 className="h-5 w-5" />
                  Digital Vault
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Polygon anchoring creates an immutable record — visible to all, changeable by none.
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                <Lock className="h-5 w-5" />
                Governance-ready
              </div>
              <p className="mt-2 text-slate-200 text-sm">
                Outputs are audit-friendly for banks and lawyers: evidence packets, escalation thresholds, and HITL stamps.
              </p>
            </div>
          </SlideShell>
        )

      case 'checklist':
        return (
          <SlideShell
            eyebrow="Checklist"
            title="The “Safe Land” Checklist"
            subtitle="The 5-point evidence pack required to reach Trust Score 90+."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'High-res scan of the Indenture', icon: <FileText className="h-5 w-5" /> },
                    { title: 'Certified Survey Plan (coordinate beacons)', icon: <Map className="h-5 w-5" /> },
                    { title: 'Seller’s Biometric ID', icon: <Users className="h-5 w-5" /> },
                    { title: 'Timestamped GPS-tagged site video', icon: <Globe className="h-5 w-5" /> },
                    { title: 'Current Tax Clearance certificate', icon: <CheckCircle className="h-5 w-5" /> },
                  ].map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-200">
                          {item.icon}
                        </div>
                        <div className="font-semibold text-slate-100">{item.title}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-emerald-200 font-semibold">Why this matters</div>
                <p className="mt-2 text-sm text-slate-100">
                  Standardized evidence reduces ambiguity, accelerates due diligence, and increases bank acceptance.
                </p>
              </div>
            </div>
          </SlideShell>
        )

      case 'indenture-gap':
        return (
          <SlideShell
            eyebrow="Indenture vs. Title"
            title="Indenture vs. Title"
            subtitle="The high-risk window where double-selling happens before registration catches up."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">The gap</div>
                <ul className="mt-4 space-y-3 text-slate-200">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    Private sales move faster than government registration.
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    Double-selling thrives when evidence is not centralized.
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    Buyers need “digital possession” before title issuance.
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-emerald-200 font-semibold">The [Company Name] bridge</div>
                <p className="mt-2 text-sm text-slate-100">
                  Digital Geofence + Document Fingerprinting at the point of Indenture.
                </p>
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-white/5 p-4">
                  <div className="text-xs text-emerald-200">Result</div>
                  <div className="mt-2 text-sm text-slate-100">
                    A “Ready-to-Title” packet your lawyer can use to speed up formal registration.
                  </div>
                </div>
              </div>
            </div>
          </SlideShell>
        )

      case 'indenture-bridge':
        return (
          <SlideShell
            eyebrow="Bridge"
            title="Bridging the Indenture-to-Title Gap"
            subtitle="Digital Possession → Chain of Custody → On-Chain Anchor."
          >
            <IndentureBridgeSlide embedded />
          </SlideShell>
        )

      case 'command-center':
        return (
          <SlideShell
            eyebrow="Command Center"
            title="The Command Center"
            subtitle="A HITL audit dashboard built for verifiers, lawyers, and institutions."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">High-end workflow</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { title: 'Split-screen viewer', desc: 'High-res document view + evidence panel' },
                    { title: 'Evidence cards', desc: 'Confidence scores + audit reasoning trace' },
                    { title: 'Conflict alerts', desc: 'Spatial overlaps and double-sale signals' },
                    { title: 'On-chain badge', desc: 'Polygon anchoring for immutability' },
                  ].map((x) => (
                    <div key={x.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{x.title}</div>
                      <div className="mt-1 text-sm text-slate-200">{x.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Analytics
                </div>
                <p className="mt-2 text-sm text-slate-100">
                  Real-time Trust Score, audit logs, and escalation thresholds for governance-ready decisions.
                </p>
                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-white/5 p-4">
                  <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                    <Building2 className="h-5 w-5" />
                    Built for institutions
                  </div>
                  <p className="mt-2 text-sm text-slate-100">
                    Evidence packets and counter-signing support compliance and professional review.
                  </p>
                </div>
              </div>
            </div>
          </SlideShell>
        )

      case 'business':
        return (
          <SlideShell
            eyebrow="Business Model"
            title="SaaS + Transactional Minting"
            subtitle="Tiered subscriptions for professionals and institutions."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">SaaS Tiering</div>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { name: 'Starter', price: '$49/mo', desc: 'Solo lawyers / due diligence' },
                    { name: 'Pro', price: '$199/mo', desc: 'Firms / developers' },
                    { name: 'Enterprise', price: 'Custom', desc: 'Banks / registries' },
                  ].map((tier) => (
                    <div key={tier.name} className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <div className="font-semibold">{tier.name}</div>
                      <div className="mt-2 text-2xl font-bold text-emerald-200">{tier.price}</div>
                      <div className="mt-2 text-sm text-slate-200">{tier.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-sm text-slate-300">Transactional</div>
                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                    <Link2 className="h-5 w-5" />
                    Pay-per-mint
                  </div>
                  <p className="mt-2 text-sm text-slate-200">
                    Immutable title anchoring on Polygon generates per-transaction revenue and reinforces trust.
                  </p>
                </div>
              </div>
            </div>
          </SlideShell>
        )

      case 'risks':
        return (
          <SlideShell
            eyebrow="Risk & Mitigation"
            title="Risk & Mitigation"
            subtitle="Flip to reveal mitigations across Market, Technical, and Governance risk categories."
          >
            <RiskSlide />
          </SlideShell>
        )

      case 'roadmap':
        return (
          <SlideShell
            eyebrow="Traction & Roadmap"
            title="Market Traction & Roadmap"
            subtitle="A phased rollout aligned to bank adoption and RWA expansion."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">Timeline</div>
                <div className="mt-4 space-y-3">
                  {[ 
                    { q: 'Q1', title: 'Beta Launch', desc: 'Accra / Lagos' },
                    { q: 'Q2', title: 'Bank Pilot Program', desc: 'Mortgage de-risking' },
                    { q: 'Q3', title: 'Fractional Ownership', desc: 'RWA Pilot' },
                  ].map((m) => (
                    <div key={m.q} className="rounded-xl border border-white/10 bg-white/5 p-5 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center text-emerald-200 font-bold">
                        {m.q}
                      </div>
                      <div>
                        <div className="font-semibold">{m.title}</div>
                        <div className="text-sm text-slate-200 mt-1">{m.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <TrendingUp className="h-5 w-5" />
                  Outcome
                </div>
                <p className="mt-3 text-sm text-slate-200">
                  Each phase increases verification reliability, reduces friction for lenders, and expands the addressable market.
                </p>
              </div>
            </div>
          </SlideShell>
        )

      case 'cta':
        return (
          <SlideShell
            eyebrow="Call to Action"
            title="Join the Registry of Truth"
            subtitle="Let’s make African land a global asset class."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  Next Steps
                </div>
                <ul className="mt-4 space-y-3 text-slate-200">
                  <li className="flex items-start gap-3">
                    <Shield className="h-5 w-5 text-emerald-300 mt-0.5" />
                    Run a pilot verification flow with your team
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-emerald-300 mt-0.5" />
                    Onboard legal/survey partners into HITL oversight
                  </li>
                  <li className="flex items-start gap-3">
                    <Link2 className="h-5 w-5 text-emerald-300 mt-0.5" />
                    Anchor verified titles on Polygon for immutable trust
                  </li>
                </ul>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-emerald-200 font-semibold">Public Verification Page</div>
                <p className="mt-2 text-sm text-slate-100">
                  Share a verification link so anyone can validate a title’s authenticity.
                </p>

                <div className="mt-4 rounded-xl border border-emerald-500/20 bg-white/5 p-4">
                  <div className="text-xs text-emerald-200">Canonical URL</div>
                  <div className="mt-2 text-xs font-mono text-slate-100 break-all">
                    {`/verify/${contractAddress || '[contractAddress]'}/${canonicalTokenId}`}
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Link href={verificationPath}>
                    <Button className="w-full justify-center bg-white text-navy-900 hover:bg-slate-100 font-semibold">
                      Open Public Verification
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/whitepaper">
                    <Button variant="outline" className="w-full justify-center border-white/20 text-white hover:bg-white/10">
                      Read Whitepaper
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </SlideShell>
        )

      default:
        return null
    }
  }

  return (
    <>
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-6xl mx-auto">
            <div className={exportMode ? 'hidden' : 'flex items-center justify-between gap-4 mb-6 print:hidden'}>
              <div>
                <div className="text-sm text-slate-600">Marketing Assets</div>
                <div className="text-lg font-semibold text-navy-900">Pitch Deck</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/assets/one-pager">
                  <Button variant="outline">View One-Pager</Button>
                </Link>
                <a href="/api/exports/pitch-deck/pdf">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
                <a href="/api/exports/pitch-deck/pptx">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download PPTX
                  </Button>
                </a>
              </div>
            </div>

            {exportMode ? (
              <div className="space-y-8">
                {slides.map((s) => (
                  <div key={s.id} style={{ breakAfter: 'page' }}>
                    {renderSlide(s.id)}
                  </div>
                ))}
              </div>
            ) : (
              <div
                ref={viewportRef}
                onScroll={(e) => {
                  if (isProgrammaticScrollRef.current) return
                  const el = e.currentTarget
                  if (!el.clientWidth) return
                  const next = Math.round(el.scrollLeft / el.clientWidth)
                  if (next !== index) setIndex(next)
                }}
                className="flex w-full overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-2xl"
                style={{ WebkitOverflowScrolling: 'touch' }}
              >
                {slides.map((s) => (
                  <div key={s.id} className="w-full shrink-0 snap-start">
                    {renderSlide(s.id)}
                  </div>
                ))}
              </div>
            )}

            <div className={exportMode ? 'hidden' : 'mt-6 flex flex-col gap-4 print:hidden'}>
              <div className="flex items-center justify-between gap-3">
                <Button
                  variant="outline"
                  onClick={goPrev}
                  disabled={index === 0}
                  className="border-slate-200"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Prev
                </Button>
                <div className="text-sm text-slate-600">
                  {active.label}
                </div>
                <Button
                  onClick={goNext}
                  disabled={index === slides.length - 1}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => setIndex(i)}
                    className={
                      'h-2.5 w-2.5 rounded-full transition-all ' +
                      (i === index
                        ? 'bg-emerald-600'
                        : 'bg-slate-300 hover:bg-slate-400')
                    }
                    aria-label={`Go to slide ${i + 1}`}
                  />
                ))}
              </div>

              <div className="text-xs text-slate-500 text-center">
                Tip: use keyboard arrows to navigate.
              </div>
            </div>

            <div className="mt-10">
              <LegalDisclaimer variant="light" />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
