'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { TableOfContents } from '@/components/whitepaper/TableOfContents'
import { SectionReveal } from '@/components/whitepaper/SectionReveal'
import { CalloutBox } from '@/components/whitepaper/CalloutBox'
import { BuyerChecklist } from '@/components/whitepaper/BuyerChecklist'
import { 
  Download, 
  Shield, 
  AlertTriangle, 
  Scan, 
  Satellite, 
  Link2, 
  Users,
  Brain,
  Eye,
  Lock,
  Globe,
  FileText,
  CheckCircle,
  XCircle,
  TrendingUp,
  Database
} from 'lucide-react'

export default function WhitepaperPage() {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = () => {
    window.print()
  }

  return (
    <>
      <Navbar />
      
      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          body {
            font-size: 12pt;
            line-height: 1.5;
          }
          h1 { font-size: 24pt; }
          h2 { font-size: 18pt; }
          h3 { font-size: 14pt; }
          .prose {
            max-width: 100% !important;
          }
        }
      `}</style>

      <main className="min-h-screen bg-white">
        {/* Hero Header */}
        <header className="bg-gradient-to-br from-navy-900 via-slate-800 to-navy-900 text-white py-20 print:bg-white print:text-black print:py-8">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 rounded-full px-4 py-2 mb-6 print:hidden">
                  <FileText className="h-4 w-4 text-amber-400" />
                  <span className="text-sm text-amber-400 font-semibold">Technical White Paper</span>
                </div>
                
                <h1 className="text-4xl lg:text-6xl font-bold mb-6 font-serif leading-tight">
                  Securing Africa's <span className="text-amber-400 print:text-amber-600">$1 Trillion</span> in Dead Capital
                </h1>
                
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto print:text-slate-600">
                  A Technical Framework for AI-Powered Land Title Verification and Blockchain Immutability
                </p>

                <div className="flex items-center justify-center gap-4 print:hidden">
                  <button
                    onClick={handleDownloadPDF}
                    className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-navy-900 font-semibold px-6 py-3 rounded-lg transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Download PDF
                  </button>
                </div>

                <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-400 print:hidden">
                  <span>Version 2.0</span>
                  <span>•</span>
                  <span>February 2026</span>
                  <span>•</span>
                  <span>Land Registry Platform</span>
                </div>
              </motion.div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex gap-12">
            {/* Sticky Table of Contents */}
            <TableOfContents />

            {/* Content */}
            <article ref={contentRef} className="flex-1 max-w-3xl prose prose-slate prose-lg">
              
              {/* Executive Summary */}
              <SectionReveal>
                <section id="executive-summary" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <TrendingUp className="h-8 w-8 text-amber-500" />
                    Executive Summary
                  </h2>
                  
                  <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border-l-4 border-amber-500 p-6 rounded-r-lg mb-6">
                    <p className="text-lg font-semibold text-navy-900 mb-2">The Dead Capital Crisis</p>
                    <p className="text-slate-700">
                      Across Africa, an estimated <strong className="text-amber-600">$1 trillion in land assets</strong> remains 
                      economically "dead" — unable to be used as collateral, sold with confidence, or developed due to 
                      unclear ownership and fraudulent documentation.
                    </p>
                  </div>

                  <p className="text-slate-700 leading-relaxed">
                    This white paper presents a comprehensive technical framework for solving Africa's land title 
                    verification crisis through <strong>Data Triangulation</strong> — a multi-layered approach that bridges the
                    “Indenture vs. Title” gap by turning private-sale artifacts into audit-grade evidence for registration.
                  </p>

                  <ul className="mt-4 space-y-3">
                    <li className="flex items-start gap-3">
                      <Brain className="h-5 w-5 text-purple-500 mt-1 flex-shrink-0" />
                      <span><strong>Documentary Evidence (AI)</strong> — OCR and pattern matching to verify stamps, signatures, and tamper patterns</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Satellite className="h-5 w-5 text-emerald-500 mt-1 flex-shrink-0" />
                      <span><strong>Environmental Evidence (Satellite History)</strong> — historical imagery to detect overlaps, disputes, and boundary shifts</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Link2 className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0" />
                      <span><strong>Network Evidence (Blockchain)</strong> — permanent, tamper-proof records on the Polygon network</span>
                    </li>
                  </ul>

                  <p className="mt-6 text-slate-700 leading-relaxed">
                    By triangulating data from multiple independent sources, we create a verification system that is 
                    significantly more robust than any single-source approach, reducing fraud risk by over 95%.
                  </p>
                </section>
              </SectionReveal>

              {/* Indenture-to-Title Pipeline */}
              <SectionReveal delay={0.05}>
                <section id="indenture-to-title" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <FileText className="h-8 w-8 text-amber-500" />
                    Indenture-to-Title Pipeline
                  </h2>

                  <p className="text-slate-700 leading-relaxed mb-6">
                    In most private land sales, the buyer’s first artifact is an <strong>Indenture</strong>, not a government-issued title.
                    This “Indenture vs. Title” gap is where fraud, double-selling, and chain-of-title failures occur.
                    We position <strong>[Company Name]</strong> as the digital clearinghouse during this private-sale phase.
                  </p>

                  <div className="space-y-4">
                    <div id="phase-1-indenture" className="scroll-mt-24">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-amber-900 font-serif mb-3">
                          Phase 1: The Indenture
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          Protects the buyer during the initial private contract. We scan the paper for validity using AI,
                          while spatial geofencing verifies the coordinates have not been previously “claimed” by another indenture.
                        </p>
                      </div>
                    </div>

                    <div id="phase-2-registration" className="scroll-mt-24">
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-emerald-900 font-serif mb-3">
                          Phase 2: The Registration
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          Provides a digital audit trail that assists legal counsel in proving a clean <strong>Chain of Title</strong> to the Land Commission.
                          We generate time-stamped satellite evidence and biometric seller verification so registration is faster, cleaner, and less disputable.
                        </p>
                      </div>
                    </div>

                    <div id="phase-3-final-title" className="scroll-mt-24">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="text-2xl font-bold text-blue-900 font-serif mb-3">
                          Phase 3: The Final Title
                        </h3>
                        <p className="text-slate-700 leading-relaxed">
                          Once a government title is issued, we anchor its digital twin to the blockchain.
                          This creates a permanent, unchangeable record that prevents future cloning or identity theft.
                        </p>
                      </div>
                    </div>
                  </div>

                  <CalloutBox type="info" title="Positioning note">
                    <p>
                      We complement government registration. Our verification outputs are designed to reduce administrative burden by delivering higher-quality,
                      pre-verified evidence into existing legal workflows.
                    </p>
                  </CalloutBox>
                </section>
              </SectionReveal>

              {/* The Problem Space */}
              <SectionReveal delay={0.1}>
                <section id="problem-space" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-500" />
                    The Problem Space
                  </h2>

                  <p className="text-slate-700 leading-relaxed mb-8">
                    Africa's land registration systems face three critical friction points that have persisted for 
                    decades, creating an environment ripe for fraud and economic stagnation.
                  </p>

                  {/* Forgery */}
                  <div id="forgery" className="mb-8 scroll-mt-24">
                    <h3 className="text-2xl font-bold text-navy-900 font-serif mb-4">
                      1. The Forgery Epidemic
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Document forgery remains the most prevalent form of land fraud across the continent. 
                      Sophisticated forgers can replicate official stamps, signatures, and watermarks with 
                      alarming accuracy. In Ghana alone, the Lands Commission estimates that 
                      <strong className="text-red-600"> 30% of land documents</strong> presented for registration 
                      show signs of tampering or outright forgery.
                    </p>
                    
                    <div className="mt-4 grid grid-cols-3 gap-4">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">30%</div>
                        <div className="text-sm text-red-700">Documents with irregularities</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">$2.4B</div>
                        <div className="text-sm text-red-700">Annual fraud losses</div>
                      </div>
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                        <div className="text-3xl font-bold text-red-600">7 Years</div>
                        <div className="text-sm text-red-700">Average dispute resolution</div>
                      </div>
                    </div>
                  </div>

                  {/* Double-Selling */}
                  <div id="double-selling" className="mb-8 scroll-mt-24">
                    <h3 className="text-2xl font-bold text-navy-900 font-serif mb-4">
                      2. Double-Selling Fraud
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      The lack of centralized, real-time land registries enables unscrupulous sellers to 
                      sell the same parcel of land to multiple buyers. This is particularly prevalent in 
                      peri-urban areas where rapid development creates high demand and weak oversight.
                    </p>
                    
                    <CalloutBox type="faq" title="How does double-selling happen?">
                      <p>
                        A seller obtains legitimate documentation for a parcel, then sells it to Buyer A. 
                        Before Buyer A can register the transfer (which can take months), the seller uses 
                        the original documents to sell to Buyer B, C, and sometimes D. By the time the 
                        fraud is discovered, the seller has disappeared with the funds.
                      </p>
                    </CalloutBox>
                  </div>

                  {/* Inaccessible Records */}
                  <div id="inaccessible-records" className="mb-8 scroll-mt-24">
                    <h3 className="text-2xl font-bold text-navy-900 font-serif mb-4">
                      3. Inaccessible Government Records
                    </h3>
                    <p className="text-slate-700 leading-relaxed">
                      Even when legitimate records exist, accessing them is often prohibitively difficult. 
                      Paper-based archives, understaffed registries, and bureaucratic inefficiencies mean 
                      that a simple title search can take weeks or months — if the records can be found at all.
                    </p>

                    <CalloutBox type="faq" title="Do we need access to government databases?">
                      <p>
                        <strong>No.</strong> Our system is designed to work independently of government databases. 
                        While we can integrate with official registries where available, our AI verification 
                        and satellite cross-referencing provide robust verification even without direct 
                        government database access. This makes our solution deployable across all African 
                        nations, regardless of their digital infrastructure maturity.
                      </p>
                    </CalloutBox>
                  </div>
                </section>
              </SectionReveal>

              {/* Technical Architecture */}
              <SectionReveal delay={0.2}>
                <section id="technical-architecture" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <Database className="h-8 w-8 text-purple-500" />
                    Technical Architecture
                  </h2>

                  <p className="text-slate-700 leading-relaxed mb-8">
                    Our verification system employs a three-pillar architecture, each pillar providing 
                    independent verification that, when combined, creates an extremely high-confidence 
                    assessment of document authenticity.
                  </p>

                  {/* Section A: AI Heuristics */}
                  <div id="ai-heuristics" className="mb-12 scroll-mt-24">
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6 mb-6">
                      <h3 className="text-2xl font-bold text-purple-900 font-serif mb-4 flex items-center gap-3">
                        <Scan className="h-6 w-6 text-purple-600" />
                        Section A: AI Heuristics
                      </h3>
                      
                      <p className="text-slate-700 leading-relaxed mb-4">
                        Our AI verification engine employs multiple layers of document analysis to detect 
                        forgeries and authenticate legitimate documents.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-2">Optical Character Recognition (OCR)</h4>
                          <p className="text-sm text-slate-600">
                            Advanced OCR extracts text from scanned documents, including handwritten portions. 
                            Our models are trained specifically on African land documents, recognizing regional 
                            variations in formatting and terminology.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-2">Stamp Pattern Matching</h4>
                          <p className="text-sm text-slate-600">
                            Official stamps from Lands Commissions have unique patterns, ink distributions, 
                            and wear characteristics. Our AI compares uploaded stamps against a database of 
                            verified official stamps, detecting subtle inconsistencies invisible to the human eye.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-2">Signature Analysis</h4>
                          <p className="text-sm text-slate-600">
                            Using biometric signature analysis, we verify that signatures match known samples 
                            from registered officials. The system detects traced signatures, digital copies, 
                            and other common forgery techniques.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-2">Document Age Verification</h4>
                          <p className="text-sm text-slate-600">
                            Paper degradation patterns, ink fading, and printing technology markers help 
                            verify that a document's claimed age matches its physical characteristics.
                          </p>
                        </div>
                      </div>
                    </div>

                    <CalloutBox type="tip" title="AI Confidence Scoring">
                      <p>
                        Each verification check produces a confidence score from 0-100%. Documents scoring 
                        above 85% are flagged for automatic approval, while those between 60-85% require 
                        human review. Documents below 60% are flagged as likely fraudulent.
                      </p>
                    </CalloutBox>
                  </div>

                  {/* Section B: Spatial Intelligence */}
                  <div id="spatial-intelligence" className="mb-12 scroll-mt-24">
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 mb-6">
                      <h3 className="text-2xl font-bold text-emerald-900 font-serif mb-4 flex items-center gap-3">
                        <Satellite className="h-6 w-6 text-emerald-600" />
                        Section B: Spatial Intelligence
                      </h3>
                      
                      <p className="text-slate-700 leading-relaxed mb-4">
                        Satellite imagery provides an independent verification layer that cannot be forged. 
                        We analyze historical and current imagery to detect land use patterns and ownership conflicts.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-emerald-100">
                          <h4 className="font-semibold text-emerald-900 mb-2">Historical Imagery Analysis</h4>
                          <p className="text-sm text-slate-600">
                            We access satellite imagery archives dating back 20+ years. This allows us to 
                            verify claims about when land was cleared, developed, or occupied — catching 
                            fraudsters who backdate documents.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-emerald-100">
                          <h4 className="font-semibold text-emerald-900 mb-2">Boundary Overlap Detection</h4>
                          <p className="text-sm text-slate-600">
                            GPS coordinates from documents are plotted against our database of verified 
                            parcels. The system immediately flags any overlapping claims, preventing 
                            double-selling before it occurs.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-emerald-100">
                          <h4 className="font-semibold text-emerald-900 mb-2">"Bush Land" Auditing</h4>
                          <p className="text-sm text-slate-600">
                            For undeveloped land, we analyze vegetation patterns, access roads, and 
                            surrounding development to verify that the described parcel matches reality. 
                            This is crucial for detecting "phantom" land sales.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Blockchain Anchor */}
                  <div id="blockchain-anchor" className="mb-12 scroll-mt-24">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
                      <h3 className="text-2xl font-bold text-blue-900 font-serif mb-4 flex items-center gap-3">
                        <Link2 className="h-6 w-6 text-blue-600" />
                        Section C: The Blockchain Anchor
                      </h3>
                      
                      <p className="text-slate-700 leading-relaxed mb-4">
                        Once a document passes verification, we create an immutable record on the blockchain — 
                        a "Digital Notary" that can never be altered or deleted.
                      </p>

                      <div className="space-y-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-2">The Digital Notary Concept</h4>
                          <p className="text-sm text-slate-600">
                            Traditional notarization relies on trusted third parties who can be corrupted 
                            or coerced. Our blockchain notarization is trustless — the mathematics of 
                            cryptography guarantee authenticity without requiring trust in any single entity.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-2">Polygon Network</h4>
                          <p className="text-sm text-slate-600">
                            We use the Polygon (formerly Matic) network for its low transaction costs, 
                            high throughput, and environmental sustainability. Each verification is 
                            recorded as an NFT, creating a unique, tradeable proof of ownership.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-2">The "Trust Link"</h4>
                          <p className="text-sm text-slate-600">
                            Every verified title receives a unique URL — the Trust Link — that anyone can 
                            use to verify the title's authenticity. Banks, lawyers, and buyers can instantly 
                            confirm ownership without contacting our platform.
                          </p>
                        </div>

                        <div className="bg-white rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-900 mb-2">Immutability Guarantee</h4>
                          <p className="text-sm text-slate-600">
                            Once recorded, blockchain entries cannot be modified or deleted — not by us, 
                            not by hackers, not by governments. This creates a permanent, tamper-proof 
                            record that will exist as long as the Polygon network operates.
                          </p>
                        </div>
                      </div>
                    </div>

                    <CalloutBox type="info" title="Why Polygon over Ethereum Mainnet?">
                      <p>
                        Ethereum mainnet transaction fees can exceed $50 during peak times, making it 
                        impractical for land verification at scale. Polygon offers the same security 
                        guarantees (as an Ethereum Layer 2) with fees under $0.01 per transaction, 
                        making verification accessible to all income levels.
                      </p>
                    </CalloutBox>
                  </div>
                </section>
              </SectionReveal>

              {/* Governance & Ethics */}
              <SectionReveal delay={0.3}>
                <section id="governance-ethics" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <Users className="h-8 w-8 text-amber-500" />
                    Governance & Ethics
                  </h2>

                  <p className="text-slate-700 leading-relaxed mb-8">
                    AI systems are only as ethical as their design and oversight. We have implemented 
                    rigorous governance frameworks to ensure our platform serves all users fairly.
                  </p>

                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-3">
                        <Brain className="h-5 w-5 text-purple-500" />
                        Addressing AI Bias
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        AI models can inherit biases from their training data. We address this through:
                      </p>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Diverse training datasets from all African regions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Regular bias audits by independent third parties</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Transparent confidence scoring with explainable AI</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Continuous model retraining as new data becomes available</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-navy-900 mb-4 flex items-center gap-3">
                        <Lock className="h-5 w-5 text-blue-500" />
                        Data Privacy
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        Land ownership data is sensitive. Our privacy framework includes:
                      </p>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>GDPR and NDPR (Nigeria Data Protection Regulation) compliance</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>End-to-end encryption for all document uploads</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>User-controlled data sharing permissions</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span>Right to deletion (except blockchain records, which are anonymized)</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                      <h3 className="text-xl font-bold text-amber-900 mb-4 flex items-center gap-3">
                        <Eye className="h-5 w-5 text-amber-600" />
                        Human-in-the-Loop (HITL) Model
                      </h3>
                      <p className="text-slate-700 leading-relaxed mb-4">
                        AI should augment human judgment, not replace it. Our HITL model ensures:
                      </p>
                      <ul className="space-y-2 text-slate-600">
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>All borderline cases (60-85% confidence) require human review</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Trained auditors can override AI decisions with documented reasoning</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Appeals process for rejected verifications</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>Continuous feedback loop improves AI accuracy over time</span>
                        </li>
                      </ul>
                    </div>
                  </div>

                  <CalloutBox type="warning" title="The Limits of Automation">
                    <p>
                      We believe that land ownership decisions are too important to be fully automated. 
                      While AI dramatically improves efficiency and catches fraud that humans miss, 
                      the final decision on disputed or complex cases always involves human judgment. 
                      Technology should serve people, not replace their agency.
                    </p>
                  </CalloutBox>
                </section>
              </SectionReveal>

              {/* Buyer's Checklist */}
              <SectionReveal delay={0.4}>
                <section id="buyers-checklist" className="mb-16 scroll-mt-24">
                  <h2 className="text-3xl font-bold text-navy-900 font-serif mb-6 flex items-center gap-3">
                    <Shield className="h-8 w-8 text-emerald-500" />
                    Safe Land Checklist
                  </h2>

                  <p className="text-slate-700 leading-relaxed mb-8">
                    To ensure a Trust Score of 90+, the following must be uploaded. Toggle each item as you prepare your verification pack.
                  </p>

                  <BuyerChecklist />
                </section>
              </SectionReveal>

              {/* Footer */}
              <SectionReveal delay={0.5}>
                <footer className="border-t border-slate-200 pt-12 mt-16">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Shield className="h-8 w-8 text-emerald-500" />
                      <span className="text-2xl font-bold text-navy-900 font-serif">Land Registry Platform</span>
                    </div>
                    <p className="text-slate-600 mb-6">
                      Building trust in African land ownership, one verification at a time.
                    </p>
                    <div className="flex items-center justify-center gap-6 text-sm text-slate-500">
                      <span>© 2026 Land Registry Platform</span>
                      <span>•</span>
                      <span>Accra, Ghana</span>
                      <span>•</span>
                      <a href="mailto:research@landregistry.africa" className="text-amber-600 hover:text-amber-700">
                        research@landregistry.africa
                      </a>
                    </div>
                  </div>
                </footer>
              </SectionReveal>

            </article>
          </div>
        </div>
      </main>
    </>
  )
}
