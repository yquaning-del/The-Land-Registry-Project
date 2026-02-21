'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  MapPin,
  User,
} from 'lucide-react'

interface LandClaim {
  id: string
  claimant_id: string
  parcel_id_barcode: string | null
  document_metadata: { ownerName?: string; parcelId?: string } | null
  address: string | null
  ai_verification_status: string
  document_type: string | null
  created_at: string
  user_profiles: { full_name: string | null } | null
}

interface Stats {
  total: number
  pending: number
  verified: number
  disputed: number
}

const PAGE_SIZE = 50

export default function AdminClaimsPage() {
  const { t } = useLanguage()
  const [claims, setClaims] = useState<LandClaim[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, verified: 0, disputed: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [page, setPage] = useState(0)
  const [totalFiltered, setTotalFiltered] = useState(0)

  useEffect(() => {
    setPage(0)
  }, [filter])

  useEffect(() => {
    loadClaims()
  }, [filter, page])

  const loadClaims = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Stats always reflect global totals — run in parallel with filtered query
      const statsQuery = supabase
        .from('land_claims')
        .select('ai_verification_status', { count: 'exact' })

      let claimsQuery = supabase
        .from('land_claims')
        .select(`
          id, claimant_id, parcel_id_barcode, document_metadata, address,
          ai_verification_status, document_type, created_at,
          user_profiles:claimant_id (full_name)
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

      if (filter !== 'all') {
        claimsQuery = claimsQuery.eq('ai_verification_status', filter)
      }

      const [{ data: allStatusData }, { data, count, error }] = await Promise.all([
        statsQuery,
        claimsQuery,
      ])

      if (error) throw error

      setClaims((data || []) as unknown as LandClaim[])
      setTotalFiltered(count || 0)

      const all: any[] = allStatusData || []
      setStats({
        total: all.length,
        pending: all.filter((c: any) =>
          c.ai_verification_status === 'PENDING_VERIFICATION' ||
          c.ai_verification_status === 'PENDING_HUMAN_REVIEW'
        ).length,
        verified: all.filter((c: any) =>
          c.ai_verification_status === 'AI_VERIFIED' ||
          c.ai_verification_status === 'APPROVED'
        ).length,
        disputed: all.filter((c: any) =>
          c.ai_verification_status === 'DISPUTED' ||
          c.ai_verification_status === 'REJECTED'
        ).length,
      })
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'AI_VERIFIED':
      case 'APPROVED':
        return <Badge className="bg-emerald-500">Verified</Badge>
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'PENDING_HUMAN_REVIEW':
        return <Badge className="bg-blue-500">Human Review</Badge>
      case 'PROCESSING':
        return <Badge className="bg-purple-500">Processing</Badge>
      case 'DISPUTED':
      case 'REJECTED':
        return <Badge className="bg-red-500">Rejected</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">{t('admin.claimsReview')}</h1>
          <p className="text-gray-600">Review and manage all land claims submitted to the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.totalClaims')}</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.verified}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Rejected / Disputed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats.disputed}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Claims</CardTitle>
            <CardDescription>View claims by verification status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'All Claims' },
                { value: 'PENDING_HUMAN_REVIEW', label: 'Human Review' },
                { value: 'PENDING_VERIFICATION', label: 'Pending' },
                { value: 'AI_VERIFIED', label: 'Verified' },
                { value: 'REJECTED', label: 'Rejected' },
              ].map(({ value, label }) => (
                <Button
                  key={value}
                  variant={filter === value ? 'default' : 'outline'}
                  onClick={() => setFilter(value)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claims List</CardTitle>
            <CardDescription>
              {loading ? 'Loading claims...' : `Showing ${page * PAGE_SIZE + 1}–${Math.min((page + 1) * PAGE_SIZE, totalFiltered)} of ${totalFiltered} claim(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
                <p className="mt-4 text-gray-600">Loading claims...</p>
              </div>
            ) : claims.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No claims found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Owner</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('claims.status')}</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-navy-900 font-mono">
                              {claim.parcel_id_barcode || claim.document_metadata?.parcelId || '—'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {claim.document_metadata?.ownerName || '—'}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            {claim.user_profiles?.full_name || claim.claimant_id.slice(0, 8) + '...'}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {claim.address || '—'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(claim.ai_verification_status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link href={`/admin/claims/${claim.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              {t('common.view')}
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalFiltered > PAGE_SIZE && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0 || loading}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page + 1} of {Math.ceil(totalFiltered / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => p + 1)}
                  disabled={(page + 1) * PAGE_SIZE >= totalFiltered || loading}
                >
                  Next
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
