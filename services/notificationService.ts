/**
 * Notification Service
 * Handles conflict alerts, evidence packets, and in-app notifications
 * Part of the Valley of Fraud Protection System
 */

import { createClient } from '@/lib/supabase/client'
import { sendEmail } from '@/lib/email/sender'

// Types
export interface ConflictData {
  claimId: string
  conflictingClaimId: string
  overlapPercentage: number
  detectionTimestamp: string
  buyerName: string
  buyerEmail: string
  lawyerName?: string
  lawyerEmail?: string
  sellerName?: string
  sellerId?: string
  parcelId?: string
  blockchainHash?: string
  blockchainTxUrl?: string
  conflictMapUrl?: string
  buyerPriorityDate?: string
  rivalClaimDate?: string
}

export interface AlertData {
  userId: string
  claimId: string
  conflictingClaimId?: string
  alertType: AlertType
  severity: AlertSeverity
  title: string
  message: string
  overlapPercentage?: number
  blockchainHash?: string
  conflictMapUrl?: string
  recipientType: RecipientType
  recipientEmail?: string
  metadata?: Record<string, any>
}

export type AlertType = 
  | 'CONFLICT_DETECTED'
  | 'DOUBLE_SALE_SUSPECTED'
  | 'PRIORITY_ESTABLISHED'
  | 'LAWYER_NOTIFIED'
  | 'SELLER_FLAGGED'
  | 'RESOLUTION_UPDATE'

export type AlertSeverity = 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type RecipientType = 'BUYER' | 'LAWYER' | 'SELLER' | 'ADMIN'

export interface NotificationResult {
  success: boolean
  alertId?: string
  emailSent?: boolean
  error?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://landregistry.africa'

/**
 * Notification Service Class
 */
export class NotificationService {
  private supabase = createClient()

