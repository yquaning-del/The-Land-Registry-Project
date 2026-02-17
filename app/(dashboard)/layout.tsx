import { AppShell } from '@/components/layout/AppShell'
import { DemoModeBanner } from '@/components/DemoModeBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <DemoModeBanner />
        {children}
      </div>
    </AppShell>
  )
}
