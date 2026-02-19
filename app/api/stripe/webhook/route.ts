import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'
import { getPlanDetails } from '@/lib/stripe/products'
import { PlanType } from '@/types/billing.types'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planType = session.metadata?.plan_type as PlanType

        if (!userId || !planType) {
          throw new Error('Missing metadata in checkout session')
        }

        // Fetch the subscription to get accurate period dates
        let periodStart = new Date().toISOString()
        let periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        if (session.subscription) {
          const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string)
          periodStart = new Date(stripeSub.current_period_start * 1000).toISOString()
          periodEnd = new Date(stripeSub.current_period_end * 1000).toISOString()
        }

        // Create or update subscription
        await supabase.from('subscriptions').upsert({
          user_id: userId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: session.subscription as string,
          plan_type: planType,
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd,
        })

        // Grant credits — idempotency key prevents double-granting on webhook replay
        const plan = getPlanDetails(planType)
        await supabase.rpc('add_credits', {
          p_user_id: userId,
          p_amount: plan.credits,
          p_type: 'SUBSCRIPTION_GRANT',
          p_description: `${planType} plan monthly credits`,
          p_reference_id: session.id,
        })

        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // Get user by customer ID
        const { data: subData } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (subData) {
          await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              cancel_at_period_end: subscription.cancel_at_period_end,
            })
            .eq('stripe_subscription_id', subscription.id)
        }

        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        await supabase
          .from('subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)

        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice
        
        // Grant monthly credits on successful renewal
        if (invoice.billing_reason === 'subscription_cycle') {
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('user_id, plan_type')
            .eq('stripe_subscription_id', invoice.subscription as string)
            .single()

          if (subData) {
            const plan = getPlanDetails(subData.plan_type as PlanType)
            await supabase.rpc('add_credits', {
              p_user_id: subData.user_id,
              p_amount: plan.credits,
              p_type: 'SUBSCRIPTION_GRANT',
              p_description: `${subData.plan_type} plan monthly credits renewal`,
              p_reference_id: invoice.id,
            })
          }
        }

        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        await supabase
          .from('subscriptions')
          .update({
            status: 'past_due',
          })
          .eq('stripe_subscription_id', invoice.subscription as string)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
