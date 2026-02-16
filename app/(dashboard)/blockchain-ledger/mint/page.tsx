'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Wallet, 
  CheckCircle, 
  AlertTriangle, 
  ArrowLeft,
  Coins,
  Shield,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { MintTitleButton } from '@/components/MintTitleButton'

interface LandClaim {
  id: string
  parcel_id: string
  owner_name: string
  location: string
  verification_status: string
  original_document_url: string
  ipfs_metadata_url?: string
  on_chain_hash?: string
  mint_status?: string
  minted_at?: string
}

export default function MintPageWrapper() {
  return (
    <Suspense fallback={null}>
      <MintPage />
    </Suspense>
  )
}

function MintPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const claimId = searchParams.get('claimId')
  
  const [claim, setClaim] = useState<LandClaim | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (claimId) {
      loadClaim()
    } else {
      setError('No claim ID provided')
      setLoading(false)
    }
  }, [claimId])

  const loadClaim = async () => {
    if (!claimId) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error: claimError } = await supabase
        .from('land_claims')
        .select('*')
        .eq('id', claimId)
        .eq('user_id', user.id)
        .single()

      if (claimError) throw claimError

      if (!data) {
        throw new Error('Claim not found')
      }

      if ((data as any).verification_status !== 'VERIFIED' && (data as any).ai_verification_status !== 'APPROVED') {
        throw new Error('Claim must be verified before minting')
      }

      setClaim(data as any)
    } catch (error) {
      console.error('Error loading claim:', error)
      setError(error instanceof Error ? error.message : 'Failed to load claim')
    } finally {
      setLoading(false)
    }
  }

  const handleMintSuccess = (transactionHash: string, ipfsHash: string) => {
    // Refresh claim data to show updated mint status
    loadClaim()
  }

  const handleMintError = (error: Error) => {
    console.error('Mint error:', error)
    setError(error.message)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading claim details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !claim) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Link href="/dashboard/claims">
              <Button>Back to Claims</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/claims" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Claims
          </Link>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Mint Land Title NFT</h1>
          <p className="text-gray-600">Create an immutable blockchain record of your verified land title</p>
        </div>

        {/* Claim Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Claim Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Parcel ID</p>
                <p className="font-medium">{claim.parcel_id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Owner</p>
                <p className="font-medium">{claim.owner_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{claim.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge className="bg-emerald-500">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mint Status */}
        {claim.mint_status === 'MINTED' ? (
          <Card className="mb-6 border-emerald-200 bg-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-800">
                <CheckCircle className="h-5 w-5" />
                Successfully Minted
              </CardTitle>
              <CardDescription>
                Your land title has been permanently recorded on the blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {claim.on_chain_hash && (
                  <div>
                    <p className="text-sm text-gray-600">Transaction Hash</p>
                    <a 
                      href={`https://amoy.polygonscan.com/tx/${claim.on_chain_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-mono text-sm"
                    >
                      {claim.on_chain_hash}
                    </a>
                  </div>
                )}
                {claim.ipfs_metadata_url && (
                  <div>
                    <p className="text-sm text-gray-600">IPFS Metadata</p>
                    <a 
                      href={claim.ipfs_metadata_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:text-emerald-700 font-mono text-sm"
                    >
                      {claim.ipfs_metadata_url}
                    </a>
                  </div>
                )}
                {claim.minted_at && (
                  <div>
                    <p className="text-sm text-gray-600">Minted On</p>
                    <p className="text-sm">{new Date(claim.minted_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5" />
                Mint Information
              </CardTitle>
              <CardDescription>
                Mint your verified land title as an NFT on the Polygon blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Coins className="h-5 w-5 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-medium">Cost: 5 Credits</p>
                    <p className="text-sm text-gray-600">Required for blockchain minting and gas fees</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-emerald-600 mt-1" />
                  <div>
                    <p className="font-medium">Permanent Record</p>
                    <p className="text-sm text-gray-600">Once minted, your land title is immutable and publicly verifiable</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mint Button */}
        {claim.mint_status !== 'MINTED' && (
          <Card>
            <CardContent className="pt-6">
              <MintTitleButton
                claimId={claim.id}
                claimData={claim as any}
                onSuccess={handleMintSuccess}
                onError={handleMintError}
              />
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Link href="/dashboard/claims">
            <Button variant="outline">Back to Claims</Button>
          </Link>
          {claim.mint_status === 'MINTED' && (
            <Link href="/dashboard/blockchain-ledger">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                View Blockchain Ledger
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
