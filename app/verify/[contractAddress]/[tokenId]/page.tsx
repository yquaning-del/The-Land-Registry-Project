import { Metadata } from 'next'
import { VerificationPage } from '@/components/VerificationPage'

interface PageProps {
  params: {
    contractAddress: string
    tokenId: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Land Title Verification - Token #${params.tokenId}`,
    description: `Verify blockchain land title NFT for token ${params.tokenId} on contract ${params.contractAddress}`,
  }
}

export default function VerifyPage({ params }: PageProps) {
  return (
    <VerificationPage
      contractAddress={params.contractAddress}
      tokenId={params.tokenId}
    />
  )
}
