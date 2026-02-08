'use client'

import { cn } from '@/lib/utils'

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
}

export function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      className="relative w-10 h-10 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded-lg"
      aria-label="Toggle menu"
    >
      <div className="w-6 h-5 relative flex flex-col justify-between">
        <span
          className={cn(
            "block h-0.5 w-full bg-navy-900 rounded-full transition-all duration-300 ease-in-out",
            isOpen && "rotate-45 translate-y-2"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-full bg-navy-900 rounded-full transition-all duration-300 ease-in-out",
            isOpen && "opacity-0"
          )}
        />
        <span
          className={cn(
            "block h-0.5 w-full bg-navy-900 rounded-full transition-all duration-300 ease-in-out",
            isOpen && "-rotate-45 -translate-y-2"
          )}
        />
      </div>
    </button>
  )
}
