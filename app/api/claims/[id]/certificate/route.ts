import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function escapeHtml(value: unknown): string {
  const str = value == null ? 'N/A' : String(value)
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = context.params

  const { data: claim, error } = await supabase
    .from('land_claims')
    .select('id, claimant_id, document_type, title_type, address, region, country, latitude, longitude, land_size_sqm, ai_verification_status, ai_confidence_score, ai_confidence_level, ai_verified_at, blockchain_tx_hash, nft_token_id, original_document_url, parcel_id_barcode, document_metadata, created_at')
    .eq('id', id)
    .eq('claimant_id', user.id)
    .single()

  if (error || !claim) {
    return NextResponse.json({ error: 'Claim not found' }, { status: 404 })
  }

  const isVerified =
    claim.ai_verification_status === 'AI_VERIFIED' ||
    claim.ai_verification_status === 'APPROVED'

  if (!isVerified) {
    return NextResponse.json({ error: 'Claim is not verified' }, { status: 400 })
  }

  const ownerName = escapeHtml(claim.document_metadata?.ownerName)
  const parcelId = escapeHtml(claim.parcel_id_barcode || claim.document_metadata?.parcelId)
  const confidence = claim.ai_confidence_score != null
    ? `${(claim.ai_confidence_score * 100).toFixed(1)}%`
    : 'N/A'
  const verifiedAt = claim.ai_verified_at
    ? new Date(claim.ai_verified_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date(claim.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  // Safely extract the IPFS hash — handle query params and non-standard protocols
  let ipfsHash = 'N/A'
  if (claim.original_document_url) {
    try {
      const url = new URL(claim.original_document_url)
      ipfsHash = url.pathname.split('/').pop() || 'N/A'
    } catch {
      // Fallback for non-parseable URLs (e.g. relative paths)
      ipfsHash = claim.original_document_url.split('/').pop()?.split('?')[0] || 'N/A'
    }
  }

  const coordinates = `${claim.latitude?.toFixed(6) ?? 'N/A'}, ${claim.longitude?.toFixed(6) ?? 'N/A'}`
  const titleType = escapeHtml(claim.title_type?.replace(/_/g, ' ') || claim.document_type)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Land Registry Certificate</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 2rem; }
    .cert { background: #fff; border: 1px solid #e2e8f0; border-top: 6px solid #10b981; max-width: 720px; width: 100%; padding: 3rem; }
    .header { text-align: center; margin-bottom: 2rem; }
    .badge { display: inline-block; background: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7; border-radius: 9999px; padding: 0.25rem 1rem; font-size: 0.8rem; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 1rem; }
    h1 { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 0.25rem; }
    .subtitle { color: #64748b; font-size: 0.9rem; }
    .divider { border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .field label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; }
    .field span { font-size: 0.95rem; color: #1e293b; word-break: break-all; }
    .full { grid-column: 1 / -1; }
    .footer { margin-top: 2.5rem; text-align: center; color: #94a3b8; font-size: 0.75rem; }
    .seal { font-size: 2.5rem; margin-bottom: 0.5rem; }
    @media print {
      body { background: none; padding: 0; }
      .cert { border: none; padding: 2rem; }
      .print-btn { display: none; }
    }
    .print-btn { display: block; width: 100%; margin-top: 2rem; padding: 0.75rem; background: #10b981; color: #fff; border: none; border-radius: 0.5rem; font-size: 1rem; font-weight: 600; cursor: pointer; }
    .print-btn:hover { background: #059669; }
  </style>
</head>
<body>
  <div class="cert">
    <div class="header">
      <div class="badge">AI Verified Certificate</div>
      <h1>Land Registry Certificate</h1>
      <p class="subtitle">Issued by the Land Registry Platform &bull; Verified ${verifiedAt}</p>
    </div>
    <hr class="divider" />
    <div class="grid">
      <div class="field">
        <label>Parcel ID</label>
        <span>${parcelId}</span>
      </div>
      <div class="field">
        <label>Title Type</label>
        <span>${titleType}</span>
      </div>
      <div class="field full">
        <label>Owner / Grantee Name</label>
        <span>${ownerName}</span>
      </div>
      <div class="field full">
        <label>Address / Locality</label>
        <span>${escapeHtml(claim.address)}${claim.region ? ', ' + escapeHtml(claim.region) : ''}${claim.country ? ', ' + escapeHtml(claim.country) : ''}</span>
      </div>
      <div class="field">
        <label>GPS Coordinates</label>
        <span>${coordinates}</span>
      </div>
      <div class="field">
        <label>Land Size</label>
        <span>${claim.land_size_sqm ? claim.land_size_sqm.toLocaleString() + ' sqm' : 'N/A'}</span>
      </div>
      <div class="field">
        <label>AI Confidence Score</label>
        <span>${confidence}</span>
      </div>
      <div class="field">
        <label>Verification Date</label>
        <span>${verifiedAt}</span>
      </div>
      ${claim.blockchain_tx_hash ? `
      <div class="field full">
        <label>Blockchain Transaction Hash</label>
        <span>${escapeHtml(claim.blockchain_tx_hash)}</span>
      </div>` : ''}
      ${claim.nft_token_id ? `
      <div class="field">
        <label>NFT Token ID</label>
        <span>${escapeHtml(claim.nft_token_id)}</span>
      </div>` : ''}
      <div class="field full">
        <label>IPFS Document Hash</label>
        <span>${escapeHtml(ipfsHash)}</span>
      </div>
      <div class="field full">
        <label>Claim ID</label>
        <span>${escapeHtml(claim.id)}</span>
      </div>
    </div>
    <hr class="divider" />
    <div class="footer">
      <div class="seal">🛡️</div>
      <p>This certificate was generated by the Land Registry Platform AI verification system.</p>
      <p>For legal purposes, please obtain an official notarized copy from the relevant lands authority.</p>
    </div>
    <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
