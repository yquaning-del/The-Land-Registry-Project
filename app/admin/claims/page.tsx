'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Eye,
  TrendingUp,
  Users,
  MapPin
} from 'lucide-react'

interface LandClaim {
  id: string
  parcel_id: string
  owner_name: string
  location: string
  status: string
  verification_status: string
  created_at: string
  user_id: string
  users?: {
    email: string
  }
}

interface Stats {
  total: number
  pending: number
  verified: number
  disputed: number
}

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<LandClaim[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, verified: 0, disputed: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadClaims()
  }, [filter])

  const loadClaims = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      let query = supabase
        .from('land_claims')
        .select(`
          *,
          users:user_id (email)
        `)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_status', filter)
      }

      const { data, error } = await query

      if (error) throw error

      setClaims(data || [])

      // Calculate stats
      const allClaims = data || []
      setStats({
        total: allClaims.length,
        pending: allClaims.filter(c => c.verification_status === 'PENDING').length,
        verified: allClaims.filter(c => c.verification_status === 'VERIFIED').length,
        disputed: allClaims.filter(c => c.verification_status === 'DISPUTED').length,
      })
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'VERIFIED':
        return <Badge className="bg-emerald-500">Verified</Badge>
      case 'PENDING':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'DISPUTED':
        return <Badge className="bg-red-500">Disputed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Admin Claims Dashboard</h1>
          <p className="text-gray-600">Review and manage all land claims submitted to the platform</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
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
              <CardTitle className="text-sm font-medium text-gray-600">Disputed</CardTitle>
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
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All Claims
              </Button>
              <Button
                variant={filter === 'PENDING' ? 'default' : 'outline'}
                onClick={() => setFilter('PENDING')}
              >
                Pending
              </Button>
              <Button
                variant={filter === 'VERIFIED' ? 'default' : 'outline'}
                onClick={() => setFilter('VERIFIED')}
              >
                Verified
              </Button>
              <Button
                variant={filter === 'DISPUTED' ? 'default' : 'outline'}
                onClick={() => setFilter('DISPUTED')}
              >
                Disputed
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Claims Table */}
        <Card>
          <CardHeader>
            <CardTitle>Claims List</CardTitle>
            <CardDescription>
              {loading ? 'Loading claims...' : `Showing ${claims.length} claim(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
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
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Parcel ID
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {claims.map((claim) => (
                      <tr key={claim.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                            <span className="text-sm font-medium text-navy-900">
                              {claim.parcel_id}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{claim.owner_name}</div>
                          <div className="text-xs text-gray-500">{claim.users?.email}</div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {claim.location}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getStatusBadge(claim.verification_status)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(claim.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <Link href={`/admin/claims/${claim.id}`}>
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-1" />
                              Review
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
