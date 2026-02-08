import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database.types'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables:', {
      url: supabaseUrl ? 'set' : 'missing',
      key: supabaseAnonKey ? 'set' : 'missing',
    })
  }

  return createBrowserClient<Database>(
    supabaseUrl || '',
    supabaseAnonKey || ''
  )
}
