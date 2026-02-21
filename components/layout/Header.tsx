'use client'

import { useState, useEffect } from 'react'
import { Menu, Coins, User, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ConnectWalletButton } from '@/components/ConnectWalletButton'
import { ThemeToggle } from '@/components/theme/ThemeToggle'
import { LanguageToggle } from '@/components/i18n/LanguageToggle'
import { SecurityAlertsBell } from '@/components/dashboard/SecurityAlertsBell'
import { GlobalSearchBar } from '@/components/search/GlobalSearchBar'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick?: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const [credits, setCredits] = useState<number>(0)
  const [user, setUser] = useState<any>(null)
  const { t } = useLanguage()

  useEffect(() => {
    let channel: any = null
    let supabaseInstance: any = null

    async function loadUserData() {
      try {
        supabaseInstance = createClient()
      } catch (e) {
        console.error('Supabase not configured:', e)
        return
      }
      
      try {
        const { data: { user } } = await supabaseInstance.auth.getUser()
        setUser(user)

        if (user) {
          // Get credits from credits table
          const { data: creditsData } = await supabaseInstance
            .from('credits')
            .select('balance')
            .eq('user_id', user.id)
            .single()

          if (creditsData) {
            setCredits(creditsData.balance)
          }
        }
      } catch (e) {
        console.error('Error loading user data:', e)
      }
    }

    loadUserData()

    // Set up real-time subscription for credits
    try {
      if (!supabaseInstance) supabaseInstance = createClient()
      channel = supabaseInstance
        .channel('credits-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'credits',
          },
          (payload: any) => {
            if (payload.new && 'balance' in payload.new) {
              setCredits(payload.new.balance as number)
            }
          }
        )
        .subscribe()
    } catch (e) {
      console.error('Error setting up realtime:', e)
    }

    return () => {
      if (channel && supabaseInstance) {
        supabaseInstance.removeChannel(channel)
      }
    }
  }, [])

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Search */}
      {user && (
        <div className="flex-1 max-w-sm hidden sm:block">
          <GlobalSearchBar variant="user" />
        </div>
      )}

      {/* Spacer (only when no search shown) */}
      {!user && <div className="flex-1" />}

      {/* Quick Action - New Claim */}
      {user && (
        <Link href="/claims/new">
          <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white hidden sm:flex">
            <Plus className="h-4 w-4 mr-1" />
            {t('nav.newClaim')}
          </Button>
        </Link>
      )}

      {/* Credits display */}
      {user && (
        <Link
          href="/settings/billing"
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 transition-colors hover:bg-emerald-100"
        >
          <Coins className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-semibold text-emerald-900">
            {credits} {credits === 1 ? t('common.credit') : t('common.credits')}
          </span>
        </Link>
      )}

      {/* Security Alerts Bell */}
      {user && <SecurityAlertsBell />}

      {/* Language Toggle */}
      <LanguageToggle />

      {/* Theme Toggle */}
      <ThemeToggle />

      {/* Wallet connection */}
      <ConnectWalletButton />

      {/* User menu */}
      {user && (
        <Link href="/settings/profile">
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      )}
    </header>
  )
}
