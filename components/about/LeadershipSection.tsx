'use client'

import { Award, Briefcase, GraduationCap } from 'lucide-react'

export function LeadershipSection() {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center mb-16">
        <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-6">
          PMP-Certified Leadership
        </h2>
        <p className="text-xl text-gray-600 leading-relaxed">
          Combining technical expertise with rigorous project management methodology
        </p>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12 border border-gray-200 mb-12">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-4xl font-bold text-white">PMP</span>
              </div>
            </div>
            <div className="lg:col-span-2">
              <h3 className="text-2xl font-bold text-navy-900 mb-2">Founder & CEO</h3>
              <p className="text-lg text-emerald-600 font-semibold mb-4">PMP Certified • Systems Analyst</p>
              <p className="text-gray-600 leading-relaxed mb-6">
                With a background in complex project delivery and systems analysis, our leadership brings rigorous methodology to solving Africa's land fraud crisis. PMP certification ensures disciplined execution, risk management, and stakeholder alignment across every initiative.
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="flex items-start gap-3">
                  <Award className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-navy-900">PMP Certified</div>
                    <div className="text-sm text-gray-600">Project Management Professional</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Briefcase className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-navy-900">Systems Analyst</div>
                    <div className="text-sm text-gray-600">Complex systems design</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <GraduationCap className="h-5 w-5 text-emerald-600 mt-1 flex-shrink-0" />
                  <div>
                    <div className="font-semibold text-navy-900">10+ Years</div>
                    <div className="text-sm text-gray-600">Technology leadership</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center bg-gradient-to-br from-navy-900 to-navy-800 rounded-xl p-8 text-white">
          <p className="text-xl leading-relaxed mb-4">
            "We combine technical expertise with deep understanding of African land markets, ensuring solutions that work in the real world—not just in theory."
          </p>
          <p className="text-gray-400">— Leadership Team</p>
        </div>
      </div>
    </div>
  )
}
