'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function CreditBalance() {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    let channel: ReturnType<typeof supabase.channel> | undefined
    let mounted = true

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!mounted || !user) { setLoading(false); return }

      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()
      if (!mounted) return
      if (data) setCredits(data.balance)
      setLoading(false)

      // Filtered realtime subscription — only listens for current user's row
      channel = supabase
        .channel(`credits-balance-${user.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'credits', filter: `user_id=eq.${user.id}` },
          (payload) => {
            if (mounted && payload.new && 'balance' in payload.new) {
              setCredits(payload.new.balance as number)
            }
          }
        )
        .subscribe()
    }

    init()
    return () => {
      mounted = false
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-gray-50">
        <Coins className="h-4 w-4 text-gray-400 animate-pulse" />
        <span className="text-sm text-gray-400">...</span>
      </div>
    )
  }

  return (
    <Link
      href="/settings/billing"
      className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 transition-colors hover:bg-emerald-100"
    >
      <Coins className="h-4 w-4 text-emerald-600" />
      <span className="text-sm font-semibold text-emerald-900">
        {credits} {credits === 1 ? 'Credit' : 'Credits'}
      </span>
    </Link>
  )
}
