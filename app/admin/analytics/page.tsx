'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  BarChart3,
  PieChart,
} from 'lucide-react'

interface AnalyticsData {
  totalUsers: number
  totalClaims: number
  verifiedClaims: number
  pendingClaims: number
  disputedClaims: number
  totalCreditsUsed: number
  claimsByMonth: { month: string; count: number }[]
  verificationRate: number
}

export default function AdminAnalyticsPage() {
  const { t } = useLanguage()
  const [data, setData] = useState<AnalyticsData>({
    totalUsers: 0,
    totalClaims: 0,
    verifiedClaims: 0,
    pendingClaims: 0,
    disputedClaims: 0,
    totalCreditsUsed: 0,
    claimsByMonth: [],
    verificationRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/analytics')
      if (!res.ok) {
        const err = await res.json()
        setError(err.error || 'Failed to load analytics')
        return
      }
      const json = await res.json()
      // API returns nested shape: { users, claims, credits }
      setData({
        totalUsers: json.users?.total ?? 0,
        totalClaims: json.claims?.total ?? 0,
        verifiedClaims: json.claims?.verified ?? 0,
        pendingClaims: json.claims?.pending ?? 0,
        disputedClaims: json.claims?.disputed ?? 0,
        totalCreditsUsed: json.credits?.used ?? 0,
        claimsByMonth: json.claims?.byMonth ?? [],
        verificationRate: json.claims?.verificationRate ?? 0,
      })
    } catch (err) {
      console.error('Error loading analytics:', err)
      setError('Network error — could not load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12 text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p className="font-medium">{error}</p>
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
          <h1 className="text-4xl font-bold text-navy-900 mb-2">{t('admin.analytics')}</h1>
          <p className="text-gray-600">Overview of platform performance and metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalUsers}</div>
              <p className="text-xs text-gray-500 mt-1">Registered accounts</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.totalClaims')}</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalClaims}</div>
              <p className="text-xs text-gray-500 mt-1">Submitted claims</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.verificationRate')}</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{data.verificationRate.toFixed(1)}%</div>
              <p className="text-xs text-gray-500 mt-1">Successfully verified</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.creditsUsed')}</CardTitle>
              <CreditCard className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{data.totalCreditsUsed}</div>
              <p className="text-xs text-gray-500 mt-1">Total credits consumed</p>
            </CardContent>
          </Card>
        </div>

        {/* Claims Status + Monthly Chart */}
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
                {[
                  { label: 'Verified', count: data.verifiedClaims, color: 'bg-emerald-500' },
                  { label: 'Pending',  count: data.pendingClaims,  color: 'bg-yellow-500' },
                  { label: 'Disputed', count: data.disputedClaims, color: 'bg-red-500' },
                ].map(({ label, count, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full ${color}`} />
                        <span className="text-sm text-gray-600">{label}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{count}</span>
                        <span className="text-xs text-gray-500">
                          ({data.totalClaims > 0 ? ((count / data.totalClaims) * 100).toFixed(0) : 0}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`${color} h-2 rounded-full`}
                        style={{ width: `${data.totalClaims > 0 ? (count / data.totalClaims) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                ))}
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
