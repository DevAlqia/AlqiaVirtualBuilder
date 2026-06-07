import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Upload, Search, Box, RefreshCw, Link } from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { AssetStatusBadge } from '@/components/ui/StatusBadge'
import { assetService } from '@/services'
import type { Asset3D, Asset3DStatus } from '@/types'
import { formatFileSize, formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const ALL_STATUSES: Array<{ value: Asset3DStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Activo' },
  { value: 'optimized', label: 'Optimizado' },
  { value: 'uploaded', label: 'Subido' },
  { value: 'processing', label: 'Procesando' },
  { value: 'failed', label: 'Error' },
  { value: 'archived', label: 'Archivado' },
]

export function AssetsView() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Asset3DStatus | 'all'>('all')

  const { data: assets = [], isLoading } = useQuery<Asset3D[]>({
    queryKey: ['assets'],
    queryFn: assetService.getAssets,
  })

  const filtered = assets.filter((a) => {
    const matchSearch = a.name.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || a.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    active: assets.filter((a) => a.status === 'active').length,
    processing: assets.filter((a) => a.status === 'processing').length,
    failed: assets.filter((a) => a.status === 'failed').length,
  }

  return (
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-white text-xl font-questrial font-semibold">Assets 3D</h1>
        <Button variant="primary" icon={<Upload className="w-4 h-4" />}>
          Subir asset
        </Button>
      </div>

      {/* Resumen rápido */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Activos y listos', value: stats.active, color: 'text-status-success' },
          { label: 'En procesamiento', value: stats.processing, color: 'text-status-warning' },
          { label: 'Con error', value: stats.failed, color: 'text-status-danger' },
        ].map(({ label, value, color }) => (
          <GlassPanel key={label} className="p-3 flex items-center gap-3">
            <p className={cn('text-2xl font-questrial font-bold', color)}>{value}</p>
            <p className="text-content-secondary text-xs">{label}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar asset..."
            className="pl-8 pr-3 py-1.5 w-52 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value as Asset3DStatus | 'all')}
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

      <GlassPanel className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06]">
              {['Archivo', 'Tipo', 'Formato', 'Tamaño', 'Estado', 'Actualizado', ''].map((h) => (
                <th key={h} className="text-left text-content-secondary text-xs px-4 py-3 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [1, 2, 3].map((n) => (
                  <tr key={n} className="border-b border-white/[0.04]">
                    {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                      <td key={c} className="px-4 py-3">
                        <div className="h-4 bg-white/[0.06] rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              : filtered.map((asset: Asset3D) => (
                  <tr
                    key={asset.id}
                    className="border-b border-white/[0.04] hover:bg-white/[0.04] transition-colors group"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-alqia-blue/40 flex items-center justify-center flex-shrink-0">
                          <Box className="w-4 h-4 text-white/30" />
                        </div>
                        <div>
                          <p className="text-white text-xs font-medium">{asset.name}</p>
                          <p className="text-content-muted text-[10px]">{asset.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-content-secondary text-xs capitalize">{asset.asset_type}</td>
                    <td className="px-4 py-3 text-content-secondary text-xs uppercase">{asset.file_format}</td>
                    <td className="px-4 py-3 text-content-secondary text-xs">
                      {formatFileSize(asset.file_size)}
                    </td>
                    <td className="px-4 py-3">
                      <AssetStatusBadge status={asset.status} />
                    </td>
                    <td className="px-4 py-3 text-content-muted text-xs">{formatDate(asset.updated_at)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {asset.status === 'failed' && (
                          <button className="p-1.5 rounded text-status-danger hover:bg-status-danger/10 transition-all" title="Reintentar">
                            <RefreshCw className="w-3 h-3" />
                          </button>
                        )}
                        {(asset.status === 'active' || asset.status === 'optimized') && (
                          <button className="p-1.5 rounded text-content-secondary hover:text-white hover:bg-white/[0.06] transition-all" title="Vincular a producto">
                            <Link className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {!isLoading && filtered.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-content-muted text-sm">No se encontraron assets.</p>
          </div>
        )}
      </GlassPanel>
    </div>
  )
}
