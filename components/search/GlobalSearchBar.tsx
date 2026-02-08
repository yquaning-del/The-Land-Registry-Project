'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'

interface SearchResult {
  id: string
  parcel_id_barcode: string | null
  ai_verification_status: string
  created_at: string
  claimant_name?: string
  region: string | null
}

export function GlobalSearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query)
      } else {
        setResults([])
        setShowResults(false)
      }
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [query])

  async function performSearch(searchQuery: string) {
    setLoading(true)
    const supabase = createClient()

    try {
      // Search by parcel ID
      const { data: claims } = await supabase
        .from('land_claims')
        .select('id, parcel_id_barcode, ai_verification_status, created_at, claimant_id, region')
        .or(`parcel_id_barcode.ilike.%${searchQuery}%,region.ilike.%${searchQuery}%`)
        .limit(5)

      if (claims) {
        // Get claimant names
        const claimantIds = [...new Set(claims.map(c => c.claimant_id))]
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name')
          .in('id', claimantIds)

        const profileMap = new Map(profiles?.map(p => [p.id, p.full_name]) || [])

        const enrichedResults = claims.map(claim => ({
          ...claim,
          claimant_name: profileMap.get(claim.claimant_id),
        }))

        setResults(enrichedResults)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      APPROVED: 'default',
      MINTED: 'default',
      REJECTED: 'destructive',
      DISPUTED: 'destructive',
      PENDING_VERIFICATION: 'secondary',
      PENDING_HUMAN_REVIEW: 'secondary',
    }
    return <Badge variant={variants[status] || 'secondary'}>{status.replace(/_/g, ' ')}</Badge>
  }

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search by Parcel ID or Region..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          className="pl-10 pr-10"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full backdrop-blur-lg bg-white/95 border border-white/20 rounded-lg shadow-2xl z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            {results.map((result) => (
              <Link
                key={result.id}
                href={`/admin/claims/${result.id}`}
                onClick={() => {
                  setShowResults(false)
                  setQuery('')
                }}
                className="block p-3 hover:bg-emerald-50 rounded-lg transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-navy-900 truncate">
                      {result.parcel_id_barcode || 'No Parcel ID'}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {result.claimant_name || 'Unknown Owner'} • {result.region || 'No Region'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(result.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(result.ai_verification_status)}
                  </div>
                </div>
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              onClick={() => setShowResults(false)}
              className="w-full text-center text-sm text-emerald-600 hover:text-emerald-700 py-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {showResults && results.length === 0 && !loading && query.length >= 2 && (
        <div className="absolute top-full mt-2 w-full backdrop-blur-lg bg-white/95 border border-white/20 rounded-lg shadow-2xl z-50 p-4 text-center text-gray-500">
          No results found for "{query}"
        </div>
      )}
    </div>
  )
}
