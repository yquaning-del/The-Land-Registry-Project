export type PlanType = 'BASIC' | 'PRO'

export type SubscriptionStatus = 
  | 'active' 
  | 'canceled' 
  | 'past_due' 
  | 'trialing' 
  | 'incomplete' 
  | 'incomplete_expired' 
  | 'unpaid'

export type CreditTransactionType = 
  | 'PURCHASE' 
  | 'MINT' 
  | 'REFUND' 
  | 'BONUS' 
  | 'SUBSCRIPTION_GRANT'

export interface Subscription {
  id: string
  user_id: string
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  plan_type: PlanType
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface Credits {
  user_id: string
  balance: number
  total_purchased: number
  total_used: number
  last_updated: string
  created_at: string
}

export interface CreditTransaction {
  id: string
  user_id: string
  amount: number
  type: CreditTransactionType
  description: string | null
  reference_id: string | null
  stripe_payment_intent_id: string | null
  created_at: string
}

export interface PlanDetails {
  name: string
  type: PlanType
  price: number
  credits: number
  features: string[]
  stripePriceId: string
  popular?: boolean
}

export const PLANS: Record<PlanType, PlanDetails> = {
  BASIC: {
    name: 'Basic',
    type: 'BASIC',
    price: 29,
    credits: 10,
    stripePriceId: process.env.STRIPE_BASIC_PRICE_ID || '',
    features: [
      '10 credits per month',
      'AI verification',
      'Blockchain minting',
      'Basic support',
      'QR code generation',
      'Public verification page',
    ],
  },
  PRO: {
    name: 'Pro',
    type: 'PRO',
    price: 99,
    credits: 50,
    stripePriceId: process.env.STRIPE_PRO_PRICE_ID || '',
    popular: true,
    features: [
      '50 credits per month',
      'AI verification',
      'Blockchain minting',
      'Priority support',
      'QR code generation',
      'Public verification page',
      'Advanced analytics',
      'API access',
      'Custom branding',
    ],
  },
}
