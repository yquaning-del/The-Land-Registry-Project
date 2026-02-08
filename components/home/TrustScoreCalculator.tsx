'use client'

import type { ReactNode } from 'react'
import { useMemo, useState } from 'react'
import { CheckCircle, FileText, MapPin, Fingerprint, Video } from 'lucide-react'

type Artifact = {
  id: string
  label: string
  weight: number
  icon: ReactNode
}

export function TrustScoreCalculator() {
  const artifacts = useMemo<Artifact[]>(
    () => [
      { id: 'indenture', label: 'Indenture scan', weight: 28, icon: <FileText className="h-4 w-4" /> },
      { id: 'survey', label: 'Survey plan (coordinates)', weight: 22, icon: <MapPin className="h-4 w-4" /> },
      { id: 'biometric', label: 'Seller biometric ID', weight: 22, icon: <Fingerprint className="h-4 w-4" /> },
      { id: 'video', label: 'GPS-tagged site video', weight: 18, icon: <Video className="h-4 w-4" /> },
      { id: 'tax', label: 'Tax clearance', weight: 10, icon: <FileText className="h-4 w-4" /> },
    ],
    []
  )

  const [selected, setSelected] = useState<Record<string, boolean>>({
    indenture: true,
  })

  const score = useMemo(() => {
    const raw = artifacts.reduce((sum, a) => sum + (selected[a.id] ? a.weight : 0), 0)
    return Math.min(100, raw)
  }, [artifacts, selected])

  const canVerify = score >= 90

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <div className="text-sm font-semibold text-emerald-700">Trust Score Calculator</div>
              <h2 className="mt-3 text-3xl sm:text-4xl font-bold text-navy-900">See how evidence increases verify-ability</h2>
              <p className="mt-4 text-slate-600">
                This is a mockup for investors and customers. Toggle artifacts to see how stronger evidence increases a property’s Trust Score.
              </p>

              <div className="mt-8 rounded-2xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-200 bg-slate-50">
                  <div className="font-semibold text-navy-900">Artifacts</div>
                  <div className="mt-1 text-sm text-slate-600">Target: Trust Score 90+</div>
                </div>
                <div className="divide-y divide-slate-100">
                  {artifacts.map((a) => {
                    const active = Boolean(selected[a.id])
                    return (
                      <button
                        type="button"
                        key={a.id}
                        onClick={() => setSelected((prev) => ({ ...prev, [a.id]: !prev[a.id] }))}
                        className={
                          'w-full flex items-center justify-between gap-4 px-6 py-4 text-left transition-colors ' +
                          (active ? 'bg-emerald-50' : 'hover:bg-slate-50')
                        }
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={
                              'h-9 w-9 rounded-lg border flex items-center justify-center ' +
                              (active
                                ? 'border-emerald-200 bg-white text-emerald-700'
                                : 'border-slate-200 bg-white text-slate-700')
                            }
                          >
                            {a.icon}
                          </div>
                          <div>
                            <div className="font-semibold text-navy-900">{a.label}</div>
                            <div className="text-sm text-slate-600">+{a.weight} points</div>
                          </div>
                        </div>
                        <div className={active ? 'text-emerald-700' : 'text-slate-300'}>
                          <CheckCircle className="h-5 w-5" />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm text-slate-600">Trust Score</div>
                <div className="mt-2 flex items-end gap-3">
                  <div className="text-5xl font-bold text-navy-900">{score}</div>
                  <div className={canVerify ? 'text-emerald-700 font-semibold' : 'text-amber-700 font-semibold'}>
                    {canVerify ? 'Verification-ready' : 'More evidence needed'}
                  </div>
                </div>

                <div className="mt-6 h-3 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className={
                      'h-full transition-all ' +
                      (canVerify ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-red-500')
                    }
                    style={{ width: `${score}%` }}
                  />
                </div>

                <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                  {canVerify ? (
                    <div>
                      Strong evidence pack. This is the level where banks and counsel can proceed with confidence.
                    </div>
                  ) : (
                    <div>
                      Add the remaining artifacts to reduce fraud risk during the Indenture-to-Title window.
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6">
                <div className="text-sm font-semibold text-navy-900">Why it matters</div>
                <div className="mt-3 text-sm text-slate-600">
                  The Trust Score is a probabilistic risk assessment built from documentary evidence (AI), environmental evidence (satellite), and network evidence (blockchain).
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
