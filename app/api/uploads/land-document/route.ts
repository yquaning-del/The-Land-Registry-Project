import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PINATA_API_URL = 'https://api.pinata.cloud'

function isPinataConfigured(): boolean {
  return !!(process.env.PINATA_JWT || (process.env.PINATA_API_KEY && process.env.PINATA_API_SECRET))
}

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

async function uploadToPinata(file: File) {
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
    throw new Error(`Pinata upload failed: ${res.status} ${text}`)
  }

  const json = (await res.json()) as { IpfsHash?: string }
  if (!json.IpfsHash) {
    throw new Error('Pinata response missing IpfsHash')
  }

  const ipfsHash = json.IpfsHash
  return {
    ipfsHash,
    ipfsUrl: `ipfs://${ipfsHash}`,
    pinataUrl: `https://gateway.pinata.cloud/ipfs/${ipfsHash}`,
  }
}

async function uploadToSupabaseStorage(file: File) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const ext = file.name.split('.').pop() || 'bin'
  const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const { data, error } = await supabase.storage
    .from('land-documents')
    .upload(fileName, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`Supabase Storage upload failed: ${error.message}`)
  }

  const { data: urlData } = supabase.storage
    .from('land-documents')
    .getPublicUrl(data.path)

  return {
    ipfsHash: null,
    ipfsUrl: null,
    pinataUrl: urlData.publicUrl,
  }
}

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/tiff',
]

export async function POST(request: NextRequest) {
  try {
    // Auth check must happen before any file processing or external uploads
    const supabaseForAuth = await createClient()
    const { data: { user }, error: authError } = await supabaseForAuth.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const form = await request.formData()
    const file = form.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'file is required' }, { status: 400 })
    }

    // Server-side file size validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 413 }
      )
    }

    // Server-side MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File must be a PDF or image (JPEG, PNG, WebP, TIFF)' },
        { status: 415 }
      )
    }

    // Try Pinata first, fall back to Supabase Storage
    if (isPinataConfigured()) {
      try {
        const result = await uploadToPinata(file)
        return NextResponse.json(result)
      } catch (pinataError: any) {
        console.error('Pinata upload failed, trying Supabase Storage fallback:', pinataError.message)
      }
    }

    // Fallback: Supabase Storage
    try {
      const result = await uploadToSupabaseStorage(file)
      return NextResponse.json(result)
    } catch (storageError: any) {
      return NextResponse.json(
        { error: `Upload failed: ${storageError.message}. Configure PINATA_JWT or create a 'land-documents' Supabase Storage bucket.` },
        { status: 500 }
      )
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
