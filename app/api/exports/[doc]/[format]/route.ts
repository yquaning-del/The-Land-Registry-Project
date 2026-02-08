import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'node:fs/promises'
import path from 'node:path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

type DocId =
  | 'whitepaper'
  | 'one-pager'
  | 'overview'
  | 'pitch'
  | 'pitch-deck'
  | 'platform-deep-dive'
  | 'platform-deck'

type FormatId = 'pdf' | 'word' | 'pptx'

type DocSpec = {
  id: DocId
  routePath: string
  allowed: FormatId[]
  filenameBase: string
  pdfExportQuery?: string
  markdownPath?: string
}

const DOCS: Record<DocId, DocSpec> = {
  whitepaper: {
    id: 'whitepaper',
    routePath: '/whitepaper',
    allowed: ['pdf', 'word'],
    filenameBase: 'whitepaper',
  },
  'one-pager': {
    id: 'one-pager',
    routePath: '/assets/one-pager',
    allowed: ['pdf', 'word'],
    filenameBase: 'one-pager',
  },
  overview: {
    id: 'overview',
    routePath: '/overview',
    allowed: ['pdf', 'word'],
    filenameBase: 'overview',
  },
  pitch: {
    id: 'pitch',
    routePath: '/pitch',
    allowed: ['pdf', 'pptx'],
    filenameBase: 'pitch-deck',
    pdfExportQuery: 'export=1',
  },
  'pitch-deck': {
    id: 'pitch-deck',
    routePath: '/assets/pitch-deck',
    allowed: ['pdf', 'pptx'],
    filenameBase: 'pitch-deck',
    pdfExportQuery: 'export=1',
  },
  'platform-deep-dive': {
    id: 'platform-deep-dive',
    routePath: '/docs/platform-deep-dive',
    allowed: ['pptx'],
    filenameBase: 'platform-deep-dive',
    markdownPath: 'docs/platform-deep-dive.md',
  },
  'platform-deck': {
    id: 'platform-deck',
    routePath: '/docs/platform-deck',
    allowed: ['pptx'],
    filenameBase: 'platform-deck',
    markdownPath: 'docs/platform-deck.md',
  },
}

function getBaseUrl(request: NextRequest) {
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')
  const proto = request.headers.get('x-forwarded-proto') ?? (host?.includes('localhost') ? 'http' : 'https')
  if (!host) return ''
  return `${proto}://${host}`
}

function asDocId(value: string): DocId | null {
  if (value in DOCS) return value as DocId
  return null
}

function asFormatId(value: string): FormatId | null {
  if (value === 'pdf' || value === 'word' || value === 'pptx') return value
  return null
}

type MarkdownSlide = {
  title: string
  bullets: string[]
  notes?: string
}

function normalizeLine(line: string) {
  return line.replace(/\r$/, '')
}

function parseSlidesFromMarkdown(markdown: string): MarkdownSlide[] {
  const lines = markdown.split('\n').map(normalizeLine)

  const slides: MarkdownSlide[] = []

  let current: MarkdownSlide | null = null

  const pushCurrent = () => {
    if (!current) return
    const hasContent = current.title.trim().length > 0
    if (hasContent) slides.push(current)
    current = null
  }

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim()

    const slideHeaderMatch = line.match(/^#{2,6}\s*Slide\s+\d+\s+[—-]\s+(.*)$/i)
    if (slideHeaderMatch) {
      pushCurrent()
      current = { title: slideHeaderMatch[1].trim(), bullets: [] }
      continue
    }

    if (!current) continue

    if (line.startsWith('- ')) {
      current.bullets.push(line.slice(2).trim())
      continue
    }

    if (line.length === 0) continue

    // Allow simple paragraph lines as bullets (keeps mixed tone decks usable)
    if (!line.startsWith('#') && !line.startsWith('```')) {
      current.bullets.push(line)
    }
  }

  pushCurrent()
  return slides
}

