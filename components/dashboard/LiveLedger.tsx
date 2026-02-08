'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { createClient } from '@/lib/supabase/client'
import { Activity, Loader2 } from 'lucide-react'

interface LiveActivity {
  id: string
  parcel_id_barcode: string | null
  region: string | null
  ai_verification_status: string
  mint_status: string
  created_at: string
}

interface LiveLedgerProps {
  maxItems?: number
  autoScroll?: boolean
}

export function LiveLedger({ maxItems = 15, autoScroll = true }: LiveLedgerProps) {
  const [activities, setActivities] = useState<LiveActivity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInitialActivities()
    setupRealtimeSubscription()
  }, [])

  async function loadInitialActivities() {
    const supabase = createClient()
    
    const { data } = await supabase
      .from('land_claims')
      .select('id, parcel_id_barcode, region, ai_verification_status, mint_status, created_at')
      .order('created_at', { ascending: false })
      .limit(maxItems)

    if (data) {
      setActivities(data)
    }
    setLoading(false)
  }

  function setupRealtimeSubscription() {
    const supabase = createClient()
    
    const channel = supabase
      .channel('platform-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'land_claims',
        },
        (payload) => {
          setActivities((prev) => [payload.new as LiveActivity, ...prev.slice(0, maxItems - 1)])
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'land_claims',
        },
        (payload) => {
          setActivities((prev) =>
            prev.map((a) => (a.id === payload.new.id ? (payload.new as LiveActivity) : a))
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const anonymizeParcelId = (parcelId: string | null) => {
    if (!parcelId) return 'N/A'
    if (parcelId.length <= 5) return parcelId
    
    const parts = parcelId.split('-')
    if (parts.length >= 3) {
      return `${parts[0]}-***-${parts[parts.length - 1]}`
    }
    
    return `${parcelId.slice(0, 3)}***${parcelId.slice(-2)}`
  }

  const getTimeAgo = (timestamp: string) => {
    const now = new Date()
    const then = new Date(timestamp)
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000)

    if (seconds < 60) return 'Just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Card className="backdrop-blur-lg bg-white/60 border border-white/20 shadow-xl h-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-emerald-600" />
          <CardTitle className="text-lg">Live Ledger</CardTitle>
        </div>
        <CardDescription>Platform-wide verification activity</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                className="p-3 rounded-lg border border-gray-200 hover:bg-white/80 transition-all duration-300 fade-slide-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-mono text-sm font-semibold text-navy-900 truncate">
                      {anonymizeParcelId(activity.parcel_id_barcode)}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {activity.region || 'Unknown Region'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {getTimeAgo(activity.created_at)}
                  </span>
                </div>
                <StatusBadge
                  status={activity.ai_verification_status}
                  mintStatus={activity.mint_status}
                  size="sm"
                  pulse={true}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && activities.length === 0 && (
          <div className="text-center py-12">
            <Activity className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">No activity yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
