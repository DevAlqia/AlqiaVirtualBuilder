import { useQuery } from '@tanstack/react-query'
import { FolderOpen, FileText, Package, TrendingUp, Clock } from 'lucide-react'
import { MetricCard } from '@/components/analytics/MetricCard'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { analyticsService } from '@/services'
import { cn } from '@/utils/cn'

// ─── Gráfica de barras CSS ─────────────────────────────────────────────────────

const PROJECTS_BY_STATUS = [
  { label: 'Borrador', value: 12, color: 'bg-white/20' },
  { label: 'Guardado', value: 27, color: 'bg-status-info' },
  { label: 'Cotiz. sol.', value: 9, color: 'bg-status-warning' },
  { label: 'Ganado', value: 4, color: 'bg-status-success' },
]

const QUOTES_BY_MONTH = [
  { month: 'Ene', value: 3 },
  { month: 'Feb', value: 5 },
  { month: 'Mar', value: 4 },
  { month: 'Abr', value: 7 },
  { month: 'May', value: 6 },
  { month: 'Jun', value: 9 },
]

const TOP_PRODUCTS = [
  { name: 'Estantería modular 3m', uses: 43 },
  { name: 'Rack de paletización', uses: 31 },
  { name: 'Mezzanine industrial', uses: 22 },
  { name: 'Módulo de almacenamiento', uses: 18 },
  { name: 'Jaula de seguridad', uses: 11 },
]

const MAX_PRODUCTS = Math.max(...TOP_PRODUCTS.map((p) => p.uses))
const MAX_QUOTES = Math.max(...QUOTES_BY_MONTH.map((q) => q.value))
const TOTAL_STATUS = PROJECTS_BY_STATUS.reduce((s, i) => s + i.value, 0)

export function AnalyticsView() {
  const { data: kpis, isLoading } = useQuery({
    queryKey: ['kpis'],
    queryFn: analyticsService.getWorkspaceKPIs,
  })

  return (
    <div className="p-6 space-y-6 max-w-screen-xl mx-auto">
      <h1 className="text-white text-xl font-questrial font-semibold">Analítica</h1>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard label="Proyectos creados" value={isLoading ? '—' : (kpis?.projectsCreated ?? 0)} icon={FolderOpen} />
        <MetricCard label="Solicitudes de cotización" value={isLoading ? '—' : (kpis?.quoteRequests ?? 0)} icon={FileText} />
        <MetricCard label="Productos activos" value={isLoading ? '—' : (kpis?.activeProducts ?? 0)} icon={Package} />
        <MetricCard label="Conversión" value={isLoading ? '—' : `${kpis?.conversionRate ?? 0}%`} icon={TrendingUp} />
        <MetricCard label="Tiempo promedio builder" value={isLoading ? '—' : `${kpis?.avgBuilderTime ?? 0} min`} icon={Clock} />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Proyectos por estado */}
        <GlassPanel className="p-5 space-y-4">
          <p className="text-white text-sm font-medium">Proyectos por estado</p>
          <div className="space-y-2.5">
            {PROJECTS_BY_STATUS.map(({ label, value, color }) => (
              <div key={label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-content-secondary text-xs">{label}</span>
                  <span className="text-white text-xs font-medium">{value}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full transition-all', color)}
                    style={{ width: `${(value / TOTAL_STATUS) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-content-muted text-[10px]">{TOTAL_STATUS} proyectos en total</p>
        </GlassPanel>

        {/* Solicitudes por mes */}
        <GlassPanel className="p-5 space-y-4">
          <p className="text-white text-sm font-medium">Solicitudes por mes</p>
          <div className="flex items-end gap-2 h-28">
            {QUOTES_BY_MONTH.map(({ month, value }) => (
              <div key={month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-white text-[10px] font-medium">{value}</span>
                <div className="w-full rounded-t-md bg-alqia-orange/60 transition-all" style={{ height: `${(value / MAX_QUOTES) * 80}px` }} />
                <span className="text-content-muted text-[10px]">{month}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Top productos */}
        <GlassPanel className="p-5 space-y-4">
          <p className="text-white text-sm font-medium">Productos mas configurados</p>
          <div className="space-y-2.5">
            {TOP_PRODUCTS.map(({ name, uses }, idx) => (
              <div key={name} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-content-secondary text-xs truncate pr-2">{name}</span>
                  <span className="text-white text-xs font-medium flex-shrink-0">{uses} usos</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', idx === 0 ? 'bg-alqia-orange' : 'bg-alqia-orange/50')}
                    style={{ width: `${(uses / MAX_PRODUCTS) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Funnel de conversión */}
        <GlassPanel className="p-5 space-y-4">
          <p className="text-white text-sm font-medium">Funnel de conversión</p>
          <div className="space-y-2">
            {[
              { label: 'Proyectos iniciados', value: 52, pct: 100 },
              { label: 'Con al menos 1 objeto', value: 41, pct: 79 },
              { label: 'Guardados', value: 27, pct: 52 },
              { label: 'Cotización solicitada', value: 9, pct: 17 },
              { label: 'Ganados', value: 4, pct: 8 },
            ].map(({ label, value, pct }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="h-6 rounded flex items-center px-2 bg-alqia-blue/60 border border-alqia-blue/40 flex-shrink-0"
                  style={{ width: `${Math.max(pct, 8)}%`, minWidth: 32 }}
                >
                  <span className="text-white text-[10px] font-medium whitespace-nowrap">{value}</span>
                </div>
                <span className="text-content-secondary text-xs">{label}</span>
                <span className="text-content-muted text-[10px] ml-auto">{pct}%</span>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>
    </div>
  )
}

