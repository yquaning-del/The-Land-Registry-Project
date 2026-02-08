'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { AlertCircle, Coins } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

interface CreditGuardProps {
  children: React.ReactNode
  requiredCredits?: number
  action?: string
}

export function CreditGuard({ children, requiredCredits = 1, action = 'this action' }: CreditGuardProps) {
  const [hasCredits, setHasCredits] = useState<boolean | null>(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    checkBalance()
  }, [])

  async function checkBalance() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data } = await supabase
        .from('credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (data) {
        setBalance(data.balance)
        setHasCredits(data.balance >= requiredCredits)
      } else {
        setHasCredits(false)
      }
    }
  }

  if (hasCredits === null) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!hasCredits) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="h-5 w-5" />
            Insufficient Credits
          </CardTitle>
          <CardDescription>
            You need {requiredCredits} {requiredCredits === 1 ? 'credit' : 'credits'} to perform {action}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-white rounded-lg">
            <Coins className="h-5 w-5 text-amber-600" />
            <div>
              <p className="text-sm font-medium text-gray-900">Current Balance</p>
              <p className="text-2xl font-bold text-amber-600">{balance} Credits</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              You need <strong>{requiredCredits - balance} more {requiredCredits - balance === 1 ? 'credit' : 'credits'}</strong> to continue.
            </p>
            <Link href="/settings/billing">
              <Button className="w-full">
                <Coins className="h-4 w-4 mr-2" />
                Get More Credits
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return <>{children}</>
}
