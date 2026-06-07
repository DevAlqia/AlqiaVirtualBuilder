import jsPDF from 'jspdf'
import type { BuilderProject, ProjectObject, Scene } from '@/types'

const DISCLAIMER =
  'Configuración preliminar sujeta a validación técnica y cotización final.'

interface ExportPDFOptions {
  project: BuilderProject
  objects: ProjectObject[]
  scene: Scene | null
  canvasElement?: HTMLCanvasElement | null
}

function formatDim(w: number, d: number, h: number) {
  return `${w}m × ${d}m × ${h}m`
}

export async function exportProjectPDF({ project, objects, scene, canvasElement }: ExportPDFOptions): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  const marginL = 16
  const marginR = 16
  const contentW = pageW - marginL - marginR
  let y = 20

  // ─── Cabecera ────────────────────────────────────────────────────────────
  doc.setFillColor(32, 45, 61) // alqia-blue
  doc.rect(0, 0, pageW, 14, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('ALQIA VIRTUAL BUILDER', marginL, 9.5)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text('Configuración de espacio industrial', pageW - marginR, 9.5, { align: 'right' })

  y = 22

  // ─── Título del proyecto ──────────────────────────────────────────────────
  doc.setTextColor(32, 45, 61)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(project.name ?? 'Proyecto sin nombre', marginL, y)
  y += 7

  // ─── Datos del cliente ────────────────────────────────────────────────────
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(113, 128, 150) // text-muted
  const dateStr = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })
  const infoLines: string[] = [`Fecha: ${dateStr}`, `Proyecto: ${project.project_number}`]
  if (project.client_name) infoLines.push(`Cliente: ${project.client_name}`)
  if (project.client_company) infoLines.push(`Empresa: ${project.client_company}`)
  if (project.client_city) infoLines.push(`Ciudad: ${project.client_city}`)
  infoLines.forEach((line) => {
    doc.text(line, marginL, y)
    y += 4.5
  })
  y += 3

  // ─── Datos de la escena ───────────────────────────────────────────────────
  if (scene) {
    doc.setFillColor(245, 247, 250)
    doc.roundedRect(marginL, y, contentW, 14, 2, 2, 'F')
    doc.setFontSize(8)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(32, 45, 61)
    doc.text('Escena configurada', marginL + 4, y + 5)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(113, 128, 150)
    doc.text(`${scene.name}  ·  ${formatDim(scene.width, scene.depth, scene.height)}  ·  ${scene.scene_type}`, marginL + 4, y + 10)
    y += 19
  }

  // ─── Canvas capturado ─────────────────────────────────────────────────────
  if (canvasElement) {
    try {
      // Dar un frame para que WebGL haya renderizado con preserveDrawingBuffer=true
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      const imgData = canvasElement.toDataURL('image/jpeg', 0.85)
      const imgH = (contentW * canvasElement.height) / canvasElement.width
      const maxImgH = 65
      const finalH = Math.min(imgH, maxImgH)
      const finalW = (finalH * canvasElement.width) / canvasElement.height
      const imgX = marginL + (contentW - finalW) / 2
      doc.setDrawColor(200, 210, 220)
      doc.roundedRect(imgX - 1, y - 1, finalW + 2, finalH + 2, 2, 2)
      doc.addImage(imgData, 'JPEG', imgX, y, finalW, finalH)
      y += finalH + 6
    } catch {
      // Si falla la captura, continúa sin imagen
    }
  }

  // ─── Resumen de productos ─────────────────────────────────────────────────
  const quotableObjects = objects.filter((o) => !(o.metadata?.is_scene_prop))
  const propObjects     = objects.filter((o) => o.metadata?.is_scene_prop)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(32, 45, 61)
  doc.text('Productos configurados', marginL, y)
  y += 5

  if (quotableObjects.length === 0) {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(113, 128, 150)
    doc.text('Sin productos cotizables en el espacio.', marginL, y)
    y += 8
  } else {
    // Cabecera de tabla
    doc.setFillColor(32, 45, 61)
    doc.rect(marginL, y, contentW, 6, 'F')
    doc.setFontSize(7.5)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(255, 255, 255)
    doc.text('Producto', marginL + 3, y + 4.2)
    doc.text('SKU', marginL + 90, y + 4.2)
    doc.text('Medidas (An×Pr×Al)', marginL + 120, y + 4.2)
    doc.text('Cant.', marginL + 164, y + 4.2)
    y += 6

    // Filas
    doc.setFont('helvetica', 'normal')
    quotableObjects.forEach((obj, i) => {
      const rowBg = i % 2 === 0 ? [248, 250, 252] : [255, 255, 255]
      doc.setFillColor(rowBg[0], rowBg[1], rowBg[2])
      doc.rect(marginL, y, contentW, 6, 'F')
      doc.setTextColor(32, 45, 61)
      doc.setFontSize(7.5)
      const nameText = obj.name.length > 38 ? obj.name.slice(0, 35) + '...' : obj.name
      doc.text(nameText, marginL + 3, y + 4)
      doc.text(String(obj.metadata?.sku ?? '—'), marginL + 90, y + 4)
      const w = (obj.configuration?.width as number) ?? 0
      const h = (obj.configuration?.height as number) ?? 0
      const d = (obj.configuration?.depth as number) ?? 0
      doc.text(formatDim(w, d, h), marginL + 120, y + 4)
      doc.text(String(obj.quantity), marginL + 170, y + 4)
      y += 6
      if (y > 265) {
        doc.addPage()
        y = 20
      }
    })
    y += 4
  }
  // ─── Props decorativos (si hay) ───────────────────────────────────────────────
  if (propObjects.length > 0) {
    if (y > 250) { doc.addPage(); y = 20 }
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(32, 45, 61)
    doc.text('Elementos decorativos / ambiente', marginL, y)
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(113, 128, 150)
    const propNames = propObjects.map((o) => o.name).join(', ')
    const propLines = doc.splitTextToSize(propNames, contentW)
    doc.text(propLines, marginL, y)
    y += propLines.length * 4.5 + 4
  }
  // ─── Resumen IA ──────────────────────────────────────────────────────────
  if (project.ai_summary) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(32, 45, 61)
    doc.text('Notas del configurador', marginL, y)
    y += 5
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(113, 128, 150)
    const summaryLines = doc.splitTextToSize(project.ai_summary, contentW)
    doc.text(summaryLines, marginL, y)
    y += summaryLines.length * 4 + 4
  }

  // ─── Disclaimer legal — OBLIGATORIO ──────────────────────────────────────
  const disclaimerY = Math.max(y + 6, 255)
  doc.setFillColor(249, 128, 88, 0.12) // alqia-orange bg
  doc.setDrawColor(249, 128, 88)
  doc.setLineWidth(0.4)
  doc.roundedRect(marginL, disclaimerY, contentW, 10, 2, 2, 'FD')
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bolditalic')
  doc.setTextColor(200, 90, 30)
  doc.text(DISCLAIMER, marginL + contentW / 2, disclaimerY + 6.5, { align: 'center' })

  // ─── Pie de página ────────────────────────────────────────────────────────
  doc.setFillColor(32, 45, 61)
  doc.rect(0, 286, pageW, 11, 'F')
  doc.setFontSize(7)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(167, 179, 194)
  doc.text('Alqia Virtual Builder  ·  alqia.io', marginL, 293)
  doc.text(`${dateStr}`, pageW - marginR, 293, { align: 'right' })

  // ─── Guardar ─────────────────────────────────────────────────────────────
  const filename = `alqia-builder-${(project.project_number ?? project.id).toLowerCase().replace(/\s+/g, '-')}.pdf`
  doc.save(filename)
}
