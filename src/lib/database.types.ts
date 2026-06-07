/**
 * Tipos generados manualmente para la base de datos Supabase de Alqia Virtual Builder.
 * En producción real estos se generan con: pnpm supabase gen types typescript --project-id TU_ID
 * Actualizar este archivo cada vez que cambie el schema.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          slug: string
          plan: 'starter' | 'professional' | 'enterprise'
          status: 'active' | 'suspended' | 'cancelled'
          owner_user_id: string
          settings: Json
          billing_email: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tenants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tenants']['Insert']>
      }
      product_categories: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          workspace_id: string
          name: string
          slug: string
          description: string | null
          icon: string | null
          order: number
          parent_id: string | null
          vertical_key: string | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_categories']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['product_categories']['Insert']>
      }
      products: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          workspace_id: string
          category_id: string
          name: string
          sku: string
          description_short: string | null
          description_long: string | null
          width: number
          depth: number
          height: number
          unit: 'cm' | 'm' | 'ft'
          thumbnail_url: string | null
          default_model_asset_id: string | null
          default_model_url: string | null
          default_color: string | null
          geometry_type: string | null
          is_scene_prop: boolean
          is_quotable: boolean
          price: number | null
          is_public: boolean
          status: 'active' | 'inactive' | 'draft'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      product_variants: {
        Row: {
          id: string
          tenant_id: string
          product_id: string
          name: string
          sku: string
          width: number
          depth: number
          height: number
          color: string | null
          material: string | null
          model_asset_id: string | null
          price_delta: number | null
          status: 'active' | 'inactive'
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
      }
      assets_3d: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          name: string
          asset_type: 'model' | 'texture' | 'environment' | 'thumbnail' | 'icon'
          file_url: string
          thumbnail_url: string | null
          file_format: 'glb' | 'gltf' | 'obj' | 'fbx' | 'usdz'
          file_size: number
          optimized_file_url: string | null
          dimensions: Json
          polycount: number | null
          status: 'uploaded' | 'processing' | 'optimized' | 'failed' | 'active' | 'archived'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['assets_3d']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['assets_3d']['Insert']>
      }
      builder_projects: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          workspace_id: string
          scene_id: string
          project_number: string
          name: string
          description: string | null
          client_name: string | null
          client_email: string | null
          client_phone: string | null
          client_company: string | null
          client_city: string | null
          status: 'draft' | 'saved' | 'shared' | 'quote_requested' | 'in_review' | 'quoted' | 'won' | 'lost' | 'archived'
          source: string | null
          public_token: string | null
          created_by: string
          assigned_to: string | null
          ai_summary: string | null
          quote_requested_at: string | null
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['builder_projects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['builder_projects']['Insert']>
      }
      project_objects: {
        Row: {
          id: string
          tenant_id: string
          project_id: string
          product_id: string
          variant_id: string | null
          asset_3d_id: string | null
          name: string
          position_x: number
          position_y: number
          position_z: number
          rotation_x: number
          rotation_y: number
          rotation_z: number
          scale_x: number
          scale_y: number
          scale_z: number
          color: string | null
          material_id: string | null
          quantity: number
          locked: boolean
          configuration: Json
          metadata: Json
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['project_objects']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['project_objects']['Insert']>
      }
      quote_requests: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          project_id: string
          client_name: string
          client_email: string | null
          client_phone: string | null
          client_company: string | null
          message: string | null
          preferred_contact_channel: 'email' | 'phone' | 'whatsapp' | 'in_person' | null
          consent_status: boolean
          status: 'new' | 'assigned' | 'contacted' | 'quoted' | 'closed' | 'archived'
          assigned_to: string | null
          portalia_opportunity_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['quote_requests']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['quote_requests']['Insert']>
      }
      analytics_events: {
        Row: {
          id: string
          tenant_id: string
          company_id: string
          workspace_id: string
          project_id: string | null
          event_type: string
          event_payload: Json
          session_id: string
          user_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['analytics_events']['Row'], 'id' | 'created_at'>
        Update: never
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
