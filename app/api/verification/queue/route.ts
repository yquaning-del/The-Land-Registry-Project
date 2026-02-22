import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const role = await getReviewerRole(user.email, user.id, supabase)
    if (!role) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const admin = createAdminClient()

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: claims, error: claimsError } = await (admin as any)
      .from('land_claims')
      .select(`
        id, claimant_id, parcel_id_barcode, document_metadata, address, region,
        ai_verification_status, ai_confidence_score, ai_confidence_level,
        ai_verification_metadata, created_at,
        user_profiles:claimant_id (full_name)
      `)
      .eq('ai_verification_status', 'PENDING_HUMAN_REVIEW')
      .order('created_at', { ascending: true })

    if (claimsError) throw claimsError

    return NextResponse.json({ claims: claims ?? [], role })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch review queue'
    console.error('Verification queue error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
