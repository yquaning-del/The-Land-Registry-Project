import { NextRequest, NextResponse } from 'next/server'

type OCRExtractResponse = {
  text: string
}

function getOpenAIKey() {
  return process.env.OPENAI_API_KEY
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = getOpenAIKey()
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 400 })
    }

    const body = (await request.json()) as { imageDataUrl?: string }
    const imageDataUrl = body?.imageDataUrl

    if (!imageDataUrl || typeof imageDataUrl !== 'string' || !imageDataUrl.startsWith('data:image/')) {
      return NextResponse.json(
        { error: 'imageDataUrl must be a data:image/*;base64,... string' },
        { status: 400 }
      )
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        temperature: 0,
        max_tokens: 1500,
        messages: [
          {
            role: 'system',
            content:
              'You extract text from documents. Return ONLY the extracted text, no commentary, no markdown.',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Extract all text visible in this document image.' },
              { type: 'image_url', image_url: { url: imageDataUrl, detail: 'high' } },
            ],
          },
        ],
      }),
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json({ error: `OpenAI OCR failed: ${res.status} ${text}` }, { status: 502 })
    }

    const data = (await res.json()) as any
    const content = data?.choices?.[0]?.message?.content

    const response: OCRExtractResponse = {
      text: typeof content === 'string' ? content.trim() : '',
    }

    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'OCR extract failed' }, { status: 500 })
  }
}
