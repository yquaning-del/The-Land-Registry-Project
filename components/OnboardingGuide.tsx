'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Circle, ArrowRight, Upload, FileText, Shield, Coins } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface OnboardingStep {
  id: string
  title: string
  description: string
  completed: boolean
  action?: {
    text: string
    href: string
  }
}

export function OnboardingGuide() {
  const [steps, setSteps] = useState<OnboardingStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setLoading(false)
          return
        }

        // Check user profile
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()

        // Check credits
        const { data: creditsData } = await supabase
          .from('credits')
          .select('balance')
          .eq('user_id', user.id)
          .single()

        // Check claims
        const { data: claims } = await supabase
          .from('land_claims')
          .select('id')
          .eq('claimant_id', user.id)
          .limit(1)

        const onboardingSteps: OnboardingStep[] = [
          {
            id: 'profile',
            title: 'Complete Your Profile',
            description: 'Add your full name and account details',
            completed: !!profile?.full_name,
            action: !profile?.full_name ? {
              text: 'Complete Profile',
              href: '/settings/profile'
            } : undefined
          },
          {
            id: 'credits',
            title: 'Get Verification Credits',
            description: 'You need credits to verify land documents',
            completed: (creditsData?.balance || 0) > 0,
            action: (creditsData?.balance || 0) === 0 ? {
              text: 'Get Credits',
              href: '/settings/billing'
            } : undefined
          },
          {
            id: 'first-claim',
            title: 'Submit Your First Claim',
            description: 'Upload a land document for verification',
            completed: (claims?.length || 0) > 0,
            action: (claims?.length || 0) === 0 ? {
              text: 'Submit Claim',
              href: '/claims/new'
            } : undefined
          },
          {
            id: 'verify',
            title: 'Verify a Document',
            description: 'Run AI verification on your submitted claim',
            completed: false, // Would need to check verification status
            action: {
              text: 'Start Verification',
              href: '/claims'
            }
          }
        ]

        setSteps(onboardingSteps)
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkOnboardingStatus()
  }, [])

  const completedSteps = steps.filter(s => s.completed).length
  const totalSteps = steps.length
  const isOnboardingComplete = completedSteps === totalSteps

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-emerald-500 border-r-transparent"></div>
        </CardContent>
      </Card>
    )
  }

  if (isOnboardingComplete) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Getting Started
        </CardTitle>
        <CardDescription>
          Complete these steps to get the most out of the platform
        </CardDescription>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {completedSteps}/{totalSteps} Complete
          </Badge>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-1">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-emerald-600" />
              ) : (
                <Circle className="h-5 w-5 text-gray-400" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
                {step.action && (
                  <Button variant="outline" size="sm" asChild>
                    <Link href={step.action.href}>
                      {step.action.text}
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="flex gap-3">
            <Link href="/dashboard/setup">
              <Button variant="outline" className="flex-1">
                View Setup Guide
              </Button>
            </Link>
            <Link href="/docs/platform-deep-dive">
              <Button className="flex-1">
                Read Documentation
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
