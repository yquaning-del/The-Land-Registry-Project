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

    // Use admin client so RLS is bypassed for all queries
    const admin = createAdminClient()

    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1).toISOString()

    const [
      { count: totalUsers },
      { count: totalClaims },
      { count: verifiedClaims },
      { count: pendingClaims },
      { count: disputedClaims },
      { count: mintedClaims },
      { data: claimDates },
      { data: creditUsedData },
      { data: creditPurchasedData },
      { count: starterSubs },
      { count: professionalSubs },
      { count: enterpriseSubs },
    ] = await Promise.all([
      admin.from('user_profiles').select('*', { count: 'exact', head: true }),
      admin.from('land_claims').select('*', { count: 'exact', head: true }),
      admin.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['AI_VERIFIED', 'APPROVED']),
      admin.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['PENDING_VERIFICATION', 'PENDING_HUMAN_REVIEW']),
      admin.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['DISPUTED', 'REJECTED']),
      admin.from('land_claims').select('*', { count: 'exact', head: true })
        .eq('mint_status', 'MINTED'),
      admin.from('land_claims').select('created_at').gte('created_at', sixMonthsAgo),
      admin.from('credit_transactions').select('amount').in('type', ['VERIFICATION', 'MINT']),
      admin.from('credit_transactions').select('amount').in('type', ['PURCHASE', 'SUBSCRIPTION_GRANT']),
      admin.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'STARTER'),
      admin.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'PROFESSIONAL'),
      admin.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'ENTERPRISE'),
    ])

    const totalCreditsUsed = (creditUsedData ?? [])
      .reduce((sum, t) => sum + Math.abs((t as { amount: number }).amount || 0), 0)
    const totalCreditsPurchased = (creditPurchasedData ?? [])
      .reduce((sum, t) => sum + ((t as { amount: number }).amount || 0), 0)

    const claimsByMonth: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const count = (claimDates ?? []).filter(c => {
        const d = new Date((c as { created_at: string }).created_at)
        return d >= date && d < nextMonth
      }).length
      claimsByMonth.push({ month: monthKey, count })
    }

    const verificationRate = (totalClaims ?? 0) > 0
      ? ((verifiedClaims ?? 0) / (totalClaims ?? 1)) * 100
      : 0

    return NextResponse.json({
      users: { total: totalUsers ?? 0 },
      claims: {
        total: totalClaims ?? 0,
        verified: verifiedClaims ?? 0,
        pending: pendingClaims ?? 0,
        disputed: disputedClaims ?? 0,
        minted: mintedClaims ?? 0,
        verificationRate,
        byMonth: claimsByMonth,
      },
      credits: {
        used: totalCreditsUsed,
        purchased: totalCreditsPurchased,
      },
      subscriptions: {
        STARTER: starterSubs ?? 0,
        PROFESSIONAL: professionalSubs ?? 0,
        ENTERPRISE: enterpriseSubs ?? 0,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch analytics'
    console.error('Analytics error:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
