'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ServiceStatusCard } from '@/components/ServiceStatusCard'
import { ArrowLeft, CheckCircle, AlertTriangle, Info } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SetupPage() {
  const [credits, setCredits] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const { t } = useLanguage()

  useEffect(() => {
    const checkCredits = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (user) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { data: creditsData } = await (supabase as any)
            .from('credits')
            .select('balance')
            .eq('user_id', user.id)
            .single()

          if (creditsData) {
            setCredits(creditsData.balance)
          }
        }
      } catch (error) {
        console.error('Error checking credits:', error)
      } finally {
        setLoading(false)
      }
    }

    checkCredits()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-navy-900">{t('setup.title')}</h1>
            <p className="text-gray-600">{t('setup.gettingStarted')}</p>
          </div>
        </div>

        {/* Credits Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Your Account Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-4">
                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-r-transparent"></div>
                <p className="mt-2 text-sm text-gray-600">Checking account...</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Credits Available</div>
                  <div className="text-sm text-gray-600">
                    {credits !== null ? (
                      <>
                        You have <span className="font-bold text-emerald-600">{credits}</span> credits
                        {credits === 0 && (
                          <span className="text-amber-600 ml-1">
                            - Purchase credits to start verifying documents
                          </span>
                        )}
                      </>
                    ) : (
                      'Credit balance not available'
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {credits === 0 && (
                    <Link href="/settings/billing">
                      <Button size="sm">{t('billing.purchaseCredits')}</Button>
                    </Link>
                  )}
                  {credits !== null && credits > 0 && (
                    <Link href="/claims/new">
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700">
                        {t('setup.startVerification')}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Service Status */}
        <ServiceStatusCard />

        {/* Getting Started Guide */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              {t('setup.gettingStarted')}
            </CardTitle>
            <CardDescription>
              {t('setup.completeSteps')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium">Configure Required Services</div>
                  <div className="text-sm text-gray-600">
                    Set up Supabase for authentication and database functionality
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium">Get Credits</div>
                  <div className="text-sm text-gray-600">
                    New users get 5 free credits. Purchase more if needed.
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium">{t('setup.submitClaim')}</div>
                  <div className="text-sm text-gray-600">
                    Upload a land document and enter property details
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  4
                </div>
                <div>
                  <div className="font-medium">AI Verification</div>
                  <div className="text-sm text-gray-600">
                    Our AI analyzes your document and provides a trust score
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                  5
                </div>
                <div>
                  <div className="font-medium">Mint NFT Certificate</div>
                  <div className="text-sm text-gray-600">
                    Create a blockchain-secured certificate for your verified title
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex gap-3">
                <Link href="/claims/new">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">
                    Start First Verification
                  </Button>
                </Link>
                <Link href="/docs/platform-deep-dive">
                  <Button variant="outline">
                    View Documentation
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
