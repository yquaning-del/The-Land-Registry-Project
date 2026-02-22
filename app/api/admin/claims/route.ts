import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''
const PAGE_SIZE = 50

async function isAuthorisedAdmin(userEmail: string | undefined, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (PLATFORM_OWNER_EMAIL && userEmail === PLATFORM_OWNER_EMAIL) return true
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', userId).single()
  return !!(profile && ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(profile.role))
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAuthorisedAdmin(user.email, user.id, supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '0')
    const filter = searchParams.get('filter') || 'all'

    const admin = createAdminClient()

    // Stats: run a single full-scan returning only status, then count in JS
    const { data: allStatuses } = await admin
      .from('land_claims')
      .select('ai_verification_status')

    const all = (allStatuses ?? []) as Array<{ ai_verification_status: string }>
    const stats = {
      total: all.length,
      pending: all.filter(c =>
        c.ai_verification_status === 'PENDING_VERIFICATION' ||
        c.ai_verification_status === 'PENDING_HUMAN_REVIEW'
      ).length,
      verified: all.filter(c =>
        c.ai_verification_status === 'AI_VERIFIED' ||
        c.ai_verification_status === 'APPROVED'
      ).length,
      disputed: all.filter(c =>
        c.ai_verification_status === 'DISPUTED' ||
        c.ai_verification_status === 'REJECTED'
      ).length,
    }

    // Paginated, filtered claims with owner name via join
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let query = (admin as any)
      .from('land_claims')
      .select(`
        id, claimant_id, parcel_id_barcode, document_metadata, address,
        ai_verification_status, document_type, created_at,
        user_profiles:claimant_id (full_name)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1)

    if (filter !== 'all') {
      query = query.eq('ai_verification_status', filter)
    }

    const { data: claims, count, error: claimsError } = await query
    if (claimsError) throw claimsError

    return NextResponse.json({ claims: claims ?? [], stats, count: count ?? 0 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch claims'
    console.error('Admin claims error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
