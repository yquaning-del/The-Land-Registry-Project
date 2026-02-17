'use client'

import { useEffect, useState } from 'react'
import { StatsHeader } from '@/components/dashboard/StatsHeader'
import { CompactIntakeZone } from '@/components/dashboard/CompactIntakeZone'
import { ActivityTable } from '@/components/dashboard/ActivityTable'
import { LiveLedger } from '@/components/dashboard/LiveLedger'
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts'
import { VerificationProgress } from '@/components/dashboard/VerificationProgress'
import { OnboardingGuide } from '@/components/OnboardingGuide'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function DashboardPage() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState<string>('')
  const [isNewUser, setIsNewUser] = useState(false)
  const [activeClaim, setActiveClaim] = useState<any>(null)
  const [hasConflicts, setHasConflicts] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])

  async function loadDashboardData() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get user profile for name
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()
      
      const profileData = profile as { full_name?: string } | null
      setUserName(profileData?.full_name || user.email?.split('@')[0] || 'User')

      // Load claims
      const { data: claims } = await supabase
        .from('land_claims')
        .select('*')
        .eq('claimant_id', user.id)
        .order('created_at', { ascending: false })

      if (claims && claims.length > 0) {
        setActivities(claims.slice(0, 10))
        setIsNewUser(false)
        
        // Find most recent active claim (not minted yet)
        const active = claims.find((c: any) => 
          c.mint_status !== 'MINTED' && 
          c.ai_verification_status !== 'REJECTED'
        )
        if (active) {
          setActiveClaim(active)
        }
        
        // Check for any conflicts
        const conflicted = claims.some((c: any) => 
          c.spatial_conflict_status === 'POTENTIAL_DISPUTE' || 
          c.spatial_conflict_status === 'HIGH_RISK'
        )
        setHasConflicts(conflicted)
      } else {
        setIsNewUser(true)
      }
    }

    setLoading(false)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">
            {getGreeting()}, {userName}! 👋
          </h1>
          <p className="text-gray-600">
            {isNewUser 
              ? "Welcome to Land Registry! Let's get started with your first verification."
              : "Here's your real-time land registry command center."
            }
          </p>
        </div>

        {/* New User Onboarding Banner */}
        {isNewUser && !loading && (
          <div className="mb-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Sparkles className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-xl font-bold mb-1">Get Started with Your First Verification</h2>
                  <p className="text-white/90">
                    You have <strong>5 free credits</strong> to verify land titles. Upload a document to begin!
                  </p>
                </div>
              </div>
              <Link href="/claims/new">
                <Button className="bg-white text-emerald-600 hover:bg-white/90 font-semibold">
                  Submit First Claim
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Conflict Alert Banner */}
        {hasConflicts && !loading && (
          <div className="mb-6 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 flex-shrink-0" />
              <div>
                <h3 className="font-semibold">Spatial Conflict Detected</h3>
                <p className="text-sm text-white/90">
                  One or more of your claims has overlapping coordinates with existing records. 
                  Review required.
                </p>
              </div>
              <Link href="/claims" className="ml-auto">
                <Button size="sm" className="bg-white/20 hover:bg-white/30 text-white border-0">
                  View Claims
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Onboarding Guide */}
        <OnboardingGuide />

        {/* Stats Header with Credit Progress */}
        <StatsHeader />

        {/* Active Claim Verification Progress */}
        {activeClaim && !isNewUser && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-3">Active Verification</h2>
            <VerificationProgress 
              claimId={activeClaim.id} 
              onStepClick={(step) => {
                window.location.href = `/claims/${activeClaim.id}`
              }}
            />
          </div>
        )}

        {/* Dynamic Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          {/* Left Column: Compact Intake Zone - 30% */}
          <div className="lg:col-span-3">
            <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-xl shadow-2xl p-6">
              <CompactIntakeZone />
            </div>
          </div>

          {/* Middle Column: Live Ledger - 30% */}
          <div className="lg:col-span-3">
            <LiveLedger maxItems={15} />
          </div>

          {/* Right Column: My Recent Activity - 40% */}
          <div className="lg:col-span-4">
            <ActivityTable activities={activities} loading={loading} />
          </div>
        </div>

        {/* Analytics Charts Section */}
        {!isNewUser && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-navy-900 mb-4">Analytics & Insights</h2>
            <AnalyticsCharts />
          </div>
        )}
      </div>
    </div>
  )
}
