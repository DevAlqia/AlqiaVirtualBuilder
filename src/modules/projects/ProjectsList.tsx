import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Plus, ChevronRight, Box } from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { projectService } from '@/services'
import type { BuilderProject, ProjectStatus } from '@/types'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/format'
import { useNavigate } from 'react-router-dom'

const ALL_STATUSES: Array<{ value: ProjectStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'draft', label: 'Borrador' },
  { value: 'saved', label: 'Guardado' },
  { value: 'quote_requested', label: 'Cotización solicitada' },
  { value: 'won', label: 'Ganado' },
]

export function ProjectsList() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all')

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: projectService.getProjects,
  })

  const filtered = projects.filter((p: BuilderProject) => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || p.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-questrial font-semibold">Proyectos</h1>
        <Button variant="primary" icon={<Plus className="w-4 h-4" />} onClick={() => navigate('/app/builder')}>
          Nuevo proyecto
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre..."
            className="pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all w-52"
          />
        </div>
        <div className="flex items-center gap-1">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value as ProjectStatus | 'all')}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                statusFilter === s.value
                  ? 'bg-alqia-orange/10 text-alqia-orange border border-alqia-orange/20'
                  : 'text-content-secondary hover:text-white hover:bg-white/[0.06]'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Lista */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="h-20 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-content-muted text-sm">No se encontraron proyectos.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-2">
          {filtered.map((project: BuilderProject) => (
            <GlassPanel
              key={project.id}
              className="p-4 flex items-center gap-4 cursor-pointer hover:bg-white/[0.08] transition-all group"
              onClick={() => navigate(`/app/projects/${project.id}`)}
            >
              <div className="w-10 h-10 rounded-lg bg-alqia-blue/40 border border-white/[0.06] flex items-center justify-center flex-shrink-0">
                <Box className="w-4 h-4 text-white/40" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate group-hover:text-alqia-orange transition-colors">{project.name}</p>
                <p className="text-content-muted text-xs mt-0.5">{project.project_number}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {project.metadata?.object_count != null && (
                  <span className="text-content-muted text-xs">{project.metadata.object_count as number} obj.</span>
                )}
                <ProjectStatusBadge status={project.status} />
                <span className="text-content-muted text-xs">{formatDate(project.updated_at)}</span>
                <ChevronRight className="w-3.5 h-3.5 text-content-muted group-hover:text-white transition-colors" />
              </div>
            </GlassPanel>
          ))}
        </div>
      )}
    </div>
  )
}
