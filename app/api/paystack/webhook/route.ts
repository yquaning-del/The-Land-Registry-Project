import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { PAYSTACK_PLANS, PaystackPlanType } from '@/types/paystack.types'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const VALID_PLAN_TYPES = Object.keys(PAYSTACK_PLANS)

export async function POST(request: NextRequest) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY
  if (!paystackSecretKey) {
    return NextResponse.json(
      { error: 'Paystack not configured' },
      { status: 503 }
    )
  }

  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  // Verify webhook signature using constant-time comparison to prevent timing attacks
  const hash = crypto
    .createHmac('sha512', paystackSecretKey)
    .update(body)
    .digest('hex')

  let signaturesMatch = false
  try {
    const hashBuffer = Buffer.from(hash, 'hex')
    const sigBuffer = Buffer.from(signature, 'hex')
    signaturesMatch =
      hashBuffer.length === sigBuffer.length &&
      crypto.timingSafeEqual(hashBuffer, sigBuffer)
  } catch {
    signaturesMatch = false
  }

  if (!signaturesMatch) {
    console.error('Invalid Paystack webhook signature')
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const event = JSON.parse(body)
  const supabase = await createClient()

  try {
    switch (event.event) {
      case 'charge.success': {
        const { customer, metadata, reference, plan } = event.data

        if (!metadata?.user_id) {
          console.error('Missing user_id in webhook metadata')
          return NextResponse.json({ error: 'Missing user_id' }, { status: 400 })
        }

        const userId = metadata.user_id as string
        const planType = metadata.plan_type as PaystackPlanType

        // Validate userId is a proper UUID to prevent metadata injection
        if (!UUID_REGEX.test(userId)) {
          console.error('Invalid user_id format in webhook metadata:', userId)
          return NextResponse.json({ error: 'Invalid user_id format' }, { status: 400 })
        }

        // Validate planType is a known value
        if (planType && !VALID_PLAN_TYPES.includes(planType)) {
          console.error('Unknown plan_type in webhook metadata:', planType)
          return NextResponse.json({ error: 'Unknown plan_type' }, { status: 400 })
        }

        // Verify user exists before granting credits
        const { data: userProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', userId)
          .single()

        if (!userProfile) {
          console.error('User not found for webhook userId:', userId)
          return NextResponse.json({ error: 'User not found' }, { status: 400 })
        }

        const credits = (metadata.credits as number) || PAYSTACK_PLANS[planType]?.credits || 0

        // Create or update subscription
        const { error: upsertError } = await supabase.from('subscriptions').upsert({
          user_id: userId,
          paystack_customer_code: customer.customer_code,
          paystack_subscription_code: plan?.subscription_code || null,
          paystack_email_token: customer.email,
          plan_type: planType,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

        if (upsertError) {
          throw new Error(`Failed to upsert subscription: ${upsertError.message}`)
        }

        // Grant credits
        const { error: creditsError } = await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
          p_type: 'SUBSCRIPTION_GRANT',
          p_description: `${planType} plan monthly credits`,
          p_reference_id: reference,
        })

        if (creditsError) {
          throw new Error(`Failed to grant credits: ${creditsError.message}`)
        }

        console.log(`Credits granted: ${credits} for user ${userId}`)
        break
      }

      case 'subscription.create': {
        const { customer, subscription_code, email_token } = event.data

        const { error: subCreateError } = await supabase
          .from('subscriptions')
          .update({
            paystack_subscription_code: subscription_code,
            paystack_email_token: email_token,
          })
          .eq('paystack_customer_code', customer.customer_code)

        if (subCreateError) {
          throw new Error(`Failed to update subscription on create: ${subCreateError.message}`)
        }

        break
      }

      case 'subscription.disable': {
        const { subscription_code } = event.data

        const { error: disableError } = await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
          })
          .eq('paystack_subscription_code', subscription_code)

        if (disableError) {
          throw new Error(`Failed to disable subscription: ${disableError.message}`)
        }

        break
      }

      case 'invoice.payment_failed': {
        const { subscription } = event.data

        if (subscription?.subscription_code) {
          const { error: pastDueError } = await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('paystack_subscription_code', subscription.subscription_code)

          if (pastDueError) {
            throw new Error(`Failed to mark subscription past_due: ${pastDueError.message}`)
          }
        }

        break
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Webhook handler error:', error)
    // Return 500 so Paystack retries the webhook
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
