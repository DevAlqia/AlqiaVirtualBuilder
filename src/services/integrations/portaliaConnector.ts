// ─── Portalia Connector — STUB para Fase 3 ────────────────────────────────────
// Activar en Fase 3. El payload ya está completamente definido.

export interface PortaliaPayload {
  tenant_id: string
  company_id: string
  source: 'virtual_builder'
  client_name: string
  client_email?: string
  client_phone?: string
  client_company?: string
  project_id: string
  project_url?: string
  project_summary?: string
  products_used: Array<{ sku: string; name: string; quantity: number }>
  scene_type: string
  ai_summary?: string
  estimated_value?: number
}

export interface PortaliaResult {
  success: boolean
  opportunity_id?: string
  contact_id?: string
  error?: string
}

/**
 * Envía un quote_request a Portalia Revenue OS.
 * STUB — retorna false hasta Fase 3.
 */
export async function sendToPortalia(_payload: PortaliaPayload): Promise<PortaliaResult> {
  if (import.meta.env.DEV) {
    console.info('[PortaliaConnector] Fase 3 pendiente. Payload listo:', _payload)
  }
  return { success: false, error: 'Portalia Connector activado en Fase 3' }
}

export function buildPortaliaPayload(
  quoteRequest: {
    client_name: string
    client_email?: string
    client_phone?: string
    client_company?: string
  },
  project: { id: string; ai_summary?: string },
  products: Array<{ sku: string; name: string; quantity: number }>,
  sceneType: string,
  tenantId: string,
  companyId: string
): PortaliaPayload {
  return {
    tenant_id: tenantId,
    company_id: companyId,
    source: 'virtual_builder',
    client_name: quoteRequest.client_name,
    client_email: quoteRequest.client_email,
    client_phone: quoteRequest.client_phone,
    client_company: quoteRequest.client_company,
    project_id: project.id,
    project_summary: project.ai_summary,
    products_used: products,
    scene_type: sceneType,
  }
}
