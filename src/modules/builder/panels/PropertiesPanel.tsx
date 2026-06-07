import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Trash2, Copy, Lock, Unlock, AlertTriangle, Maximize2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useBuilderStore } from '@/store/builderStore'
import { catalogService } from '@/services'
import { cn } from '@/utils/cn'
import { eventBus, BUILDER_EVENTS } from '@/utils/events'
import type { ProductVariant } from '@/types'

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

export function PropertiesPanel() {
  const { projectObjects, selectedObjectId, updateObject, removeObject, duplicateObject, rotateObjectBy,
    sceneConfig, currentProject } =
    useBuilderStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  const object = projectObjects.find((o) => o.id === selectedObjectId)

  const { data: variants = [] } = useQuery<ProductVariant[]>({
    queryKey: ['variants', object?.product_id],
    queryFn: () => catalogService.getVariants(object!.product_id),
    enabled: !!object?.product_id,
  })

  if (!object) {
    const vertKey = (currentProject?.metadata?.vertical_key as string) ?? ''
    const quotable = projectObjects.filter((o) => !o.metadata?.is_scene_prop).length
    const props    = projectObjects.filter((o) => o.metadata?.is_scene_prop).length
    return (
      <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3">
        <p className="text-content-secondary text-xs uppercase tracking-wider">Espacio</p>

        {sceneConfig && (
          <div className="space-y-2">
            <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 space-y-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Maximize2 className="w-3.5 h-3.5 text-alqia-orange" />
                <span className="text-[11px] font-semibold text-white">{sceneConfig.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                <div>
                  <span className="text-content-muted">Ancho</span>
                  <p className="text-white font-medium">{sceneConfig.width} m</p>
                </div>
                <div>
                  <span className="text-content-muted">Profundidad</span>
                  <p className="text-white font-medium">{sceneConfig.depth} m</p>
                </div>
                <div>
                  <span className="text-content-muted">Altura</span>
                  <p className="text-white font-medium">{sceneConfig.height > 0 ? sceneConfig.height : 3} m</p>
                </div>
                <div>
                  <span className="text-content-muted">Superficie</span>
                  <p className="text-white font-medium">{(sceneConfig.width * sceneConfig.depth).toFixed(0)} m2</p>
                </div>
                <div>
                  <span className="text-content-muted">Paredes</span>
                  <p className={cn('font-medium', sceneConfig.wall_enabled ? 'text-white' : 'text-content-muted')}>
                    {sceneConfig.wall_enabled ? 'Activas' : 'Ocultas'}
                  </p>
                </div>
                <div>
                  <span className="text-content-muted">Piso</span>
                  <p className="text-white font-medium capitalize">{sceneConfig.floor_material ?? 'default'}</p>
                </div>
              </div>
            </div>

            {vertKey && (
              <div className="rounded-lg bg-alqia-orange/[0.06] border border-alqia-orange/20 px-3 py-2">
                <span className="text-[10px] text-alqia-orange font-medium">
                  {VERTICAL_LABELS[vertKey] ?? vertKey}
                </span>
              </div>
            )}

            <div className="rounded-lg bg-white/[0.04] border border-white/[0.06] p-3 space-y-1.5">
              <p className="text-[10px] font-semibold text-content-secondary uppercase tracking-wider mb-1">Objetos en escena</p>
              <div className="flex justify-between text-[11px]">
                <span className="text-content-muted">Productos cotizables</span>
                <span className="text-white font-semibold">{quotable}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-content-muted">Props / decoracion</span>
                <span className="text-white font-semibold">{props}</span>
              </div>
            </div>

            <p className="text-content-muted text-[10px] text-center pt-1">
              Haz click en un objeto del espacio para editar sus propiedades.
            </p>
          </div>
        )}
        {!sceneConfig && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-content-muted text-xs text-center">Cargando escena...</p>
          </div>
        )}
      </div>
    )
  }

  const rotDeg  = Math.round((object.rotation_y * 180) / Math.PI)
  const rotZDeg = Math.round(((object.rotation_z ?? 0) * 180) / Math.PI)

  const handlePositionX = (val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n)) updateObject(object.id, { position_x: n })
  }

  const handlePositionY = (val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n)) updateObject(object.id, { position_y: n })
  }

  const handlePositionZ = (val: string) => {
    const n = parseFloat(val)
    if (!isNaN(n)) updateObject(object.id, { position_z: n })
  }

  const handleRotationDeg = (val: string) => {
    const deg = parseFloat(val)
    if (!isNaN(deg)) updateObject(object.id, { rotation_y: (deg * Math.PI) / 180 })
  }

  const handleRotationZDeg = (val: string) => {
    const deg = parseFloat(val)
    if (!isNaN(deg)) updateObject(object.id, { rotation_z: (deg * Math.PI) / 180 })
  }

  const handleColorChange = (val: string) => {
    updateObject(object.id, { color: val })
  }

  const toggleLock = () => {
    updateObject(object.id, { locked: !object.locked })
  }

  const w = (object.configuration?.width as number) ?? 0.6
  const h = (object.configuration?.height as number) ?? 1.8
  const d = (object.configuration?.depth as number) ?? 0.45

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="p-3 border-b border-white/[0.06] flex-shrink-0">
        <p className="text-content-secondary text-xs uppercase tracking-wider">Propiedades</p>
      </div>

      <div className="flex-1 p-3 space-y-4 overflow-y-auto">
        {/* Nombre */}
        <div>
          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Nombre
          </p>
          <p className="text-white text-xs font-medium">{object.name}</p>
          <p className="text-content-muted text-[10px] mt-0.5">
            {String(object.metadata?.sku ?? '')}
          </p>
        </div>

        {/* Dimensiones (solo lectura) */}
        <div>
          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Dimensiones
          </p>
          <p className="text-content-muted text-xs">
            {w}m × {d}m × {h}m (An × Pr × Al)
          </p>
        </div>

        {/* Posición */}
        <div>
          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Posición
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-content-muted text-[10px]">X (m)</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat(object.position_x.toFixed(2))}
                onChange={(e) => handlePositionX(e.target.value)}
                disabled={object.locked}
                className="w-full px-2 py-1 bg-white/[0.06] border border-white/[0.08] rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 disabled:opacity-50 mt-0.5"
              />
            </div>
            <div>
              <label className="text-content-muted text-[10px]">Z (m)</label>
              <input
                type="number"
                step="0.1"
                value={parseFloat(object.position_z.toFixed(2))}
                onChange={(e) => handlePositionZ(e.target.value)}
                disabled={object.locked}
                className="w-full px-2 py-1 bg-white/[0.06] border border-white/[0.08] rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 disabled:opacity-50 mt-0.5"
              />
            </div>
            <div className="col-span-2">
              <label className="text-content-muted text-[10px]">Y — Altura (m)</label>
              <input
                type="number"
                step="0.05"
                value={parseFloat((object.position_y > 0 ? object.position_y : 0).toFixed(2))}
                onChange={(e) => handlePositionY(e.target.value)}
                disabled={object.locked}
                className="w-full px-2 py-1 bg-white/[0.06] border border-white/[0.08] rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 disabled:opacity-50 mt-0.5"
              />
            </div>
          </div>
        </div>

        {/* Rotación */}
        <div>
          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Inclinación
          </p>
          <div className="flex gap-1 mb-2">
            {([
              { label: 'Vertical', deg: 90 },
              { label: '+45°', deg: 45 },
              { label: '-45°', deg: -45 },
              { label: 'Plano', deg: 0 },
            ] as { label: string; deg: number }[]).map(({ label, deg }) => (
              <button
                key={deg}
                onClick={() => handleRotationZDeg(String(deg))}
                disabled={object.locked}
                className={cn(
                  'flex-1 py-1 rounded text-[10px] font-medium transition-all border',
                  rotZDeg === deg
                    ? 'border-alqia-orange/60 text-alqia-orange bg-alqia-orange/10'
                    : 'border-white/[0.08] text-content-secondary hover:text-white hover:border-alqia-orange/40 hover:bg-alqia-orange/5',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="range"
              min="-90"
              max="90"
              step="1"
              value={rotZDeg}
              onChange={(e) => handleRotationZDeg(e.target.value)}
              disabled={object.locked}
              className="flex-1 h-1 accent-alqia-orange disabled:opacity-50"
            />
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <input
                type="number"
                min="-90"
                max="90"
                step="1"
                value={rotZDeg}
                onChange={(e) => handleRotationZDeg(e.target.value)}
                disabled={object.locked}
                className="w-12 px-1.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 disabled:opacity-50"
              />
              <span className="text-content-muted text-[10px]">°</span>
            </div>
          </div>

          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Rotación Y
          </p>
          {/* Botones rápidos */}
          <div className="flex gap-1 mb-2">
            {[-45, -15, +15, +45].map((deg) => (
              <button
                key={deg}
                onClick={() => rotateObjectBy(object.id, deg)}
                disabled={object.locked}
                className={cn(
                  'flex-1 py-1 rounded text-[10px] font-medium transition-all border',
                  'border-white/[0.08] text-content-secondary hover:text-white hover:border-alqia-orange/40 hover:bg-alqia-orange/5',
                  'disabled:opacity-40 disabled:cursor-not-allowed'
                )}
              >
                {deg > 0 ? `+${deg}°` : `${deg}°`}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="-180"
              max="180"
              step="1"
              value={rotDeg}
              onChange={(e) => handleRotationDeg(e.target.value)}
              disabled={object.locked}
              className="flex-1 h-1 accent-alqia-orange disabled:opacity-50"
            />
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <input
                type="number"
                min="-180"
                max="180"
                step="1"
                value={rotDeg}
                onChange={(e) => handleRotationDeg(e.target.value)}
                disabled={object.locked}
                className="w-12 px-1.5 py-1 bg-white/[0.06] border border-white/[0.08] rounded text-white text-xs text-right focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 disabled:opacity-50"
              />
              <span className="text-content-muted text-[10px]">°</span>
            </div>
          </div>
        </div>

        {/* Color */}
        <div>
          <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
            Color
          </p>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={object.color ?? '#4A5568'}
              onChange={(e) => {
                handleColorChange(e.target.value)
                eventBus.emit(BUILDER_EVENTS.OBJECT_COLOR_CHANGED, { object_id: object.id, color: e.target.value })
              }}
              disabled={object.locked}
              className="w-7 h-7 rounded border border-white/[0.10] bg-transparent cursor-pointer disabled:opacity-50"
            />
            <span className="text-content-muted text-xs">{(object.color ?? '#4A5568').toUpperCase()}</span>
          </div>
        </div>

        {/* Variantes */}
        {variants.length > 0 && (
          <div>
            <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5">
              Variante
            </p>
            <div className="space-y-1">
              {variants.map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    updateObject(object.id, {
                      variant_id: v.id,
                      color: v.color ?? object.color,
                      name: v.name,
                    })
                    eventBus.emit(BUILDER_EVENTS.OBJECT_VARIANT_CHANGED, { object_id: object.id, variant_id: v.id })
                  }}
                  disabled={object.locked}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all border',
                    object.variant_id === v.id
                      ? 'border-alqia-orange/40 bg-alqia-orange/10 text-white'
                      : 'border-white/[0.06] text-content-secondary hover:text-white hover:border-white/20',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  {v.color && (
                    <span
                      className="w-3.5 h-3.5 rounded-full flex-shrink-0 border border-white/20"
                      style={{ background: v.color }}
                    />
                  )}
                  <span className="truncate">{v.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div className="p-3 border-t border-white/[0.06] space-y-2 flex-shrink-0">
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            icon={<Copy className="w-3 h-3" />}
            onClick={() => duplicateObject(object.id)}
          >
            Duplicar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="flex-1 text-xs"
            icon={object.locked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            onClick={toggleLock}
          >
            {object.locked ? 'Desbloquear' : 'Bloquear'}
          </Button>
        </div>
        <Button
          variant="danger"
          size="sm"
          className="w-full text-xs"
          icon={<Trash2 className="w-3 h-3" />}
          onClick={() => setConfirmDelete(true)}
        >
          Eliminar objeto
        </Button>
      </div>

      {/* Modal de confirmación de eliminación */}
      <Modal
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        size="sm"
      >
        <div className="p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-status-danger/10 border border-status-danger/20 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-status-danger" />
          </div>
          <div>
            <h3 className="text-white text-sm font-medium">Eliminar objeto</h3>
            <p className="text-content-secondary text-xs mt-1">
              ¿Estás seguro de que deseas eliminar <span className="text-white font-medium">{object.name}</span>?
              Esta acción se puede deshacer con Ctrl+Z.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              onClick={() => setConfirmDelete(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="flex-1"
              onClick={() => {
                removeObject(object.id)
                setConfirmDelete(false)
              }}
            >
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
