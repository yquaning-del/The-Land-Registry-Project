import { NextRequest, NextResponse } from 'next/server'
import { paystack } from '@/lib/paystack/client'
import { createClient } from '@/lib/supabase/server'
import { PAYSTACK_PLANS, PaystackPlanType } from '@/types/paystack.types'

export async function POST(request: NextRequest) {
  try {
    const { planType } = await request.json() as { planType: PaystackPlanType }

    if (!planType || !['STARTER', 'PROFESSIONAL', 'ENTERPRISE'].includes(planType)) {
      return NextResponse.json(
        { error: 'Invalid plan type' },
        { status: 400 }
      )
    }

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user || !user.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get plan details
    const plan = PAYSTACK_PLANS[planType]

    // Initialize Paystack transaction
    const response = await paystack.transaction.initialize({
      email: user.email,
      amount: plan.price * 100, // Convert to kobo/cents
      plan: plan.paystackPlanCode,
      metadata: {
        user_id: user.id,
        plan_type: planType,
        credits: plan.credits,
      },
      callback_url: `${request.nextUrl.origin}/settings/billing?success=true`,
      channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
    })

    if (response.status && response.data) {
      return NextResponse.json({
        authorization_url: response.data.authorization_url,
        access_code: response.data.access_code,
        reference: response.data.reference,
      })
    }

    return NextResponse.json(
      { error: 'Failed to initialize transaction' },
      { status: 500 }
    )
  } catch (error: any) {
    console.error('Paystack initialization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize payment' },
      { status: 500 }
    )
  }
}
