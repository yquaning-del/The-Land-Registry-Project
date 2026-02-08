'use client'

import { useState } from 'react'
import { EnhancedSidebar } from './EnhancedSidebar'
import { Header } from './Header'
import { LegalDisclaimer } from '@/components/legal/LegalDisclaimer'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <EnhancedSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-72">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>

        <LegalDisclaimer variant="light" className="bg-white" />
      </div>
    </div>
  )
}
