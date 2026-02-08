'use client'

import { QRCodeSVG } from 'qrcode.react'
import { useState } from 'react'
import { Download, Copy, CheckCircle, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface QRCodeGeneratorProps {
  contractAddress: string
  tokenId: string
  parcelId?: string
}

export function QRCodeGenerator({ contractAddress, tokenId, parcelId }: QRCodeGeneratorProps) {
  const [copied, setCopied] = useState(false)

  const verificationUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${contractAddress}/${tokenId}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(verificationUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg')
    if (!svg) return

    const svgData = new XMLSerializer().serializeToString(svg)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx?.drawImage(img, 0, 0)
      
      const pngFile = canvas.toDataURL('image/png')
      const downloadLink = document.createElement('a')
      downloadLink.download = `land-title-qr-${parcelId || tokenId}.png`
      downloadLink.href = pngFile
      downloadLink.click()
    }

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-900">Public Verification QR Code</h3>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Share this QR code to allow anyone to verify this land title on the blockchain without needing a wallet.
      </p>

      {/* QR Code Display */}
      <div className="flex justify-center mb-6">
        <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
          <QRCodeSVG
            id="qr-code-svg"
            value={verificationUrl}
            size={200}
            level="H"
            includeMargin={true}
            imageSettings={{
              src: '/logo.png',
              height: 40,
              width: 40,
              excavate: true,
            }}
          />
        </div>
      </div>

      {/* Verification URL */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">
          Verification URL
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={verificationUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono bg-gray-50"
          />
          <Button
            onClick={handleCopyUrl}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            {copied ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleDownloadQR}
          className="flex-1 flex items-center justify-center gap-2"
          variant="default"
        >
          <Download className="h-4 w-4" />
          Download QR Code
        </Button>
        <Button
          onClick={() => window.open(verificationUrl, '_blank')}
          className="flex-1"
          variant="outline"
        >
          Preview Page
        </Button>
      </div>

      {/* Info Box */}
      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Print this QR code on physical land title documents or share it digitally. 
          Anyone can scan it to verify the authenticity of this land title on the blockchain.
        </p>
      </div>
    </div>
  )
}
