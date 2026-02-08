import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET - List all users (admin only)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || !['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(userData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role')

    let query = supabase
      .from('users')
      .select('id, email, full_name, role, credits, created_at, last_sign_in_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`)
    }

    if (role) {
      query = query.eq('role', role)
    }

    const { data: users, error, count } = await query

    if (error) throw error

    return NextResponse.json({
      users: users || [],
      total: count || 0,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status: 500 }
    )
  }
}

// PATCH - Update user role or credits (admin only)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!adminData || !['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(adminData.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { userId, role, credits } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    const updates: any = {}
    if (role) updates.role = role
    if (credits !== undefined) updates.credits = credits

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    return NextResponse.json({ user: updatedUser })
  } catch (error: any) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update user' },
      { status: 500 }
    )
  }
}
