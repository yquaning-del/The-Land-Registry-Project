import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'

export default async function AdminCharterPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .avoid-break {
            break-inside: avoid;
            page-break-inside: avoid;
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
        }
      ` }} />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10 print:py-6">
          <div className="max-w-5xl mx-auto">
            <div className="print:hidden mb-6">
              <div className="text-sm text-slate-600">Internal • PMP Governance</div>
              <div className="mt-1 text-2xl font-bold text-navy-900">Project Charter</div>
            </div>

            <div className="rounded-2xl border border-slate-200 overflow-hidden">
              <div className="px-8 py-8 border-b border-slate-200 bg-slate-50">
                <div className="text-xs tracking-widest uppercase text-slate-500">PMP Project Charter</div>
                <h1 className="mt-2 text-3xl font-bold text-navy-900">[Company Name] — Transparency & Investor Portal</h1>
                <div className="mt-3 text-slate-700">Charter Owner: Yaw Quaning, PMP</div>
                <div className="mt-1 text-sm text-slate-600">Document Type: Internal Audit Artifact</div>
              </div>

              <div className="px-8 py-8 space-y-8">
                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">1. Project Purpose</h2>
                  <p className="mt-2 text-slate-700">
                    Establish an investor-ready transparency layer that communicates the platform’s verification method,
                    risk posture, and governance model using print-friendly assets and a controlled internal charter.
                  </p>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">2. Objectives & Success Criteria</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[ 
                      {
                        title: 'Objective',
                        body: 'Produce an executive one-pager and 10-slide deck that communicate the verification model to non-technical stakeholders.',
                      },
                      {
                        title: 'Success Criteria',
                        body: 'Assets are print-ready, have clear disclaimers, and can be distributed as PDF without layout breakage.',
                      },
                      {
                        title: 'Objective',
                        body: 'Maintain an internal PMP charter route to support audits and delivery governance.',
                      },
                      {
                        title: 'Success Criteria',
                        body: 'Charter is accessible to authenticated users only and remains stable across releases.',
                      },
                    ].map((item, idx) => (
                      <div key={`${item.title}-${idx}`} className="rounded-xl border border-slate-200 p-5">
                        <div className="font-semibold text-navy-900">{item.title}</div>
                        <div className="mt-2 text-sm text-slate-700">{item.body}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">3. Scope</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="rounded-xl border border-slate-200 p-5">
                      <div className="font-semibold text-navy-900">In Scope</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                        <li>Executive one-pager (print to PDF)</li>
                        <li>Interactive pitch deck (carousel)</li>
                        <li>Legal disclaimer footer (“private registry” + terms summary)</li>
                        <li>Internal charter route for governance</li>
                      </ul>
                    </div>
                    <div className="rounded-xl border border-slate-200 p-5">
                      <div className="font-semibold text-navy-900">Out of Scope</div>
                      <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                        <li>Replacing government land commission processes</li>
                        <li>Legal title issuance</li>
                        <li>Regulatory certification claims</li>
                      </ul>
                    </div>
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">4. Stakeholders</h2>
                  <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[ 
                      { role: 'Project Owner', name: 'Yaw Quaning, PMP' },
                      { role: 'Legal Counsel', name: 'Vetted legal partner (TBD)' },
                      { role: 'Verification Partners', name: 'Survey professionals + notary network' },
                      { role: 'Target Customers', name: 'Banks, diaspora buyers, developers, law firms' },
                    ].map((s) => (
                      <div key={s.role} className="rounded-xl border border-slate-200 p-5">
                        <div className="text-xs uppercase tracking-wide text-slate-500">{s.role}</div>
                        <div className="mt-2 font-semibold text-navy-900">{s.name}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">5. Governance & Controls</h2>
                  <div className="mt-3 rounded-xl border border-slate-200 p-5">
                    <ul className="space-y-2 text-sm text-slate-700 list-disc pl-5">
                      <li>Human-in-the-loop (HITL) verification for escalated cases</li>
                      <li>Evidence packet outputs for audit and dispute handling</li>
                      <li>Immutable anchoring (Polygon) to reduce silent edits and double-selling risk</li>
                      <li>Disclaimers to clarify “as-is data” and non-government status</li>
                    </ul>
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">6. Risks & Mitigations</h2>
                  <div className="mt-3 grid grid-cols-1 gap-4">
                    {[ 
                      {
                        risk: 'Regulatory change / data localization requirements',
                        mitigation: 'Modular deployment; local hosting options; clear separation of verification vs title issuance.',
                      },
                      {
                        risk: 'Cybersecurity + identity theft',
                        mitigation: 'Biometric verification, audit trails, and strengthened authentication.',
                      },
                      {
                        risk: 'Infrastructure constraints (power / internet)',
                        mitigation: 'Offline-first intake flow with sync and evidence capture.',
                      },
                    ].map((r) => (
                      <div key={r.risk} className="rounded-xl border border-slate-200 p-5">
                        <div className="font-semibold text-navy-900">Risk</div>
                        <div className="mt-1 text-sm text-slate-700">{r.risk}</div>
                        <div className="mt-3 font-semibold text-emerald-700">Mitigation</div>
                        <div className="mt-1 text-sm text-slate-700">{r.mitigation}</div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="avoid-break">
                  <h2 className="text-xl font-bold text-navy-900">7. Acceptance</h2>
                  <div className="mt-3 rounded-xl border border-slate-200 p-5">
                    <div className="text-sm text-slate-700">
                      The project is accepted when the one-pager and pitch deck accurately represent the verification workflow,
                      include the liability footer, and remain stable for print/PDF distribution.
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <div className="mt-10">
              <LegalDisclaimer variant="light" />
            </div>

            <div className="hidden print:block mt-4 text-xs text-slate-500">Generated from /admin/charter</div>
          </div>
        </div>
      </main>
    </>
  )
}
