'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Users,
  FileText,
  Shield,
  Coins,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  BarChart3,
  ArrowRight,
  RefreshCw,
  Eye,
  Calendar,
  Crown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const PLATFORM_OWNER_EMAIL = 'yquaning@gmail.com'

interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalClaims: number
  pendingClaims: number
  verifiedClaims: number
  disputedClaims: number
  mintedClaims: number
  totalCreditsUsed: number
  totalRevenue: number
  verificationRate: number
}

interface RecentActivity {
  id: string
  type: 'claim_submitted' | 'claim_verified' | 'claim_minted' | 'user_registered' | 'payment_received'
  description: string
  timestamp: string
  metadata?: any
}

interface PendingReview {
  id: string
  address: string
  confidence: number
  submittedAt: string
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([])
  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [isPlatformOwner, setIsPlatformOwner] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    checkPlatformOwner()
    loadDashboardData()
  }, [])

  const checkPlatformOwner = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserEmail(user.email || null)
      setIsPlatformOwner(user.email === PLATFORM_OWNER_EMAIL)
    }
  }

  const loadDashboardData = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Get user stats
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const { count: newUsersToday } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())

      // Get claims stats
      const { data: claims } = await supabase
        .from('land_claims')
        .select('id, ai_verification_status, mint_status, created_at, address, ai_confidence_score')

      const claimsData = (claims || []) as any[]
      const totalClaims = claimsData.length
      const pendingClaims = claimsData.filter(c => 
        c.ai_verification_status === 'PENDING_VERIFICATION' || 
        c.ai_verification_status === 'PENDING_HUMAN_REVIEW'
      ).length
      const verifiedClaims = claimsData.filter(c => 
        c.ai_verification_status === 'AI_VERIFIED' || 
        c.ai_verification_status === 'APPROVED'
      ).length
      const disputedClaims = claimsData.filter(c => 
        c.ai_verification_status === 'DISPUTED' || 
        c.ai_verification_status === 'REJECTED'
      ).length
      const mintedClaims = claimsData.filter(c => c.mint_status === 'MINTED').length

      // Get pending reviews
      const pendingReviewClaims = claimsData
        .filter(c => c.ai_verification_status === 'PENDING_HUMAN_REVIEW')
        .slice(0, 5)
        .map(c => ({
          id: c.id,
          address: c.address || 'Unknown location',
          confidence: c.ai_confidence_score || 0,
          submittedAt: c.created_at,
        }))
      setPendingReviews(pendingReviewClaims)

      // Get credit transactions
      const { data: transactions } = await supabase
        .from('credit_transactions')
        .select('amount, type')

      const transactionsData = (transactions || []) as any[]
      const totalCreditsUsed = transactionsData
        .filter(t => t.type === 'VERIFICATION' || t.type === 'MINT')
        .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)

      // Calculate verification rate
      const verificationRate = totalClaims > 0 ? (verifiedClaims / totalClaims) * 100 : 0

      setStats({
        totalUsers: totalUsers || 0,
        newUsersToday: newUsersToday || 0,
        totalClaims,
        pendingClaims,
        verifiedClaims,
        disputedClaims,
        mintedClaims,
        totalCreditsUsed,
        totalRevenue: 0, // Would come from payment provider
        verificationRate,
      })

      // Generate mock recent activity
      const mockActivity: RecentActivity[] = [
        {
          id: '1',
          type: 'claim_verified',
          description: 'Claim #a1b2c3 verified with 94% confidence',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: '2',
          type: 'user_registered',
          description: 'New user registered: john@example.com',
          timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
        },
        {
          id: '3',
          type: 'claim_minted',
          description: 'NFT minted for claim #d4e5f6',
          timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        },
        {
          id: '4',
          type: 'payment_received',
          description: 'Payment received: Professional Plan ($99)',
          timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
        },
        {
          id: '5',
          type: 'claim_submitted',
          description: 'New claim submitted from Accra, Ghana',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
        },
      ]
      setRecentActivity(mockActivity)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadDashboardData()
    setRefreshing(false)
  }

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'claim_submitted':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'claim_verified':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />
      case 'claim_minted':
        return <Coins className="h-4 w-4 text-purple-500" />
      case 'user_registered':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'payment_received':
        return <TrendingUp className="h-4 w-4 text-emerald-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Platform Owner Banner */}
        {isPlatformOwner && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <h2 className="font-bold text-lg">Platform Owner Access</h2>
                <p className="text-white/90 text-sm">
                  Welcome back! You have full access to all platform data, analytics, and controls.
                </p>
              </div>
              <Badge className="ml-auto bg-white/20 text-white border-0">
                {userEmail}
              </Badge>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-navy-900">
              {isPlatformOwner ? 'Platform Owner Dashboard' : 'Admin Dashboard'}
            </h1>
            <p className="text-gray-600">
              {isPlatformOwner 
                ? 'Complete platform overview - all users, claims, and analytics' 
                : 'Platform overview and monitoring'}
            </p>
          </div>
          <Button onClick={handleRefresh} variant="outline" disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-navy-900">{stats?.totalUsers || 0}</p>
                  {stats?.newUsersToday ? (
                    <p className="text-xs text-emerald-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{stats.newUsersToday} today
                    </p>
                  ) : null}
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Claims</p>
                  <p className="text-3xl font-bold text-navy-900">{stats?.totalClaims || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.pendingClaims || 0} pending review
                  </p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <FileText className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Verification Rate</p>
                  <p className="text-3xl font-bold text-navy-900">
                    {stats?.verificationRate.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.verifiedClaims || 0} verified
                  </p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Credits Used</p>
                  <p className="text-3xl font-bold text-navy-900">{stats?.totalCreditsUsed || 0}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats?.mintedClaims || 0} NFTs minted
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Coins className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claims Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Claims Status Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-700">{stats?.pendingClaims || 0}</p>
                  <p className="text-sm text-yellow-600">Pending</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-700">{stats?.verifiedClaims || 0}</p>
                  <p className="text-sm text-emerald-600">Verified</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-700">{stats?.disputedClaims || 0}</p>
                  <p className="text-sm text-red-600">Disputed</p>
                </div>
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                  <Coins className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-700">{stats?.mintedClaims || 0}</p>
                  <p className="text-sm text-purple-600">Minted</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 truncate">{activity.description}</p>
                      <p className="text-xs text-gray-400">{formatTimeAgo(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Reviews & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Pending Human Review
                </CardTitle>
                <Link href="/admin/claims">
                  <Button variant="ghost" size="sm">
                    View All <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </Link>
              </div>
              <CardDescription>Claims requiring manual verification</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingReviews.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                  <p>No claims pending review</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingReviews.map((review) => (
                    <Link 
                      key={review.id} 
                      href={`/admin/claims/${review.id}`}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="font-medium text-navy-900 truncate max-w-[200px]">
                          {review.address}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTimeAgo(review.submittedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          review.confidence >= 0.8 ? 'bg-emerald-500' :
                          review.confidence >= 0.6 ? 'bg-yellow-500' :
                          'bg-red-500'
                        }>
                          {(review.confidence * 100).toFixed(0)}%
                        </Badge>
                        <Eye className="h-4 w-4 text-gray-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common admin tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/admin/claims">
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center cursor-pointer">
                    <FileText className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                    <p className="font-medium text-navy-900">Review Claims</p>
                    <p className="text-xs text-gray-500">{stats?.pendingClaims || 0} pending</p>
                  </div>
                </Link>
                <Link href="/admin/users">
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center cursor-pointer">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-medium text-navy-900">Manage Users</p>
                    <p className="text-xs text-gray-500">{stats?.totalUsers || 0} total</p>
                  </div>
                </Link>
                <Link href="/admin/analytics">
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center cursor-pointer">
                    <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-medium text-navy-900">Analytics</p>
                    <p className="text-xs text-gray-500">View reports</p>
                  </div>
                </Link>
                <Link href="/settings/billing">
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center cursor-pointer">
                    <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                    <p className="font-medium text-navy-900">Billing</p>
                    <p className="text-xs text-gray-500">Manage plans</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-navy-900">API</p>
                  <p className="text-xs text-gray-500">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-navy-900">Database</p>
                  <p className="text-xs text-gray-500">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-navy-900">Blockchain</p>
                  <p className="text-xs text-gray-500">Polygon Amoy</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                <div>
                  <p className="font-medium text-navy-900">IPFS</p>
                  <p className="text-xs text-gray-500">Pinata Gateway</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