  /**
   * Send conflict alert to buyer and optionally lawyer
   * Main entry point when spatial conflict is detected
   */
  async sendConflictAlert(conflictData: ConflictData): Promise<NotificationResult> {
    try {
      // Run all independent notifications in parallel
      const promises: Promise<NotificationResult>[] = [
        this.notifyBuyer(conflictData),
        ...(conflictData.lawyerEmail ? [this.sendEvidencePacket(conflictData)] : []),
        ...(conflictData.sellerId ? [this.flagSellerForAudit(conflictData)] : []),
      ]

      const results = await Promise.all(promises)
      const buyerResult = results[0]
      const allSuccess = results.every(r => r.success)

      return {
        success: allSuccess,
        alertId: buyerResult.alertId,
        emailSent: results.some(r => r.emailSent),
      }
    } catch (error: any) {
      console.error('sendConflictAlert error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Notify buyer of detected conflict
   */
  private async notifyBuyer(conflictData: ConflictData): Promise<NotificationResult> {
    try {
      // Fetch buyer profile and send email in parallel
      const [{ data: profile }, emailResult] = await Promise.all([
        this.supabase
          .from('user_profiles')
          .select('id')
          .eq('email', conflictData.buyerEmail)
          .single(),
        sendEmail({
          to: conflictData.buyerEmail,
          template: 'conflictAlert',
          data: {
            userName: conflictData.buyerName,
            claimId: conflictData.claimId,
            parcelId: conflictData.parcelId || conflictData.claimId.slice(0, 8),
            overlapPercentage: conflictData.overlapPercentage,
            detectionTimestamp: conflictData.detectionTimestamp,
            blockchainHash: conflictData.blockchainHash,
            blockchainTxUrl: conflictData.blockchainTxUrl,
            buyerPriorityDate: conflictData.buyerPriorityDate,
            lawyerName: conflictData.lawyerName,
            conflictMapUrl: conflictData.conflictMapUrl || `${baseUrl}/admin/conflicts?claim=${conflictData.claimId}`,
          },
        }),
      ])

      const userId = profile?.id

      if (!userId) {
        console.warn('Buyer user ID not found for email:', conflictData.buyerEmail)
      }

      // Create in-app alert (requires userId, so done after profile fetch)
      let alertId: string | undefined
      if (userId) {
        const alertResult = await this.createInAppAlert({
          userId,
          claimId: conflictData.claimId,
          conflictingClaimId: conflictData.conflictingClaimId,
          alertType: conflictData.overlapPercentage >= 50 ? 'DOUBLE_SALE_SUSPECTED' : 'CONFLICT_DETECTED',
          severity: conflictData.overlapPercentage >= 50 ? 'CRITICAL' : 'HIGH',
          title: `⚠️ Potential Title Conflict Detected`,
          message: `A ${conflictData.overlapPercentage.toFixed(1)}% overlap has been detected with another claim. Your Priority of Sale status is being verified.`,
          overlapPercentage: conflictData.overlapPercentage,
          blockchainHash: conflictData.blockchainHash,
          conflictMapUrl: conflictData.conflictMapUrl || `${baseUrl}/admin/conflicts?claim=${conflictData.claimId}`,
          recipientType: 'BUYER',
          recipientEmail: conflictData.buyerEmail,
          metadata: {
            rivalClaimId: conflictData.conflictingClaimId,
            detectionTimestamp: conflictData.detectionTimestamp,
          },
        })
        alertId = alertResult.alertId

        // Update alert with email status
        if (alertId && emailResult.success) {
          await this.supabase
            .from('security_alerts')
            .update({
              is_email_sent: true,
              email_sent_at: new Date().toISOString(),
            })
            .eq('id', alertId)
        }
      }

      return {
        success: true,
        alertId,
        emailSent: emailResult.success,
      }
    } catch (error: any) {
      console.error('notifyBuyer error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Send Evidence Packet to lawyer
   */
  async sendEvidencePacket(conflictData: ConflictData): Promise<NotificationResult> {
    try {
      // Send email and fetch lawyer profile in parallel
      const [emailResult, { data: lawyerProfile }] = await Promise.all([
        sendEmail({
          to: conflictData.lawyerEmail!,
          template: 'evidencePacket',
          data: {
            lawyerName: conflictData.lawyerName || 'Counsel',
            buyerName: conflictData.buyerName,
            claimId: conflictData.claimId,
            parcelId: conflictData.parcelId || conflictData.claimId.slice(0, 8),
            overlapPercentage: conflictData.overlapPercentage,
            detectionTimestamp: conflictData.detectionTimestamp,
            blockchainHash: conflictData.blockchainHash,
            blockchainTxUrl: conflictData.blockchainTxUrl,
            buyerPriorityDate: conflictData.buyerPriorityDate,
            rivalClaimDate: conflictData.rivalClaimDate,
            conflictMapUrl: conflictData.conflictMapUrl || `${baseUrl}/admin/conflicts?claim=${conflictData.claimId}`,
            sellerName: conflictData.sellerName,
          },
        }),
        this.supabase
          .from('user_profiles')
          .select('id')
          .eq('email', conflictData.lawyerEmail)
          .single(),
      ])

      // Create in-app notification for lawyer if they have an account
      if (lawyerProfile?.id) {
        await this.createInAppAlert({
          userId: lawyerProfile.id,
          claimId: conflictData.claimId,
          conflictingClaimId: conflictData.conflictingClaimId,
          alertType: 'LAWYER_NOTIFIED',
          severity: 'HIGH',
          title: `Evidence Packet: Conflict for ${conflictData.buyerName}`,
          message: `A spatial conflict has been detected for your client's land claim. Evidence packet attached.`,
          overlapPercentage: conflictData.overlapPercentage,
          blockchainHash: conflictData.blockchainHash,
          recipientType: 'LAWYER',
          recipientEmail: conflictData.lawyerEmail,
        })
      }

      return {
        success: true,
        emailSent: emailResult.success,
      }
    } catch (error: any) {
      console.error('sendEvidencePacket error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Flag seller for internal audit
   */
  async flagSellerForAudit(conflictData: ConflictData): Promise<NotificationResult> {
    try {
      // Record seller flag in verification logs
      await this.supabase.from('verification_logs').insert({
        claim_id: conflictData.claimId,
        agent_name: 'NotificationService',
        agent_version: '1.0',
        input_data: {
          sellerId: conflictData.sellerId,
          sellerName: conflictData.sellerName,
          conflictingClaimId: conflictData.conflictingClaimId,
          overlapPercentage: conflictData.overlapPercentage,
        },
        output_data: {
          action: 'SELLER_FLAGGED_FOR_AUDIT',
          reason: 'Potential double-sale detected',
          severity: conflictData.overlapPercentage >= 50 ? 'CRITICAL' : 'HIGH',
        },
        confidence_score: 1 - (conflictData.overlapPercentage / 100),
        execution_time_ms: 0,
      })

      // Create admin alert
      await this.createInAppAlert({
        userId: 'admin', // Will be handled specially
        claimId: conflictData.claimId,
        conflictingClaimId: conflictData.conflictingClaimId,
        alertType: 'SELLER_FLAGGED',
        severity: 'CRITICAL',
        title: `🚨 Seller Flagged: ${conflictData.sellerName || 'Unknown'}`,
        message: `Seller has been flagged for potential double-sale. ${conflictData.overlapPercentage.toFixed(1)}% overlap detected.`,
        overlapPercentage: conflictData.overlapPercentage,
        recipientType: 'ADMIN',
        metadata: {
          sellerId: conflictData.sellerId,
          sellerName: conflictData.sellerName,
        },
      })

      return { success: true }
    } catch (error: any) {
      console.error('flagSellerForAudit error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Create in-app alert
   */
  async createInAppAlert(alertData: AlertData): Promise<NotificationResult> {
    try {
      // Handle admin alerts specially
      let userId = alertData.userId
      if (userId === 'admin') {
        // Get first admin user
        const { data: adminUser } = await this.supabase
          .from('user_profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .single()
        
        if (!adminUser) {
          console.warn('No admin user found for alert')
          return { success: false, error: 'No admin user found' }
        }
        userId = adminUser.id
      }

      const { data, error } = await this.supabase
        .from('security_alerts')
        .insert({
          user_id: userId,
          claim_id: alertData.claimId,
          conflicting_claim_id: alertData.conflictingClaimId,
          alert_type: alertData.alertType,
          severity: alertData.severity,
          title: alertData.title,
          message: alertData.message,
          overlap_percentage: alertData.overlapPercentage,
          blockchain_hash: alertData.blockchainHash,
          conflict_map_url: alertData.conflictMapUrl,
          recipient_type: alertData.recipientType,
          recipient_email: alertData.recipientEmail,
          metadata: alertData.metadata || {},
        })
        .select('id')
        .single()

      if (error) {
        console.error('createInAppAlert error:', error)
        return { success: false, error: error.message }
      }

      return { success: true, alertId: data?.id }
    } catch (error: any) {
      console.error('createInAppAlert error:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get unread alerts for a user
   */
  async getUnreadAlerts(userId: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase
        .from('security_alerts')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('getUnreadAlerts error:', error)
        return []
      }

      return data || []
    } catch (error) {
      console.error('getUnreadAlerts error:', error)
      return []
    }
  }

  /**
   * Get unread alert count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const { count, error } = await this.supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('getUnreadCount error:', error)
        return 0
      }

      return count || 0
    } catch (error) {
      console.error('getUnreadCount error:', error)
      return 0
    }
  }

  /**
   * Check if user has critical alerts
   */
  async hasCriticalAlerts(userId: string): Promise<boolean> {
    try {
      const { count, error } = await this.supabase
        .from('security_alerts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false)
        .in('severity', ['HIGH', 'CRITICAL'])

      if (error) {
        console.error('hasCriticalAlerts error:', error)
        return false
      }

      return (count || 0) > 0
    } catch (error) {
      console.error('hasCriticalAlerts error:', error)
      return false
    }
  }

  /**
   * Mark alert as read
   */
  async markAsRead(alertId: string, userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .update({ is_read: true })
        .eq('id', alertId)
        .eq('user_id', userId)

      if (error) {
        console.error('markAsRead error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('markAsRead error:', error)
      return false
    }
  }

  /**
   * Mark all alerts as read for a user
   */
  async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from('security_alerts')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false)

      if (error) {
        console.error('markAllAsRead error:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('markAllAsRead error:', error)
      return false
    }
  }
}

