// ─── Tenant ────────────────────────────────────────────────────────────────────
export interface Tenant {
  id: string
  name: string
  slug: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'suspended' | 'cancelled'
  owner_user_id: string
  settings: Record<string, unknown>
  billing_email: string
  created_at: string
  updated_at: string
}

// ─── Company ───────────────────────────────────────────────────────────────────
export interface Company {
  id: string
  tenant_id: string
  name: string
  slug: string
  industry: string
  website?: string
  logo_url?: string
  primary_color?: string
  secondary_color?: string
  contact_email?: string
  contact_phone?: string
  settings: Record<string, unknown>
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  tenant_id: string
  auth_user_id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  role_id: string
  status: 'active' | 'inactive' | 'pending'
  preferences: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ─── Role ──────────────────────────────────────────────────────────────────────
export interface Role {
  id: string
  tenant_id: string
  name: string
  description?: string
  permissions: Record<string, boolean>
  is_system_role: boolean
  created_at: string
  updated_at: string
}

// ─── Workspace ─────────────────────────────────────────────────────────────────
export type VerticalTemplateKey =
  | 'industrial_storage'
  | 'furniture_kitchen'
  | 'real_estate'
  | 'retail_layout'
  | 'medical_space'
  | 'event_stand'
  | 'exterior_enclosures'
  | 'interior_design'
  | 'architecture_concept'

export interface Workspace {
  id: string
  tenant_id: string
  company_id: string
  name: string
  vertical_template: VerticalTemplateKey
  default_scene_id?: string
  settings: Record<string, unknown>
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

// ─── VerticalTemplate ──────────────────────────────────────────────────────────
export interface VerticalTemplate {
  id: string
  name: string
  key: VerticalTemplateKey
  description: string
  default_settings: Record<string, unknown>
  default_categories: string[]
  default_rules: Record<string, unknown>
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── Scene ─────────────────────────────────────────────────────────────────────
export type SceneType = 'empty_floor' | 'warehouse' | 'workshop' | 'showroom' | 'office' | 'retail'
export type SceneUnit = 'cm' | 'm' | 'ft'
export type BackgroundType = 'color' | 'gradient' | 'image' | 'hdri'

export interface Scene {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  name: string
  scene_type: SceneType
  width: number
  depth: number
  height: number
  unit: SceneUnit
  background_type: BackgroundType
  floor_material: string
  wall_enabled: boolean
  wall_color?: string
  wall_material?: string
  grid_enabled: boolean
  camera_settings: Record<string, unknown>
  lighting_settings: Record<string, unknown>
  environment_settings: Record<string, unknown>
  status: 'active' | 'inactive' | 'archived'
  created_at: string
  updated_at: string
}

// ─── ProductCategory ───────────────────────────────────────────────────────────
export interface ProductCategory {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  name: string
  slug: string
  description?: string
  icon?: string
  order: number
  parent_id?: string
  vertical_key?: VerticalTemplateKey
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── Geometry hint for 3D rendering ──────────────────────────────────────────
export type GeometryType =
  | 'box_tall' | 'box_flat' | 'shelf_rack' | 'panel_v' | 'vehicle' | 'seating'
  | 'cabinet' | 'kitchen_unit' | 'closet' | 'medical_bed' | 'counter' | 'gondola' | 'stand_modular' | 'lamp'
  | 'door' | 'window_frame' | 'plant_pot' | 'divider_panel' | 'carpet_rug' | 'sign_totem' | 'ceiling_lamp'
  | 'wall_straight' | 'wall_low' | 'column' | 'roof_flat' | 'roof_slope' | 'staircase' | 'terrain_base' | 'arch_opening'
  | 'bed' | 'steel_beam' | 'rebar_bundle' | 'glass_panel'

// ─── Product ───────────────────────────────────────────────────────────────────
export interface Product {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  category_id: string
  name: string
  sku: string
  description_short?: string
  description_long?: string
  width: number
  depth: number
  height: number
  unit: SceneUnit
  thumbnail_url?: string
  default_model_asset_id?: string
  default_model_url?: string
  default_color?: string
  geometry_type?: GeometryType
  is_scene_prop?: boolean
  is_quotable?: boolean
  price?: number
  is_public: boolean
  status: 'active' | 'inactive' | 'draft'
  created_at: string
  updated_at: string
}

// ─── ProductVariant ────────────────────────────────────────────────────────────
export interface ProductVariant {
  id: string
  tenant_id: string
  product_id: string
  name: string
  sku: string
  width: number
  depth: number
  height: number
  color?: string
  material?: string
  model_asset_id?: string
  price_delta?: number
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── Asset3D ───────────────────────────────────────────────────────────────────
export type Asset3DType = 'model' | 'texture' | 'environment' | 'thumbnail' | 'icon'
export type Asset3DFormat = 'glb' | 'gltf' | 'obj' | 'fbx' | 'usdz'
export type Asset3DStatus = 'uploaded' | 'processing' | 'optimized' | 'failed' | 'active' | 'archived'

export interface Asset3D {
  id: string
  tenant_id: string
  company_id: string
  name: string
  asset_type: Asset3DType
  file_url: string
  thumbnail_url?: string
  file_format: Asset3DFormat
  file_size: number
  optimized_file_url?: string
  dimensions: { width: number; depth: number; height: number }
  polycount?: number
  status: Asset3DStatus
  created_by: string
  created_at: string
  updated_at: string
}

// ─── BuilderProject ────────────────────────────────────────────────────────────
export type ProjectStatus =
  | 'draft'
  | 'saved'
  | 'shared'
  | 'quote_requested'
  | 'in_review'
  | 'quoted'
  | 'won'
  | 'lost'
  | 'archived'

export interface BuilderProject {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  scene_id: string
  project_number: string
  name: string
  description?: string
  client_name?: string
  client_email?: string
  client_phone?: string
  client_company?: string
  client_city?: string
  status: ProjectStatus
  source?: string
  public_token?: string
  created_by: string
  assigned_to?: string
  ai_summary?: string
  quote_requested_at?: string
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ─── ProjectObject ─────────────────────────────────────────────────────────────
export interface ProjectObject {
  id: string
  tenant_id: string
  project_id: string
  product_id: string
  variant_id?: string
  asset_3d_id?: string
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
  color?: string
  material_id?: string
  quantity: number
  locked: boolean
  configuration: Record<string, unknown>
  metadata: Record<string, unknown>
  created_at: string
  updated_at: string
}

// ─── ProjectSnapshot ───────────────────────────────────────────────────────────
export interface ProjectSnapshot {
  id: string
  tenant_id: string
  project_id: string
  snapshot_name: string
  scene_data: Record<string, unknown>
  objects_data: ProjectObject[]
  thumbnail_url?: string
  created_by: string
  created_at: string
}

// ─── ProjectExport ─────────────────────────────────────────────────────────────
export type ExportType = 'pdf' | 'png' | 'jpg' | 'json' | 'proposal'
export type ExportStatus = 'pending' | 'processing' | 'ready' | 'failed'

export interface ProjectExport {
  id: string
  tenant_id: string
  project_id: string
  export_type: ExportType
  file_url?: string
  thumbnail_url?: string
  status: ExportStatus
  generated_by: string
  created_at: string
}

// ─── QuoteRequest ──────────────────────────────────────────────────────────────
export type QuoteRequestStatus = 'new' | 'assigned' | 'contacted' | 'quoted' | 'closed' | 'archived'
export type ContactChannel = 'email' | 'phone' | 'whatsapp' | 'in_person'

export interface QuoteRequest {
  id: string
  tenant_id: string
  company_id: string
  project_id: string
  client_name: string
  client_email?: string
  client_phone?: string
  client_company?: string
  message?: string
  preferred_contact_channel?: ContactChannel
  consent_status: boolean
  status: QuoteRequestStatus
  assigned_to?: string
  portalia_opportunity_id?: string
  created_at: string
  updated_at: string
}

// ─── AiBuilderSuggestion ───────────────────────────────────────────────────────
export type SuggestionType =
  | 'missing_product'
  | 'inefficient_layout'
  | 'upsell'
  | 'alternative_product'
  | 'incomplete_project'
  | 'quote_ready'
  | 'commercial_summary'

export interface AiBuilderSuggestion {
  id: string
  tenant_id: string
  project_id: string
  suggestion_type: SuggestionType
  title: string
  description: string
  evidence: Record<string, unknown>
  recommended_action?: string
  status: 'pending' | 'viewed' | 'applied' | 'dismissed'
  created_at: string
  resolved_at?: string
}

// ─── AnalyticsEvent ────────────────────────────────────────────────────────────
export interface AnalyticsEvent {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  project_id?: string
  event_type: string
  event_payload: Record<string, unknown>
  session_id: string
  user_id?: string
  created_at: string
}

// ─── EmbedConfig ───────────────────────────────────────────────────────────────
export type EmbedType = 'iframe' | 'subdomain' | 'native'

export interface EmbedConfig {
  id: string
  tenant_id: string
  company_id: string
  workspace_id: string
  embed_type: EmbedType
  allowed_domains: string[]
  public_url?: string
  subdomain?: string
  theme_settings: Record<string, unknown>
  lead_form_settings: Record<string, unknown>
  status: 'active' | 'inactive'
  created_at: string
  updated_at: string
}

// ─── ProjectShare ──────────────────────────────────────────────────────────────
export type ShareAccessMode = 'view_only' | 'comment_only' | 'quote_enabled' | 'approval_enabled'

export interface ProjectShareSnapshot {
  project: BuilderProject
  objects: ProjectObject[]
  scene: Scene
  products: Product[]
  vertical_key?: string
}

export interface ProjectShare {
  id: string
  tenant_id: string
  company_id: string
  project_id: string
  snapshot_id?: string
  share_token: string
  public_url: string
  title: string
  message?: string
  access_mode: ShareAccessMode
  allow_comments: boolean
  allow_quote_request: boolean
  allow_pdf_download: boolean
  show_prices: boolean
  expires_at?: string
  revoked_at?: string
  created_by?: string
  created_at: string
  updated_at: string
  metadata?: Record<string, unknown>
  snapshot?: ProjectShareSnapshot
}

export type ClientCommentType = 'general' | 'change_request' | 'approval' | 'question'

export interface ClientComment {
  id: string
  tenant_id: string
  project_id: string
  share_id: string
  client_name: string
  client_email?: string
  comment: string
  comment_type: ClientCommentType
  created_at: string
  metadata?: Record<string, unknown>
}

// ─── AuditLog ──────────────────────────────────────────────────────────────────
export interface AuditLog {
  id: string
  tenant_id: string
  actor_type: 'user' | 'system' | 'ai'
  actor_id: string
  action: string
  entity_type: string
  entity_id: string
  before?: Record<string, unknown>
  after?: Record<string, unknown>
  ip_address?: string
  user_agent?: string
  created_at: string
}
