'use client'

import { ThirdwebProvider as Thirdweb } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID

if (!clientId) {
  console.warn('NEXT_PUBLIC_THIRDWEB_CLIENT_ID is not set. Blockchain features will not work.')
}

const client = createThirdwebClient({
  clientId: clientId || 'demo-client-id',
})

export function ThirdwebProvider({ children }: { children: React.ReactNode }) {
  return <Thirdweb>{children}</Thirdweb>
}

export { client }
