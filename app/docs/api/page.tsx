'use client'

import { useState } from 'react'
import { Navbar } from '@/components/Navbar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Code, 
  Copy, 
  Check, 
  Key, 
  Shield, 
  Zap, 
  FileText, 
  Database,
  Globe,
  Lock,
  ChevronRight,
  Terminal
} from 'lucide-react'

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  path: string
  description: string
  auth: boolean
  params?: { name: string; type: string; required: boolean; description: string }[]
  response?: string
}

const endpoints: Record<string, Endpoint[]> = {
  'Authentication': [
    {
      method: 'POST',
      path: '/api/auth/signup',
      description: 'Create a new user account',
      auth: false,
      params: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'User password (min 8 chars)' },
        { name: 'full_name', type: 'string', required: true, description: 'Full name of the user' },
      ],
      response: `{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "session": {
    "access_token": "eyJ...",
    "refresh_token": "..."
  }
}`
    },
    {
      method: 'POST',
      path: '/api/auth/signin',
      description: 'Sign in to existing account',
      auth: false,
      params: [
        { name: 'email', type: 'string', required: true, description: 'User email address' },
        { name: 'password', type: 'string', required: true, description: 'User password' },
      ],
    },
    {
      method: 'POST',
      path: '/api/auth/signout',
      description: 'Sign out current user',
      auth: true,
    },
  ],
  'Land Claims': [
    {
      method: 'GET',
      path: '/api/claims',
      description: 'List all claims for authenticated user',
      auth: true,
      params: [
        { name: 'status', type: 'string', required: false, description: 'Filter by status (PENDING, VERIFIED, DISPUTED)' },
        { name: 'limit', type: 'number', required: false, description: 'Number of results (default: 20)' },
        { name: 'offset', type: 'number', required: false, description: 'Pagination offset' },
      ],
      response: `{
  "claims": [
    {
      "id": "uuid",
      "parcel_id": "GH-ACC-001234",
      "status": "VERIFIED",
      "ai_confidence_score": 0.94,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0
}`
    },
    {
      method: 'POST',
      path: '/api/claims',
      description: 'Submit a new land claim for verification',
      auth: true,
      params: [
        { name: 'document_url', type: 'string', required: true, description: 'URL of uploaded document' },
        { name: 'latitude', type: 'number', required: true, description: 'GPS latitude coordinate' },
        { name: 'longitude', type: 'number', required: true, description: 'GPS longitude coordinate' },
        { name: 'land_size_sqm', type: 'number', required: false, description: 'Land size in square meters' },
        { name: 'address', type: 'string', required: false, description: 'Property address' },
      ],
    },
    {
      method: 'GET',
      path: '/api/claims/:id',
      description: 'Get details of a specific claim',
      auth: true,
    },
    {
      method: 'GET',
      path: '/api/claims/:id/verification',
      description: 'Get AI verification results for a claim',
      auth: true,
      response: `{
  "claim_id": "uuid",
  "status": "VERIFIED",
  "confidence_score": 0.94,
  "agents": [
    {
      "name": "DocumentAnalysisAgent",
      "score": 0.96,
      "findings": ["Valid deed format", "Signatures verified"]
    },
    {
      "name": "SatelliteVerificationAgent", 
      "score": 0.92,
      "findings": ["Boundaries match satellite imagery"]
    }
  ],
  "verified_at": "2024-01-01T00:05:00Z"
}`
    },
  ],
  'Blockchain': [
    {
      method: 'POST',
      path: '/api/blockchain/mint',
      description: 'Mint an NFT for a verified claim',
      auth: true,
      params: [
        { name: 'claim_id', type: 'string', required: true, description: 'ID of the verified claim' },
        { name: 'wallet_address', type: 'string', required: true, description: 'Recipient wallet address' },
      ],
      response: `{
  "transaction_hash": "0x...",
  "token_id": "12345",
  "contract_address": "0x...",
  "explorer_url": "https://polygonscan.com/tx/0x..."
}`
    },
    {
      method: 'GET',
      path: '/api/blockchain/verify/:tokenId',
      description: 'Verify authenticity of a land title NFT',
      auth: false,
    },
  ],
  'Credits': [
    {
      method: 'GET',
      path: '/api/credits/balance',
      description: 'Get current credit balance',
      auth: true,
      response: `{
  "balance": 15,
  "plan": "PROFESSIONAL",
  "monthly_allocation": 100,
  "used_this_month": 85
}`
    },
    {
      method: 'POST',
      path: '/api/credits/purchase',
      description: 'Purchase additional credits',
      auth: true,
      params: [
        { name: 'amount', type: 'number', required: true, description: 'Number of credits to purchase' },
        { name: 'payment_method', type: 'string', required: true, description: 'Payment method ID' },
      ],
    },
  ],
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700',
  POST: 'bg-emerald-100 text-emerald-700',
  PUT: 'bg-yellow-100 text-yellow-700',
  DELETE: 'bg-red-100 text-red-700',
}

