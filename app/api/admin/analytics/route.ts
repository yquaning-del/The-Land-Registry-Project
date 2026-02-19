import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Run all count queries in parallel — no full table scans
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
      supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
      supabase.from('land_claims').select('*', { count: 'exact', head: true }),
      supabase.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['AI_VERIFIED', 'APPROVED']),
      supabase.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['PENDING_VERIFICATION', 'PENDING_HUMAN_REVIEW']),
      supabase.from('land_claims').select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['DISPUTED', 'REJECTED']),
      supabase.from('land_claims').select('*', { count: 'exact', head: true })
        .eq('mint_status', 'MINTED'),
      // Only fetch created_at for the last 6 months for the month chart
      supabase.from('land_claims').select('created_at').gte('created_at', sixMonthsAgo),
      supabase.from('credit_transactions').select('amount')
        .in('type', ['VERIFICATION', 'MINT']),
      supabase.from('credit_transactions').select('amount')
        .in('type', ['PURCHASE', 'SUBSCRIPTION_GRANT']),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'STARTER'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'PROFESSIONAL'),
      supabase.from('subscriptions').select('*', { count: 'exact', head: true })
        .eq('status', 'active').eq('plan_type', 'ENTERPRISE'),
    ])

    const totalCreditsUsed = (creditUsedData || [])
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)
    const totalCreditsPurchased = (creditPurchasedData || [])
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate claims by month (last 6 months) using only date strings
    const claimsByMonth: { month: string; count: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })

      const count = (claimDates || []).filter(c => {
        const claimDate = new Date(c.created_at)
        return claimDate >= date && claimDate < nextMonth
      }).length

      claimsByMonth.push({ month: monthKey, count })
    }

    const verificationRate = (totalClaims || 0) > 0
      ? ((verifiedClaims || 0) / (totalClaims || 1)) * 100
      : 0

    const subscriptionsByPlan = {
      STARTER: starterSubs || 0,
      PROFESSIONAL: professionalSubs || 0,
      ENTERPRISE: enterpriseSubs || 0,
    }

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
      },
      claims: {
        total: totalClaims || 0,
        verified: verifiedClaims || 0,
        pending: pendingClaims || 0,
        disputed: disputedClaims || 0,
        minted: mintedClaims || 0,
        verificationRate,
        byMonth: claimsByMonth,
      },
      credits: {
        used: totalCreditsUsed,
        purchased: totalCreditsPurchased,
      },
      subscriptions: subscriptionsByPlan,
    })
  } catch (error: any) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}
