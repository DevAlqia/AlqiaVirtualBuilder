import { useQuery } from '@tanstack/react-query'
import {
  FolderOpen, FileText, Package, TrendingUp, Plus, ArrowRight,
  Warehouse, Sofa, Building2, ShoppingBag, CalendarDays, Stethoscope, Sun, Palette,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MetricCard } from '@/components/analytics/MetricCard'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { analyticsService } from '@/services'
import { projectService } from '@/services'
import { cn } from '@/utils/cn'
import type { BuilderProject, VerticalTemplateKey } from '@/types'

// ─── Definicion de verticales ─────────────────────────────────────────────────

interface VerticalCard {
  key: VerticalTemplateKey
  name: string
  tagline: string
  icon: React.ElementType
  accent: string
  items: string[]
}

const VERTICALS: VerticalCard[] = [
  {
    key: 'industrial_storage',
    name: 'Almacenamiento Industrial',
    tagline: 'Racks, gabinetes, anaqueles y mesas de trabajo',
    icon: Warehouse,
    accent: 'border-alqia-orange/30 hover:border-alqia-orange/60',
    items: ['Racks de paletizacion', 'Gabinetes industriales', 'Mesas de trabajo', 'Anaqueles'],
  },
  {
    key: 'furniture_kitchen',
    name: 'Muebles, Cocinas y Closets',
    tagline: 'Sala, comedor, cocina, recamara y vestidor',
    icon: Sofa,
    accent: 'border-status-info/30 hover:border-status-info/60',
    items: ['Sala y comedor', 'Cocinas e islas', 'Closets modulares', 'Recamara'],
  },
  {
    key: 'real_estate',
    name: 'Inmobiliario',
    tagline: 'Recorrido visual de departamentos y casas',
    icon: Building2,
    accent: 'border-status-success/30 hover:border-status-success/60',
    items: ['Departamento tipo', 'Suite principal', 'Cocina modular', 'Amenidades'],
  },
  {
    key: 'retail_layout',
    name: 'Retail y Tiendas',
    tagline: 'Gondolas, exhibidores, cajas e islas',
    icon: ShoppingBag,
    accent: 'border-status-warning/30 hover:border-status-warning/60',
    items: ['Gondolas de pasillo', 'Exhibidores', 'Modulos de caja', 'Corner de marca'],
  },
  {
    key: 'event_stand',
    name: 'Eventos y Stands',
    tagline: 'Stands, pantallas, mobiliario y modulos',
    icon: CalendarDays,
    accent: 'border-alqia-orange/30 hover:border-alqia-orange/60',
    items: ['Stand 3x3 y 6x3', 'Video walls', 'Mobiliario expo', 'Salones de evento'],
  },
  {
    key: 'medical_space',
    name: 'Espacios Medicos',
    tagline: 'Consultorios, recepcion y equipo medico',
    icon: Stethoscope,
    accent: 'border-status-info/30 hover:border-status-info/60',
    items: ['Consultorio tipo A', 'Recepcion modular', 'Salas de espera', 'Equipo medico'],
  },
  {
    key: 'exterior_enclosures',
    name: 'Exterior / Cerramientos',
    tagline: 'Toldos, pergolas, portones, rejas y canceleria',
    icon: Sun,
    accent: 'border-alqia-orange/30 hover:border-alqia-orange/60',
    items: ['Toldos retractiles', 'Pergolas aluminio', 'Portones y rejas', 'Cortinas exteriores'],
  },
  {
    key: 'interior_design',
    name: 'Interiorismo Premium',
    tagline: 'Sala, recamara, oficina y espacios comerciales',
    icon: Palette,
    accent: 'border-status-success/30 hover:border-status-success/60',
    items: ['Sala y comedor', 'Recamara premium', 'Oficina ejecutiva', 'Showroom boutique'],
  },
  {
    key: 'architecture_concept',
    name: 'Arquitectura / Remodelacion',
    tagline: 'Muros, techos, escaleras y conceptos arquitectonicos',
    icon: Building2,
    accent: 'border-content-muted/30 hover:border-content-muted/60',
    items: ['Muros colocables', 'Techos y losas', 'Escaleras', 'Terreno y jardines'],
  },
]

// ─────────────────────────────────────────────────────────────────────────────

