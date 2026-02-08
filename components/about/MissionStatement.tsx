'use client'

import { Target, TrendingUp, Users } from 'lucide-react'

export function MissionStatement() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
          Our Mission
        </h2>
        <p className="text-2xl lg:text-3xl text-gray-700 leading-relaxed font-light mb-8">
          Eliminating land disputes across Africa by providing secure, transparent, and accessible land title verification.
        </p>
        <p className="text-xl text-gray-600 leading-relaxed">
          We're unlocking "Dead Capital" and enabling millions of African landowners to leverage their property for economic growth.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="text-center p-6">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 mb-3">Our Goal</h3>
          <p className="text-gray-600">
            Secure land rights for 10 million African landowners by 2030
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 mb-3">Our Impact</h3>
          <p className="text-gray-600">
            Enable $100B+ in property-backed financing across the continent
          </p>
        </div>

        <div className="text-center p-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-xl font-bold text-navy-900 mb-3">Our Community</h3>
          <p className="text-gray-600">
            Serving banks, law firms, developers, and individual landowners
          </p>
        </div>
      </div>
    </div>
  )
}
