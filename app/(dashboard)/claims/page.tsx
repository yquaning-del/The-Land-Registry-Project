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
  MapPin,
  ScrollText
} from 'lucide-react'
import Link from 'next/link'

interface LandClaim {
  id: string
  parcel_id: string
  parcel_id_barcode: string | null
  owner_name: string
  location: string
  status: string
  verification_status: string
  ai_verification_status: string
  document_type: string | null
  title_type: string | null
  address: string | null
  document_metadata: any
  created_at: string
  original_document_url: string
}

export default function ClaimsPage() {
  const [claims, setClaims] = useState<LandClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  useEffect(() => {
    loadClaims()
  }, [filter, typeFilter])

  const loadClaims = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('land_claims')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false })

      if (filter === 'VERIFIED') {
        query = query.in('ai_verification_status', ['AI_VERIFIED', 'APPROVED'])
      } else if (filter !== 'all') {
        query = query.eq('ai_verification_status', filter)
      }

      if (typeFilter !== 'all') {
        query = query.eq('document_type', typeFilter)
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
      case 'AI_VERIFIED':
      case 'APPROVED':
        return <Badge className="bg-emerald-500">Verified</Badge>
      case 'PENDING_VERIFICATION':
        return <Badge className="bg-yellow-500">Pending</Badge>
      case 'PENDING_HUMAN_REVIEW':
        return <Badge className="bg-blue-500">Human Review</Badge>
      case 'REJECTED':
      case 'DISPUTED':
        return <Badge className="bg-red-500">Disputed</Badge>
      default:
        return <Badge className="bg-gray-500">{status}</Badge>
    }
  }

  const getDocTypeBadge = (claim: LandClaim) => {
    if (claim.document_type === 'INDENTURE') {
      return (
        <Badge variant="outline" className="border-amber-300 text-amber-700 bg-amber-50 text-xs">
          <ScrollText className="h-3 w-3 mr-1" />
          Indenture
        </Badge>
      )
    }
    if (claim.document_type === 'LAND_TITLE') {
      return (
        <Badge variant="outline" className="border-blue-300 text-blue-700 bg-blue-50 text-xs">
          <FileText className="h-3 w-3 mr-1" />
          Land Title
        </Badge>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-navy-900 mb-2">My Land Claims</h1>
            <p className="text-gray-600">Manage and track your land verification claims</p>
          </div>
          <Link href="/claims/new">
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
                {claims.filter(c => c.ai_verification_status === 'PENDING_VERIFICATION').length}
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
                {claims.filter(c => c.ai_verification_status === 'AI_VERIFIED' || c.ai_verification_status === 'APPROVED').length}
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
                {claims.filter(c => c.ai_verification_status === 'REJECTED' || c.ai_verification_status === 'DISPUTED').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filter Claims</CardTitle>
            <CardDescription>View claims by status or document type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
                size="sm"
              >
                All Statuses
              </Button>
              <Button
                variant={filter === 'PENDING_VERIFICATION' ? 'default' : 'outline'}
                onClick={() => setFilter('PENDING_VERIFICATION')}
                size="sm"
              >
                Pending
              </Button>
              <Button
                variant={filter === 'VERIFIED' ? 'default' : 'outline'}
                onClick={() => setFilter('VERIFIED')}
                size="sm"
              >
                Verified
              </Button>
              <Button
                variant={filter === 'REJECTED' ? 'default' : 'outline'}
                onClick={() => setFilter('REJECTED')}
                size="sm"
              >
                Rejected
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={typeFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('all')}
                size="sm"
              >
                All Types
              </Button>
              <Button
                variant={typeFilter === 'LAND_TITLE' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('LAND_TITLE')}
                size="sm"
              >
                <FileText className="h-3 w-3 mr-1" />
                Land Titles
              </Button>
              <Button
                variant={typeFilter === 'INDENTURE' ? 'default' : 'outline'}
                onClick={() => setTypeFilter('INDENTURE')}
                size="sm"
              >
                <ScrollText className="h-3 w-3 mr-1" />
                Indentures
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
              <Link href="/claims/new">
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
                      <CardTitle className="text-lg">
                        {claim.document_metadata?.parcelId || claim.parcel_id_barcode || claim.address || 'Untitled Claim'}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {claim.address || claim.document_metadata?.district || 'No location'}
                      </CardDescription>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {getStatusBadge(claim.ai_verification_status)}
                      {getDocTypeBadge(claim)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Owner</p>
                      <p className="font-medium">{claim.document_metadata?.ownerName || 'Not specified'}</p>
                    </div>
                    {claim.title_type && (
                      <div>
                        <p className="text-sm text-gray-600">Title Type</p>
                        <p className="text-sm">{claim.title_type.replace(/_/g, ' ')}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Submitted</p>
                      <p className="text-sm">{new Date(claim.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <Link href={`/claims/${claim.id}`}>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </Link>
                      {(claim.ai_verification_status === 'AI_VERIFIED' || claim.ai_verification_status === 'APPROVED') && (
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
