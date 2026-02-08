import { defineChain } from 'thirdweb'

export const polygonAmoy = defineChain({
  id: 80002,
  name: 'Polygon Amoy Testnet',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpc: 'https://rpc-amoy.polygon.technology',
  blockExplorers: [
    {
      name: 'PolygonScan',
      url: 'https://amoy.polygonscan.com',
      apiUrl: 'https://api-amoy.polygonscan.com/api',
    },
  ],
  testnet: true,
})

export const NFT_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || ''

if (!NFT_CONTRACT_ADDRESS) {
  console.warn('NEXT_PUBLIC_NFT_CONTRACT_ADDRESS is not set. NFT minting will not work.')
}

export interface MintResult {
  transactionHash: string
  tokenId: string
  blockNumber: number
  contractAddress: string
}
