import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { SpatialConflictService } from '@/services/spatialService'

const spatialService = new SpatialConflictService()

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { claimId, indentureHash, biometricHash, timestamp } = body

    if (!claimId || !indentureHash) {
      return NextResponse.json(
        { error: 'claimId and indentureHash are required' },
        { status: 400 }
      )
    }

    // Verify the user owns this claim
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .select('claimant_id, on_chain_hash, mint_status')
      .eq('id', claimId)
      .single()

    if (claimError || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    if ((claim as any).claimant_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Check if already protected
    if ((claim as any).on_chain_hash) {
      return NextResponse.json({
        success: true,
        priorityHash: (claim as any).on_chain_hash,
        blockchainTxHash: null,
        anchoredAt: new Date().toISOString(),
        expiresAt: null,
        message: 'This claim is already protected.',
      })
    }

    // Protect the claim
    const result = await spatialService.protectClaim({
      claimId,
      indentureHash,
      biometricHash,
      timestamp: timestamp || new Date().toISOString(),
    })

    if (!result.success) {
      return NextResponse.json({ error: result.message }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Protect claim error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to protect claim' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const claimId = searchParams.get('claimId')

    if (!claimId) {
      return NextResponse.json(
        { error: 'claimId is required' },
        { status: 400 }
      )
    }

    // Get protection status
    const { data: claim, error } = await supabase
      .from('land_claims')
      .select('on_chain_hash, blockchain_tx_hash, mint_status, minted_at')
      .eq('id', claimId)
      .single()

    if (error || !claim) {
      return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
    }

    const claimData = claim as any

    return NextResponse.json({
      isProtected: !!claimData.on_chain_hash,
      priorityHash: claimData.on_chain_hash,
      blockchainTxHash: claimData.blockchain_tx_hash,
      mintStatus: claimData.mint_status,
      anchoredAt: claimData.minted_at,
    })
  } catch (error: any) {
    console.error('Get protection status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get protection status' },
      { status: 500 }
    )
  }
}
