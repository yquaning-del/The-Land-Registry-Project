'use client'

import { useEffect, useState } from 'react'
import { Coins } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export function CreditBalance() {
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCredits()

    // Set up real-time subscription
    const supabase = createClient()
    const channel = supabase
      .channel('credits-balance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'credits',
        },
        (payload) => {
          if (payload.new && 'balance' in payload.new) {
            setCredits(payload.new.balance as number)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  async function loadCredits() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setCredits(data.balance)
      }
    }
    setLoading(false)
  }

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
