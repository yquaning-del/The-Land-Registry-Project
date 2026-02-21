'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  TrendingUp, 
  Users, 
  FileText, 
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  Activity,
  BarChart3,
  PieChart
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalClaims: number
  verifiedClaims: number
  pendingClaims: number
  disputedClaims: number
  totalCreditsUsed: number
  totalRevenue: number
  claimsByMonth: { month: string; count: number }[]
  verificationRate: number
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalClaims: 0,
    verifiedClaims: 0,
    pendingClaims: 0,
    disputedClaims: 0,
    totalCreditsUsed: 0,
    totalRevenue: 0,
    claimsByMonth: [],
    verificationRate: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    const supabase = createClient()

    try {
      // Get user count
      const { count: userCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })

      // Get claims data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: claims } = await (supabase as any)
        .from('land_claims')
        .select('ai_verification_status, created_at')

      const claimsData: any[] = claims || []
      const verified = claimsData.filter((c: any) => c.ai_verification_status === 'AI_VERIFIED' || c.ai_verification_status === 'APPROVED').length
      const pending = claimsData.filter((c: any) => c.ai_verification_status === 'PENDING_VERIFICATION').length
      const disputed = claimsData.filter((c: any) => c.ai_verification_status === 'DISPUTED' || c.ai_verification_status === 'REJECTED').length

      // Get credit transactions
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: transactions } = await (supabase as any)
        .from('credit_transactions')
        .select('amount, type')

      const transactionsData: any[] = transactions || []
      const creditsUsed = transactionsData
        .filter((t: any) => t.type === 'VERIFICATION' || t.type === 'MINT')
        .reduce((sum: number, t: any) => sum + Math.abs(t.amount || 0), 0)

      // Calculate claims by month (last 6 months)
      const monthlyData: { [key: string]: number } = {}
      const now = new Date()
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        monthlyData[key] = 0
      }

      claimsData.forEach(claim => {
        const date = new Date(claim.created_at)
        const key = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        if (monthlyData[key] !== undefined) {
          monthlyData[key]++
        }
      })

      const claimsByMonth = Object.entries(monthlyData).map(([month, count]) => ({
        month,
        count,
      }))

      setData({
        totalUsers: userCount || 0,
        totalClaims: claimsData.length,
        verifiedClaims: verified,
        pendingClaims: pending,
        disputedClaims: disputed,
        totalCreditsUsed: creditsUsed,
        totalRevenue: creditsUsed * 2, // Rough estimate
        claimsByMonth,
        verificationRate: claimsData.length > 0 ? (verified / claimsData.length) * 100 : 0,
      })
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Platform Analytics</h1>
          <p className="text-gray-600">Overview of platform performance and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Claims</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Submitted claims</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verification Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{data.verificationRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Successfully verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Credits Used</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalCreditsUsed}</div>
              <p className="text-xs text-gray-500 mt-1">Total credits consumed</p>
            </CardContent>
          </Card>
        </div>

        {/* Claims Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Claims by Status
              </CardTitle>
              <CardDescription>Distribution of claim verification statuses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-emerald-500" />
                    <span className="text-sm text-gray-600">Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{data.verifiedClaims}</span>
                    <span className="text-xs text-gray-500">
                      ({data.totalClaims > 0 ? ((data.verifiedClaims / data.totalClaims) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full" 
                    style={{ width: `${data.totalClaims > 0 ? (data.verifiedClaims / data.totalClaims) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-yellow-500" />
                    <span className="text-sm text-gray-600">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{data.pendingClaims}</span>
                    <span className="text-xs text-gray-500">
                      ({data.totalClaims > 0 ? ((data.pendingClaims / data.totalClaims) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{ width: `${data.totalClaims > 0 ? (data.pendingClaims / data.totalClaims) * 100 : 0}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-red-500" />
                    <span className="text-sm text-gray-600">Disputed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{data.disputedClaims}</span>
                    <span className="text-xs text-gray-500">
                      ({data.totalClaims > 0 ? ((data.disputedClaims / data.totalClaims) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full" 
                    style={{ width: `${data.totalClaims > 0 ? (data.disputedClaims / data.totalClaims) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Claims Over Time
              </CardTitle>
              <CardDescription>Monthly claim submissions (last 6 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2">
                {data.claimsByMonth.map((item, index) => {
                  const maxCount = Math.max(...data.claimsByMonth.map(i => i.count), 1)
                  const height = (item.count / maxCount) * 100
                  
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-gray-100 rounded-t relative" style={{ height: '160px' }}>
                        <div 
                          className="absolute bottom-0 w-full bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t transition-all duration-500"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{item.month}</span>
                      <span className="text-xs font-semibold">{item.count}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Verified Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.verifiedClaims}</div>
              <p className="text-emerald-100 mt-2">Successfully verified and ready for minting</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Review
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.pendingClaims}</div>
              <p className="text-yellow-100 mt-2">Awaiting verification or human review</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Disputed Claims
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold">{data.disputedClaims}</div>
              <p className="text-red-100 mt-2">Flagged for issues or potential fraud</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
