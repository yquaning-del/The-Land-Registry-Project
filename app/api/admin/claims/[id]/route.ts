import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { sendVerificationCompleteEmail } from '@/lib/email/sender'

// PATCH - Admin approve or reject a claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify admin role from user_profiles (NOT users table)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER', 'VERIFIER'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { action, notes } = await request.json()

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Action must be "approve" or "reject"' }, { status: 400 })
    }

    if (!notes || typeof notes !== 'string' || notes.trim().length < 5) {
      return NextResponse.json(
        { error: 'Auditor notes are required (minimum 5 characters)' },
        { status: 400 }
      )
    }

    const claimId = params.id

    // Fetch the claim to ensure it exists
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .select('id, ai_verification_status, mint_status, claimant_id, ai_confidence_score')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    // Don't allow re-decision on already minted claims
    if (claim.mint_status === 'MINTED') {
      return NextResponse.json(
        { error: 'Cannot change status of a minted claim' },
        { status: 409 }
      )
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    const now = new Date().toISOString()

    // Update the claim status
    const { error: updateError } = await supabase
      .from('land_claims')
      .update({
        ai_verification_status: newStatus,
        human_review_notes: notes.trim(),
        human_reviewed_at: now,
        human_reviewer_id: user.id,
      } as any)
      .eq('id', claimId)

    if (updateError) throw updateError

    // Log the decision in verification_logs
    await supabase
      .from('verification_logs')
      .insert({
        claim_id: claimId,
        action: action === 'approve' ? 'HUMAN_APPROVED' : 'HUMAN_REJECTED',
        performed_by: user.id,
        notes: notes.trim(),
        created_at: now,
      } as any)

    // Non-blocking email notification to claimant
    // Requires SUPABASE_SERVICE_ROLE_KEY env var to look up the claimant's auth email
    try {
      const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      if (serviceRoleKey && supabaseUrl && claim.claimant_id) {
        const adminClient = createSupabaseClient(supabaseUrl, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
        const { data: claimantUser } = await adminClient.auth.admin.getUserById(claim.claimant_id)
        const { data: claimantProfile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', claim.claimant_id)
          .single()

        if (claimantUser?.user?.email) {
          sendVerificationCompleteEmail(claimantUser.user.email, {
            userName: claimantProfile?.full_name || claimantUser.user.email,
            claimId,
            verificationStatus: newStatus,
            confidenceScore: claim.ai_confidence_score || 0,
          }).catch((err: unknown) => console.error('Admin decision email error:', err))
        }
      } else if (!serviceRoleKey) {
        console.warn('[admin/claims] SUPABASE_SERVICE_ROLE_KEY not set — skipping claimant email notification')
      }
    } catch (emailErr) {
      console.error('Failed to send admin decision email:', emailErr)
    }

    return NextResponse.json({
      success: true,
      claimId,
      newStatus,
    })
  } catch (error: unknown) {
    console.error('Admin claim decision error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Decision failed' },
      { status: 500 }
    )
  }
}
