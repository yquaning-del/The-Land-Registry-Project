'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Eye, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PendingClaim {
  id: string
  parcel_id_barcode: string | null
  ai_verification_status: string
  ai_confidence_score: number | null
  created_at: string
  region: string | null
}

export default function VerificationQueuePage() {
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingClaims()
  }, [])

  async function loadPendingClaims() {
    const supabase = createClient()
    
    const { data: claims } = await supabase
      .from('land_claims')
      .select('id, parcel_id_barcode, ai_verification_status, ai_confidence_score, created_at, region')
      .in('ai_verification_status', ['PENDING_VERIFICATION', 'PENDING_HUMAN_REVIEW'])
      .order('created_at', { ascending: false })

    if (claims) {
      setPendingClaims(claims)
    }

    setLoading(false)
  }

  const getConfidenceBadge = (score: number | null) => {
    if (!score) return <Badge variant="secondary">Unknown</Badge>
    if (score >= 0.85) return <Badge variant="default">High</Badge>
    if (score >= 0.60) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="destructive">Low</Badge>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">Verification Queue</h1>
          <p className="text-gray-600">Claims pending AI or human review</p>
        </div>

        <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-xl shadow-2xl">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                Pending Verification ({pendingClaims.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : pendingClaims.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No claims pending verification</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/80 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-semibold text-navy-900">
                            {claim.parcel_id_barcode || 'No Parcel ID'}
                          </p>
                          <Badge variant="secondary">
                            {claim.ai_verification_status.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span>{claim.region || 'Unknown Region'}</span>
                          <span>•</span>
                          <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <span>Confidence:</span>
                            {getConfidenceBadge(claim.ai_confidence_score)}
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/claims/${claim.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
