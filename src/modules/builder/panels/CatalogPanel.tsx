import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'react-router-dom'
import {
  Search, Layers, Plus, Package, Sparkles, Paintbrush, Maximize2, Check,
} from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { useToast } from '@/components/ui/Toast'
import { useBuilderStore } from '@/store/builderStore'
import { catalogService } from '@/services'
import { mockSceneProps, PROP_CATEGORIES } from '@/data/mock/sceneProps'
import { FLOOR_MATERIALS, WALL_COLORS } from '@/data/mock/materials'
import type { Product, ProductCategory, VerticalTemplateKey } from '@/types'
import { cn } from '@/utils/cn'

type PanelTab = 'products' | 'props' | 'materials' | 'space'

const TABS: { key: PanelTab; label: string; Icon: React.FC<{ className?: string }> }[] = [
  { key: 'products',  label: 'Productos',  Icon: Package    },
  { key: 'props',     label: 'Decoracion', Icon: Sparkles   },
  { key: 'materials', label: 'Materiales', Icon: Paintbrush },
  { key: 'space',     label: 'Espacio',    Icon: Maximize2  },
]

const VERTICAL_LABELS: Record<string, string> = {
  industrial_storage: 'Almacenamiento Industrial',
  furniture_kitchen:  'Muebles, Cocinas y Closets',
  real_estate:        'Inmobiliario',
  retail_layout:      'Retail y Tiendas',
  event_stand:        'Eventos y Stands',
  medical_space:      'Espacios Medicos',
  exterior_enclosures:'Exterior / Cerramientos',
  interior_design:    'Interiorismo Premium',
  architecture_concept:'Arquitectura / Remodelacion',
}

// ─── helper para construir un ProjectObject ───────────────────────────────────
function buildObject(
  product: Product,
  sceneHeight: number,
  count: number,
  projectId: string,
) {
  const wM = product.width  / 100
  const hM = product.height / 100
  const dM = product.depth  / 100
  const col = count % 4
  const row = Math.floor(count / 4)
  const isCeiling = product.geometry_type === 'ceiling_lamp'
  const isRug     = product.geometry_type === 'carpet_rug'
  return {
    id: crypto.randomUUID(),
    tenant_id: 'tenant-alqia',
    project_id: projectId,
    product_id: product.id,
    name: product.name,
    position_x: isRug ? 0 : col * (wM + 0.4),
    position_y: isCeiling ? Math.max(sceneHeight - hM * 0.6, 0.5) : 0,
    position_z: isRug ? 0 : row * (dM + 0.4),
    rotation_x: 0, rotation_y: 0, rotation_z: 0,
    scale_x: 1, scale_y: 1, scale_z: 1,
    color: product.default_color ?? '#4A5568',
    quantity: 1,
    locked: false,
    configuration: { width: wM, height: hM, depth: dM },
    metadata: {
      sku: product.sku,
      category_id: product.category_id,
      geometry_type: product.geometry_type ?? 'box_tall',
      is_scene_prop: product.is_scene_prop ?? false,
      ...(product.default_model_url ? { model_url: product.default_model_url } : {}),
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
}

// ─── Slider para dimensiones ──────────────────────────────────────────────────
function DimSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string
  onChange: (v: number) => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-content-secondary">{label}</span>
        <span className="text-[11px] font-semibold text-white">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-alqia-orange"
      />
    </div>
  )
}

