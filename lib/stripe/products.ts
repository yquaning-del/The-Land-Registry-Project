import { PlanType } from '@/types/billing.types'

export const STRIPE_PLANS = {
  BASIC: {
    name: 'Basic Plan',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    price: 2900, // $29.00 in cents
    credits: 10,
  },
  PRO: {
    name: 'Pro Plan',
    priceId: process.env.STRIPE_PRO_PRICE_ID || '',
    price: 9900, // $99.00 in cents
    credits: 50,
  },
} as const

export function getPlanDetails(planType: PlanType) {
  return STRIPE_PLANS[planType]
}
