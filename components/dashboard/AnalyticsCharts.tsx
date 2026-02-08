'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, BarChart3, PieChart, Activity } from 'lucide-react'

interface ChartData {
  label: string
  value: number
  color: string
}

interface TrendData {
  month: string
  claims: number
  verified: number
}

export function AnalyticsCharts() {
  const [verificationTrend, setVerificationTrend] = useState<TrendData[]>([])
  const [statusDistribution, setStatusDistribution] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulate loading analytics data
    setTimeout(() => {
      setVerificationTrend([
        { month: 'Aug', claims: 12, verified: 10 },
        { month: 'Sep', claims: 18, verified: 15 },
        { month: 'Oct', claims: 25, verified: 22 },
        { month: 'Nov', claims: 32, verified: 28 },
        { month: 'Dec', claims: 28, verified: 25 },
        { month: 'Jan', claims: 45, verified: 40 },
      ])

      setStatusDistribution([
        { label: 'Verified', value: 65, color: 'bg-emerald-500' },
        { label: 'Pending', value: 20, color: 'bg-yellow-500' },
        { label: 'Disputed', value: 10, color: 'bg-red-500' },
        { label: 'Minted', value: 5, color: 'bg-purple-500' },
      ])

      setLoading(false)
    }, 1000)
  }, [])

  const maxClaims = Math.max(...verificationTrend.map(d => d.claims), 1)

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 animate-pulse rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="h-6 w-48 bg-gray-200 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="h-48 bg-gray-100 animate-pulse rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Verification Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-emerald-600" />
            Verification Trend
          </CardTitle>
          <CardDescription>Claims submitted vs verified over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bar Chart */}
            <div className="flex items-end justify-between h-48 gap-2">
              {verificationTrend.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex gap-1 items-end h-40">
                    {/* Claims bar */}
                    <div
                      className="flex-1 bg-blue-200 rounded-t transition-all duration-500"
                      style={{ height: `${(data.claims / maxClaims) * 100}%` }}
                      title={`${data.claims} claims`}
                    />
                    {/* Verified bar */}
                    <div
                      className="flex-1 bg-emerald-500 rounded-t transition-all duration-500"
                      style={{ height: `${(data.verified / maxClaims) * 100}%` }}
                      title={`${data.verified} verified`}
                    />
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 pt-2 border-t">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-200 rounded" />
                <span className="text-sm text-gray-600">Submitted</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded" />
                <span className="text-sm text-gray-600">Verified</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="bg-emerald-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-emerald-600">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-lg font-bold">+28%</span>
                </div>
                <p className="text-xs text-gray-600">vs last month</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="flex items-center justify-center gap-1 text-blue-600">
                  <Activity className="h-4 w-4" />
                  <span className="text-lg font-bold">89%</span>
                </div>
                <p className="text-xs text-gray-600">Success rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Distribution Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-purple-600" />
            Claim Status Distribution
          </CardTitle>
          <CardDescription>Breakdown of all claim statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Donut Chart Visualization */}
            <div className="relative w-48 h-48 mx-auto">
              <svg viewBox="0 0 100 100" className="transform -rotate-90">
                {statusDistribution.reduce((acc, item, index) => {
                  const total = statusDistribution.reduce((sum, i) => sum + i.value, 0)
                  const percentage = (item.value / total) * 100
                  const offset = acc.offset
                  const circumference = 2 * Math.PI * 35
                  const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`
                  const strokeDashoffset = -((offset / 100) * circumference)

                  const colors: Record<string, string> = {
                    'bg-emerald-500': '#10b981',
                    'bg-yellow-500': '#eab308',
                    'bg-red-500': '#ef4444',
                    'bg-purple-500': '#a855f7',
                  }

                  acc.elements.push(
                    <circle
                      key={index}
                      cx="50"
                      cy="50"
                      r="35"
                      fill="none"
                      stroke={colors[item.color]}
                      strokeWidth="12"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  )
                  acc.offset += percentage
                  return acc
                }, { elements: [] as JSX.Element[], offset: 0 }).elements}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl font-bold text-navy-900">100</p>
                  <p className="text-xs text-gray-500">Total Claims</p>
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-3">
              {statusDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-500">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Insight */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-emerald-900">Great Progress!</p>
                  <p className="text-xs text-emerald-700">
                    65% of your claims have been verified. Keep submitting quality documents for faster verification.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
