import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppShell } from '@/components/layout/AppShell'
import { DemoModeBanner } from '@/components/DemoModeBanner'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/sign-in')

  // Platform owner always has access — bypass DB role check
  const isPlatformOwner = user.email === (process.env.PLATFORM_OWNER_EMAIL || '')

  if (!isPlatformOwner) {
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    // Only redirect if we KNOW the user's role and it's not an admin role.
    // If the profile query fails (e.g. RLS issue), allow through.
    if (profile && !profileError) {
      if (!['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(profile.role)) {
        redirect('/dashboard')
      }
    }
  }

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
