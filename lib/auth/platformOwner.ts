import { createClient } from '@/lib/supabase/server'

// Platform owner email - this user has full access to all platform data
export const PLATFORM_OWNER_EMAIL = 'yquaning@gmail.com'

export async function isPlatformOwner(): Promise<boolean> {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false
  
  // Check if user email matches platform owner
  if (user.email === PLATFORM_OWNER_EMAIL) return true
  
  // Also check database role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  
  return profile?.role === 'PLATFORM_OWNER' || profile?.role === 'SUPER_ADMIN'
}

export async function getPlatformOwnerInfo() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const isOwner = user.email === PLATFORM_OWNER_EMAIL
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()
  
  return {
    user,
    profile,
    isPlatformOwner: isOwner || profile?.role === 'PLATFORM_OWNER',
    isAdmin: profile?.role === 'ADMIN' || profile?.role === 'SUPER_ADMIN' || profile?.role === 'PLATFORM_OWNER',
  }
}

export async function requirePlatformOwner() {
  const isOwner = await isPlatformOwner()
  
  if (!isOwner) {
    throw new Error('Access denied. Platform owner privileges required.')
  }
  
  return true
}
