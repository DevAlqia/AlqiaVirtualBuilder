/**
 * Demo Asset Registry
 *
 * Registro centralizado de assets 3D para la plataforma demo.
 * Cada asset documenta fuente, licencia y mapeo al catalogo de productos.
 *
 * POLITICA:
 *   Solo usar: CC0, Royalty-free comercial, CC-BY (con atribucion documentada aqui).
 *   NO usar: editoriales, marcas registradas, logos, assets de videojuegos.
 *
 * FUENTES CC0 PRIORITARIAS:
 *   ambientCG    https://ambientcg.com        texturas PBR de alta calidad
 *   Kenney       https://kenney.nl/assets     packs low-poly CC0
 *   Quaternius   https://quaternius.com       packs furniture y nature CC0
 *   Poly Haven   https://polyhaven.com        HDRIs CC0
 *   Poly Pizza   https://poly.pizza           modelos individuales, verificar licencia
 */

export type AssetType    = 'model' | 'texture' | 'hdri' | 'material' | 'prop'
export type AssetFormat  = 'glb' | 'gltf' | 'fbx' | 'obj' | 'png' | 'jpg' | 'hdr' | 'exr'
export type AssetLicense = 'CC0' | 'CC-BY' | 'CC-BY-SA' | 'royalty-free' | 'purchased' | 'Demo-internal'
export type AssetStatus  = 'pending' | 'downloaded' | 'optimized'

export interface DemoAsset {
  id:                    string
  name:                  string
  description:           string
  type:                  AssetType
  format:                AssetFormat
  asset_url:             string        // ruta en /public/assets3d/
  source_url:            string        // URL original de descarga
  thumbnail_url?:        string
  source:                string
  license:               AssetLicense
  author?:               string
  attribution?:          string        // requerido si license === 'CC-BY'
  attribution_required:  boolean
  is_commercial_safe:    boolean
  is_demo_safe:          boolean       // false = no verificado aun, no usar en demo
  recommended_scale?:    number
  default_rotation?:     [number, number, number]
  estimated_size_mb?:    number
  polygon_count?:        'low' | 'medium' | 'high'
  maps_to_products:      string[]
  maps_to_verticals:     string[]
  status:                AssetStatus
  tags:                  string[]
  notes?:                string
  placeholder_geometry?: string        // GeometryType fallback si GLB no carga
}

// ---- Texturas PBR -- ambientCG (CC0) ----------------------------------------

const TEXTURES: DemoAsset[] = [
  {
    id: 'tex-concrete-001',
    name: 'Concrete Floor 001',
    description: 'Piso de concreto gris estandar PBR',
    type: 'texture', format: 'png',
    asset_url: '/assets3d/materials/concrete-floor-001/',
    source_url: 'https://ambientcg.com/get?file=Concrete007_1K-PNG.zip',
    source: 'ambientCG', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['architecture_concept', 'industrial_storage'],
    status: 'pending',
    tags: ['concreto', 'piso', 'exterior', 'industrial'],
  },
  {
    id: 'tex-wood-parquet-001',
    name: 'Wood Parquet 001',
    description: 'Duela de madera PBR para interiores residenciales',
    type: 'texture', format: 'png',
    asset_url: '/assets3d/materials/wood-parquet-001/',
    source_url: 'https://ambientcg.com/get?file=WoodFloor040_1K-PNG.zip',
    source: 'ambientCG', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['interior_design', 'furniture_kitchen'],
    status: 'pending',
    tags: ['madera', 'piso', 'duela', 'interior'],
  },
  {
    id: 'tex-marble-001',
    name: 'Marble 001',
    description: 'Marmol blanco veteado PBR',
    type: 'texture', format: 'png',
    asset_url: '/assets3d/materials/marble-001/',
    source_url: 'https://ambientcg.com/get?file=Marble006_1K-PNG.zip',
    source: 'ambientCG', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['real_estate', 'interior_design'],
    status: 'pending',
    tags: ['marmol', 'piso', 'premium'],
  },
  {
    id: 'tex-brick-001',
    name: 'Brick Wall 001',
    description: 'Muro de ladrillo rojo PBR',
    type: 'texture', format: 'png',
    asset_url: '/assets3d/materials/brick-wall-001/',
    source_url: 'https://ambientcg.com/get?file=Bricks059_1K-PNG.zip',
    source: 'ambientCG', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['architecture_concept', 'exterior_enclosures'],
    status: 'pending',
    tags: ['ladrillo', 'muro', 'exterior'],
  },
  {
    id: 'tex-grass-001',
    name: 'Grass Ground 001',
    description: 'Pasto verde PBR para exterior y jardines',
    type: 'texture', format: 'png',
    asset_url: '/assets3d/materials/grass-001/',
    source_url: 'https://ambientcg.com/get?file=Ground003_1K-PNG.zip',
    source: 'ambientCG', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: ['p-ac-019'],
    maps_to_verticals: ['architecture_concept', 'exterior_enclosures'],
    status: 'pending',
    tags: ['pasto', 'jardin', 'exterior'],
  },
]

