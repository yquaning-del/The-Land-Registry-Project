'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, AlertTriangle, XCircle, MapPin } from 'lucide-react'

export type EvidenceStatus = 'success' | 'warning' | 'critical'

export interface EvidenceItem {
  id: string
  title: string
  status: EvidenceStatus
  reasoning: string
  confidence?: number
  highlightArea?: {
    x: number
    y: number
    width: number
    height: number
  }
}

interface EvidenceCardProps {
  evidence: EvidenceItem
  onHighlight?: (area: EvidenceItem['highlightArea']) => void
}

export function EvidenceCard({ evidence, onHighlight }: EvidenceCardProps) {
  const getStatusIcon = () => {
    switch (evidence.status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />
      case 'critical':
        return <XCircle className="h-5 w-5 text-red-600" />
    }
  }

  const getStatusBadge = () => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-semibold'
    switch (evidence.status) {
      case 'success':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'warning':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      case 'critical':
        return `${baseClasses} bg-red-100 text-red-800`
    }
  }

  const getStatusLabel = () => {
    switch (evidence.status) {
      case 'success':
        return 'Verified'
      case 'warning':
        return 'Needs Review'
      case 'critical':
        return 'Failed'
    }
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <CardTitle className="text-base">{evidence.title}</CardTitle>
          </div>
          <span className={getStatusBadge()}>{getStatusLabel()}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 leading-relaxed">{evidence.reasoning}</p>
        
        {evidence.confidence !== undefined && (
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  evidence.confidence >= 0.85
                    ? 'bg-green-500'
                    : evidence.confidence >= 0.6
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
                style={{ width: `${evidence.confidence * 100}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-gray-600">
              {(evidence.confidence * 100).toFixed(0)}%
            </span>
          </div>
        )}

        {evidence.highlightArea && onHighlight && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onHighlight(evidence.highlightArea)}
          >
            <MapPin className="h-4 w-4 mr-2" />
            Highlight on Document
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
