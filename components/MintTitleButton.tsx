'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useActiveAccount, useSendTransaction } from 'thirdweb/react'
import { getContract, prepareContractCall } from 'thirdweb'
import { client } from '@/components/ThirdwebProvider'
import { polygonAmoy, NFT_CONTRACT_ADDRESS } from '@/lib/blockchain'
import { uploadLandDeedToIPFS } from '@/lib/pinata'
import { createClient } from '@/lib/supabase/client'
import { checkCredits, deductCreditsForMint } from '@/lib/credits'
import { CREDIT_COSTS } from '@/types/paystack.types'
import { Loader2, CheckCircle, AlertCircle, Coins } from 'lucide-react'

interface MintTitleButtonProps {
  claimId: string
  claimData: {
    id: string
    claimantName: string
    location: string
    region: string
    country: string
    latitude: number
    longitude: number
    landSize: number
    parcelId: string
    aiConfidenceScore: number
    fraudConfidenceScore: number
    humanAuditorNotes: string
    documentType: string
    durationYears: number
    originalDocumentUrl: string
    auditorId: string
    auditorName: string
    auditorEmail?: string
    verificationTimestamp: string
  }
  onSuccess?: (transactionHash: string, tokenId: string) => void
  onError?: (error: Error) => void
}

export function MintTitleButton({
  claimId,
  claimData,
  onSuccess,
  onError,
}: MintTitleButtonProps) {
  const [status, setStatus] = useState<'idle' | 'uploading' | 'minting' | 'updating' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [ipfsHash, setIpfsHash] = useState<string>('')
  const [transactionHash, setTransactionHash] = useState<string>('')
  
  const account = useActiveAccount()
  const { mutate: sendTransaction } = useSendTransaction()

  const handleMint = async () => {
    if (!account) {
      setErrorMessage('Please connect your wallet first')
      setStatus('error')
      return
    }

    try {
      // Step 0: Check credits
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setErrorMessage('Please sign in to continue')
        setStatus('error')
        return
      }

      const hasCredits = await checkCredits(user.id, 1)
      if (!hasCredits) {
        setErrorMessage('Insufficient credits. Please purchase more credits to mint.')
        setStatus('error')
        return
      }

      // Step 1: Upload to IPFS
      setStatus('uploading')
      setErrorMessage('')

      const documentBlob = await fetch(claimData.originalDocumentUrl).then(r => r.blob())
      const documentFile = new File([documentBlob], `land-deed-${claimData.parcelId}.pdf`, {
        type: documentBlob.type,
      })

      const approvalTimestamp = new Date().toISOString()

      const { metadataHash, metadataUrl } = await uploadLandDeedToIPFS(documentFile, {
        ...claimData,
        approvalTimestamp,
      })
      
      setIpfsHash(metadataHash)

      // Step 2: Mint NFT on blockchain
      setStatus('minting')

      const contract = getContract({
        client,
        chain: polygonAmoy,
        address: NFT_CONTRACT_ADDRESS,
      })

      const transaction = prepareContractCall({
        contract,
        method: 'function mintTo(address to, string memory uri) returns (uint256)',
        params: [account.address, metadataUrl],
      })

      sendTransaction(transaction, {
        onSuccess: async (result) => {
          setTransactionHash(result.transactionHash)
          
          // Step 3: Update Supabase
          setStatus('updating')
          
          try {
            const supabase = createClient()
            const { error: updateError } = await supabase
              .from('land_claims')
              .update({
                on_chain_hash: result.transactionHash,
                mint_status: 'MINTED',
                ipfs_metadata_hash: metadataHash,
                ipfs_metadata_url: metadataUrl,
                minted_at: new Date().toISOString(),
                minted_by: account.address,
              })
              .eq('id', claimId)

            if (updateError) {
              throw updateError
            }

            // Step 4: Deduct 5 credits for minting
            const creditDeducted = await deductCreditsForMint(
              user.id,
              `NFT minted for claim ${claimId}`,
              result.transactionHash
            )

            if (!creditDeducted) {
              console.warn('Failed to deduct credit, but NFT was minted successfully')
            }

            setStatus('success')
            onSuccess?.(result.transactionHash, metadataHash)
          } catch (dbError) {
            console.error('Database update error:', dbError)
            setErrorMessage('NFT minted but failed to update database')
            setStatus('error')
            onError?.(dbError as Error)
          }
        },
        onError: (error) => {
          console.error('Minting error:', error)
          setErrorMessage(error.message || 'Failed to mint NFT')
          setStatus('error')
          onError?.(error)
        },
      })
    } catch (error) {
      console.error('Minting process error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'An unknown error occurred')
      setStatus('error')
      onError?.(error as Error)
    }
  }

  const getButtonContent = () => {
    switch (status) {
      case 'uploading':
        return (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Uploading to IPFS...
          </>
        )
      case 'minting':
        return (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Minting NFT on Polygon...
          </>
        )
      case 'updating':
        return (
          <>
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            Updating Database...
          </>
        )
      case 'success':
        return (
          <>
            <CheckCircle className="h-5 w-5 mr-2" />
            Minted Successfully!
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="h-5 w-5 mr-2" />
            Mint Failed - Retry
          </>
        )
      default:
        return (
          <>
            <Coins className="h-5 w-5 mr-2" />
            Mint Land Title NFT
          </>
        )
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleMint}
        disabled={status === 'uploading' || status === 'minting' || status === 'updating' || status === 'success' || !account}
        className={`w-full ${
          status === 'success'
            ? 'bg-green-600 hover:bg-green-700'
            : status === 'error'
            ? 'bg-red-600 hover:bg-red-700'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
        size="lg"
      >
        {getButtonContent()}
      </Button>

      {!account && (
        <p className="text-sm text-yellow-600 text-center">
          ⚠️ Please connect your wallet to mint NFT
        </p>
      )}

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Error:</strong> {errorMessage}
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-5 w-5" />
            <strong>NFT Minted Successfully!</strong>
          </div>
          
          {transactionHash && (
            <div className="text-sm text-gray-700">
              <strong>Transaction:</strong>{' '}
              <a
                href={`https://amoy.polygonscan.com/tx/${transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                {transactionHash.slice(0, 10)}...{transactionHash.slice(-8)}
              </a>
            </div>
          )}
          
          {ipfsHash && (
            <div className="text-sm text-gray-700">
              <strong>IPFS Metadata:</strong>{' '}
              <a
                href={`https://gateway.pinata.cloud/ipfs/${ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                {ipfsHash.slice(0, 10)}...{ipfsHash.slice(-8)}
              </a>
            </div>
          )}
        </div>
      )}

      {(status === 'uploading' || status === 'minting' || status === 'updating') && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'uploading' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`} />
              <span>Upload document to IPFS</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'minting' ? 'bg-blue-500 animate-pulse' : status === 'updating' || status === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Mint NFT on Polygon Amoy</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${status === 'updating' ? 'bg-blue-500 animate-pulse' : status === 'success' ? 'bg-green-500' : 'bg-gray-300'}`} />
              <span>Update database record</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
