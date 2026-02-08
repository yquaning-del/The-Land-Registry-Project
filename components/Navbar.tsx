'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Shield, ChevronDown } from 'lucide-react'
import { ProductsDropdown } from './ProductsDropdown'
import { MobileMenu } from './MobileMenu'
import { HamburgerButton } from './HamburgerButton'
import { cn } from '@/lib/utils'

interface NavbarProps {
  transparent?: boolean
}

export function Navbar({ transparent = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  return (
    <>
      <nav className={cn(
        "sticky top-0 z-50 transition-all duration-300",
        transparent 
          ? "bg-transparent" 
          : "backdrop-blur-lg bg-white/80 border-b border-gray-200/50"
      )}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-emerald-500 rounded-lg group-hover:bg-emerald-600 transition-colors">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy-900">LandRegistry</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              <Link
                href="/"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600 relative",
                  isActive('/') ? "text-emerald-600" : "text-gray-700"
                )}
              >
                Home
                {isActive('/') && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>

              <Link
                href="/about"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600 relative",
                  isActive('/about') ? "text-emerald-600" : "text-gray-700"
                )}
              >
                About Us
                {isActive('/about') && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>

              <ProductsDropdown />

              <Link
                href="/pricing"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600 relative",
                  isActive('/pricing') ? "text-emerald-600" : "text-gray-700"
                )}
              >
                Pricing
                {isActive('/pricing') && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>

              <Link
                href="/whitepaper"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600 relative",
                  isActive('/whitepaper') ? "text-emerald-600" : "text-gray-700"
                )}
              >
                Whitepaper
                {isActive('/whitepaper') && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>

              <Link
                href="/docs"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-emerald-600 relative",
                  isActive('/docs') ? "text-emerald-600" : "text-gray-700"
                )}
              >
                Docs
                {isActive('/docs') && (
                  <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-600 rounded-full" />
                )}
              </Link>
            </div>

            {/* CTAs */}
            <div className="hidden lg:flex items-center gap-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-sm font-medium text-gray-700 hover:text-emerald-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <HamburgerButton
                isOpen={isMobileMenuOpen}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
    </>
  )
}
