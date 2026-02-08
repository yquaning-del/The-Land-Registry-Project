'use client'

import { useState } from 'react'
import { Check, Zap, Shield, Star } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { PAYSTACK_PLANS, PaystackPlanType } from '@/types/paystack.types'
import { Navbar } from '@/components/Navbar'
import Link from 'next/link'

export default function PricingPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900">
      <Navbar />
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <Zap className="h-4 w-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-semibold">Credit-Based Billing</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
            Choose Your Perfect Plan
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparent pricing with no hidden fees. Pay only for what you use with our flexible credit system.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>1 credit = 1 verification</span>
            </div>
            <span className="hidden sm:block">•</span>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>5 credits = 1 blockchain mint</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {Object.values(PAYSTACK_PLANS).map((plan) => (
            <Card
              key={plan.type}
              className={`relative backdrop-blur-lg border-2 transition-all duration-300 hover:scale-105 ${
                plan.popular
                  ? 'bg-white/10 border-emerald-500 shadow-2xl shadow-emerald-500/20'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-emerald-500 text-white px-4 py-1 text-sm font-semibold">
                    <Star className="h-3 w-3 mr-1 inline" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8 pt-8">
                <CardTitle className="text-2xl font-bold text-white mb-2">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-400 mb-6">
                  {plan.description}
                </CardDescription>
                <div className="mb-4">
                  <span className="text-5xl font-bold text-white">${plan.price}</span>
                  <span className="text-gray-400 ml-2">/month</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-2">
                  <Zap className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400 font-semibold">
                    {plan.credits} credits/month
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>

                <Button
                  onClick={() => handleSelectPlan(plan.type)}
                  disabled={loading === plan.type}
                  className={`w-full py-6 text-lg font-semibold ${
                    plan.popular
                      ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                  }`}
                >
                  {loading === plan.type ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
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

        {/* FAQ Section */}
        <div className="mt-24 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                How do credits work?
              </h3>
              <p className="text-gray-400 text-sm">
                Each verification costs 1 credit, and each blockchain mint costs 5 credits. 
                Credits are automatically deducted when you use the service.
              </p>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Can I change plans?
              </h3>
              <p className="text-gray-400 text-sm">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect 
                at the start of your next billing cycle.
              </p>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Do unused credits roll over?
              </h3>
              <p className="text-gray-400 text-sm">
                No, credits are refreshed monthly and do not roll over. Make sure to use 
                your credits within the billing period.
              </p>
            </div>
            <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                What payment methods do you accept?
              </h3>
              <p className="text-gray-400 text-sm">
                We accept all major payment methods through Paystack including cards, bank 
                transfers, USSD, mobile money, and more.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="backdrop-blur-lg bg-gradient-to-r from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join hundreds of landowners securing their property rights with blockchain technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                  Start Free Trial
                </Button>
              </Link>
              <Link href="/">
                <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 px-8">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
