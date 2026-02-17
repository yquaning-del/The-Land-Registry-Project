import { createClient } from '@/lib/supabase/client'

/**
 * Ensures user profile and credits exist after signup.
 * DB triggers (handle_new_user_profile + ensure_credits_on_signup) handle
 * the initial creation automatically. This function is a safety net that
 * updates the full_name if the trigger used an empty string.
 */
export async function handleUserSignup(userId: string, email: string, fullName: string) {
  try {
    const supabase = createClient()

    // Update user_profiles with full_name (trigger may have set it to empty)
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        role: 'CLAIMANT',
        country_code: 'GH',
      }, { onConflict: 'id' })

    if (profileError) {
      console.error('Error upserting user profile:', profileError)
      // Don't fail — the trigger may have already created it
    }

    // Ensure credits row exists (trigger should have created it)
    const { data: creditsData } = await supabase
      .from('credits')
      .select('balance')
      .eq('user_id', userId)
      .single()

    if (!creditsData) {
      // Trigger didn't fire or credits table missing — insert directly
      const { error: creditError } = await supabase
        .from('credits')
        .upsert({
          user_id: userId,
          balance: 5,
          total_purchased: 0,
          total_used: 0,
        }, { onConflict: 'user_id' })

      if (creditError) {
        console.error('Error ensuring credits:', creditError)
      }
    }

    return true
  } catch (error) {
    console.error('Error in signup handler:', error)
    return false
  }
}
