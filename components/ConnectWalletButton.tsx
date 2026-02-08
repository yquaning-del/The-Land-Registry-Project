'use client'

import { ConnectButton } from 'thirdweb/react'
import { client } from '@/components/ThirdwebProvider'
import { polygonAmoy } from '@/lib/blockchain'
import { createWallet } from 'thirdweb/wallets'

const wallets = [
  createWallet('io.metamask'),
  createWallet('com.coinbase.wallet'),
  createWallet('me.rainbow'),
]

export function ConnectWalletButton() {
  return (
    <ConnectButton
      client={client}
      wallets={wallets}
      chain={polygonAmoy}
      connectButton={{
        label: 'Connect Wallet',
      }}
      connectModal={{
        size: 'compact',
        title: 'Connect to Land Registry',
        showThirdwebBranding: false,
      }}
    />
  )
}