function parseSpeakerNotesFromMarkdown(markdown: string): Record<string, string> {
  const lines = markdown.split('\n').map(normalizeLine)
  const notesBySlideTitle: Record<string, string> = {}

  let currentSlideKey: string | null = null
  let buffer: string[] = []

  const flush = () => {
    if (!currentSlideKey) return
    const text = buffer.join('\n').trim()
    if (text) notesBySlideTitle[currentSlideKey] = text
    buffer = []
  }

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i]
    const line = raw.trim()

    const speakerHeader = line.match(/^###\s*Slide\s+\d+\s*$/i)
    if (speakerHeader) {
      flush()
      // Use numeric slide index as temporary key; we later map by order
      currentSlideKey = `slide_${Object.keys(notesBySlideTitle).length + 1}`
      continue
    }

    if (!currentSlideKey) continue

    // Stop collecting if the next major section begins
    if (line.startsWith('## ') && !line.toLowerCase().includes('speaker')) {
      flush()
      currentSlideKey = null
      continue
    }

    buffer.push(raw)
  }

  flush()
  return notesBySlideTitle
}

async function generatePdf(url: string) {
  const { chromium } = await import('playwright')
  const browser = await chromium.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
    })
    return pdf
  } finally {
    await browser.close()
  }
}

async function generateWordHtml(url: string) {
  const html = await fetch(url, { headers: { 'User-Agent': 'LandRegistryExporter/1.0' } }).then((r) => r.text())
  return html
}

function deckOutline(doc: DocId) {
  const common = [
    { title: '[Company Name]: The Infrastructure of Trust', bullets: ['AI + Satellite + Blockchain', 'HITL governance', 'PMP-certified methodology'] },
    { title: 'The Trillion-Dollar Trust Gap', bullets: ['70% unregistered/incorrect land records', 'Double-selling + forged deeds', '$1T dead capital opportunity'] },
    { title: 'Triangulation Engine', bullets: ['Paper (AI audit)', 'Sky (satellite history)', 'Ledger (immutable vault)'] },
    { title: 'The “Safe Land” Checklist', bullets: ['Indenture scan', 'Survey plan (coordinates)', 'Biometric seller ID', 'GPS-tagged site video', 'Tax clearance'] },
    { title: 'Indenture vs. Title', bullets: ['Fraud happens in the gap', 'Double-selling risk', 'Need digital possession pre-title'] },
    { title: 'Bridging the Indenture-to-Title Gap (5b)', bullets: ['Digital possession (geofence)', 'Chain of custody (audit trail)', 'On-chain anchor (immutable proof)'] },
    { title: 'Command Center', bullets: ['Evidence cards + audit reasoning', 'Spatial conflict alerts', 'Escalation + counter-signing workflow'] },
    { title: 'Risk & Mitigation', bullets: ['Market: double-selling → geofence', 'Technical: forgery → triangulation', 'Governance: offline realities → edge sync'] },
    { title: 'Business Model', bullets: ['SaaS tiers (Starter/Pro/Enterprise)', 'Per-mint anchoring fees', 'Institutional verification pipeline'] },
    { title: 'Roadmap', bullets: ['MVP launch', 'Bank + registry pilots', 'RWA tokenization expansion'] },
    { title: 'Call to Action', bullets: ['Pilot a verification flow', 'Onboard partners', 'Anchor titles on-chain'] },
  ]

  if (doc === 'pitch' || doc === 'pitch-deck') return common
  return common
}

async function generatePptx(doc: DocId) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'

  const theme = {
    headFontFace: 'Calibri',
    bodyFontFace: 'Calibri',
    lang: 'en-US',
  }

  pptx.theme = theme as any

  const themeSlides = deckOutline(doc)

  for (const s of themeSlides) {
    const slide = pptx.addSlide()
    slide.background = { color: '0B1220' }

    slide.addText(s.title, {
      x: 0.6,
      y: 0.5,
      w: 12.1,
      h: 0.8,
      fontFace: 'Calibri',
      fontSize: 30,
      bold: true,
      color: 'FFFFFF',
    })

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.55,
      w: 12.1,
      h: 5.2,
      fill: { color: 'FFFFFF', transparency: 92 },
      line: { color: 'FFFFFF', transparency: 88 },
      radius: 0.18,
    })

    const bulletText = s.bullets.map((b) => `• ${b}`).join('\n')

    slide.addText(bulletText, {
      x: 1.1,
      y: 2.0,
      w: 11.2,
      h: 4.6,
      fontFace: 'Calibri',
      fontSize: 22,
      color: 'E2E8F0',
      valign: 'top',
    })

    slide.addText('Land Registry Platform', {
      x: 0.6,
      y: 6.9,
      w: 12.1,
      h: 0.4,
      fontFace: 'Calibri',
      fontSize: 12,
      color: '94A3B8',
    })
  }

  const buffer = (await pptx.write('nodebuffer')) as Buffer
  return buffer
}