export default function APIDocumentationPage() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState('Authentication')

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text)
    setCopiedEndpoint(endpoint)
    setTimeout(() => setCopiedEndpoint(null), 2000)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <Code className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-navy-900">API Documentation</h1>
              <p className="text-gray-600">Integrate Land Registry into your applications</p>
            </div>
          </div>

          {/* Quick Start Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <Card className="border-emerald-200 bg-emerald-50/50">
              <CardContent className="pt-6">
                <Key className="h-8 w-8 text-emerald-600 mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">Get API Key</h3>
                <p className="text-sm text-gray-600">Generate your API key from the dashboard settings.</p>
              </CardContent>
            </Card>
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6">
                <Shield className="h-8 w-8 text-blue-600 mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">Authenticate</h3>
                <p className="text-sm text-gray-600">Include your API key in the Authorization header.</p>
              </CardContent>
            </Card>
            <Card className="border-purple-200 bg-purple-50/50">
              <CardContent className="pt-6">
                <Zap className="h-8 w-8 text-purple-600 mb-3" />
                <h3 className="font-semibold text-navy-900 mb-1">Make Requests</h3>
                <p className="text-sm text-gray-600">Start verifying land titles programmatically.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* API Reference */}
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0 hidden lg:block">
              <div className="sticky top-24">
                <h3 className="font-semibold text-navy-900 mb-4">API Reference</h3>
                <nav className="space-y-1">
                  {Object.keys(endpoints).map((section) => (
                    <button
                      key={section}
                      onClick={() => setActiveSection(section)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                        activeSection === section
                          ? 'bg-emerald-100 text-emerald-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {section === 'Authentication' && <Lock className="h-4 w-4" />}
                        {section === 'Land Claims' && <FileText className="h-4 w-4" />}
                        {section === 'Blockchain' && <Database className="h-4 w-4" />}
                        {section === 'Credits' && <Zap className="h-4 w-4" />}
                        {section}
                      </span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  ))}
                </nav>

                {/* Base URL */}
                <div className="mt-8 p-4 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Base URL</p>
                  <code className="text-sm font-mono text-navy-900">
                    https://api.landregistry.africa/v1
                  </code>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-8">
              {Object.entries(endpoints).map(([section, sectionEndpoints]) => (
                <div key={section} id={section} className={activeSection === section ? '' : 'hidden lg:block'}>
                  <h2 className="text-2xl font-bold text-navy-900 mb-6 flex items-center gap-2">
                    {section === 'Authentication' && <Lock className="h-6 w-6" />}
                    {section === 'Land Claims' && <FileText className="h-6 w-6" />}
                    {section === 'Blockchain' && <Database className="h-6 w-6" />}
                    {section === 'Credits' && <Zap className="h-6 w-6" />}
                    {section}
                  </h2>

                  <div className="space-y-4">
                    {sectionEndpoints.map((endpoint, index) => (
                      <Card key={index} className="overflow-hidden">
                        <CardHeader className="bg-gray-50 border-b">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge className={methodColors[endpoint.method]}>
                                {endpoint.method}
                              </Badge>
                              <code className="text-sm font-mono text-navy-900">
                                {endpoint.path}
                              </code>
                              {endpoint.auth && (
                                <Badge variant="outline" className="text-xs">
                                  <Lock className="h-3 w-3 mr-1" />
                                  Auth Required
                                </Badge>
                              )}
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(endpoint.path, endpoint.path)}
                            >
                              {copiedEndpoint === endpoint.path ? (
                                <Check className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                          <CardDescription className="mt-2">
                            {endpoint.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4">
                          {endpoint.params && endpoint.params.length > 0 && (
                            <div className="mb-4">
                              <h4 className="text-sm font-semibold text-navy-900 mb-2">Parameters</h4>
                              <div className="bg-gray-50 rounded-lg overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b">
                                      <th className="text-left px-4 py-2 text-gray-600">Name</th>
                                      <th className="text-left px-4 py-2 text-gray-600">Type</th>
                                      <th className="text-left px-4 py-2 text-gray-600">Required</th>
                                      <th className="text-left px-4 py-2 text-gray-600">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {endpoint.params.map((param, pIndex) => (
                                      <tr key={pIndex} className="border-b last:border-0">
                                        <td className="px-4 py-2 font-mono text-emerald-600">{param.name}</td>
                                        <td className="px-4 py-2 text-gray-600">{param.type}</td>
                                        <td className="px-4 py-2">
                                          {param.required ? (
                                            <Badge className="bg-red-100 text-red-700">Required</Badge>
                                          ) : (
                                            <Badge variant="outline">Optional</Badge>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-gray-600">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {endpoint.response && (
                            <div>
                              <h4 className="text-sm font-semibold text-navy-900 mb-2">Response Example</h4>
                              <div className="relative">
                                <pre className="bg-navy-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                                  <code>{endpoint.response}</code>
                                </pre>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="absolute top-2 right-2 text-gray-400 hover:text-white"
                                  onClick={() => copyToClipboard(endpoint.response!, `${endpoint.path}-response`)}
                                >
                                  {copiedEndpoint === `${endpoint.path}-response` ? (
                                    <Check className="h-4 w-4 text-emerald-500" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}

              {/* Code Examples */}
              <Card className="mt-12">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Terminal className="h-5 w-5" />
                    Quick Start Example
                  </CardTitle>
                  <CardDescription>
                    Submit a land claim using cURL
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="bg-navy-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{`curl -X POST https://api.landregistry.africa/v1/claims \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "document_url": "https://storage.example.com/deed.pdf",
    "latitude": 5.6037,
    "longitude": -0.1870,
    "land_size_sqm": 500,
    "address": "123 Independence Ave, Accra"
  }'`}</code>
                  </pre>
                </CardContent>
              </Card>

              {/* Rate Limits */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    Rate Limits
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy-900">100</p>
                      <p className="text-sm text-gray-600">Requests per minute (Starter)</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy-900">500</p>
                      <p className="text-sm text-gray-600">Requests per minute (Professional)</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-navy-900">Unlimited</p>
                      <p className="text-sm text-gray-600">Requests per minute (Enterprise)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
