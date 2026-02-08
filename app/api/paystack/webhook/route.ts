import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'
import { PAYSTACK_PLANS, PaystackPlanType } from '@/types/paystack.types'

const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  // Verify webhook signature
  const hash = crypto
    .createHmac('sha512', paystackSecretKey)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
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

        const userId = metadata.user_id
        const planType = metadata.plan_type as PaystackPlanType
        const credits = metadata.credits || PAYSTACK_PLANS[planType]?.credits || 0

        // Create or update subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          paystack_customer_code: customer.customer_code,
          paystack_subscription_code: plan?.subscription_code || null,
          paystack_email_token: customer.email,
          plan_type: planType,
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        })

        // Grant credits
        await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: credits,
          p_type: 'SUBSCRIPTION_GRANT',
          p_description: `${planType} plan monthly credits`,
          p_reference_id: reference,
        })

        console.log(`Credits granted: ${credits} for user ${userId}`)
        break
      }

      case 'subscription.create': {
        const { customer, subscription_code, email_token } = event.data
        
        // Update subscription with subscription code
        await supabase
          .from('subscriptions')
          .update({
            paystack_subscription_code: subscription_code,
            paystack_email_token: email_token,
          })
          .eq('paystack_customer_code', customer.customer_code)

        break
      }

      case 'subscription.disable': {
        const { subscription_code } = event.data

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
            cancel_at_period_end: true,
          })
          .eq('paystack_subscription_code', subscription_code)

        break
      }

      case 'invoice.payment_failed': {
        const { subscription } = event.data

        if (subscription?.subscription_code) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'past_due',
            })
            .eq('paystack_subscription_code', subscription.subscription_code)
        }

        break
      }

      default:
        console.log(`Unhandled Paystack event: ${event.event}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: error.message || 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
