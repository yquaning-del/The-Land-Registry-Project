import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { ClaimStatus } from '@/types/database.types'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''
const REVIEWER_ROLES = ['VERIFIER', 'ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER']

async function getReviewerRole(
  userEmail: string | undefined,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string | null> {
  if (PLATFORM_OWNER_EMAIL && userEmail === PLATFORM_OWNER_EMAIL) return 'PLATFORM_OWNER'
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  if (profile && REVIEWER_ROLES.includes(profile.role)) return profile.role
  return null
}

const VALID_STATUSES: ClaimStatus[] = [
  'PENDING_VERIFICATION',
  'AI_VERIFIED',
  'PENDING_HUMAN_REVIEW',
  'PENDING_CLARIFICATION',
  'APPROVED',
  'REJECTED',
  'DISPUTED',
]

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getReviewerRole(user.email, user.id, supabase)
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()

    // Optional ?status= filter. If absent, return all claims for reviewers.
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') as ClaimStatus | null

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('land_claims')
      .select(`
        id, claimant_id, parcel_id_barcode, document_metadata, address, region,
        ai_verification_status, ai_confidence_score, ai_confidence_level,
        ai_verification_metadata, created_at,
        clarification_message, clarification_response,
        clarification_requested_by, clarification_requested_at, clarification_responded_at,
        user_profiles:claimant_id (full_name)
      `)

    if (statusParam && VALID_STATUSES.includes(statusParam)) {
      query = query.eq('ai_verification_status', statusParam)
    }

    // PENDING_HUMAN_REVIEW first, then oldest first within each status
    const { data: claims, error: claimsError } = await query
      .order('created_at', { ascending: true })

    if (claimsError) throw claimsError

    return NextResponse.json({ claims: claims ?? [], role })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch review queue'
    console.error('Verification queue error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