// ─── CatalogPanel principal ───────────────────────────────────────────────────
export function CatalogPanel() {
  const [activeTab, setActiveTab]     = useState<PanelTab>('products')
  const [search, setSearch]           = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null)
  const [propSearch, setPropSearch]   = useState('')
  const [activePropCat, setActivePropCat] = useState<string>(PROP_CATEGORIES[0].key)

  const { showToast } = useToast()
  const { addObject, updateSceneConfig, projectObjects, currentProject, sceneConfig } = useBuilderStore()
  const [searchParams] = useSearchParams()

  // Leer vertical directamente de la URL para evitar la condicion de carrera
  // con el store que puede estar inicializandose
  const verticalKey = (
    (currentProject?.metadata?.vertical_key as VerticalTemplateKey | undefined) ??
    (searchParams.get('vertical') as VerticalTemplateKey | null) ??
    'industrial_storage'
  )

  // Resetear categoria activa cuando cambia la vertical
  useEffect(() => {
    setActiveCategoryId(null)
    setSearch('')
  }, [verticalKey])
  const sceneHeight = sceneConfig?.height ?? 3
  const projectId   = currentProject?.id ?? 'draft'

  const { data: categories = [] } = useQuery<ProductCategory[]>({
    queryKey: ['categories', verticalKey],
    queryFn: () => catalogService.getCategories(verticalKey),
  })
  const { data: products = [] } = useQuery<Product[]>({
    queryKey: ['products', activeCategoryId, verticalKey],
    queryFn: () => catalogService.getProducts(activeCategoryId ?? undefined, verticalKey),
  })

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  )
  const filteredProps = mockSceneProps.filter((p) => {
    const cat = PROP_CATEGORIES.find((c) => c.key === activePropCat)
    const matchesCat = cat ? cat.geoTypes.includes(p.geometry_type ?? '') : true
    return matchesCat && p.name.toLowerCase().includes(propSearch.toLowerCase())
  })

  const handleAdd = (product: Product) => {
    addObject(buildObject(product, sceneHeight, projectObjects.length, projectId))
    showToast(`${product.name} agregado`, 'success')
  }

  // ── Tab: Productos ──────────────────────────────────────────────────────────
  const renderProducts = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-3 py-2 border-b border-white/[0.06] flex items-center gap-1.5 flex-shrink-0">
        <Layers className="w-3 h-3 text-alqia-orange flex-shrink-0" />
        <span className="text-alqia-orange text-[10px] font-medium truncate">
          {VERTICAL_LABELS[verticalKey] ?? verticalKey}
        </span>
      </div>
      <div className="p-2 border-b border-white/[0.06] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-content-muted" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar producto..."
            className="w-full pl-6 pr-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-xs text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all"
          />
        </div>
      </div>
      <div className="flex gap-1 p-2 border-b border-white/[0.06] overflow-x-auto scrollbar-hide flex-shrink-0">
        <button onClick={() => setActiveCategoryId(null)}
          className={cn('flex-shrink-0 px-2 py-1 rounded text-xs transition-all',
            activeCategoryId === null ? 'bg-alqia-orange/10 text-alqia-orange' : 'text-content-muted hover:text-white'
          )}>Todos</button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategoryId(cat.id)}
            className={cn('flex-shrink-0 px-2 py-1 rounded text-xs transition-all whitespace-nowrap',
              activeCategoryId === cat.id ? 'bg-alqia-orange/10 text-alqia-orange' : 'text-content-muted hover:text-white'
            )}>{cat.name}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredProducts.length === 0
          ? <p className="text-content-muted text-xs text-center py-4">Sin resultados</p>
          : filteredProducts.map((product) => (
            <GlassPanel key={product.id} className="p-2.5 group hover:bg-white/[0.10] transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-white text-xs font-medium truncate">{product.name}</p>
                  <p className="text-content-muted text-[10px] mt-0.5">{product.sku}</p>
                  <p className="text-content-muted text-[10px]">
                    {product.width}×{product.depth}×{product.height} cm
                  </p>
                </div>
                <button onClick={() => handleAdd(product)}
                  className="flex-shrink-0 p-1 rounded bg-alqia-orange/10 text-alqia-orange hover:bg-alqia-orange/20 transition-all">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </GlassPanel>
          ))
        }
      </div>
      <div className="p-2 border-t border-white/[0.06] flex-shrink-0">
        <p className="text-content-muted text-[10px] text-center">
          {projectObjects.filter((o) => !o.metadata?.is_scene_prop).length} producto(s) cotizables
        </p>
      </div>
    </div>
  )

  // ── Tab: Decoracion ─────────────────────────────────────────────────────────
  const renderProps = () => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-2 border-b border-white/[0.06] flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-content-muted" />
          <input type="text" value={propSearch} onChange={(e) => setPropSearch(e.target.value)}
            placeholder="Buscar decoracion..."
            className="w-full pl-6 pr-2 py-1.5 bg-white/[0.04] border border-white/[0.06] rounded-md text-xs text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all"
          />
        </div>
      </div>
      <div className="flex gap-1 p-2 border-b border-white/[0.06] overflow-x-auto scrollbar-hide flex-shrink-0">
        {PROP_CATEGORIES.map((cat) => (
          <button key={cat.key} onClick={() => setActivePropCat(cat.key)}
            className={cn('flex-shrink-0 px-2 py-1 rounded text-xs transition-all whitespace-nowrap',
              activePropCat === cat.key ? 'bg-alqia-orange/10 text-alqia-orange' : 'text-content-muted hover:text-white'
            )}>{cat.label}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
        {filteredProps.length === 0
          ? <p className="text-content-muted text-xs text-center py-4">Sin resultados</p>
          : filteredProps.map((prop) => (
            <GlassPanel key={prop.id} className="p-2.5 group hover:bg-white/[0.10] transition-all">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: prop.default_color ?? '#888' }} />
                    <p className="text-white text-xs font-medium truncate">{prop.name}</p>
                  </div>
                  <p className="text-content-muted text-[10px] mt-0.5 ml-4">
                    {prop.width}×{prop.depth}×{prop.height} cm
                  </p>
                </div>
                <button onClick={() => handleAdd(prop)}
                  className="flex-shrink-0 p-1 rounded bg-alqia-orange/10 text-alqia-orange hover:bg-alqia-orange/20 transition-all">
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </GlassPanel>
          ))
        }
      </div>
      <div className="p-2 border-t border-white/[0.06] flex-shrink-0">
        <p className="text-content-muted text-[10px] text-center">
          {projectObjects.filter((o) => o.metadata?.is_scene_prop).length} prop(s) en escena
        </p>
      </div>
    </div>
  )

  // ── Tab: Materiales ─────────────────────────────────────────────────────────
  const renderMaterials = () => {
    const activeFloor = sceneConfig?.floor_material ?? 'concrete'
    const activeWall  = sceneConfig?.wall_material ?? sceneConfig?.wall_color ?? null

    // grupos de materiales de pared
    const wallPaintGroup = WALL_COLORS.filter((m) => !m.procedural)
    const wallTextureGroup = WALL_COLORS.filter((m) => m.procedural)

    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* ── Pisos ── */}
        <div>
          <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-1.5">Piso — Interiores</p>
          <div className="grid grid-cols-3 gap-1.5">
            {FLOOR_MATERIALS.filter((m) => !m.procedural).map((mat) => (
              <button key={mat.id} onClick={() => updateSceneConfig({ floor_material: mat.id })}
                className={cn('flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all',
                  activeFloor === mat.id ? 'border-alqia-orange' : 'border-white/[0.06] hover:border-white/20'
                )} title={mat.name}>
                <div className="relative w-full h-7 rounded-md overflow-hidden">
                  <div className="w-full h-full" style={{ backgroundColor: mat.color }} />
                  {activeFloor === mat.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="w-3 h-3 text-alqia-orange" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-content-muted leading-none text-center truncate w-full">{mat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-1.5">Piso — Exteriores / Construccion</p>
          <div className="grid grid-cols-3 gap-1.5">
            {FLOOR_MATERIALS.filter((m) => m.procedural).map((mat) => (
              <button key={mat.id} onClick={() => updateSceneConfig({ floor_material: mat.id })}
                className={cn('flex flex-col items-center gap-1 p-1.5 rounded-lg border transition-all',
                  activeFloor === mat.id ? 'border-alqia-orange' : 'border-white/[0.06] hover:border-white/20'
                )} title={mat.name}>
                <div className="relative w-full h-7 rounded-md overflow-hidden">
                  <div className="w-full h-full" style={{ backgroundColor: mat.color }} />
                  {activeFloor === mat.id && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <Check className="w-3 h-3 text-alqia-orange" />
                    </div>
                  )}
                </div>
                <span className="text-[9px] text-content-muted leading-none text-center truncate w-full">{mat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ── Paredes ── */}
        {sceneConfig?.wall_enabled !== false && (
          <>
            <div>
              <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-1.5">Muro — Pintura</p>
              <div className="grid grid-cols-5 gap-1.5">
                {wallPaintGroup.map((wc) => (
                  <button key={wc.id}
                    onClick={() => updateSceneConfig({ wall_material: wc.id, wall_color: wc.color } as Parameters<typeof updateSceneConfig>[0])}
                    className={cn('flex flex-col items-center gap-1 p-1 rounded-lg border transition-all',
                      activeWall === wc.id || activeWall === wc.color ? 'border-alqia-orange' : 'border-white/[0.06] hover:border-white/20'
                    )} title={wc.name}>
                    <div className="relative w-full h-6 rounded overflow-hidden">
                      <div className="w-full h-full" style={{ backgroundColor: wc.color }} />
                      {(activeWall === wc.id || activeWall === wc.color) && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="w-2.5 h-2.5 text-alqia-orange" />
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-content-muted leading-none text-center truncate w-full">{wc.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-1.5">Muro — Texturas / Construccion</p>
              <div className="grid grid-cols-4 gap-1.5">
                {wallTextureGroup.map((wc) => (
                  <button key={wc.id}
                    onClick={() => updateSceneConfig({ wall_material: wc.id, wall_color: wc.color } as Parameters<typeof updateSceneConfig>[0])}
                    className={cn('flex flex-col items-center gap-1 p-1 rounded-lg border transition-all',
                      activeWall === wc.id ? 'border-alqia-orange' : 'border-white/[0.06] hover:border-white/20'
                    )} title={wc.name}>
                    <div className="relative w-full h-8 rounded overflow-hidden">
                      <div className="w-full h-full" style={{ backgroundColor: wc.color }} />
                      {activeWall === wc.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Check className="w-2.5 h-2.5 text-alqia-orange" />
                        </div>
                      )}
                    </div>
                    <span className="text-[8px] text-content-muted leading-none text-center truncate w-full">{wc.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        {sceneConfig?.wall_enabled === false && (
          <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 text-center">
            <p className="text-[11px] text-content-muted">
              Activa las paredes en la pestana <strong className="text-content-secondary">Espacio</strong> para editar su material.
            </p>
          </div>
        )}
      </div>
    )
  }

  // ── Tab: Espacio ────────────────────────────────────────────────────────────
  const renderSpace = () => {
    if (!sceneConfig) return (
      <div className="flex items-center justify-center h-full">
        <p className="text-content-muted text-xs">Cargando escena...</p>
      </div>
    )
    const wallEnabled = sceneConfig.wall_enabled ?? true
    return (
      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        <div className="space-y-4">
          <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider">Dimensiones</p>
          <DimSlider label="Ancho"      value={sceneConfig.width}                       min={4}  max={25} step={0.5} unit="m" onChange={(v) => updateSceneConfig({ width: v })} />
          <DimSlider label="Profundidad" value={sceneConfig.depth}                      min={4}  max={16} step={0.5} unit="m" onChange={(v) => updateSceneConfig({ depth: v })} />
          <DimSlider label="Altura muros" value={sceneConfig.height > 0 ? sceneConfig.height : 3} min={2} max={6} step={0.1} unit="m" onChange={(v) => updateSceneConfig({ height: v })} />
        </div>

        <div>
          <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-3">Paredes</p>
          <button onClick={() => updateSceneConfig({ wall_enabled: !wallEnabled })}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all',
              wallEnabled ? 'bg-alqia-orange/10 border-alqia-orange/30 text-alqia-orange' : 'bg-white/[0.04] border-white/[0.06] text-content-muted hover:text-white'
            )}>
            <span className="text-xs font-medium">{wallEnabled ? 'Paredes visibles' : 'Paredes ocultas'}</span>
            <div className={cn('w-8 h-4 rounded-full relative transition-all', wallEnabled ? 'bg-alqia-orange' : 'bg-white/20')}>
              <div className={cn('absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all', wallEnabled ? 'right-0.5' : 'left-0.5')} />
            </div>
          </button>
        </div>

        <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 space-y-1.5">
          <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-2">Resumen</p>
          <div className="flex justify-between">
            <span className="text-[11px] text-content-muted">Superficie</span>
            <span className="text-[11px] text-white font-medium">{(sceneConfig.width * sceneConfig.depth).toFixed(0)} m2</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-content-muted">Productos</span>
            <span className="text-[11px] text-white font-medium">{projectObjects.filter((o) => !o.metadata?.is_scene_prop).length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[11px] text-content-muted">Props escena</span>
            <span className="text-[11px] text-white font-medium">{projectObjects.filter((o) => o.metadata?.is_scene_prop).length}</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] flex-shrink-0">
        {TABS.map(({ key, label, Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={cn(
              'flex-1 flex flex-col items-center gap-0.5 py-2 text-[9px] font-medium transition-all border-b-2',
              activeTab === key ? 'border-alqia-orange text-alqia-orange' : 'border-transparent text-content-muted hover:text-white'
            )} title={label}>
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'products'  && renderProducts()}
        {activeTab === 'props'     && renderProps()}
        {activeTab === 'materials' && <div className="flex flex-col h-full overflow-hidden">{renderMaterials()}</div>}
        {activeTab === 'space'     && <div className="flex flex-col h-full overflow-hidden">{renderSpace()}</div>}
      </div>
    </div>
  )
}

