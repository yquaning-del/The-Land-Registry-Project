import Paystack from 'paystack-node'

if (!process.env.PAYSTACK_SECRET_KEY) {
  throw new Error('PAYSTACK_SECRET_KEY is not set in environment variables')
}

export const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY)
