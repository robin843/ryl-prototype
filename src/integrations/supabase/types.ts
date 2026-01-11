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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          created_at: string
          creator_id: string
          episode_id: string | null
          event_type: string
          hotspot_id: string | null
          id: string
          metadata: Json | null
          product_id: string | null
          revenue_cents: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          episode_id?: string | null
          event_type: string
          hotspot_id?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          revenue_cents?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          episode_id?: string | null
          event_type?: string
          hotspot_id?: string | null
          id?: string
          metadata?: Json | null
          product_id?: string | null
          revenue_cents?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "episode_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      episode_hotspots: {
        Row: {
          created_at: string
          end_time: number
          episode_id: string
          id: string
          position_x: number
          position_y: number
          product_id: string
          start_time: number
        }
        Insert: {
          created_at?: string
          end_time?: number
          episode_id: string
          id?: string
          position_x: number
          position_y: number
          product_id: string
          start_time?: number
        }
        Update: {
          created_at?: string
          end_time?: number
          episode_id?: string
          id?: string
          position_x?: number
          position_y?: number
          product_id?: string
          start_time?: number
        }
        Relationships: [
          {
            foreignKeyName: "episode_hotspots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_hotspots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          duration: string | null
          episode_number: number
          id: string
          is_premium: boolean | null
          series_id: string
          status: string
          thumbnail_url: string | null
          title: string
          updated_at: string
          video_asset_id: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          duration?: string | null
          episode_number: number
          id?: string
          is_premium?: boolean | null
          series_id: string
          status?: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          video_asset_id?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          duration?: string | null
          episode_number?: number
          id?: string
          is_premium?: boolean | null
          series_id?: string
          status?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          video_asset_id?: string | null
          video_url?: string | null
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_video_asset_id_fkey"
            columns: ["video_asset_id"]
            isOneToOne: false
            referencedRelation: "video_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_categories: {
        Row: {
          created_at: string
          icon: string
          id: string
          name: string
          name_de: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          icon: string
          id?: string
          name: string
          name_de: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          icon?: string
          id?: string
          name?: string
          name_de?: string
          sort_order?: number
        }
        Relationships: []
      }
      payment_executions: {
        Row: {
          adapter_reference: string | null
          adapter_type: string
          created_at: string
          error_code: string | null
          id: string
          purchase_intent_id: string
          raw_response: Json | null
          status: Database["public"]["Enums"]["payment_execution_status"]
        }
        Insert: {
          adapter_reference?: string | null
          adapter_type: string
          created_at?: string
          error_code?: string | null
          id?: string
          purchase_intent_id: string
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_execution_status"]
        }
        Update: {
          adapter_reference?: string | null
          adapter_type?: string
          created_at?: string
          error_code?: string | null
          id?: string
          purchase_intent_id?: string
          raw_response?: Json | null
          status?: Database["public"]["Enums"]["payment_execution_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_executions_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      producer_applications: {
        Row: {
          company_name: string
          created_at: string
          description: string
          id: string
          portfolio_url: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description: string
          id?: string
          portfolio_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string
          id?: string
          portfolio_url?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age_at_signup: number | null
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          company_name: string | null
          created_at: string
          display_name: string | null
          gender: string | null
          id: string
          onboarding_completed_at: string | null
          onboarding_step: number
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_completed: boolean | null
          total_sales_cents: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age_at_signup?: number | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_step?: number
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          total_sales_cents?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age_at_signup?: number | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          company_name?: string | null
          created_at?: string
          display_name?: string | null
          gender?: string | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_step?: number
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          total_sales_cents?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_events: {
        Row: {
          created_at: string
          event_type: string
          from_status: string | null
          id: string
          metadata: Json | null
          purchase_intent_id: string
          to_status: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          purchase_intent_id: string
          to_status?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          from_status?: string | null
          id?: string
          metadata?: Json | null
          purchase_intent_id?: string
          to_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_events_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      purchase_intents: {
        Row: {
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          expires_at: string
          id: string
          idempotency_key: string | null
          status: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          status?: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          id?: string
          idempotency_key?: string | null
          status?: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchase_items: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          product_id: string
          purchase_intent_id: string
          quantity: number
          unit_price_cents: number
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          product_id: string
          purchase_intent_id: string
          quantity?: number
          unit_price_cents: number
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          product_id?: string
          purchase_intent_id?: string
          quantity?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchase_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_items_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          created_at: string
          episode_id: string | null
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id?: string | null
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string | null
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          episode_count: number | null
          genre: string | null
          id: string
          status: string
          title: string
          total_views: number | null
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          status?: string
          title: string
          total_views?: number | null
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          status?: string
          title?: string
          total_views?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      shopable_products: {
        Row: {
          brand_name: string
          created_at: string
          creator_id: string
          currency: string | null
          description: string | null
          id: string
          image_url: string | null
          name: string
          price_cents: number
          product_url: string | null
          series_id: string | null
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          brand_name: string
          created_at?: string
          creator_id: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price_cents: number
          product_url?: string | null
          series_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          brand_name?: string
          created_at?: string
          creator_id?: string
          currency?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price_cents?: number
          product_url?: string | null
          series_id?: string | null
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shopable_products_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          price_id: string | null
          producer_tier:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          product_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
          user_tier:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          producer_tier?:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
          user_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          price_id?: string | null
          producer_tier?:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          product_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
          user_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Relationships: []
      }
      usage_tracking: {
        Row: {
          created_at: string
          date: string
          episodes_watched: number | null
          id: string
          minutes_watched: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          episodes_watched?: number | null
          id?: string
          minutes_watched?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          episodes_watched?: number | null
          id?: string
          minutes_watched?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          category_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_interests_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      user_payment_methods: {
        Row: {
          adapter_token: string
          adapter_type: string
          created_at: string
          display_hint: string | null
          expires_at: string | null
          id: string
          is_default: boolean
          user_id: string
        }
        Insert: {
          adapter_token: string
          adapter_type: string
          created_at?: string
          display_hint?: string | null
          expires_at?: string | null
          id?: string
          is_default?: boolean
          user_id: string
        }
        Update: {
          adapter_token?: string
          adapter_type?: string
          created_at?: string
          display_hint?: string | null
          expires_at?: string | null
          id?: string
          is_default?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
          verification_notes: string | null
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
          verification_notes?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      video_assets: {
        Row: {
          created_at: string
          creator_id: string
          duration_seconds: number | null
          id: string
          status: string
          storage_path: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          duration_seconds?: number | null
          id?: string
          status?: string
          storage_path: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          duration_seconds?: number | null
          id?: string
          status?: string
          storage_path?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_creator_analytics: {
        Args: { p_creator_id: string; p_timeframe?: string }
        Returns: {
          total_clicks: number
          total_purchases: number
          total_revenue: number
          total_views: number
        }[]
      }
      get_episode_performance: {
        Args: { p_creator_id: string; p_timeframe?: string }
        Returns: {
          hotspot_clicks: number
          id: string
          revenue: number
          title: string
          views: number
        }[]
      }
      get_top_products: {
        Args: { p_creator_id: string; p_timeframe?: string }
        Returns: {
          clicks: number
          id: string
          image_url: string
          name: string
          purchases: number
          revenue: number
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "user" | "verified_producer" | "brand" | "admin"
      payment_execution_status: "pending" | "succeeded" | "failed"
      producer_subscription_tier: "none" | "basic" | "studio" | "enterprise"
      purchase_intent_status:
        | "created"
        | "confirmed"
        | "processing"
        | "completed"
        | "failed"
        | "expired"
        | "refunded"
      user_subscription_tier: "none" | "basic" | "premium"
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
    Enums: {
      app_role: ["user", "verified_producer", "brand", "admin"],
      payment_execution_status: ["pending", "succeeded", "failed"],
      producer_subscription_tier: ["none", "basic", "studio", "enterprise"],
      purchase_intent_status: [
        "created",
        "confirmed",
        "processing",
        "completed",
        "failed",
        "expired",
        "refunded",
      ],
      user_subscription_tier: ["none", "basic", "premium"],
    },
  },
} as const
