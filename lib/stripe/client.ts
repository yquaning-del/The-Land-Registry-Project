import Stripe from 'stripe'

// Use a placeholder during build if STRIPE_SECRET_KEY is not set
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder'

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
})
