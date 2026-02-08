'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Loader2, FileText } from 'lucide-react'

interface DecisionConsoleProps {
  claimId: string
  onApprove?: (notes: string) => Promise<void>
  onReject?: (notes: string) => Promise<void>
}

export function DecisionConsole({ claimId, onApprove, onReject }: DecisionConsoleProps) {
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null)

  const handleApprove = async () => {
    if (!notes.trim()) {
      alert('Please add auditor notes before approving')
      return
    }

    setIsProcessing(true)
    setDecision('approve')
    try {
      if (onApprove) {
        await onApprove(notes)
      } else {
        console.log('Approve:', { claimId, notes })
        alert('Claim approved! (Demo mode)')
      }
    } catch (error) {
      console.error('Approval failed:', error)
      alert('Failed to approve claim. Please try again.')
    } finally {
      setIsProcessing(false)
      setDecision(null)
    }
  }

  const handleReject = async () => {
    if (!notes.trim()) {
      alert('Please add auditor notes explaining the rejection')
      return
    }

    setIsProcessing(true)
    setDecision('reject')
    try {
      if (onReject) {
        await onReject(notes)
      } else {
        console.log('Reject:', { claimId, notes })
        alert('Claim rejected and dispute logged! (Demo mode)')
      }
    } catch (error) {
      console.error('Rejection failed:', error)
      alert('Failed to reject claim. Please try again.')
    } finally {
      setIsProcessing(false)
      setDecision(null)
    }
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-2xl z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Notes Input */}
          <div className="flex-1 w-full">
            <Label htmlFor="auditor-notes" className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4" />
              Human Auditor Notes <span className="text-red-500">*</span>
            </Label>
            <textarea
              id="auditor-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Document your verification findings, concerns, or approval rationale..."
              className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
              disabled={isProcessing}
            />
            <div className="text-xs text-gray-500 mt-1">
              {notes.length} / 500 characters • Required for audit trail
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full lg:w-auto">
            <Button
              variant="destructive"
              size="lg"
              onClick={handleReject}
              disabled={isProcessing || !notes.trim()}
              className="flex-1 lg:flex-none lg:min-w-[200px] h-24 flex-col gap-2"
            >
              {isProcessing && decision === 'reject' ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <XCircle className="h-6 w-6" />
                  <span className="font-bold">Reject & Log Dispute</span>
                  <span className="text-xs font-normal">Flag for investigation</span>
                </>
              )}
            </Button>

            <Button
              variant="default"
              size="lg"
              onClick={handleApprove}
              disabled={isProcessing || !notes.trim()}
              className="flex-1 lg:flex-none lg:min-w-[200px] h-24 flex-col gap-2 bg-green-600 hover:bg-green-700"
            >
              {isProcessing && decision === 'approve' ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-6 w-6" />
                  <span className="font-bold">Approve & Mint to Blockchain</span>
                  <span className="text-xs font-normal">Create NFT record</span>
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Warning Message */}
        <div className="mt-3 text-xs text-gray-600 text-center lg:text-left">
          ⚠️ This decision will be permanently recorded on the blockchain and cannot be undone
        </div>
      </div>
    </div>
  )
}
