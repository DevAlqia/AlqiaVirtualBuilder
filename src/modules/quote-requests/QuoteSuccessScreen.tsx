import { CheckCircle, FileText, ArrowLeft } from 'lucide-react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { useBuilderStore } from '@/store/builderStore'
import { exportProjectPDF } from '@/services/exports/exportService'
import { useToast } from '@/components/ui/Toast'
import type { QuoteRequest, BuilderProject } from '@/types'
import { useState } from 'react'

interface QuoteSuccessScreenProps {
  quote: QuoteRequest
  project: BuilderProject | null
  onClose: () => void
}

export function QuoteSuccessScreen({ quote, project, onClose }: QuoteSuccessScreenProps) {
  const { projectObjects, sceneConfig } = useBuilderStore()
  const { showToast } = useToast()
  const [exporting, setExporting] = useState(false)

  const handleExportPDF = async () => {
    if (!project) return
    setExporting(true)
    try {
      // Intentar capturar el canvas 3D si está disponible
      const canvas = document.querySelector('canvas') as HTMLCanvasElement | null
      await exportProjectPDF({
        project,
        objects: projectObjects,
        scene: sceneConfig,
        canvasElement: canvas,
      })
      showToast('PDF generado correctamente', 'success')
    } catch (err) {
      console.error('[Export PDF]', err)
      showToast('Error al generar el PDF', 'error')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="p-8 flex flex-col items-center text-center space-y-6">
      {/* Icono de éxito */}
      <div className="w-16 h-16 rounded-full bg-status-success/10 border border-status-success/20 flex items-center justify-center">
        <CheckCircle className="w-8 h-8 text-status-success" />
      </div>

      {/* Mensaje principal */}
      <div className="space-y-2">
        <h2 className="text-white text-xl font-questrial font-semibold">
          Solicitud enviada con éxito
        </h2>
        <p className="text-content-secondary text-sm max-w-sm leading-relaxed">
          Tu solicitud de cotización fue registrada. Un asesor de SIA se pondrá en contacto contigo
          a la brevedad.
        </p>
      </div>

      {/* Datos de confirmación */}
      <GlassPanel className="p-4 w-full max-w-sm text-left space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-content-secondary text-xs">Folio</span>
          <span className="text-white text-xs font-medium">{quote.id.slice(0, 8).toUpperCase()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-content-secondary text-xs">Cliente</span>
          <span className="text-white text-xs">{quote.client_name}</span>
        </div>
        {quote.client_email && (
          <div className="flex items-center justify-between">
            <span className="text-content-secondary text-xs">Correo</span>
            <span className="text-white text-xs">{quote.client_email}</span>
          </div>
        )}
        {project && (
          <div className="flex items-center justify-between">
            <span className="text-content-secondary text-xs">Proyecto</span>
            <span className="text-white text-xs">{project.project_number}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <span className="text-content-secondary text-xs">Productos</span>
          <span className="text-white text-xs">{projectObjects.length} objeto{projectObjects.length !== 1 ? 's' : ''}</span>
        </div>
      </GlassPanel>

      {/* Disclaimer legal */}
      <div className="w-full max-w-sm px-3 py-2.5 rounded-lg border border-alqia-orange/20 bg-alqia-orange/5">
        <p className="text-alqia-orange text-xs italic">
          Configuración preliminar sujeta a validación técnica y cotización final.
        </p>
      </div>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <Button
          variant="primary"
          size="md"
          className="flex-1"
          icon={<FileText className="w-4 h-4" />}
          loading={exporting}
          onClick={handleExportPDF}
        >
          Descargar PDF
        </Button>
        <Button
          variant="secondary"
          size="md"
          className="flex-1"
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onClose}
        >
          Volver al builder
        </Button>
      </div>
    </div>
  )
}
