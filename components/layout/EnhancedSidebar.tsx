'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Settings, 
  Users,
  Home,
  CreditCard,
  Upload,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Database,
  Wallet,
  FileCheck,
  ChevronDown,
  ChevronRight,
  HelpCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useLanguage } from '@/lib/i18n/LanguageProvider'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  adminOnly?: boolean
  children?: NavItem[]
  description?: string
}

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function EnhancedSidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t } = useLanguage()
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [pendingCount, setPendingCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)

  const navItems = useMemo<NavItem[]>(() => [
    {
      title: t('nav.overview'),
      href: '/dashboard',
      icon: LayoutDashboard,
      description: t('dashboard.commandCenter'),
    },
    {
      title: t('nav.setup'),
      href: '/setup',
      icon: Settings,
      description: t('setup.gettingStarted'),
    },
    {
      title: t('nav.landClaims'),
      href: '/claims',
      icon: FileText,
      description: t('claims.landClaims'),
      children: [
        { title: t('nav.allClaims'), href: '/claims', icon: FileCheck, description: t('claims.allClaims') },
        { title: t('nav.newClaim'), href: '/claims/new', icon: Upload, description: t('claims.newClaim') },
        { title: t('nav.pendingClaims'), href: '/claims?status=pending', icon: Clock, description: t('claims.pending') },
        { title: t('nav.verifiedClaims'), href: '/claims?status=verified', icon: CheckCircle, description: t('claims.verified') },
        { title: t('nav.disputedClaims'), href: '/claims?status=disputed', icon: AlertTriangle, description: t('claims.disputed') },
      ],
    },
    {
      title: t('nav.verificationQueue'),
      href: '/verification-queue',
      icon: Shield,
      description: t('verification.verificationQueue'),
    },
    {
      title: t('nav.blockchainLedger'),
      href: '/blockchain-ledger',
      icon: Database,
      description: t('blockchain.ledger'),
      children: [
        { title: t('nav.allRecords'), href: '/blockchain-ledger', icon: Database, description: t('blockchain.allRecords') },
        { title: t('nav.mintNFT'), href: '/blockchain-ledger/mint', icon: Wallet, description: t('blockchain.mintNFT') },
      ],
    },
    {
      title: t('nav.billingCredits'),
      href: '/settings/billing',
      icon: CreditCard,
      description: t('billing.billingCredits'),
      children: [
        { title: t('nav.overview'), href: '/settings/billing', icon: TrendingUp, description: t('billing.currentPlan') },
        { title: t('nav.purchaseCredits'), href: '/settings/billing/purchase', icon: CreditCard, description: t('billing.purchaseCredits') },
        { title: t('nav.transactionHistory'), href: '/settings/billing/history', icon: FileText, description: t('billing.transactionHistory') },
      ],
    },
    {
      title: t('common.settings'),
      href: '/settings/profile',
      icon: Settings,
      description: t('common.settings'),
      children: [
        { title: t('common.profile'), href: '/settings/profile', icon: UserIcon, description: t('common.profile') },
        { title: t('common.security'), href: '/settings/security', icon: Shield, description: t('common.security') },
        { title: t('common.notifications'), href: '/settings/notifications', icon: AlertTriangle, description: t('common.notifications') },
      ],
    },
    {
      title: t('nav.adminPanel'),
      href: '/admin',
      icon: Users,
      adminOnly: true,
      description: t('admin.adminDashboard'),
      children: [
        { title: t('nav.adminDashboard'), href: '/admin', icon: LayoutDashboard, description: t('admin.adminDashboard') },
        { title: t('nav.allClaims'), href: '/admin/claims', icon: FileText, description: t('admin.claimsReview') },
        { title: t('nav.userManagement'), href: '/admin/users', icon: Users, description: t('admin.userManagement') },
        { title: t('nav.analytics'), href: '/admin/analytics', icon: TrendingUp, description: t('admin.analytics') },
        { title: t('nav.conflicts'), href: '/admin/conflicts', icon: AlertTriangle, description: t('admin.conflicts') },
      ],
    },
  ], [t])

  // Fetch user data: role (for admin nav visibility) + pending claim count (for badge)
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return

      // Check admin role via DB
      supabase
        .from('user_profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()
        .then(({ data: profile }) => {
          if (profile && ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(profile.role)) {
            setIsAdmin(true)
          }
        })

      // Email bypass for platform owner (resilience: works even if DB role not yet set)
      const ownerEmail = process.env.NEXT_PUBLIC_PLATFORM_OWNER_EMAIL
      if (ownerEmail && data.user.email === ownerEmail) {
        setIsAdmin(true)
      }

      // Pending claim count badge
      supabase
        .from('land_claims')
        .select('*', { count: 'exact', head: true })
        .eq('claimant_id', data.user.id)
        .eq('ai_verification_status', 'PENDING_VERIFICATION')
        .then(({ count }) => {
          if (count != null && count > 0) setPendingCount(count)
        })
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const toggleExpand = (href: string) => {
    setExpandedItems(prev => 
      prev.includes(href) 
        ? prev.filter(item => item !== href)
        : [...prev, href]
    )
  }

  const isActive = (href: string) => {
    return pathname === href || pathname?.startsWith(href + '/')
  }

  const isExpanded = (href: string) => {
    return expandedItems.includes(href) || 
           (pathname?.startsWith(href) && href !== '/dashboard')
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-screen w-72 bg-gradient-to-b from-navy-900 to-navy-950 text-white transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-navy-800 px-6 flex-shrink-0">
          <Shield className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-lg font-bold">Land Registry</h1>
            <p className="text-xs text-gray-400">Blockchain Verified</p>
          </div>
        </div>

        {/* Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            const Icon = item.icon
            const hasChildren = item.children && item.children.length > 0
            const expanded = isExpanded(item.href)
            const active = isActive(item.href)

            return (
              <div key={item.href}>
                {/* Parent Item */}
                <div className="relative group">
                  <Link
                    href={hasChildren ? '#' : item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                      active
                        ? 'bg-emerald-500/10 text-emerald-500 shadow-lg shadow-emerald-500/20'
                        : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                    )}
                    onClick={(e) => {
                      if (hasChildren) {
                        e.preventDefault()
                        toggleExpand(item.href)
                      } else {
                        onClose?.()
                      }
                    }}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.title}</span>
                        {item.badge && (
                          <span className="ml-2 rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    {hasChildren && (
                      <div className="flex-shrink-0">
                        {expanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </div>
                    )}
                  </Link>
                  
                  {/* Tooltip on hover */}
                  {item.description && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-navy-800 text-xs text-gray-300 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
                      {item.description}
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-navy-800" />
                    </div>
                  )}
                </div>

                {/* Children Items */}
                {hasChildren && expanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-navy-800 pl-4">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon
                      const childActive = isActive(child.href)

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200',
                            childActive
                              ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                              : 'text-gray-400 hover:bg-navy-800 hover:text-white'
                          )}
                          onClick={onClose}
                        >
                          <ChildIcon className="h-4 w-4 flex-shrink-0" />
                          <span className="flex-1 truncate">{child.title}</span>
                          {/* Dynamic pending badge; static badge fallback for other items */}
                          {child.href === '/claims?status=pending' ? (
                            pendingCount > 0 && (
                              <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                                {pendingCount}
                              </span>
                            )
                          ) : child.badge ? (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                              {child.badge}
                            </span>
                          ) : null}
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer - Fixed at bottom */}
        <div className="border-t border-navy-800 p-4 flex-shrink-0 space-y-3">
          {/* Help Section */}
          <div className="rounded-lg bg-navy-800/50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-emerald-500" />
              <p className="text-xs font-medium text-gray-400">{t('common.needHelp')}</p>
            </div>
            <Link
              href="/support"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              {t('common.contactSupport')} →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-navy-800/50 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>{t('common.home')}</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-navy-800/50 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>{t('common.logout')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
