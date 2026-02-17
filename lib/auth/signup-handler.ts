import { createClient } from '@/lib/supabase/client'
import { addCredits } from '@/lib/credits'

export async function handleUserSignup(userId: string, email: string, fullName: string) {
  try {
    // Create user profile
    const supabase = createClient()
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: fullName,
        email: email,
        role: 'CLAIMANT',
        country_code: 'GH', // Default to Ghana
      })

    if (profileError) {
      console.error('Error creating user profile:', profileError)
      return false
    }

    // Grant initial credits for new users
    try {
      await addCredits(
        userId,
        5, // 5 free credits for new users
        'BONUS',
        'Welcome bonus - 5 free credits to get started'
      )
      console.log('Granted 5 initial credits to new user:', userId)
    } catch (creditError) {
      console.error('Error granting initial credits:', creditError)
      // Don't fail the signup if credit grant fails
    }

    return true
  } catch (error) {
    console.error('Error in signup handler:', error)
    return false
  }
}
