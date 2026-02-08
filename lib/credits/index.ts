import { createClient } from '@/lib/supabase/client'
import { CREDIT_COSTS } from '@/types/paystack.types'

export async function getCreditBalance(userId: string): Promise<number> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('credits')
    .select('balance')
    .eq('user_id', userId)
    .single()

  if (error || !data) {
    return 0
  }

  return data.balance
}

export async function checkCredits(userId: string, required: number = 1): Promise<boolean> {
  const balance = await getCreditBalance(userId)
  return balance >= required
}

export async function deductCreditsForVerification(
  userId: string,
  description: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('deduct_credits_with_cost', {
    p_user_id: userId,
    p_amount: CREDIT_COSTS.VERIFICATION,
    p_type: 'VERIFICATION',
    p_description: description,
    p_reference_id: referenceId,
  })

  if (error) {
    console.error('Failed to deduct verification credits:', error)
    return false
  }

  return data as boolean
}

export async function deductCreditsForMint(
  userId: string,
  description: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('deduct_credits_with_cost', {
    p_user_id: userId,
    p_amount: CREDIT_COSTS.MINT,
    p_type: 'MINT',
    p_description: description,
    p_reference_id: referenceId,
  })

  if (error) {
    console.error('Failed to deduct mint credits:', error)
    return false
  }

  return data as boolean
}

export async function deductCredits(
  userId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<boolean> {
  const supabase = createClient()

  const { data, error } = await supabase.rpc('deduct_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_description: description,
    p_reference_id: referenceId,
  })

  if (error) {
    console.error('Failed to deduct credits:', error)
    return false
  }

  return data as boolean
}

export async function addCredits(
  userId: string,
  amount: number,
  type: 'PURCHASE' | 'BONUS' | 'REFUND' | 'SUBSCRIPTION_GRANT',
  description: string,
  referenceId?: string
): Promise<void> {
  const supabase = createClient()

  await supabase.rpc('add_credits', {
    p_user_id: userId,
    p_amount: amount,
    p_type: type,
    p_description: description,
    p_reference_id: referenceId,
  })
}

export async function getCreditTransactions(userId: string, limit: number = 10) {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Failed to fetch transactions:', error)
    return []
  }

  return data
}
