import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}°, ${lng.toFixed(6)}°`
}

export function getConfidenceColor(score: number): string {
  if (score >= 0.85) return 'text-green-600'
  if (score >= 0.60) return 'text-yellow-600'
  return 'text-red-600'
}

export function getConfidenceBadgeColor(score: number): string {
  if (score >= 0.85) return 'bg-green-100 text-green-800'
  if (score >= 0.60) return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    PENDING_VERIFICATION: 'bg-gray-100 text-gray-800',
    AI_VERIFIED: 'bg-blue-100 text-blue-800',
    PENDING_HUMAN_REVIEW: 'bg-yellow-100 text-yellow-800',
    APPROVED: 'bg-green-100 text-green-800',
    REJECTED: 'bg-red-100 text-red-800',
    DISPUTED: 'bg-orange-100 text-orange-800',
  }
  return statusColors[status] || 'bg-gray-100 text-gray-800'
}
