import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''
const REVIEWER_ROLES = ['VERIFIER', 'ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER']

async function isAuthorisedReviewer(
  userEmail: string | undefined,
  userId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<boolean> {
  if (PLATFORM_OWNER_EMAIL && userEmail === PLATFORM_OWNER_EMAIL) return true
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()
  return !!(profile && REVIEWER_ROLES.includes(profile.role))
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    if (!await isAuthorisedReviewer(user.email, user.id, supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { claimId, action, notes } = body as {
      claimId: string
      action: 'APPROVE' | 'REJECT'
      notes?: string
    }

    if (!claimId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request: claimId and action (APPROVE|REJECT) required' }, { status: 400 })
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED'

    const admin = createAdminClient()
    const { data: updated, error: updateError } = await admin
      .from('land_claims')
      .update({
        ai_verification_status: newStatus,
        human_approver_id: user.id,
        human_review_notes: notes ?? null,
        human_reviewed_at: new Date().toISOString(),
      })
      .eq('id', claimId)
      .eq('ai_verification_status', 'PENDING_HUMAN_REVIEW')
      .select('id, ai_verification_status')
      .single()

    if (updateError) throw updateError
    if (!updated) {
      return NextResponse.json({ error: 'Claim not found or not in PENDING_HUMAN_REVIEW status' }, { status: 404 })
    }

    return NextResponse.json({ claim: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Review action failed'
    console.error('Verification review error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
