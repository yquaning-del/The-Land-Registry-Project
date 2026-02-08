'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { X, Eye, Satellite, Lock } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const pathname = usePathname()

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const isActive = (path: string) => pathname === path

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Menu Panel */}
      <div
        className={cn(
          "fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white z-50 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-navy-900">Menu</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 mb-8">
            <Link
              href="/"
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                isActive('/') 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Home
            </Link>

            <Link
              href="/about"
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                isActive('/about') 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              About Us
            </Link>

            {/* Products Section */}
            <div className="py-2">
              <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Products
              </p>
              <div className="space-y-1">
                <Link
                  href="/products/verification"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Eye className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-medium">Verification Agent</div>
                    <div className="text-xs text-gray-500">AI-powered OCR</div>
                  </div>
                </Link>
                <Link
                  href="/products/satellite"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Satellite className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-medium">Satellite Sync</div>
                    <div className="text-xs text-gray-500">GPS verification</div>
                  </div>
                </Link>
                <Link
                  href="/products/registry"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Lock className="h-5 w-5 text-emerald-600" />
                  <div>
                    <div className="font-medium">On-Chain Registry</div>
                    <div className="text-xs text-gray-500">Blockchain ledger</div>
                  </div>
                </Link>
              </div>
            </div>

            <Link
              href="/pricing"
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                isActive('/pricing') 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Pricing
            </Link>

            <Link
              href="/whitepaper"
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                isActive('/whitepaper') 
                  ? "bg-emerald-50 text-emerald-600" 
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Whitepaper
            </Link>

            <Link
              href="/docs"
              onClick={onClose}
              className={cn(
                "block px-4 py-3 rounded-lg text-base font-medium transition-colors",
                isActive('/docs')
                  ? "bg-emerald-50 text-emerald-600"
                  : "text-gray-700 hover:bg-gray-50"
              )}
            >
              Docs
            </Link>
          </nav>

          {/* CTAs */}
          <div className="space-y-3 pt-6 border-t border-gray-200">
            <Link href="/sign-in" onClick={onClose} className="block">
              <Button variant="outline" className="w-full">
                Sign In
              </Button>
            </Link>
            <Link href="/sign-up" onClick={onClose} className="block">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
