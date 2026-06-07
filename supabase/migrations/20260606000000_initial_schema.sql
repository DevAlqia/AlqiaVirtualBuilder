-- ─────────────────────────────────────────────────────────────────────────────
-- Alqia Virtual Builder — Schema de Base de Datos Supabase
-- Ejecutar en: Supabase Dashboard → SQL Editor → New Query
-- Versión: 0.1.0
-- ─────────────────────────────────────────────────────────────────────────────

-- ── Extensiones ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Tenants ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tenants (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  plan          TEXT NOT NULL DEFAULT 'starter' CHECK (plan IN ('starter','professional','enterprise')),
  status        TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','cancelled')),
  owner_user_id UUID,
  settings      JSONB NOT NULL DEFAULT '{}',
  billing_email TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Product Categories ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_categories (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id    UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id   UUID NOT NULL,
  workspace_id UUID NOT NULL,
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL,
  description  TEXT,
  icon         TEXT,
  "order"      INTEGER NOT NULL DEFAULT 0,
  parent_id    UUID REFERENCES product_categories(id),
  vertical_key TEXT,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, slug)
);

-- ── Products ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id               UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id              UUID NOT NULL,
  workspace_id            UUID NOT NULL,
  category_id             UUID NOT NULL REFERENCES product_categories(id),
  name                    TEXT NOT NULL,
  sku                     TEXT NOT NULL,
  description_short       TEXT,
  description_long        TEXT,
  width                   NUMERIC NOT NULL DEFAULT 0,
  depth                   NUMERIC NOT NULL DEFAULT 0,
  height                  NUMERIC NOT NULL DEFAULT 0,
  unit                    TEXT NOT NULL DEFAULT 'cm' CHECK (unit IN ('cm','m','ft')),
  thumbnail_url           TEXT,
  default_model_asset_id  UUID,
  default_model_url       TEXT,
  default_color           TEXT,
  geometry_type           TEXT,
  is_scene_prop           BOOLEAN NOT NULL DEFAULT FALSE,
  is_quotable             BOOLEAN NOT NULL DEFAULT TRUE,
  price                   NUMERIC,
  is_public               BOOLEAN NOT NULL DEFAULT FALSE,
  status                  TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('active','inactive','draft')),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- ── Product Variants ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id        UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  product_id       UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  sku              TEXT NOT NULL,
  width            NUMERIC NOT NULL DEFAULT 0,
  depth            NUMERIC NOT NULL DEFAULT 0,
  height           NUMERIC NOT NULL DEFAULT 0,
  color            TEXT,
  material         TEXT,
  model_asset_id   UUID,
  price_delta      NUMERIC DEFAULT 0,
  status           TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tenant_id, sku)
);

