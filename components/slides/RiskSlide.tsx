'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Shield } from 'lucide-react'

type RiskCardSpec = {
  id: string
  columnTitle: string
  strategyCategory: string
  threat: string
  threatDetail: string
  mitigation: string
  mitigationDetail: string
}

function FlipCard({
  spec,
  flipped,
  onToggle,
}: {
  spec: RiskCardSpec
  flipped: boolean
  onToggle: () => void
}) {
  return (
    <div className="h-[320px] w-full [perspective:1200px]">
      <motion.button
        type="button"
        onClick={onToggle}
        className="relative h-full w-full rounded-2xl border border-white/10 bg-white/5 p-0 text-left shadow-xl outline-none"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      >
        <div
          className="absolute inset-0 rounded-2xl p-6"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-300">{spec.columnTitle}</div>
              <div className="mt-1 text-xs text-emerald-200">{spec.strategyCategory}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
              Flip
            </div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-slate-300">Threat</div>
            <div className="mt-2 text-2xl font-bold text-white">{spec.threat}</div>
            <div className="mt-3 text-sm text-slate-200 leading-relaxed">{spec.threatDetail}</div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200">
              Click to reveal mitigation
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-2xl p-6"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-300">{spec.columnTitle}</div>
              <div className="mt-1 text-xs text-emerald-200">{spec.strategyCategory}</div>
            </div>

            <motion.div
              className="relative"
              initial={false}
              animate={flipped ? { opacity: 1 } : { opacity: 0.6 }}
            >
              <motion.div
                className="absolute -inset-2 rounded-full bg-emerald-500/15"
                initial={false}
                animate={flipped ? { opacity: [0.25, 0.65, 0.25] } : { opacity: 0 }}
                transition={{ duration: 1.2, repeat: flipped ? Infinity : 0 }}
              />
              <Shield className="h-6 w-6 text-emerald-200 relative" />
            </motion.div>
          </div>

          <div className="mt-6">
            <div className="text-sm text-slate-300">Mitigation</div>
            <div className="mt-2 text-2xl font-bold text-white">{spec.mitigation}</div>
            <div className="mt-3 text-sm text-slate-200 leading-relaxed">{spec.mitigationDetail}</div>
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-100">
              Click to flip back
            </div>
          </div>
        </div>
      </motion.button>
    </div>
  )
}

export function RiskSlide() {
  const specs = useMemo<RiskCardSpec[]>(
    () => [
      {
        id: 'market',
        columnTitle: 'Market Risk',
        strategyCategory: 'Operational / Market Integrity',
        threat: 'Double-Selling',
        threatDetail:
          'A single plot can be sold to multiple buyers during the private-sale window before registration catches up.',
        mitigation: 'Digital Geofence',
        mitigationDetail:
          'We establish “digital possession” at the point of Indenture. If another indenture is uploaded for the same coordinates, the claim is flagged or blocked immediately.',
      },
      {
        id: 'technical',
        columnTitle: 'Technical Risk',
        strategyCategory: 'Technical',
        threat: 'Data Forgery / Deepfakes',
        threatDetail:
          'Forged stamps, signatures, and manipulated scans can mimic legitimate documents and mislead buyers.',
        mitigation: 'Multi-Factor Triangulation',
        mitigationDetail:
          'We match documentary fingerprints and metadata against satellite historical logs. A fake paper cannot change the historical “sky view.”',
      },
      {
        id: 'governance',
        columnTitle: 'Governance',
        strategyCategory: 'Regulatory + Field Operations',
        threat: 'Policy Shifts + Offline Field Realities',
        threatDetail:
          'Regulatory requirements can change, and field agents often work with unstable power and internet.',
        mitigation: 'Modular Compliance + Edge Sync',
        mitigationDetail:
          'We remain a private trust layer that complements government laws. Field agents can capture GPS-tagged evidence offline and sync when connectivity returns.',
      },
    ],
    []
  )

  const [flipped, setFlipped] = useState<Record<string, boolean>>({})

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200">
        PMP‑Certified Methodology
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {specs.map((spec) => (
          <FlipCard
            key={spec.id}
            spec={spec}
            flipped={Boolean(flipped[spec.id])}
            onToggle={() =>
              setFlipped((prev) => ({
                ...prev,
                [spec.id]: !prev[spec.id],
              }))
            }
          />
        ))}
      </div>

      <div className="mt-4 text-xs text-slate-300">
        Flip each card to reveal the mitigation strategy.
      </div>
    </div>
  )
}
