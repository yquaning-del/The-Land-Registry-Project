import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// POST - Deduct credits from user's balance
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, type, description, referenceId } = await request.json()

    // Validate required fields
    if (!amount || amount <= 0) {
      return NextResponse.json({ error: 'Amount must be a positive number' }, { status: 400 })
    }

    if (!type || !['VERIFICATION', 'MINT'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be VERIFICATION or MINT' }, { status: 400 })
    }

    // Check if user has sufficient credits
    const { data: hasCredits } = await supabase.rpc('has_sufficient_credits', {
      p_user_id: user.id,
      p_required_amount: amount,
    } as any)

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', code: 'INSUFFICIENT_CREDITS' },
        { status: 402 }
      )
    }

    // Deduct credits
    const { data: newBalance, error: deductError } = await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_description: description || `${type} operation`,
      p_reference_id: referenceId || null,
    } as any)

    if (deductError) {
      console.error('Deduct credits error:', deductError)
      throw new Error(deductError.message || 'Failed to deduct credits')
    }

    return NextResponse.json({
      success: true,
      newBalance,
      deducted: amount,
    })
  } catch (error: any) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}
