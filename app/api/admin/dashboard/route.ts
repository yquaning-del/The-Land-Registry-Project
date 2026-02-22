import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''

async function isAuthorisedAdmin(userEmail: string | undefined, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  if (PLATFORM_OWNER_EMAIL && userEmail === PLATFORM_OWNER_EMAIL) return true
  const { data: profile } = await supabase.from('user_profiles').select('role').eq('id', userId).single()
  return !!(profile && ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(profile.role))
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (!await isAuthorisedAdmin(user.email, user.id, supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const admin = createAdminClient()

    // ── User counts ──────────────────────────────────────────────────────────
    const [{ count: totalUsers }, { count: newUsersToday }] = await Promise.all([
      admin.from('user_profiles').select('*', { count: 'exact', head: true }),
      admin.from('user_profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()),
    ])

    // ── Claims ───────────────────────────────────────────────────────────────
    const { data: claimsRaw } = await admin
      .from('land_claims')
      .select('id, address, ai_verification_status, mint_status, ai_confidence_score, ai_verified_at, created_at')
      .order('created_at', { ascending: false })

    const claims = (claimsRaw ?? []) as Array<{
      id: string
      address: string | null
      ai_verification_status: string
      mint_status: string | null
      ai_confidence_score: number | null
      ai_verified_at: string | null
      created_at: string
    }>

    const totalClaims = claims.length
    const pendingClaims = claims.filter(c =>
      c.ai_verification_status === 'PENDING_VERIFICATION' ||
      c.ai_verification_status === 'PENDING_HUMAN_REVIEW'
    ).length
    const verifiedClaims = claims.filter(c =>
      c.ai_verification_status === 'AI_VERIFIED' ||
      c.ai_verification_status === 'APPROVED'
    ).length
    const disputedClaims = claims.filter(c =>
      c.ai_verification_status === 'DISPUTED' ||
      c.ai_verification_status === 'REJECTED'
    ).length
    const mintedClaims = claims.filter(c => c.mint_status === 'MINTED').length
    const verificationRate = totalClaims > 0 ? (verifiedClaims / totalClaims) * 100 : 0

    // ── Credits used ─────────────────────────────────────────────────────────
    const { data: txRaw } = await admin
      .from('credit_transactions')
      .select('amount, type')
    const transactions = (txRaw ?? []) as Array<{ amount: number; type: string }>
    const totalCreditsUsed = transactions
      .filter(t => t.type === 'VERIFICATION' || t.type === 'MINT')
      .reduce((sum, t) => sum + Math.abs(t.amount ?? 0), 0)

    // ── Pending reviews (for review queue card) ──────────────────────────────
    const pendingReviews = claims
      .filter(c => c.ai_verification_status === 'PENDING_HUMAN_REVIEW')
      .slice(0, 5)
      .map(c => ({
        id: c.id,
        address: c.address || 'Unknown location',
        confidence: c.ai_confidence_score ?? 0,
        submittedAt: c.created_at,
      }))

    // ── Real recent activity ─────────────────────────────────────────────────
    const { data: recentUsersRaw } = await admin
      .from('user_profiles')
      .select('id, full_name, created_at')
      .order('created_at', { ascending: false })
      .limit(3)

    const recentUsers = (recentUsersRaw ?? []) as Array<{ id: string; full_name: string; created_at: string }>
    const recentClaims5 = claims.slice(0, 5)
    const recentVerifications = claims
      .filter(c => c.ai_verified_at)
      .sort((a, b) => new Date(b.ai_verified_at!).getTime() - new Date(a.ai_verified_at!).getTime())
      .slice(0, 3)

    const activityItems: Array<{ id: string; type: string; description: string; timestamp: string }> = []

    for (const c of recentClaims5) {
      activityItems.push({
        id: `submit-${c.id}`,
        type: 'claim_submitted',
        description: `New claim submitted${c.address ? ` from ${c.address}` : ''}`,
        timestamp: c.created_at,
      })
    }
    for (const c of recentVerifications) {
      activityItems.push({
        id: `verify-${c.id}`,
        type: 'claim_verified',
        description: `Claim verified${c.address ? ` at ${c.address}` : ''}`,
        timestamp: c.ai_verified_at!,
      })
    }
    for (const u of recentUsers) {
      activityItems.push({
        id: `reg-${u.id}`,
        type: 'user_registered',
        description: `New user registered: ${u.full_name || 'Unknown'}`,
        timestamp: u.created_at,
      })
    }

    const recentActivity = activityItems
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8)

    // ── System status (env-var presence, no external calls) ──────────────────
    const systemStatus = {
      database: true, // implicit: route responded
      ai: !!(process.env.OPENAI_API_KEY),
      blockchain: !!(
        process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS &&
        process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID
      ),
      ipfs: !!(process.env.PINATA_JWT || process.env.PINATA_API_KEY),
    }

    return NextResponse.json({
      stats: {
        totalUsers: totalUsers ?? 0,
        newUsersToday: newUsersToday ?? 0,
        totalClaims,
        pendingClaims,
        verifiedClaims,
        disputedClaims,
        mintedClaims,
        totalCreditsUsed,
        totalRevenue: 0,
        verificationRate,
      },
      pendingReviews,
      recentActivity,
      systemStatus,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load dashboard'
    console.error('Admin dashboard error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
