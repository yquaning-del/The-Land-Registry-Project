import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email/sender'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      organization,
      message,
      source,
    }: {
      name?: string
      email?: string
      organization?: string
      message?: string
      source?: string
    } = body || {}

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.trim().toLowerCase()
    const emailLooksValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    if (!emailLooksValid) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
    }

    const to = process.env.DEMO_REQUEST_TO || 'contact@landregistry.africa'

    const result = await sendEmail({
      to,
      template: 'requestDemo',
      data: {
        requesterName: name?.trim() || undefined,
        requesterEmail: normalizedEmail,
        requesterOrganization: organization?.trim() || undefined,
        requesterMessage: message?.trim() || undefined,
        requestSource: source || 'pitch',
      },
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send request' }, { status: 500 })
    }

    return NextResponse.json({ success: true, messageId: result.messageId })
  } catch (error: any) {
    console.error('Request demo error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to send request' },
      { status: 500 }
    )
  }
}
