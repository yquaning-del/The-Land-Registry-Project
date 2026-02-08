'use client'

import { useEffect, useState, useRef } from 'react'
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet'
import { LatLngExpression, LatLngBounds } from 'leaflet'
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Filter,
  Layers
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { spatialRegistry, LandClaim, ClaimStatus } from '@/services/spatialRegistry'
import { cn } from '@/lib/utils'
import Link from 'next/link'

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css'

interface ClaimMapViewProps {
  region?: string
  highlightClaimId?: string
  onClaimSelect?: (claim: LandClaim) => void
  height?: string
  showLegend?: boolean
  showFilters?: boolean
}

// Map center for Ghana (default)
const DEFAULT_CENTER: LatLngExpression = [7.9465, -1.0232]
const DEFAULT_ZOOM = 7

// Status colors matching the requirements
const STATUS_COLORS: Record<ClaimStatus, string> = {
  VERIFIED_TITLE: '#22c55e',      // Green
  PROTECTED_INDENTURE: '#3b82f6', // Blue
  DETECTED_CONFLICT: '#ef4444',   // Red
  PENDING: '#9ca3af',             // Gray
}

const STATUS_LABELS: Record<ClaimStatus, string> = {
  VERIFIED_TITLE: 'Verified Title',
  PROTECTED_INDENTURE: 'Protected Indenture',
  DETECTED_CONFLICT: 'Conflict Detected',
  PENDING: 'Pending Verification',
}

const STATUS_ICONS: Record<ClaimStatus, React.ReactNode> = {
  VERIFIED_TITLE: <CheckCircle className="h-4 w-4 text-green-500" />,
  PROTECTED_INDENTURE: <Shield className="h-4 w-4 text-blue-500" />,
  DETECTED_CONFLICT: <AlertTriangle className="h-4 w-4 text-red-500" />,
  PENDING: <Clock className="h-4 w-4 text-gray-500" />,
}

