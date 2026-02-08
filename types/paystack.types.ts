export type PaystackPlanType = 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'

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
  | 'VERIFICATION'
  | 'REFUND' 
  | 'BONUS' 
  | 'SUBSCRIPTION_GRANT'

export interface PaystackSubscription {
  id: string
  user_id: string
  paystack_customer_code: string | null
  paystack_subscription_code: string | null
  paystack_email_token: string | null
  plan_type: PaystackPlanType
  status: SubscriptionStatus
  current_period_start: string | null
  current_period_end: string | null
  cancel_at_period_end: boolean
  created_at: string
  updated_at: string
}

export interface PaystackPlanDetails {
  name: string
  type: PaystackPlanType
  price: number
  credits: number
  features: string[]
  paystackPlanCode: string
  popular?: boolean
  description: string
}

export const PAYSTACK_PLANS: Record<PaystackPlanType, PaystackPlanDetails> = {
  STARTER: {
    name: 'Starter',
    type: 'STARTER',
    price: 49,
    credits: 20,
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_STARTER_PLAN_CODE || '',
    description: 'Perfect for individuals and small teams',
    features: [
      '20 credits per month',
      '1 credit per verification',
      '5 credits per blockchain mint',
      'AI-powered verification',
      'Basic support',
      'QR code generation',
      'Public verification pages',
    ],
  },
  PROFESSIONAL: {
    name: 'Professional',
    type: 'PROFESSIONAL',
    price: 199,
    credits: 100,
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_PROFESSIONAL_PLAN_CODE || '',
    popular: true,
    description: 'Best for growing businesses',
    features: [
      '100 credits per month',
      '1 credit per verification',
      '5 credits per blockchain mint',
      'AI-powered verification',
      'Priority support',
      'Advanced analytics',
      'API access',
      'Custom branding',
      'Bulk operations',
    ],
  },
  ENTERPRISE: {
    name: 'Enterprise',
    type: 'ENTERPRISE',
    price: 499,
    credits: 500,
    paystackPlanCode: process.env.NEXT_PUBLIC_PAYSTACK_ENTERPRISE_PLAN_CODE || '',
    description: 'For large organizations',
    features: [
      '500 credits per month',
      '1 credit per verification',
      '5 credits per blockchain mint',
      'AI-powered verification',
      'Dedicated support',
      'Advanced analytics',
      'Full API access',
      'White-label solution',
      'Bulk operations',
      'Custom integrations',
      'SLA guarantee',
    ],
  },
}

export const CREDIT_COSTS = {
  VERIFICATION: 1,
  MINT: 5,
} as const
