export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ClaimStatus =
  | 'PENDING_VERIFICATION'
  | 'AI_VERIFIED'
  | 'PENDING_HUMAN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'DISPUTED'

export type VerificationConfidence = 'HIGH' | 'MEDIUM' | 'LOW'

export type UserRole = 'CLAIMANT' | 'VERIFIER' | 'ADMIN' | 'SUPER_ADMIN'

export type TitleType =
  | 'CERTIFICATE_OF_OCCUPANCY'
  | 'GOVERNOR_CONSENT'
  | 'DEED_OF_ASSIGNMENT'
  | 'STOOL_INDENTURE'
  | 'FAMILY_INDENTURE'
  | 'FREEHOLD'
  | 'CUSTOMARY_FREEHOLD'
  | 'LEASEHOLD'

export type GrantorType =
  | 'INDIVIDUAL'
  | 'STOOL'
  | 'FAMILY'
  | 'STATE'
  | 'CORPORATE'
  | 'TRADITIONAL_AUTHORITY'

export type MintStatus = 'PENDING' | 'VERIFIED' | 'MINTED' | 'FAILED'

export interface WitnessSignature {
  name: string
  id_type?: string
  id_number?: string
  signature_type: 'DIGITAL' | 'THUMBPRINT' | 'SIGNATURE'
  witness_role: 'FAMILY_HEAD' | 'STOOL_REPRESENTATIVE' | 'LEGAL_WITNESS' | 'OTHER'
  signed_at?: string
}

export interface EncumbranceDetail {
  type: 'MORTGAGE' | 'LIEN' | 'EASEMENT' | 'COVENANT' | 'OTHER'
  description: string
  beneficiary?: string
  amount?: number
  registration_date?: string
  expiry_date?: string
}

