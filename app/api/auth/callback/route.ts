import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Auth callback handler.
 *
 * Supabase embeds a one-time `code` in the email confirmation / magic-link URL.
 * This route exchanges that code for a session cookie, then redirects the user
 * to the `next` query param (defaults to /dashboard).
 *
 * emailRedirectTo in sign-up should point here:
 *   `${origin}/api/auth/callback?next=/dashboard`
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.error('Auth callback error:', error.message)
      return NextResponse.redirect(`${origin}/sign-in?error=confirmation_failed`)
    }
  }

  return NextResponse.redirect(`${origin}${next}`)
}
