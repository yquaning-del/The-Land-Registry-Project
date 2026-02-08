'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'
import { useEffect, useState } from 'react'

interface KPICardProps {
  title: string
  value: number | string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  suffix?: string
  loading?: boolean
}

export function KPICard({ title, value, icon: Icon, trend, suffix = '', loading }: KPICardProps) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (typeof value === 'number' && !loading) {
      let start = 0
      const end = value
      const duration = 1000
      const increment = end / (duration / 16)

      const timer = setInterval(() => {
        start += increment
        if (start >= end) {
          setDisplayValue(end)
          clearInterval(timer)
        } else {
          setDisplayValue(Math.floor(start))
        }
      }, 16)

      return () => clearInterval(timer)
    }
  }, [value, loading])

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-emerald-600" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 animate-pulse rounded" />
        ) : (
          <>
            <div className="text-3xl font-bold text-navy-900">
              {typeof value === 'number' ? displayValue : value}
              {suffix}
            </div>
            {trend && (
              <p className={`text-xs mt-1 ${trend.isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