// ---- Modelos -- Kenney (CC0) -------------------------------------------------
// furniture-kit: https://kenney.nl/assets/furniture-kit
// building-kit:  https://kenney.nl/assets/building-kit

const KENNEY_MODELS: DemoAsset[] = [
  {
    id: 'mdl-bed-kenney',
    name: 'Bed Single (Kenney Furniture Kit)',
    description: 'Cama individual low-poly con colchon y almohadas',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/bed-single.glb',
    source_url: 'https://kenney.nl/assets/furniture-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.1,
    maps_to_products: ['p-ac-021'],
    maps_to_verticals: ['interior_design', 'real_estate', 'architecture_concept'],
    status: 'pending',
    tags: ['cama', 'dormitorio', 'interior'],
    placeholder_geometry: 'bed',
    notes: 'Descargar furniture-kit.zip, extraer bed.glb',
  },
  {
    id: 'mdl-sofa-kenney',
    name: 'Sofa (Kenney Furniture Kit)',
    description: 'Sofa 3 plazas low-poly',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/sofa-3seat.glb',
    source_url: 'https://kenney.nl/assets/furniture-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.1,
    maps_to_products: ['p-fk-001', 'p-ac-022'],
    maps_to_verticals: ['furniture_kitchen', 'real_estate', 'interior_design'],
    status: 'pending',
    tags: ['sofa', 'sala', 'interior'],
    placeholder_geometry: 'seating',
  },
  {
    id: 'mdl-chair-kenney',
    name: 'Chair (Kenney Furniture Kit)',
    description: 'Silla simple low-poly',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/chair-simple.glb',
    source_url: 'https://kenney.nl/assets/furniture-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.05,
    maps_to_products: [],
    maps_to_verticals: ['event_stand', 'interior_design', 'medical_space'],
    status: 'pending',
    tags: ['silla', 'asiento', 'interior'],
    placeholder_geometry: 'seating',
  },
  {
    id: 'mdl-table-kenney',
    name: 'Table Dining (Kenney Furniture Kit)',
    description: 'Mesa de comedor rectangular low-poly',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/table-dining.glb',
    source_url: 'https://kenney.nl/assets/furniture-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.06,
    maps_to_products: ['p-ac-023'],
    maps_to_verticals: ['furniture_kitchen', 'real_estate', 'interior_design'],
    status: 'pending',
    tags: ['mesa', 'comedor', 'interior'],
    placeholder_geometry: 'box_flat',
  },
  {
    id: 'mdl-door-kenney',
    name: 'Door Standard (Kenney Building Kit)',
    description: 'Puerta con marco y hoja visible',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/doors-windows/door-standard.glb',
    source_url: 'https://kenney.nl/assets/building-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.06,
    maps_to_products: ['p-ac-009', 'p-ac-010'],
    maps_to_verticals: ['architecture_concept', 'interior_design'],
    status: 'pending',
    tags: ['puerta', 'entrada', 'arquitectura'],
    placeholder_geometry: 'door',
  },
  {
    id: 'mdl-window-kenney',
    name: 'Window Double (Kenney Building Kit)',
    description: 'Ventana con marco y vidrio doble hoja',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/doors-windows/window-double.glb',
    source_url: 'https://kenney.nl/assets/building-kit',
    source: 'Kenney', license: 'CC0', author: 'Kenney',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 1.0, polygon_count: 'low', estimated_size_mb: 0.05,
    maps_to_products: ['p-ac-011', 'p-ac-012'],
    maps_to_verticals: ['architecture_concept'],
    status: 'pending',
    tags: ['ventana', 'vidrio', 'arquitectura'],
    placeholder_geometry: 'window_frame',
  },
]

