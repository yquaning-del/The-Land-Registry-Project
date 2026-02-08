'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  CheckCircle, 
  AlertTriangle,
  Smartphone,
  Settings
} from 'lucide-react'
import Link from 'next/link'

interface NotificationPreference {
  id: string
  title: string
  description: string
  email: boolean
  push: boolean
  category: string
}

export default function NotificationsPage() {
  const [preferences, setPreferences] = useState<NotificationPreference[]>([
    {
      id: 'claim_verified',
      title: 'Claim Verification Complete',
      description: 'When your land claim verification is complete',
      email: true,
      push: true,
      category: 'Claims'
    },
    {
      id: 'claim_disputed',
      title: 'Claim Issues Detected',
      description: 'When issues are found during claim verification',
      email: true,
      push: true,
      category: 'Claims'
    },
    {
      id: 'payment_successful',
      title: 'Payment Successful',
      description: 'When your credit purchase is successful',
      email: true,
      push: false,
      category: 'Billing'
    },
    {
      id: 'payment_failed',
      title: 'Payment Failed',
      description: 'When a payment fails',
      email: true,
      push: true,
      category: 'Billing'
    },
    {
      id: 'credits_low',
      title: 'Low Credits Alert',
      description: 'When your credits are running low',
      email: true,
      push: false,
      category: 'Billing'
    },
    {
      id: 'security_alert',
      title: 'Security Alerts',
      description: 'Important account security notifications',
      email: true,
      push: true,
      category: 'Security'
    },
    {
      id: 'new_features',
      title: 'New Features',
      description: 'Updates about new platform features',
      email: false,
      push: false,
      category: 'Marketing'
    },
    {
      id: 'newsletter',
      title: 'Monthly Newsletter',
      description: 'Tips, updates, and land registry insights',
      email: false,
      push: false,
      category: 'Marketing'
    }
  ])

  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleToggle = (id: string, type: 'email' | 'push') => {
    setPreferences(prev => 
      prev.map(pref => 
        pref.id === id 
          ? { ...pref, [type]: !pref[type] }
          : pref
      )
    )
  }

  const handleSave = async () => {
    setLoading(true)
    setSuccess('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSuccess('Notification preferences saved successfully')
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupedPreferences = preferences.reduce((acc, pref) => {
    if (!acc[pref.category]) {
      acc[pref.category] = []
    }
    acc[pref.category].push(pref)
    return acc
  }, {} as Record<string, NotificationPreference[]>)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard/settings/profile" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Link>
          <h1 className="text-4xl font-bold text-navy-900 mb-2">Notification Settings</h1>
          <p className="text-gray-600">Manage how and when you receive notifications</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Email Notifications</CardTitle>
              <Mail className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">
                {preferences.filter(p => p.email).length}
              </div>
              <p className="text-xs text-gray-500">Enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Push Notifications</CardTitle>
              <Smartphone className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">
                {preferences.filter(p => p.push).length}
              </div>
              <p className="text-xs text-gray-500">Enabled</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Categories</CardTitle>
              <Settings className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">
                {Object.keys(groupedPreferences).length}
              </div>
              <p className="text-xs text-gray-500">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
              <p className="text-emerald-600">{success}</p>
            </div>
          </div>
        )}

        {/* Notification Preferences */}
        <div className="space-y-6">
          {Object.entries(groupedPreferences).map(([category, categoryPreferences]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  {category}
                </CardTitle>
                <CardDescription>
                  {category === 'Claims' && 'Notifications about your land claims'}
                  {category === 'Billing' && 'Payment and credit notifications'}
                  {category === 'Security' && 'Account security alerts'}
                  {category === 'Marketing' && 'Product updates and newsletters'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryPreferences.map((preference) => (
                    <div key={preference.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-navy-900">{preference.title}</p>
                        <p className="text-sm text-gray-600">{preference.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={() => handleToggle(preference.id, 'email')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preference.email ? 'bg-emerald-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preference.email ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <Smartphone className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={() => handleToggle(preference.id, 'push')}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              preference.push ? 'bg-emerald-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                preference.push ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <Button 
            onClick={handleSave}
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              'Save Preferences'
            )}
          </Button>
        </div>

        {/* Additional Settings */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Additional Settings</CardTitle>
            <CardDescription>
              Configure additional notification preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900">Quiet Hours</p>
                  <p className="text-sm text-gray-600">Disable notifications during specific hours</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <p className="font-medium text-navy-900">Digest Frequency</p>
                  <p className="text-sm text-gray-600">Choose how often to receive email digests</p>
                </div>
                <Button variant="outline">Configure</Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">Important Note</p>
                    <p className="text-sm text-blue-700">
                      Security notifications cannot be disabled. We'll always alert you about important 
                      account security events regardless of your preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
