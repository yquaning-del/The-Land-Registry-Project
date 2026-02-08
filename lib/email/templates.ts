// Email Templates for Land Registry Platform
// These templates are ready to use with any email service (Resend, SendGrid, etc.)

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export function getRequestDemoEmail(data: TemplateData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>Investor Relations</p>
        </div>
        <div class="content">
          <h2>New Demo Request</h2>
          <p>A prospect has requested a demo via the /pitch page.</p>

          <div class="info-box">
            <strong>Contact</strong>
            <div style="margin-top: 10px;">
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value">${data.requesterName || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Email:</span>
                <span class="info-value">${data.requesterEmail || 'N/A'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Organization:</span>
                <span class="info-value">${data.requesterOrganization || 'N/A'}</span>
              </div>
              <div class="info-row" style="border-bottom: none;">
                <span class="info-label">Source:</span>
                <span class="info-value">${data.requestSource || 'pitch'}</span>
              </div>
            </div>
          </div>

          <h3>Message</h3>
          <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; white-space: pre-wrap;">${data.requesterMessage || 'No message provided.'}</p>
          </div>

          ${data.requesterEmail ? `
          <div style="margin-top: 20px;">
            <a class="button" href="mailto:${data.requesterEmail}">Reply via Email</a>
          </div>
          ` : ''}
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p>${baseUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `[DEMO REQUEST] ${data.requesterOrganization ? `${data.requesterOrganization} — ` : ''}${data.requesterName || 'New Prospect'}`,
    html,
    text:
      `New Demo Request\n\n` +
      `Name: ${data.requesterName || 'N/A'}\n` +
      `Email: ${data.requesterEmail || 'N/A'}\n` +
      `Organization: ${data.requesterOrganization || 'N/A'}\n` +
      `Source: ${data.requestSource || 'pitch'}\n\n` +
      `Message:\n${data.requesterMessage || 'No message provided.'}`,
  }
}

export interface TemplateData {
  userName?: string
  claimId?: string
  verificationStatus?: string
  confidenceScore?: number
  transactionHash?: string
  tokenId?: string
  planName?: string
  creditsAmount?: number
  supportUrl?: string
  dashboardUrl?: string
  requesterName?: string
  requesterEmail?: string
  requesterOrganization?: string
  requesterMessage?: string
  requestSource?: string
  // Conflict alert fields
  parcelId?: string
  overlapPercentage?: number
  detectionTimestamp?: string
  blockchainHash?: string
  blockchainTxUrl?: string
  buyerPriorityDate?: string
  lawyerName?: string
  conflictMapUrl?: string
  // Evidence packet fields
  sellerName?: string
  rivalClaimDate?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://landregistry.africa'

// Common email styles
const emailStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { color: #10B981; margin: 0; font-size: 24px; }
    .header p { color: #94A3B8; margin: 5px 0 0; font-size: 14px; }
    .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
    .footer { background: #F8FAFC; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; border: 1px solid #E2E8F0; border-top: none; }
    .footer p { color: #64748B; font-size: 12px; margin: 5px 0; }
    .button { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
    .button:hover { background: #059669; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-verified { background: #D1FAE5; color: #065F46; }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-rejected { background: #FEE2E2; color: #991B1B; }
    .info-box { background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 6px; margin: 15px 0; }
    .warning-box { background: #FFFBEB; border: 1px solid #FDE68A; padding: 15px; border-radius: 6px; margin: 15px 0; }
  </style>
`

// Welcome Email
export function getWelcomeEmail(data: TemplateData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>Blockchain Verified Land Titles</p>
        </div>
        <div class="content">
          <h2>Welcome to Land Registry, ${data.userName || 'there'}!</h2>
          <p>Thank you for joining the future of land title verification. Your account has been created successfully.</p>
          
          <div class="info-box">
            <strong>🎁 You've received 5 free verification credits!</strong>
            <p style="margin: 5px 0 0;">Use them to verify your first land documents with our AI-powered system.</p>
          </div>
          
          <h3>Getting Started:</h3>
          <ol>
            <li><strong>Upload your document</strong> - Submit your land title for verification</li>
            <li><strong>AI Analysis</strong> - Our system analyzes your document in minutes</li>
            <li><strong>Get Results</strong> - Receive a detailed verification report</li>
            <li><strong>Mint NFT</strong> - Create an immutable blockchain record</li>
          </ol>
          
          <a href="${baseUrl}/dashboard" class="button">Go to Dashboard</a>
          
          <p>If you have any questions, our support team is here to help.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p><a href="${baseUrl}/support">Contact Support</a> | <a href="${baseUrl}/whitepaper">Read Whitepaper</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: 'Welcome to Land Registry - Your Account is Ready! 🎉',
    html,
    text: `Welcome to Land Registry, ${data.userName || 'there'}!\n\nThank you for joining. You've received 5 free verification credits.\n\nGet started at: ${baseUrl}/dashboard`,
  }
}

// Verification Complete Email
export function getVerificationCompleteEmail(data: TemplateData): EmailTemplate {
  const statusClass = data.verificationStatus === 'VERIFIED' ? 'status-verified' : 
                      data.verificationStatus === 'PENDING_REVIEW' ? 'status-pending' : 'status-rejected'
  const statusText = data.verificationStatus === 'VERIFIED' ? 'Verified ✓' :
                     data.verificationStatus === 'PENDING_REVIEW' ? 'Pending Review' : 'Needs Attention'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>Verification Complete</p>
        </div>
        <div class="content">
          <h2>Verification Results</h2>
          <p>Hi ${data.userName || 'there'},</p>
          <p>Your land title verification has been completed.</p>
          
          <div style="text-align: center; margin: 20px 0;">
            <span class="status-badge ${statusClass}">${statusText}</span>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;"><strong>Claim ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-family: monospace;">${data.claimId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;"><strong>AI Confidence:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;">${data.confidenceScore ? `${(data.confidenceScore * 100).toFixed(1)}%` : 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Status:</strong></td>
              <td style="padding: 10px;">${data.verificationStatus || 'N/A'}</td>
            </tr>
          </table>
          
          ${data.verificationStatus === 'VERIFIED' ? `
            <div class="info-box">
              <strong>🎉 Great news!</strong>
              <p style="margin: 5px 0 0;">Your document has been verified. You can now mint it as an NFT on the blockchain.</p>
            </div>
          ` : data.verificationStatus === 'PENDING_REVIEW' ? `
            <div class="warning-box">
              <strong>⏳ Human Review Required</strong>
              <p style="margin: 5px 0 0;">Our team will review your document within 24-48 hours.</p>
            </div>
          ` : `
            <div class="warning-box">
              <strong>⚠️ Action Required</strong>
              <p style="margin: 5px 0 0;">Please review the verification details and contact support if needed.</p>
            </div>
          `}
          
          <a href="${baseUrl}/claims/${data.claimId}" class="button">View Full Report</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p><a href="${baseUrl}/support">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `Verification ${statusText} - Claim ${data.claimId?.slice(0, 8) || ''}`,
    html,
    text: `Your verification is complete.\n\nStatus: ${statusText}\nConfidence: ${data.confidenceScore ? `${(data.confidenceScore * 100).toFixed(1)}%` : 'N/A'}\n\nView details: ${baseUrl}/claims/${data.claimId}`,
  }
}

// NFT Minted Email
export function getNFTMintedEmail(data: TemplateData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>NFT Successfully Minted</p>
        </div>
        <div class="content">
          <h2>🎉 Congratulations!</h2>
          <p>Hi ${data.userName || 'there'},</p>
          <p>Your verified land title has been successfully minted as an NFT on the Polygon blockchain.</p>
          
          <div class="info-box">
            <strong>Your land title is now permanently recorded on the blockchain!</strong>
            <p style="margin: 5px 0 0;">This creates an immutable, tamper-proof record of your verified ownership.</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0;"><strong>Token ID:</strong></td>
              <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-family: monospace;">${data.tokenId || 'N/A'}</td>
            </tr>
            <tr>
              <td style="padding: 10px;"><strong>Transaction:</strong></td>
              <td style="padding: 10px; font-family: monospace; word-break: break-all;">
                <a href="https://amoy.polygonscan.com/tx/${data.transactionHash}" style="color: #10B981;">${data.transactionHash?.slice(0, 20)}...</a>
              </td>
            </tr>
          </table>
          
          <a href="${baseUrl}/verify/${data.tokenId}" class="button">View Your NFT</a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #64748B;">
            You can share this verification link with anyone who wants to verify your land title ownership.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p><a href="${baseUrl}/support">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: '🎉 Your Land Title NFT Has Been Minted!',
    html,
    text: `Congratulations! Your land title NFT has been minted.\n\nToken ID: ${data.tokenId}\nTransaction: https://amoy.polygonscan.com/tx/${data.transactionHash}\n\nView your NFT: ${baseUrl}/verify/${data.tokenId}`,
  }
}

// Payment Confirmation Email
export function getPaymentConfirmationEmail(data: TemplateData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>Payment Confirmed</p>
        </div>
        <div class="content">
          <h2>Payment Successful! ✓</h2>
          <p>Hi ${data.userName || 'there'},</p>
          <p>Thank you for your purchase. Your payment has been processed successfully.</p>
          
          <div class="info-box">
            <table style="width: 100%;">
              <tr>
                <td><strong>Plan:</strong></td>
                <td style="text-align: right;">${data.planName || 'N/A'}</td>
              </tr>
              <tr>
                <td><strong>Credits Added:</strong></td>
                <td style="text-align: right;">${data.creditsAmount || 0} credits</td>
              </tr>
            </table>
          </div>
          
          <p>Your credits have been added to your account and are ready to use.</p>
          
          <a href="${baseUrl}/dashboard" class="button">Start Verifying</a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #64748B;">
            Need a receipt? Visit your <a href="${baseUrl}/settings/billing/history" style="color: #10B981;">billing history</a>.
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p><a href="${baseUrl}/support">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `Payment Confirmed - ${data.creditsAmount} Credits Added`,
    html,
    text: `Payment successful!\n\nPlan: ${data.planName}\nCredits Added: ${data.creditsAmount}\n\nStart verifying: ${baseUrl}/dashboard`,
  }
}

// Low Credits Warning Email
export function getLowCreditsEmail(data: TemplateData): EmailTemplate {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>${emailStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🛡️ Land Registry</h1>
          <p>Low Credits Alert</p>
        </div>
        <div class="content">
          <h2>⚠️ Running Low on Credits</h2>
          <p>Hi ${data.userName || 'there'},</p>
          <p>You have <strong>${data.creditsAmount || 0} credits</strong> remaining in your account.</p>
          
          <div class="warning-box">
            <strong>Don't let your verifications stop!</strong>
            <p style="margin: 5px 0 0;">Purchase more credits to continue verifying land titles without interruption.</p>
          </div>
          
          <a href="${baseUrl}/settings/billing/purchase" class="button">Buy More Credits</a>
          
          <p style="margin-top: 20px;">
            <strong>Credit Costs:</strong><br>
            • Verification: 1 credit<br>
            • NFT Minting: 5 credits
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Land Registry. All rights reserved.</p>
          <p><a href="${baseUrl}/support">Contact Support</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: '⚠️ Low Credits - Only ${data.creditsAmount} Remaining',
    html,
    text: `You have ${data.creditsAmount} credits remaining.\n\nBuy more credits: ${baseUrl}/settings/billing/purchase`,
  }
}

// Conflict Alert Email - Urgent Security Template
export function getConflictAlertEmail(data: TemplateData): EmailTemplate {
  const urgentStyles = `
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
      .container { max-width: 600px; margin: 0 auto; padding: 20px; }
      .header { background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 4px solid #EF4444; }
      .header h1 { color: #EF4444; margin: 0; font-size: 24px; }
      .header p { color: #94A3B8; margin: 5px 0 0; font-size: 14px; }
      .content { background: #ffffff; padding: 30px; border: 1px solid #E2E8F0; }
      .footer { background: #0F172A; padding: 20px; text-align: center; border-radius: 0 0 8px 8px; }
      .footer p { color: #94A3B8; font-size: 12px; margin: 5px 0; }
      .button { display: inline-block; background: #EF4444; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 15px 0; }
      .button-secondary { display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 5px; }
      .alert-box { background: #FEF2F2; border: 2px solid #EF4444; padding: 20px; border-radius: 8px; margin: 20px 0; }
      .alert-box h3 { color: #991B1B; margin: 0 0 10px; }
      .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E2E8F0; }
      .info-label { color: #64748B; font-size: 14px; }
      .info-value { color: #0F172A; font-weight: 600; font-size: 14px; }
      .priority-badge { display: inline-block; background: #10B981; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
      .warning-badge { display: inline-block; background: #EF4444; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    </style>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${urgentStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ SECURITY ALERT</h1>
          <p>Valley of Fraud Protection Engine</p>
        </div>
        <div class="content">
          <h2 style="color: #991B1B; margin-top: 0;">Potential Title Conflict Detected</h2>
          <p>Dear ${data.userName || 'Valued Customer'},</p>
          <p>Our <strong>Valley of Fraud Protection Engine</strong> has detected a rival claim overlapping with your registered Indenture for <strong>Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'}</strong>.</p>
          
          <div class="alert-box">
            <h3>🚨 Details of the Conflict</h3>
            <div style="margin-top: 15px;">
              <div class="info-row">
                <span class="info-label">Overlap Percentage:</span>
                <span class="info-value" style="color: #EF4444;">${data.overlapPercentage?.toFixed(1) || 'N/A'}%</span>
              </div>
              <div class="info-row">
                <span class="info-label">Detection Timestamp:</span>
                <span class="info-value">${data.detectionTimestamp || new Date().toISOString()}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Priority Status:</span>
                <span class="priority-badge">You hold the Primary Timestamp</span>
              </div>
              ${data.buyerPriorityDate ? `
              <div class="info-row">
                <span class="info-label">Your Record Hashed:</span>
                <span class="info-value">${data.buyerPriorityDate}</span>
              </div>
              ` : ''}
            </div>
          </div>

          <h3 style="color: #0F172A;">📋 Recommended Action</h3>
          <p>We have sent a detailed <strong>Evidence Packet</strong> to your registered lawyer${data.lawyerName ? `, <strong>${data.lawyerName}</strong>` : ''}. We recommend an <strong>immediate pause on any further payments</strong> to the seller until this spatial overlap is resolved through a physical survey or legal audit.</p>

          ${data.blockchainHash ? `
          <div style="background: #F0FDF4; border: 1px solid #BBF7D0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="color: #065F46; margin: 0 0 10px;">🔗 Your Proof of Priority</h4>
            <p style="font-family: monospace; font-size: 12px; word-break: break-all; margin: 0; color: #065F46;">
              ${data.blockchainHash}
            </p>
            ${data.blockchainTxUrl ? `
            <a href="${data.blockchainTxUrl}" class="button-secondary" style="margin-top: 10px; display: inline-block;">View on Blockchain →</a>
            ` : ''}
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.conflictMapUrl || baseUrl + '/dashboard'}" class="button">View Conflict Details</a>
          </div>

          <p style="font-size: 14px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 20px;">
            <strong>Need immediate assistance?</strong><br>
            Contact your legal counsel or reach out to our support team at <a href="mailto:support@landregistry.africa" style="color: #10B981;">support@landregistry.africa</a>
          </p>
        </div>
        <div class="footer">
          <p style="color: #10B981; font-weight: 600;">🛡️ Land Registry</p>
          <p>Securing your land with AI and Blockchain</p>
          <p style="font-size: 11px;">This is an automated security alert. Do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `⚠️ URGENT: Potential Title Conflict Detected for Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'}`,
    html,
    text: `URGENT: Potential Title Conflict Detected\n\nDear ${data.userName || 'Valued Customer'},\n\nOur Valley of Fraud Protection Engine has detected a rival claim overlapping with your registered Indenture for Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'}.\n\nOverlap Percentage: ${data.overlapPercentage?.toFixed(1) || 'N/A'}%\nDetection Timestamp: ${data.detectionTimestamp || new Date().toISOString()}\nPriority Status: You hold the Primary Timestamp\n\nRecommended Action: Pause any further payments to the seller until this spatial overlap is resolved.\n\nYour Proof of Priority: ${data.blockchainHash || 'N/A'}\n\nView details: ${data.conflictMapUrl || baseUrl + '/dashboard'}`,
  }
}

// Evidence Packet Email for Lawyers
export function getEvidencePacketEmail(data: TemplateData): EmailTemplate {
  const legalStyles = `
    <style>
      body { font-family: 'Georgia', 'Times New Roman', serif; line-height: 1.8; color: #1a1a1a; }
      .container { max-width: 650px; margin: 0 auto; padding: 20px; }
      .header { background: #0F172A; padding: 25px 30px; border-radius: 4px 4px 0 0; }
      .header h1 { color: #ffffff; margin: 0; font-size: 20px; font-weight: normal; letter-spacing: 1px; }
      .header p { color: #94A3B8; margin: 5px 0 0; font-size: 13px; }
      .content { background: #ffffff; padding: 35px; border: 1px solid #d1d5db; }
      .footer { background: #f8fafc; padding: 20px 30px; border: 1px solid #d1d5db; border-top: none; border-radius: 0 0 4px 4px; }
      .footer p { color: #64748B; font-size: 11px; margin: 3px 0; }
      .section { margin: 25px 0; padding: 20px; background: #f8fafc; border-left: 4px solid #0F172A; }
      .section h3 { margin: 0 0 15px; color: #0F172A; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
      .data-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      .data-table td { padding: 10px 12px; border: 1px solid #e2e8f0; font-size: 13px; }
      .data-table td:first-child { background: #f1f5f9; font-weight: 600; width: 40%; color: #475569; }
      .urgent-notice { background: #FEF2F2; border: 1px solid #EF4444; padding: 15px 20px; margin: 20px 0; }
      .urgent-notice p { margin: 0; color: #991B1B; font-size: 13px; }
      .button { display: inline-block; background: #0F172A; color: white; padding: 12px 24px; text-decoration: none; font-size: 13px; margin: 10px 5px 10px 0; }
    </style>
  `

  const html = `
    <!DOCTYPE html>
    <html>
    <head>${legalStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>CONFLICT EVIDENCE PACKET</h1>
          <p>Land Registry • Valley of Fraud Protection System</p>
        </div>
        <div class="content">
          <p style="margin-top: 0;">Dear ${data.lawyerName || 'Counsel'},</p>
          
          <p>This automated notice is to inform you that a <strong>spatial conflict</strong> has been detected affecting your client, <strong>${data.userName || 'the claimant'}</strong>, regarding land claim <strong>Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'}</strong>.</p>

          <div class="urgent-notice">
            <p><strong>⚠️ URGENT:</strong> A rival claim with ${data.overlapPercentage?.toFixed(1) || 'N/A'}% coordinate overlap has been detected. Immediate legal review is recommended.</p>
          </div>

          <div class="section">
            <h3>Conflict Details</h3>
            <table class="data-table">
              <tr>
                <td>Claim Reference</td>
                <td>${data.claimId || 'N/A'}</td>
              </tr>
              <tr>
                <td>Overlap Percentage</td>
                <td style="color: #EF4444; font-weight: bold;">${data.overlapPercentage?.toFixed(1) || 'N/A'}%</td>
              </tr>
              <tr>
                <td>Detection Timestamp</td>
                <td>${data.detectionTimestamp || new Date().toISOString()}</td>
              </tr>
              <tr>
                <td>Client Priority Date</td>
                <td>${data.buyerPriorityDate || 'Pending verification'}</td>
              </tr>
              <tr>
                <td>Rival Claim Date</td>
                <td>${data.rivalClaimDate || 'Under investigation'}</td>
              </tr>
              ${data.sellerName ? `
              <tr>
                <td>Seller/Grantor</td>
                <td>${data.sellerName}</td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div class="section">
            <h3>Blockchain Evidence</h3>
            <table class="data-table">
              <tr>
                <td>Priority Hash</td>
                <td style="font-family: monospace; font-size: 11px; word-break: break-all;">${data.blockchainHash || 'Not yet anchored'}</td>
              </tr>
              ${data.blockchainTxUrl ? `
              <tr>
                <td>Blockchain Record</td>
                <td><a href="${data.blockchainTxUrl}" style="color: #0F172A;">View Transaction →</a></td>
              </tr>
              ` : ''}
            </table>
          </div>

          <div style="margin: 30px 0;">
            <a href="${data.conflictMapUrl || baseUrl + '/admin/conflicts'}" class="button">View Conflict Map</a>
            <a href="${baseUrl}/claims/${data.claimId}" class="button" style="background: #475569;">View Full Claim</a>
          </div>

          <p style="font-size: 13px; color: #64748B;">This evidence packet is generated automatically by the Land Registry Valley of Fraud Protection System. All timestamps are cryptographically verified and admissible as digital evidence.</p>

          <p style="margin-bottom: 0;">Respectfully,<br><strong>Land Registry Automated Systems</strong></p>
        </div>
        <div class="footer">
          <p><strong>CONFIDENTIAL LEGAL COMMUNICATION</strong></p>
          <p>This email contains privileged information intended for legal counsel. If you received this in error, please delete immediately.</p>
          <p>Land Registry • support@landregistry.africa • ${baseUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `

  return {
    subject: `[EVIDENCE PACKET] Spatial Conflict - Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'} - Client: ${data.userName || 'N/A'}`,
    html,
    text: `CONFLICT EVIDENCE PACKET\n\nDear ${data.lawyerName || 'Counsel'},\n\nA spatial conflict has been detected affecting your client, ${data.userName || 'the claimant'}, regarding Parcel #${data.parcelId || data.claimId?.slice(0, 8) || 'N/A'}.\n\nConflict Details:\n- Overlap: ${data.overlapPercentage?.toFixed(1) || 'N/A'}%\n- Detected: ${data.detectionTimestamp || new Date().toISOString()}\n- Client Priority: ${data.buyerPriorityDate || 'Pending'}\n- Rival Claim: ${data.rivalClaimDate || 'Under investigation'}\n\nBlockchain Hash: ${data.blockchainHash || 'Not yet anchored'}\n\nView conflict map: ${data.conflictMapUrl || baseUrl + '/admin/conflicts'}\n\nThis is an automated legal notice from Land Registry.`,
  }
}

// Export all templates
export const emailTemplates = {
  welcome: getWelcomeEmail,
  verificationComplete: getVerificationCompleteEmail,
  nftMinted: getNFTMintedEmail,
  paymentConfirmation: getPaymentConfirmationEmail,
  lowCredits: getLowCreditsEmail,
  requestDemo: getRequestDemoEmail,
  conflictAlert: getConflictAlertEmail,
  evidencePacket: getEvidencePacketEmail,
}
