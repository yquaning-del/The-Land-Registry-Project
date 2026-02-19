import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { analyzeDocumentWithGPT4, isOpenAIConfigured } from '@/lib/ai/openai'

export async function POST(request: NextRequest) {
  try {
    // Auth check — prevent unauthenticated OpenAI credit consumption
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = (await request.json()) as { imageDataUrl?: string }
    const imageDataUrl = body?.imageDataUrl

    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'imageDataUrl must be a data:image/*;base64,... string' },
        { status: 400 }
      )
    }

    // Strip the data URL prefix to get raw base64 for the AI module
    const base64 = imageDataUrl.split(',')[1]
    if (!base64) {
      return NextResponse.json({ error: 'Invalid image data' }, { status: 400 })
    }

    // analyzeDocumentWithGPT4 uses GPT-4o when configured, falls back to regex when not
    const analysis = await analyzeDocumentWithGPT4({ imageBase64: base64 })

    return NextResponse.json({
      text: analysis.extractedText,
      aiPowered: isOpenAIConfigured(),
      fields: {
        ownerName: analysis.granteeName || null,
        grantorName: analysis.grantorName || null,
        parcelId: analysis.parcelId || analysis.plotNumber || null,
        location: analysis.location || null,
        documentType: analysis.documentType || null,
        issueDate: analysis.issueDate || null,
        durationYears: analysis.durationYears || null,
      },
    })
  } catch (error: any) {
    console.error('OCR extract error:', error)
    return NextResponse.json({ error: error?.message || 'OCR extract failed' }, { status: 500 })
  }
}
