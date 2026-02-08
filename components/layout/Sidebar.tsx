'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Settings, 
  Users,
  Home,
  CreditCard,
  FolderOpen,
  BarChart3,
  HelpCircle,
  Coins
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  adminOnly?: boolean
}

const navItems: NavItem[] = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'My Claims',
    href: '/claims',
    icon: FolderOpen,
  },
  {
    title: 'Verification Queue',
    href: '/verification-queue',
    icon: Shield,
  },
  {
    title: 'Blockchain Ledger',
    href: '/blockchain-ledger',
    icon: Coins,
  },
  {
    title: 'Billing',
    href: '/settings/billing',
    icon: CreditCard,
  },
  {
    title: 'Settings',
    href: '/settings/profile',
    icon: Settings,
  },
]

const adminItems: NavItem[] = [
  {
    title: 'Claims Review',
    href: '/admin/claims',
    icon: FileText,
    adminOnly: true,
  },
  {
    title: 'Users',
    href: '/admin/users',
    icon: Users,
    adminOnly: true,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart3,
    adminOnly: true,
  },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()

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
          'fixed top-0 left-0 z-50 h-screen w-64 bg-navy-900 text-white transition-transform duration-300 ease-in-out lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-navy-800 px-6">
          <Shield className="h-8 w-8 text-emerald-500" />
          <div>
            <h1 className="text-lg font-bold">Land Registry</h1>
            <p className="text-xs text-gray-400">Blockchain Verified</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          <div className="mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Main</p>
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
                {item.badge && (
                  <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Admin Section */}
          <div className="mt-6 mb-2">
            <p className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Admin</p>
          </div>
          {adminItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'text-gray-300 hover:bg-navy-800 hover:text-white'
                )}
                onClick={onClose}
              >
                <Icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-navy-800 p-4">
          <div className="rounded-lg bg-navy-800 p-3">
            <p className="text-xs font-medium text-gray-400">Need help?</p>
            <Link
              href="/support"
              className="mt-1 text-sm font-medium text-emerald-500 hover:text-emerald-400"
            >
              Contact Support →
            </Link>
          </div>
        </div>
      </aside>
    </>
  )
}
