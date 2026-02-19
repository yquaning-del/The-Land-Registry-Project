import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit, getClientIdentifier, rateLimitResponse } from '@/lib/rate-limit'

const VALID_TYPES = ['VERIFICATION', 'MINT']

// POST - Atomically deduct credits from user's balance
export async function POST(request: NextRequest) {
  // Rate limiting: 20 deductions per minute per user/IP
  const rlResult = rateLimit(getClientIdentifier(request), { maxRequests: 20, windowMs: 60000 })
  if (!rlResult.success) return rateLimitResponse(rlResult) as unknown as NextResponse

  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { amount, type, description, referenceId } = await request.json()

    if (!amount || typeof amount !== 'number' || amount <= 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Amount must be a positive integer' }, { status: 400 })
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    // Use atomic RPC to check and deduct in one transaction (prevents race conditions)
    const { data: result, error: rpcError } = await supabase.rpc('deduct_credits_atomic', {
      p_user_id: user.id,
      p_amount: amount,
      p_type: type,
      p_description: description || `${type} operation`,
      p_reference_id: referenceId || null,
    } as any)

    if (rpcError) {
      console.error('Atomic deduct credits error:', rpcError)
      throw new Error(rpcError.message || 'Failed to deduct credits')
    }

    const deductResult = result as { success: boolean; error?: string; new_balance?: number; balance?: number; required?: number }

    if (!deductResult?.success) {
      const isInsufficient = deductResult?.error === 'Insufficient credits'
      return NextResponse.json(
        {
          error: deductResult?.error || 'Failed to deduct credits',
          code: isInsufficient ? 'INSUFFICIENT_CREDITS' : 'DEDUCT_FAILED',
          balance: deductResult?.balance,
          required: deductResult?.required,
        },
        { status: isInsufficient ? 402 : 500 }
      )
    }

    return NextResponse.json({
      success: true,
      newBalance: deductResult.new_balance,
      deducted: amount,
    })
  } catch (error: unknown) {
    console.error('Error deducting credits:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to deduct credits' },
      { status: 500 }
    )
  }
}
