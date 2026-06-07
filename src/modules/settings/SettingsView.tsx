import { useState } from 'react'
import { GlassPanel } from '@/components/glass/GlassPanel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/utils/cn'
import { Code2, Sparkles, Ruler, LayoutTemplate, AlertCircle } from 'lucide-react'

type Tab = 'workspace' | 'branding' | 'embed' | 'lead-form' | 'units' | 'templates' | 'portalia' | 'ai'

const TABS: Array<{ id: Tab; label: string }> = [
  { id: 'workspace', label: 'Workspace' },
  { id: 'branding', label: 'Branding' },
  { id: 'embed', label: 'Embed' },
  { id: 'lead-form', label: 'Formulario de lead' },
  { id: 'units', label: 'Unidades' },
  { id: 'templates', label: 'Plantillas' },
  { id: 'portalia', label: 'Portalia' },
  { id: 'ai', label: 'IA' },
]

const EMBED_CODE = `<iframe
  src="https://builder.alqia.io/embed/TU_WORKSPACE_ID"
  width="100%"
  height="600"
  frameborder="0"
  allow="fullscreen"
  title="Alqia Virtual Builder"
></iframe>`

export function SettingsView() {
  const [activeTab, setActiveTab] = useState<Tab>('workspace')

  return (
    <div className="p-6 space-y-4 max-w-screen-lg mx-auto">
      <h1 className="text-white text-xl font-questrial font-semibold">Configuración</h1>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-white/[0.06] pb-0">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium transition-all relative',
              activeTab === tab.id
                ? 'text-white'
                : 'text-content-secondary hover:text-white'
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-alqia-orange rounded-t-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'workspace' && (
        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-white text-sm font-medium">Información del workspace</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Nombre del workspace" defaultValue="SIA Soluciones Industriales" />
            <Input label="Vertical" defaultValue="SIA — Soluciones de Almacenamiento Industrial" disabled />
            <Input label="Dominio personalizado" placeholder="builder.tu-empresa.com" />
            <Input label="Zona horaria" defaultValue="America/Monterrey" />
          </div>
          <Button variant="primary" size="sm">Guardar cambios</Button>
        </GlassPanel>
      )}

      {activeTab === 'branding' && (
        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-white text-sm font-medium">Personalización visual</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Color primario" defaultValue="#F98058" />
            <Input label="Color de acento" defaultValue="#202D3D" />
            <Input label="Nombre del producto" defaultValue="Configurador de Espacios SIA" />
          </div>
          <p className="text-content-muted text-xs">
            El logotipo y assets visuales avanzados se configuran en Fase 1 con almacenamiento en Supabase Storage.
          </p>
          <Button variant="primary" size="sm">Guardar branding</Button>
        </GlassPanel>
      )}

      {activeTab === 'embed' && (
        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-white text-sm font-medium">Código de integración</h2>
          <p className="text-content-secondary text-xs">
            Integra el Virtual Builder en tu sitio web con este snippet. El cliente configurará desde tu dominio sin salir de él.
          </p>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Code2 className="w-3.5 h-3.5 text-alqia-orange" />
              <span className="text-content-secondary text-xs">iframe embed</span>
            </div>
            <pre className="bg-bg-ultra border border-white/[0.08] rounded-lg p-4 text-xs text-content-secondary overflow-x-auto whitespace-pre-wrap">
              {EMBED_CODE}
            </pre>
          </div>
          <p className="text-content-muted text-xs">
            La URL de embed con autenticación y dominio propio estará disponible en Fase 2 (configuración pública del builder).
          </p>
        </GlassPanel>
      )}

      {activeTab === 'portalia' && (
        <GlassPanel className="p-6 space-y-4">
          <h2 className="text-white text-sm font-medium">Integración con Portalia Revenue OS</h2>
          <div className="p-4 border border-alqia-orange/20 bg-alqia-orange/5 rounded-xl">
            <p className="text-alqia-orange text-sm font-medium mb-1">Disponible en Fase 3</p>
            <p className="text-content-secondary text-xs leading-relaxed">
              La integración bidireccional con Portalia Revenue OS se activa en Fase 3. Cuando esté
              disponible, cada solicitud de cotización creará automáticamente un contacto y una
              oportunidad en tu CRM Portalia con todos los datos del proyecto configurado.
            </p>
          </div>
          <div className="space-y-3 opacity-50 pointer-events-none">
            <Input label="API Key de Portalia" placeholder="pk_live_..." disabled />
            <Input label="Workspace ID en Portalia" placeholder="ws_..." disabled />
            <Input label="Pipeline de destino" placeholder="Configurador Virtual" disabled />
          </div>
        </GlassPanel>
      )}

      {activeTab === 'lead-form' && (
        <GlassPanel className="p-6 space-y-5">
          <h2 className="text-white text-sm font-medium">Configuración del formulario de lead</h2>
          <p className="text-content-secondary text-xs">
            Controla qué campos se muestran en el modal de solicitud de cotización y cuáles son obligatorios.
          </p>
          <div className="space-y-3">
            {[
              { label: 'Nombre completo', required: true },
              { label: 'Correo electrónico', required: true },
              { label: 'Teléfono', required: false },
              { label: 'Empresa', required: false },
              { label: 'Ciudad / Ubicación', required: false },
              { label: 'Mensaje / Descripción', required: false },
              { label: 'Consentimiento de comunicación', required: true },
            ].map(({ label, required }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.04]">
                <div>
                  <p className="text-white text-xs">{label}</p>
                  {required && <span className="text-status-danger text-[10px]">Obligatorio</span>}
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-4 rounded-full bg-alqia-orange/60 relative cursor-pointer flex-shrink-0">
                    <div className="w-3.5 h-3.5 rounded-full bg-white absolute right-0.5 top-0.5 shadow" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-content-muted text-xs">
            La configuracion dinámica del formulario por workspace estará disponible en Fase 1.
          </p>
        </GlassPanel>
      )}

      {activeTab === 'units' && (
        <GlassPanel className="p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-alqia-orange" />
            <h2 className="text-white text-sm font-medium">Sistema de unidades</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-content-secondary text-xs mb-1.5 block">Sistema de medición</label>
              <select className="w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-1 focus:ring-alqia-orange/40">
                <option value="metric">Métrico (metros, kg)</option>
                <option value="imperial">Imperial (pies, lb)</option>
              </select>
            </div>
            <div>
              <label className="text-content-secondary text-xs mb-1.5 block">Moneda</label>
              <select className="w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-1 focus:ring-alqia-orange/40">
                <option value="USD">USD — Dólar americano</option>
                <option value="MXN">MXN — Peso mexicano</option>
                <option value="EUR">EUR — Euro</option>
                <option value="COP">COP — Peso colombiano</option>
              </select>
            </div>
            <div>
              <label className="text-content-secondary text-xs mb-1.5 block">Formato de fecha</label>
              <select className="w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-1 focus:ring-alqia-orange/40">
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="text-content-secondary text-xs mb-1.5 block">Zona horaria</label>
              <select className="w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-white text-sm focus:outline-none focus:ring-1 focus:ring-alqia-orange/40">
                <option>America/Monterrey (UTC-6)</option>
                <option>America/Mexico_City (UTC-6)</option>
                <option>America/Bogota (UTC-5)</option>
                <option>America/New_York (UTC-5)</option>
              </select>
            </div>
          </div>
          <Button variant="primary" size="sm">Guardar preferencias</Button>
        </GlassPanel>
      )}

      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <LayoutTemplate className="w-4 h-4 text-alqia-orange" />
            <h2 className="text-white text-sm font-medium">Plantillas de inicio rápido</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Almacén estándar 10x20m', vertical: 'Almacenamiento industrial', active: true },
              { name: 'Taller con mezzanine', vertical: 'Almacenamiento industrial', active: true },
              { name: 'Showroom retail', vertical: 'Retail', active: false },
              { name: 'Espacio médico tipo A', vertical: 'Salud', active: false },
            ].map(({ name, vertical, active }) => (
              <GlassPanel key={name} className="p-4 space-y-2">
                <div className="h-16 bg-gradient-to-br from-alqia-blue/40 to-bg-ultra rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="w-6 h-6 text-white/20" />
                </div>
                <div>
                  <p className="text-white text-xs font-medium">{name}</p>
                  <p className="text-content-muted text-[10px]">{vertical}</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={cn('text-[10px]', active ? 'text-status-success' : 'text-content-muted')}>
                    {active ? 'Disponible' : 'Pronto'}
                  </span>
                  {active && (
                    <button className="text-alqia-orange text-[10px] hover:underline">Usar plantilla</button>
                  )}
                </div>
              </GlassPanel>
            ))}
          </div>
          <p className="text-content-muted text-xs">La gestión completa de plantillas personalizadas estará disponible en Fase 1.</p>
        </div>
      )}

      {activeTab === 'ai' && (
        <GlassPanel className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-alqia-orange" />
            <h2 className="text-white text-sm font-medium">Asistente IA del builder</h2>
          </div>
          <div className="p-4 border border-white/[0.08] bg-white/[0.03] rounded-xl">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-status-info mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white text-xs font-medium">Disponible en Fase 4</p>
                <p className="text-content-secondary text-xs leading-relaxed mt-1">
                  El asistente IA analiza la configuración del espacio en tiempo real y genera
                  sugerencias comerciales contextuales: productos complementarios, alertas de
                  layout ineficiente, resumen automático del proyecto y propuesta de texto para cotizacion.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-3 opacity-40 pointer-events-none">
            <div>
              <label className="text-content-secondary text-xs mb-1.5 block">Modelo IA</label>
              <select disabled className="w-full px-3 py-1.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-content-muted text-sm">
                <option>GPT-4o (recomendado)</option>
                <option>Claude 3.5 Sonnet</option>
                <option>Modelo propio (via API)</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-xs">Sugerencias en tiempo real</p>
                <p className="text-content-muted text-[10px]">Analiza layout mientras el usuario configura</p>
              </div>
              <div className="w-8 h-4 rounded-full bg-white/10 relative flex-shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-white/30 absolute left-0.5 top-0.5 shadow" />
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-white text-xs">Resumen automatico al solicitar cotizacion</p>
                <p className="text-content-muted text-[10px]">Genera texto profesional del proyecto</p>
              </div>
              <div className="w-8 h-4 rounded-full bg-white/10 relative flex-shrink-0">
                <div className="w-3.5 h-3.5 rounded-full bg-white/30 absolute left-0.5 top-0.5 shadow" />
              </div>
            </div>
          </div>
        </GlassPanel>
      )}
    </div>
  )
}
