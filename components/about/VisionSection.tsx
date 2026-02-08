'use client'

import { Globe, TrendingUp, Users, Shield } from 'lucide-react'

export function VisionSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
          Our Vision for Africa
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          Building a future where every African landowner has secure, verifiable property rights
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-emerald-200">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Secure Land Rights</h3>
          <p className="text-gray-600">
            Protect 10 million landowners from fraud and disputes by 2030, giving families peace of mind and generational security.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-blue-200">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
            <TrendingUp className="h-8 w-8 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Unlock Dead Capital</h3>
          <p className="text-gray-600">
            Enable $100B+ in property-backed financing, allowing landowners to leverage their assets for business growth and development.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-purple-200">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Users className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Build Trust</h3>
          <p className="text-gray-600">
            Restore confidence in African land markets by providing transparent, verifiable ownership records accessible to all stakeholders.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 border border-orange-200">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-orange-600" />
          </div>
          <h3 className="text-2xl font-bold text-navy-900 mb-3">Expand Across Africa</h3>
          <p className="text-gray-600">
            Start in Ghana, then scale to 20+ African countries, creating a continent-wide land verification network.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-8 lg:p-12 text-white text-center">
        <h3 className="text-3xl font-bold mb-4">Join Us in Building the Future</h3>
        <p className="text-xl leading-relaxed mb-6 text-emerald-50">
          Every verified land title brings us closer to a future where property rights are secure, transparent, and accessible to all Africans.
        </p>
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-4xl font-bold mb-1">1,200+</div>
            <div className="text-emerald-100 text-sm">Titles Verified</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">2</div>
            <div className="text-emerald-100 text-sm">Countries</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">98%</div>
            <div className="text-emerald-100 text-sm">Success Rate</div>
          </div>
        </div>
      </div>
    </div>
  )
}
