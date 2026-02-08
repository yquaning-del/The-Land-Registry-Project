'use client'

import { useEffect, useState, useRef } from 'react'
import { Bell, AlertTriangle, Shield, X, ExternalLink, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SecurityAlert {
  id: string
  alert_type: string
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL'
  title: string
  message: string
  claim_id: string | null
  overlap_percentage: number | null
  conflict_map_url: string | null
  is_read: boolean
  created_at: string
}

export function SecurityAlertsBell() {
  const [alerts, setAlerts] = useState<SecurityAlert[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasCritical, setHasCritical] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAlerts()
    setupRealtimeSubscription()

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadAlerts = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      setLoading(false)
      return
    }

    try {
      // Get unread alerts
      const { data, error } = await supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Error loading alerts:', error)
        return
      }

      const alertsData = (data || []) as SecurityAlert[]
      setAlerts(alertsData)
      setUnreadCount(alertsData.length)
      setHasCritical(alertsData.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH'))
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscription = () => {
    const supabase = createClient()

    const channel = supabase
      .channel('security-alerts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'security_alerts',
        },
        (payload) => {
          const newAlert = payload.new as SecurityAlert
          setAlerts(prev => [newAlert, ...prev].slice(0, 10))
          setUnreadCount(prev => prev + 1)
          if (newAlert.severity === 'CRITICAL' || newAlert.severity === 'HIGH') {
            setHasCritical(true)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (alertId: string) => {
    const supabase = createClient()

    const { error } = await supabase
      .from('security_alerts')
      .update({ is_read: true })
      .eq('id', alertId)

    if (!error) {
      setAlerts(prev => prev.filter(a => a.id !== alertId))
      setUnreadCount(prev => Math.max(0, prev - 1))
      
      // Check if any remaining alerts are critical
      const remaining = alerts.filter(a => a.id !== alertId)
      setHasCritical(remaining.some(a => a.severity === 'CRITICAL' || a.severity === 'HIGH'))
    }
  }

  const markAllAsRead = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from('security_alerts')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)

    if (!error) {
      setAlerts([])
      setUnreadCount(0)
      setHasCritical(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      default:
        return 'bg-yellow-500'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
      case 'HIGH':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Shield className="h-4 w-4 text-yellow-500" />
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className={cn(
          "h-5 w-5 transition-colors",
          hasCritical && "text-red-500"
        )} />
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className={cn(
            "absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold text-white",
            hasCritical ? "bg-red-500" : "bg-orange-500"
          )}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}

        {/* Pulsing Animation for Critical Alerts */}
        {hasCritical && (
          <>
            <span className="absolute -right-0.5 -top-0.5 h-5 w-5 rounded-full bg-red-500 animate-ping opacity-75" />
            <span className="absolute inset-0 rounded-lg animate-pulse ring-2 ring-red-500 ring-opacity-50" />
          </>
        )}
      </Button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-navy-900 text-white">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span className="font-semibold">Security Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-gray-300 hover:text-white transition-colors"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Alerts List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                <div className="animate-spin h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-2" />
                Loading alerts...
              </div>
            ) : alerts.length === 0 ? (
              <div className="p-8 text-center">
                <Shield className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <p className="font-medium text-gray-900">All Clear</p>
                <p className="text-sm text-gray-500">No security alerts at this time</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      {/* Severity Indicator */}
                      <div className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        getSeverityColor(alert.severity)
                      )} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(alert.severity)}
                            <span className="font-medium text-sm text-gray-900 truncate">
                              {alert.title}
                            </span>
                          </div>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(alert.created_at)}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {alert.message}
                        </p>

                        {alert.overlap_percentage && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-xs font-medium",
                              alert.overlap_percentage >= 50
                                ? "bg-red-100 text-red-700"
                                : "bg-orange-100 text-orange-700"
                            )}>
                              {alert.overlap_percentage.toFixed(1)}% overlap
                            </span>
                          </div>
                        )}

                        <div className="mt-3 flex items-center gap-2">
                          {alert.claim_id && (
                            <Link href={`/claims/${alert.claim_id}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                View Claim
                                <ChevronRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                          {alert.conflict_map_url && (
                            <Link href={alert.conflict_map_url}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                Conflict Map
                                <ExternalLink className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          )}
                          <button
                            onClick={() => markAsRead(alert.id)}
                            className="ml-auto p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <Link href="/settings/notifications">
              <Button variant="ghost" size="sm" className="w-full text-sm text-gray-600">
                View All Notifications
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
