'use client'

import { useEffect, useState } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Users,
  Shield,
  Calendar,
  MoreVertical,
  Search,
  Loader2,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  email: string
  full_name: string
  role: string
  created_at: string
  last_sign_in_at: string | null
}

const ROLE_OPTIONS = [
  { value: 'CLAIMANT',    label: 'Claimant' },
  { value: 'VERIFIER',    label: 'Verifier' },
  { value: 'ADMIN',       label: 'Admin' },
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
]

export default function AdminUsersPage() {
  const { t } = useLanguage()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [stats, setStats] = useState({ total: 0, admins: 0, verifiers: 0, users: 0 })

  useEffect(() => {
    loadUsers()
  }, [])

  const computeStats = (userData: User[]) => ({
    total: userData.length,
    admins: userData.filter(u => ['ADMIN', 'SUPER_ADMIN', 'PLATFORM_OWNER'].includes(u.role)).length,
    verifiers: userData.filter(u => u.role === 'VERIFIER').length,
    users: userData.filter(u => u.role === 'CLAIMANT').length,
  })

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 4000)
  }

  const loadUsers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) {
        const err = await res.json()
        showNotification('error', err.error || 'Failed to load users')
        return
      }
      const data = await res.json()
      const userData: User[] = data.users || []
      setUsers(userData)
      setStats(computeStats(userData))
    } catch (error) {
      console.error('Error loading users:', error)
      showNotification('error', 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const changeRole = async (userId: string, newRole: string) => {
    setUpdatingUserId(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      })
      const data = await res.json()
      if (!res.ok) {
        showNotification('error', data.error || 'Role update failed')
        return
      }
      const updated = users.map(u => u.id === userId ? { ...u, role: newRole } : u)
      setUsers(updated)
      setStats(computeStats(updated))
      showNotification('success', `Role updated to ${newRole}`)
    } catch {
      showNotification('error', 'Network error — role not updated')
    } finally {
      setUpdatingUserId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'PLATFORM_OWNER': return <Badge className="bg-amber-500">Owner</Badge>
      case 'SUPER_ADMIN':    return <Badge className="bg-red-500">Super Admin</Badge>
      case 'ADMIN':          return <Badge className="bg-purple-500">Admin</Badge>
      case 'VERIFIER':       return <Badge className="bg-blue-500">Verifier</Badge>
      case 'CLAIMANT':       return <Badge className="bg-gray-500">Claimant</Badge>
      default:               return <Badge className="bg-gray-400">{role}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">

        {/* Notification banner */}
        {notification && (
          <div className={`mb-4 flex items-center gap-2 rounded-lg px-4 py-3 text-sm font-medium ${
            notification.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {notification.type === 'success'
              ? <CheckCircle className="h-4 w-4 flex-shrink-0" />
              : <AlertCircle className="h-4 w-4 flex-shrink-0" />}
            {notification.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-navy-900 mb-2">{t('admin.userManagement')}</h1>
          <p className="text-gray-600">{t('admin.manageUsersDesc')}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('admin.totalUsers')}</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-navy-900">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('nav.adminPanel')}</CardTitle>
              <Shield className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{stats.admins}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Verifiers</CardTitle>
              <Shield className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats.verifiers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">{t('common.allUsers')}</CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-600">{stats.users}</div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>{t('admin.allUsers')}</CardTitle>
            <CardDescription>
              {loading ? 'Loading users...' : `Showing ${filteredUsers.length} user(s)`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent" />
                <p className="mt-4 text-gray-600">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No users found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.name')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.role')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.joined')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.lastActive')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t('common.actions')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-600 font-semibold">
                                {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                              </span>
                            </div>
                            <div className="ml-3">
                              <p className="font-medium text-navy-900">{user.full_name || 'No name'}</p>
                              <p className="text-sm text-gray-500">{user.email || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.last_sign_in_at
                            ? new Date(user.last_sign_in_at).toLocaleDateString()
                            : 'Never'
                          }
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          {updatingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="ghost">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>{t('admin.changeRole')}</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {ROLE_OPTIONS.map(({ value, label }) => (
                                  <DropdownMenuItem
                                    key={value}
                                    disabled={user.role === value}
                                    onClick={() => changeRole(user.id, value)}
                                    className={user.role === value ? 'font-semibold text-emerald-600' : ''}
                                  >
                                    {label}{user.role === value ? ' ✓' : ''}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
