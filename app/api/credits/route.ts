import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - Get user's credit balance and history
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const includeHistory = searchParams.get('history') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    // Get current balance
    const { data: balance, error: balanceError } = await supabase
      .rpc('get_credit_balance', { p_user_id: user.id } as any)

    if (balanceError) {
      console.error('Error getting balance:', balanceError)
      // Fallback to direct query if RPC fails
      const { data: userData } = await supabase
        .from('users')
        .select('credits')
        .eq('id', user.id)
        .single()
      
      const userDataTyped = userData as { credits?: number } | null
      const fallbackBalance = userDataTyped?.credits || 0

      if (!includeHistory) {
        return NextResponse.json({ balance: fallbackBalance })
      }
    }

    const currentBalance = balance || 0

    if (!includeHistory) {
      return NextResponse.json({ balance: currentBalance })
    }

    // Get transaction history
    const { data: history, error: historyError } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (historyError) {
      console.error('Error getting history:', historyError)
    }

    return NextResponse.json({
      balance: currentBalance,
      history: history || [],
    })
  } catch (error: any) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch credits' },
      { status: 500 }
    )
  }
}
