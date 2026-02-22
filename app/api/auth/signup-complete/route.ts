import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { handleUserSignup } from '@/lib/auth/signup-handler'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      // No session yet — user likely needs to confirm their email first.
      // The DB trigger (handle_new_user_profile + ensure_credits_on_signup) handles
      // profile/credits creation automatically, so nothing is lost.
      return NextResponse.json({ success: true, pending: true })
    }

    const { fullName } = await request.json()

    if (!fullName) {
      return NextResponse.json({ error: 'Full name is required' }, { status: 400 })
    }

    const success = await handleUserSignup(user.id, user.email || '', fullName)

    if (!success) {
      return NextResponse.json({ error: 'Failed to complete signup' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Signup completion error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
