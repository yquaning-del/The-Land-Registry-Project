import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const PLATFORM_OWNER_EMAIL = process.env.PLATFORM_OWNER_EMAIL || ''

/** Returns true if the given user is authorised to perform admin actions. */
async function isAuthorisedAdmin(userEmail: string | undefined, userId: string, supabase: Awaited<ReturnType<typeof createClient>>) {
  // Platform owner bypass — no DB query needed
  if (PLATFORM_OWNER_EMAIL && userEmail === PLATFORM_OWNER_EMAIL) return true

  // Fallback: check DB role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', userId)
    .single()

  return !!(profile && ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(profile.role))
}

// GET - List all users with email and last sign-in (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isAuthorisedAdmin(user.email, user.id, supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use admin client to bypass RLS for both queries
    const adminSupabase = createAdminClient()

    // Fetch all profiles (RLS bypassed)
    const { data: profiles, error: profilesError } = await adminSupabase
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    // Fetch auth users for email + last_sign_in_at
    const { data: { users: authUsers }, error: authListError } =
      await adminSupabase.auth.admin.listUsers({ page: 1, perPage: 1000 })

    if (authListError) throw authListError

    // Merge on user id
    const authMap = new Map(authUsers.map(u => [u.id, u]))

    const users = (profiles ?? []).map(profile => {
      const authUser = authMap.get(profile.id)
      return {
        id: profile.id,
        email: authUser?.email ?? '',
        full_name: profile.full_name,
        role: profile.role,
        created_at: profile.created_at,
        last_sign_in_at: authUser?.last_sign_in_at ?? null,
      }
    })

    return NextResponse.json({ users, total: users.length })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch users'
    console.error('Error fetching users:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Update user role (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!await isAuthorisedAdmin(user.email, user.id, supabase)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, role } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const VALID_ROLES = ['CLAIMANT', 'VERIFIER', 'ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER']
    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json({ error: 'Invalid or missing role value' }, { status: 400 })
    }

    // Use admin client so the update bypasses RLS regardless of caller's DB role
    const adminSupabase = createAdminClient()
    const { data: updatedUser, error: updateError } = await adminSupabase
      .from('user_profiles')
      .update({ role })
      .eq('id', userId)
      .select('id, full_name, role, created_at')
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ user: updatedUser })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user'
    console.error('Error updating user:', error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
