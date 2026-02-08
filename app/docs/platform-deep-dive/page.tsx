import { readFile } from 'node:fs/promises'
import path from 'node:path'
import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Download, ArrowLeft } from 'lucide-react'

function renderMarkdownPlain(markdown: string) {
  return (
    <pre className="whitespace-pre-wrap break-words text-sm leading-relaxed text-slate-800">
      {markdown}
    </pre>
  )
}

export default async function PlatformDeepDiveDocPage() {
  const absolute = path.join(process.cwd(), 'docs/platform-deep-dive.md')
  const markdown = await readFile(absolute, 'utf8')

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div>
                <div className="text-sm text-slate-600">Docs</div>
                <div className="text-2xl font-bold text-navy-900">Platform Deep-Dive</div>
              </div>
              <div className="flex items-center gap-2">
                <Link href="/docs">
                  <Button variant="outline">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <a href="/api/exports/platform-deep-dive/pptx">
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <Download className="h-4 w-4 mr-2" />
                    Download PPTX
                  </Button>
                </a>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              {renderMarkdownPlain(markdown)}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
