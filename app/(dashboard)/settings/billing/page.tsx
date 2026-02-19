'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/PricingCard'
import { PAYSTACK_PLANS } from '@/types/paystack.types'
import { createClient } from '@/lib/supabase/client'
import { Coins, CreditCard, Calendar, ExternalLink, AlertTriangle, X } from 'lucide-react'

const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@landregistry.africa'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  async function loadBillingData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setSubscription(subData)

      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setCredits(creditsData)

      const { data: transData } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      setTransactions(transData || [])
    }
  }

  async function handleSelectPlan(planType: string) {
    setLoading(true)
    try {
      const response = await fetch('/api/paystack/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })
      const data = await response.json()
      if (!response.ok) {
        alert(data.error || 'Failed to initialize checkout. Please try again.')
        return
      }
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      } else {
        alert('Checkout URL not received. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      alert('Failed to start checkout. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleManageBilling() {
    // Stripe users: redirect to Stripe Customer Portal
    if (subscription?.stripe_customer_id) {
      setLoading(true)
      try {
        const res = await fetch('/api/stripe/portal', { method: 'POST' })
        const data = await res.json()
        if (data.url) {
          window.location.href = data.url
        } else {
          alert(data.error || 'Failed to open billing portal')
        }
      } catch {
        alert('Failed to open billing portal. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }

    // Paystack users: show cancel confirm
    setShowCancelConfirm(true)
  }

  async function handleCancelSubscription() {
    if (!subscription) return
    setCancelLoading(true)
    try {
      if (subscription.stripe_subscription_id) {
        const res = await fetch('/api/stripe/cancel', { method: 'POST' })
        const data = await res.json()
        if (res.ok) {
          alert('Your subscription will be canceled at the end of the current billing period.')
          setShowCancelConfirm(false)
          await loadBillingData()
        } else {
          alert(data.error || 'Failed to cancel subscription')
        }
      } else {
        // Paystack — manual cancellation via support
        alert(`To cancel your Paystack subscription, please email ${SUPPORT_EMAIL} with your account details.`)
        setShowCancelConfirm(false)
      }
    } catch {
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setCancelLoading(false)
    }
  }

  const isStripeSub = !!subscription?.stripe_customer_id
  const isActiveSubscription = subscription && subscription.status === 'active'

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and credits</p>
      </div>

      {/* Cancel Confirmation Dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Cancel Subscription?</h3>
                <p className="text-gray-600 text-sm mt-1">
                  {isStripeSub
                    ? 'Your subscription will remain active until the end of your current billing period. You will not be charged again.'
                    : 'To cancel your Paystack subscription, our support team will assist you.'}
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelLoading}
              >
                Keep Subscription
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={handleCancelSubscription}
                disabled={cancelLoading}
              >
                {cancelLoading ? 'Canceling...' : 'Yes, Cancel'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Current Plan & Credits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {subscription ? (
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-navy-900">
                    {subscription.plan_type} Plan
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    Status:{' '}
                    <span className={`font-semibold ${subscription.status === 'active' ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {subscription.cancel_at_period_end ? 'Canceling at period end' : subscription.status}
                    </span>
                  </p>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {subscription.cancel_at_period_end ? 'Cancels on' : 'Renews on'}{' '}
                      {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleManageBilling}
                    disabled={loading}
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {isStripeSub ? 'Manage in Stripe' : 'Manage Subscription'}
                  </Button>
                  {isActiveSubscription && !subscription.cancel_at_period_end && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setShowCancelConfirm(true)}
                      title="Cancel subscription"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-600 mb-4">No active subscription</p>
                <p className="text-sm text-gray-500">Choose a plan below to get started</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Credits Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-4xl font-bold text-emerald-600">
                  {credits?.balance || 0}
                </p>
                <p className="text-sm text-gray-600">Available credits</p>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                <div>
                  <p className="text-sm text-gray-600">Total Purchased</p>
                  <p className="text-lg font-semibold">{credits?.total_purchased || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Used</p>
                  <p className="text-lg font-semibold">{credits?.total_used || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Selection */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-navy-900 mb-4">Choose Your Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(PAYSTACK_PLANS).map((plan) => (
            <PricingCard
              key={plan.type}
              plan={plan}
              currentPlan={subscription?.plan_type}
              onSelect={handleSelectPlan}
              loading={loading}
            />
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent credit transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium text-sm">
                      {transaction.description || transaction.type}
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(transaction.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-semibold ${
                        transaction.amount > 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </p>
                    <p className="text-xs text-gray-600">{transaction.type}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
