'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

interface CreditProgressProps {
  current: number
  total: number
  size?: number
  strokeWidth?: number
  showPercentage?: boolean
  className?: string
}

export function CreditProgress({
  current,
  total,
  size = 120,
  strokeWidth = 8,
  showPercentage = false,
  className,
}: CreditProgressProps) {
  const [progress, setProgress] = useState(0)
  const percentage = total > 0 ? (current / total) * 100 : 0
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  const getColor = () => {
    if (percentage >= 70) return '#10B981' // Green
    if (percentage >= 30) return '#F59E0B' // Amber
    return '#EF4444' // Red
  }

  const getBackgroundColor = () => {
    if (percentage >= 70) return 'rgba(16, 185, 129, 0.1)'
    if (percentage >= 30) return 'rgba(245, 158, 11, 0.1)'
    return 'rgba(239, 68, 68, 0.1)'
  }

  return (
    <Link href="/settings/billing" className={cn('block', className)}>
      <div className="relative inline-flex items-center justify-center group cursor-pointer">
        <svg
          width={size}
          height={size}
          className="transform -rotate-90 transition-transform group-hover:scale-105"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getBackgroundColor()}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: getColor() }}>
              {current}
            </p>
            <p className="text-xs text-gray-600 font-medium">
              credits left
            </p>
            {showPercentage && (
              <p className="text-xs text-gray-500 mt-1">
                {percentage.toFixed(0)}%
              </p>
            )}
          </div>
        </div>

        {/* Hover tooltip */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-navy-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
          {current} of {total} credits
        </div>
      </div>
    </Link>
  )
}
