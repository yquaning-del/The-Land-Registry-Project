'use client'

import { useEffect, useState } from 'react'
import { 
  FileCheck, 
  Satellite, 
  Link2, 
  Building2, 
  CheckCircle2, 
  Clock, 
  AlertTriangle,
  Loader2,
  ChevronRight
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { VerificationProgress as VerificationProgressType } from '@/types/spatial.types'
import { spatialService } from '@/services/spatialService'

interface VerificationProgressProps {
  claimId: string
  compact?: boolean
  showDetails?: boolean
  onStepClick?: (step: number) => void
}

interface Step {
  id: number
  name: string
  shortName: string
  description: string
  icon: React.ElementType
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  completedAt: string | null
}

export function VerificationProgress({ 
  claimId, 
  compact = false,
  showDetails = true,
  onStepClick 
}: VerificationProgressProps) {
  const [progress, setProgress] = useState<VerificationProgressType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [claimId])

  const loadProgress = async () => {
    setLoading(true)
    try {
      const data = await spatialService.getVerificationProgress(claimId)
      setProgress(data)
    } catch (error) {
      console.error('Error loading verification progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSteps = (): Step[] => {
    if (!progress) {
      return [
        { id: 1, name: 'Indenture Verified', shortName: 'Indenture', description: 'Document authenticity confirmed', icon: FileCheck, status: 'pending', completedAt: null },
        { id: 2, name: 'Satellite Confirmed', shortName: 'Satellite', description: 'GPS coordinates validated', icon: Satellite, status: 'pending', completedAt: null },
        { id: 3, name: 'Blockchain Anchored', shortName: 'Blockchain', description: 'Immutable record created', icon: Link2, status: 'pending', completedAt: null },
        { id: 4, name: 'Government Title Pending', shortName: 'Title', description: 'Ready for official registration', icon: Building2, status: 'pending', completedAt: null },
      ]
    }

    return [
      {
        id: 1,
        name: 'Indenture Verified',
        shortName: 'Indenture',
        description: 'Document authenticity confirmed by AI',
        icon: FileCheck,
        status: progress.indentureVerified 
          ? 'completed' 
          : progress.currentStep === 1 
            ? 'in_progress' 
            : 'pending',
        completedAt: progress.indentureVerifiedAt,
      },
      {
        id: 2,
        name: 'Satellite Confirmed',
        shortName: 'Satellite',
        description: 'GPS coordinates validated against satellite imagery',
        icon: Satellite,
        status: progress.satelliteConfirmed 
          ? 'completed' 
          : progress.currentStep === 2 
            ? 'in_progress' 
            : 'pending',
        completedAt: progress.satelliteConfirmedAt,
      },
      {
        id: 3,
        name: 'Blockchain Anchored',
        shortName: 'Blockchain',
        description: 'Immutable record created on Polygon',
        icon: Link2,
        status: progress.blockchainAnchored 
          ? 'completed' 
          : progress.currentStep === 3 
            ? 'in_progress' 
            : 'pending',
        completedAt: progress.blockchainAnchoredAt,
      },
      {
        id: 4,
        name: 'Government Title Pending',
        shortName: 'Title',
        description: 'Ready for official Land Commission registration',
        icon: Building2,
        status: progress.governmentTitleStatus === 'COMPLETED'
          ? 'completed'
          : progress.governmentTitlePending
            ? 'in_progress'
            : 'pending',
        completedAt: null,
      },
    ]
  }

  const getStatusIcon = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />
      case 'in_progress':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: Step['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-500'
      case 'in_progress':
        return 'bg-blue-500'
      case 'failed':
        return 'bg-red-500'
      default:
        return 'bg-gray-300'
    }
  }

  const steps = getSteps()
  const completedSteps = steps.filter(s => s.status === 'completed').length
  const progressPercent = (completedSteps / steps.length) * 100

  if (loading) {
    return (
      <div className={cn(
        "bg-white rounded-xl border border-gray-200 p-4",
        compact ? "p-3" : "p-6"
      )}>
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
          <span className="ml-2 text-gray-600">Loading progress...</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-600">Verification Progress</span>
          <span className="text-xs font-bold text-emerald-600">{completedSteps}/{steps.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div 
              key={step.id}
              className={cn(
                "flex flex-col items-center",
                onStepClick && "cursor-pointer hover:opacity-80"
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className={cn(
                "w-6 h-6 rounded-full flex items-center justify-center",
                step.status === 'completed' && "bg-emerald-100",
                step.status === 'in_progress' && "bg-blue-100",
                step.status === 'pending' && "bg-gray-100"
              )}>
                <step.icon className={cn(
                  "h-3 w-3",
                  step.status === 'completed' && "text-emerald-600",
                  step.status === 'in_progress' && "text-blue-600",
                  step.status === 'pending' && "text-gray-400"
                )} />
              </div>
              <span className="text-[10px] text-gray-500 mt-1">{step.shortName}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-navy-900">Verification Progress</h3>
            <p className="text-sm text-gray-600">From Indenture to Government Title</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{Math.round(progressPercent)}%</div>
            <div className="text-xs text-gray-500">{completedSteps} of {steps.length} steps</div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 h-3 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="p-6">
        <div className="relative">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={cn(
                "flex items-start gap-4 pb-6 last:pb-0",
                onStepClick && "cursor-pointer hover:bg-gray-50 -mx-2 px-2 py-2 rounded-lg transition-colors"
              )}
              onClick={() => onStepClick?.(step.id)}
            >
              <div className="relative flex flex-col items-center">
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all",
                  step.status === 'completed' && "bg-emerald-50 border-emerald-500",
                  step.status === 'in_progress' && "bg-blue-50 border-blue-500",
                  step.status === 'failed' && "bg-red-50 border-red-500",
                  step.status === 'pending' && "bg-gray-50 border-gray-300"
                )}>
                  <step.icon className={cn(
                    "h-5 w-5",
                    step.status === 'completed' && "text-emerald-600",
                    step.status === 'in_progress' && "text-blue-600",
                    step.status === 'failed' && "text-red-600",
                    step.status === 'pending' && "text-gray-400"
                  )} />
                </div>
                {index < steps.length - 1 && (
                  <div className={cn(
                    "w-0.5 h-full absolute top-10 left-1/2 -translate-x-1/2",
                    step.status === 'completed' ? "bg-emerald-500" : "bg-gray-200"
                  )} style={{ height: '24px' }} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "font-medium",
                      step.status === 'completed' && "text-emerald-700",
                      step.status === 'in_progress' && "text-blue-700",
                      step.status === 'pending' && "text-gray-600"
                    )}>
                      {step.name}
                    </h4>
                    {getStatusIcon(step.status)}
                  </div>
                  {onStepClick && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                </div>
                {showDetails && (
                  <p className="text-sm text-gray-500 mt-0.5">{step.description}</p>
                )}
                {step.completedAt && (
                  <p className="text-xs text-gray-400 mt-1">
                    Completed {new Date(step.completedAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {progress?.overallStatus === 'DISPUTED' && (
        <div className="px-6 py-4 bg-red-50 border-t border-red-100">
          <div className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Verification Blocked</span>
          </div>
          <p className="text-sm text-red-600 mt-1">
            This claim has been flagged for review due to a potential dispute.
          </p>
        </div>
      )}

      {progress?.overallStatus === 'COMPLETED' && (
        <div className="px-6 py-4 bg-emerald-50 border-t border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">Verification Complete</span>
          </div>
          <p className="text-sm text-emerald-600 mt-1">
            Your land title has been verified and anchored on the blockchain.
          </p>
        </div>
      )}
    </div>
  )
}

export function VerificationProgressMini({ claimId }: { claimId: string }) {
  return <VerificationProgress claimId={claimId} compact showDetails={false} />
}
