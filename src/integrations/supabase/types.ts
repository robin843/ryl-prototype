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
      admin_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: []
      }
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
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "analytics_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
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
      api_keys: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          is_global: boolean
          key_hash: string
          key_prefix: string
          last_used_at: string | null
          name: string
          scopes: string[]
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          key_hash: string
          key_prefix: string
          last_used_at?: string | null
          name?: string
          scopes?: string[]
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          is_global?: boolean
          key_hash?: string
          key_prefix?: string
          last_used_at?: string | null
          name?: string
          scopes?: string[]
          user_id?: string | null
        }
        Relationships: []
      }
      brand_accounts: {
        Row: {
          billing_address: Json | null
          budget_cents: number | null
          commission_rate_percent: number | null
          company_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          has_seen_tutorial: boolean
          id: string
          industry: string | null
          logo_url: string | null
          status: string
          updated_at: string
          user_id: string
          verified_at: string | null
          website_url: string | null
        }
        Insert: {
          billing_address?: Json | null
          budget_cents?: number | null
          commission_rate_percent?: number | null
          company_name: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          has_seen_tutorial?: boolean
          id?: string
          industry?: string | null
          logo_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
          verified_at?: string | null
          website_url?: string | null
        }
        Update: {
          billing_address?: Json | null
          budget_cents?: number | null
          commission_rate_percent?: number | null
          company_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          has_seen_tutorial?: boolean
          id?: string
          industry?: string | null
          logo_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      brand_attribution_events: {
        Row: {
          attribution_type: string
          brand_id: string
          created_at: string
          episode_id: string | null
          id: string
          product_id: string | null
          revenue_cents: number | null
          time_to_purchase_seconds: number | null
          touchpoints: Json | null
          user_id: string | null
        }
        Insert: {
          attribution_type: string
          brand_id: string
          created_at?: string
          episode_id?: string | null
          id?: string
          product_id?: string | null
          revenue_cents?: number | null
          time_to_purchase_seconds?: number | null
          touchpoints?: Json | null
          user_id?: string | null
        }
        Update: {
          attribution_type?: string
          brand_id?: string
          created_at?: string
          episode_id?: string | null
          id?: string
          product_id?: string | null
          revenue_cents?: number | null
          time_to_purchase_seconds?: number | null
          touchpoints?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_attribution_events_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_attribution_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "brand_attribution_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_attribution_events_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_attribution_events_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_creator_partnerships: {
        Row: {
          brand_id: string
          commission_rate_percent: number | null
          created_at: string
          creator_id: string
          id: string
          status: string
          total_clicks: number | null
          total_conversions: number | null
          total_revenue_cents: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          commission_rate_percent?: number | null
          created_at?: string
          creator_id: string
          id?: string
          status?: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_revenue_cents?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          commission_rate_percent?: number | null
          created_at?: string
          creator_id?: string
          id?: string
          status?: string
          total_clicks?: number | null
          total_conversions?: number | null
          total_revenue_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_creator_partnerships_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_genre_performance: {
        Row: {
          avg_order_value_cents: number | null
          brand_id: string
          clicks: number | null
          conversion_rate: number | null
          conversions: number | null
          ctr: number | null
          genre: string
          id: string
          impressions: number | null
          period_end: string
          period_start: string
          revenue_cents: number | null
          updated_at: string
        }
        Insert: {
          avg_order_value_cents?: number | null
          brand_id: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          ctr?: number | null
          genre: string
          id?: string
          impressions?: number | null
          period_end?: string
          period_start?: string
          revenue_cents?: number | null
          updated_at?: string
        }
        Update: {
          avg_order_value_cents?: number | null
          brand_id?: string
          clicks?: number | null
          conversion_rate?: number | null
          conversions?: number | null
          ctr?: number | null
          genre?: string
          id?: string
          impressions?: number | null
          period_end?: string
          period_start?: string
          revenue_cents?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_genre_performance_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_notifications: {
        Row: {
          brand_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          title: string
          type: string
        }
        Insert: {
          brand_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          title: string
          type: string
        }
        Update: {
          brand_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_notifications_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_products: {
        Row: {
          brand_id: string
          budget_cents: number | null
          campaign_name: string | null
          cpa_rate_cents: number | null
          cpc_rate_cents: number | null
          created_at: string
          ends_at: string | null
          genre_tags: string[] | null
          id: string
          product_id: string
          revenue_share_percent: number | null
          ryl_exclusive_price_cents: number | null
          spent_cents: number | null
          starts_at: string | null
          status: string
          stock_level: number | null
          stock_warning_threshold: number | null
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget_cents?: number | null
          campaign_name?: string | null
          cpa_rate_cents?: number | null
          cpc_rate_cents?: number | null
          created_at?: string
          ends_at?: string | null
          genre_tags?: string[] | null
          id?: string
          product_id: string
          revenue_share_percent?: number | null
          ryl_exclusive_price_cents?: number | null
          spent_cents?: number | null
          starts_at?: string | null
          status?: string
          stock_level?: number | null
          stock_warning_threshold?: number | null
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget_cents?: number | null
          campaign_name?: string | null
          cpa_rate_cents?: number | null
          cpc_rate_cents?: number | null
          created_at?: string
          ends_at?: string | null
          genre_tags?: string[] | null
          id?: string
          product_id?: string
          revenue_share_percent?: number | null
          ryl_exclusive_price_cents?: number | null
          spent_cents?: number | null
          starts_at?: string | null
          status?: string
          stock_level?: number | null
          stock_warning_threshold?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_products_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_transactions: {
        Row: {
          amount_cents: number
          brand_id: string
          created_at: string
          description: string | null
          id: string
          product_id: string | null
          purchase_intent_id: string | null
          type: string
        }
        Insert: {
          amount_cents: number
          brand_id: string
          created_at?: string
          description?: string | null
          id?: string
          product_id?: string | null
          purchase_intent_id?: string | null
          type: string
        }
        Update: {
          amount_cents?: number
          brand_id?: string
          created_at?: string
          description?: string | null
          id?: string
          product_id?: string | null
          purchase_intent_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_transactions_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_transactions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_transactions_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_likes: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          episode_id: string
          id: string
          likes_count: number
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          episode_id: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          episode_id?: string
          id?: string
          likes_count?: number
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      content_quality_scores: {
        Row: {
          avg_watch_percent: number | null
          completion_rate: number | null
          conversion_rate: number | null
          cpm_w: number | null
          episode_id: string
          freshness_score: number | null
          hotspot_ctr: number | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          avg_watch_percent?: number | null
          completion_rate?: number | null
          conversion_rate?: number | null
          cpm_w?: number | null
          episode_id: string
          freshness_score?: number | null
          hotspot_ctr?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          avg_watch_percent?: number | null
          completion_rate?: number | null
          conversion_rate?: number | null
          cpm_w?: number | null
          episode_id?: string
          freshness_score?: number | null
          hotspot_ctr?: number | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_quality_scores_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "content_quality_scores_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_quality_scores_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: true
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_follows: {
        Row: {
          created_at: string
          creator_id: string
          follower_id: string
          id: string
          notifications_enabled: boolean
        }
        Insert: {
          created_at?: string
          creator_id: string
          follower_id: string
          id?: string
          notifications_enabled?: boolean
        }
        Update: {
          created_at?: string
          creator_id?: string
          follower_id?: string
          id?: string
          notifications_enabled?: boolean
        }
        Relationships: []
      }
      creator_quality_scores: {
        Row: {
          cpm_w_avg: number | null
          creator_id: string
          featured_boost: number | null
          quality_tier: string | null
          return_rate: number | null
          total_conversions: number | null
          updated_at: string | null
          viewer_retention_30d: number | null
        }
        Insert: {
          cpm_w_avg?: number | null
          creator_id: string
          featured_boost?: number | null
          quality_tier?: string | null
          return_rate?: number | null
          total_conversions?: number | null
          updated_at?: string | null
          viewer_retention_30d?: number | null
        }
        Update: {
          cpm_w_avg?: number | null
          creator_id?: string
          featured_boost?: number | null
          quality_tier?: string | null
          return_rate?: number | null
          total_conversions?: number | null
          updated_at?: string | null
          viewer_retention_30d?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_quality_scores_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_quality_scores_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_referral_codes: {
        Row: {
          code: string
          created_at: string
          creator_id: string
          id: string
        }
        Insert: {
          code: string
          created_at?: string
          creator_id: string
          id?: string
        }
        Update: {
          code?: string
          created_at?: string
          creator_id?: string
          id?: string
        }
        Relationships: []
      }
      creator_referrals: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      episode_hotspots: {
        Row: {
          animation_type: string
          created_at: string
          end_frame: number | null
          end_time: number
          episode_id: string
          height: number
          id: string
          keyframes: Json
          position_x: number
          position_y: number
          product_id: string
          start_frame: number | null
          start_time: number
          width: number
        }
        Insert: {
          animation_type?: string
          created_at?: string
          end_frame?: number | null
          end_time?: number
          episode_id: string
          height?: number
          id?: string
          keyframes?: Json
          position_x: number
          position_y: number
          product_id: string
          start_frame?: number | null
          start_time?: number
          width?: number
        }
        Update: {
          animation_type?: string
          created_at?: string
          end_frame?: number | null
          end_time?: number
          episode_id?: string
          height?: number
          id?: string
          keyframes?: Json
          position_x?: number
          position_y?: number
          product_id?: string
          start_frame?: number | null
          start_time?: number
          width?: number
        }
        Relationships: [
          {
            foreignKeyName: "episode_hotspots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "episode_hotspots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episode_hotspots_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
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
          end_time_seconds: number | null
          episode_number: number
          fps: number
          hls_url: string | null
          id: string
          is_premium: boolean | null
          segment_number: number | null
          series_id: string
          source_video_asset_id: string | null
          start_time_seconds: number | null
          status: string
          thumbnail_position: string
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
          end_time_seconds?: number | null
          episode_number: number
          fps?: number
          hls_url?: string | null
          id?: string
          is_premium?: boolean | null
          segment_number?: number | null
          series_id: string
          source_video_asset_id?: string | null
          start_time_seconds?: number | null
          status?: string
          thumbnail_position?: string
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
          end_time_seconds?: number | null
          episode_number?: number
          fps?: number
          hls_url?: string | null
          id?: string
          is_premium?: boolean | null
          segment_number?: number | null
          series_id?: string
          source_video_asset_id?: string | null
          start_time_seconds?: number | null
          status?: string
          thumbnail_position?: string
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
            foreignKeyName: "episodes_source_video_asset_id_fkey"
            columns: ["source_video_asset_id"]
            isOneToOne: false
            referencedRelation: "video_assets"
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
      hotspot_clicks: {
        Row: {
          created_at: string
          creator_id: string
          destination_url: string
          episode_id: string
          final_redirect_url: string
          hotspot_id: string
          id: string
          ip_hash: string | null
          product_id: string | null
          referrer: string | null
          session_id: string | null
          source: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          destination_url: string
          episode_id: string
          final_redirect_url: string
          hotspot_id: string
          id?: string
          ip_hash?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          destination_url?: string
          episode_id?: string
          final_redirect_url?: string
          hotspot_id?: string
          id?: string
          ip_hash?: string | null
          product_id?: string | null
          referrer?: string | null
          session_id?: string | null
          source?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_clicks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "hotspot_clicks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_clicks_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_clicks_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "episode_hotspots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hotspot_clicks_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      hotspot_variants: {
        Row: {
          created_at: string
          hotspot_id: string
          id: string
          position_x: number
          position_y: number
          variant_name: string
          weight: number
        }
        Insert: {
          created_at?: string
          hotspot_id: string
          id?: string
          position_x: number
          position_y: number
          variant_name?: string
          weight?: number
        }
        Update: {
          created_at?: string
          hotspot_id?: string
          id?: string
          position_x?: number
          position_y?: number
          variant_name?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "hotspot_variants_hotspot_id_fkey"
            columns: ["hotspot_id"]
            isOneToOne: false
            referencedRelation: "episode_hotspots"
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
      notification_queue: {
        Row: {
          body: string
          completed_at: string | null
          created_at: string
          error_log: Json | null
          failed_count: number | null
          icon: string | null
          id: string
          image: string | null
          payload: Json | null
          processed_at: string | null
          sent_count: number | null
          status: Database["public"]["Enums"]["notification_status"]
          target_series_id: string | null
          target_type: string
          target_user_id: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          url: string | null
        }
        Insert: {
          body: string
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_count?: number | null
          icon?: string | null
          id?: string
          image?: string | null
          payload?: Json | null
          processed_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["notification_status"]
          target_series_id?: string | null
          target_type?: string
          target_user_id?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          url?: string | null
        }
        Update: {
          body?: string
          completed_at?: string | null
          created_at?: string
          error_log?: Json | null
          failed_count?: number | null
          icon?: string | null
          id?: string
          image?: string | null
          payload?: Json | null
          processed_at?: string | null
          sent_count?: number | null
          status?: Database["public"]["Enums"]["notification_status"]
          target_series_id?: string | null
          target_type?: string
          target_user_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_queue_target_series_id_fkey"
            columns: ["target_series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_triggers: {
        Row: {
          created_at: string
          id: string
          payload: Json
          processed: boolean
          processed_at: string | null
          reference_id: string | null
          target_creator_id: string | null
          target_user_id: string | null
          trigger_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          reference_id?: string | null
          target_creator_id?: string | null
          target_user_id?: string | null
          trigger_type: string
        }
        Update: {
          created_at?: string
          id?: string
          payload?: Json
          processed?: boolean
          processed_at?: string | null
          reference_id?: string | null
          target_creator_id?: string | null
          target_user_id?: string | null
          trigger_type?: string
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
          content_categories: string[] | null
          created_at: string
          description: string
          id: string
          portfolio_url: string | null
          primary_platform: string | null
          referral_code: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company_name: string
          content_categories?: string[] | null
          created_at?: string
          description: string
          id?: string
          portfolio_url?: string | null
          primary_platform?: string | null
          referral_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company_name?: string
          content_categories?: string[] | null
          created_at?: string
          description?: string
          id?: string
          portfolio_url?: string | null
          primary_platform?: string | null
          referral_code?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          body: string | null
          created_at: string | null
          helpful_count: number | null
          id: string
          is_verified_purchase: boolean | null
          product_id: string
          purchase_intent_id: string | null
          rating: number
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id: string
          purchase_intent_id?: string | null
          rating: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_verified_purchase?: boolean | null
          product_id?: string
          purchase_intent_id?: string | null
          rating?: number
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "product_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      product_waitlist: {
        Row: {
          created_at: string
          email: string
          episode_id: string | null
          id: string
          notified_at: string | null
          product_id: string
        }
        Insert: {
          created_at?: string
          email: string
          episode_id?: string | null
          id?: string
          notified_at?: string | null
          product_id: string
        }
        Update: {
          created_at?: string
          email?: string
          episode_id?: string | null
          id?: string
          notified_at?: string | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_waitlist_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "product_waitlist_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_waitlist_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_waitlist_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age_at_signup: number | null
          avatar_url: string | null
          bio: string | null
          birthdate: string | null
          company_name: string | null
          created_at: string
          credits_cents: number
          display_name: string | null
          gender: string | null
          has_seen_studio_tutorial: boolean | null
          id: string
          onboarding_completed_at: string | null
          onboarding_step: number
          revenue_tier: Database["public"]["Enums"]["revenue_tier"] | null
          stripe_account_id: string | null
          stripe_account_status: string | null
          stripe_onboarding_completed: boolean | null
          total_sales_cents: number | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          age_at_signup?: number | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          company_name?: string | null
          created_at?: string
          credits_cents?: number
          display_name?: string | null
          gender?: string | null
          has_seen_studio_tutorial?: boolean | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_step?: number
          revenue_tier?: Database["public"]["Enums"]["revenue_tier"] | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          total_sales_cents?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          age_at_signup?: number | null
          avatar_url?: string | null
          bio?: string | null
          birthdate?: string | null
          company_name?: string | null
          created_at?: string
          credits_cents?: number
          display_name?: string | null
          gender?: string | null
          has_seen_studio_tutorial?: boolean | null
          id?: string
          onboarding_completed_at?: string | null
          onboarding_step?: number
          revenue_tier?: Database["public"]["Enums"]["revenue_tier"] | null
          stripe_account_id?: string | null
          stripe_account_status?: string | null
          stripe_onboarding_completed?: boolean | null
          total_sales_cents?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      promo_code_usages: {
        Row: {
          created_at: string
          discount_applied_cents: number
          id: string
          promo_code_id: string
          purchase_intent_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          discount_applied_cents: number
          id?: string
          promo_code_id: string
          purchase_intent_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          discount_applied_cents?: number
          id?: string
          promo_code_id?: string
          purchase_intent_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_code_usages_promo_code_id_fkey"
            columns: ["promo_code_id"]
            isOneToOne: false
            referencedRelation: "promo_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_code_usages_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
        ]
      }
      promo_codes: {
        Row: {
          campaign_name: string | null
          code: string
          created_at: string
          creator_id: string
          discount_amount_cents: number | null
          discount_percent: number | null
          expires_at: string | null
          id: string
          status: string
          updated_at: string
          usage_limit: number | null
          used_count: number
        }
        Insert: {
          campaign_name?: string | null
          code: string
          created_at?: string
          creator_id: string
          discount_amount_cents?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
        }
        Update: {
          campaign_name?: string | null
          code?: string
          created_at?: string
          creator_id?: string
          discount_amount_cents?: number | null
          discount_percent?: number | null
          expires_at?: string | null
          id?: string
          status?: string
          updated_at?: string
          usage_limit?: number | null
          used_count?: number
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
          brand_id: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          expires_at: string
          fulfillment_status: string
          id: string
          idempotency_key: string | null
          shipped_at: string | null
          status: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents: number
          tracking_number: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          brand_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          fulfillment_status?: string
          id?: string
          idempotency_key?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          brand_id?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          expires_at?: string
          fulfillment_status?: string
          id?: string
          idempotency_key?: string | null
          shipped_at?: string | null
          status?: Database["public"]["Enums"]["purchase_intent_status"]
          total_cents?: number
          tracking_number?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchase_intents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brand_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      purchase_returns: {
        Row: {
          created_at: string | null
          creator_id: string | null
          id: string
          product_id: string | null
          purchase_intent_id: string | null
          reason: string | null
          refund_amount_cents: number | null
          stripe_refund_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          product_id?: string | null
          purchase_intent_id?: string | null
          reason?: string | null
          refund_amount_cents?: number | null
          stripe_refund_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          creator_id?: string | null
          id?: string
          product_id?: string | null
          purchase_intent_id?: string | null
          reason?: string | null
          refund_amount_cents?: number | null
          stripe_refund_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "purchase_returns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchase_returns_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth_key: string
          created_at: string
          endpoint: string
          expires_at: string | null
          id: string
          last_used_at: string | null
          p256dh: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          auth_key: string
          created_at?: string
          endpoint: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          p256dh: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          auth_key?: string
          created_at?: string
          endpoint?: string
          expires_at?: string | null
          id?: string
          last_used_at?: string | null
          p256dh?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      referral_commissions: {
        Row: {
          commission_cents: number
          created_at: string
          id: string
          purchase_intent_id: string
          referral_id: string
          sale_amount_cents: number
          status: string
        }
        Insert: {
          commission_cents: number
          created_at?: string
          id?: string
          purchase_intent_id: string
          referral_id: string
          sale_amount_cents: number
          status?: string
        }
        Update: {
          commission_cents?: number
          created_at?: string
          id?: string
          purchase_intent_id?: string
          referral_id?: string
          sale_amount_cents?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_purchase_intent_id_fkey"
            columns: ["purchase_intent_id"]
            isOneToOne: false
            referencedRelation: "purchase_intents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "creator_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_products: {
        Row: {
          created_at: string
          episode_id: string | null
          id: string
          price_alert_enabled: boolean
          product_id: string
          saved_price_cents: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          episode_id?: string | null
          id?: string
          price_alert_enabled?: boolean
          product_id: string
          saved_price_cents?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          episode_id?: string | null
          id?: string
          price_alert_enabled?: boolean
          product_id?: string
          saved_price_cents?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_products_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "saved_products_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_products_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
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
      saved_series: {
        Row: {
          created_at: string
          id: string
          series_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          series_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          series_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_series_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series: {
        Row: {
          category_id: string | null
          cover_url: string | null
          created_at: string
          creator_id: string
          description: string | null
          episode_count: number | null
          genre: string | null
          id: string
          source_video_asset_id: string | null
          status: string
          title: string
          total_views: number | null
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          source_video_asset_id?: string | null
          status?: string
          title: string
          total_views?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          cover_url?: string | null
          created_at?: string
          creator_id?: string
          description?: string | null
          episode_count?: number | null
          genre?: string | null
          id?: string
          source_video_asset_id?: string | null
          status?: string
          title?: string
          total_views?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_source_video_asset_id_fkey"
            columns: ["source_video_asset_id"]
            isOneToOne: false
            referencedRelation: "video_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      series_likes: {
        Row: {
          created_at: string
          id: string
          series_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          series_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          series_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_likes_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
      }
      series_retention_metrics: {
        Row: {
          avg_transition_seconds: number | null
          cliffhanger_score: number | null
          completion_count: number | null
          drop_off_last_5s_count: number | null
          episode_id: string | null
          hook_rate: number | null
          id: string
          past_3s_count: number | null
          period_end: string
          period_start: string
          series_id: string
          total_views: number | null
          transition_count: number | null
          updated_at: string
        }
        Insert: {
          avg_transition_seconds?: number | null
          cliffhanger_score?: number | null
          completion_count?: number | null
          drop_off_last_5s_count?: number | null
          episode_id?: string | null
          hook_rate?: number | null
          id?: string
          past_3s_count?: number | null
          period_end?: string
          period_start?: string
          series_id: string
          total_views?: number | null
          transition_count?: number | null
          updated_at?: string
        }
        Update: {
          avg_transition_seconds?: number | null
          cliffhanger_score?: number | null
          completion_count?: number | null
          drop_off_last_5s_count?: number | null
          episode_id?: string | null
          hook_rate?: number | null
          id?: string
          past_3s_count?: number | null
          period_end?: string
          period_start?: string
          series_id?: string
          total_views?: number | null
          transition_count?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "series_retention_metrics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "series_retention_metrics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_retention_metrics_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "series_retention_metrics_series_id_fkey"
            columns: ["series_id"]
            isOneToOne: false
            referencedRelation: "series"
            referencedColumns: ["id"]
          },
        ]
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
          last_price_change_at: string | null
          name: string
          original_price_cents: number | null
          price_cents: number
          price_history: Json
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
          last_price_change_at?: string | null
          name: string
          original_price_cents?: number | null
          price_cents: number
          price_history?: Json
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
          last_price_change_at?: string | null
          name?: string
          original_price_cents?: number | null
          price_cents?: number
          price_history?: Json
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
      story_share_links: {
        Row: {
          clicks: number
          conversions: number
          created_at: string
          creator_id: string
          episode_id: string | null
          id: string
          product_id: string | null
          sharer_id: string | null
          short_code: string
          target_url: string
        }
        Insert: {
          clicks?: number
          conversions?: number
          created_at?: string
          creator_id: string
          episode_id?: string | null
          id?: string
          product_id?: string | null
          sharer_id?: string | null
          short_code: string
          target_url: string
        }
        Update: {
          clicks?: number
          conversions?: number
          created_at?: string
          creator_id?: string
          episode_id?: string | null
          id?: string
          product_id?: string | null
          sharer_id?: string | null
          short_code?: string
          target_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_share_links_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "story_share_links_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_share_links_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_share_links_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
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
      user_content_scores: {
        Row: {
          affinity_score: number | null
          category_id: string
          engagement_signals: number | null
          id: string
          last_interaction: string | null
          purchase_signals: number | null
          regret_signals: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          affinity_score?: number | null
          category_id: string
          engagement_signals?: number | null
          id?: string
          last_interaction?: string | null
          purchase_signals?: number | null
          regret_signals?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          affinity_score?: number | null
          category_id?: string
          engagement_signals?: number | null
          id?: string
          last_interaction?: string | null
          purchase_signals?: number | null
          regret_signals?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_content_scores_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "interest_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_content_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_content_scores_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
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
      user_notification_preferences: {
        Row: {
          created_at: string
          followed_creators: boolean
          new_episodes: boolean
          order_updates: boolean
          promotions: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          followed_creators?: boolean
          new_episodes?: boolean
          order_updates?: boolean
          promotions?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          followed_creators?: boolean
          new_episodes?: boolean
          order_updates?: boolean
          promotions?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      user_referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          referral_code: string
          referred_id: string
          referred_reward_cents: number
          referrer_id: string
          referrer_reward_cents: number
          rewarded_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referred_reward_cents?: number
          referrer_id: string
          referrer_reward_cents?: number
          rewarded_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referred_reward_cents?: number
          referrer_id?: string
          referrer_reward_cents?: number
          rewarded_at?: string | null
          status?: string
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
      user_streaks: {
        Row: {
          current_streak: number | null
          last_active_date: string | null
          last_commerce_reward_at: string | null
          longest_streak: number | null
          streak_rewards_claimed: Json | null
          total_watch_days: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          current_streak?: number | null
          last_active_date?: string | null
          last_commerce_reward_at?: string | null
          longest_streak?: number | null
          streak_rewards_claimed?: Json | null
          total_watch_days?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          current_streak?: number | null
          last_active_date?: string | null
          last_commerce_reward_at?: string | null
          longest_streak?: number | null
          streak_rewards_claimed?: Json | null
          total_watch_days?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_streaks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_assets: {
        Row: {
          created_at: string
          creator_id: string
          duration_ms: number | null
          duration_seconds: number | null
          hls_url: string | null
          id: string
          status: string
          storage_path: string
          stream_id: string | null
          stream_status: string | null
          thumbnail_url: string | null
        }
        Insert: {
          created_at?: string
          creator_id: string
          duration_ms?: number | null
          duration_seconds?: number | null
          hls_url?: string | null
          id?: string
          status?: string
          storage_path: string
          stream_id?: string | null
          stream_status?: string | null
          thumbnail_url?: string | null
        }
        Update: {
          created_at?: string
          creator_id?: string
          duration_ms?: number | null
          duration_seconds?: number | null
          hls_url?: string | null
          id?: string
          status?: string
          storage_path?: string
          stream_id?: string | null
          stream_status?: string | null
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      watch_history: {
        Row: {
          completed: boolean | null
          created_at: string
          episode_id: string
          id: string
          progress_seconds: number | null
          updated_at: string
          user_id: string
          watched_at: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          episode_id: string
          id?: string
          progress_seconds?: number | null
          updated_at?: string
          user_id: string
          watched_at?: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          episode_id?: string
          id?: string
          progress_seconds?: number | null
          updated_at?: string
          user_id?: string
          watched_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_history_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          attempts: number
          created_at: string
          delivered_at: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          status: string
          subscription_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          event_type: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          subscription_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          delivered_at?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          status?: string
          subscription_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "webhook_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_subscriptions: {
        Row: {
          created_at: string
          events: string[]
          id: string
          is_active: boolean
          secret: string
          updated_at: string
          url: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          secret: string
          updated_at?: string
          url: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          events?: string[]
          id?: string
          is_active?: boolean
          secret?: string
          updated_at?: string
          url?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      creator_follower_stats: {
        Row: {
          creator_id: string | null
          follower_count: number | null
          notification_enabled_count: number | null
        }
        Relationships: []
      }
      episode_social_stats: {
        Row: {
          episode_id: string | null
          is_trending: boolean | null
          purchases_today: number | null
          saves_count: number | null
        }
        Insert: {
          episode_id?: string | null
          is_trending?: never
          purchases_today?: never
          saves_count?: never
        }
        Update: {
          episode_id?: string | null
          is_trending?: never
          purchases_today?: never
          saves_count?: never
        }
        Relationships: []
      }
      product_review_stats: {
        Row: {
          average_rating: number | null
          product_id: string | null
          review_count: number | null
          verified_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "shopable_products"
            referencedColumns: ["id"]
          },
        ]
      }
      public_comment_likes_counts: {
        Row: {
          comment_id: string | null
          like_count: number | null
          user_has_liked: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      public_comments: {
        Row: {
          avatar_url: string | null
          content: string | null
          created_at: string | null
          display_name: string | null
          episode_id: string | null
          id: string | null
          likes_count: number | null
          parent_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episode_social_stats"
            referencedColumns: ["episode_id"]
          },
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "public_episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "public_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      public_episodes: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          episode_number: number | null
          id: string | null
          is_premium: boolean | null
          series_id: string | null
          status: string | null
          thumbnail_url: string | null
          title: string | null
          video_url: string | null
          views: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string | null
          is_premium?: boolean | null
          series_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
          video_url?: string | null
          views?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          episode_number?: number | null
          id?: string | null
          is_premium?: boolean | null
          series_id?: string | null
          status?: string | null
          thumbnail_url?: string | null
          title?: string | null
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
        ]
      }
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company_name: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company_name?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      public_subscriptions: {
        Row: {
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          id: string | null
          producer_tier:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          user_tier:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Insert: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          producer_tier?:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Update: {
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string | null
          producer_tier?:
            | Database["public"]["Enums"]["producer_subscription_tier"]
            | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_tier?:
            | Database["public"]["Enums"]["user_subscription_tier"]
            | null
        }
        Relationships: []
      }
      public_usernames: {
        Row: {
          username: string | null
        }
        Insert: {
          username?: string | null
        }
        Update: {
          username?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_revenue_tier: {
        Args: { sales_cents: number }
        Returns: Database["public"]["Enums"]["revenue_tier"]
      }
      generate_short_code: { Args: { length?: number }; Returns: string }
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
      notification_status:
        | "pending"
        | "processing"
        | "sent"
        | "failed"
        | "partial"
      notification_type:
        | "new_episode"
        | "order_update"
        | "promo"
        | "creator_update"
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
      revenue_tier: "starter" | "pro" | "expert" | "elite"
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
      notification_status: [
        "pending",
        "processing",
        "sent",
        "failed",
        "partial",
      ],
      notification_type: [
        "new_episode",
        "order_update",
        "promo",
        "creator_update",
      ],
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
      revenue_tier: ["starter", "pro", "expert", "elite"],
      user_subscription_tier: ["none", "basic", "premium"],
    },
  },
} as const
