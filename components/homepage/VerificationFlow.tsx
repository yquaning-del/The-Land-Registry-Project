'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Upload, 
  Scan, 
  Satellite, 
  Link2, 
  ArrowRight,
  Play,
  CheckCircle,
  Shield
} from 'lucide-react'

interface Step {
  number: number
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const steps: Step[] = [
  {
    number: 1,
    title: 'Upload',
    description: 'Take a photo of your Indenture or C of O. Our system accepts scans, photos, or PDFs.',
    icon: Upload,
    color: 'from-blue-500 to-blue-600',
  },
  {
    number: 2,
    title: 'AI Audit',
    description: 'Our AI checks stamps, signatures, and document patterns against official records.',
    icon: Scan,
    color: 'from-purple-500 to-purple-600',
  },
  {
    number: 3,
    title: 'Satellite Lock',
    description: 'We verify the land coordinates haven\'t been double-sold using satellite imagery.',
    icon: Satellite,
    color: 'from-emerald-500 to-emerald-600',
  },
  {
    number: 4,
    title: 'Blockchain Seal',
    description: 'We lock the proof on the blockchain and give you a shareable \'Trust Link\'.',
    icon: Link2,
    color: 'from-orange-500 to-orange-600',
  },
]

interface VerificationFlowProps {
  onTryDemo: () => void
}

export function VerificationFlow({ onTryDemo }: VerificationFlowProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2 mb-4">
            <Shield className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-emerald-700 font-semibold">Simple 4-Step Process</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-navy-900 mb-4">
            How We Verify Your Land Title
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From upload to blockchain seal in minutes. No technical knowledge required.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {steps.map((step, index) => {
            const Icon = step.icon
            const isHovered = hoveredStep === step.number
            
            return (
              <div
                key={step.number}
                className="relative group"
                onMouseEnter={() => setHoveredStep(step.number)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-gray-300 to-gray-200 z-0" />
                )}
                
                {/* Step Card */}
                <div className={`relative z-10 bg-white rounded-2xl p-6 shadow-lg border-2 transition-all duration-300 ${
                  isHovered ? 'border-emerald-500 shadow-xl transform -translate-y-2' : 'border-gray-100'
                }`}>
                  {/* Step Number Badge */}
                  <div className={`absolute -top-4 -left-4 w-10 h-10 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.number}
                  </div>
                  
                  {/* Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 transition-transform duration-300 ${
                    isHovered ? 'scale-110' : ''
                  }`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-bold text-navy-900 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{step.description}</p>
                  
                  {/* Hover Indicator */}
                  <div className={`mt-4 flex items-center gap-2 text-emerald-600 transition-opacity duration-300 ${
                    isHovered ? 'opacity-100' : 'opacity-0'
                  }`}>
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Automated & Secure</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-navy-900 to-navy-800 rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-left">
                <h3 className="text-2xl font-bold text-white mb-2">
                  See the AI in Action
                </h3>
                <p className="text-gray-300">
                  Watch how our AI detects fake documents vs real ones in seconds.
                </p>
              </div>
              <Button 
                onClick={onTryDemo}
                size="lg" 
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-6 text-lg whitespace-nowrap"
              >
                <Play className="h-5 w-5 mr-2" />
                Try a Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>99.7% Accuracy Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>Under 2 Minutes</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>Bank-Grade Security</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-emerald-500" />
            <span>Immutable Records</span>
          </div>
        </div>
      </div>
    </section>
  )
}
