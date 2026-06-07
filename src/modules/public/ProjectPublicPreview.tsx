import { useEffect, useState, Suspense } from 'react'
import { useParams } from 'react-router-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Environment } from '@react-three/drei'
import { shareProjectService } from '@/services'
import { ProductObject } from '@/components/builder/ProductObject'
import { SceneFloor } from '@/components/builder/SceneFloor'
import { SceneWalls } from '@/components/builder/SceneWalls'
import {
  MessageSquare, FileText, Download, ChevronDown, ChevronUp,
  AlertTriangle, Check, X,
} from 'lucide-react'
import type { ProjectShare, ProjectShareSnapshot, ClientCommentType } from '@/types'
import * as THREE from 'three'

// ── Disclaimer por vertical ────────────────────────────────────────────────────

const DISCLAIMER_BY_VERTICAL: Record<string, string> = {
  architecture_concept:
    'Propuesta visual conceptual a escala aproximada. No sustituye planos ejecutivos, calculo estructural, permisos, proyecto arquitectonico autorizado ni validacion tecnica de obra.',
  exterior_enclosures:
    'Propuesta visual conceptual a escala aproximada. No sustituye planos ejecutivos, permisos ni validacion tecnica de obra.',
}

const DEFAULT_DISCLAIMER =
  'Esta propuesta visual es preliminar y esta sujeta a validacion tecnica, disponibilidad, medidas reales y cotizacion final.'

function getDisclaimer(verticalKey?: string): string {
  return (verticalKey && DISCLAIMER_BY_VERTICAL[verticalKey]) ?? DEFAULT_DISCLAIMER
}

// ── Formato de precio ──────────────────────────────────────────────────────────

function fmtMXN(n: number): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(n)
}

// ── Mini canvas 3D read-only ───────────────────────────────────────────────────

function ReadOnlyCanvas({ snapshot }: { snapshot: ProjectShareSnapshot }) {
  const scene = snapshot.scene
  const w = (scene.width  ?? 800) / 100
  const d = (scene.depth  ?? 600) / 100
  const h = (scene.height ?? 280) / 100

  return (
    <Canvas
      camera={{ position: [w * 0.7, h * 1.6, d * 0.9], fov: 55 }}
      gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      shadows
    >
      <color attach="background" args={['#111923']} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <Suspense fallback={null}>
        <Environment preset="city" />
        <SceneFloor
          width={(scene.width ?? 800) / 100}
          depth={(scene.depth ?? 600) / 100}
          material={scene.floor_material ?? 'concrete'}
        />
        {scene.wall_enabled && <SceneWalls scene={scene} />}
        {snapshot.objects.map((obj) => (
          <ProductObject key={obj.id} object={obj} />
        ))}
        <OrbitControls enablePan={false} minDistance={2} maxDistance={40} />
      </Suspense>
    </Canvas>
  )
}

// ── Tabla de cotización estimada ───────────────────────────────────────────────

interface QuoteSummary {
  lineItems: { product_id: string; name: string; qty: number; unit_price: number }[]
  subtotal:  number
  iva:       number
  total:     number
}

