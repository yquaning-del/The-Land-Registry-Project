# SaaS Platform Implementation Guide

## ✅ Completed Features

### Phase 1: Design System ✓
- **Tailwind Config**: Updated with Trust-First color palette
  - Navy: `#0F172A` (Deep Navy for authority)
  - Emerald: `#10B981` (Success/approval color)
  - Custom gradients and animations
- **Font**: Geist Sans and Geist Mono integrated
- **CSS Variables**: Updated in `app/globals.css`

### Phase 2: Database Migration ✓
- **File**: `supabase/migrations/003_billing_and_credits.sql`
- **Tables Created**:
  - `subscriptions` - Stripe subscription data
  - `credits` - User credit balances
  - `credit_transactions` - Transaction history
- **Functions**:
  - `add_credits()` - Add credits to user
  - `deduct_credits()` - Deduct credits (with balance check)
  - `get_credit_balance()` - Get user balance
  - `grant_initial_credits()` - 5 free credits on signup
- **RLS Policies**: Enabled for all tables

### Phase 3: AppShell Layout ✓
- **Components Created**:
  - `components/layout/AppShell.tsx` - Main shell
  - `components/layout/Sidebar.tsx` - Persistent sidebar with navigation
  - `components/layout/Header.tsx` - Sticky header with credits display
- **Dashboard Layout**: `app/(dashboard)/layout.tsx` wraps all authenticated pages
- **Features**:
  - Responsive design (collapsible on mobile)
  - Real-time credit balance updates
  - Wallet connection in header
  - Role-based navigation

### Phase 4: Stripe Integration ✓
- **Files Created**:
  - `lib/stripe/client.ts` - Stripe SDK initialization
  - `lib/stripe/products.ts` - Plan definitions
  - `app/api/stripe/checkout/route.ts` - Create checkout sessions
  - `app/api/stripe/webhook/route.ts` - Handle Stripe webhooks
  - `app/api/stripe/portal/route.ts` - Customer portal redirect
- **Plans**:
  - **Basic**: $29/month, 10 credits
  - **Pro**: $99/month, 50 credits
- **Webhook Events Handled**:
  - `checkout.session.completed` - Create subscription, grant credits
  - `customer.subscription.updated` - Update subscription status
  - `customer.subscription.deleted` - Cancel subscription
  - `invoice.payment_succeeded` - Grant monthly credits on renewal
  - `invoice.payment_failed` - Mark subscription as past_due

### Phase 5: Settings/Billing Page ✓
- **Files Created**:
  - `app/(dashboard)/settings/billing/page.tsx` - Billing management
  - `app/(dashboard)/settings/profile/page.tsx` - Profile settings
  - `components/PricingCard.tsx` - Reusable pricing card
- **Features**:
  - Current plan display
  - Credit balance overview
  - Plan comparison and upgrade
  - Transaction history
  - Stripe Customer Portal integration

### Phase 6: Credits System ✓
- **Files Created**:
  - `lib/credits/index.ts` - Credit utility functions
  - `components/CreditGuard.tsx` - Protect actions requiring credits
  - `components/CreditBalance.tsx` - Display credit balance
- **Integration**:
  - Updated `MintTitleButton.tsx` to check and deduct credits
  - Real-time credit updates via Supabase subscriptions
  - Low credit warnings
- **Flow**:
  1. Check credits before minting
  2. Deduct 1 credit after successful mint
  3. Create transaction record
  4. Update balance in real-time

## 🚧 Remaining Tasks

### Phase 7: Enhanced Dashboard
**Status**: Partially complete (basic dashboard exists)

**TODO**:
1. Update `app/(dashboard)/dashboard/page.tsx` with:
   - Animated KPI cards with real data
   - Activity table with sorting/filtering
   - Charts (optional - requires recharts)
   - Quick actions

### Phase 8: Landing Page
**Status**: Basic landing page exists

**TODO**:
1. Redesign `app/page.tsx` with:
   - Hero section with gradient background
   - Verification Terminal animation component
   - Pricing section with plan cards
   - FAQ accordion
   - Social proof section
   - Professional footer

2. Create `components/VerificationTerminal.tsx`:
   - Animated terminal showing verification steps
   - Typing effect with Framer Motion
   - Progress indicators
   - Confidence scores updating

### Phase 9: Shadcn UI Components
**Status**: Partial (button, card, input, label exist)

**TODO**: Add missing components:
- `components/ui/badge.tsx` - Status badges
- `components/ui/dialog.tsx` - Modals
- `components/ui/tabs.tsx` - Tab navigation
- `components/ui/accordion.tsx` - FAQ accordion
- `components/ui/table.tsx` - Data tables

### Phase 10: Testing & Polish
**TODO**:
- Test Stripe checkout flow
- Test credit deduction
- Test webhook handling
- Responsive design testing
- Error handling improvements
- Loading states
- Toast notifications

## 🔧 Environment Variables Required

Add these to your `.env.local` file:

