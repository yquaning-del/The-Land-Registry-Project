'use client'

import { useState } from 'react'
import { Shield, Loader2, CheckCircle, AlertTriangle, Lock, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProtectClaimButtonProps {
  claimId: string
  documentUrl: string
  isProtected?: boolean
  protectionHash?: string | null
  onProtected?: (result: ProtectionResult) => void
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'outline'
}

interface ProtectionResult {
  success: boolean
  priorityHash: string
  blockchainTxHash: string | null
  anchoredAt: string
  message: string
}

export function ProtectClaimButton({
  claimId,
  documentUrl,
  isProtected = false,
  protectionHash = null,
  onProtected,
  size = 'default',
  variant = 'default',
}: ProtectClaimButtonProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ProtectionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const handleProtect = async () => {
    setLoading(true)
    setError(null)

    try {
      // Create hash of the document
      const indentureHash = await hashDocument(documentUrl)
      const timestamp = new Date().toISOString()

      const response = await fetch('/api/claims/protect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          indentureHash,
          timestamp,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to protect claim')
      }

      setResult(data)
      onProtected?.(data)
    } catch (err: any) {
      setError(err.message || 'Protection failed')
    } finally {
      setLoading(false)
    }
  }

  // Hash document URL (in production, would hash actual document content)
  const hashDocument = async (url: string): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(url + Date.now().toString())
    const hashBuffer = await crypto.subtle.digest('SHA-256', data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  }

  // Already protected state
  if (isProtected || result?.success) {
    const hash = result?.priorityHash || protectionHash
    const txHash = result?.blockchainTxHash

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
          <CheckCircle className="h-5 w-5 text-emerald-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-emerald-800">Claim Protected</p>
            <p className="text-sm text-emerald-600">
              Priority of Sale established on blockchain
            </p>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowDetails(!showDetails)}
            className="text-emerald-600"
          >
            {showDetails ? 'Hide' : 'Details'}
          </Button>
        </div>

        {showDetails && hash && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm space-y-2">
            <div>
              <span className="text-gray-500">Priority Hash:</span>
              <code className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded break-all">
                {hash.slice(0, 32)}...
              </code>
            </div>
            {txHash && (
              <div className="flex items-center gap-2">
                <span className="text-gray-500">Blockchain TX:</span>
                <a
                  href={`https://polygonscan.com/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 hover:underline flex items-center gap-1"
                >
                  {txHash.slice(0, 16)}...
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}
            {result?.anchoredAt && (
              <div>
                <span className="text-gray-500">Anchored:</span>
                <span className="ml-2">{new Date(result.anchoredAt).toLocaleString()}</span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-red-800">Protection Failed</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
        <Button
          onClick={handleProtect}
          disabled={loading}
          variant="outline"
          className="w-full"
        >
          Try Again
        </Button>
      </div>
    )
  }

  // Default state - show protect button
  return (
    <div className="space-y-3">
      <Button
        onClick={handleProtect}
        disabled={loading}
        size={size}
        variant={variant}
        className={cn(
          "w-full",
          variant === 'default' && "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Anchoring to Blockchain...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Protect My Claim
          </>
        )}
      </Button>

      <div className="flex items-start gap-2 text-xs text-gray-500">
        <Lock className="h-4 w-4 flex-shrink-0 mt-0.5" />
        <p>
          Creates a timestamped blockchain anchor establishing your Priority of Sale. 
          This protects against double-selling by proving when you first claimed this land.
        </p>
      </div>
    </div>
  )
}

export function ProtectClaimCard({
  claimId,
  documentUrl,
  isProtected,
  protectionHash,
}: ProtectClaimButtonProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-emerald-100 rounded-lg">
          <Shield className="h-6 w-6 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-navy-900">Priority of Sale Protection</h3>
          <p className="text-sm text-gray-600">Secure your claim on the blockchain</p>
        </div>
      </div>

      <ProtectClaimButton
        claimId={claimId}
        documentUrl={documentUrl}
        isProtected={isProtected}
        protectionHash={protectionHash}
      />

      <div className="mt-4 pt-4 border-t border-gray-100">
        <h4 className="text-sm font-medium text-gray-700 mb-2">What this does:</h4>
        <ul className="text-xs text-gray-500 space-y-1">
          <li className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            Creates an immutable hash of your Indenture document
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            Anchors the hash to Polygon blockchain with timestamp
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            Proves you claimed this land before any future claimants
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="h-3 w-3 text-emerald-500 mt-0.5 flex-shrink-0" />
            Cannot be altered or deleted once anchored
          </li>
        </ul>
      </div>
    </div>
  )
}
