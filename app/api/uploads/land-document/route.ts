import { NextRequest, NextResponse } from 'next/server'

const PINATA_API_URL = 'https://api.pinata.cloud'

function getPinataAuthHeaders(): HeadersInit {
  const pinataJWT = process.env.PINATA_JWT
  const pinataApiKey = process.env.PINATA_API_KEY
  const pinataSecretApiKey = process.env.PINATA_API_SECRET

  if (pinataJWT) {
    return { Authorization: `Bearer ${pinataJWT}` }
  }

  if (pinataApiKey && pinataSecretApiKey) {
    return {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataSecretApiKey,
    }
  }

  throw new Error('Pinata credentials not configured')
}

export async function POST(request: NextRequest) {
  try {
    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    const upstream = new FormData()
    upstream.append('file', file, file.name)

    const metadata = JSON.stringify({ name: file.name })
    upstream.append('pinataMetadata', metadata)

    const options = JSON.stringify({ cidVersion: 1 })
    upstream.append('pinataOptions', options)

    const res = await fetch(`${PINATA_API_URL}/pinning/pinFileToIPFS`, {
      method: 'POST',
      headers: getPinataAuthHeaders(),
      body: upstream,
    })

    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: `Pinata upload failed: ${res.status} ${text}` },
        { status: 502 }
      )
    }

    const json = (await res.json()) as { IpfsHash?: string }
    if (!json.IpfsHash) {
      return NextResponse.json({ error: 'Pinata response missing IpfsHash' }, { status: 502 })
    }

    const ipfsHash = json.IpfsHash

    return NextResponse.json({
      ipfsHash,
      ipfsUrl: `ipfs://${ipfsHash}`,
      pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
