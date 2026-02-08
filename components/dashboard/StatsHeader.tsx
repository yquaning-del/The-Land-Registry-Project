'use client'

import { useEffect, useState } from 'react'
import { KPICard } from './KPICard'
import { CreditProgress } from './CreditProgress'
import { Shield, Coins, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export function StatsHeader() {
  const [stats, setStats] = useState({
    totalVerified: 0,
    availableCredits: 0,
    activeDisputes: 0,
    totalCredits: 20, // Default to starter plan
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStats()

    // Set up real-time subscription for credits
    const supabase = createClient()
    const channel = supabase
      .channel('stats-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
        },
        (payload) => {
          if (payload.new && 'balance' in payload.new) {
            setStats(prev => ({ ...prev, availableCredits: payload.new.balance as number }))
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'land_claims',
        },
        () => {
          loadStats()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadStats() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Get total verified titles
      const { count: verifiedCount } = await supabase
        .from('land_claims')
        .select('*', { count: 'exact', head: true })
        .in('ai_verification_status', ['APPROVED', 'MINTED'])

      // Get available credits
      const { data: creditsData } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      // Get subscription to determine total credits
      const { data: subscriptionData } = await supabase
        .from('subscriptions')
        .select('plan_type')
        .eq('user_id', user.id)
        .single()

      // Determine total credits based on plan
      const planCredits: Record<string, number> = {
        STARTER: 20,
        PROFESSIONAL: 100,
        ENTERPRISE: 500,
      }
      const totalCredits = subscriptionData?.plan_type 
        ? planCredits[subscriptionData.plan_type] || 20
        : 20

      // Get active disputes
      const { count: disputesCount } = await supabase
        .from('land_claims')
        .select('*', { count: 'exact', head: true })
        .eq('ai_verification_status', 'DISPUTED')

      setStats({
        totalVerified: verifiedCount || 0,
        availableCredits: creditsData?.balance || 0,
        activeDisputes: disputesCount || 0,
        totalCredits,
      })
    }

    setLoading(false)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-xl shadow-xl">
        <KPICard
          title="Total Titles Verified"
          value={stats.totalVerified}
          icon={Shield}
          loading={loading}
        />
      </div>
      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-xl shadow-xl">
        <KPICard
          title="Available Credits"
          value={stats.availableCredits}
          icon={Coins}
          loading={loading}
        />
      </div>
      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-xl shadow-xl">
        <KPICard
          title="Active Disputes"
          value={stats.activeDisputes}
          icon={AlertTriangle}
          loading={loading}
        />
      </div>
      <div className="backdrop-blur-lg bg-white/70 border border-white/20 rounded-xl shadow-xl flex items-center justify-center p-6">
        {loading ? (
          <div className="h-24 w-24 bg-gray-200 animate-pulse rounded-full" />
        ) : (
          <CreditProgress
            current={stats.availableCredits}
            total={stats.totalCredits}
            size={120}
            showPercentage={false}
          />
        )}
      </div>
    </div>
  )
}