async function generatePptxFromMarkdown(markdownRelativePath: string, includeSpeakerNotes: boolean) {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.layout = 'LAYOUT_WIDE'

  const theme = {
    headFontFace: 'Calibri',
    bodyFontFace: 'Calibri',
    lang: 'en-US',
  }

  pptx.theme = theme as any

  const absolutePath = path.join(process.cwd(), markdownRelativePath)
  const markdown = await readFile(absolutePath, 'utf8')

  const slides = parseSlidesFromMarkdown(markdown)
  const speakerNotes = includeSpeakerNotes ? parseSpeakerNotesFromMarkdown(markdown) : {}

  for (let i = 0; i < slides.length; i += 1) {
    const s = slides[i]
    const slide = pptx.addSlide()
    slide.background = { color: '0B1220' }

    slide.addText(s.title, {
      x: 0.6,
      y: 0.5,
      w: 12.1,
      h: 0.8,
      fontFace: 'Calibri',
      fontSize: 30,
      bold: true,
      color: 'FFFFFF',
    })

    slide.addShape(pptx.ShapeType.roundRect, {
      x: 0.6,
      y: 1.55,
      w: 12.1,
      h: 5.2,
      fill: { color: 'FFFFFF', transparency: 92 },
      line: { color: 'FFFFFF', transparency: 88 },
      radius: 0.18,
    })

    const bulletText = s.bullets.map((b) => `• ${b}`).join('\n')

    slide.addText(bulletText || ' ', {
      x: 1.1,
      y: 2.0,
      w: 11.2,
      h: 4.6,
      fontFace: 'Calibri',
      fontSize: 20,
      color: 'E2E8F0',
      valign: 'top',
    })

    slide.addText('Land Registry Platform', {
      x: 0.6,
      y: 6.9,
      w: 10.0,
      h: 0.4,
      fontFace: 'Calibri',
      fontSize: 12,
      color: '94A3B8',
    })

    slide.addText(`${i + 1} / ${slides.length}`, {
      x: 11.0,
      y: 6.9,
      w: 1.7,
      h: 0.4,
      fontFace: 'Calibri',
      fontSize: 12,
      color: '94A3B8',
      align: 'right',
    })

    if (includeSpeakerNotes) {
      const key = `slide_${i + 1}`
      const notes = speakerNotes[key]
      if (notes) {
        ;(slide as any).addNotes?.(notes)
      }
    }
  }

  const buffer = (await pptx.write('nodebuffer')) as Buffer
  return buffer
}

export async function GET(
  request: NextRequest,
  context: { params: { doc: string; format: string } }
) {
  try {
    const docId = asDocId(context.params.doc)
    const formatId = asFormatId(context.params.format)

    if (!docId || !formatId) {
      return NextResponse.json({ error: 'Invalid export route' }, { status: 404 })
    }

    const spec = DOCS[docId]

    if (!spec.allowed.includes(formatId)) {
      return NextResponse.json(
        { error: `Format ${formatId} not supported for ${docId}` },
        { status: 400 }
      )
    }

    const baseUrl = getBaseUrl(request)
    if (!baseUrl) {
      return NextResponse.json({ error: 'Missing host header' }, { status: 400 })
    }

    const url = new URL(spec.routePath, baseUrl)
    if (formatId === 'pdf' && spec.pdfExportQuery) {
      url.search = spec.pdfExportQuery
    }

    if (formatId === 'pdf') {
      const pdf = await generatePdf(url.toString())
      return new NextResponse(pdf, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${spec.filenameBase}.pdf"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    if (formatId === 'word') {
      const html = await generateWordHtml(url.toString())
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'application/msword; charset=utf-8',
          'Content-Disposition': `attachment; filename="${spec.filenameBase}.doc"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    if (formatId === 'pptx') {
      const markdownPath = spec.markdownPath

      const pptx = markdownPath
        ? await generatePptxFromMarkdown(markdownPath, docId === 'platform-deep-dive')
        : await generatePptx(docId)

      const body = new Uint8Array(pptx)
      return new NextResponse(body, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${spec.filenameBase}.pptx"`,
          'Cache-Control': 'no-store',
        },
      })
    }

    return NextResponse.json({ error: 'Unsupported export format' }, { status: 400 })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error?.message || 'Failed to export document' },
      { status: 500 }
    )
  }
}
