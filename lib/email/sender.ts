// Email Sender - Ready for integration with Resend, SendGrid, or other providers
// Currently configured as a placeholder that logs emails in development

import { EmailTemplate, TemplateData, emailTemplates } from './templates'

interface SendEmailOptions {
  to: string
  template: keyof typeof emailTemplates
  data: TemplateData
}

interface SendEmailResult {
  success: boolean
  messageId?: string
  error?: string
}

// Check if email service is configured
const isEmailConfigured = () => {
  return !!(
    process.env.RESEND_API_KEY ||
    process.env.SENDGRID_API_KEY ||
    process.env.AWS_SES_ACCESS_KEY
  )
}

// Send email using configured provider
export async function sendEmail(options: SendEmailOptions): Promise<SendEmailResult> {
  const { to, template, data } = options
  
  // Get the email template
  const templateFn = emailTemplates[template]
  if (!templateFn) {
    return { success: false, error: `Unknown template: ${template}` }
  }
  
  const emailContent = templateFn(data)
  
  // In development or when no email service is configured, log the email
  if (process.env.NODE_ENV === 'development' || !isEmailConfigured()) {
    console.log('📧 Email would be sent:')
    console.log('  To:', to)
    console.log('  Subject:', emailContent.subject)
    console.log('  Template:', template)
    console.log('  Data:', JSON.stringify(data, null, 2))
    
    return { 
      success: true, 
      messageId: `dev-${Date.now()}`,
    }
  }
  
  // Resend integration
  if (process.env.RESEND_API_KEY) {
    return sendWithResend(to, emailContent)
  }
  
  // SendGrid integration
  if (process.env.SENDGRID_API_KEY) {
    return sendWithSendGrid(to, emailContent)
  }
  
  return { success: false, error: 'No email service configured' }
}

// Resend implementation
async function sendWithResend(to: string, content: EmailTemplate): Promise<SendEmailResult> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Land Registry <noreply@landregistry.africa>',
        to: [to],
        subject: content.subject,
        html: content.html,
        text: content.text,
      }),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to send email')
    }
    
    const result = await response.json()
    return { success: true, messageId: result.id }
  } catch (error: any) {
    console.error('Resend error:', error)
    return { success: false, error: error.message }
  }
}

// SendGrid implementation
async function sendWithSendGrid(to: string, content: EmailTemplate): Promise<SendEmailResult> {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@landregistry.africa' },
        subject: content.subject,
        content: [
          { type: 'text/plain', value: content.text },
          { type: 'text/html', value: content.html },
        ],
      }),
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Failed to send email')
    }
    
    const messageId = response.headers.get('x-message-id') || `sg-${Date.now()}`
    return { success: true, messageId }
  } catch (error: any) {
    console.error('SendGrid error:', error)
    return { success: false, error: error.message }
  }
}

// Convenience functions for common emails
export const sendWelcomeEmail = (to: string, userName: string) =>
  sendEmail({ to, template: 'welcome', data: { userName } })

export const sendVerificationCompleteEmail = (
  to: string,
  data: { userName: string; claimId: string; verificationStatus: string; confidenceScore?: number }
) => sendEmail({ to, template: 'verificationComplete', data })

export const sendNFTMintedEmail = (
  to: string,
  data: { userName: string; tokenId: string; transactionHash: string }
) => sendEmail({ to, template: 'nftMinted', data })

export const sendPaymentConfirmationEmail = (
  to: string,
  data: { userName: string; planName: string; creditsAmount: number }
) => sendEmail({ to, template: 'paymentConfirmation', data })

export const sendLowCreditsEmail = (
  to: string,
  data: { userName: string; creditsAmount: number }
) => sendEmail({ to, template: 'lowCredits', data })
