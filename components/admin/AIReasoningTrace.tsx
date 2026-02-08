'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Clock, Cpu, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export interface ReasoningStep {
  id: string
  agentName: string
  timestamp: string
  input: Record<string, unknown>
  output: Record<string, unknown>
  confidenceScore: number
  executionTimeMs: number
  status: 'success' | 'warning' | 'error'
  reasoning: string
}

interface AIReasoningTraceProps {
  steps: ReasoningStep[]
  finalScore: number
}

export function AIReasoningTrace({ steps, finalScore }: AIReasoningTraceProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set())

  const toggleStep = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev)
      if (newSet.has(stepId)) {
        newSet.delete(stepId)
      } else {
        newSet.add(stepId)
      }
      return newSet
    })
  }

  const getStatusIcon = (status: ReasoningStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
    }
  }

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">AI Reasoning Trace</CardTitle>
            <span className="text-sm text-gray-500">({steps.length} steps)</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-sm text-gray-600">Final Confidence</div>
              <div className="text-lg font-bold text-blue-600">
                {(finalScore * 100).toFixed(1)}%
              </div>
            </div>
            <Button variant="ghost" size="sm">
              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-3">
          <div className="text-sm text-gray-600 mb-4">
            Chain of thought showing how the AI verification agent reached its conclusion
          </div>

          {/* Timeline */}
          <div className="relative space-y-4">
            {steps.map((step, index) => (
              <div key={step.id} className="relative">
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-gray-300" />
                )}

                {/* Step Card */}
                <div className="flex gap-3">
                  {/* Timeline Dot */}
                  <div className="flex-shrink-0 mt-1">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      {getStatusIcon(step.status)}
                    </div>
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader
                        className="pb-3 cursor-pointer"
                        onClick={() => toggleStep(step.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-sm">{step.agentName}</h4>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                step.status === 'success'
                                  ? 'bg-green-100 text-green-800'
                                  : step.status === 'warning'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {(step.confidenceScore * 100).toFixed(0)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-600">{step.reasoning}</p>
                          </div>
                          <Button variant="ghost" size="sm">
                            {expandedSteps.has(step.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardHeader>

                      {expandedSteps.has(step.id) && (
                        <CardContent className="pt-0 space-y-3">
                          {/* Metadata */}
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>{step.executionTimeMs}ms</span>
                            </div>
                            <div>
                              {new Date(step.timestamp).toLocaleTimeString()}
                            </div>
                          </div>

                          {/* Input/Output */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Input</div>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(step.input, null, 2)}
                              </pre>
                            </div>
                            <div>
                              <div className="text-xs font-semibold text-gray-700 mb-1">Output</div>
                              <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                                {JSON.stringify(step.output, null, 2)}
                              </pre>
                            </div>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-blue-900">Verification Complete</div>
                <div className="text-xs text-blue-700">
                  Total execution time: {steps.reduce((sum, s) => sum + s.executionTimeMs, 0)}ms
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">
                  {(finalScore * 100).toFixed(1)}%
                </div>
                <div className="text-xs text-blue-700">
                  {finalScore >= 0.85 ? 'High Confidence' : finalScore >= 0.6 ? 'Medium Confidence' : 'Low Confidence'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