// ---- Modelos -- Quaternius (CC0) ---------------------------------------------
// ultimate-furniture: https://quaternius.com/packs/ultimatefurniture.html
// ultimate-nature:    https://quaternius.com/packs/ultimatenature.html

const QUATERNIUS_MODELS: DemoAsset[] = [
  {
    id: 'mdl-bed-quat',
    name: 'Bed Double (Quaternius Ultimate Furniture)',
    description: 'Cama doble con cabecera, colchon y almohadas',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/bed-double-quat.glb',
    source_url: 'https://quaternius.com/packs/ultimatefurniture.html',
    source: 'Quaternius', license: 'CC0', author: 'Quaternius',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 0.01, polygon_count: 'medium', estimated_size_mb: 0.4,
    maps_to_products: ['p-ac-021b'],
    maps_to_verticals: ['furniture_kitchen', 'real_estate', 'interior_design'],
    status: 'pending',
    tags: ['cama', 'doble', 'premium'],
    placeholder_geometry: 'bed',
    notes: 'Descargar ZIP, extraer solo el modelo de cama. Scale 0.01 para cm -> m.',
  },
  {
    id: 'mdl-sofa-quat',
    name: 'Sofa (Quaternius Ultimate Furniture)',
    description: 'Sofa con respaldo, brazos y cojines detallados',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/interior-design/sofa-quat.glb',
    source_url: 'https://quaternius.com/packs/ultimatefurniture.html',
    source: 'Quaternius', license: 'CC0', author: 'Quaternius',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 0.01, polygon_count: 'medium', estimated_size_mb: 0.3,
    maps_to_products: ['p-ac-022'],
    maps_to_verticals: ['furniture_kitchen', 'interior_design'],
    status: 'pending',
    tags: ['sofa', 'sala', 'premium'],
    placeholder_geometry: 'seating',
  },
  {
    id: 'mdl-tree-quat',
    name: 'Tree Exterior (Quaternius Nature Pack)',
    description: 'Arbol exterior simple low-poly',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/architecture/tree-exterior-01.glb',
    source_url: 'https://quaternius.com/packs/ultimatenature.html',
    source: 'Quaternius', license: 'CC0', author: 'Quaternius',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 0.01, polygon_count: 'low', estimated_size_mb: 0.2,
    maps_to_products: [],
    maps_to_verticals: ['architecture_concept', 'exterior_enclosures'],
    status: 'pending',
    tags: ['arbol', 'exterior', 'jardin'],
    placeholder_geometry: 'plant_pot',
  },
  {
    id: 'mdl-plant-quat',
    name: 'Plant Interior (Quaternius Nature Pack)',
    description: 'Planta de interior en maceta',
    type: 'model', format: 'glb',
    asset_url: '/assets3d/shared-props/plant-interior-01.glb',
    source_url: 'https://quaternius.com/packs/ultimatenature.html',
    source: 'Quaternius', license: 'CC0', author: 'Quaternius',
    attribution_required: false, is_commercial_safe: true, is_demo_safe: false,
    recommended_scale: 0.01, polygon_count: 'low', estimated_size_mb: 0.15,
    maps_to_products: ['sp-plant-01', 'sp-plant-02'],
    maps_to_verticals: ['interior_design', 'real_estate', 'furniture_kitchen'],
    status: 'pending',
    tags: ['planta', 'interior', 'decoracion'],
    placeholder_geometry: 'plant_pot',
  },
]

// ---- HDRIs -- Poly Haven (CC0) -----------------------------------------------

