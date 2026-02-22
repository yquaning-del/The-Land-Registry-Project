'use client'

import { useEffect, useState, useCallback } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import {
  Eye, Clock, AlertCircle, MessageSquare, CheckCircle, XCircle, Loader2,
} from 'lucide-react'
import Link from 'next/link'

// ─── Types ───────────────────────────────────────────────────────────────────

interface ClaimRow {
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
  // reviewer-only fields
  user_profiles?: { full_name: string | null } | null
}

const REVIEWER_ROLES = ['VERIFIER', 'ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER']

// ─── Component ────────────────────────────────────────────────────────────────

export default function VerificationQueuePage() {
  const { t } = useLanguage()
  const [role, setRole] = useState<string | null>(null)           // null = loading
  const [userId, setUserId] = useState<string | null>(null)
  const [claims, setClaims] = useState<ClaimRow[]>([])
  const [loading, setLoading] = useState(true)

  // Reviewer action state (per-claim)
  const [actionClaimId, setActionClaimId] = useState<string | null>(null)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // ── Determine role, then load correct claims ──────────────────────────────

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setRole('CLAIMANT'); setLoading(false); return }
      setUserId(data.user.id)

      // Email bypass for platform owner
      const ownerEmail = process.env.NEXT_PUBLIC_PLATFORM_OWNER_EMAIL
      if (ownerEmail && data.user.email === ownerEmail) {
        setRole('PLATFORM_OWNER')
        return
      }

      supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          setRole(profile?.role ?? 'CLAIMANT')
        })
    })
  }, [])

  const isReviewer = role !== null && REVIEWER_ROLES.includes(role)

  const loadClaims = useCallback(async () => {
    if (role === null) return   // still resolving
    setLoading(true)

    if (isReviewer) {
      // VERIFIER / ADMIN / SUPER_ADMIN / PLATFORM_OWNER → use reviewer API
      const res = await fetch('/api/verification/queue')
      if (res.ok) {
        const json = await res.json()
        setClaims(json.claims ?? [])
      }
    } else {
      // CLAIMANT → own pending claims via browser client
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data } = await supabase
        .from('land_claims')
        .select('id, parcel_id_barcode, document_metadata, address, ai_verification_status, ai_confidence_score, ai_confidence_level, ai_verification_metadata, created_at, region')
        .eq('claimant_id', user.id)
        .in('ai_verification_status', ['PENDING_VERIFICATION', 'PENDING_HUMAN_REVIEW'])
        .order('created_at', { ascending: false })

      setClaims(data ?? [])
    }

    setLoading(false)
  }, [role, isReviewer])

  useEffect(() => {
    if (role !== null) loadClaims()
  }, [role, loadClaims])

  // ── Reviewer approve/reject ───────────────────────────────────────────────

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const submitReview = async (claimId: string, action: 'APPROVE' | 'REJECT') => {
    setSubmitting(true)
    try {
      const res = await fetch('/api/verification/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId, action, notes: notes.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification('error', data.error || 'Review action failed')
        return
      }
      showNotification('success', `Claim ${action === 'APPROVE' ? 'approved' : 'rejected'} successfully`)
      setActionClaimId(null)
      setNotes('')
      // Remove reviewed claim from list
      setClaims(prev => prev.filter(c => c.id !== claimId))
    } catch {
      showNotification('error', 'Network error — action not saved')
    } finally {
      setSubmitting(false)
    }
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getConfidenceBadge = (score: number | null) => {
    if (!score) return <Badge variant="secondary">Unknown</Badge>
    if (score >= 0.85) return <Badge variant="default">High</Badge>
    if (score >= 0.60) return <Badge variant="secondary">Medium</Badge>
    return <Badge variant="destructive">Low</Badge>
  }

  const barColor = (level: string | null) =>
    level === 'HIGH' ? 'bg-emerald-500' : level === 'MEDIUM' ? 'bg-yellow-500' : 'bg-red-500'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      <div className="container mx-auto px-4 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">{t('verification.verificationQueue')}</h1>
          <p className="text-gray-600">
            {isReviewer
              ? 'Claims awaiting human review — approve or reject with notes'
              : 'Your claims pending AI or human review'}
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success'
              ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {notification.message}
          </div>
        )}

        {/* Claims list */}
        <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-xl shadow-2xl">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-emerald-600" />
                {isReviewer ? 'Pending Human Review' : t('verification.pendingReview')}
                {!loading && ` (${claims.length})`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {isReviewer ? 'No claims pending human review' : t('claims.noClaimsFound')}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {claims.map((claim) => {
                    const reasoning = claim.ai_verification_metadata?.reasoning ?? []
                    const confidencePct = claim.ai_confidence_score != null
                      ? (claim.ai_confidence_score * 100).toFixed(1)
                      : null
                    const isExpanded = actionClaimId === claim.id

                    return (
                      <div
                        key={claim.id}
                        className="p-4 border border-blue-200 bg-blue-50/40 rounded-lg hover:shadow-lg transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            {/* Title row */}
                            <div className="flex items-center gap-3 mb-1 flex-wrap">
                              <p className="font-semibold text-navy-900 font-mono text-sm">
                                {claim.parcel_id_barcode || claim.document_metadata?.ownerName || 'No Parcel ID'}
                              </p>
                              <Badge variant="default">
                                {claim.ai_verification_status.replace(/_/g, ' ')}
                              </Badge>
                            </div>

                            {/* Owner name (reviewer sees claimant name) */}
                            {isReviewer && claim.user_profiles?.full_name && (
                              <p className="text-sm text-gray-700 mb-1">
                                Claimant: <span className="font-medium">{claim.user_profiles.full_name}</span>
                              </p>
                            )}
                            {!isReviewer && claim.document_metadata?.ownerName && (
                              <p className="text-sm text-gray-700 mb-1">{claim.document_metadata.ownerName}</p>
                            )}

                            {/* Meta */}
                            <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap mb-2">
                              <span>{claim.address || claim.region || 'Unknown location'}</span>
                              <span>•</span>
                              <span>{new Date(claim.created_at).toLocaleDateString()}</span>
                            </div>

                            {/* Confidence bar */}
                            {confidencePct && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-gray-500">{t('verification.aiConfidence')}:</span>
                                <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className={`${barColor(claim.ai_confidence_level)} h-1.5 rounded-full`}
                                    style={{ width: `${Math.min(claim.ai_confidence_score! * 100, 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs font-medium text-gray-700">{confidencePct}%</span>
                                {getConfidenceBadge(claim.ai_confidence_score)}
                              </div>
                            )}

                            {/* AI reasoning notes */}
                            {reasoning.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-blue-100">
                                <div className="flex items-center gap-1 text-xs text-blue-600 mb-1">
                                  <MessageSquare className="h-3 w-3" />
                                  <span>{reasoning.length} AI reasoning note{reasoning.length !== 1 ? 's' : ''}</span>
                                </div>
                                <p className="text-xs text-gray-600 line-clamp-2">{reasoning[0]}</p>
                              </div>
                            )}

                            {/* Reviewer: inline approve/reject panel */}
                            {isReviewer && isExpanded && (
                              <div className="mt-3 pt-3 border-t border-blue-200 space-y-3">
                                <Textarea
                                  placeholder="Add review notes (optional)…"
                                  value={notes}
                                  onChange={e => setNotes(e.target.value)}
                                  rows={3}
                                  className="text-sm"
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                                    disabled={submitting}
                                    onClick={() => submitReview(claim.id, 'APPROVE')}
                                  >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    disabled={submitting}
                                    onClick={() => submitReview(claim.id, 'REJECT')}
                                  >
                                    {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    disabled={submitting}
                                    onClick={() => { setActionClaimId(null); setNotes('') }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Right-side action buttons */}
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <Link href={`/claims/${claim.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-1" />
                                {t('common.view')}
                              </Button>
                            </Link>
                            {isReviewer && !isExpanded && (
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                                onClick={() => { setActionClaimId(claim.id); setNotes('') }}
                              >
                                Review
                              </Button>
                            )}
                          </div>
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