-- ── Assets 3D ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS assets_3d (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id           UUID NOT NULL,
  name                 TEXT NOT NULL,
  asset_type           TEXT NOT NULL CHECK (asset_type IN ('model','texture','environment','thumbnail','icon')),
  file_url             TEXT NOT NULL,
  thumbnail_url        TEXT,
  file_format          TEXT NOT NULL CHECK (file_format IN ('glb','gltf','obj','fbx','usdz')),
  file_size            BIGINT NOT NULL DEFAULT 0,
  optimized_file_url   TEXT,
  dimensions           JSONB NOT NULL DEFAULT '{"width":0,"depth":0,"height":0}',
  polycount            INTEGER,
  status               TEXT NOT NULL DEFAULT 'uploaded' CHECK (status IN ('uploaded','processing','optimized','failed','active','archived')),
  created_by           UUID NOT NULL,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Builder Projects ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS builder_projects (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id            UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id           UUID NOT NULL,
  workspace_id         UUID NOT NULL,
  scene_id             TEXT NOT NULL,
  project_number       TEXT NOT NULL,
  name                 TEXT NOT NULL DEFAULT 'Nuevo proyecto',
  description          TEXT,
  client_name          TEXT,
  client_email         TEXT,
  client_phone         TEXT,
  client_company       TEXT,
  client_city          TEXT,
  status               TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','saved','shared','quote_requested','in_review','quoted','won','lost','archived')),
  source               TEXT DEFAULT 'internal',
  public_token         TEXT UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  created_by           UUID NOT NULL,
  assigned_to          UUID,
  ai_summary           TEXT,
  quote_requested_at   TIMESTAMPTZ,
  metadata             JSONB NOT NULL DEFAULT '{}',
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Project Objects ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS project_objects (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id     UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id    UUID NOT NULL REFERENCES builder_projects(id) ON DELETE CASCADE,
  product_id    UUID NOT NULL,
  variant_id    UUID,
  asset_3d_id   UUID,
  name          TEXT NOT NULL,
  position_x    NUMERIC NOT NULL DEFAULT 0,
  position_y    NUMERIC NOT NULL DEFAULT 0,
  position_z    NUMERIC NOT NULL DEFAULT 0,
  rotation_x    NUMERIC NOT NULL DEFAULT 0,
  rotation_y    NUMERIC NOT NULL DEFAULT 0,
  rotation_z    NUMERIC NOT NULL DEFAULT 0,
  scale_x       NUMERIC NOT NULL DEFAULT 1,
  scale_y       NUMERIC NOT NULL DEFAULT 1,
  scale_z       NUMERIC NOT NULL DEFAULT 1,
  color         TEXT,
  material_id   UUID,
  quantity      INTEGER NOT NULL DEFAULT 1,
  locked        BOOLEAN NOT NULL DEFAULT FALSE,
  configuration JSONB NOT NULL DEFAULT '{}',
  metadata      JSONB NOT NULL DEFAULT '{}',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Quote Requests ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quote_requests (
  id                          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id                   UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id                  UUID NOT NULL,
  project_id                  UUID NOT NULL REFERENCES builder_projects(id),
  client_name                 TEXT NOT NULL,
  client_email                TEXT,
  client_phone                TEXT,
  client_company              TEXT,
  message                     TEXT,
  preferred_contact_channel   TEXT CHECK (preferred_contact_channel IN ('email','phone','whatsapp','in_person')),
  consent_status              BOOLEAN NOT NULL DEFAULT FALSE,
  status                      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','assigned','contacted','quoted','closed','archived')),
  assigned_to                 UUID,
  portalia_opportunity_id     TEXT,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Analytics Events ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id       UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  company_id      UUID NOT NULL,
  workspace_id    UUID NOT NULL,
  project_id      UUID,
  event_type      TEXT NOT NULL,
  event_payload   JSONB NOT NULL DEFAULT '{}',
  session_id      TEXT NOT NULL,
  user_id         UUID,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Índices de rendimiento ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_product_categories_tenant_vertical ON product_categories(tenant_id, vertical_key);
CREATE INDEX IF NOT EXISTS idx_products_tenant_category ON products(tenant_id, category_id);
CREATE INDEX IF NOT EXISTS idx_products_tenant_status ON products(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_builder_projects_tenant_status ON builder_projects(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_project_objects_project ON project_objects(project_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_tenant_status ON quote_requests(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_analytics_tenant_type ON analytics_events(tenant_id, event_type);

-- ── Triggers updated_at ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'tenants','product_categories','products','product_variants',
    'assets_3d','builder_projects','project_objects','quote_requests'
  ] LOOP
    EXECUTE FORMAT('
      DROP TRIGGER IF EXISTS trg_updated_at ON %I;
      CREATE TRIGGER trg_updated_at
        BEFORE UPDATE ON %I
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    ', t, t);
  END LOOP;
END $$;

-- ── Row Level Security (activar antes de producción real) ──────────────────────
-- ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE products ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE builder_projects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE project_objects ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
--
-- Ejemplo de política por tenant (descomenta cuando tengas auth real):
-- CREATE POLICY "tenant_isolation" ON products
--   USING (tenant_id = (auth.jwt() -> 'app_metadata' ->> 'tenant_id')::UUID);

-- ── Tenant seed (demo) ────────────────────────────────────────────────────────
-- Descomenta solo para entorno de desarrollo:
-- INSERT INTO tenants (id, name, slug, plan, billing_email)
-- VALUES (
--   '00000000-0000-0000-0000-000000000001',
--   'Alqia Demo',
--   'alqia-demo',
--   'professional',
--   'demo@alqia.mx'
-- ) ON CONFLICT (slug) DO NOTHING;