const HDRI_ASSETS: DemoAsset[] = [
  {
    id: 'hdri-studio-001',
    name: 'Studio Small (Poly Haven)',
    description: 'HDRI de estudio neutro para showroom y retail',
    type: 'hdri', format: 'hdr',
    asset_url: '/assets3d/materials/hdri/studio-small.hdr',
    source_url: 'https://polyhaven.com/a/studio_small_08',
    source: 'Poly Haven', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['retail_layout', 'event_stand', 'furniture_kitchen'],
    status: 'pending',
    tags: ['hdri', 'studio', 'iluminacion', 'showroom'],
    notes: 'Descargar en resolucion 1K para web. Usar como environment en BuilderCanvas.',
  },
  {
    id: 'hdri-outdoor-001',
    name: 'Kloofendal Clear (Poly Haven)',
    description: 'HDRI exterior de dia claro para arquitectura',
    type: 'hdri', format: 'hdr',
    asset_url: '/assets3d/materials/hdri/outdoor-clear.hdr',
    source_url: 'https://polyhaven.com/a/kloofendal_48d_partly_cloudy_puresky',
    source: 'Poly Haven', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['architecture_concept', 'exterior_enclosures'],
    status: 'pending',
    tags: ['hdri', 'exterior', 'dia', 'cielo'],
    notes: 'Resolucion 1K suficiente para web.',
  },
  {
    id: 'hdri-interior-001',
    name: 'Artist Workshop (Poly Haven)',
    description: 'HDRI de interior suave para interiorismo',
    type: 'hdri', format: 'hdr',
    asset_url: '/assets3d/materials/hdri/interior-soft.hdr',
    source_url: 'https://polyhaven.com/a/artist_workshop',
    source: 'Poly Haven', license: 'CC0', attribution_required: false,
    is_commercial_safe: true, is_demo_safe: true,
    maps_to_products: [],
    maps_to_verticals: ['interior_design', 'real_estate', 'furniture_kitchen'],
    status: 'pending',
    tags: ['hdri', 'interior', 'suave'],
    notes: 'Resolucion 1K. Iluminacion suave natural.',
  },
]

// ---- Registro completo -------------------------------------------------------

export const demoAssetRegistry: DemoAsset[] = [
  ...TEXTURES,
  ...KENNEY_MODELS,
  ...QUATERNIUS_MODELS,
  ...HDRI_ASSETS,
]

/** Alias para compatibilidad con codigo existente */
export const DEMO_ASSET_REGISTRY = demoAssetRegistry

// ---- Helpers -----------------------------------------------------------------

/** Assets verificados para una vertical */
export function getAssetsForVertical(verticalKey: string): DemoAsset[] {
  return demoAssetRegistry.filter(
    (a) => a.maps_to_verticals.includes(verticalKey) && a.is_demo_safe
  )
}

/** Assets para un producto especifico */
export function getAssetsForProduct(productId: string): DemoAsset[] {
  return demoAssetRegistry.filter((a) => a.maps_to_products.includes(productId))
}

/** Solo assets verificados para demo comercial */
export function getDemoSafeAssets(): DemoAsset[] {
  return demoAssetRegistry.filter((a) => a.is_demo_safe)
}

/** Mejor GLB disponible para un producto (optimized > downloaded > pending) */
export function getBestGLBForProduct(productId: string): DemoAsset | null {
  const candidates = demoAssetRegistry.filter(
    (a) =>
      a.maps_to_products.includes(productId) &&
      a.type === 'model' &&
      (a.format === 'glb' || a.format === 'gltf') &&
      (a.status === 'downloaded' || a.status === 'optimized')
  )
  const order: Record<AssetStatus, number> = { optimized: 0, downloaded: 1, pending: 2 }
  return candidates.sort((a, b) => order[a.status] - order[b.status])[0] ?? null
}

/** Alias de compatibilidad con codigo legado */
export function findAssetByProductId(productId: string): DemoAsset | undefined {
  return getBestGLBForProduct(productId) ?? undefined
}

/** Resumen del estado del registro */
export function getRegistrySummary() {
  const total      = demoAssetRegistry.length
  const pending    = demoAssetRegistry.filter((a) => a.status === 'pending').length
  const downloaded = demoAssetRegistry.filter((a) => a.status === 'downloaded').length
  const optimized  = demoAssetRegistry.filter((a) => a.status === 'optimized').length
  const models     = demoAssetRegistry.filter((a) => a.type === 'model').length
  const textures   = demoAssetRegistry.filter((a) => a.type === 'texture').length
  const hdris      = demoAssetRegistry.filter((a) => a.type === 'hdri').length
  return { total, pending, downloaded, optimized, models, textures, hdris }
}
