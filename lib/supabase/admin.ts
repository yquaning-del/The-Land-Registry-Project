import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database.types'

/**
 * Creates a Supabase client with the service role key.
 * This client bypasses Row Level Security — use only in trusted server-side code.
 * Requires SUPABASE_SERVICE_ROLE_KEY in environment variables.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY. ' +
      'Find your service role key in Supabase Dashboard → Project Settings → API.'
    )
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