// Component to fit map bounds to claims
function FitBounds({ claims }: { claims: LandClaim[] }) {
  const map = useMap()

  useEffect(() => {
    if (claims.length === 0) return

    const allCoords: LatLngExpression[] = []
    claims.forEach(claim => {
      claim.coordinates.forEach(coord => {
        allCoords.push([coord.lat, coord.lng])
      })
    })

    if (allCoords.length > 0) {
      const bounds = new LatLngBounds(allCoords)
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [claims, map])

  return null
}

export function ClaimMapView({
  region,
  highlightClaimId,
  onClaimSelect,
  height = '500px',
  showLegend = true,
  showFilters = true,
}: ClaimMapViewProps) {
  const [claims, setClaims] = useState<LandClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<LandClaim | null>(null)
  const [filter, setFilter] = useState<ClaimStatus | 'ALL'>('ALL')
  const [showOverlaps, setShowOverlaps] = useState(true)

  useEffect(() => {
    loadClaims()
  }, [region])

  const loadClaims = async () => {
    setLoading(true)
    try {
      const data = await spatialRegistry.getClaimsForMap(region)
      setClaims(data)
    } catch (error) {
      console.error('Error loading claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredClaims = filter === 'ALL' 
    ? claims 
    : claims.filter(c => c.status === filter)

  const handleClaimClick = (claim: LandClaim) => {
    setSelectedClaim(claim)
    onClaimSelect?.(claim)
  }

  const getPolygonPositions = (coordinates: { lat: number; lng: number }[]): LatLngExpression[] => {
    return coordinates.map(c => [c.lat, c.lng] as LatLngExpression)
  }

  // Count claims by status
  const statusCounts = claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + 1
    return acc
  }, {} as Record<ClaimStatus, number>)

  return (
    <div className="relative rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-navy-900">Land Claims Map</h3>
            <p className="text-sm text-gray-500">
              {claims.length} claims • {statusCounts.DETECTED_CONFLICT || 0} conflicts
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={loadClaims}
              disabled={loading}
            >
              <RefreshCw className={cn("h-4 w-4 mr-1", loading && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-3">
            <Filter className="h-4 w-4 text-gray-400" />
            <div className="flex gap-1">
              {(['ALL', 'VERIFIED_TITLE', 'PROTECTED_INDENTURE', 'DETECTED_CONFLICT', 'PENDING'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={cn(
                    "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                    filter === status
                      ? status === 'ALL'
                        ? "bg-gray-800 text-white"
                        : `text-white`
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                  style={filter === status && status !== 'ALL' ? { backgroundColor: STATUS_COLORS[status] } : {}}
                >
                  {status === 'ALL' ? 'All' : STATUS_LABELS[status]}
                  {status !== 'ALL' && statusCounts[status] ? ` (${statusCounts[status]})` : ''}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{ height }}>
        {typeof window !== 'undefined' && (
          <MapContainer
            center={DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Fit bounds to claims */}
            <FitBounds claims={filteredClaims} />

            {/* Render claim polygons */}
            {filteredClaims.map((claim) => {
              if (claim.coordinates.length < 3) return null

              const isHighlighted = claim.id === highlightClaimId
              const color = STATUS_COLORS[claim.status]

              return (
                <Polygon
                  key={claim.id}
                  positions={getPolygonPositions(claim.coordinates)}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: isHighlighted ? 0.6 : 0.3,
                    weight: isHighlighted ? 3 : 2,
                    dashArray: claim.status === 'DETECTED_CONFLICT' ? '5, 5' : undefined,
                  }}
                  eventHandlers={{
                    click: () => handleClaimClick(claim),
                  }}
                >
                  <Popup>
                    <ClaimPopup claim={claim} />
                  </Popup>
                </Polygon>
              )
            })}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="h-4 w-4 text-gray-500" />
            <span className="text-xs font-semibold text-gray-700">Legend</span>
          </div>
          <div className="space-y-1.5">
            {(Object.keys(STATUS_COLORS) as ClaimStatus[]).map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: STATUS_COLORS[status] }}
                />
                <span className="text-xs text-gray-600">{STATUS_LABELS[status]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-[1001]">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
            <span className="text-gray-600">Loading claims...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Popup content for claim details
function ClaimPopup({ claim }: { claim: LandClaim }) {
  return (
    <div className="min-w-[200px]">
      <div className="flex items-center gap-2 mb-2">
        {STATUS_ICONS[claim.status]}
        <span className="font-semibold text-sm">{STATUS_LABELS[claim.status]}</span>
      </div>

      <div className="space-y-1 text-xs text-gray-600">
        {claim.sellerName && (
          <div>
            <span className="font-medium">Seller:</span> {claim.sellerName}
          </div>
        )}
        <div>
          <span className="font-medium">Claimed:</span>{' '}
          {new Date(claim.createdAt).toLocaleDateString()}
        </div>
        {claim.onChainHash && (
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-blue-500" />
            <span className="text-blue-600">Blockchain Protected</span>
          </div>
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-gray-100">
        <Link href={`/claims/${claim.id}`}>
          <Button size="sm" variant="outline" className="w-full text-xs">
            View Details
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

// Compact map view for dashboard
export function CompactClaimMap({
  claims,
  height = '300px',
}: {
  claims: LandClaim[]
  height?: string
}) {
  const getPolygonPositions = (coordinates: { lat: number; lng: number }[]): LatLngExpression[] => {
    return coordinates.map(c => [c.lat, c.lng] as LatLngExpression)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      {typeof window !== 'undefined' && (
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          zoomControl={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds claims={claims} />
          {claims.map((claim) => {
            if (claim.coordinates.length < 3) return null
            const color = STATUS_COLORS[claim.status]
            return (
              <Polygon
                key={claim.id}
                positions={getPolygonPositions(claim.coordinates)}
                pathOptions={{
                  color,
                  fillColor: color,
                  fillOpacity: 0.3,
                  weight: 2,
                }}
              />
            )
          })}
        </MapContainer>
      )}
    </div>
  )
}
