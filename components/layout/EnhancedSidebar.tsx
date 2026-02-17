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
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string | number
  adminOnly?: boolean
  children?: NavItem[]
  description?: string
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Dashboard home and statistics',
  },
  {
    title: 'Setup',
    href: '/dashboard/setup',
    icon: Settings,
    description: 'Platform configuration and getting started',
  },
  {
    title: 'Land Claims',
    href: '/claims',
    icon: FileText,
    description: 'Manage your land claims',
    children: [
      {
        title: 'All Claims',
        href: '/claims',
        icon: FileCheck,
        description: 'View all your claims',
      },
      {
        title: 'New Claim',
        href: '/claims/new',
        icon: Upload,
        description: 'Submit a new claim',
      },
      {
        title: 'Pending',
        href: '/claims?status=pending',
        icon: Clock,
        badge: 3,
        description: 'Claims awaiting verification',
      },
      {
        title: 'Verified',
        href: '/claims?status=verified',
        icon: CheckCircle,
        description: 'Successfully verified claims',
      },
      {
        title: 'Disputed',
        href: '/claims?status=disputed',
        icon: AlertTriangle,
        description: 'Claims with issues',
      },
    ],
  },
  {
    title: 'Verification Queue',
    href: '/verification-queue',
    icon: Shield,
    description: 'AI verification status',
  },
  {
    title: 'Blockchain Ledger',
    href: '/blockchain-ledger',
    icon: Database,
    description: 'On-chain records',
    children: [
      {
        title: 'All Records',
        href: '/blockchain-ledger',
        icon: Database,
        description: 'View blockchain records',
      },
      {
        title: 'Mint NFT',
        href: '/blockchain-ledger/mint',
        icon: Wallet,
        description: 'Mint land title NFT',
      },
    ],
  },
  {
    title: 'Billing & Credits',
    href: '/settings/billing',
    icon: CreditCard,
    description: 'Manage subscription',
    children: [
      {
        title: 'Overview',
        href: '/settings/billing',
        icon: TrendingUp,
        description: 'Usage and balance',
      },
      {
        title: 'Purchase Credits',
        href: '/settings/billing/purchase',
        icon: CreditCard,
        description: 'Buy more credits',
      },
      {
        title: 'Transaction History',
        href: '/settings/billing/history',
        icon: FileText,
        description: 'View past transactions',
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings/profile',
    icon: Settings,
    description: 'Account preferences',
    children: [
      {
        title: 'Profile',
        href: '/settings/profile',
        icon: UserIcon,
        description: 'Personal information',
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: Shield,
        description: 'Password and 2FA',
      },
      {
        title: 'Notifications',
        href: '/settings/notifications',
        icon: AlertTriangle,
        description: 'Email preferences',
      },
    ],
  },
  {
    title: 'Admin Panel',
    href: '/admin',
    icon: Users,
    adminOnly: true,
    description: 'Administrative tools',
    children: [
      {
        title: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Platform overview',
      },
      {
        title: 'All Claims',
        href: '/admin/claims',
        icon: FileText,
        description: 'Review all submissions',
      },
      {
        title: 'User Management',
        href: '/admin/users',
        icon: Users,
        description: 'Manage users',
      },
      {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: TrendingUp,
        description: 'Platform statistics',
      },
    ],
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function EnhancedSidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [expandedItems, setExpandedItems] = useState<string[]>([])

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
                          {child.badge && (
                            <span className="rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                              {child.badge}
                            </span>
                          )}
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
              <p className="text-xs font-medium text-gray-400">Need help?</p>
            </div>
            <Link
              href="/support"
              className="text-sm font-medium text-emerald-500 hover:text-emerald-400 transition-colors"
            >
              Contact Support →
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Link
              href="/"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-navy-800/50 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/dashboard/setup">
              <Button variant="ghost" className="w-full justify-start">
                <Settings className="h-4 w-4 mr-2" />
                Setup
              </Button>
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-gray-400 hover:text-white bg-navy-800/50 hover:bg-navy-800 rounded-lg transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
