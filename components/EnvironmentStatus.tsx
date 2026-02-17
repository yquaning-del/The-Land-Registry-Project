'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle, XCircle, Settings, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface ServiceStatus {
  name: string
  key: string
  required: boolean
  status: 'configured' | 'missing' | 'optional'
  description: string
  setupUrl?: string
}

export function EnvironmentStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    const serviceChecks: ServiceStatus[] = [
      {
        name: 'Supabase',
        key: 'NEXT_PUBLIC_SUPABASE_URL',
        required: true,
        status: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'configured' : 'missing',
        description: 'Database and authentication service',
        setupUrl: 'https://supabase.com/dashboard'
      },
      {
        name: 'OpenAI API',
        key: 'OPENAI_API_KEY',
        required: false,
        status: process.env.OPENAI_API_KEY ? 'configured' : 'optional',
        description: 'AI document analysis and fraud detection',
        setupUrl: 'https://platform.openai.com/api-keys'
      },
      {
        name: 'Thirdweb',
        key: 'NEXT_PUBLIC_THIRDWEB_CLIENT_ID',
        required: false,
        status: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID ? 'configured' : 'optional',
        description: 'Blockchain wallet connection and NFT minting',
        setupUrl: 'https://thirdweb.com/dashboard/settings/api-keys'
      },
      {
        name: 'Pinata IPFS',
        key: 'PINATA_JWT',
        required: false,
        status: process.env.PINATA_JWT ? 'configured' : 'optional',
        description: 'Document storage and IPFS pinning',
        setupUrl: 'https://app.pinata.cloud/developers/api-keys'
      },
      {
        name: 'Paystack',
        key: 'PAYSTACK_SECRET_KEY',
        required: false,
        status: process.env.PAYSTACK_SECRET_KEY ? 'configured' : 'optional',
        description: 'Payment processing and billing',
        setupUrl: 'https://dashboard.paystack.com/#/settings/developers'
      },
      {
        name: 'Sentinel Hub',
        key: 'SENTINELHUB_CLIENT_ID',
        required: false,
        status: process.env.SENTINELHUB_CLIENT_ID ? 'configured' : 'optional',
        description: 'Satellite imagery for spatial verification',
        setupUrl: 'https://www.sentinel-hub.com/'
      }
    ]

    setServices(serviceChecks)
  }, [])

  const configuredCount = services.filter(s => s.status === 'configured').length
  const missingRequired = services.filter(s => s.required && s.status === 'missing')
  const hasCriticalIssues = missingRequired.length > 0

  if (!isExpanded && !hasCriticalIssues) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <Card className={hasCriticalIssues ? "border-red-200 bg-red-50" : "border-blue-200 bg-blue-50"}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {hasCriticalIssues ? (
                <AlertTriangle className="h-5 w-5 text-red-600" />
              ) : (
                <Info className="h-5 w-5 text-blue-600" />
              )}
              <CardTitle className="text-sm">
                {hasCriticalIssues ? 'Setup Required' : 'Environment Status'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={hasCriticalIssues ? "destructive" : "secondary"}>
                {configuredCount}/{services.length} Configured
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
          {hasCriticalIssues && (
            <CardDescription className="text-red-700">
              Some required services are not configured. Core functionality may be limited.
            </CardDescription>
          )}
        </CardHeader>
        
        {isExpanded && (
          <CardContent className="space-y-3">
            {services.map((service) => (
              <div key={service.key} className="flex items-center justify-between p-2 rounded-lg border bg-white">
                <div className="flex items-center gap-2">
                  {service.status === 'configured' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : service.required ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  )}
                  <div>
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-600">{service.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    service.status === 'configured' ? 'default' :
                    service.required ? 'destructive' : 'secondary'
                  }>
                    {service.status === 'configured' ? 'Configured' :
                     service.required ? 'Missing' : 'Optional'}
                  </Badge>
                  {service.status !== 'configured' && service.setupUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={service.setupUrl} target="_blank">
                        <Settings className="h-3 w-3" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-2 border-t">
              <div className="text-xs text-gray-600">
                <strong>Tip:</strong> Copy .env.example to .env.local and fill in the required values.
              </div>
              <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                <Link href="/docs/platform-deep-dive">
                  View Setup Documentation
                </Link>
              </Button>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
