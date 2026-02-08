'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PricingCard } from '@/components/PricingCard'
import { PAYSTACK_PLANS } from '@/types/paystack.types'
import { createClient } from '@/lib/supabase/client'
import { Coins, CreditCard, Calendar, ExternalLink } from 'lucide-react'

export default function BillingPage() {
  const [subscription, setSubscription] = useState<any>(null)
  const [credits, setCredits] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadBillingData()
  }, [])

  async function loadBillingData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Load subscription
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setSubscription(subData)

      // Load credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .single()
      setCredits(creditsData)

      // Load transactions
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
      if (data.authorization_url) {
        window.location.href = data.authorization_url
      }
    } catch (error) {
      console.error('Checkout error:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleManageBilling() {
    // Paystack doesn't have a customer portal like Stripe
    // Users can manage subscriptions by contacting support or canceling through the dashboard
    alert('To manage your subscription, please contact support or cancel from this page.')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">Billing & Subscription</h1>
        <p className="text-gray-600">Manage your subscription and credits</p>
      </div>

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
                    Status: <span className="font-semibold">{subscription.status}</span>
                  </p>
                </div>
                {subscription.current_period_end && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Renews on {new Date(subscription.current_period_end).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleManageBilling}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Manage Subscription
                </Button>
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
