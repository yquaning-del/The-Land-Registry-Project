import Paystack from 'paystack-node'

function createPaystackClient() {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    console.warn('PAYSTACK_SECRET_KEY is not set — billing features will be unavailable')
    return null
  }
  return new Paystack(secretKey)
}

export const paystack = createPaystackClient()

export function isPaystackConfigured(): boolean {
  return paystack !== null
}
