'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  mintStatus?: string
  pulse?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function StatusBadge({ status, mintStatus, pulse = true, size = 'md', className }: StatusBadgeProps) {
  const isMinted = mintStatus === 'MINTED' || status === 'MINTED'
  const shouldPulse = pulse && isMinted

  const getStatusConfig = () => {
    if (isMinted) {
      return {
        variant: 'default' as const,
        label: 'On-Chain Verified',
        className: 'bg-emerald-500 text-white border-emerald-600',
        pulseClass: shouldPulse ? 'pulse-glow' : '',
      }
    }

    const statusConfig: Record<string, { variant: any; label: string; className: string }> = {
      APPROVED: {
        variant: 'default',
        label: 'Approved',
        className: 'bg-emerald-500 text-white',
      },
      PENDING_VERIFICATION: {
        variant: 'secondary',
        label: 'Pending',
        className: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      PENDING_HUMAN_REVIEW: {
        variant: 'secondary',
        label: 'In Review',
        className: 'bg-amber-100 text-amber-800 border-amber-300',
      },
      AI_VERIFIED: {
        variant: 'default',
        label: 'AI Verified',
        className: 'bg-blue-500 text-white',
      },
      REJECTED: {
        variant: 'destructive',
        label: 'Rejected',
        className: 'bg-red-500 text-white',
      },
      DISPUTED: {
        variant: 'destructive',
        label: 'Disputed',
        className: 'bg-orange-500 text-white',
      },
    }

    return {
      ...statusConfig[status] || { variant: 'secondary', label: status, className: 'bg-gray-100 text-gray-800' },
      pulseClass: '',
    }
  }

  const config = getStatusConfig()
  
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1',
  }

  return (
    <Badge
      variant={config.variant}
      className={cn(
        config.className,
        config.pulseClass,
        sizeClasses[size],
        'font-semibold transition-all duration-300',
        className
      )}
    >
      {config.label}
    </Badge>
  )
}
