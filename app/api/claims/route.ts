import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

type LandClaim = {
  id: string
  user_id?: string
  claimant_id?: string
  parcel_id?: string
  owner_name?: string
  location?: string
  latitude?: number | null
  longitude?: number | null
  description?: string
  original_document_url?: string
  document_type?: string
  land_size?: number | null
  verification_status?: string
  status?: string
  created_at?: string
  [key: string]: any
}

// GET - List all claims for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('land_claims')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status) {
      query = query.eq('verification_status', status)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ claims: data })
  } catch (error: any) {
    console.error('Error fetching claims:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch claims' },
      { status: 500 }
    )
  }
}

// POST - Create a new claim
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      parcel_id,
      owner_name,
      location,
      coordinates,
      description,
      original_document_url,
      document_type,
      land_size,
    } = body

    // Validate required fields
    if (!parcel_id || !owner_name || !location) {
      return NextResponse.json(
        { error: 'Missing required fields: parcel_id, owner_name, location' },
        { status: 400 }
      )
    }

    // Check if user has credits for verification
    const { data: hasCredits } = await supabase.rpc('has_sufficient_credits', {
      p_user_id: user.id,
      p_required_amount: 1,
    } as any)

    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits. Please purchase more credits to submit claims.' },
        { status: 402 }
      )
    }

    // Parse coordinates if provided
    let latitude = null
    let longitude = null
    if (coordinates) {
      const coordMatch = coordinates.match(/([\d.]+)°?\s*([NS]),?\s*([\d.]+)°?\s*([EW])/i)
      if (coordMatch) {
        latitude = parseFloat(coordMatch[1]) * (coordMatch[2].toUpperCase() === 'S' ? -1 : 1)
        longitude = parseFloat(coordMatch[3]) * (coordMatch[4].toUpperCase() === 'W' ? -1 : 1)
      }
    }

    // Create the claim
    const { data: claim, error: claimError } = await supabase
      .from('land_claims')
      .insert({
        claimant_id: user.id,
        gps_coordinates: coordinates || `${latitude || 0}, ${longitude || 0}`,
        latitude: latitude || 0,
        longitude: longitude || 0,
        address: location,
        original_document_url: original_document_url || '',
        document_type: document_type || 'Land Title',
        land_size_sqm: land_size || null,
        ai_verification_status: 'PENDING_VERIFICATION',
        country: 'Ghana',
      } as any)
      .select()
      .single()

    if (claimError) throw claimError

    const claimData = claim as LandClaim

    // Deduct 1 credit for the verification
    await supabase.rpc('deduct_credits', {
      p_user_id: user.id,
      p_amount: 1,
      p_type: 'VERIFICATION',
      p_description: `Verification for claim ${claimData.id}`,
      p_reference_id: claimData.id,
    } as any)

    return NextResponse.json({ claim: claimData }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating claim:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create claim' },
      { status: 500 }
    )
  }
}
