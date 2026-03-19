import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendClarificationResponseEmail } from '@/lib/email/sender'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: claimId } = await params

    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { response } = body as { response: string }

    if (!response || response.trim().length < 5) {
      return NextResponse.json(
        { error: 'Response must be at least 5 characters' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Fetch claim — verify ownership and status
    const { data: claim, error: fetchError } = await admin
      .from('land_claims')
      .select('id, claimant_id, ai_verification_status, clarification_requested_by')
      .eq('id', claimId)
      .single()

    if (fetchError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if (claim.claimant_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (claim.ai_verification_status !== 'PENDING_CLARIFICATION') {
      return NextResponse.json(
        { error: 'Claim is not awaiting clarification' },
        { status: 409 }
      )
    }

    // Save response and move claim back to PENDING_HUMAN_REVIEW
    const { data: updated, error: updateError } = await admin
      .from('land_claims')
      .update({
        clarification_response: response.trim(),
        clarification_responded_at: new Date().toISOString(),
        ai_verification_status: 'PENDING_HUMAN_REVIEW',
      })
      .eq('id', claimId)
      .select('id, ai_verification_status')
      .single()

    if (updateError) throw updateError

    // Fire-and-forget: email the verifier who requested clarification
    ;(async () => {
      try {
        if (!claim.clarification_requested_by) return
        const { data: authUser } = await admin.auth.admin.getUserById(claim.clarification_requested_by)
        const verifierEmail = authUser?.user?.email
        if (verifierEmail) {
          await sendClarificationResponseEmail({
            verifierEmail,
            claimId,
            claimantName: user.email ?? 'Claimant',
          })
        }
      } catch (e) {
        console.error('Failed to send clarification response email:', e)
      }
    })()

    return NextResponse.json({ claim: updated })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to submit clarification'
    console.error('Clarify endpoint error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
