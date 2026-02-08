'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, Shield } from 'lucide-react'

interface VerificationStep {
  id: number
  text: string
  status: 'pending' | 'processing' | 'complete'
  confidence?: number
}

export function VerificationTerminal() {
  const [steps, setSteps] = useState<VerificationStep[]>([
    { id: 1, text: 'Analyzing document authenticity...', status: 'pending' },
    { id: 2, text: 'Validating GPS coordinates...', status: 'pending', confidence: 0 },
    { id: 3, text: 'Cross-referencing land registry...', status: 'pending' },
    { id: 4, text: 'Checking for conflicts...', status: 'pending' },
    { id: 5, text: 'Verifying ownership chain...', status: 'pending', confidence: 0 },
    { id: 6, text: 'Blockchain verification complete!', status: 'pending' },
  ])

  useEffect(() => {
    const processSteps = async () => {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200))
        
        setSteps(prev => prev.map((step, idx) => {
          if (idx === i) {
            return { ...step, status: 'processing' }
          }
          return step
        }))

        await new Promise(resolve => setTimeout(resolve, 800))
        
        setSteps(prev => prev.map((step, idx) => {
          if (idx === i) {
            return {
              ...step,
              status: 'complete',
              confidence: step.confidence !== undefined ? 85 + Math.random() * 15 : undefined
            }
          }
          return step
        }))
      }
    }

    processSteps()
  }, [])

  return (
    <div className="bg-navy-900 rounded-lg p-6 font-mono text-sm shadow-2xl border border-navy-700">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-navy-700">
        <Shield className="h-5 w-5 text-emerald-500" />
        <span className="text-emerald-500 font-semibold">AI Verification Terminal</span>
        <div className="ml-auto flex gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-amber-500" />
          <div className="h-3 w-3 rounded-full bg-emerald-500" />
        </div>
      </div>

      <div className="space-y-3">
        {steps.map((step) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="mt-1">
              {step.status === 'complete' && (
                <CheckCircle className="h-4 w-4 text-emerald-500" />
              )}
              {step.status === 'processing' && (
                <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
              )}
              {step.status === 'pending' && (
                <div className="h-4 w-4 rounded-full border-2 border-gray-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`${
                step.status === 'complete' ? 'text-emerald-400' :
                step.status === 'processing' ? 'text-blue-400' :
                'text-gray-500'
              }`}>
                {step.text}
              </p>
              {step.status === 'complete' && step.confidence !== undefined && (
                <div className="mt-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-navy-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${step.confidence}%` }}
                      />
                    </div>
                    <span className="text-emerald-400 text-xs font-semibold">
                      {step.confidence.toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {steps.every(s => s.status === 'complete') && (
        <div className="mt-4 pt-4 border-t border-navy-700">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Verification Complete - Ready for Blockchain Mint</span>
          </div>
        </div>
      )}
    </div>
  )
}
