'use client'

import { Building2 } from 'lucide-react'

const trustedOrganizations = [
  { name: 'Access Bank', type: 'bank' },
  { name: 'GTBank', type: 'bank' },
  { name: 'Stanbic IBTC', type: 'bank' },
  { name: 'Baker McKenzie', type: 'law' },
  { name: 'Aluko & Oyebode', type: 'law' },
  { name: 'Udo Udoma & Belo-Osagie', type: 'law' },
]

export function TrustedByLogos() {
  return (
    <section className="bg-white py-16 border-y border-gray-200">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-12">
          Trusted By Leading Financial & Legal Institutions
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center">
          {trustedOrganizations.map((org, index) => (
            <div
              key={index}
              className="flex flex-col items-center justify-center p-6 grayscale hover:grayscale-0 transition-all duration-300 hover:scale-105"
            >
              <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                <Building2 className="h-8 w-8 text-navy-900" />
                <div className="text-center">
                  <p className="font-bold text-sm text-navy-900">{org.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{org.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
