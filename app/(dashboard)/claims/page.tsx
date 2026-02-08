'use client'

import { useEffect, useState } from 'react'
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
  Upload,
  MapPin
} from 'lucide-react'
import Link from 'next/link'

interface LandClaim {
  id: string
  parcel_id: string
  owner_name: string
  location: string
  status: string
  verification_status: string
  created_at: string
  original_document_url: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<LandClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    loadClaims()
  }, [filter])

  const loadClaims = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('land_claims')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('verification_status', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setClaims(data || [])
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
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-2">My Land Claims</h1>
            <p className="text-gray-600">Manage and track your land title verification claims</p>
          </div>
          <Link href="/dashboard/claims/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Upload className="h-4 w-4 mr-2" />
              New Claim
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{claims.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-600">
                {claims.filter(c => c.verification_status === 'PENDING').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verified</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {claims.filter(c => c.verification_status === 'VERIFIED').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Disputed</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">
                {claims.filter(c => c.verification_status === 'DISPUTED').length}
              </div>
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

        {/* Claims Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading claims...</p>
          </div>
        ) : claims.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No claims yet</h3>
              <p className="text-gray-600 mb-4">Submit your first land title claim to get started</p>
              <Link href="/dashboard/claims/new">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Upload className="h-4 w-4 mr-2" />
                  Submit First Claim
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {claims.map((claim) => (
              <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{claim.parcel_id}</CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {claim.location}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.verification_status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="font-medium">{claim.owner_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-sm">{new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Link href={`/dashboard/claims/${claim.id}`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {claim.verification_status === 'VERIFIED' && (
                        <Link href={`/dashboard/blockchain-ledger/mint?claimId=${claim.id}`}>
                          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                            Mint NFT
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
