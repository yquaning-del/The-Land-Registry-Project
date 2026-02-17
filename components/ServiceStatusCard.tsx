'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, AlertTriangle, Settings } from 'lucide-react'
import Link from 'next/link'

interface ServiceConfig {
  name: string
  configured: boolean
  required: boolean
  description: string
  setupUrl?: string
}

export function ServiceStatusCard() {
  const [services, setServices] = useState<ServiceConfig[]>([])

  useEffect(() => {
    const checkServices = () => {
      const services: ServiceConfig[] = [
        {
          name: 'Authentication',
          configured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
          required: true,
          description: 'User authentication and database',
          setupUrl: '/docs/platform-deep-dive'
        },
        {
          name: 'AI Verification',
          configured: !!process.env.OPENAI_API_KEY,
          required: false,
          description: 'Document analysis and fraud detection',
          setupUrl: '/docs/platform-deep-dive'
        },
        {
          name: 'Document Storage',
          configured: !!process.env.PINATA_JWT,
          required: false,
          description: 'IPFS document storage',
          setupUrl: '/docs/platform-deep-dive'
        },
        {
          name: 'Blockchain',
          configured: !!process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
          required: false,
          description: 'NFT minting and blockchain features',
          setupUrl: '/docs/platform-deep-dive'
        },
        {
          name: 'Payments',
          configured: !!process.env.PAYSTACK_SECRET_KEY,
          required: false,
          description: 'Billing and subscription management',
          setupUrl: '/docs/platform-deep-dive'
        },
        {
          name: 'Satellite Imagery',
          configured: !!process.env.SENTINELHUB_CLIENT_ID,
          required: false,
          description: 'Spatial verification with satellite data',
          setupUrl: '/docs/platform-deep-dive'
        }
      ]

      setServices(services)
    }

    checkServices()
  }, [])

  const configuredCount = services.filter(s => s.configured).length
  const requiredMissing = services.filter(s => s.required && !s.configured).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Service Configuration
        </CardTitle>
        <CardDescription>
          Platform services status and configuration
        </CardDescription>
        <div className="flex items-center gap-2">
          <Badge variant={configuredCount === services.length ? "default" : "secondary"}>
            {configuredCount}/{services.length} Configured
          </Badge>
          {requiredMissing > 0 && (
            <Badge variant="destructive">
              {requiredMissing} Required Missing
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
            <div className="flex items-center gap-3">
              {service.configured ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : service.required ? (
                <XCircle className="h-5 w-5 text-red-600" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              )}
              <div>
                <div className="font-medium">{service.name}</div>
                <div className="text-sm text-gray-600">{service.description}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={
                service.configured ? 'default' :
                service.required ? 'destructive' : 'secondary'
              }>
                {service.configured ? 'Configured' : 
                 service.required ? 'Required' : 'Optional'}
              </Badge>
              {!service.configured && service.setupUrl && (
                <Button variant="outline" size="sm" asChild>
                  <Link href={service.setupUrl}>
                    Setup
                  </Link>
                </Button>
              )}
            </div>
          </div>
        ))}
        
        <div className="pt-4 border-t">
          <div className="text-sm text-gray-600">
            <p><strong>Note:</strong> Configure services in your .env.local file based on .env.example</p>
            <p className="mt-1">Some features may be limited when optional services are not configured.</p>
          </div>
          <Button variant="outline" className="mt-3 w-full" asChild>
            <Link href="/docs/platform-deep-dive">
              View Setup Documentation
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
