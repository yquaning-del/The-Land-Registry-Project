'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Polygon } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon broken by Next.js asset bundling
const fixLeafletIcon = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
  })
}

interface SingleClaimMapProps {
  lat: number
  lng: number
  /** GeoJSON-order [lng, lat] coordinate pairs — will be flipped for Leaflet */
  polygon?: number[][] | null
  address?: string | null
}

export default function SingleClaimMap({ lat, lng, polygon, address }: SingleClaimMapProps) {
  useEffect(() => {
    fixLeafletIcon()
  }, [])

  // Convert GeoJSON [lng, lat] → Leaflet [lat, lng]
  const leafletPolygon: [number, number][] | null =
    polygon && polygon.length >= 3
      ? polygon.map(coord => [coord[1] ?? coord[0], coord[0]] as [number, number])
      : null

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={16}
      style={{ height: '280px', width: '100%' }}
      scrollWheelZoom={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]} title={address ?? undefined} />
      {leafletPolygon && (
        <Polygon
          positions={leafletPolygon}
          pathOptions={{
            color: '#22c55e',
            weight: 2,
            fillColor: '#22c55e',
            fillOpacity: 0.15,
          }}
        />
      )}
    </MapContainer>
  )
}
