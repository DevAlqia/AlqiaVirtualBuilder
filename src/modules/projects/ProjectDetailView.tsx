import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  Box,
  FileText,
  User,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit3,
  Trash2,
  Copy,
} from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { Modal } from '@/components/ui/Modal'
import { projectService } from '@/services'
import { QuoteRequestModal } from '@/modules/quote-requests/QuoteRequestModal'
import { useBuilderStore } from '@/store/builderStore'
import { formatDate } from '@/utils/format'
import type { BuilderProject } from '@/types'

const DISCLAIMER = 'Configuración preliminar sujeta a validación técnica y cotización final.'

interface ProjectDetailViewProps {
  projectId?: string
  onBack?: () => void
}

export function ProjectDetailView({ projectId, onBack }: ProjectDetailViewProps) {
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const id = projectId ?? params.id ?? ''

  const [quoteModalOpen, setQuoteModalOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { setCurrentProject } = useBuilderStore()

  const { data: projectData, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectService.getProject(id),
    enabled: !!id,
  })

  const project = projectData as BuilderProject | null

  const handleOpenInBuilder = () => {
    if (!project) return
    setCurrentProject(project)
    navigate(`/app/builder?project=${project.id}`)
  }

  const handleDelete = async () => {
    setConfirmDelete(false)
    qc.invalidateQueries({ queryKey: ['projects'] })
    navigate('/app/projects')
  }

  if (isLoading || !project) {
    return (
      <div className="p-6 space-y-4">
        {[1, 2, 3].map((n) => (
          <GlassPanel key={n} className="h-24 animate-pulse" />
        ))}
      </div>
    )
  }

  const objectCount = Number(project.metadata?.object_count ?? 0)

  return (
    <div className="p-6 space-y-5 max-w-screen-lg mx-auto">
      {/* Header */}
      <div className="flex items-start gap-3">
        <button
          onClick={onBack ?? (() => navigate('/app/projects'))}
          className="p-2 rounded-lg text-content-secondary hover:text-white hover:bg-white/[0.06] transition-all mt-0.5"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-white text-xl font-questrial font-semibold truncate">{project.name}</h1>
            <ProjectStatusBadge status={project.status} />
          </div>
          <p className="text-content-muted text-sm mt-0.5">{project.project_number}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            icon={<Edit3 className="w-3.5 h-3.5" />}
            onClick={handleOpenInBuilder}
          >
            Abrir en builder
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<FileText className="w-3.5 h-3.5" />}
            onClick={() => setQuoteModalOpen(true)}
            disabled={project.status === 'quote_requested' || project.status === 'won'}
          >
            Solicitar cotización
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Columna principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Vista previa del proyecto */}
          <GlassPanel className="overflow-hidden">
            <div className="h-48 bg-gradient-to-br from-alqia-blue/40 to-bg-ultra flex items-center justify-center relative">
              <div className="text-center">
                <Box className="w-12 h-12 text-white/10 mx-auto mb-2" />
                <p className="text-white/30 text-sm">
                  {objectCount > 0
                    ? `${objectCount} objeto${objectCount !== 1 ? 's' : ''} configurado${objectCount !== 1 ? 's' : ''}`
                    : 'Proyecto vacío'}
                </p>
              </div>
              <div className="absolute bottom-3 right-3">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={<Edit3 className="w-3.5 h-3.5" />}
                  onClick={handleOpenInBuilder}
                >
                  Editar en 3D
                </Button>
              </div>
            </div>
          </GlassPanel>

          {/* Descripción */}
          {project.description && (
            <GlassPanel className="p-4">
              <p className="text-content-secondary text-xs uppercase tracking-wider mb-2">Descripción</p>
              <p className="text-white text-sm leading-relaxed">{project.description}</p>
            </GlassPanel>
          )}

          {/* Resumen IA */}
          {project.ai_summary && (
            <GlassPanel className="p-4">
              <p className="text-content-secondary text-xs uppercase tracking-wider mb-2">Análisis del configurador</p>
              <p className="text-white text-sm leading-relaxed">{project.ai_summary}</p>
            </GlassPanel>
          )}

          {/* Historial de estados */}
          <GlassPanel className="p-4">
            <p className="text-content-secondary text-xs uppercase tracking-wider mb-3">Historial</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-alqia-orange flex-shrink-0" />
                <div>
                  <p className="text-white text-xs">Proyecto creado</p>
                  <p className="text-content-muted text-[10px]">{formatDate(project.created_at)}</p>
                </div>
              </div>
              {project.quote_requested_at && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-status-warning flex-shrink-0" />
                  <div>
                    <p className="text-white text-xs">Cotización solicitada</p>
                    <p className="text-content-muted text-[10px]">{formatDate(project.quote_requested_at)}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-white/20 flex-shrink-0" />
                <div>
                  <p className="text-white text-xs">Última actualización</p>
                  <p className="text-content-muted text-[10px]">{formatDate(project.updated_at)}</p>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Datos del cliente */}
          <GlassPanel className="p-4">
            <p className="text-content-secondary text-xs uppercase tracking-wider mb-3">Cliente</p>
            {project.client_name ? (
              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <User className="w-3.5 h-3.5 text-alqia-orange mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-white text-sm">{project.client_name}</p>
                  </div>
                </div>
                {project.client_company && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-content-muted flex-shrink-0" />
                    <p className="text-content-secondary text-xs">{project.client_company}</p>
                  </div>
                )}
                {project.client_email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-content-muted flex-shrink-0" />
                    <p className="text-content-secondary text-xs truncate">{project.client_email}</p>
                  </div>
                )}
                {project.client_phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-content-muted flex-shrink-0" />
                    <p className="text-content-secondary text-xs">{project.client_phone}</p>
                  </div>
                )}
                {project.client_city && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-content-muted flex-shrink-0" />
                    <p className="text-content-secondary text-xs">{project.client_city}</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-content-muted text-xs">Sin datos de cliente</p>
            )}
          </GlassPanel>

          {/* Métricas */}
          <GlassPanel className="p-4">
            <p className="text-content-secondary text-xs uppercase tracking-wider mb-3">Resumen</p>
            <div className="space-y-2">
              {[
                { label: 'Objetos en espacio', value: objectCount },
                { label: 'Escena', value: project.scene_id },
                { label: 'Creado por', value: project.created_by },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-content-muted text-xs">{label}</span>
                  <span className="text-white text-xs">{value}</span>
                </div>
              ))}
            </div>
          </GlassPanel>

          {/* Disclaimer */}
          <div className="px-3 py-2.5 rounded-lg border border-alqia-orange/20 bg-alqia-orange/5">
            <p className="text-alqia-orange text-[10px] italic">{DISCLAIMER}</p>
          </div>

          {/* Acciones peligrosas */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              icon={<Copy className="w-3.5 h-3.5" />}
            >
              Duplicar proyecto
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="w-full text-xs"
              icon={<Trash2 className="w-3.5 h-3.5" />}
              onClick={() => setConfirmDelete(true)}
            >
              Eliminar proyecto
            </Button>
          </div>
        </div>
      </div>

      {/* Modal cotización */}
      <QuoteRequestModal open={quoteModalOpen} onClose={() => setQuoteModalOpen(false)} />

      {/* Modal confirmación eliminar */}
      <Modal open={confirmDelete} onClose={() => setConfirmDelete(false)} size="sm">
        <div className="p-6 text-center space-y-4">
          <h3 className="text-white text-sm font-medium">Eliminar proyecto</h3>
          <p className="text-content-secondary text-xs">
            Esta acción eliminará el proyecto permanentemente. ¿Deseas continuar?
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
