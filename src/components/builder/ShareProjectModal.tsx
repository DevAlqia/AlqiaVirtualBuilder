import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useBuilderStore } from '@/store/builderStore'
import { shareProjectService } from '@/services'
import { useToast } from '@/components/ui/Toast'
import {
  X, Link2, Copy, ExternalLink, RefreshCw, EyeOff, Check,
  MessageSquare, FileText, DollarSign, Share2,
} from 'lucide-react'
import type { ProjectShare } from '@/types'
import { cn } from '@/utils/cn'

interface ShareProjectModalProps {
  open:    boolean
  onClose: () => void
}

export function ShareProjectModal({ open, onClose }: ShareProjectModalProps) {
  const { currentProject, projectObjects, sceneConfig } = useBuilderStore()
  const { showToast } = useToast()

  const [existingShare, setExistingShare] = useState<ProjectShare | null>(null)
  const [isCreating,    setIsCreating]    = useState(false)
  const [isCopied,      setIsCopied]      = useState(false)
  const [step,          setStep]          = useState<'config' | 'done'>('config')

  // Opciones del link
  const [title,             setTitle]             = useState('')
  const [message,           setMessage]           = useState('')
  const [allowComments,     setAllowComments]     = useState(true)
  const [allowQuote,        setAllowQuote]        = useState(true)
  const [allowPdf,          setAllowPdf]          = useState(true)
  const [showPrices,        setShowPrices]        = useState(true)

  // Cargar share existente si lo hay
  useEffect(() => {
    if (!open || !currentProject) return
    setTitle(currentProject.name ?? '')
    const shares = shareProjectService.getSharesForProject(currentProject.id)
    const active = shares.find((s) => !s.revoked_at)
    if (active) {
      setExistingShare(active)
      setStep('done')
    } else {
      setExistingShare(null)
      setStep('config')
    }
  }, [open, currentProject])

  const handleCreate = async () => {
    if (!currentProject || !sceneConfig) return
    setIsCreating(true)
    try {
      const share = shareProjectService.createShareLink({
        project:           currentProject,
        objects:           projectObjects,
        scene:             sceneConfig,
        title:             title || currentProject.name,
        message:           message || undefined,
        allowComments,
        allowQuoteRequest: allowQuote,
        allowPdfDownload:  allowPdf,
        showPrices,
      })
      setExistingShare(share)
      setStep('done')
      showToast('Link de cliente creado', 'success')
    } finally {
      setIsCreating(false)
    }
  }

  const handleCopy = async () => {
    if (!existingShare) return
    await shareProjectService.copyShareUrl(existingShare.public_url)
    setIsCopied(true)
    showToast('Link copiado al portapapeles', 'success')
    setTimeout(() => setIsCopied(false), 2500)
  }

  const handleRevoke = () => {
    if (!existingShare) return
    shareProjectService.revokeShareLink(existingShare.id)
    setExistingShare(null)
    setStep('config')
    showToast('Link desactivado', 'info')
  }

  const handleRegenerate = () => {
    if (!existingShare) return
    shareProjectService.revokeShareLink(existingShare.id)
    setExistingShare(null)
    setStep('config')
  }

  const handleOpenPreview = () => {
    if (!existingShare) return
    window.open(existingShare.public_url, '_blank', 'noopener,noreferrer')
  }

  if (!open) return null

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1,    y: 0 }}
            exit={{   opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18 }}
            className="relative w-full max-w-lg bg-bg-dark border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-alqia-orange/10 border border-alqia-orange/20 flex items-center justify-center">
                  <Share2 className="w-4 h-4 text-alqia-orange" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">Compartir con cliente</h2>
                  <p className="text-content-muted text-xs">Genera un link para presentacion</p>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-content-muted hover:text-white hover:bg-white/[0.06] transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">

              {step === 'config' && (
                <>
                  {/* Titulo del link */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-content-muted uppercase tracking-wide">Titulo del link</label>
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={currentProject?.name ?? 'Propuesta para cliente'}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-content-muted focus:outline-none focus:border-alqia-orange/50 transition-colors"
                    />
                  </div>

                  {/* Mensaje opcional */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-content-muted uppercase tracking-wide">Mensaje para el cliente (opcional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={2}
                      placeholder="Hola, aqui te comparto la propuesta visual de tu proyecto..."
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-content-muted focus:outline-none focus:border-alqia-orange/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Permisos */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-content-muted uppercase tracking-wide">Permisos del cliente</label>
                    <div className="space-y-2">
                      {[
                        { icon: MessageSquare, label: 'Puede dejar comentarios',   value: allowComments,  set: setAllowComments  },
                        { icon: FileText,      label: 'Puede solicitar cotizacion', value: allowQuote,     set: setAllowQuote     },
                        { icon: FileText,      label: 'Puede descargar PDF',        value: allowPdf,       set: setAllowPdf       },
                        { icon: DollarSign,    label: 'Ver precios estimados',      value: showPrices,     set: setShowPrices     },
                      ].map(({ icon: Icon, label, value, set }) => (
                        <button
                          key={label}
                          onClick={() => set(!value)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border transition-all text-left',
                            value
                              ? 'bg-alqia-orange/[0.07] border-alqia-orange/25 text-white'
                              : 'bg-white/[0.03] border-white/[0.06] text-content-muted'
                          )}
                        >
                          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-sm flex-1">{label}</span>
                          <div className={cn(
                            'w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all',
                            value ? 'bg-alqia-orange border-alqia-orange' : 'border-white/20'
                          )}>
                            {value && <Check className="w-2.5 h-2.5 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-1">
                    <p className="text-content-muted text-[11px] leading-relaxed">
                      El link genera un snapshot del proyecto actual. Si sigues editando, los cambios no afectaran la vista del cliente.
                    </p>
                  </div>
                </>
              )}

              {step === 'done' && existingShare && (
                <>
                  {/* URL del link */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-content-muted uppercase tracking-wide">Link de cliente</label>
                    <div className="flex items-center gap-2 bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2.5">
                      <Link2 className="w-3.5 h-3.5 text-alqia-orange flex-shrink-0" />
                      <span className="flex-1 text-xs text-white truncate font-mono">{existingShare.public_url}</span>
                    </div>
                  </div>

                  {/* Info del snapshot */}
                  <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-3 space-y-1">
                    <p className="text-xs text-white font-medium">{existingShare.title}</p>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {[
                        existingShare.allow_comments      && 'Comentarios',
                        existingShare.allow_quote_request && 'Cotizacion',
                        existingShare.allow_pdf_download  && 'PDF',
                        existingShare.show_prices         && 'Precios visibles',
                      ].filter(Boolean).map((tag) => (
                        <span key={String(tag)} className="px-2 py-0.5 rounded-full bg-alqia-orange/10 border border-alqia-orange/20 text-alqia-orange text-[10px] font-medium">
                          {String(tag)}
                        </span>
                      ))}
                    </div>
                    <p className="text-content-muted text-[10px] mt-1">
                      Creado {new Date(existingShare.created_at).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </p>
                  </div>

                  {/* Acciones secundarias */}
                  <div className="flex gap-2">
                    <button
                      onClick={handleRegenerate}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-content-muted hover:text-white hover:bg-white/[0.06] border border-white/[0.06] text-xs transition-all"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Regenerar
                    </button>
                    <button
                      onClick={handleRevoke}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-content-muted hover:text-red-400 hover:bg-red-500/[0.06] border border-white/[0.06] text-xs transition-all"
                    >
                      <EyeOff className="w-3 h-3" />
                      Desactivar link
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-2 px-6 py-4 border-t border-white/[0.06] bg-white/[0.02]">
              {step === 'config' && (
                <>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 rounded-lg border border-white/10 text-content-muted hover:text-white hover:bg-white/[0.06] text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-alqia-orange hover:bg-alqia-orange/90 text-white text-sm font-medium transition-all disabled:opacity-60"
                  >
                    {isCreating ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Share2 className="w-3.5 h-3.5" />
                    )}
                    Crear link
                  </button>
                </>
              )}

              {step === 'done' && existingShare && (
                <>
                  <button
                    onClick={handleCopy}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all',
                      isCopied
                        ? 'border-status-success/40 bg-status-success/10 text-status-success'
                        : 'border-white/10 text-white hover:bg-white/[0.06]'
                    )}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {isCopied ? 'Copiado' : 'Copiar link'}
                  </button>
                  <button
                    onClick={handleOpenPreview}
                    className="ml-auto flex items-center gap-2 px-5 py-2 rounded-lg bg-alqia-orange hover:bg-alqia-orange/90 text-white text-sm font-medium transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Abrir vista cliente
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