function ProjectMiniCard({ project }: { project: BuilderProject }) {
  const navigate = useNavigate()
  const gradients: Record<string, string> = {
    quote_requested: 'from-status-warning/20 to-bg-dark',
    saved: 'from-status-info/20 to-bg-dark',
    draft: 'from-white/5 to-bg-dark',
    won: 'from-status-success/20 to-bg-dark',
    lost: 'from-status-danger/20 to-bg-dark',
  }
  const gradient = gradients[project.status] ?? 'from-white/5 to-bg-dark'

  return (
    <GlassPanel
      className="overflow-hidden cursor-pointer hover:bg-white/[0.10] transition-all group"
      onClick={() => navigate(`/projects/${project.id}`)}
    >
      <div className={cn('h-24 bg-gradient-to-br', gradient, 'relative')}>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white/10 text-5xl font-questrial font-bold select-none">
            {(project.name ?? '?')[0].toUpperCase()}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <ProjectStatusBadge status={project.status} />
        </div>
      </div>
      <div className="p-3">
        <p className="text-white text-sm font-medium truncate group-hover:text-alqia-orange transition-colors">{project.name}</p>
        <p className="text-content-muted text-xs mt-0.5">{project.project_number}</p>
        {project.metadata?.object_count != null && (
          <p className="text-content-muted text-xs mt-1">{project.metadata.object_count as number} objetos</p>
        )}
      </div>
    </GlassPanel>
  )
}

export function DashboardWorkspace() {
  const navigate = useNavigate()
  const { data: kpis } = useQuery({ queryKey: ['kpis'], queryFn: analyticsService.getWorkspaceKPIs })
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: projectService.getProjects })

  const recentProjects = (projects ?? []).slice(0, 3)

  const handleStartVertical = (vertical: VerticalCard) => {
    // En produccion: crear proyecto con vertical_key en metadata
    // Por ahora navega al builder — en Fase 1 se creara el proyecto pre-configurado
    navigate(`/builder?vertical=${vertical.key}`)
  }

  return (
    <div className="p-6 space-y-8 max-w-screen-xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-white text-xl font-questrial font-semibold">Alqia Virtual Builder</h1>
          <p className="text-content-secondary text-sm mt-0.5">
            Crea configuradores visuales para distintas industrias.
          </p>
        </div>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/builder')}>
          Nuevo proyecto
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Proyectos creados"
          value={kpis?.projectsCreated ?? '—'}
          icon={FolderOpen}
          trend={{ value: 12, label: 'este mes' }}
        />
        <MetricCard
          label="Solicitudes de cotizacion"
          value={kpis?.quoteRequests ?? '—'}
          icon={FileText}
          trend={{ value: 8, label: 'este mes' }}
        />
        <MetricCard
          label="Productos activos"
          value={kpis?.activeProducts ?? '—'}
          icon={Package}
        />
        <MetricCard
          label="Tasa de conversion"
          value={kpis ? `${kpis.conversionRate}%` : '—'}
          icon={TrendingUp}
          trend={{ value: 4, label: 'vs anterior' }}
        />
      </div>

      {/* Verticales disponibles */}
      <section>
        <div className="mb-4">
          <h2 className="text-white text-sm font-questrial font-medium">Verticales disponibles</h2>
          <p className="text-content-muted text-xs mt-0.5">
            Cada vertical tiene su propio catalogo, escenas, reglas y formulario comercial.
            Selecciona una plantilla para iniciar.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {VERTICALS.map((v) => {
            const Icon = v.icon
            return (
              <GlassPanel
                key={v.key}
                className={cn(
                  'p-4 cursor-pointer transition-all border group',
                  v.accent
                )}
                onClick={() => handleStartVertical(v)}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.08] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" strokeWidth={1.25} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs font-medium leading-tight">{v.name}</p>
                    <p className="text-content-muted text-[10px] mt-0.5 leading-snug">{v.tagline}</p>
                  </div>
                </div>
                <ul className="space-y-0.5">
                  {v.items.map((item) => (
                    <li key={item} className="text-content-muted text-[10px] flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-white/20 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </GlassPanel>
            )
          })}
        </div>
      </section>

      {/* Proyectos recientes */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-white text-sm font-questrial font-medium">Proyectos recientes</h2>
          <button
            onClick={() => navigate('/projects')}
            className="text-content-secondary hover:text-alqia-orange text-xs flex items-center gap-1 transition-colors"
          >
            Ver todos <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        {recentProjects.length === 0 ? (
          <GlassPanel className="p-8 text-center">
            <p className="text-content-muted text-sm">
              Sin proyectos aun. Selecciona una vertical para empezar.
            </p>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentProjects.map((p) => (
              <ProjectMiniCard key={p.id} project={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
