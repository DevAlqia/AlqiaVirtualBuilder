/**
 * shareProjectService — MVP mock
 *
 * Almacena shares y comentarios en localStorage.
 * En produccion sustituir por llamadas a Supabase (tabla project_shares).
 */

import type { ProjectShare, ProjectShareSnapshot, ClientComment, ClientCommentType } from '@/types'
import { mockProducts } from '@/data/mock/products'
import type { BuilderProject, ProjectObject, Scene } from '@/types'

const SHARES_KEY   = 'alqia_project_shares'
const COMMENTS_KEY = 'alqia_client_comments'
const QUOTES_KEY   = 'alqia_share_quote_requests'

// ── Storage helpers ────────────────────────────────────────────────────────────

function readShares(): Record<string, ProjectShare> {
  try {
    const raw = localStorage.getItem(SHARES_KEY)
    return raw ? (JSON.parse(raw) as Record<string, ProjectShare>) : {}
  } catch {
    return {}
  }
}

function writeShares(shares: Record<string, ProjectShare>): void {
  try { localStorage.setItem(SHARES_KEY, JSON.stringify(shares)) } catch { /* quota */ }
}

function generateToken(): string {
  const arr = new Uint8Array(24)
  crypto.getRandomValues(arr)
  return Array.from(arr).map((b) => b.toString(16).padStart(2, '0')).join('')
}

// ── Service ────────────────────────────────────────────────────────────────────

export const shareProjectService = {

  // Crear un nuevo share link con snapshot del estado actual del proyecto
  createShareLink(params: {
    project: BuilderProject
    objects: ProjectObject[]
    scene: Scene
    title?: string
    message?: string
    allowComments?: boolean
    allowQuoteRequest?: boolean
    allowPdfDownload?: boolean
    showPrices?: boolean
  }): ProjectShare {
    const token     = generateToken()
    const now       = new Date().toISOString()
    const publicUrl = `${window.location.origin}/share/${token}`

    // Snapshot: embebe los productos referenciados para que la vista pública
    // pueda mostrar precios y nombres sin acceder al catálogo interno
    const productIds = [...new Set(params.objects.map((o) => o.product_id).filter(Boolean))]
    const products   = mockProducts.filter((p) => productIds.includes(p.id))

    const snapshot: ProjectShareSnapshot = {
      project:      params.project,
      objects:      params.objects,
      scene:        params.scene,
      products,
      vertical_key: String(params.project.metadata?.vertical_key ?? ''),
    }

    const share: ProjectShare = {
      id:                  crypto.randomUUID(),
      tenant_id:           params.project.tenant_id,
      company_id:          params.project.company_id,
      project_id:          params.project.id,
      share_token:         token,
      public_url:          publicUrl,
      title:               params.title ?? params.project.name,
      message:             params.message,
      access_mode:         'view_only',
      allow_comments:      params.allowComments      ?? true,
      allow_quote_request: params.allowQuoteRequest  ?? true,
      allow_pdf_download:  params.allowPdfDownload   ?? true,
      show_prices:         params.showPrices         ?? true,
      created_at:          now,
      updated_at:          now,
      snapshot,
    }

    const shares = readShares()
    shares[token] = share
    writeShares(shares)

    return share
  },

  // Obtener proyecto compartido por token (para la vista pública)
  getSharedProject(shareToken: string): ProjectShare | null {
    const shares = readShares()
    const share  = shares[shareToken]
    if (!share) return null
    if (share.revoked_at) return null
    if (share.expires_at && new Date(share.expires_at) < new Date()) return null
    return share
  },

  // Listar shares activos de un proyecto (para el modal del builder)
  getSharesForProject(projectId: string): ProjectShare[] {
    const shares = readShares()
    return Object.values(shares).filter((s) => s.project_id === projectId && !s.revoked_at)
  },

  // Revocar un share
  revokeShareLink(shareId: string): void {
    const shares = readShares()
    const share  = Object.values(shares).find((s) => s.id === shareId)
    if (share) {
      share.revoked_at = new Date().toISOString()
      shares[share.share_token] = share
      writeShares(shares)
    }
  },

  // Copiar URL al portapapeles
  async copyShareUrl(url: string): Promise<void> {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url)
    } else {
      // Fallback legacy
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
  },

  // Guardar comentario del cliente
  submitClientComment(params: {
    shareId:     string
    projectId:   string
    clientName:  string
    clientEmail?: string
    comment:     string
    commentType: ClientCommentType
  }): ClientComment {
    const comment: ClientComment = {
      id:           crypto.randomUUID(),
      tenant_id:    'tenant-demo',
      project_id:   params.projectId,
      share_id:     params.shareId,
      client_name:  params.clientName,
      client_email: params.clientEmail,
      comment:      params.comment,
      comment_type: params.commentType,
      created_at:   new Date().toISOString(),
    }
    try {
      const raw = localStorage.getItem(COMMENTS_KEY)
      const list: ClientComment[] = raw ? JSON.parse(raw) : []
      list.push(comment)
      localStorage.setItem(COMMENTS_KEY, JSON.stringify(list))
    } catch { /* quota */ }
    return comment
  },

  // Guardar solicitud de cotización desde vista pública
  submitQuoteFromSharedProject(params: {
    shareId:      string
    projectId:    string
    clientName:   string
    clientEmail?: string
    clientPhone?: string
    message?:     string
  }): void {
    try {
      const raw  = localStorage.getItem(QUOTES_KEY)
      const list = raw ? JSON.parse(raw) : []
      list.push({ id: crypto.randomUUID(), ...params, created_at: new Date().toISOString() })
      localStorage.setItem(QUOTES_KEY, JSON.stringify(list))
    } catch { /* quota */ }
  },

  // Calcular resumen de cotización estimada a partir del snapshot
  calcQuoteSummary(snapshot: ProjectShareSnapshot, showPrices: boolean) {
    if (!showPrices) return null

    const lineItems = snapshot.objects
      .filter((o) => o.product_id)
      .reduce<{ product_id: string; name: string; qty: number; unit_price: number }[]>((acc, obj) => {
        const prod = snapshot.products.find((p) => p.id === obj.product_id)
        if (!prod || !prod.price) return acc
        const existing = acc.find((l) => l.product_id === obj.product_id)
        if (existing) {
          existing.qty += obj.quantity ?? 1
        } else {
          acc.push({
            product_id: obj.product_id,
            name:       prod.name,
            qty:        obj.quantity ?? 1,
            unit_price: prod.price,
          })
        }
        return acc
      }, [])

    const subtotal = lineItems.reduce((s, l) => s + l.qty * l.unit_price, 0)
    const iva      = subtotal * 0.16
    const total    = subtotal + iva

    return { lineItems, subtotal, iva, total }
  },
}
