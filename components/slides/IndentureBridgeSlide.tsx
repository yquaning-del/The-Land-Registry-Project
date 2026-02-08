'use client'

import type { ReactNode } from 'react'
import { FileText, MapPin, Link2 } from 'lucide-react'

type Step = {
  title: string
  subtitle: string
  icon: ReactNode
  body: string
}

export function IndentureBridgeSlide({ embedded = false }: { embedded?: boolean }) {
  const steps: Step[] = [
    {
      title: 'Indenture Phase',
      subtitle: 'Digital Possession',
      icon: <FileText className="h-5 w-5" />,
      body: 'We capture document fingerprinting and a digital geofence at the point of sale to prevent double-selling during the high-risk window.',
    },
    {
      title: 'Registration Phase',
      subtitle: 'Chain of Custody',
      icon: <MapPin className="h-5 w-5" />,
      body: 'A verification report (satellite history + biometrics + audit trail) helps legal counsel prove a clean chain of title to the Land Commission.',
    },
    {
      title: 'Title Phase',
      subtitle: 'On-Chain Anchor',
      icon: <Link2 className="h-5 w-5" />,
      body: 'Once the government certificate is issued, we anchor the digital twin to blockchain to prevent cloning, silent edits, and identity theft.',
    },
  ]

  return (
    <div>
      {!embedded && (
        <>
          <div className="text-xs uppercase tracking-wider text-slate-300">The Trust Anchor</div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-white">Bridging the Indenture-to-Title Gap</h2>
          <p className="mt-3 text-slate-200 text-sm sm:text-base max-w-3xl">
            We operate in the high-risk window between a private Indenture and a government title. The bridge is a digital guardrail: geofence + document fingerprinting + evidence.
          </p>
        </>
      )}

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {steps.map((s) => (
          <div key={s.title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center gap-3 text-emerald-200 font-semibold">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/20 flex items-center justify-center">
                {s.icon}
              </div>
              <div>
                <div className="text-white">{s.title}</div>
                <div className="text-xs text-slate-300">{s.subtitle}</div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-200 leading-relaxed">{s.body}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
