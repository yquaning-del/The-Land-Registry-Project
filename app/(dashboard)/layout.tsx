import { AppShell } from '@/components/layout/AppShell'
import { DemoModeBanner } from '@/components/DemoModeBanner'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Read server-only env vars here and pass as boolean props — never expose keys to the client
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasPinata = !!(process.env.PINATA_JWT || process.env.PINATA_API_KEY)
  const hasThirdweb = !!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <DemoModeBanner hasOpenAI={hasOpenAI} hasPinata={hasPinata} hasThirdweb={hasThirdweb} />
        {children}
      </div>
    </AppShell>
  )
}
