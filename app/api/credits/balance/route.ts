import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get user's credit balance
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get balance using RPC function
    const { data: balance, error: balanceError } = await supabase.rpc('get_credit_balance', {
      p_user_id: user.id,
    } as any)

    if (balanceError) {
      console.error('Balance error:', balanceError)
      // Fallback to direct query
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()

      return NextResponse.json({
        balance: userData?.credits || 0,
      })
    }

    // Get subscription info
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    // Get usage this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: usageData } = await supabase
      .from('credit_transactions')
      .select('amount')
      .eq('user_id', user.id)
      .in('type', ['VERIFICATION', 'MINT'])
      .gte('created_at', startOfMonth.toISOString())

    const usedThisMonth = usageData?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0

    // Plan allocations
    const planAllocations: Record<string, number> = {
      STARTER: 20,
      PROFESSIONAL: 100,
      ENTERPRISE: 500,
    }

    const plan = subscription?.plan_type || 'FREE'
    const monthlyAllocation = planAllocations[plan] || 5

    return NextResponse.json({
      balance: balance || 0,
      plan,
      monthlyAllocation,
      usedThisMonth,
      subscription: subscription ? {
        status: subscription.status,
        currentPeriodEnd: subscription.current_period_end,
      } : null,
    })
  } catch (error: any) {
    console.error('Error fetching balance:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch balance' },
      { status: 500 }
    )
  }
}
