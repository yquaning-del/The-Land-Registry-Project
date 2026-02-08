'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { Eye, Download, ChevronLeft, ChevronRight, FileText, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Activity {
  id: string
  parcel_id: string
  status: string
  created_at: string
  ai_confidence_score?: number
  region: string
  mint_status?: string
}

interface ActivityTableProps {
  activities: Activity[]
  loading?: boolean
}

export function ActivityTable({ activities, loading }: ActivityTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(activities.length / itemsPerPage)

  const paginatedActivities = activities.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest land claim submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest land claim submissions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-semibold text-navy-900 mb-2">No Claims Yet</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">
              Start verifying your land titles with AI-powered verification. It only takes a few minutes!
            </p>
            <Link href="/claims/new">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                Submit Your First Claim
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your latest land claim submissions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {paginatedActivities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 border border-white/20 rounded-lg hover:bg-white/80 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-semibold text-navy-900">
                    Parcel ID: {activity.parcel_id}
                  </p>
                  <StatusBadge 
                    status={activity.status} 
                    mintStatus={activity.mint_status}
                    pulse={true}
                  />
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{activity.region}</span>
                  {activity.ai_confidence_score && (
                    <span>
                      Confidence: {(activity.ai_confidence_score * 100).toFixed(0)}%
                    </span>
                  )}
                  <span>{new Date(activity.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/claims/${activity.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                </Link>
                {activity.status === 'MINTED' && (
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-1" />
                    QR
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
