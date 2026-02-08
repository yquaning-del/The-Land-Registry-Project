import Link from 'next/link'
import { Navbar } from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, ExternalLink, FileText, Presentation, Scale, Code } from 'lucide-react'

export default function DocsHubPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-10">
          <div className="max-w-5xl mx-auto">
            <div className="mb-8">
              <div className="text-sm text-slate-600">Documentation</div>
              <h1 className="text-3xl font-bold text-navy-900">Docs & Downloads</h1>
              <p className="mt-2 text-slate-600">
                Central access to platform documents, decks, and export downloads.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Platform Deep-Dive
                  </CardTitle>
                  <CardDescription>
                    Regulators/banks + diaspora buyers narrative pack with speaker notes.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href="/docs/platform-deep-dive">
                    <Button variant="outline">
                      View
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="/api/exports/platform-deep-dive/pptx">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download PPTX
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Presentation className="h-5 w-5" />
                    Platform Deck (20 slides)
                  </CardTitle>
                  <CardDescription>
                    Slides-only version suitable for presentations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href="/docs/platform-deck">
                    <Button variant="outline">
                      View
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                  <a href="/api/exports/platform-deck/pptx">
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Download className="h-4 w-4 mr-2" />
                      Download PPTX
                    </Button>
                  </a>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Scale className="h-5 w-5" />
                    West African Legal Standards
                  </CardTitle>
                  <CardDescription>
                    Reference notes for legal/regulatory context.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href="/docs/west-african-legal-standards">
                    <Button variant="outline">
                      View
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    API Documentation
                  </CardTitle>
                  <CardDescription>
                    Developer reference for platform endpoints.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  <Link href="/docs/api">
                    <Button variant="outline">
                      View
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>

            <div className="mt-10">
              <div className="text-sm text-slate-600 mb-3">Marketing / Investor Assets</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>Whitepaper</CardTitle>
                    <CardDescription>Long-form technical narrative.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Link href="/whitepaper">
                      <Button variant="outline">Open</Button>
                    </Link>
                    <a href="/api/exports/whitepaper/pdf">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </a>
                    <a href="/api/exports/whitepaper/word">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Word
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>One-Pager</CardTitle>
                    <CardDescription>Executive summary one-pager.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Link href="/overview">
                      <Button variant="outline">Open</Button>
                    </Link>
                    <a href="/api/exports/overview/pdf">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </a>
                    <a href="/api/exports/overview/word">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Word
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>Pitch Deck (Investor)</CardTitle>
                    <CardDescription>Investor relations deck.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Link href="/pitch">
                      <Button variant="outline">Open</Button>
                    </Link>
                    <a href="/api/exports/pitch/pdf">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </a>
                    <a href="/api/exports/pitch/pptx">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        PPTX
                      </Button>
                    </a>
                  </CardContent>
                </Card>

                <Card className="border-slate-200">
                  <CardHeader>
                    <CardTitle>Pitch Deck (Marketing)</CardTitle>
                    <CardDescription>Marketing assets deck.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-2">
                    <Link href="/assets/pitch-deck">
                      <Button variant="outline">Open</Button>
                    </Link>
                    <a href="/api/exports/pitch-deck/pdf">
                      <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Download className="h-4 w-4 mr-2" />
                        PDF
                      </Button>
                    </a>
                    <a href="/api/exports/pitch-deck/pptx">
                      <Button variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        PPTX
                      </Button>
                    </a>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