function QuoteTable({ summary }: { summary: QuoteSummary }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Producto</th>
            <th className="text-center px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide w-16">Cant.</th>
            <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Precio unit.</th>
            <th className="text-right px-4 py-2.5 font-semibold text-gray-600 text-xs uppercase tracking-wide">Subtotal</th>
          </tr>
        </thead>
        <tbody>
          {summary.lineItems.map((item) => (
            <tr key={item.product_id} className="border-b border-gray-100 last:border-0">
              <td className="px-4 py-2.5 text-gray-800">{item.name}</td>
              <td className="px-4 py-2.5 text-center text-gray-600">{item.qty}</td>
              <td className="px-4 py-2.5 text-right text-gray-600">{fmtMXN(item.unit_price)}</td>
              <td className="px-4 py-2.5 text-right font-medium text-gray-800">{fmtMXN(item.qty * item.unit_price)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t border-gray-200 bg-gray-50">
            <td colSpan={3} className="px-4 py-2 text-right text-xs text-gray-500">Subtotal</td>
            <td className="px-4 py-2 text-right text-sm font-medium text-gray-700">{fmtMXN(summary.subtotal)}</td>
          </tr>
          <tr className="bg-gray-50">
            <td colSpan={3} className="px-4 py-2 text-right text-xs text-gray-500">IVA 16%</td>
            <td className="px-4 py-2 text-right text-sm text-gray-600">{fmtMXN(summary.iva)}</td>
          </tr>
          <tr className="bg-[#F98058]/5 border-t-2 border-[#F98058]/30">
            <td colSpan={3} className="px-4 py-3 text-right text-sm font-bold text-gray-700">Total estimado</td>
            <td className="px-4 py-3 text-right text-base font-bold text-[#F98058]">{fmtMXN(summary.total)}</td>
          </tr>
        </tfoot>
      </table>
      <p className="px-4 py-2.5 text-[11px] text-gray-400 border-t border-gray-100">
        Precios en MXN + IVA. Esta estimacion es referencial, sujeta a cotizacion formal.
      </p>
    </div>
  )
}

// ── Modal comentario / cotizacion ─────────────────────────────────────────────

type ModalKind = 'comment' | 'quote'

function ClientActionModal({ kind, share, onClose, onSubmit }: {
  kind:     ModalKind
  share:    ProjectShare
  onClose:  () => void
  onSubmit: (msg: string) => void
}) {
  const [name,    setName]    = useState('')
  const [email,   setEmail]   = useState('')
  const [phone,   setPhone]   = useState('')
  const [message, setMessage] = useState('')
  const [sent,    setSent]    = useState(false)

  const handleSend = () => {
    if (!name.trim() || !message.trim()) return
    if (kind === 'comment') {
      shareProjectService.submitClientComment({
        shareId:     share.id,
        projectId:   share.project_id,
        clientName:  name,
        clientEmail: email || undefined,
        comment:     message,
        commentType: 'general' as ClientCommentType,
      })
    } else {
      shareProjectService.submitQuoteFromSharedProject({
        shareId:    share.id,
        projectId:  share.project_id,
        clientName: name,
        clientEmail: email || undefined,
        clientPhone: phone || undefined,
        message,
      })
    }
    setSent(true)
    onSubmit(message)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">
            {kind === 'comment' ? 'Enviar comentario' : 'Solicitar cotizacion'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {sent ? (
          <div className="px-5 py-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-gray-800">
              {kind === 'comment' ? 'Comentario enviado' : 'Solicitud enviada'}
            </p>
            <p className="text-sm text-gray-500">
              {kind === 'comment'
                ? 'Tu comentario fue registrado. El equipo te respondera pronto.'
                : 'Tu solicitud fue recibida. El equipo se pondra en contacto contigo.'}
            </p>
            <button onClick={onClose} className="mt-2 px-5 py-2 bg-[#F98058] text-white rounded-lg text-sm font-medium hover:bg-[#F98058]/90 transition-colors">
              Cerrar
            </button>
          </div>
        ) : (
          <div className="px-5 py-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Nombre *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F98058]/50"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Correo</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tucorreo@ejemplo.com"
                  type="email"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F98058]/50"
                />
              </div>
            </div>
            {kind === 'quote' && (
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Telefono / WhatsApp</label>
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 555 000 0000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F98058]/50"
                />
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">
                {kind === 'comment' ? 'Comentario *' : 'Mensaje o requerimientos adicionales *'}
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder={kind === 'comment' ? 'Escribe tu comentario o solicitud de cambio...' : 'Cuéntanos más sobre tu proyecto, medidas, materiales preferidos...'}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#F98058]/50 resize-none"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={!name.trim() || !message.trim()}
                className="flex-1 py-2.5 rounded-lg bg-[#F98058] text-white text-sm font-medium hover:bg-[#F98058]/90 transition-colors disabled:opacity-50"
              >
                {kind === 'comment' ? 'Enviar comentario' : 'Solicitar cotizacion'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── PDF export simplificado ────────────────────────────────────────────────────

async function downloadPublicPDF(share: ProjectShare, summary: QuoteSummary | null) {
  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const W  = 210
  const M  = 18
  const CW = W - M * 2
  const snapshot = share.snapshot!
  const orange   = '#F98058'

  // Header
  doc.setFillColor(24, 33, 45)
  doc.rect(0, 0, W, 38, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(snapshot.project.name ?? 'Propuesta de proyecto', M, 18)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(180, 180, 180)
  doc.text('Propuesta generada por Alqia Virtual Builder', M, 26)
  doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}`, M, 32)

  let y = 50

  // Datos del proyecto
  doc.setTextColor(30, 30, 30)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text('Datos del proyecto', M, y)
  y += 7

  const rows: [string, string][] = [
    ['Proyecto', snapshot.project.name ?? '—'],
    ['Cliente',  snapshot.project.client_name ?? '—'],
    ['Estado',   snapshot.project.status ?? '—'],
    ['URL publica', share.public_url],
  ]
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  for (const [k, v] of rows) {
    doc.setTextColor(100, 100, 100)
    doc.text(k + ':', M, y)
    doc.setTextColor(30, 30, 30)
    doc.text(doc.splitTextToSize(v, CW - 35), M + 35, y)
    y += 5.5
  }

  y += 6

  // Lista de productos
  if (snapshot.objects.length > 0) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text('Elementos del proyecto', M, y)
    y += 7

    doc.setFillColor(245, 245, 245)
    doc.rect(M, y - 4, CW, 6, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Elemento', M + 2, y)
    doc.text('Cant.', M + CW - 30, y, { align: 'right' })
    y += 5

    doc.setFont('helvetica', 'normal')
    for (const obj of snapshot.objects) {
      const prod = snapshot.products.find((p) => p.id === obj.product_id)
      doc.setTextColor(50, 50, 50)
      doc.text(obj.name ?? prod?.name ?? 'Elemento', M + 2, y)
      doc.text(String(obj.quantity ?? 1), M + CW - 30, y, { align: 'right' })
      y += 5
      if (y > 260) { doc.addPage(); y = 20 }
    }
    y += 6
  }

  // Cotización estimada
  if (summary) {
    doc.setFontSize(11)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(30, 30, 30)
    doc.text('Cotizacion estimada', M, y)
    y += 7

    // Encabezado tabla
    doc.setFillColor(245, 245, 245)
    doc.rect(M, y - 4, CW, 6, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(80, 80, 80)
    doc.text('Producto', M + 2, y)
    doc.text('Cant.', M + CW * 0.6, y, { align: 'right' })
    doc.text('P.Unit', M + CW * 0.8, y, { align: 'right' })
    doc.text('Subtotal', M + CW, y, { align: 'right' })
    y += 5.5

    doc.setFont('helvetica', 'normal')
    for (const item of summary.lineItems) {
      doc.setTextColor(50, 50, 50)
      doc.text(doc.splitTextToSize(item.name, CW * 0.55), M + 2, y)
      doc.text(String(item.qty),                       M + CW * 0.6, y, { align: 'right' })
      doc.text(fmtMXN(item.unit_price),                M + CW * 0.8, y, { align: 'right' })
      doc.text(fmtMXN(item.qty * item.unit_price),     M + CW,       y, { align: 'right' })
      y += 5.5
      if (y > 260) { doc.addPage(); y = 20 }
    }

    // Totales
    y += 2
    doc.setDrawColor(230, 230, 230)
    doc.line(M, y, M + CW, y)
    y += 4

    const totals: [string, string, boolean][] = [
      ['Subtotal',       fmtMXN(summary.subtotal), false],
      ['IVA 16%',        fmtMXN(summary.iva),      false],
      ['TOTAL ESTIMADO', fmtMXN(summary.total),    true],
    ]
    for (const [label, val, bold] of totals) {
      doc.setFont('helvetica', bold ? 'bold' : 'normal')
      doc.setFontSize(bold ? 10 : 8)
      doc.setTextColor(bold ? orange : '505050')
      doc.text(label, M + CW * 0.5, y, { align: 'right' })
      doc.text(val,   M + CW,       y, { align: 'right' })
      y += bold ? 6 : 4.5
    }
    y += 4
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(150, 150, 150)
    doc.text('Precios en MXN. Estimacion referencial sujeta a cotizacion formal con IVA incluido.', M, y)
    y += 8
  }

  // Disclaimer
  const disclaimer = getDisclaimer(share.snapshot?.vertical_key)
  doc.setFillColor(255, 243, 224)
  const disLines = doc.splitTextToSize(disclaimer, CW - 8)
  const disH     = disLines.length * 4.5 + 8
  if (y + disH > 270) { doc.addPage(); y = 20 }
  doc.rect(M, y - 4, CW, disH, 'F')
  doc.setFontSize(7.5)
  doc.setTextColor(140, 80, 0)
  doc.text(disLines, M + 4, y)
  y += disH + 4

  // Footer
  doc.setFontSize(7)
  doc.setTextColor(170, 170, 170)
  doc.text('Generado con Alqia Virtual Builder — alqia.mx', M, 290)
  doc.text(share.public_url, W - M, 290, { align: 'right' })

  doc.save(`${snapshot.project.name ?? 'propuesta'}-${new Date().toISOString().slice(0, 10)}.pdf`)
}

// ── Componente principal ───────────────────────────────────────────────────────

export function ProjectPublicPreview() {
  const { shareToken } = useParams<{ shareToken: string }>()

  const [share,          setShare]          = useState<ProjectShare | null>(null)
  const [loading,        setLoading]        = useState(true)
  const [notFound,       setNotFound]       = useState(false)
  const [modal,          setModal]          = useState<ModalKind | null>(null)
  const [showQuote,      setShowQuote]      = useState(false)
  const [isDownloading,  setIsDownloading]  = useState(false)

  useEffect(() => {
    if (!shareToken) { setNotFound(true); setLoading(false); return }
    const found = shareProjectService.getSharedProject(shareToken)
    if (!found || !found.snapshot) { setNotFound(true) } else { setShare(found) }
    setLoading(false)
  }, [shareToken])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#F98058]/40 border-t-[#F98058] rounded-full animate-spin" />
          <p className="text-gray-500 text-sm">Cargando propuesta...</p>
        </div>
      </div>
    )
  }

  if (notFound || !share?.snapshot) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-sm text-center space-y-4">
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-7 h-7 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">Link no disponible</h1>
          <p className="text-gray-500 text-sm">
            Este link ha vencido, fue revocado o no existe. Contacta a la empresa que te lo compartio para obtener un nuevo acceso.
          </p>
        </div>
      </div>
    )
  }

  const snapshot = share.snapshot
  const summary  = shareProjectService.calcQuoteSummary(snapshot, share.show_prices)

  const handlePDF = async () => {
    setIsDownloading(true)
    try { await downloadPublicPDF(share, summary) }
    finally { setIsDownloading(false) }
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">

      {/* Header */}
      <header className="bg-[#18212D] border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo-alqia-oscuro.png" alt="Alqia" className="h-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            <span className="text-white/40 text-sm hidden sm:block">|</span>
            <span className="text-white/70 text-sm hidden sm:block truncate max-w-xs">{share.title}</span>
          </div>
          <div className="flex items-center gap-1.5">
            {share.allow_comments && (
              <button
                onClick={() => setModal('comment')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] text-sm transition-all"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:block">Comentar</span>
              </button>
            )}
            {share.allow_pdf_download && (
              <button
                onClick={handlePDF}
                disabled={isDownloading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/[0.08] text-sm transition-all disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:block">{isDownloading ? 'Generando...' : 'PDF'}</span>
              </button>
            )}
            {share.allow_quote_request && (
              <button
                onClick={() => setModal('quote')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#F98058] hover:bg-[#F98058]/90 text-white text-sm font-medium transition-all"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Solicitar cotizacion</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Titulo y datos */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{snapshot.project.name}</h1>
          {snapshot.project.client_name && (
            <p className="text-gray-500 text-sm mt-0.5">Para: {snapshot.project.client_name}</p>
          )}
          {share.message && (
            <p className="mt-3 text-gray-600 text-sm bg-white rounded-xl border border-gray-200 px-4 py-3">
              {share.message}
            </p>
          )}
        </div>

        {/* Visualizador 3D */}
        <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm bg-[#111923]" style={{ height: 420 }}>
          <ReadOnlyCanvas snapshot={snapshot} />
        </div>

        {/* Grid de info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <InfoCard label="Espacio" value={`${snapshot.scene.width ?? 0} x ${snapshot.scene.depth ?? 0} cm`} />
          <InfoCard label="Elementos" value={`${snapshot.objects.length} piezas`} />
          <InfoCard label="Estado" value={snapshot.project.status === 'draft' ? 'Borrador' : 'Guardado'} />
        </div>

        {/* Tabla de productos */}
        {snapshot.objects.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Elementos del proyecto</h2>
              <p className="text-xs text-gray-400 mt-0.5">{snapshot.objects.length} elementos colocados</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Elemento</th>
                    <th className="text-center px-4 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide w-20">Cant.</th>
                    {share.show_prices && <th className="text-right px-5 py-2.5 font-medium text-gray-500 text-xs uppercase tracking-wide">Precio ref.</th>}
                  </tr>
                </thead>
                <tbody>
                  {snapshot.objects.map((obj) => {
                    const prod = snapshot.products.find((p) => p.id === obj.product_id)
                    return (
                      <tr key={obj.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                        <td className="px-5 py-2.5">
                          <p className="text-gray-800 font-medium">{obj.name ?? prod?.name ?? 'Elemento'}</p>
                          {prod?.sku && <p className="text-gray-400 text-xs">{prod.sku}</p>}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-600">{obj.quantity ?? 1}</td>
                        {share.show_prices && (
                          <td className="px-5 py-2.5 text-right text-gray-600">
                            {prod?.price ? fmtMXN(prod.price) : '—'}
                          </td>
                        )}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Cotizacion estimada */}
        {summary && summary.lineItems.length > 0 && (
          <section className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <button
              onClick={() => setShowQuote(!showQuote)}
              className="w-full flex items-center justify-between px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <div>
                <h2 className="font-semibold text-gray-800 text-left">Cotizacion estimada</h2>
                <p className="text-xs text-gray-400 mt-0.5 text-left">
                  Total referencial: <span className="text-[#F98058] font-semibold">{fmtMXN(summary.total)}</span>
                </p>
              </div>
              {showQuote ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showQuote && (
              <div className="p-5">
                <QuoteTable summary={summary} />
                {share.allow_quote_request && (
                  <button
                    onClick={() => setModal('quote')}
                    className="mt-4 w-full py-2.5 rounded-xl bg-[#F98058] hover:bg-[#F98058]/90 text-white text-sm font-medium transition-colors"
                  >
                    Solicitar cotizacion formal
                  </button>
                )}
              </div>
            )}
          </section>
        )}

        {/* Disclaimer */}
        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3.5">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
          <p className="text-amber-700 text-xs leading-relaxed">
            {getDisclaimer(snapshot.vertical_key)}
          </p>
        </div>

        {/* Footer */}
        <footer className="text-center py-4 border-t border-gray-200">
          <p className="text-xs text-gray-400">Propuesta generada con Alqia Virtual Builder</p>
          <p className="text-[10px] text-gray-300 mt-1">{share.public_url}</p>
        </footer>
      </main>

      {/* Modales */}
      {modal && (
        <ClientActionModal
          kind={modal}
          share={share}
          onClose={() => setModal(null)}
          onSubmit={() => { /* registrado en service */ }}
        />
      )}
    </div>
  )
}

// ── Helper mini-card ───────────────────────────────────────────────────────────

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 px-4 py-3">
      <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-gray-800 font-semibold mt-0.5">{value}</p>
    </div>
  )
}
