'use client'

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanDetails } from '@/types/billing.types'
import { PaystackPlanDetails } from '@/types/paystack.types'

interface PricingCardProps {
  plan: PlanDetails | PaystackPlanDetails
  currentPlan?: string
  onSelect: (planType: string) => void
  loading?: boolean
}

export function PricingCard({ plan, currentPlan, onSelect, loading }: PricingCardProps) {
  const isCurrentPlan = currentPlan === plan.type

  return (
    <Card className={`relative ${plan.popular ? 'border-emerald-500 border-2' : ''}`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-emerald-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
            Most Popular
          </span>
        </div>
      )}
      
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription>
          <span className="text-4xl font-bold text-navy-900">${plan.price}</span>
          <span className="text-gray-600">/month</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          {plan.features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          variant={isCurrentPlan ? 'outline' : 'default'}
          onClick={() => onSelect(plan.type)}
          disabled={isCurrentPlan || loading}
        >
          {isCurrentPlan ? 'Current Plan' : `Choose ${plan.name}`}
        </Button>
      </CardContent>
    </Card>
  )
}
