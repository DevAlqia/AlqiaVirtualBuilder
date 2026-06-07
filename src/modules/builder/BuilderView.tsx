import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useToast } from '@/components/ui/Toast'
import { useBuilderStore } from '@/store/builderStore'
import { BuilderCanvas } from '@/components/builder/BuilderCanvas'
import { CatalogPanel } from './panels/CatalogPanel'
import { PropertiesPanel } from './panels/PropertiesPanel'
import { QuoteRequestModal } from '@/modules/quote-requests/QuoteRequestModal'
import { ShareProjectModal } from '@/components/builder/ShareProjectModal'
import { exportProjectPDF } from '@/services/exports/exportService'
import { mockScenes } from '@/data/mock/scenes'
import { mockProjects } from '@/data/mock/projects'
import { projectService } from '@/services'
import type { VerticalTemplateKey } from '@/types'
import {
  Grid3X3,
  Magnet,
  MousePointer2,
  Move3D,
  RotateCcw,
  Save,
  Download,
  FileText,
  Share2,
  Undo2,
  Redo2,
  Pencil,
  Check,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/utils/cn'

const VERTICAL_SCENE_MAP: Record<string, string> = {
  industrial_storage: 'scene-warehouse',
  furniture_kitchen:  'scene-living',
  real_estate:        'scene-apartment',
  retail_layout:      'scene-store',
  event_stand:        'scene-expo',
  medical_space:      'scene-medical',
  exterior_enclosures:    'scene-exterior',
  interior_design:        'scene-interior',
  architecture_concept:   'scene-architecture',
}

const VERTICAL_LABELS: Record<VerticalTemplateKey, string> = {
  industrial_storage: 'Almacenamiento Industrial',
  furniture_kitchen:  'Muebles, Cocinas y Closets',
  real_estate:        'Inmobiliario',
  retail_layout:      'Retail y Tiendas',
  event_stand:        'Eventos y Stands',
  medical_space:      'Espacios Medicos',
  exterior_enclosures:    'Exterior / Cerramientos',
  interior_design:        'Interiorismo Premium',
  architecture_concept:   'Arquitectura / Remodelacion',
}

export function BuilderView() {
  const {
    gridEnabled, snapEnabled, cameraMode, activeTool, isDirty, isSaving,
    toggleGrid, toggleSnap, setCameraMode, setActiveTool,
    setCurrentProject, setSceneConfig, setProjectObjects, setIsSaving, setIsDirty,
    undo, redo, history, historyIndex, currentProject,
  } = useBuilderStore()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')
  const [leftCollapsed, setLeftCollapsed] = useState(false)
  const [rightCollapsed, setRightCollapsed] = useState(false)
  const nameInputRef = useRef<HTMLInputElement>(null)

  const canUndo = historyIndex > 0
  const canRedo = historyIndex < history.length - 1

  // Inicializar escena y proyecto al montar — respeta ?vertical= de URL
  useEffect(() => {
    const verticalKey = (searchParams.get('vertical') ?? 'industrial_storage') as VerticalTemplateKey
    const sceneId = VERTICAL_SCENE_MAP[verticalKey] ?? 'scene-warehouse'
    const scene = mockScenes.find((s) => s.id === sceneId) ?? mockScenes[0]

    // Buscar proyecto existente de esta vertical o usar el primero como base
    const baseProject = mockProjects.find(
      (p) => (p.metadata?.vertical_key ?? p.metadata?.template) === verticalKey
    ) ?? mockProjects[0]

    const project = {
      ...baseProject,
      metadata: {
        ...(baseProject.metadata ?? {}),
        vertical_key: verticalKey,
        object_count: baseProject.metadata?.object_count ?? 0,
      },
      scene_id: sceneId,
    }

    setCurrentProject(project)
    setSceneConfig(scene)
    // Limpiar objetos anteriores SIEMPRE antes de cargar el nuevo proyecto
    setProjectObjects([])

    projectService.loadBuilderState(project.id).then((saved) => {
      setProjectObjects(saved)
    })

    setNameValue(project.name ?? 'Proyecto sin nombre')
  }, [searchParams])

  const handleSave = async () => {
    const { currentProject, projectObjects: objs } = useBuilderStore.getState()
    if (!currentProject) return
    setIsSaving(true)
    try {
      await projectService.saveBuilderState(currentProject.id, objs)
      setIsDirty(false)
      showToast('Proyecto guardado', 'success')
    } finally {
      setIsSaving(false)
    }
  }

  const handleExportPDF = async () => {
    const { currentProject: proj, projectObjects: objs, sceneConfig: scene } = useBuilderStore.getState()
    if (!proj) return
    setIsExporting(true)
    try {
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
      await exportProjectPDF({ project: proj, objects: objs, scene, canvasElement: canvas })
      showToast('PDF generado correctamente', 'success')
    } catch {
      showToast('Error al generar el PDF', 'error')
    } finally {
      setIsExporting(false)
    }
  }

  const handleConfirmName = () => {
    if (currentProject && nameValue.trim()) {
      setCurrentProject({ ...currentProject, name: nameValue.trim() })
      setIsDirty(true)
    }
    setEditingName(false)
  }

  // Atajos de teclado
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
      }
      if ((e.metaKey || e.ctrlKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
        e.preventDefault()
        redo()
      }
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) setActiveTool('select')
      if (e.key === 'g' && !e.metaKey && !e.ctrlKey) setActiveTool('move')
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) setActiveTool('rotate')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [undo, redo, setActiveTool])

  return (
    <div className="flex h-full overflow-hidden">
      {/* Panel izquierdo — catálogo */}
      <motion.aside
        animate={{ width: leftCollapsed ? 0 : 240 }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
        className="relative flex-shrink-0 flex flex-col border-r border-white/[0.06] bg-bg-ultra overflow-hidden"
      >
        <div className="w-60 flex flex-col h-full">
          <CatalogPanel />
        </div>
      </motion.aside>

      {/* Centro — canvas 3D */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Toggle panel izquierdo — pegado al borde izquierdo del canvas */}
        <button
          onClick={() => setLeftCollapsed((v) => !v)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-3.5 h-10 bg-bg-ultra border border-white/[0.10] border-l-0 rounded-r-md text-content-muted hover:text-white hover:bg-white/[0.08] transition-all"
          title={leftCollapsed ? 'Expandir catálogo' : 'Colapsar catálogo'}
        >
          {leftCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
        </button>

        {/* Toggle panel derecho — pegado al borde derecho del canvas */}
        <button
          onClick={() => setRightCollapsed((v) => !v)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-3.5 h-10 bg-bg-ultra border border-white/[0.10] border-r-0 rounded-l-md text-content-muted hover:text-white hover:bg-white/[0.08] transition-all"
          title={rightCollapsed ? 'Expandir propiedades' : 'Colapsar propiedades'}
        >
          {rightCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        </button>

        {/* Topbar del builder con nombre editable */}
        <div className="h-10 flex items-center px-3 gap-2 border-b border-white/[0.06] bg-bg-ultra flex-shrink-0">
          {/* Nombre del proyecto editable */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            {editingName ? (
              <>
                <input
                  ref={nameInputRef}
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleConfirmName()
                    if (e.key === 'Escape') setEditingName(false)
                  }}
                  onBlur={handleConfirmName}
                  autoFocus
                  className="flex-1 min-w-0 bg-white/[0.06] border border-alqia-orange/40 rounded px-2 py-0.5 text-white text-sm focus:outline-none"
                />
                <button onClick={handleConfirmName} className="text-status-success hover:text-status-success/80 transition-colors p-0.5">
                  <Check className="w-3.5 h-3.5" />
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditingName(true); setNameValue(currentProject?.name ?? '') }}
                className="flex items-center gap-1.5 text-white text-sm hover:text-alqia-orange transition-colors truncate group"
              >
                <span className="truncate">{currentProject?.name ?? 'Proyecto'}</span>
                <Pencil className="w-3 h-3 text-content-muted group-hover:text-alqia-orange flex-shrink-0" />
              </button>
            )}
          </div>

          {/* Badge vertical activa + cambiar vertical */}
          {!!currentProject?.metadata?.vertical_key && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-alqia-orange/10 border border-alqia-orange/20">
                <Layers className="w-3 h-3 text-alqia-orange" />
                <span className="text-alqia-orange text-[10px] font-medium whitespace-nowrap">
                  {VERTICAL_LABELS[(currentProject.metadata.vertical_key as VerticalTemplateKey)] ?? String(currentProject.metadata.vertical_key as string)}
                </span>
              </div>
              <Tooltip content="Cambiar vertical">
                <a
                  href="/app"
                  className="p-1.5 rounded-md text-content-muted hover:text-white hover:bg-white/[0.06] transition-all"
                  title="Volver al dashboard para cambiar vertical"
                >
                  <Layers className="w-3.5 h-3.5" />
                </a>
              </Tooltip>
            </div>
          )}

          {/* Undo / Redo */}
          <div className="flex items-center gap-0.5">
            <Tooltip content="Deshacer (Ctrl+Z)">
              <button
                onClick={undo}
                disabled={!canUndo}
                className="p-1.5 rounded-md text-content-muted hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="Rehacer (Ctrl+Shift+Z)">
              <button
                onClick={redo}
                disabled={!canRedo}
                className="p-1.5 rounded-md text-content-muted hover:text-white hover:bg-white/[0.06] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <BuilderCanvas />
        </div>

        {/* Toolbar inferior */}
        <div className="h-11 flex items-center px-3 gap-2 border-t border-white/[0.06] bg-bg-ultra flex-shrink-0">
          {/* Herramientas */}
          <div className="flex items-center gap-0.5 border-r border-white/[0.08] pr-3 mr-1">
            {[
              { tool: 'select' as const, icon: MousePointer2, label: 'Seleccionar (S)' },
              { tool: 'move' as const, icon: Move3D, label: 'Mover (G)' },
              { tool: 'rotate' as const, icon: RotateCcw, label: 'Rotar (R)' },
            ].map(({ tool, icon: Icon, label }) => (
              <Tooltip key={tool} content={label}>
                <button
                  onClick={() => setActiveTool(tool)}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    activeTool === tool
                      ? 'bg-alqia-orange/10 text-alqia-orange'
                      : 'text-content-muted hover:text-white hover:bg-white/[0.06]'
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              </Tooltip>
            ))}
          </div>

          {/* Grid y Snap */}
          <div className="flex items-center gap-0.5 border-r border-white/[0.08] pr-3 mr-1">
            <Tooltip content={gridEnabled ? 'Ocultar cuadrícula' : 'Mostrar cuadrícula'}>
              <button
                onClick={toggleGrid}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  gridEnabled ? 'text-alqia-orange bg-alqia-orange/10' : 'text-content-muted hover:text-white'
                )}
              >
                <Grid3X3 className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content={snapEnabled ? 'Desactivar snap' : 'Activar snap (0.5m)'}>
              <button
                onClick={toggleSnap}
                className={cn(
                  'p-1.5 rounded-md transition-all',
                  snapEnabled ? 'text-alqia-orange bg-alqia-orange/10' : 'text-content-muted hover:text-white'
                )}
              >
                <Magnet className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>

          {/* Cámara */}
          <div className="flex items-center gap-0.5 border-r border-white/[0.08] pr-3 mr-1">
            {(['perspective', 'top'] as const).map((mode) => (
              <Tooltip key={mode} content={mode === 'perspective' ? 'Vista 3D' : 'Vista superior'}>
                <button
                  onClick={() => setCameraMode(mode)}
                  className={cn(
                    'px-2 py-1 rounded-md text-[10px] font-medium transition-all',
                    cameraMode === mode
                      ? 'text-alqia-orange bg-alqia-orange/10'
                      : 'text-content-muted hover:text-white'
                  )}
                >
                  {mode === 'perspective' ? '3D' : '2D'}
                </button>
              </Tooltip>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isDirty && (
              <span className="text-alqia-orange text-[10px]">Cambios sin guardar</span>
            )}
            <Button
              variant="secondary"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              loading={isSaving}
              onClick={handleSave}
            >
              Guardar
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              loading={isExporting}
              onClick={handleExportPDF}
            >
              PDF
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<Share2 className="w-3.5 h-3.5" />}
              onClick={() => setShareModalOpen(true)}
            >
              Compartir
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => setQuoteModalOpen(true)}
            >
              Cotizacion
            </Button>
          </div>
        </div>
      </div>

      {/* Panel derecho — propiedades */}
      {/* Botón toggle panel derecho */}
      <button
        onClick={() => setRightCollapsed((v) => !v)}
        className="absolute right-0 bottom-[44px] z-20 flex items-center justify-center w-4 h-8 bg-bg-ultra border border-white/[0.08] border-r-0 rounded-l-md text-content-muted hover:text-white hover:bg-white/[0.06] transition-all"
        style={{ right: rightCollapsed ? 0 : 224 }}
        title={rightCollapsed ? 'Expandir propiedades' : 'Colapsar propiedades'}
      >
        {rightCollapsed ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      <motion.aside
        animate={{ width: rightCollapsed ? 0 : 224 }}
        transition={{ type: 'spring', stiffness: 400, damping: 38 }}
        className="flex-shrink-0 flex flex-col border-l border-white/[0.06] bg-bg-ultra overflow-hidden"
      >
        <div className="w-56 h-full flex flex-col">
          <PropertiesPanel />
        </div>
      </motion.aside>

      {/* Modal de cotizacion */}
      <QuoteRequestModal
        open={quoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />

      {/* Modal compartir con cliente */}
      <ShareProjectModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
      />
    </div>
  )
}

