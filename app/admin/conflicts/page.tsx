'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  AlertTriangle, 
  MapPin, 
  Eye, 
  CheckCircle, 
  XCircle,
  Filter,
  RefreshCw,
  Download,
  ChevronRight,
  AlertOctagon,
  Users,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ConflictRecord {
  id: string
  claim_id: string
  conflicting_claim_id: string
  overlap_area_sqm: number
  overlap_percentage: number
  status: string
  detected_at: string
  reviewed_by: string | null
  reviewed_at: string | null
  resolution_notes: string | null
  claim?: {
    id: string
    traditional_authority_name: string | null
    family_head_name: string | null
    region: string | null
    created_at: string
  }
  conflicting_claim?: {
    id: string
    traditional_authority_name: string | null
    family_head_name: string | null
    region: string | null
    created_at: string
  }
}

interface ConflictStats {
  total: number
  pending: number
  resolved: number
  critical: number
}

export default function AdminConflictMapPage() {
  const [conflicts, setConflicts] = useState<ConflictRecord[]>([])
  const [stats, setStats] = useState<ConflictStats>({ total: 0, pending: 0, resolved: 0, critical: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'critical' | 'resolved'>('all')
  const [selectedConflict, setSelectedConflict] = useState<ConflictRecord | null>(null)

  useEffect(() => {
    loadConflicts()
  }, [filter])

  const loadConflicts = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('spatial_conflicts')
        .select(`
          *,
          claim:claim_id(id, traditional_authority_name, family_head_name, region, created_at),
          conflicting_claim:conflicting_claim_id(id, traditional_authority_name, family_head_name, region, created_at)
        `)
        .order('detected_at', { ascending: false })

      if (filter === 'pending') {
        query = query.eq('status', 'PENDING_REVIEW')
      } else if (filter === 'critical') {
        query = query.gte('overlap_percentage', 20)
      } else if (filter === 'resolved') {
        query = query.in('status', ['RESOLVED_VALID', 'RESOLVED_INVALID'])
      }

      const { data, error } = await query

      if (error) {
        console.error('Error loading conflicts:', error)
        return
      }

      const conflictData = (data || []) as ConflictRecord[]
      setConflicts(conflictData)

      // Calculate stats
      const allConflicts = await supabase
        .from('spatial_conflicts')
        .select('id, status, overlap_percentage')
      
      const allData = (allConflicts.data || []) as any[]
      setStats({
        total: allData.length,
        pending: allData.filter(c => c.status === 'PENDING_REVIEW').length,
        resolved: allData.filter(c => ['RESOLVED_VALID', 'RESOLVED_INVALID'].includes(c.status)).length,
        critical: allData.filter(c => c.overlap_percentage >= 20).length,
      })
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (percentage: number) => {
    if (percentage >= 50) return 'bg-red-500'
    if (percentage >= 20) return 'bg-orange-500'
    if (percentage >= 5) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getSeverityLabel = (percentage: number) => {
    if (percentage >= 50) return 'CRITICAL'
    if (percentage >= 20) return 'HIGH'
    if (percentage >= 5) return 'MEDIUM'
    return 'LOW'
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Pending Review</span>
      case 'UNDER_INVESTIGATION':
        return <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">Investigating</span>
      case 'RESOLVED_VALID':
        return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Resolved - Valid</span>
      case 'RESOLVED_INVALID':
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">Resolved - Invalid</span>
      case 'DISPUTED':
        return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Disputed</span>
      default:
        return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">{status}</span>
    }
  }

  const getGrantorName = (claim: ConflictRecord['claim']) => {
    if (!claim) return 'Unknown'
    return claim.traditional_authority_name || claim.family_head_name || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
            <Link href="/admin" className="hover:text-emerald-600">Admin</Link>
            <ChevronRight className="h-4 w-4" />
            <span>Conflict Map</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-navy-900 flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-orange-500" />
                Spatial Conflict Map
              </h1>
              <p className="text-gray-600 mt-1">
                Monitor and resolve overlapping land claims
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadConflicts} disabled={loading}>
                <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                Refresh
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Conflicts</p>
                <p className="text-3xl font-bold text-navy-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg">
                <MapPin className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Pending Review</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Critical (≥20%)</p>
                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertOctagon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resolved</p>
                <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'all', label: 'All Conflicts' },
            { key: 'pending', label: 'Pending Review' },
            { key: 'critical', label: 'Critical' },
            { key: 'resolved', label: 'Resolved' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                filter === tab.key
                  ? "bg-emerald-500 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Conflict List */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-navy-900">Detected Conflicts</h2>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-500 mx-auto mb-2" />
              <p className="text-gray-500">Loading conflicts...</p>
            </div>
          ) : conflicts.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
              <h3 className="font-medium text-gray-900 mb-1">No Conflicts Found</h3>
              <p className="text-gray-500">All land claims have unique coordinates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {/* Severity Indicator */}
                      <div className={cn(
                        "w-3 h-3 rounded-full mt-1.5",
                        getSeverityColor(conflict.overlap_percentage)
                      )} />

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-navy-900">
                            {conflict.overlap_percentage.toFixed(1)}% Overlap
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-xs font-bold rounded",
                            conflict.overlap_percentage >= 20 
                              ? "bg-red-100 text-red-700" 
                              : "bg-yellow-100 text-yellow-700"
                          )}>
                            {getSeverityLabel(conflict.overlap_percentage)}
                          </span>
                          {getStatusBadge(conflict.status)}
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{getGrantorName(conflict.claim)}</span>
                            <span className="text-gray-400">vs</span>
                            <span>{getGrantorName(conflict.conflicting_claim)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Detected {new Date(conflict.detected_at).toLocaleDateString()}
                          </span>
                          <span>
                            {conflict.overlap_area_sqm.toFixed(0)} sqm overlap
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/claims/${conflict.claim_id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Claim A
                        </Button>
                      </Link>
                      <Link href={`/claims/${conflict.conflicting_claim_id}`}>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Claim B
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-navy-900 mb-3">Severity Legend</h3>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm text-gray-600">Critical (≥50% overlap)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span className="text-sm text-gray-600">High (20-50% overlap)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span className="text-sm text-gray-600">Medium (5-20% overlap)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm text-gray-600">Low (&lt;5% overlap)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
