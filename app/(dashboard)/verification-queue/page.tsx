'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { Eye, Clock, AlertCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface PendingClaim {
  id: string
  parcel_id_barcode: string | null
  document_metadata: { ownerName?: string } | null
  address: string | null
  ai_verification_status: string
  ai_confidence_score: number | null
  ai_confidence_level: string | null
  ai_verification_metadata: { reasoning?: string[] } | null
  created_at: string
  region: string | null
}

export default function VerificationQueuePage() {
  const { t } = useLanguage()
  const [pendingClaims, setPendingClaims] = useState<PendingClaim[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPendingClaims()
  }, [])

  async function loadPendingClaims() {
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setLoading(false)
      return
    }

    const { data: claims } = await supabase
      .from('land_claims')
      .select('id, parcel_id_barcode, document_metadata, address, ai_verification_status, ai_confidence_score, ai_confidence_level, ai_verification_metadata, created_at, region')
      .eq('claimant_id', user.id)
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
          <h1 className="text-3xl font-bold text-navy-900 mb-2">{t('verification.verificationQueue')}</h1>
          <p className="text-gray-600">Claims pending AI or human review</p>
        </div>

        <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-xl shadow-2xl">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                {t('verification.pendingReview')} ({pendingClaims.length})
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
                  <p className="text-gray-500">{t('claims.noClaimsFound')}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingClaims.map((claim) => {
                    const reasoning = claim.ai_verification_metadata?.reasoning || []
                    const isHumanReview = claim.ai_verification_status === 'PENDING_HUMAN_REVIEW'
                    const confidencePct = claim.ai_confidence_score != null
                      ? (claim.ai_confidence_score * 100).toFixed(1)
                      : null
                    const barColor = claim.ai_confidence_level === 'HIGH'
                      ? 'bg-emerald-500'
                      : claim.ai_confidence_level === 'MEDIUM'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'

                    return (
                      <div
                        key={claim.id}
                        className={`p-4 border rounded-lg hover:shadow-lg transition-all duration-300 ${isHumanReview ? 'border-blue-200 bg-blue-50/40' : 'border-white/20 hover:bg-white/80'}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <p className="font-semibold text-navy-900 font-mono text-sm">
                                {claim.parcel_id_barcode || claim.document_metadata?.ownerName || 'No Parcel ID'}
                              </p>
                              <Badge variant={isHumanReview ? 'default' : 'secondary'}>
                                {claim.ai_verification_status.replace(/_/g, ' ')}
                              </Badge>
                            </div>

                            {claim.document_metadata?.ownerName && (
                              <p className="text-sm text-gray-700 mb-1">{claim.document_metadata.ownerName}</p>
                            )}

                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                              <span>{claim.address || claim.region || 'Unknown location'}</span>
                              <span>•</span>
                              <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Confidence bar */}
                            {confidencePct && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-500">{t('verification.aiConfidence')}:</span>
                                <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`${barColor} h-1.5 rounded-full`}
                                    style={{ width: `${Math.min(claim.ai_confidence_score! * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{confidencePct}%</span>
                                {getConfidenceBadge(claim.ai_confidence_score)}
                              </div>
                            )}

                            {/* AI reasoning preview (human review only) */}
                            {isHumanReview && reasoning.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-100">
                                <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{reasoning.length} AI reasoning note{reasoning.length !== 1 ? 's' : ''}</span>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{reasoning[0]}</p>
                              </div>
                            )}
                          </div>

                          <Link href={`/claims/${claim.id}`}>
                            <Button variant={isHumanReview ? 'default' : 'outline'} size="sm" className={isHumanReview ? 'bg-blue-600 hover:bg-blue-700' : ''}>
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