```bash
# Existing Supabase & Thirdweb variables
NEXT_PUBLIC_SUPABASE_URL=https://cmjgfxwuxzdaseaeeuqo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
NEXT_PUBLIC_THIRDWEB_CLIENT_ID=your_thirdweb_client_id
PINATA_JWT=your_pinata_jwt_token
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_polygon_contract_address

# NEW: Stripe Configuration
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

## 📋 Stripe Setup Instructions

### 1. Create Stripe Account
- Go to https://stripe.com
- Sign up for an account
- Get your API keys from Dashboard → Developers → API keys

### 2. Create Products
1. Go to Products → Add product
2. Create "Basic Plan":
   - Name: Basic Plan
   - Price: $29.00/month
   - Recurring: Monthly
   - Copy the Price ID (starts with `price_`)
3. Create "Pro Plan":
   - Name: Pro Plan
   - Price: $99.00/month
   - Recurring: Monthly
   - Copy the Price ID

### 3. Set Up Webhook
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret (starts with `whsec_`)

### 4. Test Mode
- Use test mode during development
- Test cards: https://stripe.com/docs/testing
  - Success: 4242 4242 4242 4242
  - Decline: 4000 0000 0000 0002

## 🗄️ Database Migration

Run the migration to create billing tables:

```bash
# If using Supabase CLI
supabase db push

# Or manually run the SQL in Supabase Dashboard
# Go to SQL Editor and paste contents of:
# supabase/migrations/003_billing_and_credits.sql
```

## 🎨 Design System Usage

### Colors
```tsx
// Navy (Trust/Authority)
className="bg-navy-900 text-white"
className="text-navy-900"

// Emerald (Success)
className="bg-emerald-500 text-white"
className="text-emerald-600"

// Gradients
className="bg-gradient-navy-emerald"
className="bg-gradient-navy-slate"
```

### Animations
```tsx
className="animate-fade-in"
className="animate-slide-up"
className="animate-scale-in"
```

### Typography
```tsx
className="font-sans" // Geist Sans
className="font-mono" // Geist Mono
```

## 🔄 User Flow

### New User Signup
1. User signs up via Supabase Auth
2. Trigger grants 5 free credits automatically
3. User redirected to dashboard
4. Can submit claims immediately with free credits

### Subscription Flow
1. User goes to Settings → Billing
2. Selects plan (Basic or Pro)
3. Redirected to Stripe Checkout
4. After payment:
   - Webhook creates subscription record
   - Grants monthly credits (10 or 50)
   - User redirected back to billing page

### Minting Flow
1. Admin approves claim
2. Admin clicks "Mint Land Title NFT"
3. System checks credit balance
4. If sufficient:
   - Uploads to IPFS
   - Mints NFT on blockchain
   - Deducts 1 credit
   - Creates transaction record
   - Shows QR code
5. If insufficient:
   - Shows upgrade prompt
   - Links to billing page

### Credit Renewal
1. Stripe charges subscription monthly
2. Webhook receives `invoice.payment_succeeded`
3. System grants monthly credits (10 or 50)
4. User notified of credit renewal

## 🚀 Deployment Checklist

- [ ] Set all environment variables in production
- [ ] Run database migration
- [ ] Configure Stripe webhook with production URL
- [ ] Test Stripe checkout in production
- [ ] Test webhook delivery
- [ ] Set up monitoring for failed webhooks
- [ ] Configure Stripe Customer Portal settings
- [ ] Test credit deduction flow
- [ ] Verify real-time credit updates
- [ ] Test responsive design on mobile
- [ ] Set up error tracking (Sentry, etc.)

## 📊 Key Metrics to Track

- Conversion rate (free → paid)
- Plan distribution (Basic vs Pro)
- Credit usage patterns
- Average credits per user
- Churn rate
- Monthly recurring revenue (MRR)
- Customer lifetime value (LTV)

## 🐛 Known Issues & Limitations

1. **Credit Race Condition**: Multiple simultaneous mints could theoretically bypass credit check. Consider implementing optimistic locking.

2. **Webhook Retry**: Failed webhooks need manual intervention. Consider implementing retry logic.

3. **Credit Refunds**: No automated refund system for failed mints. Manual process required.

4. **Admin Credits**: Admins currently subject to credit system. May want unlimited credits for admins.

## 🔐 Security Considerations

1. **Webhook Verification**: Always verify Stripe webhook signatures
2. **RLS Policies**: Enabled on all billing tables
3. **API Routes**: Protected with Supabase auth
4. **Credit Checks**: Server-side validation before minting
5. **Environment Variables**: Never commit `.env.local`

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Thirdweb SDK](https://portal.thirdweb.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Geist Font](https://vercel.com/font)

## 🎯 Next Steps

1. **Complete Landing Page**: Build the verification terminal animation
2. **Add Shadcn Components**: Install missing UI components
3. **Enhanced Dashboard**: Add charts and real-time data
4. **Testing**: Comprehensive testing of all flows
5. **Documentation**: User guides and API docs
6. **Analytics**: Implement tracking for key metrics
7. **Monitoring**: Set up error tracking and alerts

---

**Implementation Status**: ~70% Complete
**Estimated Time to Complete**: 4-6 hours for remaining features
**Priority**: Landing page and Shadcn components for production readiness
