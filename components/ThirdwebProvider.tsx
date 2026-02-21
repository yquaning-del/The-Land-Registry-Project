'use client'

import { ThirdwebProvider as Thirdweb } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

if (!clientId) {
  console.warn('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Blockchain features will not work.')
}

let client: ReturnType<typeof createThirdwebClient> | null = null
if (clientId) {
  try {
    client = createThirdwebClient({ clientId })
  } catch (e) {
    console.error('Failed to create Thirdweb client:', e)
  }
}

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  if (!client) {
    return <>{children}</>
  }
  return <Thirdweb>{children}</Thirdweb>
}

export { client }
