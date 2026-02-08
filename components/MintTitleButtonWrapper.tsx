'use client'

import { useEffect, useState } from 'react'
import { MintTitleButton } from '@/components/MintTitleButton'
import { createClient } from '@/lib/supabase/client'

interface MintTitleButtonWrapperProps {
  claim: any
}

export function MintTitleButtonWrapper({ claim }: MintTitleButtonWrapperProps) {
  const [auditorInfo, setAuditorInfo] = useState<{
    auditorId: string
    auditorName: string
    auditorEmail: string
  } | null>(null)

  useEffect(() => {
    async function loadAuditor() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        setAuditorInfo({
          auditorId: user.id,
          auditorName: user.user_metadata?.full_name || user.email || 'Unknown Auditor',
          auditorEmail: user.email || '',
        })
      }
    }

    loadAuditor()
  }, [])

  if (!auditorInfo) {
    return <div className="text-sm text-gray-600">Loading auditor information...</div>
  }

  return (
    <MintTitleButton
      claimId={claim.id}
      claimData={{
        id: claim.id,
        claimantName: claim.user_profiles?.full_name || 'Unknown',
        location: claim.location || claim.region,
        region: claim.region,
        country: claim.country,
        latitude: claim.latitude || 0,
        longitude: claim.longitude || 0,
        landSize: claim.land_size_sqm || 0,
        parcelId: claim.parcel_id_barcode || 'N/A',
        aiConfidenceScore: claim.ai_confidence_score || 0,
        fraudConfidenceScore: 1 - (claim.ai_confidence_score || 0),
        humanAuditorNotes: claim.human_review_notes || 'Approved by auditor',
        documentType: claim.title_type || claim.document_type || 'Land Title',
        durationYears: claim.duration_years || 99,
        originalDocumentUrl: claim.original_document_url,
        auditorId: auditorInfo.auditorId,
        auditorName: auditorInfo.auditorName,
        auditorEmail: auditorInfo.auditorEmail,
        verificationTimestamp: claim.ai_verified_at || claim.created_at,
      }}
      onSuccess={(txHash, tokenId) => {
        console.log('Minted successfully:', txHash, tokenId)
        window.location.reload()
      }}
      onError={(error) => {
        console.error('Minting failed:', error)
      }}
    />
  )
}
