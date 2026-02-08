'use client'

import { cn } from '@/lib/utils'

interface LegalDisclaimerProps {
  className?: string
  variant?: 'light' | 'dark'
}

export function LegalDisclaimer({ className, variant = 'light' }: LegalDisclaimerProps) {
  const isDark = variant === 'dark'

  return (
    <div
      className={cn(
        'border-t',
        isDark ? 'border-white/10 bg-navy-900 text-slate-200' : 'border-slate-200 bg-white text-slate-700',
        className
      )}
    >
      <div className="container mx-auto px-4 py-6">
        <div className={cn('max-w-6xl mx-auto text-xs leading-relaxed', isDark ? 'text-slate-300' : 'text-slate-600')}>
          <div className={cn('font-semibold tracking-wide uppercase', isDark ? 'text-emerald-200' : 'text-navy-900')}>
            Legal Disclaimer
          </div>

          <div className="mt-3 space-y-3">
            <p>
              <span className={cn('font-semibold', isDark ? 'text-slate-100' : 'text-navy-900')}>As-Is Data Provision:</span>{' '}
              AfriTrust provides an independent verification service on an “as-is” basis. Our platform generates a probabilistic Trust Score based on available data.
              While we utilize AI and blockchain to maximize accuracy, the final responsibility for legal due diligence remains with the user and their legal counsel.
            </p>

            <p>
              <span className={cn('font-semibold', isDark ? 'text-slate-100' : 'text-navy-900')}>Not a Government Entity:</span>{' '}
              “[Company Name]” is a private technology platform and is not affiliated with any government land commission.
              Our “Verified” status functions as a Digital Notary and a private risk assessment that complements (and does not replace) official government registration.
              It does not constitute a legal land title recognized by the state until formalized through official government channels.
            </p>

            <p>
              <span className={cn('font-semibold', isDark ? 'text-slate-100' : 'text-navy-900')}>Human-in-the-Loop Requirement:</span>{' '}
              To ensure compliance, all high-value verifications must be counter-signed by a vetted local notary within our network.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
