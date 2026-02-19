'use client'

import { useRouter } from 'next/navigation'
import { DecisionConsole } from './DecisionConsole'

interface AdminDecisionWrapperProps {
  claimId: string
}

export function AdminDecisionWrapper({ claimId }: AdminDecisionWrapperProps) {
  const router = useRouter()

  const handleApprove = async (notes: string) => {
    const res = await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'approve', notes }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to approve claim')
    }

    router.refresh()
  }

  const handleReject = async (notes: string) => {
    const res = await fetch(`/api/admin/claims/${claimId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'reject', notes }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Failed to reject claim')
    }

    router.refresh()
  }

  return (
    <DecisionConsole
      claimId={claimId}
      onApprove={handleApprove}
      onReject={handleReject}
    />
  )
}
