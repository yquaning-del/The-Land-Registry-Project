'use client'

import { Building2, Scale, Landmark } from 'lucide-react'

const organizations = [
  { name: 'Access Bank', type: 'bank', icon: Building2 },
  { name: 'GTBank', type: 'bank', icon: Building2 },
  { name: 'Stanbic IBTC', type: 'bank', icon: Building2 },
  { name: 'First Bank', type: 'bank', icon: Building2 },
  { name: 'Nigerian Real Estate Board', type: 'board', icon: Landmark },
  { name: 'Ghana Lands Commission', type: 'board', icon: Landmark },
  { name: 'Baker McKenzie', type: 'law', icon: Scale },
  { name: 'Aluko & Oyebode', type: 'law', icon: Scale },
]

export function TrustMarquee() {
  return (
    <section className="py-12 bg-white border-y border-gray-200 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider">
          Trusted By Leading Financial & Legal Institutions
        </p>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Scrolling Content */}
        <div className="flex">
          {/* First Set */}
          <div className="flex animate-marquee-scroll">
            {organizations.map((org, index) => (
              <div
                key={`first-${index}`}
                className="flex items-center gap-3 mx-8 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-500 transition-all duration-300 hover:scale-105 grayscale hover:grayscale-0 whitespace-nowrap"
              >
                <org.icon className="h-6 w-6 text-navy-900" />
                <div>
                  <p className="font-bold text-sm text-navy-900">{org.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{org.type}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Duplicate Set for Seamless Loop */}
          <div className="flex animate-marquee-scroll" aria-hidden="true">
            {organizations.map((org, index) => (
              <div
                key={`second-${index}`}
                className="flex items-center gap-3 mx-8 px-6 py-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-emerald-500 transition-all duration-300 hover:scale-105 grayscale hover:grayscale-0 whitespace-nowrap"
              >
                <org.icon className="h-6 w-6 text-navy-900" />
                <div>
                  <p className="font-bold text-sm text-navy-900">{org.name}</p>
                  <p className="text-xs text-gray-600 capitalize">{org.type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
