import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Phone, MessageSquare, User } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { ProjectStatusBadge } from '@/components/ui/StatusBadge'
import { useBuilderStore } from '@/store/builderStore'
import { useQuoteRequest } from './useQuoteRequest'
import { quoteRequestSchema, type QuoteRequestFormData } from './quoteRequestSchema'
import { QuoteSuccessScreen } from './QuoteSuccessScreen'
import { cn } from '@/utils/cn'

const CONTACT_CHANNELS = [
  { value: 'email', label: 'Correo electrónico', icon: Mail },
  { value: 'phone', label: 'Llamada telefónica', icon: Phone },
  { value: 'whatsapp', label: 'WhatsApp', icon: MessageSquare },
  { value: 'in_person', label: 'Visita presencial', icon: User },
] as const

interface QuoteRequestModalProps {
  open: boolean
  onClose: () => void
}

export function QuoteRequestModal({ open, onClose }: QuoteRequestModalProps) {
  const { currentProject, projectObjects, sceneConfig } = useBuilderStore()
  const { isSubmitting, createdQuote, submit, reset } = useQuoteRequest()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteRequestFormData>({
    resolver: zodResolver(quoteRequestSchema),
    defaultValues: {
      client_name: currentProject?.client_name ?? '',
      client_email: currentProject?.client_email ?? '',
      client_phone: currentProject?.client_phone ?? '',
      client_company: currentProject?.client_company ?? '',
      message: '',
      preferred_contact_channel: 'email',
      consent_status: false,
    },
  })

  const selectedChannel = watch('preferred_contact_channel')

  const handleClose = () => {
    reset()
    onClose()
  }

  if (createdQuote) {
    return (
      <Modal open={open} onClose={handleClose} size="lg">
        <QuoteSuccessScreen quote={createdQuote} project={currentProject} onClose={handleClose} />
      </Modal>
    )
  }

  return (
    <Modal open={open} onClose={handleClose} title="Solicitar cotización" size="xl">
      <div className="flex gap-0 max-h-[70vh]">
        {/* Formulario — izquierdo */}
        <form
          onSubmit={handleSubmit(submit)}
          className="flex-1 p-6 overflow-y-auto space-y-4 border-r border-white/[0.06]"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nombre completo"
              placeholder="Juan González"
              error={errors.client_name?.message}
              {...register('client_name')}
            />
            <Input
              label="Empresa (opcional)"
              placeholder="Manufacturera del Norte"
              error={errors.client_company?.message}
              {...register('client_company')}
            />
            <Input
              label="Correo electrónico"
              type="email"
              placeholder="correo@empresa.com"
              error={errors.client_email?.message}
              {...register('client_email')}
            />
            <Input
              label="Teléfono"
              type="tel"
              placeholder="+52 81 0000 0000"
              error={errors.client_phone?.message}
              {...register('client_phone')}
            />
          </div>

          {/* Canal de contacto preferido */}
          <div>
            <p className="text-content-secondary text-xs uppercase tracking-wider mb-2">
              Canal de contacto preferido
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONTACT_CHANNELS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setValue('preferred_contact_channel', value)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm transition-all text-left',
                    selectedChannel === value
                      ? 'border-alqia-orange/50 bg-alqia-orange/10 text-white'
                      : 'border-white/[0.08] text-content-secondary hover:border-white/20 hover:text-white glass'
                  )}
                >
                  <Icon className={cn('w-3.5 h-3.5 flex-shrink-0', selectedChannel === value ? 'text-alqia-orange' : '')} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Mensaje */}
          <div className="flex flex-col gap-1.5">
            <label className="text-content-secondary text-xs uppercase tracking-wider">
              Notas adicionales (opcional)
            </label>
            <textarea
              rows={3}
              placeholder="Describe brevemente tus necesidades o preguntas..."
              className={cn(
                'w-full px-3 py-2 bg-white/[0.06] border border-white/[0.10] rounded-lg text-white text-sm',
                'placeholder:text-content-muted resize-none',
                'focus:outline-none focus:ring-1 focus:ring-alqia-orange/50 focus:border-alqia-orange/50 transition-all'
              )}
              {...register('message')}
            />
            {errors.message && (
              <p className="text-status-danger text-xs">{errors.message.message}</p>
            )}
          </div>

          {/* Consentimiento */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              className="mt-0.5 w-4 h-4 accent-alqia-orange flex-shrink-0 cursor-pointer"
              {...register('consent_status')}
            />
            <div>
              <p className="text-content-secondary text-xs leading-relaxed group-hover:text-white transition-colors">
                Acepto el{' '}
                <span className="text-alqia-orange underline underline-offset-2">
                  aviso de privacidad
                </span>{' '}
                y autorizo el uso de mis datos para recibir cotización e información comercial.
              </p>
              {errors.consent_status && (
                <p className="text-status-danger text-xs mt-1">{errors.consent_status.message}</p>
              )}
            </div>
          </label>

          {/* Disclaimer legal */}
          <div className="px-3 py-2.5 rounded-lg border border-alqia-orange/20 bg-alqia-orange/5">
            <p className="text-alqia-orange text-xs italic">
              Configuración preliminar sujeta a validación técnica y cotización final.
            </p>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Enviando solicitud...' : 'Solicitar cotización'}
          </Button>
        </form>

        {/* Resumen del proyecto — derecho */}
        <aside className="w-64 flex-shrink-0 p-4 overflow-y-auto space-y-3">
          <p className="text-content-secondary text-xs uppercase tracking-wider">
            Resumen del proyecto
          </p>

          {currentProject && (
            <GlassPanel className="p-3 space-y-1.5">
              <p className="text-white text-sm font-medium">{currentProject.name}</p>
              <p className="text-content-muted text-xs">{currentProject.project_number}</p>
              <ProjectStatusBadge status={currentProject.status} />
            </GlassPanel>
          )}

          {sceneConfig && (
            <GlassPanel className="p-3">
              <p className="text-content-secondary text-xs uppercase tracking-wider mb-1.5">
                Escena
              </p>
              <p className="text-white text-xs">{sceneConfig.name}</p>
              <p className="text-content-muted text-xs mt-0.5">
                {sceneConfig.width}×{sceneConfig.depth}×{sceneConfig.height}m
              </p>
            </GlassPanel>
          )}

          <div>
            <p className="text-content-secondary text-xs uppercase tracking-wider mb-2">
              Productos ({projectObjects.length})
            </p>
            {projectObjects.length === 0 ? (
              <p className="text-content-muted text-xs">Sin objetos en el espacio.</p>
            ) : (
              <div className="space-y-1.5">
                {projectObjects.map((obj) => (
                  <GlassPanel key={obj.id} className="p-2">
                    <p className="text-white text-xs truncate">{obj.name}</p>
                    <p className="text-content-muted text-[10px] mt-0.5">
                      {String(obj.metadata?.sku ?? '')} · cant. {obj.quantity}
                    </p>
                  </GlassPanel>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </Modal>
  )
}
