'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { ExternalLink, FileText, Shield, Copy, Check } from 'lucide-react'
import Link from 'next/link'

interface MintedClaim {
  id: string
  parcel_id_barcode: string | null
  on_chain_hash: string | null
  minted_at: string | null
  region: string | null
  mint_status: string
}

export default function BlockchainLedgerPage() {
  const { t } = useLanguage()
  const [mintedClaims, setMintedClaims] = useState<MintedClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedHash, setCopiedHash] = useState<string | null>(null)

  useEffect(() => {
    loadMintedClaims()
  }, [])

  async function loadMintedClaims() {
    const supabase = createClient()
    
    const { data: claims } = await supabase
      .from('land_claims')
      .select('id, parcel_id_barcode, on_chain_hash, minted_at, region, mint_status')
      .eq('mint_status', 'MINTED')
      .order('minted_at', { ascending: false })

    if (claims) {
      setMintedClaims(claims)
    }

    setLoading(false)
  }

  const copyToClipboard = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopiedHash(hash)
    setTimeout(() => setCopiedHash(null), 2000)
  }

  const getPolygonScanUrl = (hash: string) => {
    return `https://amoy.polygonscan.com/tx/${hash}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-emerald-50/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-navy-900 mb-2">{t('blockchain.ledger')}</h1>
          <p className="text-gray-600">All minted land titles on the blockchain</p>
        </div>

        <div className="backdrop-blur-lg bg-white/60 border border-white/20 rounded-xl shadow-2xl">
          <Card className="border-0 bg-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-600" />
                {t('blockchain.allRecords')} ({mintedClaims.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : mintedClaims.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No titles minted yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {mintedClaims.map((claim) => (
                    <div
                      key={claim.id}
                      className="p-4 border border-white/20 rounded-lg hover:bg-white/80 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <p className="font-semibold text-navy-900">
                              {claim.parcel_id_barcode || 'No Parcel ID'}
                            </p>
                            <Badge variant="default">
                              <Shield className="h-3 w-3 mr-1" />
                              Minted
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span>{claim.region || 'Unknown Region'}</span>
                            <span>•</span>
                            <span>
                              Minted: {claim.minted_at 
                                ? new Date(claim.minted_at).toLocaleDateString() 
                                : 'Unknown'}
                            </span>
                          </div>
                        </div>
                        <Link href={`/admin/claims/${claim.id}`}>
                          <Button variant="outline" size="sm">
                            {t('common.view')}
                          </Button>
                        </Link>
                      </div>

                      {claim.on_chain_hash && (
                        <div className="mt-3 p-3 bg-navy-900/5 rounded-lg">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-gray-600 mb-1">{t('blockchain.transactionHash')}</p>
                              <p className="text-sm font-mono text-navy-900 truncate">
                                {claim.on_chain_hash}
                              </p>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyToClipboard(claim.on_chain_hash!)}
                              >
                                {copiedHash === claim.on_chain_hash ? (
                                  <Check className="h-4 w-4 text-emerald-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                              <a
                                href={getPolygonScanUrl(claim.on_chain_hash)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
