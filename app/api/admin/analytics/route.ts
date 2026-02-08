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
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get user count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    // Get claims statistics
    const { data: claims } = await supabase
      .from('land_claims')
      .select('ai_verification_status, mint_status, created_at')

    const claimsData = claims || []
    const totalClaims = claimsData.length
    const verifiedClaims = claimsData.filter(c => 
      c.ai_verification_status === 'AI_VERIFIED' || c.ai_verification_status === 'APPROVED'
    ).length
    const pendingClaims = claimsData.filter(c => 
      c.ai_verification_status === 'PENDING_VERIFICATION' || c.ai_verification_status === 'PENDING_HUMAN_REVIEW'
    ).length
    const disputedClaims = claimsData.filter(c => 
      c.ai_verification_status === 'DISPUTED' || c.ai_verification_status === 'REJECTED'
    ).length
    const mintedClaims = claimsData.filter(c => c.mint_status === 'MINTED').length

    // Get credit transactions
    const { data: transactions } = await supabase
      .from('credit_transactions')
      .select('amount, type, created_at')

    const transactionsData = transactions || []
    const totalCreditsUsed = transactionsData
      .filter(t => t.type === 'VERIFICATION' || t.type === 'MINT')
      .reduce((sum, t) => sum + Math.abs(t.amount || 0), 0)

    const totalCreditsPurchased = transactionsData
      .filter(t => t.type === 'PURCHASE' || t.type === 'SUBSCRIPTION_GRANT')
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    // Calculate claims by month (last 6 months)
    const claimsByMonth: { month: string; count: number }[] = []
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      const count = claimsData.filter(claim => {
        const claimDate = new Date(claim.created_at)
        return claimDate >= date && claimDate < nextMonth
      }).length

      claimsByMonth.push({ month: monthKey, count })
    }

    // Calculate verification rate
    const verificationRate = totalClaims > 0 ? (verifiedClaims / totalClaims) * 100 : 0

    // Get subscription breakdown
    const { data: subscriptions } = await supabase
      .from('subscriptions')
      .select('plan_type, status')
      .eq('status', 'active')

    const subscriptionsData = subscriptions || []
    const subscriptionsByPlan = {
      STARTER: subscriptionsData.filter(s => s.plan_type === 'STARTER').length,
      PROFESSIONAL: subscriptionsData.filter(s => s.plan_type === 'PROFESSIONAL').length,
      ENTERPRISE: subscriptionsData.filter(s => s.plan_type === 'ENTERPRISE').length,
    }

    return NextResponse.json({
      users: {
        total: totalUsers || 0,
      },
      claims: {
        total: totalClaims,
        verified: verifiedClaims,
        pending: pendingClaims,
        disputed: disputedClaims,
        minted: mintedClaims,
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
