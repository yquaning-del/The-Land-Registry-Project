'use client'

import { useState } from 'react'
import { PAYSTACK_PLANS, PaystackPlanType } from '@/types/paystack.types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Check, 
  Star, 
  Zap, 
  CreditCard,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'

export default function PurchaseCreditsPage() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSelectPlan = async (planType: PaystackPlanType) => {
    setLoading(planType)
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
      console.error('Payment initialization error:', error)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/settings/billing" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Billing
          </Link>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Purchase Credits</h1>
          <p className="text-gray-600">Choose a plan that fits your land verification needs</p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {Object.values(PAYSTACK_PLANS).map((plan) => (
            <Card
              key={plan.type}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-emerald-500 shadow-lg shadow-emerald-500/20'
                  : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                  <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-semibold">
                    <Star className="h-3 w-3 mr-1 inline" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-navy-900 mb-2">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600 mb-6">
                  {plan.description}
                </CardDescription>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-navy-900">${plan.price}</span>
                  <span className="text-gray-600 ml-2">/month</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-100 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-semibold text-emerald-700">
                    {plan.credits} credits/month
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.type)}
                  disabled={loading === plan.type}
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {loading === plan.type ? (
                    <>
                      <div className="h-5 w-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    `Get Started with ${plan.name}`
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credit Usage Info */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              How Credits Work
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-semibold text-sm">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Document Verification</p>
                    <p className="text-sm text-gray-600">1 credit per land title document verification</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-emerald-600 font-semibold text-sm">5</span>
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Blockchain Minting</p>
                    <p className="text-sm text-gray-600">5 credits to mint your verified title as an NFT</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">Monthly Refresh</p>
                    <p className="text-sm text-gray-600">Credits refresh on your billing date</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Zap className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-navy-900">No Hidden Fees</p>
                    <p className="text-sm text-gray-600">Pay only for what you use, transparent pricing</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
