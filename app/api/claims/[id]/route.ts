import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LandClaim = {
  id: string
  verification_status?: string
  ai_verification_status?: string
  mint_status?: string
  [key: string]: any
}

// GET - Get a single claim by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: claim, error } = await supabase
      .from('land_claims')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ claim })
  } catch (error: any) {
    console.error('Error fetching claim:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch claim' },
      { status: 500 }
    )
  }
}

// PATCH - Update a claim
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Only allow updating certain fields
    const allowedFields = ['owner_name', 'location', 'description', 'coordinates']
    const updates: Record<string, any> = {}
    
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = body[field]
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Check if claim exists and belongs to user
    const { data: existingClaim } = await supabase
      .from('land_claims')
      .select('ai_verification_status')
      .eq('id', params.id)
      .eq('claimant_id', user.id)
      .single()

    if (!existingClaim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const claimData = existingClaim as LandClaim

    // Don't allow updates to verified claims
    if (claimData.ai_verification_status === 'AI_VERIFIED' || claimData.ai_verification_status === 'APPROVED') {
      return NextResponse.json(
        { error: 'Cannot update a verified claim' },
        { status: 403 }
      )
    }

    const { data: claim, error } = await supabase
      .from('land_claims')
      .update(updates as any)
      .eq('id', params.id)
      .eq('claimant_id', user.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ claim })
  } catch (error: any) {
    console.error('Error updating claim:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update claim' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a claim
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if claim exists and belongs to user
    const { data: existingClaimForDelete } = await supabase
      .from('land_claims')
      .select('ai_verification_status, mint_status')
      .eq('id', params.id)
      .eq('claimant_id', user.id)
      .single()

    if (!existingClaimForDelete) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const deleteClaimData = existingClaimForDelete as LandClaim

    // Don't allow deletion of minted claims
    if (deleteClaimData.mint_status === 'MINTED') {
      return NextResponse.json(
        { error: 'Cannot delete a minted claim' },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from('land_claims')
      .delete()
      .eq('id', params.id)
      .eq('claimant_id', user.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting claim:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to delete claim' },
      { status: 500 }
    )
  }
}