export interface Database {
  public: {
    Tables: {
      verified_users: {
        Row: {
          id: string
          auth_user_id: string | null
          full_name: string
          email: string
          phone_number: string | null
          role: UserRole
          verification_level: string
          professional_license_number: string | null
          organization: string | null
          is_active: boolean
          verified_at: string | null
          verified_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          auth_user_id?: string | null
          full_name: string
          email: string
          phone_number?: string | null
          role: UserRole
          verification_level?: string
          professional_license_number?: string | null
          organization?: string | null
          is_active?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          auth_user_id?: string | null
          full_name?: string
          email?: string
          phone_number?: string | null
          role?: UserRole
          verification_level?: string
          professional_license_number?: string | null
          organization?: string | null
          is_active?: boolean
          verified_at?: string | null
          verified_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string
          phone_number: string | null
          country_code: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name: string
          phone_number?: string | null
          country_code?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          role?: UserRole
          full_name?: string
          phone_number?: string | null
          country_code?: string
          created_at?: string
          updated_at?: string
        }
      }
      land_claims: {
        Row: {
          id: string
          claimant_id: string
          original_document_url: string
          document_type: string | null
          document_metadata: Json | null
          gps_coordinates: string
          latitude: number
          longitude: number
          land_size_sqm: number | null
          address: string | null
          region: string | null
          country: string
          ai_verification_status: ClaimStatus
          ai_confidence_score: number | null
          ai_confidence_level: VerificationConfidence | null
          ai_verification_metadata: Json | null
          ai_verified_at: string | null
          human_approver_id: string | null
          human_review_notes: string | null
          human_reviewed_at: string | null
          satellite_image_url: string | null
          satellite_verification_score: number | null
          satellite_metadata: Json | null
          blockchain_tx_hash: string | null
          nft_token_id: string | null
          minted_at: string | null
          title_type: TitleType | null
          duration_years: number | null
          document_serial_number: string | null
          parcel_id_barcode: string | null
          grantor_type: GrantorType | null
          witness_signatures_json: Json | null
          legal_jurat_flag: boolean
          survey_plan_url: string | null
          polygon_coordinates: string | null
          is_litigation_flag: boolean
          fraud_confidence_score: number | null
          on_chain_hash: string | null
          mint_status: MintStatus
          traditional_authority_name: string | null
          stool_land_reference: string | null
          family_head_name: string | null
          consent_authority: string | null
          land_use_category: string | null
          encumbrance_details: Json | null
          surveyor_license_number: string | null
          survey_date: string | null
          lands_commission_file_number: string | null
          created_at: string
          updated_at: string
          deleted_at: string | null
        }
        Insert: {
          id?: string
          claimant_id: string
          original_document_url: string
          document_type?: string | null
          document_metadata?: Json | null
          gps_coordinates: string
          latitude: number
          longitude: number
          land_size_sqm?: number | null
          address?: string | null
          region?: string | null
          country?: string
          ai_verification_status?: ClaimStatus
          ai_confidence_score?: number | null
          ai_confidence_level?: VerificationConfidence | null
          ai_verification_metadata?: Json | null
          ai_verified_at?: string | null
          human_approver_id?: string | null
          human_review_notes?: string | null
          human_reviewed_at?: string | null
          satellite_image_url?: string | null
          satellite_verification_score?: number | null
          satellite_metadata?: Json | null
          blockchain_tx_hash?: string | null
          nft_token_id?: string | null
          minted_at?: string | null
          title_type?: TitleType | null
          duration_years?: number | null
          document_serial_number?: string | null
          parcel_id_barcode?: string | null
          grantor_type?: GrantorType | null
          witness_signatures_json?: Json | null
          legal_jurat_flag?: boolean
          survey_plan_url?: string | null
          polygon_coordinates?: string | null
          is_litigation_flag?: boolean
          fraud_confidence_score?: number | null
          on_chain_hash?: string | null
          mint_status?: MintStatus
          traditional_authority_name?: string | null
          stool_land_reference?: string | null
          family_head_name?: string | null
          consent_authority?: string | null
          land_use_category?: string | null
          encumbrance_details?: Json | null
          surveyor_license_number?: string | null
          survey_date?: string | null
          lands_commission_file_number?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
        Update: {
          id?: string
          claimant_id?: string
          original_document_url?: string
          document_type?: string | null
          document_metadata?: Json | null
          gps_coordinates?: string
          latitude?: number
          longitude?: number
          land_size_sqm?: number | null
          address?: string | null
          region?: string | null
          country?: string
          ai_verification_status?: ClaimStatus
          ai_confidence_score?: number | null
          ai_confidence_level?: VerificationConfidence | null
          ai_verification_metadata?: Json | null
          ai_verified_at?: string | null
          human_approver_id?: string | null
          human_review_notes?: string | null
          human_reviewed_at?: string | null
          satellite_image_url?: string | null
          satellite_verification_score?: number | null
          satellite_metadata?: Json | null
          blockchain_tx_hash?: string | null
          nft_token_id?: string | null
          minted_at?: string | null
          title_type?: TitleType | null
          duration_years?: number | null
          document_serial_number?: string | null
          parcel_id_barcode?: string | null
          grantor_type?: GrantorType | null
          witness_signatures_json?: Json | null
          legal_jurat_flag?: boolean
          survey_plan_url?: string | null
          polygon_coordinates?: string | null
          is_litigation_flag?: boolean
          fraud_confidence_score?: number | null
          on_chain_hash?: string | null
          mint_status?: MintStatus
          traditional_authority_name?: string | null
          stool_land_reference?: string | null
          family_head_name?: string | null
          consent_authority?: string | null
          land_use_category?: string | null
          encumbrance_details?: Json | null
          surveyor_license_number?: string | null
          survey_date?: string | null
          lands_commission_file_number?: string | null
          created_at?: string
          updated_at?: string
          deleted_at?: string | null
        }
      }
      verification_logs: {
        Row: {
          id: string
          claim_id: string
          agent_name: string
          agent_version: string | null
          input_data: Json | null
          output_data: Json | null
          confidence_score: number
          execution_time_ms: number | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          agent_name: string
          agent_version?: string | null
          input_data?: Json | null
          output_data?: Json | null
          confidence_score: number
          execution_time_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          agent_name?: string
          agent_version?: string | null
          input_data?: Json | null
          output_data?: Json | null
          confidence_score?: number
          execution_time_ms?: number | null
          error_message?: string | null
          created_at?: string
        }
      }
      claim_disputes: {
        Row: {
          id: string
          claim_id: string
          disputed_by: string
          dispute_reason: string
          supporting_documents: Json | null
          status: string
          resolved_by: string | null
          resolution_notes: string | null
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          claim_id: string
          disputed_by: string
          dispute_reason: string
          supporting_documents?: Json | null
          status?: string
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          claim_id?: string
          disputed_by?: string
          dispute_reason?: string
          supporting_documents?: Json | null
          status?: string
          resolved_by?: string | null
          resolution_notes?: string | null
          created_at?: string
          resolved_at?: string | null
        }
      }
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: string
          credits: number
          created_at: string
          updated_at: string
          last_sign_in_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: string
          credits?: number
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: string
          credits?: number
          created_at?: string
          updated_at?: string
          last_sign_in_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: string
          status: string
          paystack_subscription_code: string | null
          paystack_customer_code: string | null
          current_period_start: string | null
          current_period_end: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: string
          status?: string
          paystack_subscription_code?: string | null
          paystack_customer_code?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: string
          status?: string
          paystack_subscription_code?: string | null
          paystack_customer_code?: string | null
          current_period_start?: string | null
          current_period_end?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: string
          description: string | null
          paystack_reference: string | null
          balance_after: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: string
          description?: string | null
          paystack_reference?: string | null
          balance_after?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: string
          description?: string | null
          paystack_reference?: string | null
          balance_after?: number | null
          created_at?: string
        }
      }
      verification_results: {
        Row: {
          id: string
          claim_id: string
          overall_confidence: number
          confidence_level: string
          recommendation: string
          document_analysis_score: number | null
          gps_validation_score: number | null
          cross_reference_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          claim_id: string
          overall_confidence: number
          confidence_level: string
          recommendation: string
          document_analysis_score?: number | null
          gps_validation_score?: number | null
          cross_reference_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          claim_id?: string
          overall_confidence?: number
          confidence_level?: string
          recommendation?: string
          document_analysis_score?: number | null
          gps_validation_score?: number | null
          cross_reference_score?: number | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_claim_with_confidence: {
        Args: {
          claim_uuid: string
        }
        Returns: {
          claim_id: string
          status: ClaimStatus
          confidence_score: number
          confidence_level: VerificationConfidence
        }[]
      }
      add_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: number
      }
      deduct_credits: {
        Args: {
          p_user_id: string
          p_amount: number
          p_type: string
          p_description?: string
          p_reference_id?: string
        }
        Returns: number
      }
      get_credit_balance: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
      has_sufficient_credits: {
        Args: {
          p_user_id: string
          p_required_amount: number
        }
        Returns: boolean
      }
      get_credit_history: {
        Args: {
          p_user_id: string
          p_limit?: number
          p_offset?: number
        }
        Returns: {
          id: string
          amount: number
          type: string
          description: string | null
          balance_after: number | null
          created_at: string
        }[]
      }
    }
    Enums: {
      claim_status: ClaimStatus
      verification_confidence: VerificationConfidence
      user_role: UserRole
      title_type: TitleType
      grantor_type: GrantorType
      mint_status: MintStatus
    }
  }
}
