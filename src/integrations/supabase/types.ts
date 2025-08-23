export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      echoes: {
        Row: {
          chains: string[] | null
          created_at: string
          event_description: string
          id: string
          is_insured: boolean | null
          nft_token_id: number | null
          oecho_amount: number | null
          premium_amount: number | null
          risk_score: number | null
          simulation_data: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          chains?: string[] | null
          created_at?: string
          event_description: string
          id?: string
          is_insured?: boolean | null
          nft_token_id?: number | null
          oecho_amount?: number | null
          premium_amount?: number | null
          risk_score?: number | null
          simulation_data?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          chains?: string[] | null
          created_at?: string
          event_description?: string
          id?: string
          is_insured?: boolean | null
          nft_token_id?: number | null
          oecho_amount?: number | null
          premium_amount?: number | null
          risk_score?: number | null
          simulation_data?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      insurance_policies: {
        Row: {
          claim_amount: number | null
          coverage_amount: number
          created_at: string
          echo_id: string
          id: string
          is_claimed: boolean | null
          policy_holder_id: string
          premium_paid: number
        }
        Insert: {
          claim_amount?: number | null
          coverage_amount: number
          created_at?: string
          echo_id: string
          id?: string
          is_claimed?: boolean | null
          policy_holder_id: string
          premium_paid: number
        }
        Update: {
          claim_amount?: number | null
          coverage_amount?: number
          created_at?: string
          echo_id?: string
          id?: string
          is_claimed?: boolean | null
          policy_holder_id?: string
          premium_paid?: number
        }
        Relationships: [
          {
            foreignKeyName: "insurance_policies_echo_id_fkey"
            columns: ["echo_id"]
            isOneToOne: false
            referencedRelation: "echoes"
            referencedColumns: ["id"]
          },
        ]
      }
      simulation_snapshots: {
        Row: {
          confidence_score: number | null
          echo_id: string
          id: string
          outcome_data: Json
          timestamp: string
        }
        Insert: {
          confidence_score?: number | null
          echo_id: string
          id?: string
          outcome_data: Json
          timestamp?: string
        }
        Update: {
          confidence_score?: number | null
          echo_id?: string
          id?: string
          outcome_data?: Json
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_snapshots_echo_id_fkey"
            columns: ["echo_id"]
            isOneToOne: false
            referencedRelation: "echoes"
            referencedColumns: ["id"]
          },
        ]
      }
      speculation_bets: {
        Row: {
          actual_outcome: boolean | null
          bet_amount: number
          bettor_id: string
          created_at: string
          echo_id: string
          id: string
          is_claimed: boolean | null
          payout_amount: number | null
          predicted_outcome: boolean
        }
        Insert: {
          actual_outcome?: boolean | null
          bet_amount: number
          bettor_id: string
          created_at?: string
          echo_id: string
          id?: string
          is_claimed?: boolean | null
          payout_amount?: number | null
          predicted_outcome: boolean
        }
        Update: {
          actual_outcome?: boolean | null
          bet_amount?: number
          bettor_id?: string
          created_at?: string
          echo_id?: string
          id?: string
          is_claimed?: boolean | null
          payout_amount?: number | null
          predicted_outcome?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "speculation_bets_echo_id_fkey"
            columns: ["echo_id"]
            isOneToOne: false
            referencedRelation: "echoes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
