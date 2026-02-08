import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/alerts
 * Fetch user's security alerts
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const limit = parseInt(searchParams.get('limit') || '20')

    let query = supabase
      .from('security_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (unreadOnly) {
      query = query.eq('is_read', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching alerts:', error)
      return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
    }

    // Get unread count
    const { count: unreadCount } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    // Check for critical alerts
    const { count: criticalCount } = await supabase
      .from('security_alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      .in('severity', ['HIGH', 'CRITICAL'])

    return NextResponse.json({
      alerts: data || [],
      unreadCount: unreadCount || 0,
      hasCritical: (criticalCount || 0) > 0,
    })
  } catch (error: any) {
    console.error('Alerts GET error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/alerts
 * Mark alert(s) as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { alertId, markAll } = body

    if (markAll) {
      // Mark all alerts as read
      const { error } = await supabase
        .from('security_alerts')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false)

      if (error) {
        console.error('Error marking all as read:', error)
        return NextResponse.json({ error: 'Failed to update alerts' }, { status: 500 })
      }

      return NextResponse.json({ success: true, message: 'All alerts marked as read' })
    }

    if (!alertId) {
      return NextResponse.json({ error: 'alertId is required' }, { status: 400 })
    }

    // Mark single alert as read
    const { error } = await supabase
      .from('security_alerts')
      .update({ is_read: true })
      .eq('id', alertId)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error marking alert as read:', error)
      return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Alerts PATCH error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update alert' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/alerts
 * Create a new alert (internal use / admin)
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      userId,
      claimId,
      conflictingClaimId,
      alertType,
      severity,
      title,
      message,
      overlapPercentage,
      blockchainHash,
      conflictMapUrl,
      recipientType,
      recipientEmail,
      metadata,
    } = body

    // Validate required fields
    if (!userId || !alertType || !title || !message) {
      return NextResponse.json(
        { error: 'userId, alertType, title, and message are required' },
        { status: 400 }
      )
    }

    // Insert alert
    const { data, error } = await supabase
      .from('security_alerts')
      .insert({
        user_id: userId,
        claim_id: claimId,
        conflicting_claim_id: conflictingClaimId,
        alert_type: alertType,
        severity: severity || 'HIGH',
        title,
        message,
        overlap_percentage: overlapPercentage,
        blockchain_hash: blockchainHash,
        conflict_map_url: conflictMapUrl,
        recipient_type: recipientType || 'BUYER',
        recipient_email: recipientEmail,
        metadata: metadata || {},
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating alert:', error)
      return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      alertId: data?.id,
    })
  } catch (error: any) {
    console.error('Alerts POST error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create alert' },
      { status: 500 }
    )
  }
}
