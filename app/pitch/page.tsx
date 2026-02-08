'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'
import { RiskSlide } from '@/components/slides/RiskSlide'
import { IndentureBridgeSlide } from '@/components/slides/IndentureBridgeSlide'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle,
  ExternalLink,
  FileText,
  Globe,
  Landmark,
  Link2,
  Map,
  Shield,
  Satellite,
  TrendingUp,
  Users,
  AlertTriangle,
  Sparkles,
  Mail,
  Download,
} from 'lucide-react'

type SlideId =
  | 'cover'
  | 'crisis'
  | 'triangulation'
  | 'checklist'
  | 'indenture-gap'
  | 'indenture-bridge'
  | 'command-center'
  | 'risk'
  | 'business'
  | 'roadmap'
  | 'cta'

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n))
}

export default function PitchPage() {
  const [index, setIndex] = useState(0)
  const [requestOpen, setRequestOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string>('')
  const [submitted, setSubmitted] = useState(false)

  const searchParams = useSearchParams()
  const exportMode = searchParams.get('export') === '1'

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [organization, setOrganization] = useState('')
  const [message, setMessage] = useState('')

  const slides = useMemo(
    () =>
      [
        { id: 'cover' as SlideId, label: 'Cover', display: '1' },
        { id: 'crisis' as SlideId, label: 'Trillion-Dollar Crisis', display: '2' },
        { id: 'triangulation' as SlideId, label: 'Triangulation', display: '3' },
        { id: 'checklist' as SlideId, label: 'Safe Land Checklist', display: '4' },
        { id: 'indenture-gap' as SlideId, label: 'Indenture vs. Title', display: '5' },
        { id: 'indenture-bridge' as SlideId, label: 'Indenture-to-Title Bridge', display: '5b' },
        { id: 'command-center' as SlideId, label: 'Command Center', display: '6' },
        { id: 'risk' as SlideId, label: 'Risk & Mitigation', display: '7' },
        { id: 'business' as SlideId, label: 'Business Model', display: '8' },
        { id: 'roadmap' as SlideId, label: 'Roadmap', display: '9' },
        { id: 'cta' as SlideId, label: 'Call to Action', display: '10' },
      ] as const,
    []
  )

  const active = slides[index]

  const contractAddress = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''
  const canonicalTokenId = '1'
  const verifyUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${contractAddress || '[contractAddress]'}/${canonicalTokenId}`

  useEffect(() => {
    if (exportMode) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => clamp(i + 1, 0, slides.length - 1))
      if (e.key === 'ArrowLeft') setIndex((i) => clamp(i - 1, 0, slides.length - 1))
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [exportMode, slides.length])

  const goPrev = () => setIndex((i) => clamp(i - 1, 0, slides.length - 1))
  const goNext = () => setIndex((i) => clamp(i + 1, 0, slides.length - 1))

  const handleRequestDemo = async () => {
    setSubmitting(true)
    setSubmitError('')

    try {
      const res = await fetch('/api/request-demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          organization,
          message,
          source: 'pitch',
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || 'Failed to send request')
      }

      setSubmitted(true)
    } catch (e: any) {
      setSubmitError(e?.message || 'Failed to send request')
    } finally {
      setSubmitting(false)
    }
  }

  const shell = {
    bg: 'bg-gradient-to-br from-navy-900 via-navy-800 to-slate-900',
    border: 'border-white/10',
  }

  const containerVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  }

  const SlideFrame = ({
    eyebrow,
    title,
    subtitle,
    children,
  }: {
    eyebrow: string
    title: string
    subtitle?: string
    children: ReactNode
  }) => (
    <div className={`rounded-2xl border ${shell.border} ${shell.bg} text-white shadow-2xl overflow-hidden`}>
      <div className="p-8 sm:p-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 text-sm text-emerald-200 font-semibold">
              <Sparkles className="h-4 w-4" />
              {eyebrow}
            </div>
            <h1 className="mt-5 text-3xl sm:text-4xl font-bold leading-tight">{title}</h1>
            {subtitle && (
              <p className="mt-3 text-slate-200 text-base sm:text-lg max-w-3xl">{subtitle}</p>
            )}
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-300">
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">
              Slide {active.display}/{slides.length}
            </span>
            <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10">{active.label}</span>
          </div>
        </div>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  )

  const renderSlide = (id: SlideId) => {
    switch (id) {
      case 'cover':
        return (
          <SlideFrame
            eyebrow="Investor Relations"
            title="[Company Name]: The Infrastructure of Trust."
            subtitle="Professionalism, analytics, and PMP-driven governance for African land security."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Shield className="h-5 w-5" />
                  The Trust Layer
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  AI + Satellite + Blockchain — audited, not just stored.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Users className="h-5 w-5" />
                  Governance
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  HITL oversight with vetted legal and survey partners.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Landmark className="h-5 w-5" />
                  Credentials
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Yaw Quaning, PMP
                </p>
              </div>
            </div>
          </SlideFrame>
        )

      case 'checklist':
        return (
          <SlideFrame
            eyebrow="Buyer Safety"
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
          </SlideFrame>
        )

      case 'indenture-gap':
        return (
          <SlideFrame
            eyebrow="Indenture vs. Title"
            title="The High-Risk Window"
            subtitle="Most fraud happens after the Indenture is signed but before the government Title is issued."
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
          </SlideFrame>
        )

      case 'indenture-bridge':
        return (
          <SlideFrame
            eyebrow="Slide 5b"
            title="Bridging the Indenture-to-Title Gap"
            subtitle="A visual timeline for Digital Possession → Chain of Custody → On-Chain Anchor."
          >
            <IndentureBridgeSlide embedded />
          </SlideFrame>
        )

      case 'crisis':
        return (
          <SlideFrame
            eyebrow="The Trust Gap"
            title="The Trillion-Dollar Crisis"
            subtitle="Land fraud isn’t just a legal issue; it’s an economic ceiling."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Map className="h-5 w-5" />
                  The $1T Problem
                </div>
                <ul className="mt-4 space-y-3 text-slate-200">
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      Land is Africa’s primary asset, but title uncertainty prevents wealth creation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      Forged deeds and double-selling create a litigation backlog.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <span>
                      Without verified title, land cannot be used as collateral — locking dead capital.
                    </span>
                  </li>
                </ul>
              </div>
              <div className="lg:col-span-5 grid grid-cols-1 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm text-slate-300">Magnitude</div>
                  <div className="mt-2 text-4xl font-bold">$1T</div>
                  <div className="mt-2 text-slate-200 text-sm">Dead capital opportunity</div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm text-slate-300">Root Cause</div>
                  <div className="mt-2 text-xl font-semibold">Paper isn’t enough</div>
                  <div className="mt-2 text-slate-200 text-sm">Trust needs evidence and auditability.</div>
                </div>
              </div>
            </div>
          </SlideFrame>
        )

      case 'triangulation':
        return (
          <SlideFrame
            eyebrow="Our Solution"
            title="Triangulation: Paper + Sky + Ledger"
            subtitle="A digital notary that produces a probabilistic Trust Score and evidence trail."
          >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <FileText className="h-5 w-5" />
                  Paper (AI)
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Pattern matching detects anomalies in stamps, fonts, and signatures.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Satellite className="h-5 w-5" />
                  Sky (Satellite)
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  10+ years of spatial history to validate physical truth and boundary stability.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Link2 className="h-5 w-5" />
                  Ledger (Polygon)
                </div>
                <p className="mt-2 text-sm text-slate-200">
                  Immutable digital twin — a single, unchangeable source of truth.
                </p>
              </div>
            </div>
          </SlideFrame>
        )

      case 'command-center':
        return (
          <SlideFrame
            eyebrow="Product Demo"
            title="The Admin Command Center"
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
              </div>
            </div>
          </SlideFrame>
        )

      case 'business':
        return (
          <SlideFrame
            eyebrow="Business Model"
            title="SaaS + Transactional Minting"
            subtitle="Tiered subscriptions for professionals and institutions."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-8 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">SaaS tiers</div>
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
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <Link2 className="h-5 w-5" />
                  Minting fees
                </div>
                <p className="mt-2 text-sm text-slate-100">
                  Pay-per-mint revenue strengthens trust by anchoring verified titles on Polygon.
                </p>
              </div>
            </div>
          </SlideFrame>
        )

      case 'risk':
        return (
          <SlideFrame
            eyebrow="Risk & Mitigation"
            title="Investor-Grade Risk & Mitigation"
            subtitle="Flip to reveal mitigations across Market, Technical, and Governance risk categories."
          >
            <RiskSlide />
          </SlideFrame>
        )

      case 'roadmap':
        return (
          <SlideFrame
            eyebrow="Roadmap"
            title="MVP → Bank Partnerships → RWA Tokenization"
            subtitle="A phased rollout aligned to lender adoption and future tokenization."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="text-sm text-slate-300">Timeline</div>
                <div className="mt-4 space-y-3">
                  {[ 
                    { q: 'MVP', title: 'Launch', desc: 'Ghana / Nigeria' },
                    { q: 'Banks', title: 'Partnerships', desc: 'Mortgage de-risking pilots' },
                    { q: 'RWA', title: 'Tokenization', desc: 'RWA / fractional ownership expansion' },
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
                  Unlock bankable land through verification, then scale into tokenized real-world assets.
                </p>
              </div>
            </div>
          </SlideFrame>
        )

      case 'cta':
        return (
          <SlideFrame
            eyebrow="Call to Action"
            title="Help us build a bankable Africa."
            subtitle="Join the Registry of Truth."
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <div className="lg:col-span-7 rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center gap-2 text-emerald-200 font-semibold">
                  <CheckCircle className="h-5 w-5" />
                  The Ask
                </div>
                <p className="mt-3 text-sm text-slate-200">
                  If you’re a bank, law firm, developer, or diaspora buyer — we’d like to run a short pilot demo.
                </p>

                <div className="mt-5 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => {
                      setSubmitted(false)
                      setSubmitError('')
                      setSubmitting(false)
                      setRequestOpen(true)
                    }}
                    className="bg-white text-navy-900 hover:bg-slate-100 font-semibold"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Request Demo
                  </Button>
                  <Link href="/overview">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
                      View One-Pager
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="lg:col-span-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-6">
                <div className="text-emerald-200 font-semibold">QR Link to Verify</div>
                <p className="mt-2 text-sm text-slate-100">
                  Scan to open the Public Verification Page.
                </p>

                <div className="mt-4 flex items-center gap-4">
                  <div className="bg-white p-3 rounded-xl">
                    <QRCodeSVG value={verifyUrl} size={140} level="H" includeMargin />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-emerald-200">Canonical URL</div>
                    <div className="mt-2 text-xs font-mono break-all text-slate-100">
                      {verifyUrl}
                    </div>
                    <div className="mt-4">
                      <Link href={verifyUrl.replace(typeof window !== 'undefined' ? window.location.origin : '', '')}>
                        <Button className="w-full justify-center bg-emerald-500 hover:bg-emerald-600 text-navy-900 font-semibold">
                          Open Verification
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </SlideFrame>
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
                <div className="text-sm text-slate-600">Investor Relations</div>
                <div className="text-lg font-semibold text-navy-900">Pitch Deck</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/overview">
                  <Button variant="outline">One-Pager</Button>
                </Link>
                <a href="/api/exports/pitch/pdf">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </a>
                <a href="/api/exports/pitch/pptx">
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
              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  variants={containerVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {renderSlide(active.id)}
                </motion.div>
              </AnimatePresence>
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
                <div className="text-sm text-slate-600">{active.label}</div>
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

              <div className="text-xs text-slate-500 text-center">Tip: use keyboard arrows to navigate.</div>
            </div>
          </div>
        </div>
      </main>

      <LegalDisclaimer variant="light" />

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request a Demo</DialogTitle>
            <DialogDescription>
              Send a demo request to the team. You’ll receive a response by email.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3">
            <div className="grid gap-1">
              <label className="text-sm font-medium">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="Your name"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="you@company.com"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Organization</label>
              <input
                value={organization}
                onChange={(e) => setOrganization(e.target.value)}
                className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                placeholder="Bank / Law Firm / Investor"
              />
            </div>
            <div className="grid gap-1">
              <label className="text-sm font-medium">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px] rounded-md border border-slate-200 p-3 text-sm"
                placeholder="What should we tailor the demo to?"
              />
            </div>

            {submitError && (
              <div className="text-sm text-red-600">{submitError}</div>
            )}

            {submitted && (
              <div className="text-sm text-emerald-700">Request sent. We’ll follow up shortly.</div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRequestOpen(false)}
              disabled={submitting}
            >
              Close
            </Button>
            <Button
              onClick={handleRequestDemo}
              disabled={submitting || submitted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {submitting ? 'Sending...' : submitted ? 'Sent' : 'Send Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
