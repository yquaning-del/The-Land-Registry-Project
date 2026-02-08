# Paystack Integration Setup Guide

## Overview

The Land Registry Platform now uses **Paystack** for credit-based billing with three subscription tiers:

- **Starter**: $49/month - 20 credits
- **Professional**: $199/month - 100 credits (Most Popular)
- **Enterprise**: $499/month - 500 credits

### Credit Costs
- **1 credit** = 1 AI verification
- **5 credits** = 1 blockchain mint

## Setup Instructions

### 1. Create Paystack Account

1. Go to [https://paystack.com](https://paystack.com)
2. Sign up for a business account
3. Complete KYC verification
4. Navigate to Settings → API Keys & Webhooks

### 2. Get API Keys

From your Paystack Dashboard:

1. Go to **Settings** → **API Keys & Webhooks**
2. Copy your **Secret Key** (starts with `sk_test_` for test mode)
3. Copy your **Public Key** (starts with `pk_test_` for test mode)

### 3. Create Subscription Plans

1. Go to **Payments** → **Plans** in Paystack Dashboard
2. Create three plans:

#### Starter Plan
- **Name**: Starter
- **Amount**: $49 (or ₦49,000 for Naira)
- **Interval**: Monthly
- **Credits**: 20 credits per month
- **Plan Code**: Copy this code (e.g., `PLN_xxxxx`)

#### Professional Plan
- **Name**: Professional
- **Amount**: $199 (or ₦199,000 for Naira)
- **Interval**: Monthly
- **Credits**: 100 credits per month
- **Plan Code**: Copy this code (e.g., `PLN_xxxxx`)

#### Enterprise Plan
- **Name**: Enterprise
- **Amount**: $499 (or ₦499,000 for Naira)
- **Interval**: Monthly
- **Credits**: 500 credits per month
- **Plan Code**: Copy this code (e.g., `PLN_xxxxx`)

### 4. Configure Webhook

1. Go to **Settings** → **API Keys & Webhooks**
2. Click **Add Webhook URL**
3. Enter your webhook URL: `https://yourdomain.com/api/paystack/webhook`
4. Select events to listen for:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
   - `invoice.payment_failed`
5. Save the webhook

### 5. Update Environment Variables

Add these to your `.env.local` file:

```bash
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_test_your_secret_key_here
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_public_key_here

# Paystack Plan Codes (from step 3)
NEXT_PUBLIC_PAYSTACK_STARTER_PLAN_CODE=PLN_starter_code_here
NEXT_PUBLIC_PAYSTACK_PROFESSIONAL_PLAN_CODE=PLN_professional_code_here
NEXT_PUBLIC_PAYSTACK_ENTERPRISE_PLAN_CODE=PLN_enterprise_code_here
```

### 6. Run Database Migration

Run the Paystack billing migration:

```bash
# In Supabase Dashboard → SQL Editor
# Execute: supabase/migrations/004_paystack_billing.sql
```

This migration:
- Updates subscriptions table for Paystack
- Adds new plan types (STARTER, PROFESSIONAL, ENTERPRISE)
- Adds VERIFICATION transaction type
- Creates `deduct_credits_with_cost` function

### 7. Test the Integration

#### Test Mode
1. Use Paystack test cards: [https://paystack.com/docs/payments/test-payments](https://paystack.com/docs/payments/test-payments)
2. Test card: `5060666666666666666` (Verve)
3. Test card: `4084084084084081` (Visa)
4. CVV: Any 3 digits
5. Expiry: Any future date
6. OTP: `123456`

#### Test Flow
1. Visit `/pricing` page
2. Click "Get Started" on any plan
3. Complete payment with test card
4. Verify webhook receives `charge.success` event
5. Check that credits are added to user account
6. Test verification (1 credit deduction)
7. Test minting (5 credits deduction)

## API Routes

### Initialize Payment
**POST** `/api/paystack/initialize`

Request:
```json
{
  "planType": "STARTER" | "PROFESSIONAL" | "ENTERPRISE"
}
```

Response:
```json
{
  "authorization_url": "https://checkout.paystack.com/...",
  "access_code": "...",
  "reference": "..."
}
```

### Webhook Handler
**POST** `/api/paystack/webhook`

Handles events:
- `charge.success` - Grants credits and creates subscription
- `subscription.create` - Updates subscription with subscription code
- `subscription.disable` - Marks subscription as canceled
- `invoice.payment_failed` - Marks subscription as past_due

## Credit System

### Verification (1 Credit)
```typescript
import { deductCreditsForVerification } from '@/lib/credits'

const success = await deductCreditsForVerification(
  userId,
  'AI verification for claim XYZ',
  claimId
)
```

### Minting (5 Credits)
```typescript
import { deductCreditsForMint } from '@/lib/credits'

const success = await deductCreditsForMint(
  userId,
  'NFT minted for claim XYZ',
  transactionHash
)
```

### Check Balance
```typescript
import { getCreditBalance, checkCredits } from '@/lib/credits'

const balance = await getCreditBalance(userId)
const hasEnough = await checkCredits(userId, 5) // Check for 5 credits
```

## Database Schema

### Subscriptions Table
```sql
- paystack_customer_code: TEXT (Paystack customer identifier)
- paystack_subscription_code: TEXT (Paystack subscription identifier)
- paystack_email_token: TEXT (Customer email)
- plan_type: 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE'
- status: 'active' | 'canceled' | 'past_due' | etc.
```

### Credit Transactions Table
```sql
- type: 'PURCHASE' | 'MINT' | 'VERIFICATION' | 'REFUND' | 'BONUS' | 'SUBSCRIPTION_GRANT'
- amount: INTEGER (positive for additions, negative for deductions)
- paystack_reference: TEXT (Paystack transaction reference)
```

## Webhook Security

The webhook handler verifies Paystack signatures using HMAC SHA512:

```typescript
const hash = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(body)
  .digest('hex')

if (hash !== signature) {
  // Invalid webhook
}
```

## Pricing Page

Stunning pricing page available at `/pricing` with:
- 3-column responsive layout
- "Most Popular" badge on Professional plan
- Feature lists for each plan
- Credit cost breakdown (1 credit = verification, 5 credits = mint)
- FAQ section
- Mobile-responsive design
- Glassmorphism UI with gradient backgrounds

## Troubleshooting

### Webhook Not Receiving Events
1. Check webhook URL is publicly accessible
2. Verify webhook is enabled in Paystack dashboard
3. Check webhook logs in Paystack dashboard
4. Ensure correct events are selected

### Credits Not Added After Payment
1. Check webhook logs for errors
2. Verify `charge.success` event is being received
3. Check Supabase logs for RPC function errors
4. Ensure user_id is in webhook metadata

### Payment Initialization Fails
1. Verify Paystack API keys are correct
2. Check plan codes match Paystack dashboard
3. Ensure user is authenticated
4. Check network connectivity

### Credit Deduction Fails
1. Verify user has sufficient credits
2. Check RPC function exists in database
3. Ensure user_id is valid
4. Check transaction logs

## Production Checklist

- [ ] Switch to Paystack live mode keys
- [ ] Update webhook URL to production domain
- [ ] Test live payment flow
- [ ] Monitor webhook delivery
- [ ] Set up error alerting
- [ ] Configure Paystack email notifications
- [ ] Test subscription renewal
- [ ] Verify credit top-up on renewal
- [ ] Test failed payment handling
- [ ] Document support process for billing issues

## Support

For Paystack-specific issues:
- [Paystack Documentation](https://paystack.com/docs)
- [Paystack Support](https://paystack.com/contact)
- [Paystack API Reference](https://paystack.com/docs/api)

For integration issues:
- Check application logs
- Review webhook delivery logs in Paystack
- Verify database migrations ran successfully
- Test with Paystack test cards

## Migration from Stripe

If migrating from Stripe:
1. Export existing customer data
2. Run migration script to update subscription records
3. Notify users of payment provider change
4. Update billing documentation
5. Test thoroughly before switching

---

**Version**: 1.0.0  
**Last Updated**: February 1, 2026  
**Status**: Production Ready ✅
