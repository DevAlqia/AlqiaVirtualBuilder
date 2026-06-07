import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { QuoteStatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { quoteRequestService } from '@/services'
import type { QuoteRequest, QuoteRequestStatus } from '@/types'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'
import {
  Phone,
  Mail,
  Building2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Search,
} from 'lucide-react'

const ALL_STATUSES: Array<{ value: QuoteRequestStatus | 'all'; label: string }> = [
  { value: 'all', label: 'Todas' },
  { value: 'new', label: 'Nueva' },
  { value: 'assigned', label: 'Asignada' },
  { value: 'contacted', label: 'Contactada' },
  { value: 'quoted', label: 'Cotizada' },
  { value: 'closed', label: 'Cerrada' },
  { value: 'archived', label: 'Archivada' },
]

function QuoteCard({ quote }: { quote: QuoteRequest }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <GlassPanel className="overflow-hidden transition-all">
      <button
        className="w-full p-4 flex items-start gap-4 hover:bg-white/[0.04] transition-all text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-white text-sm font-medium">{quote.client_name}</p>
            <QuoteStatusBadge status={quote.status} />
            {quote.preferred_contact_channel && (
              <span className="text-[10px] text-content-muted border border-white/[0.08] rounded px-1.5 py-0.5">
                {quote.preferred_contact_channel}
              </span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-content-muted text-xs">
            {quote.client_company && (
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3" />{quote.client_company}
              </span>
            )}
            {quote.client_email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3 h-3" />{quote.client_email}
              </span>
            )}
            {quote.client_phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3 h-3" />{quote.client_phone}
              </span>
            )}
          </div>
          {!expanded && quote.message && (
            <p className="text-content-secondary text-xs mt-1.5 line-clamp-1">{quote.message}</p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-content-muted text-xs">{formatDate(quote.created_at)}</p>
            <p className="text-content-muted/50 text-[10px] mt-0.5">{quote.project_id}</p>
          </div>
          {expanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-content-muted" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-content-muted" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.06] p-4 space-y-3">
          {quote.message && (
            <div>
              <p className="text-content-secondary text-[10px] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MessageSquare className="w-3 h-3" /> Mensaje
              </p>
              <p className="text-white text-sm leading-relaxed">{quote.message}</p>
            </div>
          )}
          {quote.consent_status && (
            <p className="text-status-success text-[10px]">Consentimiento de comunicacion aceptado</p>
          )}
          <div className="flex gap-2 pt-1">
            <Button variant="secondary" size="sm" className="text-xs">
              Marcar como revisada
            </Button>
            <Button variant="secondary" size="sm" className="text-xs">
              Enviar cotizacion formal
            </Button>
          </div>
        </div>
      )}
    </GlassPanel>
  )
}

export function QuoteRequestsList() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<QuoteRequestStatus | 'all'>('all')

  const { data: quotes = [], isLoading } = useQuery<QuoteRequest[]>({
    queryKey: ['quote-requests'],
    queryFn: quoteRequestService.getQuoteRequests,
  })

  const filtered = quotes.filter((q: QuoteRequest) => {
    const matchSearch =
      q.client_name?.toLowerCase().includes(search.toLowerCase()) ||
      q.client_company?.toLowerCase().includes(search.toLowerCase()) ||
      q.client_email?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || q.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 space-y-4 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-white text-xl font-questrial font-semibold">Solicitudes de cotización</h1>
          <p className="text-content-muted text-xs mt-0.5">{quotes.length} solicitud{quotes.length !== 1 ? 'es' : ''} en total</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar cliente..."
            className="pl-8 pr-3 py-1.5 bg-white/[0.06] border border-white/[0.08] rounded-lg text-sm text-white placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-alqia-orange/40 transition-all w-52"
          />
        </div>
        <div className="flex items-center gap-1 flex-wrap">
          {ALL_STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => setStatusFilter(s.value as QuoteRequestStatus | 'all')}
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

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <GlassPanel key={n} className="h-24 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <GlassPanel className="p-8 text-center">
          <p className="text-content-muted text-sm">No hay solicitudes que coincidan.</p>
        </GlassPanel>
      ) : (
        <div className="space-y-2">
          {filtered.map((quote: QuoteRequest) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))}
        </div>
      )}
    </div>
  )
}
