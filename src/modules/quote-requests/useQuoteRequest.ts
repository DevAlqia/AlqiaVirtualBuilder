import { useState, useCallback } from 'react'
import { useBuilderStore } from '@/store/builderStore'
import { quoteRequestService } from '@/services'
import { projectService } from '@/services'
import { aiBuilderService } from '@/services'
import { sendToPortalia, buildPortaliaPayload } from '@/services/integrations/portaliaConnector'
import { useToast } from '@/components/ui/Toast'
import { QUOTE_EVENTS, eventBus } from '@/utils/events'
import type { QuoteRequestFormData } from './quoteRequestSchema'
import type { QuoteRequest } from '@/types'

interface UseQuoteRequestResult {
  isSubmitting: boolean
  createdQuote: QuoteRequest | null
  submit: (data: QuoteRequestFormData) => Promise<void>
  reset: () => void
}

export function useQuoteRequest(): UseQuoteRequestResult {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [createdQuote, setCreatedQuote] = useState<QuoteRequest | null>(null)
  const { showToast } = useToast()

  const submit = useCallback(async (data: QuoteRequestFormData) => {
    const { currentProject, projectObjects, sceneConfig } = useBuilderStore.getState()
    if (!currentProject) return

    setIsSubmitting(true)
    try {
      // 1. Generar resumen IA (stub)
      const aiSummary = await aiBuilderService.generateProjectSummary(currentProject.id)

      // 2. Crear QuoteRequest
      const quote = await quoteRequestService.createQuoteRequest({
        project_id: currentProject.id,
        tenant_id: currentProject.tenant_id,
        company_id: currentProject.company_id,
        client_name: data.client_name,
        client_email: data.client_email || undefined,
        client_phone: data.client_phone || undefined,
        client_company: data.client_company || undefined,
        message: data.message || undefined,
        preferred_contact_channel: data.preferred_contact_channel,
        consent_status: data.consent_status,
        status: 'new',
      })

      // 3. Actualizar estado del proyecto
      await projectService.updateProject(currentProject.id, {
        status: 'quote_requested',
        ai_summary: aiSummary,
        quote_requested_at: new Date().toISOString(),
      })

      // 4. Emitir evento del sistema
      eventBus.emit(QUOTE_EVENTS.REQUEST_SUBMITTED, {
        quote_id: quote.id,
        project_id: currentProject.id,
      })

      // 5. Stub Portalia (Fase 3)
      const productsUsed = projectObjects.map((o) => ({
        sku: String(o.metadata?.sku ?? o.product_id),
        name: o.name,
        quantity: o.quantity,
      }))

      const portaliaPayload = buildPortaliaPayload(
        { client_name: data.client_name, client_email: data.client_email, client_phone: data.client_phone, client_company: data.client_company },
        { id: currentProject.id, ai_summary: aiSummary },
        productsUsed,
        sceneConfig?.scene_type ?? 'warehouse',
        currentProject.tenant_id,
        currentProject.company_id
      )
      const portaliaResult = await sendToPortalia(portaliaPayload)

      if (import.meta.env.DEV) {
        console.info('[QuoteRequest] Portalia result:', portaliaResult)
      }

      eventBus.emit(QUOTE_EVENTS.REQUEST_SENT_TO_PORTALIA, {
        quote_id: quote.id,
        portalia_success: portaliaResult.success,
      })

      setCreatedQuote(quote)
      showToast('Solicitud de cotización enviada', 'success')
    } catch (err) {
      console.error('[QuoteRequest] Error:', err)
      showToast('Ocurrió un error al enviar la solicitud. Intenta de nuevo.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }, [showToast])

  const reset = useCallback(() => {
    setCreatedQuote(null)
    setIsSubmitting(false)
  }, [])

  return { isSubmitting, createdQuote, submit, reset }
}
