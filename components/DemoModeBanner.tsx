'use client'

import { useState } from 'react'
import { AlertCircle, X, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DemoModeBanner() {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasPinata = !!process.env.PINATA_JWT
  const hasThirdweb = !!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

  if (hasOpenAI && hasPinata && hasThirdweb) return null

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Sparkles className="h-5 w-5 text-amber-600 mt-0.5" />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-medium text-amber-800 mb-1">
            Demo Mode Active
          </h3>
          <p className="text-sm text-amber-700 mb-3">
            Some platform features are running in demo mode because optional services aren't configured:
            {!hasOpenAI && <span className="block">• AI verification is using basic pattern matching</span>}
            {!hasPinata && <span className="block">• Document storage is simulated</span>}
            {!hasThirdweb && <span className="block">• Blockchain features are disabled</span>}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard/setup">
                Configure Services
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
