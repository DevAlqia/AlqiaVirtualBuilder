import { Badge } from './Badge'
import type { ProjectStatus, QuoteRequestStatus, Asset3DStatus } from '@/types'

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'orange'

const PROJECT_STATUS: Record<ProjectStatus, { label: string; variant: BadgeVariant }> = {
  draft: { label: 'Borrador', variant: 'default' },
  saved: { label: 'Guardado', variant: 'info' },
  shared: { label: 'Compartido', variant: 'orange' },
  quote_requested: { label: 'Cotización solicitada', variant: 'warning' },
  in_review: { label: 'En revisión', variant: 'warning' },
  quoted: { label: 'Cotizado', variant: 'orange' },
  won: { label: 'Ganado', variant: 'success' },
  lost: { label: 'Perdido', variant: 'danger' },
  archived: { label: 'Archivado', variant: 'default' },
}

const QUOTE_STATUS: Record<QuoteRequestStatus, { label: string; variant: BadgeVariant }> = {
  new: { label: 'Nueva', variant: 'info' },
  assigned: { label: 'Asignada', variant: 'orange' },
  contacted: { label: 'Contactado', variant: 'warning' },
  quoted: { label: 'Cotizado', variant: 'orange' },
  closed: { label: 'Cerrada', variant: 'success' },
  archived: { label: 'Archivada', variant: 'default' },
}

const ASSET_STATUS: Record<Asset3DStatus, { label: string; variant: BadgeVariant }> = {
  uploaded: { label: 'Subido', variant: 'info' },
  processing: { label: 'Procesando', variant: 'warning' },
  optimized: { label: 'Optimizado', variant: 'success' },
  failed: { label: 'Error', variant: 'danger' },
  active: { label: 'Activo', variant: 'success' },
  archived: { label: 'Archivado', variant: 'default' },
}

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const cfg = PROJECT_STATUS[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function QuoteStatusBadge({ status }: { status: QuoteRequestStatus }) {
  const cfg = QUOTE_STATUS[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}

export function AssetStatusBadge({ status }: { status: Asset3DStatus }) {
  const cfg = ASSET_STATUS[status]
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
